import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";
import "../style/terapeutas.css";
import { Link } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import defaultAvatar from "../assets/t1.png";
import { API_URL } from "../config/api";

function Terapeutas() {
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        setError("");
        setLoading(true);

        const res = await fetch(`${API_URL}/api/terapeutas/featured`, {
          signal: controller.signal,
        });

        if (!res.ok) throw new Error("HTTP " + res.status);

        const json = await res.json();
        setData(Array.isArray(json) ? json : []);
      } catch (e) {
        if (e.name !== "AbortError") {
          console.error(e);
          setError("No se pudieron cargar los terapeutas.");
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

  // 👇 Config dinámica para que Splide no haga loops raros con pocos items
  const options = useMemo(() => {
    const count = data.length;
    const perPage = Math.min(3, Math.max(1, count));
    const shouldLoop = count > perPage; // solo loop si hay más slides que los visibles

    return {
      type: shouldLoop ? "loop" : "slide",
      perPage,
      perMove: 1,
      gap: "0rem",
      padding: "0rem",
      focus: "center",
      pagination: shouldLoop,       // si no hay loop, normalmente no hace falta
      arrows: count > 1,            // si solo hay 1, ocultar flechas
      speed: 800,
      easing: "ease",
      autoplay: shouldLoop,         // autoplay solo si hay suficiente contenido
      interval: 3000,
      pauseOnHover: true,
      pauseOnFocus: false,
      pauseOnTouch: false,
      waitForTransition: true,
      breakpoints: {
        1100: { perPage: Math.min(2, Math.max(1, count)) },
        768: { perPage: 1 },
      },
    };
  }, [data.length]);

  if (loading) {
    return (
      <section className="terapeutas-section">
        <div
          className="terapeutas-container"
          style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}
        >
          <div className="spinner" aria-label="Cargando terapeutas" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="terapeutas-section">
        <div className="terapeutas-container">
          <p>{error}</p>
        </div>
      </section>
    );
  }

  // Si por alguna razón vienen 0 terapeutas
  if (!data.length) {
    return (
      <section className="terapeutas-section">
        <div className="terapeutas-container">
          <p>No hay terapeutas para mostrar.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="terapeutas-section">
      <div className="terapeutas-container">
        <Splide options={options} aria-label="Nuestros terapeutas">
          {data.map((t) => {
            const nombreCompleto = [t.nombre, t.apellido_paterno, t.apellido_materno]
              .filter(Boolean)
              .join(" ")
              .replace(/\s+/g, " ")
              .trim();

            const textoRaw = (t.semblanza ?? "").toString().trim();
            const texto =
              !textoRaw || textoRaw.toUpperCase() === "NULL"
                ? "Ver perfil"
                : textoRaw.length > 140
                ? textoRaw.slice(0, 140) + "…"
                : textoRaw;

            return (
              <SplideSlide key={t.id}>
                <Link
                  to={`/terapeutas/${t.id}`}
                  className="card"
                  state={{ from: "/terapeutas", scrollY: window.scrollY }}
                >
                  <img
                    src={t.foto_url || defaultAvatar}
                    className="card-img"
                    alt={nombreCompleto}
                  />

                  <div className="card-content">
                    <h3>{nombreCompleto}</h3>
                    <h4>{t.formacion || "Terapeuta"}</h4>
                    <p>{texto}</p>
                  </div>
                </Link>
              </SplideSlide>
            );
          })}
        </Splide>
      </div>
    </section>
  );
}

export default Terapeutas;
