import "../style/TherapistsSection.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import defaultAvatar from "../assets/t1.png";

function Terapeutas() {
  const [therapists, setTherapists] = useState([]);
  const [q, setQ] = useState("");
  const [cursor, setCursor] = useState(null);
  const [done, setDone] = useState(false);

  const [loadingFirst, setLoadingFirst] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Terapeutas | Psicoterapia La Montaña";
  }, []);

  async function load({ reset = false } = {}) {
    try {
      setError("");

      if (reset) setLoadingFirst(true);
      else setLoadingMore(true);

      const params = new URLSearchParams();
      params.set("limit", "20");
      const query = q.trim();
      if (query) params.set("q", query);
      if (!reset && cursor) params.set("cursor", String(cursor));

      const res = await fetch(`/api/terapeutas?${params.toString()}`);
      if (!res.ok) throw new Error("HTTP " + res.status);

      const json = await res.json();
      const data = Array.isArray(json.data) ? json.data : [];
      const next = json.nextCursor ?? null;

      setTherapists((prev) => (reset ? data : [...prev, ...data]));
      setCursor(next);
      setDone(!next || data.length === 0);
    } catch (e) {
      console.error(e);
      setError("No se pudieron cargar los terapeutas.");
    } finally {
      setLoadingFirst(false);
      setLoadingMore(false);
    }
  }

  // carga inicial
  useEffect(() => {
    load({ reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // búsqueda (con debounce) -> reinicia lista y vuelve a cargar desde cero
  useEffect(() => {
    const t = setTimeout(() => {
      setTherapists([]);
      setCursor(null);
      setDone(false);
      load({ reset: true });
    }, 350);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <>
      <Header />

      <section className="therapists-section">
        <div className="therapists-inner">
          {/* Título y texto superior */}
          <header className="therapists-header">
            <h2>Nuestro equipo de terapeutas</h2>
            <p>
              Nuestros especialistas son{" "}
              <strong>psicoterapeutas titulados</strong> con grados en
              diferentes áreas de especialidades. Su compromiso incluye una{" "}
              <strong>permanente actualización</strong> a través de seminarios y
              estudios continuos. ¡Conócelos!
            </p>

            {/* Buscador */}
            <div style={{ marginTop: 16 }}>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar por nombre o ciudad…"
                style={{ padding: 10, width: "100%", maxWidth: 420 }}
              />
            </div>
          </header>

          {/* Error */}
          {error && <p style={{ marginTop: 12 }}>{error}</p>}

          {/* Loading inicial */}
          {loadingFirst ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "40px 0",
              }}
            >
              <div className="spinner" aria-label="Cargando terapeutas" />
            </div>
          ) : (
            <>
              {/* Tarjetas desde DB */}
              <div className="therapists-grid">
                {therapists.map((t) => {
                  const name = [t.nombre, t.apellido_paterno, t.apellido_materno]
                    .filter(Boolean)
                    .join(" ")
                    .replace(/\s+/g, " ")
                    .trim();

                  // “role” lo mapeo a formación (ajústalo si quieres)
                  const role = t.formacion || "Terapeuta";

                  // descripción corta usando ciudad/país/modalidad
                  const descParts = [];
                  const cityCountry = [t.ciudad, t.pais].filter(Boolean).join(", ");
                  if (cityCountry) descParts.push(cityCountry);
                  const modalidadTxt = Array.isArray(t.modalidad) ? t.modalidad.filter(Boolean).join(", ") : t.modalidad;
                  if (modalidadTxt) descParts.push(modalidadTxt);
                  const description = descParts.join(" • ") || "Ver perfil";

                  return (
                    <Link
                      key={t.id}
                      to={`/terapeutas/${t.id}`} 
                      className="therapist-card-link"
                      state={{ from: "/terapeutas", scrollY: window.scrollY }}
                    >
                      <article className="therapist-card">
                        <div className="therapist-image-wrapper">
                          <img
                            src={defaultAvatar}
                            alt={`Foto de ${name}`}
                          />
                        </div>
                        <div className="therapist-body">
                          <h3 className="therapist-name">{name}</h3>
                          <p className="therapist-role">{role}</p>
                          <p className="therapist-description">{description}</p>
                        </div>
                      </article>
                    </Link>
                  );
                })}
              </div>

              {/* Botón Cargar más */}
              <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
                {!done ? (
                  <button
                    className="therapists-cta-button"
                    onClick={() => load({ reset: false })}
                    disabled={loadingMore}
                  >
                    {loadingMore ? "Cargando…" : "Cargar más terapeutas"}
                  </button>
                ) : (
                  <p>Fin de resultados</p>
                )}
              </div>
            </>
          )}

          {/* CTA inferior */}
          <div className="therapists-cta">
            <h3>¿Listo para comenzar tu proceso?</h3>
            <p>
              Para agendar tu primera sesión en línea llena el formulario y te
              ayudaremos a encontrar al terapeuta que mejor se adapte a tus
              necesidades.
            </p>
            <button className="therapists-cta-button">
              Agenda tu sesión en línea
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default Terapeutas;
