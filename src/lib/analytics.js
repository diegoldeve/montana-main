// Empuja un evento personalizado al dataLayer de Google Tag Manager.
// Cada evento necesita en GTM su activador "Evento personalizado" y su etiqueta
// GA4 (ver gtm/GTM-MWCTMFC5-eventos.json). No mandar datos personales
// (nombre, teléfono, email) como parámetros: GA4 lo prohíbe.
//
// Eventos en uso:
//   contacto_whatsapp  { origen }                 clic en un enlace de WhatsApp
//   solicitud_cita     { tipo_terapia, inversion } formulario de cita enviado con éxito
export function trackEvent(event, params = {}) {
  if (import.meta.env.DEV) return; // no contaminar analytics desde localhost
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
}
