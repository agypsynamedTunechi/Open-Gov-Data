// db.js
// Database connection layer. Supports two modes:
//
//  - Local development: MySQL, via mysql2 (matches Chapter 3's documented
//    setup -- XAMPP/phpMyAdmin, schema.sql). Used whenever DATABASE_URL
//    is not set.
//
//  - Hosted deployment: PostgreSQL, via pg (schema_postgres.sql). Used
//    automatically when DATABASE_URL is set -- this is how Render and
//    most hosting providers configure their managed Postgres add-ons.
//
// Route files (routes/lgas.js, routes/auth.js, routes/admin.js) are
// written against mysql2's pool.query() interface, which returns
// [rows, fields]. The Postgres branch below is wrapped so it returns
// the exact same shape, meaning no route file needs to know or care
// which database is actually running underneath. The one exception is
// the CSV import's upsert query in routes/admin.js, which uses
// database-specific syntax (ON DUPLICATE KEY UPDATE vs ON CONFLICT) and
// branches explicitly on module.exports.isPostgres.

require("dotenv").config();

let pool;
let isPostgres = false;

if (process.env.DATABASE_URL) {
  isPostgres = true;
  const { Pool } = require("pg");
  const pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.PGSSL === "false" ? false : { rejectUnauthorized: false }
  });

  // mysql2 uses "?" placeholders; pg uses "$1, $2, ...". Convert on the fly
  // so route files can keep writing "?" the same way everywhere.
  function toPgPlaceholders(sql) {
    let i = 0;
    return sql.replace(/\?/g, () => `$${++i}`);
  }

  async function pgQuery(sql, params = []) {
    const result = await pgPool.query(toPgPlaceholders(sql), params);
    return [result.rows];
  }

  pool = {
    query: pgQuery,
    getConnection: async () => {
      const client = await pgPool.connect();
      return {
        query: async (sql, params = []) => {
          const result = await client.query(toPgPlaceholders(sql), params);
          return [result.rows];
        },
        beginTransaction: () => client.query("BEGIN"),
        commit: () => client.query("COMMIT"),
        rollback: () => client.query("ROLLBACK"),
        release: () => client.release()
      };
    },
    end: () => pgPool.end()
  };
} else {
  const mysql = require("mysql2/promise");
  pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "edo_dashboard",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
}

pool.isPostgres = isPostgres;
module.exports = pool;