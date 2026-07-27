# 02 - GUÍA DE DEPLOY Y CI

## 🚀 Despliegue de Índigo (Expo / React Native)

A diferencia del repo hermano (Ionic/Capacitor, un WebView), aquí el código nativo es real
(Kotlin + Swift en `modules/`) y el proyecto usa **CNG (Continuous Native Generation)**:
`android/` e `ios/` no se versionan, se generan con `npx expo prebuild` a partir de `app.json`,
`plugins/` y `modules/`.

```
┌───────────────────────────────────────────────────────────┐
│  Código (TypeScript + Kotlin + Swift en modules/)          │
└───────────────┬───────────────────────────────────────────┘
                │  npx expo prebuild
                ▼
   ┌────────────────────┬───────────────────┬──────────────────┐
   ▼                    ▼                   ▼
 Web (demo)           Android (APK/AAB)    iOS (IPA)
 expo export -p web   Gradle (local o CI)  xcodebuild en CI
 → GitHub Pages       ubuntu-latest        macos-latest ⭐ sin Mac
```

> **La pieza clave de este proyecto:** compilar Swift **sin tener una Mac** usando runners
> `macos-latest` de GitHub Actions, que traen Xcode preinstalado. Se puede escribir, compilar y
> testear Swift real en CI; lo único que no se puede hacer sin Mac es depurar interactivamente en
> Xcode o correr el simulador de iOS de forma visual.

---

## PARTE 1: PRE-DEPLOY (verificación local)

```bash
pnpm install
pnpm lint            # ESLint
pnpm typecheck        # tsc --noEmit
pnpm test:ci           # Jest headless
pnpm build:web         # expo export -p web → ./dist
```

Para la capa nativa (Android, verificable en este entorno sin Mac):

```bash
npx expo prebuild --clean
cd android && ./gradlew assembleDebug && ./gradlew test
```

### Variables de entorno

Expo usa `app.json`/`app.config.ts` (`extra`) y archivos `.env` leídos por `babel-preset-expo`
con prefijo `EXPO_PUBLIC_*` (quedan embebidos en el bundle: **nunca** secretos reales ahí). Para
secretos de build (firma, tokens de API privados) se usan **EAS Secrets** o GitHub Actions
Secrets — nunca en el repo.

---

## PARTE 2: CI CON GITHUB ACTIONS

### `ci.yml` — en cada PR a `develop`/`main`

1. Checkout, pnpm + Node 20 (`cache: pnpm`).
2. `pnpm install --frozen-lockfile`.
3. `pnpm lint && pnpm typecheck`.
4. `pnpm test:ci` (Jest headless, no requiere navegador ni emulador).
5. `pnpm build:web` (export web — caza errores de bundling que el typecheck no ve).

### `android.yml` — Gradle real, `ubuntu-latest`

```yaml
- run: npx expo prebuild -p android --clean
- run: cd android && ./gradlew assembleDebug
- run: cd android && ./gradlew test          # JUnit de los módulos Kotlin
# opcional (workflow_dispatch): assembleRelease firmado con keystore desde secrets → artifact APK/AAB
```

### `ios.yml` — Swift real, `macos-latest` ⭐

Este es el workflow que resuelve "no tengo Mac": el runner sí la tiene.

```yaml
jobs:
  ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: npx expo prebuild -p ios --clean
      - name: Install CocoaPods
        run: cd ios && pod install
      - name: Build (simulador, sin firma)
        run: |
          xcodebuild -workspace ios/Indigo.xcworkspace \
            -scheme Indigo -sdk iphonesimulator \
            -destination 'generic/platform=iOS Simulator' build
      - name: Test (XCTest de los módulos Swift)
        run: |
          xcodebuild -workspace ios/Indigo.xcworkspace \
            -scheme Indigo -sdk iphonesimulator \
            -destination 'platform=iOS Simulator,name=iPhone 16' test
```

Esto **compila y testea el Swift de `modules/*/ios/*.swift`** en cada PR. Es la validación real
de la capa iOS de este proyecto.

**Recomendado en GitHub** → *Settings → Branches*: exigir estos tres checks (`ci`, `android`
en su versión rápida, `ios`) antes de mergear a `develop`/`main`.

---

## PARTE 3: DEMO WEB (portafolio, sin dispositivo)

```bash
pnpm build:web     # expo export -p web → ./dist
```

React Native Web renderiza las pantallas y la navegación en el navegador (los módulos nativos
propios se mockean/stubean detrás de la interfaz de `core/services`, ver `docs/03`). Se publica
`./dist` a GitHub Pages igual que la demo del repo Ionic hermano — da un link navegable para
portafolio sin compilar nada nativo.

### Verificación visual sin emulador ni dispositivo

Con el dev server o el export web corriendo, se puede capturar con **Playwright/Chromium**
(preinstalado en este entorno) a un viewport de teléfono (390×844) en claro y oscuro, y comparar
contra `docs/design/capturas/*.png`. Es el sustituto de "correr en el emulador" cuando no hay
Android Studio ni Mac disponibles.

---

## PARTE 4: BUILD NATIVO REAL

### 4.1 Android — verificable local si hay Android SDK; en este contenedor, no del todo

```bash
npx expo prebuild -p android --clean
cd android
./gradlew assembleDebug      # APK debug, sin firmar
./gradlew test               # JUnit de modules/*/android
```

