# CLAUDE.md

Guía operativa para Claude (y cualquier dev) en este repositorio. Léela antes de trabajar.

## Proyecto

**Índigo** — app móvil de banca personal, hermana de `project-mobile-ionic`. Stack:
**Expo SDK 57 · React Native 0.86 (New Architecture) · TypeScript · React Navigation 7**.
Mercado es-MX, moneda MXN, tema claro/oscuro, acento morado `#820AD1`.

**El eje de este proyecto es la capa nativa.** Cada funcionalidad sensible se implementa en
**Kotlin** (Android) y **Swift** (iOS) de verdad, no solo se instala un paquete. Ver
`docs/04-roadmap-y-fases.md` (roadmap) y `docs/07-capa-nativa-kotlin-swift.md` (guía de
aprendizaje nativo, crece con cada fase).

El diseño objetivo (10 pantallas, 5 tabs, tokens, prompt de construcción) está en
`docs/design/README.md`.

## Gestor de paquetes: pnpm (obligatorio)

⚠️ **Usa siempre `pnpm`, nunca `npm` ni `yarn`.** El lockfile es `pnpm-lock.yaml`.

```bash
pnpm install         # instalar dependencias
pnpm start           # Metro / Expo dev server
pnpm android          # build + run Android (local, requiere SDK)
pnpm ios              # build + run iOS (requiere macOS; en CI ver docs/02)
pnpm web              # correr en navegador
pnpm build:web        # export estático web → ./dist (demo / verificación sin dispositivo)
pnpm lint             # ESLint
pnpm typecheck        # tsc --noEmit
pnpm test             # Jest (watch)
pnpm test:ci           # Jest headless (CI)
```

Nativo: `npx expo prebuild` regenera `android/` e `ios/` (ambos en `.gitignore` — es CNG,
Continuous Native Generation). Lo que se versiona es `modules/` (código nativo Kotlin/Swift
propio) y `plugins/` (config plugins TS). Nunca edites `android/`/`ios/` a mano de forma
permanente: cualquier cambio nativo persistente va en `modules/` o `plugins/`.

## Antes de terminar una tarea

Ejecuta y deja en verde:

```bash
pnpm lint && pnpm typecheck && pnpm test:ci && pnpm build:web
```

En tareas de capa nativa (Kotlin), además:

```bash
npx expo prebuild --clean && cd android && ./gradlew assembleDebug && ./gradlew test
```

(Swift se verifica en CI sobre `macos-latest`, ver `docs/02-guia-deploy-y-ci.md` — no hay Mac
local en este entorno. **Desde la FASE 5:** este contenedor remoto tampoco tiene Android SDK ni
acceso a `dl.google.com` — `./gradlew assembleDebug`/`test` no se puede ejecutar de punta a punta
aquí; detalle en `docs/02` PARTE 4.1 y `docs/07` sección 2. En ese caso, confirma que
`expo prebuild --clean` genera el proyecto sin error y deja la compilación real a
`.github/workflows/android.yml`.)

## Convenciones

- **Commits:** Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`).
  Ver `docs/01-flujo-git-github.md`.
- **Ramas:** `feature/<issue>-<desc>` desde `develop`; PR a `develop`; al cerrar bloque, PR
  `develop → main`.
- **Arquitectura y estilo:** `docs/03-arquitectura-y-buenas-practicas.md` (estructura
  `core/ shared/ features/ app/navigation`, React Navigation explícito, SOLID, DRY/KISS/YAGNI,
  design tokens, capa nativa siempre detrás de un servicio en `core/services`).
- **Deploy / CI:** `docs/02-guia-deploy-y-ci.md`.

## Entorno Claude Code on the web

- Cada sesión trabaja sobre su **rama de sesión asignada** y por defecto solo hace push a ella.
- **Excepción documentada y ya autorizada por el usuario:** el commit semilla inicial de este
  repo (README, CLAUDE.md, docs/) se empujó directo a `main` porque el repo estaba vacío (no
  existía ni `main`). A partir de ese commit, **nunca más** se pushea directo a `main`.

### Flujo de trabajo Git (OBLIGATORIO en cada tarea)

Claude sigue **siempre** este flujo, sin que el usuario tenga que pedirlo:

1. **Claude crea un issue** describiendo el trabajo a realizar (o el bug a corregir).
2. **Claude trabaja en una rama de tarea** (`feature/<n>-<desc>`, o la rama de sesión si el
   proxy no permite crear ramas nuevas) y commitea (Conventional Commits).
3. **Claude crea el PR: rama de tarea → `develop`** (referencia el/los issue con `Closes #N`).
4. **Claude mergea el PR a `develop`** y cierra el/los issue. Todo esto es automático, sin que
   el usuario tenga que pedirlo. ← *Claude llega solo hasta `develop`.*
5. Cuando `develop` está listo para producción (cierre de bloque/fase), Claude **avisa al
   usuario** y solo crea el PR **`develop` → `main`** si el usuario lo pide explícitamente.
   ← *este es el único PR que el usuario revisa y lleva a `main`.*

> **Regla clave:** Claude hace TODO automáticamente hasta `develop` (issue → commit → PR →
> merge a `develop`). La **única** acción que requiere al usuario es el paso final
> `develop → main`: Claude avisa cuando está listo y espera la petición explícita.

## Documentación del repo

- `docs/01-flujo-git-github.md` — flujo Git/GitHub.
- `docs/02-guia-deploy-y-ci.md` — deploy (EAS, Gradle, iOS sin Mac vía CI) y CI.
- `docs/03-arquitectura-y-buenas-practicas.md` — arquitectura, convenciones, SOLID.
- `docs/04-roadmap-y-fases.md` — **roadmap de fases (regla)**; léelo antes de trabajar.
- `docs/05-tutorial-proyecto-completo.md` — tutorial del estado actual (documento vivo).
- `docs/06-guia-entrevista.md` — guía de entrevista Mobile React Native.
- `docs/07-capa-nativa-kotlin-swift.md` — **guía de aprendizaje de la capa nativa** (Kotlin/Swift).
- `docs/design/` — handoff de diseño de Índigo (qué construir).
