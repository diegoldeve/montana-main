import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Empuja un page_view al dataLayer de Google Tag Manager en cada cambio de ruta
// (incluida la carga inicial). En GTM: trigger "Evento personalizado" = page_view
// -> etiqueta GA4 de evento page_view con page_location / page_title / page_path.
function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    if (import.meta.env.DEV) return; // no contaminar analytics desde localhost
    if (location.pathname.startsWith("/admin")) return; // el panel de admin no se trackea

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "page_view",
      page_path: location.pathname + location.search,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [location]);

  return null;
}

export default AnalyticsTracker;