Requiere JDK 17 + Android SDK command-line tools (sin Android Studio). El APK sale en
`android/app/build/outputs/apk/debug/`.

**Limitación real de este contenedor remoto (descubierta en la FASE 5):** este entorno no trae
JDK 17 preinstalado (solo JDK 21 — se resuelve instalando `openjdk-17-jdk-headless` vía `apt`) y,
más importante, **el proxy de salida bloquea `dl.google.com`** (`403 Forbidden`), que es de donde
Gradle resuelve el Android Gradle Plugin y las dependencias de AndroidX vía el repositorio
`google()`. No hay forma de instalarlo/evitarlo desde este contenedor. En la práctica, aquí se
puede confirmar que `expo prebuild` genera el proyecto y que `gradlew --version` arranca (la
descarga del propio Gradle sí funciona, vía `services.gradle.org`, que no está bloqueado), pero
**no compilar** (`assembleDebug`/`test`). Detalle completo en
`docs/07-capa-nativa-kotlin-swift.md` (sección 2). La verificación real de Android para este
proyecto es `.github/workflows/android.yml` (FASE 11) sobre `ubuntu-latest`, que sí trae el SDK.
En una máquina normal (Android Studio, o `sdkmanager` con acceso de red sin restringir) esto sí
corre local sin problema — es una restricción de este contenedor específico, no del proyecto.

### 4.2 iOS — se compila en CI, no localmente

Sin Mac no hay Xcode, así que **no** se puede correr `expo prebuild -p ios` + `pod install` +
`xcodebuild` en este entorno. Se verifica exclusivamente en `.github/workflows/ios.yml` sobre
`macos-latest` (ver arriba). El código Swift se escribe y se razona localmente; su compilación
real y sus tests (XCTest) se confirman en cada push vía CI.

### 4.3 EAS Build — para instalar en dispositivo físico

```bash
npx eas build --platform android --profile preview   # APK instalable
npx eas build --platform ios --profile preview        # requiere cuenta Apple Developer para
                                                        # registrar el iPhone (TestFlight o ad-hoc)
```

`eas.json` define perfiles `development` / `preview` / `production`. EAS compila en la nube de
Expo (no requiere Mac tampoco) y devuelve un link/QR para instalar. Es la vía recomendada para
probar en el iPhone físico del usuario sin depurar en Xcode.

---

## PARTE 5: TROUBLESHOOTING

**`expo prebuild` sobreescribe cambios en `android/`/`ios/`**
- Esperado: son generados (CNG). Cualquier cambio persistente va en `modules/` (código nativo) o
  `plugins/` (config plugin TS que ajusta manifest/Info.plist/Gradle).

**`./gradlew assembleDebug` falla tras tocar un módulo Kotlin**
- Revisar el `build.gradle` del módulo en `modules/<nombre>/android/`; correr
  `./gradlew :modules-indigo-xxx:assembleDebug` para aislar el módulo.

**El workflow `ios.yml` falla en `pod install`**
- Revisar el `.podspec` del módulo Swift afectado en `modules/<nombre>/ios/`.

**La demo web no refleja un módulo nativo**
- Es esperado: los módulos nativos se mockean en la plataforma web detrás de la interfaz de
  `core/services` (ver `docs/03-arquitectura-y-buenas-practicas.md`).

---

## PARTE 6: CHECKLIST FINAL

### Pre-deploy
- [ ] `pnpm lint && pnpm typecheck` OK
- [ ] `pnpm test:ci` OK
- [ ] `pnpm build:web` OK
- [ ] (si hay cambios nativos) `./gradlew assembleDebug && ./gradlew test` OK local — o, si el
      entorno no tiene Android SDK (ver PARTE 4.1), CI `android.yml` en verde
- [ ] (si hay cambios nativos) CI `ios.yml` en verde (Swift compila y testea en `macos-latest`)
- [ ] Todo pusheado y CI en verde

### Nativo (cuando aplique)
- [ ] `modules/*/android` y `modules/*/ios` tienen Kotlin y Swift equivalentes
- [ ] Sin código nativo "huérfano" solo en `android/`/`ios/` (se perdería en el próximo prebuild)
- [ ] Keystore/credenciales/perfiles de firma fuera del repo (EAS Secrets / GitHub Secrets)

---

## 📞 Recursos Útiles

- **Expo Docs**: https://docs.expo.dev/
- **Expo Modules API**: https://docs.expo.dev/modules/overview/
- **EAS Build**: https://docs.expo.dev/build/introduction/
- **React Navigation**: https://reactnavigation.org/
- **GitHub Actions (macOS runners)**: https://docs.github.com/actions/using-github-hosted-runners/about-github-hosted-runners

---

**🎉 A desplegar.** El proyecto Android se genera y se razona en este entorno (`expo prebuild`,
lectura de Gradle/manifest); compilarlo (`assembleDebug`/`test`) depende de tener Android SDK —
en el contenedor remoto de esta sesión no lo hay (ver PARTE 4.1), así que esa verificación queda
para `.github/workflows/android.yml`. El Swift se escribe aquí y se compila/testea en CI sobre
`macos-latest` — esa combinación es la que permite trabajar en las dos plataformas nativas sin
tener una Mac física ni, en este caso concreto, Android Studio.
