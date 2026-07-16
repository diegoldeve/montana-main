import { useEffect, useState } from "react";
import "../style/AgendaModal.css";
import { API_URL } from "../config/api";
import { COUNTRIES, FEATURED_COUNT, isoToFlagEmoji } from "../data/dialCodes";

const TIPOS_TERAPIA = ["Individual", "Adolescentes", "Niña/Niño", "Pareja", "Familiar", "Otro"];

const INVERSION_OPTIONS = [
  "$695.00",
  "$775.00",
  "$880.00",
  "$985.00",
  "$1,090.00",
  "$1,195.00",
];

const initialForm = {
  nombre: "",
  apellido: "",
  edad: "",
  codigoPais: "+52",
  telefono: "",
  email: "",
  pais: "",
  ciudad: "",
  tipoTerapia: "",
  motivo: "",
  expectativas: "",
  inversion: "",
};

function AgendaModal({ isOpen, onClose }) {
  const [form, setForm] = useState(initialForm);
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = "hidden";

    const onKeyDown = (e) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleClose = () => {
    setForm(initialForm);
    setEnviado(false);
    setError("");
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setEnviando(true);

    try {
      const telefonoCompleto = `${form.codigoPais}${form.telefono.replace(/\D/g, "")}`;
      const res = await fetch(`${API_URL}/api/solicitudes-agenda`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, telefono: telefonoCompleto }),
      });

      if (!res.ok) throw new Error("HTTP " + res.status);

      setEnviado(true);
    } catch (err) {
      console.error(err);
      setError("No pudimos enviar tu solicitud. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="agenda-modal-overlay" onClick={handleClose}>
      <div
        className="agenda-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="agenda-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="agenda-modal-close" onClick={handleClose} aria-label="Cerrar">
          ×
        </button>

        {enviado ? (
          <div className="agenda-modal-gracias">
            <h2>¡Gracias por tu solicitud!</h2>
            <p>
              Hemos recibido tu información. Una de nuestras canalizadoras se
              pondrá en contacto contigo muy pronto para ayudarte a agendar tu
              primera sesión.
            </p>
            <button className="agenda-modal-btn" onClick={handleClose}>
              Cerrar
            </button>
          </div>
        ) : (
          <>
            <h2 id="agenda-modal-title" className="agenda-modal-title">
              Agenda tu sesión en línea
            </h2>
            <p className="agenda-modal-subtitle">
              Llena el siguiente formulario y te ayudaremos a encontrar al
              terapeuta que mejor se adapte a tus necesidades.
            </p>

            <form className="agenda-modal-form" onSubmit={handleSubmit}>
              <div className="agenda-modal-field">
                <label htmlFor="nombre">Nombre</label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="agenda-modal-field">
                <label htmlFor="apellido">Apellido</label>
                <input
                  id="apellido"
                  name="apellido"
                  type="text"
                  value={form.apellido}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="agenda-modal-field">
                <label htmlFor="edad">Edad</label>
                <input
                  id="edad"
                  name="edad"
                  type="number"
                  min="0"
                  value={form.edad}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="agenda-modal-field">
                <label htmlFor="telefono">Teléfono</label>
                <div className="agenda-modal-phone-group">
                  <select
                    name="codigoPais"
                    value={form.codigoPais}
                    onChange={handleChange}
                    aria-label="Código de país"
                  >
                    <optgroup label="Más comunes">
                      {COUNTRIES.slice(0, FEATURED_COUNT).map((c) => (
                        <option key={c.iso2} value={c.dialCode}>
                          {isoToFlagEmoji(c.iso2)} {c.dialCode}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Todos los países">
                      {COUNTRIES.slice(FEATURED_COUNT).map((c) => (
                        <option key={c.iso2} value={c.dialCode}>
                          {isoToFlagEmoji(c.iso2)} {c.name} {c.dialCode}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                  <input
                    id="telefono"
                    name="telefono"
                    type="tel"
                    inputMode="numeric"
                    value={form.telefono}
                    onChange={handleChange}
                    minLength={5}
                    required
                  />
                </div>
              </div>

              <div className="agenda-modal-field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="agenda-modal-field">
                <label htmlFor="pais">País</label>
                <input
                  id="pais"
                  name="pais"
                  type="text"
                  value={form.pais}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="agenda-modal-field">
                <label htmlFor="ciudad">Ciudad</label>
                <input
                  id="ciudad"
                  name="ciudad"
                  type="text"
                  value={form.ciudad}
                  onChange={handleChange}
                  required
                />
              </div>

              <fieldset className="agenda-modal-fieldset">
                <legend>Tipo de terapia</legend>
                <div className="agenda-modal-options">
                  {TIPOS_TERAPIA.map((tipo) => (
                    <label key={tipo} className="agenda-modal-radio">
                      <input
                        type="radio"
                        name="tipoTerapia"
                        value={tipo}
                        checked={form.tipoTerapia === tipo}
                        onChange={handleChange}
                        required
                      />
                      {tipo}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="agenda-modal-field">
                <label htmlFor="motivo">Motivo de la consulta</label>
                <textarea
                  id="motivo"
                  name="motivo"
                  rows="3"
                  value={form.motivo}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="agenda-modal-field">
                <label htmlFor="expectativas">
                  Expectativas respecto a la terapia que estás solicitando
                </label>
                <textarea
                  id="expectativas"
                  name="expectativas"
                  rows="3"
                  value={form.expectativas}
                  onChange={handleChange}
                  required
                />
              </div>

              <fieldset className="agenda-modal-fieldset">
                <legend>¿Cuánto podrías invertir en una terapia?</legend>
                <div className="agenda-modal-options">
                  {INVERSION_OPTIONS.map((monto) => (
                    <label key={monto} className="agenda-modal-radio">
                      <input
                        type="radio"
                        name="inversion"
                        value={monto}
                        checked={form.inversion === monto}
                        onChange={handleChange}
                        required
                      />
                      {monto}
                    </label>
                  ))}
                </div>
                <p className="agenda-modal-inversion-nota">
                  *Los costos aquí mostrados son para terapias individuales. La
                  terapia de pareja y familiar tiene un costo diferente,
                  ¡consulta con tu canalizadora!
                </p>
              </fieldset>

              {error && <p className="agenda-modal-error">{error}</p>}

              <button type="submit" className="agenda-modal-btn" disabled={enviando}>
                {enviando && <span className="agenda-modal-spinner" aria-hidden="true" />}
                {enviando ? "Enviando…" : "Enviar solicitud"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default AgendaModal;
