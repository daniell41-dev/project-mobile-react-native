# Handoff: Índigo — App de banca personal (React Native)

## Resumen
Índigo es una **app móvil de banca personal / billetera** (saldos, transferencias, tarjetas,
estadísticas), hermana de **Nimbo** (la versión Ionic/Angular del mismo producto en
`project-mobile-ionic`). Este paquete reutiliza el **prototipo de alta fidelidad navegable en
HTML** de Nimbo — mismo flujo de navegación y contenido de 10 pantallas — pero con la paleta de
marca cambiada a **morado** (inspirada en Nubank) y el mapeo de cada zona a su **componente
React Native** correspondiente en lugar de `ion-*`.

- **Mercado / idioma:** México · Español · moneda **MXN**
- **Plataformas:** iOS y Android desde una sola base de código (React Native / Expo)
- **Estilo:** premium, oscuro y elegante, con **modo claro y modo oscuro** (toggle)
- **Acento de marca:** morado `#820AD1` (era azul `#2A6FDB` en el prototipo original — ver
  tabla de reemplazo de color más abajo)
- **Tipografía:** Plus Jakarta Sans (UI) + Sora (números/montos)

---

## Sobre los archivos de diseño

Los archivos en `prototipo/` (copiados tal cual del handoff de Nimbo) son **una referencia de
diseño hecha en HTML/React** — muestran la apariencia y el comportamiento buscados, **no son
código de producción para copiar tal cual**, y sus colores son los del prototipo original
(**azul**). Al implementar en React Native se usa **la paleta morada de esta tabla**, no los
valores hexadecimales del CSS del prototipo.

La tarea es **recrear estos diseños en un proyecto React Native real**, usando componentes
nativos (`View`, `FlatList`/`SectionList`, `TextInput`, `Pressable`, `Switch`, ...) y React
Navigation. Stack objetivo:

- **Expo SDK 57** + **React Native 0.86** + **TypeScript**.
- **React Navigation 7** explícito (`createNativeStackNavigator` + `createBottomTabNavigator`),
  no expo-router (ver `docs/06-guia-entrevista.md` del repo).
- Componentes de `shared/components/` en vez de componentes Ionic.

## Fidelidad

**Alta fidelidad (hi-fi)** en tipografía, espaciado, radios e interacciones — heredados sin
cambios del prototipo original. **El color sí cambia**: donde el prototipo usa azul, Índigo usa
la paleta morada de abajo.

---

## Design Tokens

### Reemplazo de color (azul del prototipo → morado de Índigo)

| Rol | Prototipo (Nimbo, azul) | Índigo (morado) |
|---|---|---|
| Acento base (modo claro) | `#2A6FDB` | **`#820AD1`** |
| Acento claro (modo oscuro) | `#4C8DFF` | **`#A855F7`** |
| Acento oscuro/pressed | `#1F5BC0` | **`#6A08AC`** |
| Degradado tarjeta de saldo | `#2A6FDB → #1B3F86 → #14264F` | **`#820AD1 → #5B0A93 → #33055A`** |

### Color — Modo OSCURO (default)
| Token | Valor |
|---|---|
| `bg` | `#0B0810` |
| `surface` | `#16111D` |
| `surface2` | `#1E1828` |
| `surface3` | `#271F33` |
| `hairline` | `rgba(255,255,255,0.075)` |
| `text` | `#F1EEF6` |
| `textDim` | `#A79FB3` |
| `textMute` | `#6E657C` |
| `accent` | `#A855F7` |
| `up` | `#3FD1A0` (ingresos / éxito) |
| `down` | `#FF8A8A` (gastos / peligro) |

### Color — Modo CLARO
| Token | Valor |
|---|---|
| `bg` | `#F2EFF7` |
| `surface` | `#FFFFFF` |
| `surface2` | `#F7F4FB` |
| `surface3` | `#EDE8F5` |
| `hairline` | `rgba(22,16,31,0.08)` |
| `text` | `#16101F` |
| `textDim` | `#63596F` |
| `textMute` | `#938AA0` |
| `accent` | `#820AD1` (acento base de marca) |
| `up` | `#128C5E` |
| `down` | `#D2453C` |

