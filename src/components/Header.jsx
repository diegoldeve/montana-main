import { useState } from "react";
import "../style/header.css";
import logo from "../assets/logo.png";
import { Link } from "react-router-dom";
import { useAgendaModal } from "../context/AgendaModalContext";

function Header() {
  const [open, setOpen] = useState(false);
  const { openModal } = useAgendaModal();

  return (
    <header className="header-container">
      <div className="header-content">
        {/* LOGO */}
        
        <Link to="/" className="logo-container">
          <img src={logo} alt="La Montaña" className="logo" />
        </Link>

        {/* MENU DESKTOP */}
        <nav className="nav-desktop">
          <Link to="/">Inicio</Link>
          <Link to="/nosotros">Sobre nosotros</Link>
          <Link to="/terapeutas">Nuestros terapeutas</Link>
        </nav>

        {/* BOTÓN DESKTOP */}
        <button className="btn-agendar" onClick={openModal}>
          Agenda tu sesión en línea
        </button>

        {/* HAMBURGER */}
        <button
          className={`hamburger ${open ? "open" : ""}`}
          onClick={() => setOpen(!open)}
        >
          <span className="line"></span>
          <span className="line"></span>
          <span className="line"></span>
        </button>
      </div>

      {/* MENU MOBILE */}
      <nav className={`nav-mobile ${open ? "open" : ""}`}>
        <Link to="/" onClick={() => setOpen(false)}>
          Inicio
        </Link>
        <Link to="/nosotros" onClick={() => setOpen(false)}>
          Sobre nosotros
        </Link>
        <Link to="/terapeutas" onClick={() => setOpen(false)}>
          Nuestros terapeutas
        </Link>
        <button
          className="btn-agendar mobile"
          onClick={() => {
            setOpen(false);
            openModal();
          }}
        >
          Agenda tu sesión en línea
        </button>
      </nav>
    </header>
  );
}

export default Header;
