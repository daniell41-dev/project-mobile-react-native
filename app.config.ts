import type { ConfigContext, ExpoConfig } from 'expo/config';

// app.json sigue siendo la fuente de verdad de la configuración (Expo lo lee primero y lo
// pasa aquí como `config`). Este archivo solo añade lo único que no puede ser estático: el
// baseUrl del export web.
//
// GitHub Pages sirve el sitio en https://<usuario>.github.io/<repo>/, no en la raíz del
// dominio. Sin baseUrl, `expo export -p web` genera <script src="/_expo/static/js/..."> —
// una ruta absoluta que en Pages apunta a la raíz del dominio y da 404, dejando la página
// en blanco (el bundle nunca carga). Con baseUrl, Expo antepone el subpath a todos los
// recursos.
//
// Va por variable de entorno y no fijo en app.json a propósito: solo el workflow de Pages
// (.github/workflows/pages.yml) la define. Así `pnpm web` y `pnpm build:web` en local
// siguen sirviendo desde la raíz — de lo que depende la verificación visual con Playwright
// que se usa en todas las fases (ver docs/02 PARTE 3).
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...(config as ExpoConfig),
  experiments: {
    ...config.experiments,
    baseUrl: process.env.INDIGO_WEB_BASE_URL ?? '',
  },
});
