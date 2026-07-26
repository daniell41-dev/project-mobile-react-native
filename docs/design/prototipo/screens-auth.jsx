/* Pantallas de autenticación: Onboarding + Login */

function Onboarding({ nav }) {
  return (
    <div className="screen anim-fwd">
      <div className="onb">
        <div className="hero">
          <div className="logo"><Icon name="wallet" size={40} /></div>
          <div>
            <h1>Tu dinero,<br />con claridad.</h1>
            <p style={{ margin: "14px auto 0" }}>
              Banca personal sin comisiones ocultas. Envía, paga y ahorra desde un solo lugar.
            </p>
          </div>
          <div className="dots">
            <i className="on" /><i /><i />
          </div>
        </div>
        <div className="actions">
          <button className="btn" onClick={() => nav.push("login")}>Crear cuenta</button>
          <button className="btn ghost" onClick={() => nav.push("login")}>Ya tengo cuenta</button>
          <div className="legal">
            Al continuar aceptas los Términos y el Aviso de Privacidad.
          </div>
        </div>
      </div>
    </div>
  );
}

function Login({ nav }) {
  return (
    <div className="screen anim-fwd">
      <div className="onb" style={{ justifyContent: "flex-start", paddingTop: 8 }}>
        <div className="iconbtn" onClick={() => nav.pop()} style={{ marginBottom: 28 }}>
          <Icon name="arrowLeft" />
        </div>
        <div style={{ flex: "0 0 auto" }}>
          <h1 style={{ fontSize: 28 }}>Bienvenida de nuevo</h1>
          <p style={{ marginTop: 10 }}>Ingresa con tu correo para continuar.</p>
        </div>

        <div style={{ marginTop: 34 }}>
          <div className="field">
            <label>Correo electrónico</label>
            <div className="input focus">
              <Icon name="mail" />
              <span>andrea.salas@gmail.com</span>
            </div>
          </div>
          <div className="field">
            <label>Contraseña</label>
            <div className="input">
              <Icon name="lock" />
              <span className="ph">••••••••••</span>
              <div style={{ flex: 1 }} />
              <Icon name="eyeOff" />
            </div>
          </div>
          <div style={{ textAlign: "right", marginTop: 2, marginBottom: 22 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)" }}>¿Olvidaste tu contraseña?</span>
          </div>
          <button className="btn" onClick={() => nav.authenticate()}>Entrar</button>
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "8px 0 18px" }}>
          <div style={{ flex: 1, height: 1, background: "var(--hairline)" }} />
          <span style={{ fontSize: 12.5, color: "var(--text-mute)", fontWeight: 600 }}>o continúa con</span>
          <div style={{ flex: 1, height: 1, background: "var(--hairline)" }} />
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button className="btn ghost" onClick={() => nav.authenticate()}><Icon name="apple" size={20} /> Apple</button>
          <button className="btn ghost" onClick={() => nav.authenticate()}><Icon name="globe" size={20} /> Google</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Onboarding, Login });
