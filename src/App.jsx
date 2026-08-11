// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Nosotros from "./pages/Nosotros";
import Terapeutas from "./pages/Terapeutas";
import TerapeutaDetalle from "./pages/TerapeutaDetalle";
import AdminFormulario from "./pages/AdminFormulario";
import ScrollToTop from "./components/ScrollToTop";
import AnalyticsTracker from "./components/AnalyticsTracker";
import { Helmet } from "react-helmet";
import { AgendaModalProvider } from "./context/AgendaModalContext";

function App() {
  return (
    <>
     <Helmet>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />
      </Helmet>
    <Router>
      <ScrollToTop />
      <AnalyticsTracker />
      <AgendaModalProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/terapeutas" element={<Terapeutas />} />
          <Route path="/terapeutas/:id" element={<TerapeutaDetalle />} />
          <Route path="/admin/formulario" element={<AdminFormulario />} />
        </Routes>
      </AgendaModalProvider>
    </Router>
    </>
  );
}

export default App;
