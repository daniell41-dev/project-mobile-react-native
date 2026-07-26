/* Pantallas principales: Home, Movimientos, Detalle, Enviar, Notificaciones */

function Home({ nav }) {
  const D = window.DATA;
  const [hidden, setHidden] = React.useState(false);
  const recent = D.tx.slice(0, 4);
  const quick = [
    { icon: "send", label: "Enviar", go: () => nav.push("send") },
    { icon: "arrowDownLeft", label: "Solicitar", go: () => nav.push("send") },
    { icon: "bolt", label: "Pagar", go: () => nav.push("send") },
    { icon: "qr", label: "Cobrar", go: () => nav.push("send") },
  ];
  return (
    <div className="screen anim-fwd">
      <AppBar title="Hola, Andrea" avatar={D.user.initials} onAvatar={() => nav.tab("profile")}
        onBell={() => nav.push("notifications")} notifCount={3} />

      <div className="balance">
        <div className="row">
          <span className="label">Saldo disponible</span>
          <div onClick={() => setHidden(!hidden)} style={{ cursor: "pointer", color: "rgba(255,255,255,0.8)" }}>
            <Icon name={hidden ? "eyeOff" : "eye"} size={18} />
          </div>
        </div>
        <div className="big">{hidden ? "$ •••••••" : D.money(D.user.balance)}</div>
        <div className="sub" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="pill"><Icon name="trending" /> +4.2%</span>
          <span>este mes</span>
        </div>
        <div className="chip-num">{D.user.account}</div>
      </div>

      <div style={{ height: 22 }} />
      <div className="quick">
        {quick.map((q) => (
          <div className="qa" key={q.label} onClick={q.go}>
            <div className="ic"><Icon name={q.icon} /></div>
            <span>{q.label}</span>
          </div>
        ))}
      </div>

      {/* meta de ahorro */}
      <div className="section-title"><h2>Meta de ahorro</h2><a onClick={() => nav.tab("cards")}>Ver</a></div>
      <div className="pad">
        <div className="card" style={{ padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="lead" style={{ width: 44, height: 44, borderRadius: 14, display: "grid", placeItems: "center", background: "var(--accent-soft)", color: "var(--accent)", border: 0 }}>
              <Icon name="flame" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14.5, fontWeight: 700 }}>Vacaciones · Oaxaca</div>
              <div style={{ fontSize: 12.5, color: "var(--text-dim)", marginTop: 2 }}>
                {D.money(12400)} <span style={{ color: "var(--text-mute)" }}>de {D.money(20000)}</span>
              </div>
            </div>
            <div className="tnum" style={{ fontWeight: 700, color: "var(--accent)" }}>62%</div>
          </div>
          <div style={{ height: 8, borderRadius: 999, background: "var(--surface-3)", marginTop: 14, overflow: "hidden" }}>
            <div style={{ width: "62%", height: "100%", background: "var(--accent)", borderRadius: 999 }} />
          </div>
        </div>
      </div>

      <div className="section-title"><h2>Movimientos recientes</h2><a onClick={() => nav.tab("transactions")}>Ver todos</a></div>
      <div className="list scroll-pad">
        {recent.map((t) => <TxRow key={t.id} t={t} onClick={() => nav.push("txdetail", { id: t.id })} />)}
      </div>
    </div>
  );
}

function Transactions({ nav }) {
  const D = window.DATA;
  const [filter, setFilter] = React.useState("all");
  const filtered = D.tx.filter((t) =>
    filter === "all" ? true : filter === "in" ? t.amount > 0 : t.amount < 0
  );
  // agrupar por día
  const groups = {};
  filtered.forEach((t) => { (groups[t.day] = groups[t.day] || []).push(t); });

  return (
    <div className="screen anim-fwd">
      <AppBar title="Movimientos" onBell={() => nav.push("notifications")} notifCount={3} />
      <div className="pad" style={{ marginBottom: 4 }}>
        <div className="field" style={{ marginBottom: 12 }}>
          <div className="input">
            <Icon name="search" />
            <span className="ph">Buscar comercio o persona</span>
          </div>
        </div>
      </div>
      <div className="pad" style={{ display: "flex", gap: 8, marginBottom: 4 }}>
        {[["all", "Todos"], ["in", "Ingresos"], ["out", "Gastos"]].map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)}
            style={{
              flex: 1, height: 38, borderRadius: 999, cursor: "pointer",
              fontFamily: "var(--font-ui)", fontSize: 13.5, fontWeight: 700,
              border: "1px solid var(--hairline)",
              background: filter === k ? "var(--accent)" : "var(--surface)",
              color: filter === k ? "var(--accent-ink)" : "var(--text-dim)",
            }}>{l}</button>
        ))}
      </div>

      <div className="list scroll-pad">
        {Object.keys(groups).map((day) => (
          <div key={day}>
            <div className="daygroup-label">{day}</div>
            {groups[day].map((t) => <TxRow key={t.id} t={t} onClick={() => nav.push("txdetail", { id: t.id })} />)}
          </div>
        ))}
      </div>
    </div>
  );
}