### Acento de marca (constante en ambos modos)
`accent500: #820AD1` · `accent400: #A855F7` · `accent600: #6A08AC`
Degradado de tarjeta de saldo (150°): `#820AD1 → #5B0A93 → #33055A` (`expo-linear-gradient`).

### Tipografía
- **UI:** `"Plus Jakarta Sans"`, pesos 400/500/600/700/800. Títulos con `letterSpacing: -0.3`
  aprox (equivalente a `-0.02em` en un tamaño de ~15–21px).
- **Números/montos:** `"Sora"` con `fontVariant: ['tabular-nums']`.
- Escala: saldo grande 38px/700 · monto enviar 52px/700 · H1 pantalla 21px/700 · item título
  15px/600 · subtítulo 12.5px · labels 12–13px.
- Cargadas con `expo-font` (`@expo-google-fonts/plus-jakarta-sans`, `@expo-google-fonts/sora`).

### Radios / espaciado / sombra
- Radios: `sm 10 · md 16 · lg 22 · xl 28`. Padding lateral de pantalla: **20**.
- Sombra de tarjeta elevada (oscuro, `shadow*`/`elevation`): equivalente a
  `0 18px 50px -20px rgba(0,0,0,.8)` del prototipo.
- Hit targets mínimos **44px**.

---

## Navegación (arquitectura) — React Navigation

**Pre-auth (sin tabs):** `AuthNavigator` → `OnboardingScreen → LoginScreen → (autenticar) →` tabs.

**Autenticado — `TabNavigator` (bottom tabs) con 5 pestañas:**
1. **Inicio** (`Home`)
2. **Movimientos** (`Transactions`)
3. **Tarjetas** (`Cards`)
4. **Análisis** (`Stats`)
5. **Perfil** (`Profile`)

**Pushes de stack** (cada tab tiene su propio `native-stack` para poder empujar pantallas
manteniendo la tab bar):
- `TxDetail` — Detalle de movimiento (desde Home o Movimientos)
- `Send` → `SendDone` — Enviar dinero → Confirmación de envío (desde acción rápida "Enviar")
- `Notifications` — Notificaciones (desde la campana del header)

`RootNavigator` conmuta entre `AuthNavigator` y `TabNavigator` según `authStore.isAuthenticated`
(sin navegación imperativa). Transiciones: las nativas de `native-stack`/`bottom-tabs` por
defecto (equivalen a las de `IonRouterOutlet` del prototipo Ionic).

---

## Pantallas / Vistas

> Para cada una se indica el propósito, el layout y el **mapeo a componentes React Native**
> (reemplaza el mapeo a `ion-*` del handoff original de Nimbo).

### 1. Onboarding (`OnboardingScreen`)
- **Propósito:** bienvenida + propuesta de valor.
- **Layout:** fullscreen, fondo con degradado radial de acento morado (`expo-linear-gradient`);
  logo + titular + subtítulo centrados; 3 puntos de paginación; al pie dos botones.
- **RN:** `SafeAreaView` · carrusel simple con `FlatList` paginado o `react-native-pager-view`
  (3 pasos) · botones full-width (`Pressable` estilizado, variantes solid/outline).

### 2. Login (`LoginScreen`)
- **Propósito:** ingreso por correo.
- **Layout:** back, titular, campos correo/contraseña, link "¿Olvidaste tu contraseña?", botón
  "Entrar", separador "o continúa con", botones Apple/Google.
- **RN:** `TextInput` dentro de un `FormField` propio (label arriba, borde) · campo de contraseña
  con icono `slot end` para alternar visibilidad · `react-hook-form` + `zod` para validación ·
  botones sociales con icono (`@expo/vector-icons`).

### 3. Inicio (`HomeScreen`)
- **Propósito:** resumen: saldo, acciones rápidas, meta de ahorro, movimientos recientes.
- **Layout:** header con avatar (izq) + saludo + campana con badge (der); **tarjeta de saldo**
  con degradado morado y ojo para ocultar; fila de 4 acciones rápidas (Enviar/Solicitar/Pagar/
  Cobrar); tarjeta de meta de ahorro con barra de progreso (62%); lista de movimientos recientes.
