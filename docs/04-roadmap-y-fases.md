# 04 - ROADMAP Y FASES DE CONSTRUCCIÓN

> 📌 **Este documento es una regla.** Toda sesión futura de Claude (y cualquier dev) debe
> leerlo antes de trabajar y respetar el sistema de fases y el flujo Git descritos aquí.
> Complementa a `CLAUDE.md` (flujo Git operativo), `docs/03-arquitectura-y-buenas-practicas.md`
> (estándares de código) y `docs/07-capa-nativa-kotlin-swift.md` (guía de aprendizaje nativo).

## 🎯 Propósito

Índigo es un proyecto de portafolio orientado a demostrar el perfil de un **desarrollador React
Native senior con dominio real de la capa nativa (Kotlin y Swift)**, hermano de
`project-mobile-ionic`. El trabajo se organiza en **fases incrementales**, agrupadas en dos
bloques. **El bloque B (capa nativa) es el eje del proyecto**, no un anexo.

## 🔄 Flujo Git por fase (obligatorio)

Ver `docs/01-flujo-git-github.md`. Resumen:

```
1. Claude crea un issue describiendo la fase/tarea.
2. Claude trabaja en una rama de tarea y commitea (Conventional Commits).
3. Claude crea el PR: rama de tarea → develop  (con "Closes #N").
4. Claude mergea el PR a develop y cierra el issue.   ← automático, hasta aquí Claude solo.
5. PR develop → main: SOLO cuando el usuario lo pide explícitamente.
```

**Regla de cierre de cada fase:** dejar `pnpm lint && pnpm typecheck && pnpm test:ci &&
pnpm build:web` en verde (y `./gradlew assembleDebug`/`test` cuando aplique), y actualizar
`docs/05-tutorial-proyecto-completo.md`.

---

## Bloque A — Fundación JS/UI

### FASE 0 — Bootstrap y reglas
- Commit semilla en `main` (README, CLAUDE.md, `.gitignore`, `docs/` completo) — única escritura
  directa a `main`, autorizada explícitamente por el usuario porque el repo nacía vacío.
- Crear `develop` desde `main`.
- Scaffold Expo SDK 57 + TypeScript strict + alias `@/*` + ESLint/Prettier + Jest (`jest-expo`) +
  RNTL + `.github/workflows/ci.yml`.

### FASE 1 — Tokens, tema y navegación
Paleta morada, tipografía (Plus Jakarta Sans + Sora), `ThemeProvider`/`themeStore`. React
Navigation explícito: `RootNavigator`, `AuthNavigator`, `TabNavigator` (5 tabs) + stacks push por
tab, `ParamList` tipados. Las 10 pantallas como *shells*. `DataService` mock es-MX/MXN.

### FASE 2 — Autenticación
`StorageService` (AsyncStorage tras interfaz propia), `authStore` con token persistido y
restauración de sesión, `LoginScreen` (react-hook-form + zod), `RootNavigator` conmutando por
`isAuthenticated`.

### FASE 3 — Fidelidad visual (10 pantallas)
Componentes compartidos (`BalanceCard`, `NumericKeypad`, `TransactionRow`, `CardVisual`, ...) y
las 10 pantallas fieles al prototipo del handoff, en morado, claro y oscuro, con todas las
interacciones (ocultar saldo, filtros, buscadores, agrupación por día, toggles, tema).

### FASE 4 — Charts + capa REST
Análisis con donut + barras (`react-native-gifted-charts`) y segmento Semana/Mes/Año.
`TransactionRepository` (interfaz) + `InMemory*`/`Http*` (Strategy) + Adapter DTO→modelo +
TanStack Query. `HttpTransactionRepository` se prueba con `fetch` mockeado — MSW se
descartó para este unit test: su dependencia `rettime` se publica solo como ESM (`.mjs`)
y forzar a Jest a transformarla añadía fragilidad sin aportar valor sobre un mock de
`fetch` directo para un test de repositorio.

---

## Bloque B — Capa nativa (eje del proyecto)

> Cada fase entrega **Kotlin y Swift equivalentes**, verificados en CI (Android en
> `ubuntu-latest`, iOS en `macos-latest`), y amplía `docs/07-capa-nativa-kotlin-swift.md`.

