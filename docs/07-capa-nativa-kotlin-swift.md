# 07 - CAPA NATIVA: KOTLIN Y SWIFT A FONDO

> **Documento de aprendizaje, crece con cada fase del Bloque B** (`docs/04-roadmap-y-fases.md`,
> FASES 5–11). El objetivo: poder trabajar cómodamente tanto en Android/Kotlin como en
> iOS/Swift, entendiendo qué hace cada pieza y no solo "cómo se instala un paquete".

---

## 0. Por qué este documento existe

En React Native es fácil quedarse solo en la capa JS y tratar lo nativo como una caja negra
(`npx expo install algo-nativo` y listo). Este proyecto hace lo contrario a propósito: cada
funcionalidad sensible de Índigo (biometría, almacenamiento seguro, la vista de la tarjeta) se
implementa **dos veces, a mano** — Kotlin real con su propio `build.gradle`, y Swift real con su
propio `.podspec` — para entender de verdad las dos plataformas.

Sin Mac local, la validación de Swift ocurre en CI (`macos-latest`, ver
`docs/02-guia-deploy-y-ci.md`) — el código se escribe y razona aquí, se compila y testea allá.

---

## 1. La New Architecture, en una página

React Native tuvo históricamente un **bridge**: un puente asíncrono que serializaba mensajes JSON
entre JS y el lado nativo. Ya no existe — se eliminó por completo en **React Native 0.82**, y
desde ahí todo proyecto nuevo es *bridgeless* por defecto (Expo SDK 55 quitó incluso la opción de
desactivar la New Architecture). Índigo corre sobre RN 0.86, ya sin bridge.

Lo que hay ahora:

| Pieza | Qué hace |
|---|---|
| **JSI** (JavaScript Interface) | Permite que el JS mantenga referencias directas a objetos C++/nativos y los invoque de forma **síncrona**, sin serializar JSON por un puente. Es la base de todo lo demás. |
| **TurboModules** | Módulos nativos (funciones invocables desde JS) con carga perezosa (lazy) y tipado generado, en vez de módulos "legacy" cargados todos al arrancar. |
| **Fabric** | El renderer nuevo: construye el árbol de vistas nativas de forma más directa y permite vistas nativas (`Fabric components`) también generadas por Codegen. |
| **Codegen** | Toma una **spec en TypeScript** (con tipos restringidos) y genera el código de interoperabilidad nativo (interfaces Kotlin, protocolos Swift/ObjC++) automáticamente. Menos código escrito a mano, más seguridad de tipos entre JS y nativo. |

Dos caminos para escribir código nativo hoy:

1. **Expo Modules API** (lo que usamos en las FASES 6–8): un DSL en Kotlin/Swift que **envuelve**
   TurboModules/Fabric con mucha menos ceremonia. Es la vía recomendada para módulos de una sola
   app (`npx create-expo-module@latest --local`).
2. **TurboModule "bare"** (FASE 9): se escribe la spec TS, se corre Codegen, y se implementa la
   interfaz generada a mano en Kotlin y Swift/ObjC++. Más verboso, pero es el camino sin Expo —
   el que se pregunta en entrevistas de RN "puro".

---

## 2. Anatomía del proyecto Android generado (`expo prebuild -p android`)

Árbol real generado por `npx expo prebuild --clean` en este proyecto (recortado):

```
android/
├── build.gradle              # raíz: repos (google(), mavenCentral()), classpaths (AGP, RN, Kotlin)
├── settings.gradle            # declara :app + cada módulo autoenlazado de modules/*/android
├── gradle.properties          # newArchEnabled, hermesEnabled, reactNativeArchitectures, ...
├── gradle/wrapper/            # gradle-wrapper.properties → distributionUrl (Gradle 9.3.1 aquí)
└── app/
    ├── build.gradle            # applicationId, minSdk/targetSdk/compileSdk, signingConfigs, R8
    ├── debug.keystore          # keystore de debug autogenerado (NO es el de producción)
    ├── proguard-rules.pro      # reglas extra para R8 en builds release
    └── src/main/
        ├── AndroidManifest.xml
        ├── java/dev/daniell/indigo/MainActivity.kt
        ├── java/dev/daniell/indigo/MainApplication.kt
        └── res/                # iconos adaptativos, splash, colores, strings.xml
```

- `android/build.gradle` (raíz) vs `android/app/build.gradle` — el primero define repositorios
  (`google()`, `mavenCentral()`, JitPack) y las versiones de los plugins de Gradle (Android Gradle
  Plugin, el plugin de React Native, Kotlin); el segundo es la configuración real del módulo
  `app` — `applicationId`, `minSdkVersion`/`targetSdkVersion`/`compileSdk` (inyectados desde
  `rootProject.ext`, definidos por el plugin de Expo/RN según la versión del SDK), y el bloque
  `react { ... }` que le dice al **React Native Gradle Plugin** dónde está el entry file, dónde
  Hermes, y qué comando de bundling usar (`cliFile`/`bundleCommand`, para que use Expo CLI y no
  React Native CLI a secas).
- `AndroidManifest.xml` — permisos (`INTERNET`, `VIBRATE`, y los que añade `withIndigo.ts`:
  `CAMERA`, `USE_BIOMETRIC`), el `<application>` con `MainApplication` como `android:name`, y el
  `<activity>` de `MainActivity` con sus `intent-filter` (el launcher + el deep link `indigo://`
  del `scheme` de `app.json`).
- `MainActivity.kt` — extiende `ReactActivity`; registra el splash screen de Expo antes de
  `onCreate`, y expone `getMainComponentName()` (el nombre del componente raíz registrado desde
  JS) y `createReactActivityDelegate()` (activa Fabric vía `fabricEnabled`, la New Architecture).
- `MainApplication.kt` — extiende `Application` e implementa `ReactApplication`; el `reactHost`
  es donde arranca todo el runtime de RN (`loadReactNative(this)`) y donde se registra la
  `PackageList` — el sitio donde un módulo autoenlazado de `modules/*/android` termina cargado si
  el autolinking no lo detecta solo.
- **Hermes** — el motor JS que ejecuta el bundle (reemplazó a JSC como default); el `build.gradle`
  del módulo `app` decide entre `com.facebook.react:hermes-android` o el flavor JSC según
  `hermesEnabled` en `gradle.properties`.
- **R8** — el minificador/ofuscador de `release`, activado con `android.enableMinifyInReleaseBuilds`
  y las reglas de `proguard-rules.pro`.

### ⚠️ Verificación local de Gradle en este entorno remoto — limitación real descubierta

