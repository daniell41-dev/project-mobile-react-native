# 05 - TUTORIAL DEL PROYECTO COMPLETO

> **Documento vivo.** Se actualiza al cerrar cada fase (ver `docs/04-roadmap-y-fases.md`) para
> reflejar qué hay construido y cómo funciona. Sirve como recorrido guiado del repo para quien
> se una al proyecto (o para repasar antes de una entrevista).

## Estado actual

**Bloque A (fundación JS/UI) completo: FASES 0–4.** El Bloque B (capa nativa Kotlin/Swift,
FASES 5–11) es el eje del proyecto y ya tiene cinco módulos nativos reales (FASES 6–10) — ver
`docs/04-roadmap-y-fases.md`.

| Fase | Contenido | Estado |
|---|---|---|
| FASE 0 | Bootstrap: docs, reglas, scaffold Expo + tooling + CI | ✅ |
| FASE 1 | Tokens morados, tema persistido, navegación (React Navigation) | ✅ |
| FASE 2 | Autenticación real (mock): StorageService, authStore, LoginScreen | ✅ |
| FASE 3 | Fidelidad visual de las 11 pantallas contra el handoff | ✅ |
| FASE 4 | Charts reales en Análisis + capa REST (repos + TanStack Query) | ✅ |
| FASE 5 | Fundamentos nativos: prebuild, recorrido Gradle/Xcode, config plugin propio | ✅ |
| FASE 6 | Módulo nativo `indigo-biometrics`: Kotlin (BiometricPrompt) + Swift (LAContext) | ✅ |
| FASE 7 | Módulo nativo `indigo-secure-store`: Keystore + `EncryptedSharedPreferences` / Keychain | ✅ |
| FASE 8 | Módulo nativo `indigo-card-view`: vista Fabric, Jetpack Compose + SwiftUI | ✅ |
| FASE 9 | TurboModule "bare" `indigo-device`: sin Expo Modules API, Codegen verificado local | ✅ |
| FASE 10 | Módulo nativo `indigo-connectivity`: `callbackFlow`/`AsyncStream` como evento suscribible | ✅ |

---

## Cómo está organizado el repo

```
src/
├── bootstrap/         # Entrada de la app: App.tsx, providers, navegación
│   ├── App.tsx         # Carga de fuentes + restoreSession() + providers + NavigationContainer
│   ├── providers/       # ThemeProvider, QueryProvider
│   └── navigation/      # RootNavigator, AuthNavigator, TabNavigator, stacks/, types.ts
├── core/
│   ├── models/          # Transaction, Card, Contact, User, ...
│   ├── services/        # DataService (facade mock), AuthService, StorageService
│   ├── repositories/     # TransactionRepository (Strategy: InMemory/Http) + Adapter DTO
│   ├── queries/          # Hooks de TanStack Query (useTransactionsQuery)
│   ├── stores/           # Zustand: authStore, themeStore
│   └── config/           # env.ts (apiBaseUrl, useMockApi)
├── shared/
│   ├── components/       # AppText, BalanceCard, TransactionRow, NumericKeypad, ...
│   ├── hooks/             # useTheme
│   ├── utils/             # formatCurrency, groupByDay, applyNumericKey
│   └── testing/           # renderWithProviders (helper de test)
├── features/              # Una carpeta por feature; pantallas
│   └── {auth,home,transactions,send,cards,stats,profile,notifications}/screens/
└── theme/                 # tokens.ts (paleta morada), typography.ts, themes.ts

docs/                      # Reglas del proyecto (léelas en orden: 01 → 07)
docs/design/                # Handoff de diseño de Índigo (prototipo, capturas, tokens)
plugins/withIndigo.ts       # Config plugin propio (FASE 5): permisos Android/iOS
modules/                    # (a partir de la FASE 6) código nativo propio, Kotlin y Swift
android/, ios/               # Generados por `expo prebuild` (CNG) — en .gitignore, no versionan
```

## Decisión de nombres: `src/bootstrap/`, no `src/app/`

Expo CLI trata cualquier carpeta llamada `app` (incluida `src/app`) como raíz de **Expo
Router**, activando el modo de renderizado estático de rutas por archivos. Este proyecto usa
**React Navigation explícito** a propósito (ver `docs/06-guia-entrevista.md`), así que el punto
de entrada vive en `src/bootstrap/` para evitar la colisión con esa convención.

## Navegación

`RootNavigator` conmuta entre `AuthNavigator` (Onboarding, Login) y `TabNavigator` (5 tabs)
según `authStore.status`, sin navegación imperativa. Cada tab tiene su propio `native-stack`
para soportar rutas push (`TxDetail`, `Send → SendDone`, `Notifications`) manteniendo la tab
bar visible. Todo tipado vía `declare global { namespace ReactNavigation { interface
RootParamList ... } } }` en `src/bootstrap/navigation/types.ts`.

## Autenticación

