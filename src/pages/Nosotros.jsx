import "../style/nosotros.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Beneficios from '../components/Beneficios.jsx'; 
import TherapyApproaches from "../components/TherapyApproaches.jsx";
import { useEffect } from "react";
import tereImg from "../assets/tere.png";

function Nosotros() {
  useEffect(() => {
    document.title = "Sobre nosotros | Psicoterapia La Montaña";
  }, []);
  return (
    <>
      <Header />

      <section className="nosotros-hero">

  <div className="nosotros-top">

    <div className="nosotros-left">
      <h1 className="nosotros-title">
        ¡Te damos la <br />
        bienvenida a <br />
        <span className="title-highlight">La Montaña!</span>
      </h1>
    </div>

    <div className="nosotros-right">
      <img src={tereImg} alt="Tere Díaz" className="nosotros-img" />
    </div>

  </div>

  <div className="nosotros-bottom">

    <p>
      La Montaña es una clínica de psicoterapia <strong>fundada por Tere Díaz</strong> que 
      brinda atención psicológica adaptada a las necesidades, contextos y motivos de atención.
    </p>

    <p>
      En Psicoterapia La Montaña sabemos que hay momentos en los que la vida se vuelve pesada 
      o confusa. Nuestro equipo acompaña a las personas a comprender lo que están viviendo, 
      cuidar su bienestar emocional y encontrar nuevas formas de relacionarse consigo mismas 
      y con los demás.
    </p>

    <p>
      Aquí brindamos acompañamiento psicológico de manera virtual, con 
      <strong> más de 130 terapeutas</strong> de diversas corrientes y especialidades.
    </p>


  </div>

</section>
{/* enfoques */}
<TherapyApproaches />
   {/* beneficios */}
      <Beneficios />
      <Footer />
    </>
  );
}

export default Nosotros;