`docs/02-guia-deploy-y-ci.md` asumía que `./gradlew assembleDebug` corre 100% local aquí. En la
práctica, en esta sesión (contenedor remoto de Claude Code on the web) se encontraron **dos
bloqueos reales**, en este orden:

1. **Sin JDK 17.** Este entorno solo traía JDK 21 preinstalado, pero el `gradle-plugin` interno
   del React Native Gradle Plugin pide como *toolchain* JDK 17 exacto, y el auto-aprovisionamiento
   (resolver `foojay`) intenta descargar uno y el proxy de salida lo bloquea (`403`). **Se
   solucionó** instalando el JDK 17 vía `apt`: `sudo apt-get install -y openjdk-17-jdk-headless`
   (sí estaba disponible en el mirror de Ubuntu permitido).
2. **`dl.google.com` bloqueado — sin solución local.** Con JDK 17 puesto, Gradle avanza y falla al
   resolver las dependencias declaradas por `google()` (Android Gradle Plugin, AndroidX, ...):
   `Could not GET 'https://dl.google.com/dl/android/maven2/...'. Received status code 403 from
   server: Forbidden`. El proxy de salida de este entorno no tiene `dl.google.com` en la lista
   permitida (a diferencia de `services.gradle.org`, que sí funciona — por eso el propio
   `gradlew` sí se descarga solo). No hay forma de instalar el SDK/las dependencias de Google
   Maven en este contenedor concreto.

**Conclusión práctica:** en este entorno remoto, `./gradlew assembleDebug`/`test` no se pueden
verificar de punta a punta localmente — se puede confirmar que el proyecto Gradle *se genera*
bien y que `gradlew --version` arranca, pero no compilar. La verificación real de Android queda
para `.github/workflows/android.yml` (FASE 11) sobre `ubuntu-latest`, que sí trae el SDK
preinstalado y acceso completo a Google Maven. Si se trabaja este repo desde una máquina con
Android SDK instalado (Android Studio, o `sdkmanager` con red normal), sí corre local sin este
problema — es una restricción de *este* contenedor, no del proyecto.

## 3. Anatomía del proyecto iOS generado (`expo prebuild -p ios`)

`expo prebuild` genera el proyecto Xcode sin necesitar Xcode ni macOS (solo lo necesitás para
compilarlo con `xcodebuild`/`pod install`, ver `docs/02`). Árbol real generado aquí:

```
ios/
├── Podfile                    # CocoaPods: cada módulo de modules/*/ios trae su .podspec
├── Podfile.properties.json    # flags de New Architecture / Hermes para CocoaPods
├── ndigo.xcodeproj/            # proyecto Xcode (nombre derivado del app name, ver nota abajo)
└── ndigo/
    ├── AppDelegate.swift
    ├── Info.plist
    ├── SplashScreen.storyboard
    ├── ndigo.entitlements
    ├── ndigo-Bridging-Header.h  # puente Swift ↔ Objective-C (necesario para libs en ObjC++)
    └── Supporting/Expo.plist
```

- `AppDelegate.swift` — punto de entrada nativo, hereda de `ExpoAppDelegate`. Crea un
  `ExpoReactNativeFactory` y arranca RN con `factory.startReactNative(withModuleName: "main", ...)`
  — el mismo nombre de componente raíz (`"main"`) que `MainActivity.getMainComponentName()` en
  Android. `ReactNativeDelegate` es el punto de extensión donde los config plugins pueden inyectar
  código (comentario `// Extension point for config-plugins` en el propio template).
- `Info.plist` — permisos (`NSFaceIDUsageDescription`, `NSCameraUsageDescription`, añadidos aquí
  por `withIndigo.ts`), `CFBundleDisplayName` (el nombre visible, "Índigo" completo, con tilde),
  `CFBundleURLSchemes` (deep link `indigo://`), orientaciones soportadas.
- `Podfile` / CocoaPods — gestor de dependencias nativas de iOS; cada módulo de `modules/*/ios`
  trae su `.podspec` y se auto-enlaza vía `use_expo_modules!`.
- `.xcodeproj`/`.xcworkspace` — usados por `xcodebuild` en CI (`docs/02`, FASE 11).

**Gotcha real encontrado:** el nombre del proyecto Xcode generado es `ndigo`, no `indigo` ni
`Índigo` — Expo deriva el nombre del target/proyecto del campo `name` de `app.json` ("Índigo") y
al sanear caracteres no-ASCII **elimina la "Í" en vez de normalizarla a "I"**. El
`CFBundleDisplayName` (lo que ve el usuario) sí queda correcto ("Índigo", con tilde) — el nombre
raro solo afecta al nombre interno del proyecto/carpeta Xcode, cosmético para quien navegue
`ios/` a mano. No se corrigió en esta fase (fuera de alcance de FASE 5); si molesta en la FASE 11
al configurar `xcodebuild -scheme`, ese es el nombre de esquema a usar.

---

## 4. Módulos nativos propios de Índigo

| Módulo | Qué enseña | Kotlin | Swift |
|---|---|---|---|
| `indigo-biometrics` (FASE 6) | Expo Modules API, `Promise`/async nativo | `androidx.biometric.BiometricPrompt` + corrutinas | `LocalAuthentication`/`LAContext` |
| `indigo-secure-store` (FASE 7) | Almacenamiento cifrado nativo | Keystore + `EncryptedSharedPreferences` (AES-256-GCM) | Keychain (`SecItemAdd`/`SecItemCopyMatching`) |
| `indigo-card-view` (FASE 8) | Vistas nativas bajo Fabric, props y eventos | Jetpack Compose (`ExpoView`) | SwiftUI (`ExpoView`) |
| `indigo-device` (FASE 9) | TurboModule "bare" con Codegen, sin Expo Modules API | `NativeIndigoDeviceSpec` generado | Swift/ObjC++ generado |
| *(sensor/conectividad, FASE 10)* | Concurrencia nativa expuesta como eventos | Coroutines + `Flow` → eventos JS | `AsyncStream`/Combine → eventos JS |

Cada fila se documenta aquí con: el problema que resuelve, el código Kotlin comentado, el código
Swift equivalente comentado, cómo se prueba (JUnit/XCTest), y cómo se consume desde
`core/services/` en TypeScript.

### 4.1 `indigo-biometrics` (FASE 6) — el primer módulo nativo real

Primer módulo con Expo Modules API. Estructura (`modules/indigo-biometrics/`):