function TxDetail({ nav, params }) {
  const D = window.DATA;
  const t = D.tx.find((x) => x.id === params.id) || D.tx[0];
  const pos = t.amount > 0;
  const rows = [
    ["Estado", <span className="tag"><Icon name="check" /> Completado</span>],
    ["Fecha", `${t.date} · ${t.time}`],
    ["Categoría", t.cat],
    ["Método", t.method],
    ["Referencia", t.ref],
    ["Comisión", D.money(0)],
  ];
  return (
    <div className="screen anim-fwd">
      <BackBar title="Detalle" onBack={() => nav.pop()}
        right={<div className="iconbtn" onClick={() => {}}><Icon name="more" /></div>} />
      <div className="tx-hero">
        <div className="ic"><Icon name={t.icon} size={30} /></div>
        <div className={"amt" + (pos ? " pos" : "")}>{pos ? "+" : "−"}{D.moneyAbs(t.amount)}</div>
        <div className="nm">{t.merchant}</div>
      </div>

      <div className="detail-list">
        {rows.map(([k, v], i) => (
          <div className="row" key={i}>
            <div className="k">{k}</div>
            <div className="v">{v}</div>
          </div>
        ))}
      </div>

      <div className="pad" style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 10 }}>
        <button className="btn ghost"><Icon name="download" /> Descargar comprobante</button>
        <button className="btn ghost" style={{ color: "var(--down)" }}>Reportar un problema</button>
      </div>
    </div>
  );
}

