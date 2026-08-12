import { Layout } from "./components/layout/Layout";
import { Hero } from "./components/sections/Hero";
import { About } from "./components/sections/About";
import { Projects } from "./components/sections/Projects";
import { Skills } from "./components/sections/Skills";
import { Contact } from "./components/sections/Contact";

/**
 * App raíz.
 *
 * Monta el Layout con las 5 secciones del portfolio. Cada sección tiene
 * su propio id para que el header pueda hacer scroll a ellas.
 */
function App() {
  return (
    <Layout>
      <Hero />
      <About />
      <Projects />
      <Skills />
      <Contact />
    </Layout>
  );
}

export default App;