- **RN:** header custom en la pantalla (avatar + `Pressable` con badge) · `BalanceCard`
  (`LinearGradient` + ojo) · fila de `QuickAction` con `flexDirection: row` · barra de progreso
  custom (`View` con ancho animado, `value=0.62`) · `TransactionRow` dentro de un `FlatList`
  (o vista no scrolleable, "Ver todos" navega a Movimientos).

### 4. Movimientos (`TransactionsScreen`)
- **Propósito:** historial completo, buscable y filtrable, agrupado por día.
- **Layout:** título + campana; buscador; filtro Todos/Ingresos/Gastos; encabezados por día
  (Hoy, Ayer, 4 jun…); filas de transacción (icono de categoría + nombre + categoría·hora +
  monto; ingresos en verde con `+`, gastos con `−`).
- **RN:** `TextInput` con icono de búsqueda como `Searchbar` propio · segmento propio
  (`Pressable` en fila, o `@react-native-segmented-control/segmented-control`) ·
  `SectionList` con `renderSectionHeader` sticky (día) · `TransactionRow`.

### 5. Detalle de movimiento (`TxDetailScreen`)
- **Propósito:** detalle de una transacción.
- **Layout:** back + "más" (slot end); icono grande + monto + comercio; lista clave/valor
  (Estado con chip "Completado", Fecha, Categoría, Método, Referencia, Comisión); botones
  "Descargar comprobante" y "Reportar un problema" (este último en rojo).
- **RN:** header de `native-stack` con botón custom a la derecha · `ListRow` de pares
  clave/valor · `Chip` propio (`color="success"`) · botón `outline` y botón `danger`.

### 6. Enviar dinero (`SendScreen`) → Confirmación (`SendDoneScreen`)
- **Propósito:** elegir contacto e ingresar monto.
- **Layout (paso 1):** buscador; recientes como avatares horizontales; lista "Tus contactos".
- **Layout (paso 2):** chip del destinatario; monto grande; saldo disponible; **teclado
  numérico custom** (3×4, incluye `.` y borrar); botón fijo "Enviar $X" al pie.
- **Confirmación:** ícono de éxito, mensaje, chip "SPEI · llega en segundos", botón "Volver al
  inicio".
- **RN:** buscador + `FlatList` horizontal de avatares + `FlatList` de contactos ·
  **`NumericKeypad`** propio con `View`/`Pressable` en grid 3×4 (**nunca** `TextInput` con
  teclado nativo para el monto) · botón fijo con `SafeAreaView` al pie · pantalla de éxito
  simple (no modal, ruta propia `SendDone`).

### 7. Tarjetas (`CardsScreen`)
- **Propósito:** ver tarjeta, saldos y controles.
- **Layout:** visual de tarjeta (débito) con degradado, chip, número, titular y logo de red; dos
  tiles (Saldo débito / Crédito disponible); sección "Controles" con dos toggles (Congelar
  tarjeta, Compras en línea); lista "Más opciones" (PIN/CVV, copiar datos, límites, tarjeta
  física).
- **RN:** carrusel con `FlatList` horizontal paginado si hay varias tarjetas · **`CardVisual`
  = vista nativa** (`modules/indigo-card-view`, Compose/SwiftUI bajo Fabric — no es un
  componente RN estándar, es la pieza de aprendizaje de la FASE 8) · tiles en fila (`View` +
  `flex`) · `Switch` para los toggles · `ListRow` para "Más opciones".

### 8. Análisis / Estadísticas (`StatsScreen`)
- **Propósito:** gasto por categoría y tendencia mensual.
- **Layout:** segmento Semana/Mes/Año; **donut** de gasto por categoría (6 categorías con %) con
  total al centro; **barras** de gasto mensual (6 meses, mes actual resaltado); tarjeta de "Tip
  de ahorro".
- **RN:** segmento propio · `react-native-gifted-charts` (`PieChart` para el donut,
  `BarChart` para las barras) sobre `react-native-svg` · tarjetas (`View` con estilo `Card`).

