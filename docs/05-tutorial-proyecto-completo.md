# 05 - TUTORIAL DEL PROYECTO COMPLETO

> **Documento vivo.** Se actualiza al cerrar cada fase (ver `docs/04-roadmap-y-fases.md`) para
> reflejar qué hay construido y cómo funciona. Sirve como recorrido guiado del repo para quien
> se una al proyecto (o para repasar antes de una entrevista).

## Estado actual

**Fase completada:** FASE 0 (bootstrap — documentación y reglas del proyecto).

Todavía no hay código de aplicación: este commit solo establece las reglas (`CLAUDE.md`,
`docs/`), el flujo Git y el handoff de diseño. El scaffold de Expo, la navegación, las pantallas
y la capa nativa se documentarán aquí a medida que se completen las fases 0b en adelante.

---

## Cómo está organizado el repo

- `docs/` — reglas del proyecto (léelas en orden: 01 → 07).
- `docs/design/` — handoff de diseño de Índigo (prototipo HTML/React de referencia visual,
  capturas, tokens). **No es código a copiar tal cual**, es la referencia de qué construir.
- `modules/` *(a partir de la FASE 5)* — código nativo propio, Kotlin y Swift.
- `src/` *(a partir de la FASE 0b)* — la app en TypeScript.

## Qué se puede verificar en este entorno (sin Mac, sin emulador Android)

- Lint, typecheck y tests JS: `pnpm lint && pnpm typecheck && pnpm test:ci`.
- Export web (`pnpm build:web`) + captura con Playwright para fidelidad visual.
- Gradle/Kotlin: `./gradlew assembleDebug && ./gradlew test` (Android SDK command-line tools,
  sin Android Studio).
- Swift: **no localmente** — se compila y testea en el workflow `ios.yml` sobre `macos-latest`
  (ver `docs/02-guia-deploy-y-ci.md`).

---

*(Esta sección se irá ampliando con un recorrido pantalla por pantalla, servicio por servicio y
módulo nativo por módulo nativo a medida que el roadmap avanza.)*
