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

*(Esta sección se completa con detalle en la FASE 5, con rutas de archivo reales del proyecto.)*

Puntos clave a entender cuando se genere:
- `settings.gradle` — declara los módulos que participan en el build (incluye `:app` y cada
  módulo de `modules/*/android` autoenlazado).
- `android/build.gradle` (raíz) vs `android/app/build.gradle` — configuración del proyecto vs
  configuración del módulo `app` (dependencias, `applicationId`, `minSdkVersion`, `signingConfigs`).
- `AndroidManifest.xml` — permisos, actividades, `intent-filters` (deep links).
- `MainActivity.kt` / `MainApplication.kt` — el punto de entrada nativo: dónde se registran los
  paquetes nativos (incluidos los módulos de `modules/`) y se arranca el runtime de RN.
- **Hermes** — el motor JS que ejecuta el bundle (reemplazó a JSC como default).
- **R8** — el minificador/ofuscador usado en release builds.

## 3. Anatomía del proyecto iOS generado (`expo prebuild -p ios`)

*(Se completa en la FASE 5, verificado vía CI ya que no hay Mac local.)*

- `AppDelegate.swift` — punto de entrada nativo iOS, arranca el runtime de RN.
- `Info.plist` — permisos (`NSFaceIDUsageDescription`, `NSCameraUsageDescription`, ...),
  configuración de la app.
- `Podfile` / CocoaPods — gestor de dependencias nativas de iOS; cada módulo de `modules/*/ios`
  trae su `.podspec` y se auto-enlaza.
- Esquemas de Xcode (`.xcworkspace`, `.xcscheme`) — usados por `xcodebuild` en CI.

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

---

## 5. Config plugins

Un config plugin es una función TypeScript que recibe la configuración de Expo (`ExpoConfig`) y
la modifica antes/durante `expo prebuild` — es la forma de tocar `AndroidManifest.xml` o
`Info.plist` de forma **idempotente y versionada**, sin editar `android/`/`ios/` a mano (se
regeneran y se perdería cualquier edición manual). `plugins/withIndigo.ts` (FASE 5) añade el
permiso `USE_BIOMETRIC`/`USE_FINGERPRINT` en Android y `NSFaceIDUsageDescription` en iOS.

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
