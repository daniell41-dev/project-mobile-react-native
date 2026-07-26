# 01 - FLUJO GIT Y GITHUB

## 📖 Guía Completa del Workflow de Git Flow

Este documento explica el flujo de trabajo con Git y GitHub que se usará durante todo el
desarrollo del proyecto **Índigo** (Expo · React Native · TypeScript).

> **Stack:** Expo SDK 57 · React Native 0.86 · TypeScript · React Navigation 7 · **pnpm** como
> gestor de paquetes.

---

## 🌳 Estructura de Ramas

```
main (producción - protegida)
  ↑
  │ (PR al final de cada bloque/fase)
  │
develop (integración - default)
  ↑
  │ (PRs de cada tarea)
  │
feature/[issue-number]-[descripcion] (tareas individuales)
```

### Descripción de Ramas:

- **`main`**: Rama de producción
  - Solo código estable y probado
  - Origen de los builds nativos (EAS Build) y de la demo web
  - Protegida: solo acepta PRs de `develop`
  - Nunca se trabaja directamente aquí (excepción única y documentada: el commit semilla que
    creó el repo, con este mismo `main` vacío, ya autorizado explícitamente por el usuario)

- **`develop`**: Rama de desarrollo
  - Integración de todas las tareas
  - Rama por defecto del repositorio
  - Base para crear ramas `feature/*`
  - Siempre debe estar funcional (`lint + typecheck + test + build:web` OK)

- **`feature/[issue-number]-[descripcion]`**: Ramas de tareas
  - Una rama por tarea/issue
  - Se crean desde `develop`
  - Se fusionan de vuelta a `develop` vía PR
  - Se eliminan después del merge

---

## ☁️ Adaptación a Claude Code on the web

Este repositorio se desarrolla en parte con **Claude Code on the web**, donde cada sesión
trabaja sobre una **rama de sesión asignada** (p. ej. `claude/<nombre>`) y, por seguridad,
**por defecto solo puede hacer push a esa rama**.

Por eso, la convención práctica es:

| Quién | Hace |
|-------|------|
| **Claude (sesión web)** | Crea issue, crea rama `feature/*` desde `develop` (o reutiliza la rama de sesión si el proxy no permite crear ramas nuevas), commitea, abre PR a `develop`, lo mergea y cierra el issue — todo automático. |
| **Tú (mantenedor)** | Revisas `develop` cuando Claude avisa que un bloque/fase está cerrado y, si estás de acuerdo, pides explícitamente el PR `develop → main`. |

El flujo `develop + feature/* + PR` descrito abajo es el **estándar del proyecto**. La única
frontera dura es `develop → main`: eso lo decide el usuario, siempre.

---

## 🔄 Flujo de Trabajo por Fase

### FASE N - Flujo Completo

```
┌──────────────────────────────────────┐
│  1. INICIO DE FASE                   │
│  - Crear issue de FASE               │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  2. POR CADA TAREA                   │
│  ┌────────────────────────────────┐  │
│  │ a) Crear issue de tarea        │  │
│  │ b) Crear rama feature          │  │
│  │ c) Desarrollar                 │  │
│  │ d) Commit y push               │  │
│  │ e) Crear PR a develop          │  │
│  │ f) Auto-review                 │  │
│  │ g) Merge PR (squash)           │  │
│  │ h) Cerrar issue                │  │
│  └────────────────────────────────┘  │
│  (Repetir para todas las tareas)     │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  3. FIN DE FASE/BLOQUE                │
│  - lint + typecheck + test + build   │
│  - PR develop → main                 │
│  - ⚠️ DETENER DESARROLLO             │
│  - 📢 NOTIFICAR                      │
│  - ⏸️ ESPERAR APROBACIÓN             │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  4. DESPUÉS DE APROBACIÓN            │
│  - Merge PR                          │
│  - Cerrar issue de fase              │
│  - Continuar con el siguiente bloque │
└──────────────────────────────────────┘
```

---

## 📝 Comandos Git Detallados

### POR CADA TAREA

#### 1. Asegurarse de estar en develop actualizado

```bash
git checkout develop
git pull origin develop
git status
```

#### 2. Crear Issue de Tarea

Vía `mcp__github__issue_write` (o `gh issue create` si se trabaja localmente):

```
Título: [Descripción concisa de la tarea]

## Objetivo
Qué se va a implementar/modificar.

## Archivos afectados
- src/...  o  modules/...

## Criterios de aceptación
- [ ] Funcionalidad implementada
- [ ] pnpm lint / typecheck / test:ci en verde
- [ ] (si aplica) ./gradlew assembleDebug en verde
```

