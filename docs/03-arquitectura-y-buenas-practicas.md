# 03 - ARQUITECTURA Y BUENAS PRÁCTICAS

Reglas de estructura, arquitectura y calidad de código para **Índigo** (Expo SDK 57 + React
Native 0.86 + TypeScript + React Navigation 7). El objetivo es un código **limpio, modular y de
bajo acoplamiento**, aplicando **SOLID**, patrones **GoF** y principios **DRY / KISS / YAGNI** —
tanto en la capa TypeScript como en la capa nativa (Kotlin/Swift).

---

## 🧱 Estructura de carpetas (Clean / por capas)

```
.
├── modules/                    # Código nativo PROPIO (Kotlin + Swift). Se versiona.
│   ├── indigo-biometrics/
│   │   ├── android/            # Kotlin, build.gradle propio
│   │   ├── ios/                # Swift, .podspec propio
│   │   ├── src/                # superficie TypeScript (tipos + wrapper)
│   │   └── expo-module.config.json
│   ├── indigo-secure-store/
│   ├── indigo-card-view/
│   └── indigo-device/
├── plugins/                    # Config plugins TS (permisos, manifest, Info.plist)
├── src/
│   ├── bootstrap/               # Punto de entrada de la app (NO se llama "app": Expo CLI
│   │   │                        # trata cualquier carpeta "app"/"src/app" como raíz de
│   │   │                        # Expo Router, y este proyecto usa React Navigation explícito)
│   │   ├── App.tsx              # Providers + NavigationContainer
│   │   ├── providers/           # ThemeProvider, QueryProvider
│   │   └── navigation/          # RootNavigator, AuthNavigator, TabNavigator, stacks/, types.ts
│   ├── core/                   # Lógica singleton de toda la app
│   │   ├── models/             # Transaction, Card, Contact, User, ...
│   │   ├── services/           # AuthService, ThemeService, BiometricsService, ...
│   │   ├── repositories/       # Interfaces + InMemory*/Http* (Strategy) + adapters
│   │   ├── stores/             # Zustand: authStore, themeStore, sendStore
│   │   └── constants/
│   ├── shared/                 # Reutilizable y SIN estado de negocio (presentacional)
│   │   ├── components/         # BalanceCard, NumericKeypad, TransactionRow, ...
│   │   ├── hooks/               # useTheme, useCurrency, useToggle
│   │   └── utils/                # formatCurrency, groupByDay
│   ├── features/               # Una carpeta por feature; pantallas
│   │   ├── auth/screens/       # OnboardingScreen, LoginScreen
│   │   ├── home/ transactions/ send/ cards/ stats/ profile/ notifications/
│   └── theme/                  # tokens.ts, typography.ts, themes.ts
├── android/  ios/              # Generados por `expo prebuild` (CNG) — .gitignore, NO se editan a mano
└── docs/
```

### Reglas de dependencia (bajo acoplamiento)

```
features  ──►  shared  ──►  (React Native / RN core)
   │
   └────────►  core  ──►  modules/* (SOLO a través de core/services)
```

- `features` puede usar `core` y `shared`.
- `shared` **no** depende de `features` ni de `core/stores` (es presentacional y genérico).
- `core` no depende de `features`.
- **Prohibido** importar entre features hermanas (p. ej. `home` importando de `cards`). Si algo
  se comparte, sube a `shared` (UI) o `core` (lógica/datos).
- **Ninguna pantalla ni componente importa `modules/*` directamente.** Todo módulo nativo se
  envuelve en un servicio de `core/services/` (Adapter) — es lo que permite mockearlo en la demo
  web y cambiar de implementación (p. ej. `expo-secure-store` → Keystore/Keychain propios) sin
  tocar consumidores (DIP).

---

## 📛 Convenciones de nombres

| Tipo | Sufijo / patrón | Ejemplo |
|------|-----------------|---------|
| Pantalla | `*.screen.tsx` | `home.screen.tsx` |
| Componente | `*.component.tsx` | `balance-card.component.tsx` |
| Servicio | `*.service.ts` | `auth.service.ts` |
| Store (Zustand) | `*.store.ts` | `auth.store.ts` |
| Modelo / interfaz | `*.model.ts` | `transaction.model.ts` |
| Repositorio | `*.repository.ts` | `transaction.repository.ts` |
| Hook | `use*.ts` | `useCurrency.ts` |
| Módulo nativo (TS) | `*.types.ts` / `index.ts` | `IndigoBiometrics.types.ts` |
| Módulo nativo (Kotlin) | `PascalCase.kt` | `IndigoBiometricsModule.kt` |
| Módulo nativo (Swift) | `PascalCase.swift` | `IndigoBiometricsModule.swift` |

