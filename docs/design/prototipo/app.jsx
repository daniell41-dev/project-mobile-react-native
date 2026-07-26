/* App shell: marco de teléfono, navegación, tema, panel Notas Ionic */

const SCREENS = {
  onboarding: { comp: "Onboarding", tab: null, chrome: false },
  login:      { comp: "Login", tab: null, chrome: false },
  home:        { comp: "Home", tab: "home", chrome: true },
  transactions:{ comp: "Transactions", tab: "transactions", chrome: true },
  txdetail:    { comp: "TxDetail", tab: "transactions", chrome: true },
  send:        { comp: "Send", tab: null, chrome: true },
  sendDone:    { comp: "SendDone", tab: null, chrome: true },
  notifications:{ comp: "Notifications", tab: null, chrome: true },
  cards:       { comp: "Cards", tab: "cards", chrome: true },
  stats:       { comp: "Stats", tab: "stats", chrome: true },
  profile:     { comp: "Profile", tab: "profile", chrome: true },
};

const TAB_ROOT = { home: "home", transactions: "transactions", cards: "cards", profile: "profile", stats: "stats" };

// Notas Ionic por pantalla (para el handoff a Claude Code)
const IONIC_NOTES = {
  onboarding: {
    label: "Onboarding",
    notes: [
      ["ion-content fullscreen", "Pantalla de bienvenida con fondo de degradado y contenido centrado."],
      ["ion-slides / swiper", "Carrusel de 3 pasos; los puntos inferiores son la paginación."],
      ["ion-button (expand=\"block\")", "“Crear cuenta” (solid) y “Ya tengo cuenta” (fill=\"outline\")."],
    ],
  },
  login: {
    label: "Login",
    notes: [
      ["ion-input + ion-item", "Correo y contraseña; usa fill=\"outline\" y labelPlacement=\"stacked\"."],
      ["ion-input type=\"password\"", "Toggle de visibilidad con ion-icon como slot=\"end\"."],
      ["ion-button", "“Entrar” + botones sociales (Apple/Google) con ion-icon slot=\"start\"."],
    ],
  },
  home: {
    label: "Inicio",
    notes: [
      ["ion-header (collapse) + ion-toolbar", "Saludo + avatar (slot start) y campana (slot end) con ion-badge."],
      ["ion-card", "Tarjeta de saldo con degradado de marca; el ojo alterna visibilidad."],
      ["ion-grid / ion-row", "Acciones rápidas (Enviar, Solicitar, Pagar, Cobrar)."],
      ["ion-progress-bar", "Barra de la meta de ahorro (value=0.62)."],
      ["ion-list + ion-item", "Movimientos recientes; cada item navega al detalle."],
    ],
  },
  transactions: {
    label: "Movimientos",
    notes: [
      ["ion-searchbar", "Búsqueda de comercio o persona."],
      ["ion-segment / ion-chip", "Filtro Todos / Ingresos / Gastos."],
      ["ion-item-divider (sticky)", "Encabezado por día (Hoy, Ayer, …)."],
      ["ion-list + ion-item button", "Filas de transacción; ion-label + nota de monto a la derecha."],
      ["ion-infinite-scroll", "Carga progresiva del historial."],
    ],
  },
  txdetail: {
    label: "Detalle de movimiento",
    notes: [
      ["ion-toolbar + ion-back-button", "Volver; ion-buttons slot=\"end\" para más opciones."],
      ["ion-list (lines=\"inset\")", "Pares clave/valor: estado, fecha, método, referencia."],
      ["ion-chip color=\"success\"", "Etiqueta de estado “Completado”."],
      ["ion-button (outline)", "Descargar comprobante / Reportar problema."],
    ],
  },
  send: {
    label: "Enviar dinero",
    notes: [
      ["ion-searchbar + ion-list", "Buscar y elegir contacto; recientes como avatares horizontales."],
      ["ion-avatar", "Iniciales del contacto."],
      ["teclado custom (ion-grid)", "Pad numérico propio; evita el teclado nativo para montos."],
      ["ion-button + ion-footer", "CTA fijo “Enviar” en el pie de pantalla."],
      ["ion-modal / página", "Confirmación de éxito tras enviar."],
    ],
  },
  sendDone: {
    label: "Envío exitoso",
    notes: [
      ["ion-content centrado", "Ícono de éxito + mensaje de confirmación."],
      ["ion-chip", "Detalle “SPEI · llega en segundos”."],
      ["ion-button", "“Volver al inicio” regresa al tab de Inicio."],
    ],
  },
  notifications: {
    label: "Notificaciones",
    notes: [
      ["ion-toolbar + ion-back-button", "Acción “Marcar leídas” en slot=\"end\"."],
      ["ion-list + ion-item", "Cada aviso con ion-icon, ion-label (text-wrap) y punto de no leído."],
      ["ion-note", "Marca temporal (hace 5 min, Ayer…)."],
    ],
  },
  cards: {
    label: "Tarjetas",
    notes: [
      ["ion-slides", "Carrusel de tarjetas (débito/crédito) si hay más de una."],
      ["componente custom “bankcard”", "Visual de tarjeta con degradado; no es un ion- nativo."],
      ["ion-grid", "Tiles de saldo débito / crédito disponible."],
      ["ion-toggle dentro de ion-item", "Congelar tarjeta y compras en línea."],
      ["ion-list", "Ver PIN/CVV, límites, tarjeta física…"],
    ],
  },
  stats: {
    label: "Estadísticas",
    notes: [
      ["ion-segment", "Periodo Semana / Mes / Año."],
      ["donut (conic-gradient o Chart.js)", "Gasto por categoría; en producción usa una lib de charts."],
      ["barras (divs o Chart.js)", "Gasto mensual; resaltar el mes actual."],
      ["ion-card", "Contenedores de cada bloque de datos."],
    ],
  },
  profile: {
    label: "Perfil",
    notes: [
      ["ion-card / ion-item", "Cabecera con avatar, nombre y estado verificado (ion-chip)."],
      ["ion-list-header + ion-list", "Grupos: Cuenta, Preferencias."],
      ["ion-item (detail)", "Filas con ion-icon, ion-label y flecha de detalle."],
      ["ion-button color=\"danger\"", "Cerrar sesión."],
    ],
  },
};