### FASE 5 — Fundamentos nativos: prebuild, Gradle y config plugin propio
`npx expo prebuild` + recorrido guiado del árbol generado (Android: Gradle, AndroidManifest,
`MainActivity`/`MainApplication.kt`, R8, Hermes; iOS: `AppDelegate.swift`, `Info.plist`,
`Podfile`). Config plugin propio `plugins/withIndigo.ts` (permisos de biometría/cámara,
`withAndroidManifest`/`withInfoPlist` a mano). Descubrimiento real de esta fase: este contenedor
remoto no tiene Android SDK ni acceso a `dl.google.com`, así que `./gradlew assembleDebug` no
compila aquí (sí se generó y se inspeccionó el proyecto) — detalle en `docs/07` sección 2 y
`docs/02` PARTE 4.1.

### FASE 6 — Módulo nativo nº1: biometría (`modules/indigo-biometrics`)
Kotlin: `androidx.biometric.BiometricPrompt` + corrutinas (`AsyncFunction ... Coroutine { }`).
Swift: `LocalAuthentication`/`LAContext` + `withCheckedContinuation`. API `isAvailable()` /
`authenticate(reason)`, consumida vía `core/services/biometrics.service.ts` y usada de verdad
en el toggle "Seguridad y biometría" de `ProfileScreen`. Tests: JUnit + XCTest del mapeo de
errores (corren en CI, FASE 11 — sin SDK/Mac local) + mock en Jest. Verificado sin compilar con
`npx expo-modules-autolinking resolve --platform android/ios --json`. Detalle completo en
`docs/07` sección 4.1.

### FASE 7 — Módulo nativo nº2: almacenamiento seguro (`modules/indigo-secure-store`)
Kotlin: Android Keystore + `EncryptedSharedPreferences` (AES-256-GCM). Swift: Keychain
(`SecItemAdd`/`SecItemCopyMatching`/`SecItemUpdate`/`SecItemDelete`, accesibilidad
`AfterFirstUnlockThisDeviceOnly`). Nueva implementación (`SecureStorageService`) de
`StorageService` para el token de auth — Strategy/DIP puro: `AuthService` no cambió, solo la
implementación detrás de la interfaz (desde la FASE 2). `theme.store.ts` sigue en AsyncStorage
a propósito (no es dato sensible). Web: fallback a `localStorage` (sin cifrar, solo para que la
demo funcione de punta a punta, verificado con recarga de página en Playwright). Tests: JUnit +
XCTest de la validación de claves + mock con estado en memoria en Jest. Detalle en `docs/07`
sección 4.2.

### FASE 8 — Vista nativa con Fabric (`modules/indigo-card-view`)
`ExpoView` (API clásica, elegida sobre la nueva `coreFeatures: compose`/`ExpoSwiftUI.View` por
menor riesgo sin poder compilar en este entorno — ver `docs/07` 4.3) con un `ComposeView`
embebido (Kotlin) y un `UIHostingController` embebido (Swift) para el visual de la tarjeta.
Props (`holderName`/`last4`/`frozen`/`accentColor`) + evento nativo→JS (`onPress`). Reemplaza
`CardVisual`, que queda como adaptador delgado. Enseña view managers bajo la New Architecture:
state hoisting en Compose vs reasignar `rootView` en SwiftUI. Tests: JUnit + XCTest de
`parseAccentColor` (validación de un string arbitrario desde JS) + mock en Jest.

### FASE 9 — TurboModule "bare" con Codegen (`modules/indigo-device`)
Sin Expo Modules API: spec TS → Codegen → Kotlin (`NativeIndigoDeviceSpec`) + Objective-C++
(`NativeIndigoDeviceSpec`/`NativeIndigoDeviceSpecJSI`). `getDeviceName()`/`isTablet()`
síncronos (JSI) + `getBatteryLevelAsync()` async. Sin autolinking: `plugins/withIndigoDevice.ts`
registra el módulo a mano (copia el código a `android/`/`ios/`, inyecta
`MainApplication.kt`, añade los archivos al `.pbxproj`). Documenta JSI, Codegen y por qué
React Native 0.82+ es *bridgeless* (el bridge legacy fue eliminado; ver `docs/07` 4.4).
Verificado corriendo Codegen localmente (`node node_modules/react-native/scripts/
generate-codegen-artifacts.js`, no necesita SDK/Xcode) contra el spec real.