- **Archivos y carpetas TS:** `kebab-case`. **Módulos nativos:** `PascalCase` (convención Kotlin/Swift).
- **Clases/componentes:** `PascalCase`. **Variables/métodos:** `camelCase`. **Constantes
  globales:** `UPPER_SNAKE_CASE`.
- Una responsabilidad pública por archivo.

---

## 🧭 Navegación (React Navigation, explícito)

- **Sin expo-router.** Se usa la API explícita de React Navigation 7
  (`createNativeStackNavigator`, `createBottomTabNavigator`) porque es la que se evalúa en
  entrevistas de React Native — expo-router es una capa de rutas por archivos construida
  *encima* de React Navigation, no un competidor (ver `docs/06-guia-entrevista.md`).
- `RootNavigator` conmuta entre `AuthNavigator` (Onboarding, Login) y `TabNavigator`
  (autenticado) según `authStore.isAuthenticated` — sin navegación imperativa para el login.
- `TabNavigator` con 5 tabs (Inicio, Movimientos, Tarjetas, Análisis, Perfil); cada tab es un
  `NativeStack` propio para soportar rutas push (`TxDetail`, `Send → SendDone`,
  `Notifications`) manteniendo la tab bar.
- Todas las `ParamList` tipadas (`RootStackParamList`, `TabParamList`, `HomeStackParamList`, …) y
  registradas en `declare global { namespace ReactNavigation { interface RootParamList … } } }`
  para que `navigation.navigate(...)` sea type-safe en toda la app.

---

## 🧩 Patrón de componentes: contenedor vs presentacional

- **Pantallas (`features/*`) = contenedoras:** obtienen datos de servicios/stores (`core`),
  manejan navegación y orquestan. Poca o ninguna lógica de presentación compleja.
- **Componentes (`shared/*`) = presentacionales:** reciben datos por props, emiten eventos por
  callbacks. **Sin** acceso a servicios/stores. Reutilizables y testeables de forma aislada.

Componentes compartidos previstos: `BalanceCard`, `NumericKeypad`, `TransactionRow`,
`QuickAction`, `CardVisual` (envuelve la vista nativa Compose/SwiftUI de `indigo-card-view`),
`SectionHeader`, `ListRow`, `Screen`, `AppText`.

---

## 🛠️ Servicios (capa `core/services`)

- Un servicio = una responsabilidad (SRP). Ejemplos:
  - `DataService` — datos mock es-MX/MXN (usuario, transacciones, contactos, tarjetas,
    categorías). Equivalente a `docs/design/prototipo/data.js`.
  - `ThemeService` — modo claro/oscuro, respeta `useColorScheme()`, persiste preferencia.
  - `StorageService` — abstracción de almacenamiento. Empieza sobre `AsyncStorage`; en la fase
    de capa nativa se enchufa `modules/indigo-secure-store` (Keystore/Keychain) detrás de la
    **misma interfaz** (Strategy/DIP), sin tocar consumidores.
  - `BiometricsService` — envuelve `modules/indigo-biometrics` (Adapter). En web devuelve
    "no disponible" sin romper.
  - `AuthService` / `authStore` — estado de autenticación usado por `RootNavigator`.
- Exponer estado como stores de Zustand o hooks de solo lectura; mutaciones solo dentro del
  servicio/store (encapsulación).

---

## 📱 Capa nativa (Kotlin / Swift) — reglas

- **Todo módulo nuevo empieza como módulo local de Expo**
  (`npx create-expo-module@latest --local`), que genera Kotlin y Swift lado a lado en
  `modules/<nombre>/` con su propio `build.gradle` / `.podspec` y se auto-enlaza. Solo se usa un
  TurboModule "bare" con Codegen cuando el objetivo explícito es aprender ese camino (ver
  `docs/07-capa-nativa-kotlin-swift.md`).
- **Kotlin y Swift equivalentes siempre**, aunque el proyecto no tenga Mac local: el Swift se
  compila y testea en CI (`macos-latest`, ver `docs/02`).
- Cada módulo expone una superficie TS mínima y tipada (`src/index.ts` + `*.types.ts`); el resto
  de la app nunca importa el módulo directamente, siempre a través de un servicio de
  `core/services` (Adapter + DIP).