```
modules/indigo-biometrics/
├── expo-module.config.json     # qué clase Kotlin/Swift registra cada plataforma
├── android/
│   ├── build.gradle              # dependencia androidx.biometric
│   └── src/
│       ├── main/java/dev/daniell/indigo/modules/biometrics/IndigoBiometricsModule.kt
│       └── test/java/.../IndigoBiometricsModuleTest.kt   # JUnit
├── ios/
│   ├── IndigoBiometrics.podspec
│   ├── IndigoBiometricsModule.swift
│   └── Tests/IndigoBiometricsModuleTests.swift            # XCTest
└── src/
    ├── IndigoBiometrics.ts        # entry point nativo (requireNativeModule)
    ├── IndigoBiometrics.web.ts    # stub "no disponible" para la plataforma web
    └── IndigoBiometrics.types.ts
```

**API expuesta:** `isAvailable(): Promise<{ available; biometryType }>` y
`authenticate(reason): Promise<{ success; error? }>` — `authenticate` **resuelve** con
`success: false` en vez de rechazar la promesa (igual que `expo-local-authentication`): un
fallo biométrico es un resultado esperado del dominio, no una excepción.

**Kotlin** (`IndigoBiometricsModule.kt`) — `BiometricManager.canAuthenticate(BIOMETRIC_STRONG)`
para `isAvailable`; para `authenticate`, `BiometricPrompt` es una API basada en callbacks
(`AuthenticationCallback`), así que se envuelve en `suspendCancellableCoroutine` para exponerla
como una función `suspend`. La sintaxis idiomática de Expo Modules Kotlin para esto es
`AsyncFunction("authenticate") Coroutine { reason -> ... }` (el infix `Coroutine` viene de
`expo.modules.kotlin.functions.AsyncFunctionBuilder`, ver
`node_modules/expo-modules-core/android/.../AsyncFunctionBuilder.kt`) — sin él, `AsyncFunction`
solo acepta closures no-`suspend`. `continuation.invokeOnCancellation { prompt.cancelAuthentication() }`
cierra el prompt si la promesa de JS se cancela.

**Swift** (`IndigoBiometricsModule.swift`) — `LAContext.canEvaluatePolicy(...)` para
`isAvailable` (además expone `biometryType`: `.faceID`/`.touchID`, algo que Android no puede
distinguir por API pública — de ahí que el tipo `BiometryType` en TS tenga `'biometric'`
genérico para Android y `'faceId'`/`'touchId'` específicos para iOS). `LAContext.evaluatePolicy`
es *callback-based*, no tiene variante `async` nativa de Apple, así que se envuelve en
`withCheckedContinuation` — el equivalente Swift exacto de `suspendCancellableCoroutine` en
Kotlin. La función de `AsyncFunction` en sí se declara `async` gracias al overload de
`ConcurrentFunctionFactories.swift` (`(A0, repeat each A) async throws -> R`).

**Records (DTOs nativos):** ambos lados devuelven un objeto tipado en vez de un mapa suelto —
`class BiometricsAvailability(...) : Record` en Kotlin (con `@Field`), `struct
BiometricsAvailability: Record` en Swift (con la property wrapper `@Field`). Expo serializa
estos records a objetos JS automáticamente por reflexión sobre los campos anotados.

**Tests:** `mapBiometricErrorCode`/`mapBiometricErrorCode(_:)` se extrajeron como función de
paquete (Kotlin) / función libre (Swift) — no un método privado — específicamente para poder
testear el mapeo de códigos de error sin necesitar mockear `FragmentActivity`/`LAContext`.
JUnit corre en CI (`android.yml`, FASE 11; no hay Android SDK local, ver sección 2). XCTest
igual (`ios.yml`, FASE 11; no hay Mac local).

**Consumo:** `core/services/biometrics.service.ts` — facade de una línea por método sobre
`IndigoBiometrics` (alias `@modules/*` → `./modules/*`, añadido en `tsconfig.json` y
`babel.config.js` en esta fase). `ProfileScreen` lo usa de verdad: el toggle "Seguridad y
biometría" llama a `isAvailable()` al montar (para mostrar "Face ID"/"Touch ID"/"Biometría"/"No
disponible") y a `authenticate(reason)` al activarlo, sin quedar como código muerto.

**Jest:** el módulo nativo no existe en el entorno de test (Jest no compila Kotlin/Swift). Se
mockea globalmente en `jest.setup.js` con el mismo stub "no disponible" que usa la plataforma
web — mismo patrón que ya existía para `@react-native-async-storage/async-storage`.

**Verificación sin Android SDK/Mac:** `npx expo-modules-autolinking resolve --platform android
--json` / `--platform ios --json` confirman que el módulo se detecte y resuelva correctamente
(nombre de paquete, clase Kotlin totalmente calificada, nombre del pod/módulo Swift) sin
necesitar compilar — es la forma de verificar el autolinking en este entorno.

### 4.2 `indigo-secure-store` (FASE 7) — reemplaza AsyncStorage para el token de sesión

Segundo módulo nativo. A diferencia de `indigo-biometrics`, este **sustituye una
implementación que ya existía** (`AsyncStorageService` desde la FASE 2) detrás de la misma
interfaz `StorageService` (`core/services/storage.service.ts`) — el caso de libro de Strategy +
DIP: `AuthService` no cambió ni una línea.

```
modules/indigo-secure-store/
├── expo-module.config.json
├── android/
│   ├── build.gradle                # dependencia androidx.security:security-crypto
│   └── src/
│       ├── main/java/.../IndigoSecureStoreModule.kt
│       └── test/java/.../IndigoSecureStoreModuleTest.kt
├── ios/
│   ├── IndigoSecureStore.podspec
│   ├── IndigoSecureStoreModule.swift
│   └── Tests/IndigoSecureStoreModuleTests.swift
└── src/
    ├── IndigoSecureStore.ts        # entry point nativo
    └── IndigoSecureStore.web.ts    # fallback a localStorage (ver más abajo)
```

**API:** `getItem(key)` / `setItem(key, value)` / `removeItem(key)` — deliberadamente idéntica a
`StorageService`, así que `SecureStorageService` (la nueva clase en `storage.service.ts`) es un
wrapper de una línea por método, sin ninguna adaptación.

