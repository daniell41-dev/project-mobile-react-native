// Índigo no tiene backend propio (proyecto de portafolio): useMockApi siempre en true,
// igual que el repo hermano project-mobile-ionic. apiBaseUrl y HttpTransactionRepository
// quedan escritos y probados (con MSW) para demostrar el patrón Strategy/Adapter listo
// para cuando exista una API real — basta cambiar este flag, ninguna pantalla se toca.
export const env = {
  apiBaseUrl: 'https://api.indigo.example.mx',
  useMockApi: true,
};