#### 3. Crear Rama Feature

```bash
git checkout -b feature/23-home-screen
```

**Nomenclatura:** prefijo `feature/`, número de issue, descripción corta en minúsculas con
guiones (`feature/23-home-screen`).

#### 4. Desarrollar, commitear

```bash
git add <archivos>
git commit -m "feat: add balance card component to home screen"
```

**Conventional Commits:**

```
feat: nueva funcionalidad
fix: corrección de bug
docs: cambios en documentación
style: formato de código (sin cambio lógico)
refactor: refactorización
test: agregar o modificar tests
chore: tareas de mantenimiento

Ejemplos (contexto RN/nativo):
feat: add balance-card component with linear gradient
feat(android): implement biometric prompt in Kotlin module
feat(ios): implement LocalAuthentication in Swift module
fix: prevent verified chip overflow in profile card
refactor: extract DataService for mock transactions
test: add unit tests for currency formatting util
```

#### 5. Push y PR

```bash
git push -u origin feature/23-home-screen
```

PR vía `mcp__github__create_pull_request` (base `develop`, head `feature/23-home-screen`),
con `Closes #23` en el cuerpo.

#### 6. Merge y cierre

Merge con squash; el issue se cierra automático por `Closes #N` (o se cierra explícitamente si
no aplicó).

---

### FIN DE BLOQUE/FASE

```bash
git checkout develop && git pull origin develop
pnpm install
pnpm lint && pnpm typecheck && pnpm test:ci && pnpm build:web
```

Crear PR `develop → main`, **detener el desarrollo del siguiente bloque** y notificar:

```
Bloque [N] completado y listo para revisión.
PR #[número] creado: develop → main
Esperando aprobación para continuar.
```

Solo tras la aprobación explícita del usuario se mergea y se continúa.

---

## 🛠️ Comandos de Referencia Rápida

### pnpm (Expo / React Native)

```bash
pnpm install              # Instalar dependencias
pnpm start                # Metro / Expo dev server
pnpm android               # Build + run Android
pnpm ios                   # Build + run iOS (requiere macOS)
pnpm web                   # Correr en navegador
pnpm build:web             # Export estático web → ./dist
pnpm lint                  # ESLint
pnpm typecheck             # tsc --noEmit
pnpm test                  # Tests (watch)
pnpm test:ci               # Tests headless (CI)
```

> ⚠️ **Usa siempre `pnpm`, nunca `npm` ni `yarn`.** El lockfile del repo es `pnpm-lock.yaml`.

### Nativo (Kotlin / Swift)

```bash
npx expo prebuild --clean       # regenera android/ e ios/ (CNG)
cd android && ./gradlew assembleDebug && ./gradlew test
# iOS se compila en CI (macos-latest); ver docs/02-guia-deploy-y-ci.md
```

---

## 🎯 Best Practices

### ✅ HACER:

- ✅ Commits frecuentes con mensajes descriptivos (Conventional Commits)
- ✅ Una rama por tarea (no mezclar tareas)
- ✅ PRs pequeños y enfocados
- ✅ `pnpm lint && pnpm typecheck && pnpm test:ci` antes de push
- ✅ Mantener `develop` siempre funcional
- ✅ Cerrar issues al completar tareas
- ✅ Código nativo persistente siempre en `modules/` o `plugins/`, nunca solo en `android/`/`ios/`
  (se regeneran y se pierde)

### ❌ NO HACER:

- ❌ Trabajar directamente en `develop` o `main`
- ❌ PRs gigantes con múltiples funcionalidades
- ❌ Commits con mensajes vagos ("fix", "update", "wip")
- ❌ Push de código que no compila
- ❌ Mezclar `npm`/`yarn` con `pnpm` (rompe el lockfile)
- ❌ Force push a `develop` o `main`
- ❌ Editar `android/`/`ios/` esperando que persista (van en `.gitignore`)

---

## 🔐 Seguridad

### ⚠️ NUNCA commitear:

- ❌ Keystores de Android (`*.keystore`, `*.jks`) ni contraseñas de firma
- ❌ Certificados/perfiles de firma de iOS
- ❌ API keys / tokens / secretos de SDKs de terceros
- ❌ `credentials.json` de EAS
- ❌ `google-services.json` / `GoogleService-Info.plist` con claves reales (según política)

---

## 📞 Ayuda Adicional

- **Git Docs**: https://git-scm.com/doc
- **Conventional Commits**: https://www.conventionalcommits.org/
- **pnpm**: https://pnpm.io/
- **Expo**: https://docs.expo.dev/
