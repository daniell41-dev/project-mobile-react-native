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
  `manifest['uses-permission']` para `android.permission.CAMERA` y
  `android.permission.USE_BIOMETRIC`, sin duplicar si ya existieran (autolinking de otro módulo
  podría haberlas puesto).
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

*(Coroutines + Flow en Kotlin, async/await + Combine en Swift — con el ejemplo real del módulo de
la FASE 10.)*

## 8. Firma y publicación

*(Se amplía en la FASE 11: keystore de Android vía GitHub Secrets, perfiles de EAS Build, y por
qué el Swift solo se firma/publica desde CI o EAS, nunca localmente en este entorno.)*

---

## 9. Tabla de equivalencias Kotlin ↔ Swift

Ver `docs/06-guia-entrevista.md` — se mantiene ahí para no duplicar, y se referencia desde aquí
porque es la puerta de entrada rápida antes de una entrevista.
