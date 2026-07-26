/* Pantallas: Tarjetas, Estadísticas, Perfil */

function Cards({ nav }) {
  const D = window.DATA;
  const [frozen, setFrozen] = React.useState(false);
  const [online, setOnline] = React.useState(true);
  const controls = [
    { icon: "snowflake", nm: "Congelar tarjeta", ds: frozen ? "Pagos bloqueados" : "Activa al instante", on: frozen, set: () => setFrozen(!frozen) },
    { icon: "globe", nm: "Compras en línea", ds: online ? "Permitidas" : "Bloqueadas", on: online, set: () => setOnline(!online) },
  ];
  return (
    <div className="screen anim-fwd">
      <AppBar title="Tarjetas" onBell={() => nav.push("notifications")} notifCount={3} />

      <div className="pad">
        <div className="bankcard debit">
          <div className="brandrow">
            <span className="nm">Nimbo</span>
            <Icon name="wallet" size={22} />
          </div>
          <div className="chip" />
          <div className="num">4821&nbsp;&nbsp;5519&nbsp;&nbsp;0042&nbsp;&nbsp;8821</div>
          <div className="foot">
            <div>
              <div className="lbl">Titular</div>
              <div className="val">ANDREA SALAS</div>
            </div>
            <div className="mc"><i /><i /></div>
          </div>
        </div>
      </div>

      {/* tira de saldo/crédito */}
      <div className="pad" style={{ display: "flex", gap: 12, marginTop: 14 }}>
        <div className="card" style={{ flex: 1, padding: 14 }}>
          <div style={{ fontSize: 12, color: "var(--text-dim)", fontWeight: 600 }}>Saldo débito</div>
          <div className="tnum" style={{ fontSize: 19, fontWeight: 700, marginTop: 4 }}>{D.money(48250.75)}</div>
        </div>
        <div className="card" style={{ flex: 1, padding: 14 }}>
          <div style={{ fontSize: 12, color: "var(--text-dim)", fontWeight: 600 }}>Crédito disponible</div>
          <div className="tnum" style={{ fontSize: 19, fontWeight: 700, marginTop: 4 }}>{D.money(32000)}</div>
        </div>
      </div>

      <div className="section-title"><h2>Controles</h2></div>
      <div className="ctrl-grid">
        {controls.map((c) => (
          <div className="ctrl-tile" key={c.nm} onClick={c.set}>
            <div className="top">
              <div className="ic"><Icon name={c.icon} /></div>
              <div className={"switch" + (c.on ? " on" : "")}><i /></div>
            </div>
            <div>
              <div className="nm">{c.nm}</div>
              <div className="ds">{c.ds}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="section-title"><h2>Más opciones</h2></div>
      <div className="list scroll-pad">
        {[
          ["lock", "Ver PIN y CVV", null],
          ["copy", "Copiar datos de la tarjeta", null],
          ["trending", "Ajustar límites", "$50,000 / mes"],
          ["card", "Tarjeta física", "Pedir reposición"],
        ].map(([ic, t, val]) => (
          <div className="prow" key={t}>
            <div className="ic"><Icon name={ic} /></div>
            <div className="t">{t}</div>
            {val && <div className="val">{val}</div>}
            <div className="chev"><Icon name="chevronRight" size={18} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stats({ nav }) {
  const D = window.DATA;
  // construir conic-gradient del donut
  let acc = 0;
  const stops = D.categories.map((c) => {
    const from = acc; acc += c.pct;
    return `${c.color} ${from}% ${acc}%`;
  }).join(", ");
  const total = D.categories.reduce((s, c) => s + c.amount, 0);

  return (
    <div className="screen anim-fwd">
      <AppBar title="Estadísticas" onBell={() => nav.push("notifications")} notifCount={3} />

      <div className="pad" style={{ display: "flex", gap: 8 }}>
        <div className="seg" style={{ background: "var(--surface)", border: "1px solid var(--hairline)" }}>
          {["Semana", "Mes", "Año"].map((p, i) => (
            <button key={p} className={i === 1 ? "active" : ""}
              style={{ color: i === 1 ? "#fff" : "var(--text-dim)", background: i === 1 ? "var(--accent)" : "transparent" }}>{p}</button>
          ))}
        </div>
      </div>

      <div className="section-title"><h2>Gasto por categoría</h2><span className="muted" style={{ fontSize: 12.5 }}>Junio</span></div>
      <div className="pad">
        <div className="card" style={{ padding: 18 }}>
          <div className="donut-wrap">
            <div className="donut" style={{ background: `conic-gradient(${stops})` }}>
              <div className="hole">
                <div>
                  <div className="v tnum">{D.money(total)}</div>
                  <div className="l">total gastado</div>
                </div>
              </div>
            </div>
            <div className="legend">
              {D.categories.map((c) => (
                <div className="lg" key={c.name}>
                  <span className="sw" style={{ background: c.color }} />
                  <span className="nm">{c.name}</span>
                  <span className="pc">{c.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="section-title"><h2>Gasto mensual</h2><span className="tag"><Icon name="trending" /> −8% vs may</span></div>
      <div className="pad">
        <div className="card" style={{ padding: "20px 18px 16px" }}>
          <div className="bars">
            {D.months.map((m) => (
              <div className={"b" + (m.cur ? " cur" : "")} key={m.mo}>
                <div className="col" style={{ height: "100%" }}>
                  <div className="fill" style={{ height: `${Math.round(m.v * 100)}%`, opacity: m.cur ? 1 : 0.45 }} />
                </div>
                <div className="mo">{m.mo}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="section-title"><h2>Tip de ahorro</h2></div>
      <div className="pad scroll-pad">
        <div className="card" style={{ padding: 16, display: "flex", gap: 12, alignItems: "center" }}>
          <div className="lead" style={{ width: 42, height: 42, borderRadius: 13, display: "grid", placeItems: "center", background: "var(--accent-soft)", color: "var(--accent)", border: 0, flex: "0 0 auto" }}>
            <Icon name="flame" />
          </div>
          <div style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.45 }}>
            Gastaste <b style={{ color: "var(--text)" }}>{D.money(199)}</b> en suscripciones que no usaste este mes. ¿Las revisamos?
          </div>
        </div>
      </div>
    </div>
  );
}

function Profile({ nav }) {
  const D = window.DATA;
  const groups = [
    {
      title: "Cuenta",
      rows: [
        ["user", "Datos personales", null],
        ["bank", "Mis cuentas y CLABE", null],
        ["shield", "Seguridad y biometría", null],
      ],
    },
    {
      title: "Preferencias",
      rows: [
        ["bell", "Notificaciones", null],
        ["globe", "Idioma", "Español"],
        ["help", "Ayuda y soporte", null],
      ],
    },
  ];
  return (
    <div className="screen anim-fwd">
      <AppBar title="Perfil" />
      <div className="pad">
        <div className="card" style={{ padding: 18, display: "flex", alignItems: "center", gap: 14 }}>
          <div className="avatar" style={{ width: 56, height: 56, fontSize: 20, flex: "0 0 auto" }}>{D.user.initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 17, fontWeight: 700 }}>{D.user.name}</div>
            <div style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>andrea.salas@gmail.com</div>
          </div>
          <span className="tag" style={{ flex: "0 0 auto", whiteSpace: "nowrap" }}><Icon name="check" /> Verificada</span>
        </div>
      </div>

      {groups.map((g) => (
        <div key={g.title}>
          <div className="section-title"><h2>{g.title}</h2></div>
          <div className="list">
            {g.rows.map(([ic, t, val]) => (
              <div className="prow" key={t}>
                <div className="ic"><Icon name={ic} /></div>
                <div className="t">{t}</div>
                {val && <div className="val">{val}</div>}
                <div className="chev"><Icon name="chevronRight" size={18} /></div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="pad scroll-pad" style={{ marginTop: 22 }}>
        <button className="btn ghost" style={{ color: "var(--down)" }} onClick={() => nav.logout()}>
          <Icon name="logout" /> Cerrar sesión
        </button>
        <div style={{ textAlign: "center", fontSize: 12, color: "var(--text-mute)", marginTop: 16 }}>Nimbo · versión 1.0.0</div>
      </div>
    </div>
  );
}

Object.assign(window, { Cards, Stats, Profile });
