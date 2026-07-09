import express from 'express'
import cors from 'cors'
import { pool } from './db.js'

const app = express()

const allowedOrigins = (process.env.FRONTEND_URL ?? '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

app.use(cors({
  origin: allowedOrigins.length ? allowedOrigins : true,
}))
app.use(express.json())



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
