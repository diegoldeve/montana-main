import express from 'express'
import cors from 'cors'
import { pool } from './db.js'
import { syncContactoSitioWeb, normalizePhoneE164 } from './whaapy.js'

const app = express()

const allowedOrigins = (process.env.FRONTEND_URL ?? '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

app.use(cors({
  origin: allowedOrigins.length ? allowedOrigins : true,
}))
app.use(express.json())

const TIPOS_TERAPIA = ["Individual", "Adolescentes", "Niña/Niño", "Pareja", "Familiar", "Otro"];
const INVERSION_OPTIONS = ["$695.00", "$775.00", "$880.00", "$985.00", "$1,090.00", "$1,195.00"];

function requireAdminKey(req, res, next) {
  const key = req.get("x-admin-key");
  if (!process.env.ADMIN_API_KEY || key !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ error: "UNAUTHORIZED" });
  }
  next();
}

app.post("/api/solicitudes-agenda", async (req, res) => {
  try {
    const {
      nombre, apellido, edad, telefono, email,
      pais, ciudad, tipoTerapia, motivo, expectativas, inversion,
    } = req.body ?? {};

    const camposTexto = { nombre, apellido, telefono, email, pais, ciudad, motivo, expectativas };
    for (const [campo, valor] of Object.entries(camposTexto)) {
      if (typeof valor !== "string" || !valor.trim()) {
        return res.status(400).json({ error: "CAMPO_INVALIDO", campo });
      }
    }

    const edadNum = Number(edad);
    if (!Number.isInteger(edadNum) || edadNum <= 0 || edadNum >= 120) {
      return res.status(400).json({ error: "CAMPO_INVALIDO", campo: "edad" });
    }

    if (!TIPOS_TERAPIA.includes(tipoTerapia)) {
      return res.status(400).json({ error: "CAMPO_INVALIDO", campo: "tipoTerapia" });
    }

    if (!INVERSION_OPTIONS.includes(inversion)) {
      return res.status(400).json({ error: "CAMPO_INVALIDO", campo: "inversion" });
    }

    const { rows } = await pool.query(
      `
      INSERT INTO public.solicitudes_agenda
        (nombre, apellido, edad, telefono, email, pais, ciudad, tipo_terapia, motivo_consulta, expectativas, inversion)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, created_at
      `,
      [
        nombre.trim(), apellido.trim(), edadNum, telefono.trim(), email.trim(),
        pais.trim(), ciudad.trim(), tipoTerapia, motivo.trim(), expectativas.trim(), inversion,
      ]
    );

    syncContactoSitioWeb({
      phone_number: normalizePhoneE164(telefono.trim()),
      name: `${nombre.trim()} ${apellido.trim()}`,
    }).catch((err) => console.error("Whaapy sync error:", err.message));

    res.status(201).json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "DB_ERROR" });
  }
});

app.get("/api/solicitudes-agenda", requireAdminKey, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit ?? "50", 10), 100);
    const cursor = req.query.cursor ? Number(req.query.cursor) : null;

    const params = [];
    let where = "WHERE 1=1";
    if (cursor) {
      params.push(cursor);
      where += ` AND id < $${params.length}`;
    }
    params.push(limit);

    const { rows } = await pool.query(
      `
      SELECT id, nombre, apellido, edad, telefono, email, pais, ciudad,
             tipo_terapia, motivo_consulta, expectativas, inversion, created_at
      FROM public.solicitudes_agenda
      ${where}
      ORDER BY id DESC
      LIMIT $${params.length}
      `,
      params
    );

    const nextCursor = rows.length === limit ? rows[rows.length - 1].id : null;
    res.json({ data: rows, nextCursor });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "DB_ERROR" });
  }
});

app.get("/api/terapeutas/featured", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        id,
        nombre,
        apellido_paterno,
        apellido_materno,
        grado_academico AS formacion,
        semblanza
      FROM public.profesionales
      ORDER BY id ASC
      LIMIT 6
    `);

    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "DB_ERROR" });
  }
});



app.get("/api/terapeutas", async (req, res) => {
  try {
    const q = (req.query.q ?? "").toString().trim();
    const limit = Math.min(parseInt(req.query.limit ?? "20", 10), 50);
    const cursor = req.query.cursor ? Number(req.query.cursor) : null;

    const params = [];
    let where = "WHERE 1=1";

    if (q) {
      params.push(q);
      where += `
        AND (
          nombre ILIKE '%' || $${params.length} || '%' OR
          apellido_paterno ILIKE '%' || $${params.length} || '%' OR
          apellido_materno ILIKE '%' || $${params.length} || '%' OR
          ciudad ILIKE '%' || $${params.length} || '%'
        )
      `;
    }

    if (cursor) {
      params.push(cursor);
      where += ` AND id > $${params.length} `;
    }

    params.push(limit);

    const { rows } = await pool.query(
      `
      SELECT
        id,
        nombre,
        apellido_paterno,
        apellido_materno,
        ciudad,
        pais,
        modalidad,
        idiomas,
        grado_academico AS formacion
      FROM public.profesionales
      ${where}
      ORDER BY id ASC
      LIMIT $${params.length}
      `,
      params
    );

    const nextCursor = rows.length ? rows[rows.length - 1].id : null;
    res.json({ data: rows, nextCursor });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "DB_ERROR" });
  }
});


app.get("/api/terapeutas/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "BAD_ID" });

    const { rows } = await pool.query(
      `
      SELECT
        id,
        nombre,
        apellido_paterno,
        apellido_materno,
        ciudad,
        pais,
        idiomas,
        poblacion_atiende,
        temas_trabaja,
        modalidad,
        modelo_trabajo AS enfoque,
        experiencia,
        grado_academico AS formacion,
        cedula,
        semblanza
      FROM public.profesionales
      WHERE id = $1
      LIMIT 1
      `,
      [id]
    );

    if (!rows.length) return res.status(404).json({ error: "NOT_FOUND" });

    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "DB_ERROR" });
  }
});


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`API corriendo en el puerto ${PORT}`)
})
