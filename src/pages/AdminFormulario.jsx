import { useEffect, useState } from "react";
import "../style/AdminFormulario.css";
import { API_URL } from "../config/api";

const ADMIN_PASSWORD = "Canalizadoras123";

const TERAPEUTAS = ["Sharon", "Monserrat", "Claudia", "Berenice"];

// El backend en Railway puede tardar en responder si la conexión a la base
// se quedó muerta; cada intento tiene timeout y se reintenta hasta 3 veces.
async function fetchSolicitudes({ apiKey, q, agente, desde, hasta, limit, page, signal }) {
  const params = new URLSearchParams();
  params.set("limit", String(limit));
  params.set("page", String(page));
  if (q) params.set("q", q);
  if (agente) params.set("agente", agente);
  if (desde) params.set("desde", desde);
  if (hasta) params.set("hasta", hasta);
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
  const [agente, setAgente] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(20);
  const [page, setPage] = useState(1);
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
          agente,
          desde,
          hasta,
          limit,
          page,
          signal: controller.signal,
        });
        const data = Array.isArray(json.data) ? json.data : [];
        setSolicitudes(data);
        setTotal(typeof json.total === "number" ? json.total : data.length);
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
  }, [authenticated, password, query, agente, desde, hasta, limit, page, reloadKey]);

  // Cualquier cambio de filtro o de tamaño de página regresa a la página 1.
  const cambiarFiltro = (setter, value) => {
    setter(value);
    setPage(1);
  };

  const hayFiltros = query.trim() || agente || desde || hasta;
  const totalPages = Math.max(Math.ceil(total / limit), 1);
  const primero = total ? (page - 1) * limit + 1 : 0;
  const ultimo = (page - 1) * limit + solicitudes.length;

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
          onChange={(e) => cambiarFiltro(setQuery, e.target.value)}
        />
        <select
          className="admin-select"
          value={agente}
          onChange={(e) => cambiarFiltro(setAgente, e.target.value)}
        >
          <option value="">Todas las terapeutas</option>
          {TERAPEUTAS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
          <option value="sin">Sin asignar</option>
        </select>
        <label className="admin-date">
          Desde
          <input
            type="date"
            value={desde}
            max={hasta || undefined}
            onChange={(e) => cambiarFiltro(setDesde, e.target.value)}
          />
        </label>
        <label className="admin-date">
          Hasta
          <input
            type="date"
            value={hasta}
            min={desde || undefined}
            onChange={(e) => cambiarFiltro(setHasta, e.target.value)}
          />
        </label>
        {(desde || hasta) && (
          <button
            type="button"
            className="admin-clear-dates"
            onClick={() => {
              setPage(1);
              setDesde("");
              setHasta("");
            }}
          >
            Limpiar fechas
          </button>
        )}
      </div>

      {!loading && !error && (
        <div className="admin-total">
          <p>
            Total: <strong>{total}</strong>
            {total > 0 && ` · mostrando ${primero}–${ultimo}`}
          </p>
          <label className="admin-date">
            Ver
            <select
              className="admin-select"
              value={limit}
              onChange={(e) => cambiarFiltro(setLimit, Number(e.target.value))}
            >
              {[20, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

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
                  <th>Terapeuta</th>
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
                    <td>{s.agente_asignado || "—"}</td>
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
                {hayFiltros
                  ? "Sin resultados para los filtros."
                  : "No hay solicitudes todavía."}
              </p>
            )}
          </div>
        )
      )}

      {!loading && !error && totalPages > 1 && (
        <nav className="admin-pagination" aria-label="Paginación">
          <button type="button" onClick={() => setPage(1)} disabled={page === 1}>
            «
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1}
          >
            Anterior
          </button>
          <span>
            Página {page} de {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages}
          >
            Siguiente
          </button>
          <button
            type="button"
            onClick={() => setPage(totalPages)}
            disabled={page >= totalPages}
          >
            »
          </button>
        </nav>
      )}
    </section>
  );
}

export default AdminFormulario;