### 9. Perfil (`ProfileScreen`)
- **Propósito:** datos de cuenta, preferencias, cerrar sesión.
- **Layout:** tarjeta de cabecera (avatar + nombre + email + chip "Verificada"); grupo "Cuenta"
  (Datos personales, Mis cuentas y CLABE, **Seguridad y biometría**); grupo "Preferencias"
  (Notificaciones, Idioma=Español, Ayuda y soporte); botón "Cerrar sesión" (rojo); versión al
  pie.
  - ⚠️ El chip "Verificada" debe tener `flexShrink: 0` y el bloque de nombre/email
    `flexShrink: 1` con `numberOfLines={1}` + `ellipsizeMode="tail"`, para que el chip no se
    desborde de la tarjeta (mismo bug potencial que en el prototipo original).
- **RN:** `Card` de cabecera + `Chip` · secciones con `SectionHeader` + `ListRow` (flecha
  `chevron-forward`) · fila "Seguridad y biometría" navega a un flujo que usa
  `BiometricsService` (envuelve `modules/indigo-biometrics`) · botón `danger`.

### 10. Notificaciones (`NotificationsScreen`)
- **Propósito:** avisos (pagos, seguridad, metas, estados de cuenta).
- **Layout:** back + "Marcar leídas"; lista con icono, título, descripción (multilínea), marca
  de tiempo y punto de no leído.
- **RN:** header de `native-stack` con acción a la derecha · `FlatList` + `ListRow` con
  `numberOfLines` en la descripción · texto de marca de tiempo en `textMute`.

---

## Interacciones & comportamiento
- **Ocultar saldo:** el ojo en la tarjeta de saldo alterna entre el monto y `$ •••••••`.
- **Filtro de movimientos:** Todos/Ingresos/Gastos filtra la lista en cliente.
- **Enviar:** elegir contacto → teclado actualiza el monto y el texto del botón en vivo →
  confirmación → "Volver al inicio" regresa al tab Inicio.
- **Toggles de tarjeta:** Congelar y Compras en línea cambian estado y su texto descriptivo.
- **Tema:** toggle claro/oscuro a nivel app, vive en Perfil; respeta `useColorScheme()` y
  persiste la preferencia (`themeStore`).
- **Tab activo:** resalta en color de acento morado.

## Estado (state)
- `themeStore`: `theme: 'dark' | 'light'`.
- `authStore`: `isAuthenticated: boolean`, token.
- Navegación por `RootNavigator`/`TabNavigator`/stacks (React Navigation, no estado manual).
- `sendStore`: `recipient`, `amount` (string que construye el teclado).
- `CardsScreen` (local o store): `frozen`, `onlinePurchases`.
- Datos de ejemplo: `DataService`, migrados desde `prototipo/data.js` (usuario, transacciones,
  contactos, categorías, meses).

## Assets
- **Iconos:** Ionicons vía `@expo/vector-icons` (equivalentes: home, swap-horizontal, card,
  bar-chart, person, notifications, search, send, etc. — mismo set de línea 2px del prototipo).
- **Imágenes:** no se usan fotos; todo es UI + iconos. No hay assets binarios que migrar.
- **Fuentes:** Google Fonts (Plus Jakarta Sans, Sora) vía `@expo-google-fonts/*`.

## Archivos de este paquete
- `prototipo/` — copia intacta del prototipo HTML/React de Nimbo (colores **azules**, solo como
  referencia de layout/tipografía/interacción — el color real de Índigo es la paleta morada de
  este documento).
- `capturas/` — screenshots de referencia del prototipo original (azul); útiles para comparar
  layout, no color.

---

## ▶️ Notas para implementar

1. Los tokens de este documento (morados) son la fuente de verdad de color; `prototipo/styles.css`
   sigue siendo la fuente de verdad de **espaciado, radios y tipografía** (esos no cambiaron).
2. Todas las pantallas se implementan pantalla por pantalla, en el orden del roadmap
   (`docs/04-roadmap-y-fases.md`, FASE 1 y FASE 3).
3. Formatea moneda con `Intl.NumberFormat('es-MX', { style:'currency', currency:'MXN' })`
   envuelto en `shared/utils/formatCurrency.ts`.
4. El teclado numérico de Enviar es **siempre** un componente propio (`NumericKeypad`), nunca el
   teclado nativo del sistema.
