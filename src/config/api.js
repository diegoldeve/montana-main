// En local, VITE_API_URL queda vacío y las peticiones a /api usan el proxy de Vite (vite.config.js).
// En producción (Vercel), se define VITE_API_URL con la URL pública del backend en Railway.
export const API_URL = import.meta.env.VITE_API_URL || "";
