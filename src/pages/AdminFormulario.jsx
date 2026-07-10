import { useState } from "react";
import "../style/AdminFormulario.css";

const ADMIN_PASSWORD = "Canalizadoras123";

const dummyData = [
  {
    nombre: "María",
    apellido: "González",
    correo: "maria.gonzalez@example.com",
    numero: "55 1234 5678",
    ciudad: "Ciudad de México",
    pais: "México",
    tipoTerapia: "Terapia individual",
    inversion: "$800 - $1,200 MXN",
  },
  {
    nombre: "Luis",
    apellido: "Martínez",
    correo: "luis.martinez@example.com",
    numero: "33 9876 5432",
    ciudad: "Guadalajara",
    pais: "México",
    tipoTerapia: "Terapia de pareja",
    inversion: "$1,000 - $1,500 MXN",
  },
  {
    nombre: "Andrea",
    apellido: "Ramírez",
    correo: "andrea.ramirez@example.com",
    numero: "81 2345 6789",
    ciudad: "Monterrey",
    pais: "México",
    tipoTerapia: "Terapia familiar",
    inversion: "$1,200 - $1,800 MXN",
  },
  {
    nombre: "Carlos",
    apellido: "Fernández",
    correo: "carlos.fernandez@example.com",
    numero: "222 111 2233",
    ciudad: "Puebla",
    pais: "México",
    tipoTerapia: "Terapia individual",
    inversion: "$600 - $900 MXN",
  },
  {
    nombre: "Paola",
    apellido: "Sánchez",
    correo: "paola.sanchez@example.com",
    numero: "998 765 4321",
    ciudad: "Cancún",
    pais: "México",
    tipoTerapia: "Terapia de duelo",
    inversion: "$900 - $1,300 MXN",
  },
  {
    nombre: "Diego",
    apellido: "Torres",
    correo: "diego.torres@example.com",
    numero: "614 333 2211",
    ciudad: "Chihuahua",
    pais: "México",
    tipoTerapia: "Terapia individual",
    inversion: "$700 - $1,000 MXN",
  },
];

function AdminFormulario() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
    } else {
      alert("Contraseña incorrecta");
    }
  };

  if (!authenticated) {
    return (
      <section className="admin-login-section">
        <form className="admin-login-box" onSubmit={handleSubmit}>
          <h1>Acceso administrador</h1>
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          <button type="submit">Entrar</button>
        </form>
      </section>
    );
  }

  return (
    <section className="admin-dashboard-section">
      <h1>Formularios recibidos</h1>
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Correo</th>
              <th>Número</th>
              <th>Ciudad</th>
              <th>País</th>
              <th>Tipo de terapia</th>
              <th>Cuánto puede invertir</th>
            </tr>
          </thead>
          <tbody>
            {dummyData.map((row, i) => (
              <tr key={i}>
                <td>{row.nombre}</td>
                <td>{row.apellido}</td>
                <td>{row.correo}</td>
                <td>{row.numero}</td>
                <td>{row.ciudad}</td>
                <td>{row.pais}</td>
                <td>{row.tipoTerapia}</td>
                <td>{row.inversion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default AdminFormulario;
