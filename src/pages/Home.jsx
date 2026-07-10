import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import Terapeutas from "../components/Terapeutas";
import Testimonios from "../components/Testimonios.jsx";
import Beneficios from '../components/Beneficios.jsx'; 
import PreguntasFrecuentes from '../components/PreguntasFrecuentes.jsx';
import { useEffect } from "react";
import heroImg from "../assets/Header.png";
import paso1 from "../assets/Paso_1.png";
import paso2 from "../assets/Paso_2.png";
import paso3 from "../assets/Paso_3.png";
import curva1 from "../assets/curva1.png";
import curva2 from "../assets/curva2.png";
import { useAgendaModal } from "../context/AgendaModalContext";


function Home() {
  const { openModal } = useAgendaModal();

  useEffect(() => {
    document.title = "Psicoterapia La Montaña";
  }, []);
  return (
    <>
      <Header />

      {/* =========================
          HERO SECTION  
      ========================== */}
      <section className="hero">
        <div className="hero-content">

          <h1 className="hero-title">
            Transforma tu vida,
            <span className="highlight"> fortalece </span>
            tu bienestar y <br />
            construye relaciones saludables.
          </h1>

          <div className="hero-grid">
            <img src={heroImg} className="hero-img" />

            <div className="hero-text-boxes">
              <div className="hero-questions">
                <div className="hero-question">¿Estás atoradx en un ciclo de malas relaciones?</div>
                <div className="hero-question">¿Tienes ansiedad y depresión?</div>
                <div className="hero-question">¿Te sientes confundidx y sin dirección?</div>
              </div>


              <p className="hero-descripcion">
                En <strong>La Montaña</strong> tenemos al
                <strong> especialista indicado</strong> para tu motivo de consulta.
              </p>

              <button className="hero-btn" onClick={openModal}>
                Agenda tu primera sesión
              </button>
            </div>
          </div>

        </div>

      </section>

      {/*------ Contadores -------- */}
      <div className="section-history">
        <div className="history-content">

          {/*------ TEXTO CENTRAL----------- */}
          <h2 className="history-title">
            Desde 2008, en Psicoterapia La Montaña<br />
            <span className="highlight-yellow">acompañamos a personas, parejas y familias</span><br />
            en procesos de <span className="highlight-green">transformación y bienestar</span><br />
            emocional.
          </h2>

          {/*---------- MÉTRICAS--------------- */}
          <div className="history-stats">
            <div className="stat">
              <h3>+131</h3>
              <p>Terapeutas</p>
            </div>

            <div className="divider"></div>

            <div className="stat">
              <h3>+17</h3>
              <p>Años de experiencia</p>
            </div>

            <div className="divider"></div>

            <div className="stat">
              <h3>+150 <span className="k">k</span></h3>
              <p>Sesiones entregadas</p>
            </div>

            <div className="divider"></div>

            <div className="stat">
              <h3>+20 <span className="k">k</span></h3>
              <p>Consultantes satisfechos</p>
            </div>
          </div>

          {/* BOTÓN */}
          <button className="history-btn" onClick={openModal}>
            Agenda tu primera sesión
          </button>
        </div>
      </div>
      {/* ============================
    SECCIÓN: PROCESO SENCILLO
============================ */}
      <div className="section-process">
        <div className="process-content">

          <h2 className="process-title">
            Empezar tu proceso es<br />sencillo:
          </h2>

          <div className="process-grid">

            {/* ITEM 1 */}
            <div className="process-item">
              <img src={paso1} alt="Platica" className="process-icon" />
              <h3>1. Platica con<br />nuestras canalizadoras</h3>
              <p>
                Cuéntanos qué estás buscando y cómo te gustaría que te acompañemos.
              </p>
            </div>

            {/* ITEM 2 */}
            <div className="process-item">
              <img src={paso2} alt="Elegir terapeuta" className="process-icon" />
              <h3>2. Te ayudamos a<br />elegir terapeuta</h3>
              <p>
                Nuestro equipo te pedirá llenar un breve formulario y te orientará según tu motivo de consulta.
              </p>
            </div>

            {/* ITEM 3 */}
            <div className="process-item">
              <img src={paso3} alt="Comienza tu proceso" className="process-icon" />
              <h3>3. Comienza tu<br />proceso</h3>
              <p>
                Agenda tu primera sesión y da el primer paso hacia tu bienestar emocional.
              </p>
            </div>

          </div>

          <a
            href="https://wa.me/525539206004?text=Vengo%20de%20la%20p%C3%A1gina%20web%2C%20me%20gustar%C3%ADa%20que%20me%20atendiera%20una%20canalizadora"
            target="_blank"
            rel="noopener noreferrer"
            className="process-btn"
          >
            Hablar con una canalizadora
          </a>

        </div>
      </div>
      {/*------------------ Terapeutas----------------------------- */}
      <section className="terapeutas-section">
        <img src={curva1} className="bg-line bg-line-top" />
        <img src={curva2} className="bg-line bg-line-bottom" />
        {/* TITULO + TEXTO SUPERIOR */}
        <div className="terapeutas-top">
          <h2>¿Cuál es el mejor terapeuta para mi?</h2>

          <p>
            Por medio de nuestro <strong>proceso de canalización</strong> analizamos a detalle tu motivo
            de consulta y te acompañamos de cerca para agendar tu primera sesión con el terapeuta
            que más se adapte a tu motivo de consulta.
          </p>
        </div>

        {/* SLIDER */}
        <Terapeutas />

        {/* TEXTO INFERIOR */}
        <div className="terapeutas-bottom">
          <a href="/terapeutas" className="btn-terapeutas-bottom1">
            Ver más terapeutas
          </a>
          <h3>
            <span>Postergar tu bienestar solo prolonga la incomodidad.</span>
          </h3>

          <p>No necesitas hacerlo todo por tu cuenta.</p>

          <p>
            Encontrar <strong>acompañamiento</strong> puede marcar la diferencia entre sobrevivir y{" "}
            <strong>vivir con claridad.</strong>
          </p>

          <button className="btn-terapeutas-bottom" onClick={openModal}>
            Agenda tu cita hoy
          </button>
        </div>

      </section>

      {/* -----testimonios------  */}
      <Testimonios />

      {/* beneficios */}
      <Beneficios />
      {/* preguntas frecuentes */}
      <PreguntasFrecuentes />
      <Footer />
    </>
  );
}

export default Home;
