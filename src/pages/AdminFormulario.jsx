import { useEffect, useState } from "react";
import "../style/AdminFormulario.css";
import { API_URL } from "../config/api";

const ADMIN_PASSWORD = "Canalizadoras123";

function AdminFormulario() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

    async function load() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${API_URL}/api/solicitudes-agenda`, {
          headers: { "x-admin-key": password },
        });
        if (!res.ok) throw new Error("HTTP " + res.status);

        const json = await res.json();
        setSolicitudes(Array.isArray(json.data) ? json.data : []);
      } catch (e) {
        console.error(e);
        setError("No se pudieron cargar las solicitudes.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [authenticated, password]);

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

      {error && <p>{error}</p>}

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
          <div className="admin-spinner" aria-label="Cargando solicitudes" />
        </div>
      ) : (
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
          {!solicitudes.length && <p>No hay solicitudes todavía.</p>}
        </div>
      )}
    </section>
  );
}

export default AdminFormulario;