**Kotlin** (`IndigoSecureStoreModule.kt`) — `androidx.security.crypto.EncryptedSharedPreferences`
sobre una `MasterKey` con esquema `AES256_GCM` respaldada por **Android Keystore** (la clave de
cifrado nunca sale del hardware/TEE del dispositivo; `EncryptedSharedPreferences` la usa para
cifrar tanto las claves como los valores del archivo de preferencias — `AES256_SIV` para claves,
`AES256_GCM` para valores). La creación de `EncryptedSharedPreferences` es la única parte que
toca disco/Keystore, así que se hace una sola vez (`by lazy`) y se reutiliza. Las tres funciones
son `suspend` (`AsyncFunction(...) Coroutine { }`, igual que `indigo-biometrics`) y corren en
`Dispatchers.IO`, ya que tocar `SharedPreferences` es I/O aunque esté "en memoria" — no debe
bloquear el hilo que llama.

**Swift** (`IndigoSecureStoreModule.swift`) — Keychain vía `Security.framework` directo, sin
ninguna librería de conveniencia: `SecItemCopyMatching` para leer, `SecItemUpdate` (con
`SecItemAdd` como fallback si el item no existe todavía) para escribir, `SecItemDelete` para
borrar. Cada función arma un diccionario de *query* (`kSecClass`, `kSecAttrService`,
`kSecAttrAccount`) — el patrón estándar de la API de Keychain, basada en C, con diccionarios en
vez de objetos tipados. El accesibility elegido es
`kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly`: legible ya en el primer arranque tras
desbloquear el dispositivo (necesario para que `restoreSession()` pueda leer el token apenas
arranca la app, antes de que el usuario toque nada) y **nunca sincronizado por iCloud Keychain a
otros dispositivos** (el token de sesión de este dispositivo no debe viajar a otro — a diferencia
de, por ejemplo, una contraseña de una cuenta que sí tendría sentido sincronizar).

**Validación de clave:** ambos lados rechazan una `key` vacía/en blanco
(`isValidStorageKey`/`InvalidStorageKeyException` en Kotlin, `isValidStorageKey(_:)` en Swift) —
es la única lógica pura de este módulo (Keystore/Keychain reales no se pueden testear sin
Robolectric/un dispositivo, fuera de alcance de esta fase) y por eso es lo que cubren
JUnit/XCTest. Es validación real en el límite del API pública del módulo, no un test inventado
solo para tener cobertura.

**`IndigoSecureStore.web.ts`:** a diferencia del stub "no disponible" de `indigo-biometrics`
(Face ID no tiene ningún equivalente en un navegador), aquí sí hay algo razonable que hacer: un
navegador no tiene Keystore ni Keychain, pero sí `localStorage` — se usa como mejor esfuerzo
(**sin cifrar**, igual que hace la propia implementación web de `expo-secure-store`) para que la
demo web (`pnpm build:web`) siga funcionando de punta a punta, sesión persistida entre recargas
incluida. Verificado con Playwright: login → `localStorage.getItem('indigo/auth-token')` tiene
el token → recargar la página → la app entra directo (no vuelve a Login).

**Qué NO pasa por este módulo:** `theme.store.ts` sigue usando `AsyncStorage` directamente para
la preferencia de tema — no es información sensible, y forzarla por Keystore/Keychain sería
usar la herramienta equivocada para el trabajo (cifrar algo que no lo necesita, más lento y sin
ningún beneficio de seguridad real).

### 4.3 `indigo-card-view` (FASE 8) — la primera vista nativa bajo Fabric

Los dos módulos anteriores son **funciones** (`AsyncFunction`, sin UI propia). Este es distinto:
una **vista** — lo que el roadmap llama "view manager", el otro pilar de la New Architecture
además de TurboModules (ver sección 1). Reemplaza `CardVisual`, que hasta la FASE 3 era 100%
React Native (`LinearGradient` + `Text`).

**Dos generaciones de API conviven en Expo Modules para vistas nativas**, y elegimos la más
antigua/estable a propósito:

1. **Clásica** (`ExpoView` + `Prop`/`Events`) — existe desde los inicios de Expo Modules API,
   documentada de sobra, no depende de ninguna feature flag adicional del proyecto.
2. **Moderna** (`View<Props>(name) { Content { props -> ... } }`, con `ComposeProps`/
   `ExpoSwiftUI.View`) — DSL funcional más reciente que integra Compose/SwiftUI de forma más
   directa, pero en Android requiere activar `"coreFeatures": ["compose"]` en
   `expo-module.config.json`, lo que cambia cómo se compila **todo el proyecto**
   `expo-modules-core` (su propio `build.gradle` tiene un `src/compose` y un `src/withoutCompose`
   condicionados a esa flag — ver `node_modules/expo-modules-core/android/build.gradle`).

Se eligió la vía **clásica** para `indigo-card-view`: sin Android SDK ni Mac en este entorno (FASE
5) no hay forma de compilar y confirmar que la flag `coreFeatures` se propaga correctamente de
punta a punta: menos superficie sin verificar, mismo resultado visual. Es además más simétrica
entre plataformas — Android e iOS usan literalmente el mismo patrón: `ExpoView` (clase base) +
un contenedor del framework de UI declarativo del sistema embebido a mano.

```
modules/indigo-card-view/
├── expo-module.config.json
├── android/
│   ├── build.gradle                 # plugin del compilador de Compose + androidx.compose.foundation
│   └── src/
│       ├── main/java/.../IndigoCardView.kt        # ExpoView + ComposeView embebido
│       ├── main/java/.../IndigoCardViewModule.kt   # registro: Name, View, Prop, Events
│       └── test/java/.../IndigoCardViewTest.kt      # JUnit de parseAccentColor
├── ios/
│   ├── IndigoCardView.podspec
│   ├── IndigoCardView.swift          # ExpoView + UIHostingController embebido
│   ├── IndigoCardViewModule.swift     # registro: Name, View, Prop, Events
│   └── Tests/IndigoCardViewTests.swift
└── src/
    ├── IndigoCardView.tsx             # requireNativeView('IndigoCardView')
    ├── IndigoCardView.web.tsx          # fallback RN puro (Fabric no existe en RN Web)
    └── IndigoCardView.types.ts
```

**Props → nativo:** `holderName`, `last4`, `frozen`, `accentColor` (string hex). Cada uno tiene
un `Prop("nombre") { view, value -> view.setXxx(value) }` en el módulo — el mismo mecanismo
imperativo que cualquier vista clásica de React Native (`ViewManager`/prop setters), solo que
aquí el setter actualiza un `MutableState`/`@State`-equivalente que Compose/SwiftUI observan, así
que cambiar la prop desde JS dispara una recomposición/actualización de la UI nativa
automáticamente — no hace falta invalidar/redibujar nada a mano.

