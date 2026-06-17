import { ComingSoon } from "./components/sections/ComingSoon";

/**
 * App raíz.
 *
 * De momento solo renderiza la página "en desarrollo".
 * Cuando se implemente el portfolio completo, este componente
 * montará el Layout con React Router y las distintas secciones.
 */
function App() {
  return <ComingSoon />;
}

export default App;