# 06 - GUÍA DE ENTREVISTA (Mobile React Native)

Banco de preguntas y respuestas cortas para preparar entrevistas de **React Native / móvil**,
basado en lo que este proyecto (Índigo) construye. Actualízalo con lo que te pregunten de verdad.

---

## Navegación: React Navigation vs expo-router

**No son competidores.** `expo-router` es una capa de **rutas por archivos** (file-based
routing) construida *encima* de React Navigation — usa los mismos navegadores
(`native-stack`, `bottom-tabs`) por debajo, solo cambia cómo se declaran las rutas: por
estructura de carpetas (`app/home.tsx`) en lugar de un árbol de `Navigator`/`Screen` explícito.

| | React Navigation explícito | expo-router |
|---|---|---|
| Cómo se declaran rutas | `createNativeStackNavigator()` + `<Stack.Screen name="Home" component={...}/>` | Estructura de carpetas `app/` |
| Tipado de rutas | Manual (`ParamList` + `declare global`) | Generado (`typed routes`) |
| Deep linking | Config manual (`linking` prop) | Automático por convención de carpetas |
| Curva de entrada | Más explícita, más control | Más rápido de arrancar |
| Qué se pregunta en entrevista | **Esto** — la API de navegación en sí | Rara vez se pregunta la sintaxis específica |

Índigo usa React Navigation explícito a propósito: entender `NavigationContainer`,
`useNavigation()`, `useRoute()`, `ParamList` tipadas y cómo se anidan stacks dentro de tabs es lo
que se evalúa. Si te preguntan por expo-router, la respuesta correcta es "es rutas por archivos
sobre React Navigation, no un motor de navegación distinto".

---

## Arquitectura de React Native (2026)

- **El bridge legacy ya no existe.** Se eliminó en React Native 0.82; desde ahí todo proyecto es
  *bridgeless* por defecto (Expo SDK 55 quitó incluso el flag para desactivar la New
  Architecture). No hables del bridge como "cómo funciona hoy" — es historia.
- **New Architecture = Fabric + TurboModules + JSI + Codegen:**
  - **JSI (JavaScript Interface)** — permite que JS llame a C++/nativo de forma síncrona y
    tipada, sin serializar JSON por un puente asíncrono (así funcionaba el bridge viejo).
  - **TurboModules** — módulos nativos con carga perezosa, tipados vía Codegen a partir de una
    spec TypeScript.
  - **Fabric** — el nuevo renderer, con vistas nativas ("Fabric components") también generadas
    por Codegen.
  - **Codegen** — genera el código de interoperabilidad (Kotlin/ObjC++) a partir de la spec TS,
    en vez de escribirlo a mano.
- **Expo Modules API vs TurboModule "bare":** Expo Modules API es una capa de conveniencia sobre
  TurboModules (DSL en Kotlin/Swift, menos boilerplate, ideal para módulos de una sola app vía
  `create-expo-module --local`). Un TurboModule bare (spec TS + Codegen manual) es el camino sin
  Expo — más verboso, pero es lo que se pregunta en entrevistas de RN "puro"/enterprise. Índigo
  implementa ambos (ver `docs/07-capa-nativa-kotlin-swift.md`) para poder hablar de los dos.

---

## Preguntas frecuentes y respuesta corta

**¿Cómo comparte estado dos pantallas que no son padre/hijo?**
Store global (Zustand aquí) o levantar el estado a un ancestro común + Context si es solo UI.

**¿Cómo evitas re-renders innecesarios en listas largas?**
`FlatList`/`SectionList` con `keyExtractor` estable, `React.memo` en las filas, evitar funciones
inline como prop cuando la lista es grande, `getItemLayout` si el alto es fijo.

**¿Cómo persistes un token de forma segura?**
Nunca en `AsyncStorage` en texto plano para datos sensibles: Keystore (Android) / Keychain (iOS)
— en Índigo, `modules/indigo-secure-store` los implementa a mano; en producción real también es
válido `expo-secure-store`, que envuelve lo mismo.

**¿Qué es un config plugin de Expo?**
Código TypeScript que modifica el proyecto nativo generado (`AndroidManifest.xml`, `Info.plist`,
`build.gradle`) de forma idempotente durante `expo prebuild`, para no tener que editar
`android/`/`ios/` a mano (se perdería al regenerar).

**¿Por qué Kotlin y no Java en Android moderno?**
Interop 100% con Java, null-safety en el propio lenguaje, coroutines para asincronía sin
callbacks anidados, es el lenguaje que Google recomienda desde 2019 y el que usa la propia
Expo Modules API (DSL Kotlin).

**¿Diferencia entre Keystore y Keychain?**
Ambos son almacenamiento respaldado por hardware seguro del sistema operativo. Keystore
(Android) guarda claves criptográficas y permite cifrar datos con `EncryptedSharedPreferences`;
Keychain (iOS) guarda directamente ítems (contraseñas, tokens) cifrados por el sistema. La API es
distinta pero el propósito — no guardar secretos en texto plano — es el mismo.

**¿Cómo se testea un módulo nativo?**
La lógica nativa con JUnit (Kotlin) / XCTest (Swift); la superficie JS que lo consume, mockeando
el módulo nativo en Jest (nunca se ejecuta código nativo real en el test runner de JS).

---

## Tabla de equivalencias Kotlin ↔ Swift (ampliar en `docs/07`)

| Concepto | Kotlin (Android) | Swift (iOS) |
|---|---|---|
| Asincronía | Coroutines + `Flow` | `async/await` + `Combine`/`AsyncSequence` |
| Nulabilidad | `?` / `!!` / `?:` | `?` / `!` / `??` |
| Prompt biométrico | `androidx.biometric.BiometricPrompt` | `LocalAuthentication.LAContext` |
| Almacenamiento seguro | Keystore + `EncryptedSharedPreferences` | Keychain (`SecItemAdd`) |
| UI declarativa | Jetpack Compose | SwiftUI |
| Gestor de dependencias nativas | Gradle | CocoaPods / Swift Package Manager |
| Testing | JUnit | XCTest |
