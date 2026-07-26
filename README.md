# project-mobile-react-native — Índigo

Aplicación móvil de banca personal construida con **React Native (Expo SDK 57) + TypeScript**,
hermana del proyecto [`project-mobile-ionic`](https://github.com/daniell41-dev/project-mobile-ionic)
(mismo producto, stack Ionic/Angular). Proyecto de portafolio orientado a demostrar dominio de
React Native de punta a punta — **incluyendo la capa nativa en Kotlin (Android) y Swift (iOS)**.

## Por qué existe

No es solo "la misma app en otro framework". El eje de este repo es la capa nativa: cada
funcionalidad sensible (biometría, almacenamiento seguro, vista de tarjeta) se implementa dos
veces — **Kotlin real** con Gradle, y **Swift real** compilado en CI sin necesidad de una Mac local
(ver `docs/02-guia-deploy-y-ci.md`). El objetivo es poder trabajar cómodamente tanto en Android
como en iOS nativo, no solo en la capa JS.

## Stack

| Capa | Tecnología |
|------|------------|
| Runtime | Expo SDK 57 · React Native 0.86 (New Architecture: Fabric + TurboModules + JSI) |
| Lenguaje | TypeScript 5.9 (`strict`) |
| Navegación | React Navigation 7 (`native-stack` + `bottom-tabs`), explícito |
| Estado | Zustand 5 (local) · TanStack Query 5 (servidor) |
| Nativo Android | **Kotlin** · Expo Modules API · Gradle · Jetpack Compose · Keystore |
| Nativo iOS | **Swift** · Expo Modules API · CocoaPods · SwiftUI · Keychain |
| Testing | Jest (`jest-expo`) + Testing Library · JUnit (Android) · XCTest (iOS) |
| Paquetes | **pnpm** (obligatorio, ver `.npmrc`) |

## Marca

**Índigo** — banca personal, mercado es-MX, moneda MXN, tema claro/oscuro, acento morado
`#820AD1` (inspirado en la paleta de Nubank). El diseño (10 pantallas, 5 tabs, tokens y mapeo a
componentes) está en [`docs/design/README.md`](./docs/design/README.md), adaptado del handoff
original de Ionic.

## Puesta en marcha

```bash
pnpm install
pnpm start          # Metro / Expo dev server
pnpm android         # build + run en emulador/dispositivo Android
pnpm web             # correr en navegador (útil sin dispositivo)
pnpm lint
pnpm typecheck
pnpm test:ci
```

Ver `docs/01-flujo-git-github.md` para el flujo de ramas y `docs/02-guia-deploy-y-ci.md` para
builds nativos (Android local, iOS en CI sin Mac, EAS Build).

## Documentación / Reglas del proyecto

| Documento | Contenido |
|-----------|-----------|
| [`docs/01-flujo-git-github.md`](./docs/01-flujo-git-github.md) | Flujo Git/GitHub: ramas, commits, PRs |
| [`docs/02-guia-deploy-y-ci.md`](./docs/02-guia-deploy-y-ci.md) | Deploy (EAS, Gradle, iOS sin Mac vía CI) |
| [`docs/03-arquitectura-y-buenas-practicas.md`](./docs/03-arquitectura-y-buenas-practicas.md) | Arquitectura, estructura, SOLID / DRY / KISS |
| [`docs/04-roadmap-y-fases.md`](./docs/04-roadmap-y-fases.md) | Roadmap de fases (regla) |
| [`docs/05-tutorial-proyecto-completo.md`](./docs/05-tutorial-proyecto-completo.md) | Tutorial del estado actual (documento vivo) |
| [`docs/06-guia-entrevista.md`](./docs/06-guia-entrevista.md) | Guía de entrevista Mobile React Native |
| [`docs/07-capa-nativa-kotlin-swift.md`](./docs/07-capa-nativa-kotlin-swift.md) | **Aprendizaje nativo: Kotlin y Swift a fondo** |
| [`docs/design/`](./docs/design/) | Handoff de diseño de Índigo (pantallas, tokens, prototipo) |
| [`CLAUDE.md`](./CLAUDE.md) | Guía operativa rápida |

> **Gestor de paquetes: pnpm** (no usar npm/yarn).
