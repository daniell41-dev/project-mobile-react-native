/* Componentes compartidos: iconos, status bar, tab bar, headers, primitivas */

const ICONS = {
  // navegación
  home: "M3 10.5 12 3l9 7.5M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5",
  swap: "M7 7h13M7 7l3-3M7 7l3 3M17 17H4m13 0-3-3m3 3-3 3",
  card: "M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 10h18",
  chart: "M4 20V10M10 20V4M16 20v-7M22 20H2",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21a8 8 0 0 1 16 0",
  // acciones
  bell: "M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3",
  plus: "M12 5v14M5 12h14",
  send: "M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z",
  arrowLeft: "M19 12H5M12 19l-7-7 7-7",
  arrowUpRight: "M7 17 17 7M7 7h10v10",
  arrowDownLeft: "M17 7 7 17M17 17H7V7",
  chevronRight: "M9 18l6-6-6-6",
  chevronDown: "M6 9l6 6 6-6",
  qr: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z",
  eye: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  eyeOff: "M3 3l18 18M10.6 10.6a3 3 0 0 0 4 4M9.4 5.2A10 10 0 0 1 12 5c6.5 0 10 7 10 7a16 16 0 0 1-3 3.7M6.1 6.1A16 16 0 0 0 2 12s3.5 7 10 7a10 10 0 0 0 2.6-.3",
  filter: "M3 5h18M6 12h12M10 19h4",
  // financiero
  wallet: "M3 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1H6a1 1 0 0 0 0 2h14a1 1 0 0 1 1 1v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM17 13a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z",
  bank: "M3 9l9-5 9 5M4 9v10M20 9v10M8 9v10M16 9v10M3 19h18",
  bolt: "M13 2 3 14h8l-1 8 10-12h-8z",
  // categorías
  salary: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  music: "M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
  store: "M4 9V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3M4 9l-1 3h18l-1-3M5 12v8h14v-8M9 20v-5h6v5",
  car: "M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11M5 11h14v6H5zM5 17v2H7v-2M19 17v2h-2v-2M7.5 14h.01M16.5 14h.01",
  person: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21a8 8 0 0 1 16 0",
  coffee: "M4 8h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM17 9h2a2 2 0 0 1 0 4h-2M7 4V2M11 4V2M15 4V2",
  bag: "M6 8h12l-1 12H7zM9 8V6a3 3 0 0 1 6 0v2",
  refund: "M3 7v6h6M3 13a9 9 0 1 0 2.5-6.4L3 9",
  ticket: "M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 2 2 0 0 0 0-4ZM12 6v12",
  // perfil / ajustes
  shield: "M12 3 4 6v6c0 5 3.5 7.5 8 9 4.5-1.5 8-4 8-9V6z",
  gear: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19 12a7 7 0 0 0-.1-1l2-1.6-2-3.4-2.4 1a7 7 0 0 0-1.7-1l-.3-2.5h-4l-.3 2.5a7 7 0 0 0-1.7 1l-2.4-1-2 3.4 2 1.6a7 7 0 0 0 0 2l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 1.7 1l.3 2.5h4l.3-2.5a7 7 0 0 0 1.7-1l2.4 1 2-3.4-2-1.6a7 7 0 0 0 .1-1Z",
  help: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM9.5 9a2.5 2.5 0 0 1 4.5 1.5c0 1.5-2 2-2 3.5M12 17h.01",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  moon: "M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z",
  sun: "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4",
  snowflake: "M12 2v20M12 2l-3 3M12 2l3 3M12 22l-3-3M12 22l3-3M3 7l18 10M3 7l4 .5M3 7 4 3M21 17l-4-.5M21 17l-1 4M21 7 3 17M21 7l-4 .5M21 7l-1-4M3 17l4-.5M3 17l1 4",
  globe: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18",
  lock: "M5 11a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2zM8 9V7a4 4 0 0 1 8 0v2",
  trending: "M22 7l-8.5 8.5-5-5L2 17M16 7h6v6",
  check: "M20 6 9 17l-5-5",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2",
  mail: "M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 7l9 6 9-6",
  phone: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L19 13l2 5v0a2 2 0 0 1-2 2A16 16 0 0 1 3 4a2 2 0 0 1 2-2",
  apple: "M12 7c1-2 3-3 4-3 0 2-1 3-2 4M12 7c-1-1.5-3-2-4-1.5-2 1-3 4-2 7 .6 1.8 2 4.5 3.5 4.5 1 0 1.3-.6 2.5-.6s1.5.6 2.5.6c1.6 0 3-2.8 3.6-4.6",
  more: "M5 12h.01M12 12h.01M19 12h.01",
  download: "M12 3v12M7 10l5 5 5-5M4 21h16",
  copy: "M9 9h10v10a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1zM5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1",
  flame: "M12 22c4 0 7-3 7-7 0-3-2-5-3-7-1 1-2 1.5-3 1 1-3-1-6-3-7 0 2-1 3.5-2.5 5C6 9 5 11 5 14c0 4 3 8 7 8Z",
};