### FASE 10 — Kotlin en profundidad: concurrencia y testing nativo (`modules/indigo-connectivity`)
Kotlin: `ConnectivityManager.NetworkCallback` envuelto en un `Flow` frío con `callbackFlow { ...
awaitClose { } }` + `distinctUntilChanged()`. Swift: el equivalente exacto con
`NWPathMonitor`/`AsyncStream` + `continuation.onTermination`. Primer módulo del bloque B que
expone un **stream continuo**, no solo funciones: `Events("onConnectivityChange")` +
`OnStartObserving`/`OnStopObserving` (arrancan/paran el monitor nativo solo mientras JS tiene
listeners activos) + `sendEvent(...)`. `connectivityStateFrom(hasInternet, hasWifi, hasCellular)`
(Kotlin) y `connectivityState(isConnected:usesWifi:usesCellular:)` (Swift) son funciones libres,
mismo patrón que las FASES 6-9, para poder testearlas con JUnit/XCTest sin un `ConnectivityManager`
o `NWPath` reales. Lado TS: `NativeModule<IndigoConnectivityEvents>` tipa `addListener`/`emit` de
punta a punta (a diferencia de los módulos sin eventos de FASES 6-7, que usan `NativeModule<{}>`).
Fallback web genuinamente funcional (no un stub "no disponible"): `navigator.onLine` +
`window.addEventListener('online'/'offline', ...)` disparan el mismo evento
`onConnectivityChange` vía `.emit()` sobre la instancia que devuelve `registerWebModule` (con
`as unknown as InstanceType<...>` — su tipo declarado no coincide con lo que devuelve en
runtime, ver `docs/07` sección 4.5). `core/services/connectivity.service.ts` +
`shared/hooks/useConnectivity.ts` + `OfflineBanner` montado una vez en `App.tsx`: banner "Sin
conexión a internet" visible en las 10 pantallas, verificado en vivo con Playwright alternando
`context.setOffline(true/false)`. Tests: JUnit + XCTest (6 casos cada uno) de la función pura +
`connectivity.service.test.ts` en Jest. Detalle completo en `docs/07` sección 4.5.

### FASE 11 — CI/CD nativo y entrega
`android.yml` (Gradle → APK/AAB firmado, keystore por secrets). `ios.yml` (`macos-latest` →
`xcodebuild`, compila y testea el Swift sin Mac). Perfiles EAS Build (`development`/`preview`/
`production`) para el iPhone físico. Demo web (`expo export -p web`) a GitHub Pages.

---

## 📋 Cobertura del perfil profesional → fase

| Requisito | Fase | Estado |
|---|---|---|
| React Native + TypeScript profundo | 0–4 | ✅ |
| React Navigation explícito (no expo-router) | 1 | ✅ |
| Arquitectura limpia, SOLID, GoF | 0–4, 3 | ✅ |
| Consumo de APIs REST, TanStack Query | 4 | ✅ |
| **Kotlin real (Gradle, Compose, coroutines, Keystore)** | 5–10 | 🟡 |
| **Swift real (CocoaPods, SwiftUI, Keychain) — verificado en CI sin Mac** | 5–11 | 🟡 |
| New Architecture: Fabric, TurboModules, JSI, Codegen | 8, 9 | 🟡 |
| Testing (Jest/RNTL, JUnit, XCTest) | 3–4, 6, 10 | 🟡 |
| CI/CD nativo (Gradle + macOS runner) | 11 | 🔜 |

Leyenda: 🔜 planificado · 🟡 parcial · ✅ hecho. (Actualizar esta tabla al cerrar cada fase.)

---

## 📚 Documentos relacionados
- `CLAUDE.md` — guía operativa y flujo Git.
- `docs/01-flujo-git-github.md` — flujo Git/GitHub detallado.
- `docs/02-guia-deploy-y-ci.md` — deploy y CI (incluye cómo compilar Swift sin Mac).
- `docs/03-arquitectura-y-buenas-practicas.md` — arquitectura, SOLID, convenciones.
- `docs/05-tutorial-proyecto-completo.md` — tutorial del estado actual (documento vivo).
- `docs/06-guia-entrevista.md` — guía de entrevista y banco de preguntas.
- `docs/07-capa-nativa-kotlin-swift.md` — guía de aprendizaje de la capa nativa.
- `docs/design/` — handoff de diseño de Índigo.