**Evento nativo → JS:** `onPress`. `val onPress by EventDispatcher<Unit>()` (Kotlin) / `let
onPress = EventDispatcher()` (Swift) son propiedades de instancia de la vista; `Events("onPress")`
en el módulo las conecta con el sistema de eventos de Fabric. La vista los invoca
(`onPress(Unit)` / `onPress()`) dentro del gesto de tap de Compose/SwiftUI. En JS llega como
cualquier evento nativo de React Native: una prop `onPress: (event: NativeSyntheticEvent<...>) =>
void`.

**Kotlin** (`IndigoCardView.kt`) — `ExpoView` (que en Android sigue siendo la clase clásica,
extiende `LinearLayout`) con un `ComposeView` hijo añadido en el `init`. El estado (`holderName`,
`last4`, `frozen`, `accentColor`) se guarda con `by mutableStateOf(...)` en la propia vista — un
patrón de "state hoisting" fuera de un `@Composable`, perfectamente válido en Kotlin: como
`setContent { CardContent(holderName, ...) }` lee esas propiedades `State`, Compose se suscribe
solo y recompone cuando cambian, sin que la vista tenga que llamar a nada como
`invalidate()`/`requestLayout()`.

**Swift** (`IndigoCardView.swift`) — mismo patrón con `UIHostingController<CardContent>`: sus
`didSet` en `holderName`/`last4`/`frozen`/`accentColor` llaman a `updateContent()`, que reemplaza
`hostingController.rootView` con una nueva instancia de la struct `CardContent` (SwiftUI no tiene
observación automática de propiedades sueltas como Compose; hay que reasignar `rootView` a mano
para forzar el re-render — la diferencia real entre los dos frameworks que vale la pena anotar
para una entrevista).

**Validación de la prop `accentColor`:** ambos lados exponen `parseAccentColor` como función
libre/de paquete — recibe un string arbitrario desde JS (nunca hay que confiar en el input) y
cae a un morado por defecto si no es un hex de 6 dígitos válido. Es, otra vez, la única lógica
pura de este módulo sin necesitar un árbol de UI real montado, cubierta por JUnit/XCTest.

**`IndigoCardView.web.tsx`:** Fabric no existe en React Native Web — no hay ningún equivalente a
`requireNativeComponent` que funcione ahí. El fallback es RN puro (`LinearGradient` + `Text`,
mismo look que la implementación pre-FASE 8), con la misma superficie de props. Es lo único que
se puede ver renderizado en este entorno (capturado con Playwright); el render nativo real de
Compose/SwiftUI queda sin verificar visualmente hasta tener un dispositivo/emulador o CI (FASE 11)
— coherente con la limitación de Android SDK/Mac ya documentada en la sección 2.

**Verificado en Playwright:** al tocar "Congelar tarjeta" en `CardsScreen`, el estado `frozen`
local se propaga a `CardVisual` → `IndigoCardView`, y la tarjeta muestra "CONGELADA" en vivo — la
prueba de que el flujo de props (JS → prop nativa → UI) funciona de punta a punta, aunque sea
sobre el fallback web. El evento `onPress` (tocar la tarjeta) sí dispara el handler — se
comprobó que `Alert.alert(...)` se invoca — pero `react-native-web`'s `Alert.alert` es un
no-op intencional (`static alert() {}`, ver `node_modules/react-native-web/src/exports/Alert`),
así que no hay ningún diálogo que capturar en el navegador; es el mismo comportamiento (silencioso
en web) que ya tienen todos los demás `Alert.alert` de la app, no algo nuevo de este módulo.

### 4.4 `indigo-device` (FASE 9) — TurboModule "bare", sin Expo Modules API

Los tres módulos anteriores usan **Expo Modules API**: un DSL (`Module()`/`ModuleDefinition`,
`View()`, `Prop()`) que envuelve TurboModules por debajo y se encarga solo del autolinking,
el registro en `MainApplication.kt`/`AppDelegate.swift` y gran parte del boilerplate de
Codegen. Esta fase quita esa envoltura a propósito: **spec en TypeScript → Codegen → clase
Kotlin/Objective-C++ generada → implementación a mano → registro manual**, el camino "de
verdad" que Expo Modules normalmente esconde.

**Cómo se verificó sin Android SDK ni Mac** — a diferencia de las FASES 6-8, aquí sí hay una
herramienta puramente Node.js que corre en este entorno sin ninguna limitación:

```bash
node node_modules/react-native/scripts/generate-codegen-artifacts.js -p . -t all -o /tmp/out
```

Este es el mismo script que Gradle/CocoaPods invocan por debajo en una build real. Correrlo a
mano parseó `modules/indigo-device/src/NativeIndigoDevice.ts` de verdad y generó el Kotlin/
Objective-C++ real — la implementación de este módulo está escrita contra esa salida
inspeccionada, no adivinada. Fue la verificación más fuerte de todo el Bloque B hasta ahora.

**El spec** (`NativeIndigoDevice.ts`):

```ts
export interface Spec extends TurboModule {
  getDeviceName(): string;
  isTablet(): boolean;
  getBatteryLevelAsync(): Promise<number>;
}
export default TurboModuleRegistry.getEnforcing<Spec>('IndigoDevice');
```

`getDeviceName`/`isTablet` son **síncronos** — sin `Promise`, JS llama directo y obtiene la
respuesta en el mismo tick. Esto es exactamente lo que JSI hace posible (sección 1): antes del
bridge nuevo, **todo** método nativo era forzosamente asíncrono (mensajes JSON serializados por
un puente); con JSI, JS tiene una referencia directa al objeto C++/nativo y puede invocarlo
síncronamente. `codegenConfig` en el **`package.json` raíz de la app** (no un `expo-module.config.json`
— este módulo no es un paquete separado) le dice a Codegen dónde está el spec:

```json
"codegenConfig": {
  "name": "IndigoDeviceSpec",
  "type": "modules",
  "jsSrcsDir": "modules/indigo-device/src"
}
```

**Lo que Codegen generó de verdad** (Android, `NativeIndigoDeviceSpec.java`):

```java
public abstract class NativeIndigoDeviceSpec extends ReactContextBaseJavaModule implements TurboModule {
  public static final String NAME = "IndigoDevice";
  @ReactMethod(isBlockingSynchronousMethod = true)
  public abstract String getDeviceName();
  @ReactMethod(isBlockingSynchronousMethod = true)
  public abstract boolean isTablet();
  @ReactMethod
  public abstract void getBatteryLevelAsync(Promise promise);
}
```