Mock (no hay backend): `AuthService.login()` genera un token y lo persiste vía
`StorageService` (interfaz propia). `authStore.restoreSession()` se llama una vez al arrancar
`App.tsx` y gatea el splash screen junto con la carga de fuentes — así la sesión persiste entre
reinicios sin parpadeo Login→Home. Desde la FASE 7, `StorageService` está respaldado por
`modules/indigo-secure-store` (Keystore/Keychain reales, ver `docs/07` sección 4.2) — el cambio
de `AsyncStorage` a almacenamiento cifrado nativo no tocó ni una línea de `AuthService` ni de
ninguna pantalla (DIP puro).

## Datos y capa REST

`DataService` es un facade con los datos mock de usuario, contactos, tarjetas, categorías y
notificaciones. Las **transacciones** tienen su propia capa (`core/repositories/`) porque son
las únicas que fluyen por un patrón Strategy real: `TransactionRepository` (interfaz) +
`InMemoryTransactionRepository` (activa, `env.useMockApi = true`) / `HttpTransactionRepository`
(escrita y probada, lista para un backend real) + `transactionFromDto` (Adapter, centavos →
decimal). Las pantallas consumen `useTransactionsQuery()` (TanStack Query) — cambiar de mock a
HTTP real es un solo flag en `core/config/env.ts`.

## Charts

`StatsScreen` usa `react-native-gifted-charts` (sobre `react-native-svg`): `PieChart` en modo
donut para el gasto por categoría y `BarChart` para la tendencia mensual, con el mes activo
resaltado en morado.

## Fundamentos nativos (FASE 5)

`npx expo prebuild --clean` genera `android/` e `ios/` a partir de `app.json` + `plugins/` +
`modules/` (CNG — Continuous Native Generation, ambos gitignored). Recorrido completo del árbol
generado, archivo por archivo, en `docs/07-capa-nativa-kotlin-swift.md` (secciones 2 y 3).

`plugins/withIndigo.ts` es el primer config plugin propio: agrega los permisos que van a
necesitar los módulos nativos de las FASES 6+ (`CAMERA`, `USE_BIOMETRIC` en Android;
`NSCameraUsageDescription`, `NSFaceIDUsageDescription` en iOS) escribiendo directamente los
mods `withAndroidManifest`/`withInfoPlist`, verificado inspeccionando el manifest/plist que
genera `expo prebuild`.

## Módulo nativo: biometría (FASE 6)

`modules/indigo-biometrics` es el primer módulo con Expo Modules API: `isAvailable()` y
`authenticate(reason)`, Kotlin real (`BiometricPrompt` + corrutinas) y Swift real
(`LAContext` + `withCheckedContinuation`), detrás de `core/services/biometrics.service.ts`
(alias `@modules/*`). Se usa de verdad en el toggle "Seguridad y biometría" de `ProfileScreen`
— no es un módulo sin consumir. Recorrido completo, con las decisiones de diseño (por qué
`authenticate` resuelve en vez de rechazar, por qué `biometryType` es genérico en Android pero
específico en iOS), en `docs/07-capa-nativa-kotlin-swift.md` sección 4.1.

## Módulo nativo: almacenamiento seguro (FASE 7)

`modules/indigo-secure-store` reemplaza la implementación de `StorageService` para el token de
sesión: Android Keystore + `EncryptedSharedPreferences` (AES-256-GCM) en Kotlin, Keychain
(`SecItemAdd`/`SecItemCopyMatching`/`SecItemUpdate`/`SecItemDelete`) en Swift. Es el ejemplo de
libro de Strategy + DIP del proyecto — `AuthService` sigue exactamente igual que en la FASE 2,
solo cambió qué hay detrás de la interfaz `StorageService`. `theme.store.ts` sigue en
`AsyncStorage` a propósito: no todo dato necesita pasar por Keystore/Keychain, solo lo sensible.
En web cae a `localStorage` (sin cifrar, solo para que la demo funcione punta a punta) —
verificado con Playwright: login, recarga de página, la sesión sigue activa. Detalle completo en
`docs/07-capa-nativa-kotlin-swift.md` sección 4.2.

## Módulo nativo: vista de la tarjeta (FASE 8)

`modules/indigo-card-view` es la primera **vista** nativa del proyecto (no una función): un
`ExpoView` clásico con un `ComposeView` embebido en Android y un `UIHostingController` embebido
en iOS, con props (`holderName`, `last4`, `frozen`, `accentColor`) y un evento nativo→JS
(`onPress`). `CardVisual` pasó de ser 100% React Native a un adaptador delgado sobre esta vista.
Verificado con Playwright sobre el fallback web (Fabric no existe en RN Web): togglear
"Congelar tarjeta" en `CardsScreen` actualiza la tarjeta en vivo con "CONGELADA", probando que el
flujo de props funciona de punta a punta — el render nativo real de Compose/SwiftUI queda para
cuando haya un dispositivo/emulador o CI (FASE 11). Decisiones de diseño (por qué se eligió la
API clásica de vistas sobre la más nueva basada en `coreFeatures: compose`) en
`docs/07-capa-nativa-kotlin-swift.md` sección 4.3.

