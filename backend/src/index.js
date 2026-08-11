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
const INVERSION_OPTIONS = [
  "Sí, quiero invertir en mi salud mental.",
  "No, en este momento no está en mis posibilidades.",
];

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
      rotationSeed: rows[0].id,
    })
      .then(({ agenteNombre }) => {
        if (!agenteNombre) return;
        return pool.query(
          "UPDATE public.solicitudes_agenda SET agente_asignado = $1 WHERE id = $2",
          [agenteNombre, rows[0].id]
        );
      })
      .catch((err) => console.error("Whaapy sync error:", err.message));

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
    const q = (req.query.q ?? "").toString().trim();

    const params = [];
    let where = "WHERE 1=1";
    if (cursor) {
      params.push(cursor);
      where += ` AND id < $${params.length}`;
    }
    if (q) {
      params.push(q);
      where += `
        AND (
          nombre ILIKE '%' || $${params.length} || '%' OR
          apellido ILIKE '%' || $${params.length} || '%' OR
          (nombre || ' ' || apellido) ILIKE '%' || $${params.length} || '%' OR
          telefono ILIKE '%' || $${params.length} || '%'
        )
      `;
    }
    const agente = (req.query.agente ?? "").toString().trim();
    if (agente === "sin") {
      where += " AND agente_asignado IS NULL";
    } else if (agente) {
      params.push(agente);
      where += ` AND agente_asignado ILIKE $${params.length}`;
    }
    params.push(limit);

    const { rows } = await pool.query(
      `
      SELECT id, nombre, apellido, edad, telefono, email, pais, ciudad,
             tipo_terapia, motivo_consulta, expectativas, inversion, agente_asignado, created_at
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
        p.id,
        p.nombre,
        p.apellido_paterno,
        p.apellido_materno,
        p.grado_academico AS formacion,
        p.semblanza,
        f.foto_url
      FROM public.profesionales p
      JOIN public.terapeutas_fotos f ON f.id_terapeuta = p.id
      WHERE f.foto_url IS NOT NULL
      ORDER BY p.id ASC
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

    // cursor compuesto "tieneFoto_id" porque el orden es foto-primero y luego id
    let cursorFoto = null;
    let cursorId = null;
    if (req.query.cursor) {
      const [f, i] = String(req.query.cursor).split("_");
      cursorFoto = Number(f);
      cursorId = Number(i);
      if (!Number.isFinite(cursorFoto) || !Number.isFinite(cursorId)) {
        cursorFoto = null;
        cursorId = null;
      }
    }

    const params = [];
    let where = "WHERE f.foto_url IS NOT NULL";

    if (q) {
      params.push(q);
      where += `
        AND (
          p.nombre ILIKE '%' || $${params.length} || '%' OR
          p.apellido_paterno ILIKE '%' || $${params.length} || '%' OR
          p.apellido_materno ILIKE '%' || $${params.length} || '%' OR
          p.ciudad ILIKE '%' || $${params.length} || '%'
        )
      `;
    }

    if (cursorId !== null) {
      params.push(cursorFoto);
      const pFoto = params.length;
      params.push(cursorId);
      const pId = params.length;
      where += `
        AND (
          (f.foto_url IS NOT NULL)::int < $${pFoto}
          OR ((f.foto_url IS NOT NULL)::int = $${pFoto} AND p.id > $${pId})
        )
      `;
    }

    params.push(limit);

    const { rows } = await pool.query(
      `
      SELECT
        p.id,
        p.nombre,
        p.apellido_paterno,
        p.apellido_materno,
        p.ciudad,
        p.pais,
        p.modalidad,
        p.idiomas,
        p.grado_academico AS formacion,
        f.foto_url
      FROM public.profesionales p
      JOIN public.terapeutas_fotos f ON f.id_terapeuta = p.id
      ${where}
      ORDER BY (f.foto_url IS NOT NULL)::int DESC, p.id ASC
      LIMIT $${params.length}
      `,
      params
    );

    const last = rows[rows.length - 1];
    const nextCursor = rows.length ? `${last.foto_url ? 1 : 0}_${last.id}` : null;
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
        p.id,
        p.nombre,
        p.apellido_paterno,
        p.apellido_materno,
        p.ciudad,
        p.pais,
        p.idiomas,
        p.poblacion_atiende,
        p.temas_trabaja,
        p.modalidad,
        p.modelo_trabajo AS enfoque,
        p.experiencia,
        p.grado_academico AS formacion,
        p.cedula,
        p.semblanza,
        f.foto_url
      FROM public.profesionales p
      LEFT JOIN public.terapeutas_fotos f ON f.id_terapeuta = p.id
      WHERE p.id = $1
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