`isBlockingSynchronousMethod = true` es la marca que Codegen pone en los dos métodos síncronos;
`getBatteryLevelAsync` en cambio recibe un `Promise` extra como último parámetro (el patrón
clásico de RN, no corrutinas — un TurboModule "bare" en Kotlin no usa
`AsyncFunction(...) Coroutine {}` porque eso es sintaxis de Expo Modules API, no del sistema de
TurboModules en sí). `IndigoDeviceModule.kt` extiende esa clase abstracta y la implementa;
`IndigoDevicePackage.kt` es un `BaseReactPackage` — el registro manual explícito que Expo
Modules genera solo.

**Lo que Codegen generó de verdad** (iOS, `IndigoDeviceSpec.h`):

```objc
@protocol NativeIndigoDeviceSpec <RCTBridgeModule, RCTTurboModule>
- (NSString *)getDeviceName;
- (NSNumber *)isTablet;   // nota: NSNumber*, no BOOL — así empaqueta Codegen los booleanos
- (void)getBatteryLevelAsync:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject;
@end
```

`IndigoDevice.mm` implementa este protocolo en **Objective-C++** (no Swift): la interoperabilidad
Swift↔protocolo-generado-por-Codegen para TurboModules es más nueva y con más piezas móviles que
Objective-C++, que es el camino tradicional y mejor documentado — con `RCT_EXPORT_MODULE`,
`RCT_EXPORT_SYNCHRONOUS_TYPED_METHOD` (para los dos métodos síncronos) y `RCT_EXPORT_METHOD`
(para el asíncrono), calcado del propio `AsyncStorage.mm` de `@react-native-async-storage/
async-storage` (instalado en `node_modules`, es la referencia real usada para escribir esto).

**Sin autolinking — registro manual de verdad.** Como este módulo no tiene
`expo-module.config.json`, `expo-modules-autolinking` no lo ve. Sin autolinking automático, el
código nativo tiene que llegar a `android/`/`ios/` (generados, gitignored) y quedar registrado
cada vez que se corre `expo prebuild`. Eso es exactamente lo que hace `plugins/withIndigoDevice.ts`,
a mano, con las piezas de `@expo/config-plugins`:

- `withDangerousMod('android', ...)` — copia `IndigoDeviceModule.kt`/`IndigoDevicePackage.kt` a
  `android/app/src/main/java/dev/daniell/indigo/modules/device/` (el módulo vive en el propio
  módulo `:app` de Gradle porque el `codegenConfig` está en el `package.json` de la app, no en
  uno propio — Codegen generó `NativeIndigoDeviceSpec` como parte de la compilación de `:app`).
- `withMainApplication(...)` + `mergeContents(...)` — inyecta el `import` y
  `add(IndigoDevicePackage())` dentro de `PackageList(this).packages.apply { }` en
  `MainApplication.kt`, con marcadores `@generated begin/end` (idempotente: correr prebuild de
  nuevo no duplica la línea). **Verificado**: se corrió `expo prebuild --clean` en este entorno
  y se inspeccionó el `MainApplication.kt` resultante — el import y el `add(...)` quedaron
  exactamente donde debían.
- `withDangerousMod('ios', ...)` — copia `IndigoDevice.h`/`IndigoDevice.mm` a
  `ios/<target>/IndigoDevice/` (la ruta real se obtiene con `IOSConfig.Paths.getSourceRoot(...)`,
  no se asume "ndigo" a mano — ver el gotcha del nombre del proyecto en la sección 3).
- `withXcodeProject(...)` — a diferencia de Android, en iOS **no hace falta tocar
  `AppDelegate.swift`**: `RCT_EXPORT_MODULE` registra el módulo por introspección del runtime de
  Objective-C (escanea clases que conforman `RCTBridgeModule` al arrancar), no por una lista
  estática como `PackageList` en Android — una asimetría real entre plataformas, buena para una
  entrevista. Lo que sí hace falta es que Xcode **compile** los archivos, y Xcode no descubre
  archivos sueltos en una carpeta solo por estar ahí (a diferencia de Gradle): hay que añadirlos
  al `.pbxproj` a mano, con el paquete `xcode` (el mismo que usa `@expo/config-plugins` por
  debajo) vía `project.addSourceFile(...)`/`addHeaderFile(...)`, encontrando el grupo y el
  target correctos (`project.findPBXGroupKey({ name: ... })`, `project.getFirstTarget()`).
  **Verificado**: se corrió `expo prebuild --clean` y se inspeccionó el `.pbxproj` resultante —
  `IndigoDevice.h`/`.mm` aparecen como `PBXFileReference`, dentro del grupo correcto, y
  `IndigoDevice.mm` quedó referenciado en el `PBXSourcesBuildPhase` real del target de la app
  (se compila). Nota: el paquete `xcode` es viejo y no reconoce la extensión `.mm` en su tabla
  interna (`FILETYPE_BY_EXTENSION` en `node_modules/xcode/lib/pbxFile.js` solo tiene `.m`, no
  `.mm`) — el comentario generado en el `.pbxproj` dice *"IndigoDevice.mm in Resources"*, que es
  cosmético y engañoso (el propio archivo confirma que la entrada vive en la sección
  `PBXSourcesBuildPhase`, no en `PBXResourcesBuildPhase`: sí se compila). Lo que **no** se pudo
  verificar en este entorno es que Xcode realmente abra y compile el proyecto así — eso queda
  para CI (FASE 11) o un Mac real.

**Sin fallback web automático.** Los módulos de Expo Modules API tienen `registerWebModule` +
un archivo `.web.ts` que Metro resuelve solo. Un TurboModule "bare" no tiene ese mecanismo — pero
Metro sí resuelve extensiones `.web.ts` por plataforma para **cualquier** módulo, no solo los de
Expo, así que `NativeIndigoDevice.web.ts` cumple el mismo papel a mano, con un objeto plano que
satisface la interfaz `Spec` (que solo pide los tres métodos — `TurboModule` en sí es case
prácticamente vacía: `interface TurboModule { getConstants?(): {} }`).

**Consumo:** `core/services/device.service.ts` (mismo patrón facade que los otros tres módulos),
usado de verdad en la fila "Diagnóstico del dispositivo" de `ProfileScreen` — llama
`getDeviceName()`/`isTablet()` (síncronos) y `getBatteryLevelAsync()` (async) en la misma
interacción, mostrando ambos estilos de una vez. Verificado con Playwright sobre el fallback
web: tocar la fila no lanza ningún error de página.