## Módulo nativo "bare" sin Expo Modules API (FASE 9)

`modules/indigo-device` es distinto a los tres anteriores: no usa Expo Modules API en
absoluto. Es el camino "de verdad" de React Native — spec TypeScript, `codegenConfig` en el
`package.json` raíz, Codegen genera la clase Kotlin/el protocolo Objective-C++, y la
implementación + el registro (`MainApplication.kt`, `.pbxproj`) se hacen a mano vía
`plugins/withIndigoDevice.ts`. `getDeviceName()`/`isTablet()` son síncronos (posible gracias a
JSI, imposible con el bridge legado) y `getBatteryLevelAsync()` es async. Verificado corriendo
el propio script de Codegen de React Native localmente (`node node_modules/react-native/
scripts/generate-codegen-artifacts.js`, no necesita Android SDK ni Xcode) — la implementación
está escrita contra la salida real que generó, no contra una suposición. También se verificó
que `expo prebuild` deja `MainApplication.kt` y el `.pbxproj` correctamente modificados.
Detalle completo, incluyendo por qué iOS no necesita tocar `AppDelegate.swift` pero Android sí,
en `docs/07-capa-nativa-kotlin-swift.md` sección 4.4.

## Módulo nativo con eventos: conectividad (FASE 10)

`modules/indigo-connectivity` vuelve a Expo Modules API, pero es el primer módulo del proyecto
que expone un **stream continuo** en vez de funciones puntuales: el estado de la red cambia solo,
sin que JS lo pida. Kotlin envuelve `ConnectivityManager.NetworkCallback` (basado en callbacks) en
un `Flow` frío con `callbackFlow { ... awaitClose { } }`; Swift hace exactamente lo mismo con
`NWPathMonitor` y `AsyncStream`. Ambos se conectan al sistema de eventos de Expo Modules
(`Events("onConnectivityChange")` + `OnStartObserving`/`OnStopObserving` + `sendEvent(...)`), que
arranca y para el monitor nativo real según haya o no listeners JS activos. Del lado TS, es el
primer módulo que declara `NativeModule<TEventsMap>` con un evento tipado (los anteriores usan
`NativeModule<{}>`), así que `addListener`/`emit` quedan tipados de punta a punta.

El fallback web es distinto al de los módulos anteriores: en vez de un stub "no disponible" fijo
(no hay Face ID ni Keystore en un navegador), aquí sí hay una señal real —
`navigator.onLine` + eventos `online`/`offline` de `window` — así que `IndigoConnectivity.web.ts`
dispara el mismo evento `onConnectivityChange` que el lado nativo. `core/services/
connectivity.service.ts` + `shared/hooks/useConnectivity.ts` + un `OfflineBanner` montado una vez
en `App.tsx` (visible en las 10 pantallas sin tocarlas una por una) consumen ese stream.
Verificado en vivo con Playwright alternando `context.setOffline(true/false)` sobre la demo web:
el banner "Sin conexión a internet" aparece y desaparece en tiempo real. Detalle completo,
incluyendo un desajuste de tipos real en `registerWebModule` de `expo-modules-core` (declara que
devuelve la clase, pero en runtime devuelve una instancia) y cómo se corrigió con un cast
documentado, en `docs/07-capa-nativa-kotlin-swift.md` sección 4.5.

## Qué se puede verificar en este entorno (sin Mac, sin emulador Android)

- Lint, typecheck y tests JS: `pnpm lint && pnpm typecheck && pnpm test:ci`.
- Export web (`pnpm build:web`) + captura con Playwright para fidelidad visual — así se ha
  verificado cada fase hasta ahora (flujo completo Onboarding → Login → tabs → Enviar →
  Análisis, en claro y oscuro).
- `expo prebuild`: sí, genera el árbol nativo completo sin problema.
- Autolinking de módulos propios: `npx expo-modules-autolinking resolve --platform
  android|ios --json` — confirma que Gradle/CocoaPods van a encontrar el módulo sin necesitar
  compilar.
- Gradle/Kotlin: **parcial en este contenedor concreto** — no hay Android SDK ni acceso a
  `dl.google.com` (bloqueado por el proxy de salida), así que `./gradlew assembleDebug`/`test`
  no compilan aquí, aunque `gradlew --version` sí arranca. Detalle y la razón exacta en
  `docs/07` sección 2 y `docs/02` PARTE 4.1. Se verifica de verdad en `android.yml` (FASE 11).
- Swift: **no localmente** — se compila y testea en el workflow `ios.yml` sobre `macos-latest`
  (ver `docs/02-guia-deploy-y-ci.md`).

---

*(A partir de la FASE 5 esta sección se amplía con el recorrido de la capa nativa: qué hace
cada archivo generado por `expo prebuild`, y un apartado por cada módulo de `modules/` con su
Kotlin y su Swift.)*