- Lógica de negocio nativa (parsers, validaciones) va en el propio lenguaje nativo, no se
  "resuelve" pasando datos crudos a JS y de vuelta — el objetivo es escribir Kotlin/Swift real,
  no un mínimo puente.
- Cambios que requieran tocar el manifest de Android o el `Info.plist`/entitlements de iOS de
  forma persistente van en un **config plugin** (`plugins/`), nunca editando `android/`/`ios/` a
  mano (se pierde en el próximo `expo prebuild`).

---

## 💵 Formato de moneda y locale (es-MX / MXN)

```ts
new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
```

Envuelto en `shared/utils/formatCurrency.ts`. Los montos usan la fuente **Sora** con
`fontVariant: ['tabular-nums']` (ver tokens en `docs/design/README.md`).

---

## 🎨 Estilos y theming

- **Design tokens** en `src/theme/tokens.ts` (paleta morada, radios, espaciado, sombras) +
  `typography.ts` (Plus Jakarta Sans / Sora) + `themes.ts` (`darkTheme` / `lightTheme`).
  Fuente de verdad: `docs/design/README.md` y `docs/design/prototipo/styles.css` (colores
  reemplazados por la paleta morada de Índigo).
- `StyleSheet.create` por componente/pantalla; `useTheme()` para leer tokens según el tema
  activo. Nada de estilos "mágicos" fuera de `theme/`.
- Hit targets mínimos **44px**.

---

## 🧪 Testing

- **JS/TS:** Jest (`jest-expo`) + `@testing-library/react-native`. Probar: utils (formato de
  moneda, agrupación por día), stores, servicios (con módulos nativos mockeados), componentes
  presentacionales (props → render), smoke test de navegación.
- **Kotlin:** JUnit en `modules/<nombre>/android/src/test/`. `./gradlew test`.
- **Swift:** XCTest en `modules/<nombre>/ios/Tests/`. Se corre en CI (`macos-latest`).
- `pnpm test:ci` en local/CI para la parte JS; `./gradlew test` para Kotlin; XCTest solo vía CI.
- Apuntar a cubrir la lógica de negocio; no perseguir 100% en pantallas triviales (YAGNI).

---

## 📐 Principios aplicados

### SOLID
- **S**RP — cada clase/servicio/módulo, una responsabilidad.
- **O**CP — extender vía nuevos componentes/servicios/módulos, no modificando los existentes.
- **L**SP — implementaciones intercambiables tras una interfaz (p. ej. `StorageService`:
  AsyncStorage ↔ Keystore/Keychain).
- **I**SP — interfaces pequeñas y específicas (modelos por dominio, superficie TS mínima por
  módulo nativo).
- **D**IP — depender de abstracciones (servicios/interfaces), no de implementaciones (módulos
  nativos concretos, plugins).

### Patrones GoF útiles aquí
- **Singleton** — stores de Zustand, servicios.
- **Strategy** — distintas implementaciones de `StorageService` (AsyncStorage vs. Keystore/Keychain).
- **Facade** — `DataService` como fachada de los datos mock/API.
- **Observer** — Zustand/TanStack Query como reactividad.
- **Adapter** — envolver cada módulo nativo (`modules/*`) tras un servicio de `core/services`.

### DRY / KISS / YAGNI
- **DRY** — extraer lógica/UI repetida a `shared` o `core`.
- **KISS** — la solución más simple que funcione; evitar abstracciones prematuras.
- **YAGNI** — no construir lo que aún no se necesita.

---

## ✅ Definition of Done (por tarea)

- [ ] Cumple la estructura de carpetas y convenciones de nombres.
- [ ] `pnpm lint && pnpm typecheck` sin errores.
- [ ] Si toca capa nativa: Kotlin **y** Swift equivalentes; `./gradlew assembleDebug` OK local;
      CI de `ios.yml` en verde.
- [ ] Respeta design tokens (claro/oscuro) y navegación tipada.
- [ ] Lógica de negocio en servicios/stores; UI reutilizable en `shared`.
- [ ] Tests unitarios de la lógica nueva (cuando aplique).
- [ ] Sin `console.log` de debug ni código muerto.
- [ ] Commit con Conventional Commits.

---

> Este documento es la referencia de arquitectura. El **qué** construir (pantallas, tokens,
> mapeo a componentes) está en `docs/design/README.md`. El **cómo aprender** la capa nativa está
> en `docs/07-capa-nativa-kotlin-swift.md`.