function DevPanel({ screenId, visible }) {
  const info = IONIC_NOTES[screenId] || IONIC_NOTES.home;
  return (
    <aside className={"devpanel" + (visible ? "" : " hidden")}>
      <h3>Notas para Ionic</h3>
      <div className="pscreen">{info.label}</div>
      {info.notes.map(([code, desc], i) => (
        <div className="nt" key={i}>
          <code>{code}</code>
          <p>{desc}</p>
        </div>
      ))}
      <div className="hint">
        Mapeo sugerido de cada zona de la pantalla a componentes Ionic. Pásalo junto con el HTML a Claude Code para reconstruir la app.
      </div>
    </aside>
  );
}

function App() {
  const [theme, setTheme] = React.useState("dark");
  const [showNotes, setShowNotes] = React.useState(true);
  const [authed, setAuthed] = React.useState(false);
  // pila de navegación: [{id, params}]
  const [stack, setStack] = React.useState([{ id: "onboarding", params: {} }]);
  const [dir, setDir] = React.useState("fwd");
  const vpRef = React.useRef(null);

  const current = stack[stack.length - 1];
  const conf = SCREENS[current.id];

  const nav = {
    push: (id, params = {}) => { setDir("fwd"); setStack((s) => [...s, { id, params }]); },
    pop: () => { setDir("back"); setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)); },
    tab: (tabId) => { setDir("fwd"); setStack([{ id: TAB_ROOT[tabId], params: {} }]); },
    authenticate: () => { setAuthed(true); setDir("fwd"); setStack([{ id: "home", params: {} }]); },
    logout: () => { setAuthed(false); setDir("back"); setStack([{ id: "onboarding", params: {} }]); },
  };

  // reset scroll al cambiar de pantalla
  React.useEffect(() => { if (vpRef.current) vpRef.current.scrollTop = 0; }, [stack.length, current.id]);

  const Comp = window[conf.comp];
  const activeTab = conf.tab;

  return (
    <div className="stage">
      <div className="toolbar">
        <div className="brand">
          <span className="dot"><Icon name="wallet" size={13} style={{ color: "#fff" }} /></span>
          Nimbo
          <span className="tname">· Banca personal · Prototipo Ionic</span>
        </div>
        <div className="spacer" />
        <div className="seg">
          <button className={theme === "light" ? "active" : ""} onClick={() => setTheme("light")}>
            <Icon name="sun" size={15} /> Claro
          </button>
          <button className={theme === "dark" ? "active" : ""} onClick={() => setTheme("dark")}>
            <Icon name="moon" size={15} /> Oscuro
          </button>
        </div>
        <button className={"ctl" + (showNotes ? " on" : "")} onClick={() => setShowNotes(!showNotes)}>
          <Icon name="copy" size={15} /> Notas Ionic
        </button>
      </div>

      <div className="phone">
        <div className="phone-frame-label">{IONIC_NOTES[current.id]?.label}</div>
        <div className="phone-screen" data-theme={theme} data-screen-label={current.id}>
          <div className="island" />
          <StatusBar />
          <div className="viewport" ref={vpRef}>
            <div className={dir === "fwd" ? "anim-fwd" : "anim-back"} key={current.id + stack.length}>
              <Comp nav={nav} params={current.params} />
            </div>
          </div>
          {conf.chrome && conf.tab && (
            <TabBar active={activeTab} onChange={(t) => nav.tab(t)} />
          )}
          <div className="home-ind" />
        </div>
      </div>

      <DevPanel screenId={current.id} visible={showNotes} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