**Tests:** `isTabletScreenLayout`/`IndigoDeviceIsTabletIdiom` — funciones libres, mismo patrón
que en las FASES 6-8, cubiertas por JUnit y XCTest respectivamente (no ejecutables localmente,
igual que el resto de la capa nativa — quedan para CI en la FASE 11).

### 4.5 `indigo-connectivity` (FASE 10) — corrutinas, Flow y AsyncStream

Vuelve a Expo Modules API (como las FASES 6-8, a diferencia del TurboModule "bare" de la FASE 9),
pero resuelve un problema distinto: los módulos anteriores exponen **funciones** (`isAvailable()`,
`getItem(key)`...) que JS llama y esperan una respuesta puntual. Este módulo expone un **stream
continuo** — el estado de la red cambia por su cuenta, sin que JS lo pida — así que la pieza nueva
no es la llamada nativa en sí, sino cómo una API nativa *basada en callbacks* se convierte en algo
que un `for`/`while` async puede consumir, y cómo ese consumo se apaga solo cuando nadie del lado
JS está escuchando.

**Kotlin — `callbackFlow`:**

```kotlin
fun observeConnectivity(context: Context): Flow<ConnectivityState> = callbackFlow {
  val connectivityManager = context.getSystemService(ConnectivityManager::class.java)
  val callback = object : ConnectivityManager.NetworkCallback() {
    override fun onCapabilitiesChanged(network: Network, capabilities: NetworkCapabilities) {
      trySend(connectivityStateFromCapabilities(capabilities))
    }
    override fun onLost(network: Network) {
      trySend(ConnectivityState(isConnected = false, type = "none"))
    }
  }
  connectivityManager.registerDefaultNetworkCallback(callback)
  awaitClose { connectivityManager.unregisterNetworkCallback(callback) }
}.distinctUntilChanged()
```

`ConnectivityManager.NetworkCallback` es una API basada en callbacks — no hay forma de hacer
`for (state in connectivityManager.states())` directamente. `callbackFlow` es el puente estándar
de las corrutinas para este caso: un `Flow` "frío" (no arranca hasta que alguien lo colecta) que
además es un `ProducerScope`, así que dentro se puede llamar `trySend(...)` desde el callback de
Android (que corre en el hilo que Android elija, no en el de la corrutina) sin bloquear. `awaitClose
{ }` es la garantía de limpieza: se ejecuta siempre que el `Flow` se cancela — sea porque el
colector dejó de escuchar, sea porque la corrutina que lo colecta se cancela por cualquier otra
razón — así que `unregisterNetworkCallback` nunca se olvida, sin necesidad de un `try/finally`
manual. `distinctUntilChanged()` evita reenviar el mismo estado dos veces seguidas (Android puede
disparar `onCapabilitiesChanged` más de una vez para la misma red real).

**Swift — `AsyncStream`, la contraparte exacta:**

```swift
private func connectivityUpdates() -> AsyncStream<ConnectivityState> {
  AsyncStream { continuation in
    let monitor = NWPathMonitor()
    let queue = DispatchQueue(label: "dev.daniell.indigo.modules.connectivity")
    monitor.pathUpdateHandler = { path in
      continuation.yield(connectivityState(from: path))
    }
    continuation.onTermination = { _ in monitor.cancel() }
    monitor.start(queue: queue)
  }
}
```

`NWPathMonitor.pathUpdateHandler` es, otra vez, un callback — el mismo problema que en Android.
`AsyncStream` es la respuesta de Swift: su *builder closure* recibe una `continuation` sobre la que
se llama `.yield(...)` desde el callback de `Network.framework`, y `continuation.onTermination`
es el `awaitClose` de Swift — se dispara cuando el `for await` que consume el stream se cancela,
y ahí se llama `monitor.cancel()`. La correspondencia Kotlin↔Swift es 1:1: `callbackFlow` ↔
`AsyncStream`, `trySend`/`yield` para emitir, `awaitClose`/`onTermination` para limpiar.

**Exponer el stream como evento de Expo Modules, no como el `Flow`/`AsyncStream` en sí** — JS no
puede consumir un `Flow` ni un `AsyncStream` directamente; el puente es el sistema de eventos que
ya trae `ModuleDefinition`:

```kotlin
Events("onConnectivityChange")

OnStartObserving("onConnectivityChange") {
  observationJob = moduleScope.launch {
    observeConnectivity(appContext.reactContext!!).collect { state ->
      sendEvent("onConnectivityChange", state.toMap())
    }
  }
}
OnStopObserving("onConnectivityChange") {
  observationJob?.cancel()
}
```

```swift
OnStartObserving("onConnectivityChange") {
  observationTask = Task {
    for await state in connectivityUpdates() {
      sendEvent("onConnectivityChange", connectivityStateDict(state))
    }
  }
}
OnStopObserving("onConnectivityChange") {
  observationTask?.cancel()
}
```

`OnStartObserving`/`OnStopObserving` se disparan automáticamente cuando el primer/último listener
JS se suscribe/desuscribe (`addListener`/`removeListener` del lado JS, ver más abajo) — así que el
`NetworkCallback`/`NWPathMonitor` real solo vive mientras algo en JS de verdad lo está escuchando,
igual de "lazy" que un `Flow` frío por diseño. Cancelar el `Job`/`Task` en `OnStopObserving`
propaga la cancelación hacia abajo hasta `awaitClose`/`onTermination`, que desregistra el callback
nativo — la cadena completa de limpieza depende de que la cancelación de corrutinas/`Task` se
propague correctamente, no de un `stop()` explícito.

**El lado TS es lo nuevo frente a las FASES 6-9: `NativeModule<TEventsMap>`.** Todos los módulos
anteriores declaran `extends NativeModule<{}>` (sin eventos). Este declara
`extends NativeModule<IndigoConnectivityEvents>`, con

```ts
export type IndigoConnectivityEvents = {
  onConnectivityChange: (state: ConnectivityState) => void;
};
```

`NativeModule<TEventsMap>` extiende `EventEmitter<TEventsMap>` (`expo-modules-core/src/
ts-declarations/{NativeModule,EventEmitter}.ts`), así que `addListener('onConnectivityChange',
listener)`, `removeListener(...)` y `emit(...)` quedan tipados de punta a punta: el nombre del
evento y la forma del payload se validan en tiempo de compilación, no solo en runtime.
`core/services/connectivity.service.ts` envuelve `addListener` + el `EventSubscription.remove()`
que devuelve en una función de desuscripción simple (`() => void`), y
`shared/hooks/useConnectivity.ts` la consume con `useEffect`, exponiendo el estado a
`OfflineBanner` (montado una sola vez en `App.tsx`, visible en las 10 pantallas).

