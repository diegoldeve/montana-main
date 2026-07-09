import "../style/testimonios.css";
import iconQuote from "../assets/gotas.png"; // ← tu icono de comillas

function Testimonios() {

  const testimonios = [
    {
      texto:
        "Desde la primera sesión mi terapeuta me dio mucha confianza, me escuchó atentamente y utilizó varios métodos para guiarme",
      autor: "Aranza L.",
      tipo: "Terapia individual",
    },
    {
      texto:
        "Excelente atención, amable y gentil. Genera mucha confianza y me sentí tranquila",
      autor: "Luis y Andrea",
      tipo: "Terapia de pareja",
    },
    {
      texto:
        "Mi terapeuta es una persona afable y cálida. Confío que haré un buen proceso acompañada de ella.",
      autor: "Familia Hernández",
      tipo: "Terapia familiar",
    },
  ];

  const videos = [
    "/src/assets/video1.mp4",
    "/src/assets/video2.mp4",
    "/src/assets/video3.mp4",
    "/src/assets/video4.mp4",
  ];

  return (
    <section className="testimonios-section">

      {/* TITULO */}
      <div className="testimonios-header">
        <h2>
          Experiencias que inspiran{" "}
          <span className="highlight">confianza</span>
        </h2>
        <p>
          Cada proceso terapéutico es único, pero todos comparten algo en común:
          la seguridad de sentirse escuchados y acompañados.
        </p>
      </div>

      {/* BLOQUE DE TESTIMONIOS */}
      <div className="testimonios-grid">
        {testimonios.map((t, i) => (
          <div key={i} className="testimonio-card">
            <img src={iconQuote} className="quote-icon" />
            <p className="texto">“{t.texto}”</p>
            <p className="autor">
              <span /> {t.autor} · {t.tipo}
            </p>
          </div>
        ))}
      </div>

      {/* GRID DE VIDEOS */}
      <div className="videos-grid">
        {videos.map((src, i) => (
          <video
            key={i}
            className="video-item"
            src={src}
            controls
            poster="/src/assets/video-placeholder.png"
          />
        ))}
      </div>

      {/* BOTÓN */}
      <div className="btn-wrapper">
        <button className="btn-proceso">Empezar mi proceso</button>
      </div>

    </section>
  );
}

export default Testimonios;
