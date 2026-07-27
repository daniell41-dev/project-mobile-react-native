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

### `android.yml` (FASE 11) — Gradle real, `ubuntu-latest`

Dos jobs. `build-and-test` corre en cada PR/push a `develop`/`main`:

```yaml
- uses: actions/setup-java@v4        # Temurin 17
- uses: android-actions/setup-android@v3
- run: npx expo prebuild -p android --clean
- uses: gradle/actions/setup-gradle@v4
- run: cd android && ./gradlew assembleDebug   # APK debug, keystore de la plantilla
- run: cd android && ./gradlew test            # JUnit de los 5 módulos Kotlin
- uses: actions/upload-artifact@v4             # sube el APK debug como artifact del run
```

`release` (`workflow_dispatch` manual) firma de verdad: decodifica
`secrets.INDIGO_ANDROID_KEYSTORE_BASE64` a `android/app/release.keystore`, escribe
`INDIGO_RELEASE_STORE_FILE`/`_STORE_PASSWORD`/`_KEY_ALIAS`/`_KEY_PASSWORD` en
`android/gradle.properties` (los lee `plugins/withIndigoAndroidRelease.ts`, ver sección 8),
corre `assembleRelease` + `bundleRelease` y sube APK y AAB como artifacts. Sin el secret
configurado, el job falla explícito en vez de firmar en silencio con el keystore de debug.

### `ios.yml` (FASE 11) — Swift real, `macos-latest` ⭐

Este es el workflow que resuelve "no tengo Mac": el runner sí la tiene.

```yaml
- run: npx expo prebuild -p ios --clean
- run: cd ios && pod install
# El proyecto/esquema generado se llama "ndigo", no "Indigo" (gotcha de saneo de
# caracteres no-ASCII documentado en docs/07 sección 3 — Expo elimina la "Í" del nombre
# "Índigo" en vez de normalizarla).
- run: |
    xcodebuild build -workspace ios/ndigo.xcworkspace -scheme ndigo \
      -destination "platform=iOS Simulator,name=$DEVICE_NAME" CODE_SIGNING_ALLOWED=NO
# $DEVICE_NAME se elige en tiempo de ejecución con `xcrun simctl list devices available`
# en vez de hardcodear "iPhone 16": la imagen macos-latest cambia de Xcode/simuladores
# disponibles con el tiempo y un nombre fijo eventualmente deja de existir.
- run: |
    # Cada módulo con test_spec en su .podspec (biometrics, secure-store, card-view,
    # connectivity) obtiene de CocoaPods un esquema "<Módulo>-Unit-Tests" al correr
    # `pod install` con includeTests: true (plugins/withIndigoIosTests.ts). El workflow
    # los DESCUBRE con `xcodebuild -list -json` en vez de hardcodear los 4 nombres —
    # el sufijo exacto no se pudo confirmar sin una Mac real — y corre
    # `xcodebuild test -scheme <cada uno>` sobre todos los que encuentre.
```

Esto **compila el Swift de `modules/*/ios/*.swift` de verdad** (vía CocoaPods, más el
TurboModule "bare" `indigo-device` dentro del propio target de la app) y corre su XCTest en
cada PR. `indigo-device` queda fuera del XCTest automático a propósito: no es un Pod (se
compila directo en el target de la app, sin `.podspec`), así que no tiene `test_spec` —
detalle completo en `docs/07` sección 4.4.

**Bug real encontrado al preparar esta fase:** los 4 `.podspec` con
`source_files = "**/*.{h,m,mm,swift,hpp,cpp}"` (glob recursivo desde las FASES 6-8 y 10)
arrastraban también `Tests/*.swift` al target **principal** del pod, no a un `test_spec`
separado — `import XCTest` sin el framework enlazado y `@testable import` del propio módulo
que se estaba compilando. Nunca se manifestó porque hasta esta fase nada había corrido
`pod install`/`xcodebuild` de verdad. Se corrigió acotando `source_files` al nivel superior
de `ios/` y moviendo `Tests/` a un bloque `test_spec` (mismo patrón que usa
`ExpoModulesCore.podspec`, la referencia real inspeccionada para escribir esto).

**Recomendado en GitHub** → *Settings → Branches*: exigir estos checks (`ci`,
`android / build-and-test`, `ios / build-and-test`) antes de mergear a `develop`/`main`.

**Nota sobre verificación de estos dos workflows:** a diferencia del resto del proyecto, la
FASE 11 sí se pudo verificar de punta a punta — porque su verificación consiste,
precisamente, en dejar corriendo `android.yml`/`ios.yml` en el PR real de GitHub Actions.
El detalle del resultado de esa primera corrida real queda en `docs/07` sección 4.6.

---

## PARTE 3: DEMO WEB (portafolio, sin dispositivo)

```bash
pnpm build:web     # expo export -p web → ./dist
```

React Native Web renderiza las pantallas y la navegación en el navegador (los módulos nativos
propios se mockean/stubean detrás de la interfaz de `core/services`, ver `docs/03`). Se publica
`./dist` a GitHub Pages igual que la demo del repo Ionic hermano — da un link navegable para
portafolio sin compilar nada nativo.

**`.github/workflows/pages.yml`** (FASE 11): en cada push a `main`, exporta la web
(`pnpm build:web`) y publica `./dist` con `actions/upload-pages-artifact` +
`actions/deploy-pages` — el flujo oficial de GitHub Actions para Pages (sin rama `gh-pages`
manual). Requiere un paso único de configuración manual en el repo: *Settings → Pages → Build
and deployment → Source: **GitHub Actions*** (no es algo que un workflow pueda activarse a sí
mismo la primera vez).

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

`eas.json` (FASE 11, en la raíz del repo) define los tres perfiles: `development`
(`developmentClient` + APK, para iterar con Dev Client) `preview` (APK instalable directo,
canal `preview`) y `production` (AAB para Play Store / `.ipa` para App Store, `autoIncrement`
del número de build, canal `production`). EAS compila en la nube de Expo (no requiere Mac
tampoco) y devuelve un link/QR para instalar. Es la vía recomendada para probar en el iPhone
físico del usuario sin depurar en Xcode — no se ejecutó ningún build real en esta fase (requiere
cuenta de Expo con créditos/plan), el archivo queda listo para cuando el usuario la tenga.

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
