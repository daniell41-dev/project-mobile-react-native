# 05 - TUTORIAL DEL PROYECTO COMPLETO

> **Documento vivo.** Se actualiza al cerrar cada fase (ver `docs/04-roadmap-y-fases.md`) para
> reflejar qué hay construido y cómo funciona. Sirve como recorrido guiado del repo para quien
> se una al proyecto (o para repasar antes de una entrevista).

## Estado actual

**Bloque A (fundación JS/UI) completo: FASES 0–4.** El Bloque B (capa nativa Kotlin/Swift,
FASES 5–11) es el siguiente y es el eje del proyecto — ver `docs/04-roadmap-y-fases.md`.

| Fase | Contenido | Estado |
|---|---|---|
| FASE 0 | Bootstrap: docs, reglas, scaffold Expo + tooling + CI | ✅ |
| FASE 1 | Tokens morados, tema persistido, navegación (React Navigation) | ✅ |
| FASE 2 | Autenticación real (mock): StorageService, authStore, LoginScreen | ✅ |
| FASE 3 | Fidelidad visual de las 11 pantallas contra el handoff | ✅ |
| FASE 4 | Charts reales en Análisis + capa REST (repos + TanStack Query) | ✅ |

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
modules/                    # (a partir de la FASE 5) código nativo propio, Kotlin y Swift
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
`StorageService` (interfaz propia sobre `AsyncStorage`). `authStore.restoreSession()` se llama
una vez al arrancar `App.tsx` y gatea el splash screen junto con la carga de fuentes — así la
sesión persiste entre reinicios sin parpadeo Login→Home. En la FASE 7 `StorageService` cambia
de implementación (Keystore/Keychain) sin tocar `AuthService` ni ninguna pantalla (DIP).

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

## Qué se puede verificar en este entorno (sin Mac, sin emulador Android)

- Lint, typecheck y tests JS: `pnpm lint && pnpm typecheck && pnpm test:ci`.
- Export web (`pnpm build:web`) + captura con Playwright para fidelidad visual — así se ha
  verificado cada fase hasta ahora (flujo completo Onboarding → Login → tabs → Enviar →
  Análisis, en claro y oscuro).
- Gradle/Kotlin (a partir de la FASE 5): `./gradlew assembleDebug && ./gradlew test` (Android
  SDK command-line tools, sin Android Studio).
- Swift (a partir de la FASE 5): **no localmente** — se compila y testea en el workflow
  `ios.yml` sobre `macos-latest` (ver `docs/02-guia-deploy-y-ci.md`).

---

*(A partir de la FASE 5 esta sección se amplía con el recorrido de la capa nativa: qué hace
cada archivo generado por `expo prebuild`, y un apartado por cada módulo de `modules/` con su
Kotlin y su Swift.)*
