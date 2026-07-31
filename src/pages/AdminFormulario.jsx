import { useEffect, useState } from "react";
import "../style/AdminFormulario.css";
import { API_URL } from "../config/api";

const ADMIN_PASSWORD = "Canalizadoras123";

// El backend en Railway puede tardar en responder si la conexión a la base
// se quedó muerta; cada intento tiene timeout y se reintenta hasta 3 veces.
async function fetchSolicitudes({ apiKey, q, signal }) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  const qs = params.toString();
  const url = `${API_URL}/api/solicitudes-agenda${qs ? `?${qs}` : ""}`;

  let lastError;
  for (let intento = 1; intento <= 3; intento++) {
    const attempt = new AbortController();
    const timeoutId = setTimeout(() => attempt.abort(), 15000);
    const onOuterAbort = () => attempt.abort();
    signal.addEventListener("abort", onOuterAbort);
    try {
      const res = await fetch(url, {
        headers: { "x-admin-key": apiKey },
        signal: attempt.signal,
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      return await res.json();
    } catch (e) {
      lastError = e;
      if (signal.aborted) throw e;
    } finally {
      clearTimeout(timeoutId);
      signal.removeEventListener("abort", onOuterAbort);
    }
  }
  throw lastError;
}

function AdminFormulario() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
    } else {
      alert("Contraseña incorrecta");
    }
  };

  useEffect(() => {
    if (!authenticated) return;

    const controller = new AbortController();
    const debounce = setTimeout(async () => {
      try {
        setLoading(true);
        setError("");
        const json = await fetchSolicitudes({
          apiKey: password,
          q: query.trim(),
          signal: controller.signal,
        });
        setSolicitudes(Array.isArray(json.data) ? json.data : []);
        setLoading(false);
      } catch (e) {
        if (controller.signal.aborted) return;
        console.error(e);
        setError("No se pudieron cargar las solicitudes.");
        setLoading(false);
      }
    }, query ? 350 : 0);

    return () => {
      clearTimeout(debounce);
      controller.abort();
    };
  }, [authenticated, password, query, reloadKey]);

  if (!authenticated) {
    return (
      <section className="admin-login-section">
        <form className="admin-login-box" onSubmit={handleLogin}>
          <h1>Acceso administrador</h1>
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          <button type="submit">Entrar</button>
        </form>
      </section>
    );
  }

  return (
    <section className="admin-dashboard-section">
      <h1>Formularios recibidos</h1>

      <div className="admin-toolbar">
        <input
          type="search"
          className="admin-search"
          placeholder="Buscar por nombre o teléfono…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {error && (
        <div className="admin-error">
          <p>{error}</p>
          <button type="button" onClick={() => setReloadKey((k) => k + 1)}>
            Reintentar
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
          <div className="admin-spinner" aria-label="Cargando solicitudes" />
        </div>
      ) : (
        !error && (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Nombre</th>
                  <th>Apellido</th>
                  <th>Edad</th>
                  <th>Correo</th>
                  <th>Teléfono</th>
                  <th>Ciudad</th>
                  <th>País</th>
                  <th>Tipo de terapia</th>
                  <th>Motivo de consulta</th>
                  <th>Expectativas</th>
                  <th>Inversión</th>
                </tr>
              </thead>
              <tbody>
                {solicitudes.map((s) => (
                  <tr key={s.id}>
                    <td>{new Date(s.created_at).toLocaleString("es-MX")}</td>
                    <td>{s.nombre}</td>
                    <td>{s.apellido}</td>
                    <td>{s.edad}</td>
                    <td>{s.email}</td>
                    <td>{s.telefono}</td>
                    <td>{s.ciudad}</td>
                    <td>{s.pais}</td>
                    <td>{s.tipo_terapia}</td>
                    <td>{s.motivo_consulta}</td>
                    <td>{s.expectativas}</td>
                    <td>{s.inversion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!solicitudes.length && (
              <p className="admin-empty">
                {query.trim()
                  ? "Sin resultados para la búsqueda."
                  : "No hay solicitudes todavía."}
              </p>
            )}
          </div>
        )
      )}
    </section>
  );
}

export default AdminFormulario;
