import "../style/preguntas.css";
import Curva from "../assets/curva3.png"; // tu curva verde

function PreguntasFrecuentes() {
  const faqs = [
    {
      pregunta: "¿Qué enfoques manejan?",
      respuesta:
        "Manejamos casi todos los enfoques terapéuticos actuales como Psicoanálisis, Cognitivo-Conductual, Gestalt, Terapia Racional Emotiva Conductual, Narrativa, Sistémico-Relacional, Terapia Breve Centrada en Soluciones y Humanista."
    },
    {
      pregunta: "¿Cómo eligen al mejor terapeuta para mi proceso?",
      respuesta:
        "Tras analizar tu motivo de consulta, nuestro equipo de canalización selecciona las opciones que más se adaptan a tus necesidades, partiendo de lo que quieres lograr y el enfoque y experiencia de nuestros especialistas."
    },
    {
      pregunta: "¿Las sesiones son en línea o presenciales?",
      respuesta:
        "Principalmente trabajamos en formato virtual, lo que te permite conectarte desde cualquier lugar."
    },
    {
      pregunta: "¿Por qué aparecen diferentes costos en el formulario?",
      respuesta:
        "Manejamos un rango de precios en el que tú eliges cuánto puedes pagar. Esto no afecta la calidad del servicio, sino que es una forma de apoyo para hacer accesibles las consultas para todos."
    },
    {
      pregunta: "¿Puedo cambiar de terapeuta si no me siento cómodo?",
      respuesta:
        "En La Montaña creemos que la confianza es esencial. Si lo necesitas, te ayudamos a hacer un cambio guiado para que llegues con el terapeuta ideal para ti."
    }
  ];

  return (
    <section className="faq-section">
      
      {/* Curva decorativa */}
      <img src={Curva} alt="" className="faq-bg" />

      {/* CONTENIDO */}
      <div className="faq-container">

        <div className="faq-header">
          <h2>Preguntas Frecuentes</h2>
          <p>
            Queremos que tengas toda la información clara antes de comenzar.
            Aquí resolvemos las dudas más comunes sobre nuestro proceso terapéutico.
          </p>
        </div>

        {/* LISTA FAQ */}
        <div className="faq-list">
          {faqs.map((f, i) => (
            <div className="faq-item" key={i}>
              <h3>{f.pregunta}</h3>
              <p>{f.respuesta}</p>
            </div>
          ))}
        </div>

        {/* CTA FINAL */}
        <div className="faq-extra">
          <h3>¿Necesitas más información?</h3>
          <p>
            Si no encontraste lo que buscabas en las preguntas frecuentes,
            nuestro equipo con gusto te ayudará.
          </p>

          <button className="faq-btn">Contáctanos</button>
        </div>
      </div>
    </section>
  );
}

export default PreguntasFrecuentes;
