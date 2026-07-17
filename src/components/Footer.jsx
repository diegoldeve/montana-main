import "../style/Footer.css";
import { Link } from "react-router-dom";
import logoblanco from "../assets/logoblanco.png";
import facebookIcon from "../assets/Facebook.png";
import instagramIcon from "../assets/Instagram.png";
import linkedinIcon from "../assets/LinkedIn.png";
function Footer() {
  return (
    <footer className="footer-section">
      <div className="footer-top">

        {/* LOGO */}
        <img
          src={logoblanco}
          alt="La Montaña"
          className="footer-logo"
        />

        {/* NAVEGACIÓN */}
        <nav className="footer-nav">
          <Link to="/nosotros">Sobre nosotros</Link>
          <Link to="/terapeutas">Nuestros terapeutas</Link>
          <a href="#agenda">Agenda tu sesión</a>
        </nav>

        {/* REDES SOCIALES */}
        <div className="footer-socials">
          <a href="https://www.facebook.com/LaMontanaMx/?locale=es_LA" aria-label="Facebook">
            <img src={facebookIcon} alt="Facebook" />
          </a>
          <a href="https://www.instagram.com/lamontana.mx/" aria-label="Instagram">
            <img src={instagramIcon} alt="Instagram" />
          </a>
          <a href="https://www.linkedin.com/in/tere-d%C3%ADaz-sendra-a9a7801b/" aria-label="LinkedIn">
            <img src={linkedinIcon} alt="LinkedIn" />
          </a>
        </div>

      </div>

      <hr className="footer-divider" />

      {/* PARTE INFERIOR */}
      <div class="footer-bottom">
        <p>© 2026 La Montaña. Todos los derechos reservados.</p>
        <a href="#">Política de privacidad</a>
        <a href="#">Términos y condiciones</a>
        <a href="#">Cookies</a>
      </div>

    </footer>
  );
}

export default Footer;

