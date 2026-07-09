
import "../style/TherapyApproaches.css";
import psicoanaliticaIcon from "../assets/Psicoanalitica.png";
import cognitivoConductualIcon from "../assets/Cognitivo_Conductual.png";
import gestaltIcon from "../assets/Gestalt.png";
import racionalEmotivaIcon from "../assets/Racional_Emotiva.png";
import narrativaIcon from "../assets/Narrativa.png";
import sistemicoRelacionalIcon from "../assets/Sistemico_Relacional.png";
import breveCentradaIcon from "../assets/Breve_Centrada.png";
import humanistaIcon from "../assets/Humanista.png";

const approaches = [
  {
    title: "Terapia Psicoanalítica",
    description:
      "Explora el inconsciente y los conflictos internos para entender y transformar la conducta actual a partir de analizar la relación entre pasado y presente.",
    accentColor: "#FEAC2D",
    iconSrc: psicoanaliticaIcon,
    iconAlt: "Icono de Terapia Psicoanalítica",
  },
  {
    title: "Terapia Cognitivo-Conductual (TCC)",
    description:
      "Se enfoca en identificar y modificar pensamientos y comportamientos que obstaculizan el bienestar emocional.",
    accentColor: "#99BA05",
    iconSrc: cognitivoConductualIcon,
    iconAlt: "Icono de Terapia Cognitivo-Conductual",
  },
  {
    title: "Terapia Gestalt",
    description:
      "Promueve la conciencia plena del aquí y ahora, integrando pensamientos, emociones y acciones para lograr un cambio personal.",
    accentColor: "#B7CE50",
    iconSrc: gestaltIcon,
    iconAlt: "Icono de Terapia Gestalt",
  },
  {
    title: "Terapia Racional Emotiva Conductual (TREC)",
    description:
      "Ayuda a identificar, cuestionar y reemplazar creencias irracionales que generan malestar emocional.",
    accentColor: "#C6F5C3",
    iconSrc: racionalEmotivaIcon,
    iconAlt: "Icono de Terapia Racional Emotiva Conductual",
  },
  {
    title: "Terapia Narrativa",
    description:
      "Trabaja con las historias que las personas se cuentan a partir de su historia de vida, resignificándolas para generar nuevas formas de identidad.",
    accentColor: "#FEAC2D",
    iconSrc: narrativaIcon,
    iconAlt: "Icono de Terapia Narrativa",
  },
  {
    title: "Terapia Sistémico-Relacional",
    description:
      "Analiza las dinámicas individuales, de pareja y familia como sistemas interconectados, con el objetivo de mejorar la comunicación.",
    accentColor: "#99BA05",
    iconSrc: sistemicoRelacionalIcon,
    iconAlt: "Icono de Terapia Sistémico-Relacional",
  },
  {
    title: "Terapia Breve Centrada en Soluciones",
    description:
      "Promueve la identificación de fortalezas y recursos personales para construir soluciones concretas.",
    accentColor: "#B7CE50",
    iconSrc: breveCentradaIcon,
    iconAlt: "Icono de Terapia Breve Centrada en Soluciones",
  },
  {
    title: "Terapia Humanista",
    description:
      "Confía en la capacidad de crecimiento de las personas, priorizando la autenticidad y la autorrealización personal.",
    accentColor: "#FEAC2D",
    iconSrc: humanistaIcon,
    iconAlt: "Icono de Terapia Humanista",
  },
];

export default function TherapyApproaches() {
  return (
    <section className="approaches-section">
      <div className="approaches-inner">
        <h2 className="approaches-title">Enfoques que manejamos</h2>

        <div className="approaches-grid">
          {approaches.map((item) => (
            <article
              key={item.title}
              className="approach-card"
              style={{ "--accent-color": item.accentColor }}
            >
              <div className="approach-icon">
                <img src={item.iconSrc} alt={item.iconAlt} />
              </div>
              <h3 className="approach-title">{item.title}</h3>
              <p className="approach-description">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