function Icon({ name, size = 22, style }) {
  const d = ICONS[name];
  if (!d) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={style} aria-hidden="true">
      {d.split("M").filter(Boolean).map((seg, i) => <path key={i} d={"M" + seg} />)}
    </svg>
  );
}

function StatusBar() {
  return (
    <div className="statusbar">
      <span>9:41</span>
      <div className="sb-right">
        {/* señal */}
        <svg width="18" height="13" viewBox="0 0 18 13" fill="currentColor">
          <rect x="0" y="8" width="3" height="5" rx="1" />
          <rect x="5" y="5" width="3" height="8" rx="1" />
          <rect x="10" y="2.5" width="3" height="10.5" rx="1" />
          <rect x="15" y="0" width="3" height="13" rx="1" opacity="0.4" />
        </svg>
        {/* wifi */}
        <svg width="17" height="13" viewBox="0 0 17 13" fill="currentColor">
          <path d="M8.5 2.2c2.8 0 5.4 1.1 7.3 2.9l-1.3 1.4A8.3 8.3 0 0 0 8.5 4.1 8.3 8.3 0 0 0 2.7 6.5L1.3 5.1A10.4 10.4 0 0 1 8.5 2.2Z"/>
          <path d="M8.5 6.1c1.7 0 3.3.7 4.5 1.8l-1.4 1.4a4.5 4.5 0 0 0-6.2 0L4 7.9A6.4 6.4 0 0 1 8.5 6.1Z"/>
          <circle cx="8.5" cy="11" r="1.6"/>
        </svg>
        {/* batería */}
        <svg width="27" height="13" viewBox="0 0 27 13" fill="none">
          <rect x="0.5" y="0.5" width="22" height="12" rx="3.5" stroke="currentColor" opacity="0.5"/>
          <rect x="2" y="2" width="17" height="9" rx="2" fill="currentColor"/>
          <rect x="24" y="4" width="2" height="5" rx="1" fill="currentColor" opacity="0.5"/>
        </svg>
      </div>
    </div>
  );
}

function TabBar({ active, onChange }) {
  const tabs = [
    { id: "home", label: "Inicio", icon: "home" },
    { id: "transactions", label: "Movimientos", icon: "swap" },
    { id: "cards", label: "Tarjetas", icon: "card" },
    { id: "stats", label: "Análisis", icon: "chart" },
    { id: "profile", label: "Perfil", icon: "user" },
  ];
  return (
    <div className="tabbar">
      {tabs.map((t) => (
        <div key={t.id} className={"tab" + (active === t.id ? " active" : "")} onClick={() => onChange(t.id)}>
          <Icon name={t.icon} />
          <span>{t.label}</span>
        </div>
      ))}
    </div>
  );
}

function AppBar({ title, onBell, notifCount, avatar, onAvatar }) {
  return (
    <div className="appbar">
      {avatar && (
        <div className="avatar" onClick={onAvatar} style={{ cursor: "pointer" }}>{avatar}</div>
      )}
      <h1>{title}</h1>
      <div className="grow" />
      {onBell && (
        <div className="iconbtn-wrap">
          <div className="iconbtn" onClick={onBell}>
            <Icon name="bell" />
            {notifCount > 0 && <span className="badge">{notifCount}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

function BackBar({ title, onBack, right }) {
  return (
    <div className="backbar">
      <div className="iconbtn" onClick={onBack}><Icon name="arrowLeft" /></div>
      <div className="title">{title}</div>
      <div style={{ flex: 1 }} />
      {right}
    </div>
  );
}

function TxRow({ t, onClick }) {
  const pos = t.amount > 0;
  return (
    <div className="item" onClick={onClick}>
      <div className="lead"><Icon name={t.icon} /></div>
      <div className="body">
        <div className="t">{t.merchant}</div>
        <div className="s">{t.cat} · {t.time}</div>
      </div>
      <div className={"amt" + (pos ? " pos" : "")}>
        {pos ? "+" : "−"}{window.DATA.moneyAbs(t.amount)}
      </div>
    </div>
  );
}

Object.assign(window, { Icon, ICONS, StatusBar, TabBar, AppBar, BackBar, TxRow });
