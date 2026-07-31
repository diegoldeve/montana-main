import pkg from 'pg'
const { Pool } = pkg
import 'dotenv/config'

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
  // Sin estos timeouts, una conexión muerta (idle cortada por el host) cuelga la query indefinidamente
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  query_timeout: 15000,
  keepAlive: true,
})

pool.on('error', (err) => {
  console.error('Postgres pool error:', err.message)
})
