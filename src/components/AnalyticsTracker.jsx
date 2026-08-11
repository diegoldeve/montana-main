import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Manda un page_view a Google Analytics en cada cambio de ruta (incluida la carga inicial)
function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    if (import.meta.env.DEV) return; // no contaminar analytics desde localhost
    if (location.pathname.startsWith("/admin")) return; // el panel de admin no se trackea
    if (typeof window.gtag !== "function") return;

    window.gtag("event", "page_view", {
      page_path: location.pathname + location.search,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [location]);

  return null;
}

export default AnalyticsTracker;