function Send({ nav }) {
  const D = window.DATA;
  const [amount, setAmount] = React.useState("0");
  const [who, setWho] = React.useState(null);

  function press(k) {
    setAmount((a) => {
      if (k === "del") return a.length <= 1 ? "0" : a.slice(0, -1);
      if (k === ".") return a.includes(".") ? a : a + ".";
      if (a === "0" && k !== ".") return k;
      const dec = a.split(".")[1];
      if (dec && dec.length >= 2) return a;
      return a + k;
    });
  }
  const display = amount === "0" ? "0" : amount;

  if (!who) {
    return (
      <div className="screen anim-fwd">
        <BackBar title="Enviar dinero" onBack={() => nav.pop()} />
        <div className="pad">
          <div className="field"><div className="input"><Icon name="search" /><span className="ph">Nombre, teléfono o CLABE</span></div></div>
        </div>
        <div className="pad" style={{ display: "flex", gap: 12, overflowX: "auto", padding: "6px 20px 4px" }}>
          {D.contacts.filter((c) => c.recent).map((c) => (
            <div key={c.id} onClick={() => setWho(c)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7, cursor: "pointer", flex: "0 0 auto" }}>
              <div className="avatar" style={{ width: 56, height: 56, fontSize: 18 }}>{c.initials}</div>
              <span style={{ fontSize: 12, color: "var(--text-dim)", fontWeight: 600 }}>{c.name.split(" ")[0]}</span>
            </div>
          ))}
        </div>
        <div className="section-title"><h2>Tus contactos</h2></div>
        <div className="list scroll-pad">
          {D.contacts.map((c) => (
            <div className="item" key={c.id} onClick={() => setWho(c)}>
              <div className="avatar">{c.initials}</div>
              <div className="body"><div className="t">{c.name}</div><div className="s">{c.sub}</div></div>
              <Icon name="chevronRight" size={18} style={{ color: "var(--text-mute)" }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "del"];
  return (
    <div className="screen anim-fwd">
      <BackBar title="Enviar" onBack={() => setWho(null)} />
      <div className="amount-display">
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 999, padding: "7px 14px 7px 7px" }}>
            <div className="avatar" style={{ width: 30, height: 30, fontSize: 12 }}>{who.initials}</div>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{who.name}</span>
          </div>
        </div>
        <div className="amt"><span className="cur">$</span>{display}</div>
        <div className="who" style={{ marginTop: 8 }}>Saldo disponible {D.money(D.user.balance)}</div>
      </div>
      <div className="keypad">
        {keys.map((k) => (
          <div className="k" key={k} onClick={() => press(k)}>
            {k === "del" ? <Icon name="arrowLeft" /> : k}
          </div>
        ))}
      </div>
      <div className="pad" style={{ marginTop: 14, paddingBottom: 10 }}>
        <button className="btn" onClick={() => nav.push("sendDone", { who, amount: display })}>
          <Icon name="send" /> Enviar {amount !== "0" ? D.money(parseFloat(amount)) : ""}
        </button>
      </div>
    </div>
  );
}

function SendDone({ nav, params }) {
  const D = window.DATA;
  return (
    <div className="screen anim-fwd">
      <div className="onb" style={{ justifyContent: "center", alignItems: "center", textAlign: "center", gap: 20 }}>
        <div className="logo" style={{ background: "var(--up-soft)", boxShadow: "none" }}>
          <Icon name="check" size={40} style={{ color: "var(--up)" }} />
        </div>
        <div>
          <h1 style={{ fontSize: 26 }}>¡Listo!</h1>
          <p style={{ marginTop: 10 }}>
            Enviaste <b style={{ color: "var(--text)" }}>${params.amount}</b> a {params.who.name}.
          </p>
        </div>
        <div className="tag" style={{ background: "var(--surface)", color: "var(--text-dim)", border: "1px solid var(--hairline)" }}>
          <Icon name="clock" /> SPEI · llega en segundos
        </div>
        <div style={{ width: "100%", marginTop: 10 }}>
          <button className="btn" onClick={() => nav.tab("home")}>Volver al inicio</button>
        </div>
      </div>
    </div>
  );
}

function Notifications({ nav }) {
  const items = [
    { icon: "arrowDownLeft", t: "Recibiste un pago", s: "Carlos Ruiz te envió $850.00", time: "hace 5 min", unread: true, pos: true },
    { icon: "salary", t: "Depósito de nómina", s: "ACME S.A. · +$18,400.00", time: "hace 2 h", unread: true, pos: true },
    { icon: "shield", t: "Inicio de sesión nuevo", s: "iPhone 15 · CDMX", time: "hace 6 h", unread: true },
    { icon: "flame", t: "Vas muy bien con tu meta", s: "Llevas 62% de Vacaciones · Oaxaca", time: "Ayer", unread: false },
    { icon: "card", t: "Estado de cuenta listo", s: "Mayo 2026 disponible", time: "2 jun", unread: false },
  ];
  return (
    <div className="screen anim-fwd">
      <BackBar title="Notificaciones" onBack={() => nav.pop()}
        right={<a style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)", cursor: "pointer" }}>Marcar leídas</a>} />
      <div className="list scroll-pad" style={{ marginTop: 6 }}>
        {items.map((n, i) => (
          <div className="item" key={i} style={{ alignItems: "flex-start" }}>
            <div className="lead" style={{ color: n.pos ? "var(--up)" : "var(--accent)" }}><Icon name={n.icon} /></div>
            <div className="body">
              <div className="t" style={{ whiteSpace: "normal" }}>{n.t}</div>
              <div className="s" style={{ whiteSpace: "normal" }}>{n.s}</div>
              <div style={{ fontSize: 11.5, color: "var(--text-mute)", marginTop: 4 }}>{n.time}</div>
            </div>
            {n.unread && <i style={{ width: 9, height: 9, borderRadius: 999, background: "var(--accent)", flex: "0 0 auto", marginTop: 6 }} />}
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { Home, Transactions, TxDetail, Send, SendDone, Notifications });