**Fallback web genuinamente funcional — distinto a las FASES 6-7.** Face ID/biometría y Keystore
no tienen equivalente en un navegador, así que sus `.web.ts` son stubs "no disponible" fijos. La
web **sí** tiene una señal real de conectividad (`navigator.onLine` + eventos `online`/`offline`
de `window`), así que `IndigoConnectivity.web.ts` la usa de verdad:

```ts
window.addEventListener('online', () => {
  IndigoConnectivityModuleWeb.emit('onConnectivityChange', currentWebConnectivityState());
});
```

Aquí apareció un desajuste real de tipos en `expo-modules-core`: `registerWebModule(...)` declara
que devuelve `ModuleType` (el tipo de la propia clase/constructor), pero en runtime devuelve una
**instancia** (`new moduleImplementation()`, ver `registerWebModule.ts`). Sin corregirlo, TS trata
el valor devuelto como si fuera la clase en sí y rechaza `.emit(...)` (un método de instancia) con
`Property 'emit' does not exist on type 'typeof IndigoConnectivityModule'`. Se corrige con un cast
explícito y documentado en el propio archivo: `as unknown as InstanceType<typeof
IndigoConnectivityModule>` — el mismo tipo de gotcha cosmético-pero-real que el comentario erróneo
de `.mm` en el `.pbxproj` de la FASE 9 (sección 4.4): no es un bug de la app, es un límite de la
librería que hay que conocer y documentar, no silenciar con `any`.

**Verificado sin compilar**, igual que el resto del bloque B: `expo-modules-autolinking resolve
--platform android/ios --json` confirma que `indigo-connectivity` autolinkea solo en ambas
plataformas (a diferencia de la FASE 9, este módulo sí tiene `expo-module.config.json`, así que no
hace falta ningún plugin de registro manual); `expo prebuild --clean` corrió limpio e inyectó
`android.permission.ACCESS_NETWORK_STATE` en el `AndroidManifest.xml` generado (agregado a
`plugins/withIndigo.ts`, sección 5 — sin este permiso `ConnectivityManager` devolvería
`NetworkCapabilities` nulas); y el fallback web se probó **en vivo** con Playwright alternando
`browserContext.setOffline(true/false)` sobre la demo servida desde `dist/`: el banner "Sin
conexión a internet" aparece y desaparece en tiempo real, confirmando que el evento
`online`/`offline` del navegador realmente llega hasta `OfflineBanner` a través de
`emit`→`addListener`→`useConnectivity`.

**Tests:** `connectivityStateFrom`/`connectivityState` — funciones libres, mismo patrón que las
FASES 6-9, 6 casos JUnit/XCTest cada una (conectado por wifi/celular/ninguno, wifi con prioridad
sobre celular cuando ambos transportes están presentes, "unknown" para ethernet/VPN, y el caso
real de una interfaz técnicamente presente pero sin validación de Internet — portal cautivo).
`connectivity.service.test.ts` en Jest cubre `getCurrentState`, `subscribe` y que la función de
desuscripción llame a `EventSubscription.remove()`.

---

## 5. Config plugins

Un config plugin es una función TypeScript que recibe la configuración de Expo (`ExpoConfig`) y
la modifica antes/durante `expo prebuild` — es la forma de tocar `AndroidManifest.xml` o
`Info.plist` de forma **idempotente y versionada**, sin editar `android/`/`ios/` a mano (se
regeneran y se perdería cualquier edición manual).

`plugins/withIndigo.ts` (FASE 5) hace esto, a mano, sin usar el helper `withPermissions` que ya
trae `@expo/config-plugins` (a propósito — el objetivo es entender el patrón "mod", no solo
llamar a un one-liner):

- `withAndroidManifest(config, config => ...)` — recibe `config.modResults` ya parseado como
  objeto (el XML se parsea/serializa solo). Se le agregan entradas a
  `manifest['uses-permission']` para `android.permission.CAMERA`,
  `android.permission.USE_BIOMETRIC` y (desde la FASE 10)
  `android.permission.ACCESS_NETWORK_STATE` — sin esta última, `ConnectivityManager` en
  `modules/indigo-connectivity` devuelve `NetworkCapabilities` nulas en vez de las reales — sin
  duplicar si ya existieran (autolinking de otro módulo podría haberlas puesto).
- `withInfoPlist(config, config => ...)` — mismo patrón para iOS: escribe
  `NSCameraUsageDescription` y `NSFaceIDUsageDescription` (obligatorio desde iOS 11 para poder
  usar Face ID; sin este string la app *crashea* al llamar a `LAContext.evaluatePolicy`).
- `withPlugins(config, [...])` compone ambos mods en un solo plugin exportado, y
  `createRunOncePlugin(withIndigo, 'withIndigo', '1.0.0')` evita que se aplique dos veces si algo
  más lo importa indirectamente.

Verificado corriendo `expo prebuild --clean` con el plugin registrado en `app.json` e inspeccionando
que `android/app/src/main/AndroidManifest.xml` e `ios/ndigo/Info.plist` tuvieran las claves
nuevas (no hay Android SDK local para llegar a compilar, ver el aparte de la sección 2, pero la
generación del manifest/plist no lo necesita).

---

## 6. Keystore vs Keychain (detalle, FASE 7)

*(Se amplía con código real en la FASE 7. Resumen conceptual en `docs/06-guia-entrevista.md`.)*

## 7. Concurrencia nativa (detalle, FASE 10)

Ver sección 4.5 (`indigo-connectivity`): `callbackFlow`/`distinctUntilChanged` en Kotlin,
`AsyncStream`/`continuation.onTermination` en Swift, y cómo ambos se enchufan al sistema de
eventos de Expo Modules (`Events`/`OnStartObserving`/`OnStopObserving`/`sendEvent`) para que JS
consuma un stream nativo continuo como una suscripción normal (`addListener`/`emit`, tipada vía
`NativeModule<TEventsMap>`).

## 8. Firma y publicación

*(Se amplía en la FASE 11: keystore de Android vía GitHub Secrets, perfiles de EAS Build, y por
qué el Swift solo se firma/publica desde CI o EAS, nunca localmente en este entorno.)*

---

## 9. Tabla de equivalencias Kotlin ↔ Swift

Ver `docs/06-guia-entrevista.md` — se mantiene ahí para no duplicar, y se referencia desde aquí
porque es la puerta de entrada rápida antes de una entrevista.
