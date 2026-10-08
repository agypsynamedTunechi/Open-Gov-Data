// routes/admin.js
// Protected routes: CSV import for populating/updating LGA data.
// All routes here require a valid admin session (see requireAuth).

const express = require("express");
const router = express.Router();
const multer = require("multer");
const { parse } = require("csv-parse/sync");
const pool = require("../db");
const requireAuth = require("../middleware/requireAuth");

const upload = multer({ storage: multer.memoryStorage() });

router.use(requireAuth);

// Column definitions per category — used to validate + build the upsert.
// "key" is the unique period column (year or month_year) matching the
// UNIQUE constraint on each table in schema.sql.
const CATEGORY_CONFIG = {
  demographics: {
    table: "demographics",
    periodColumn: "year",
    fields: ["population", "population_density", "male_female_ratio"]
  },
  education: {
    table: "education",
    periodColumn: "year",
    fields: ["primary_schools", "secondary_schools", "teachers", "student_teacher_ratio"]
  },
  health: {
    table: "health",
    periodColumn: "year",
    fields: ["health_facilities", "health_workers"]
  },
  economy: {
    table: "economy",
    periodColumn: "month_year",
    fields: ["faac_allocation_million", "cooperative_societies", "registered_markets"]
  }
};

// POST /api/admin/import
// multipart/form-data with fields: category, file (the CSV)
// CSV must have a header row: lga_name,<category fields...>,<year|month_year>
router.post("/import", upload.single("file"), async (req, res) => {
  const { category } = req.body;
  const config = CATEGORY_CONFIG[category];

  if (!config) {
    return res.status(400).json({
      error: `Unknown category "${category}". Must be one of: ${Object.keys(CATEGORY_CONFIG).join(", ")}`
    });
  }
  if (!req.file) {
    return res.status(400).json({ error: "No CSV file uploaded" });
  }

  let records;
  try {
    records = parse(req.file.buffer, { columns: true, skip_empty_lines: true, trim: true });
  } catch (err) {
    return res.status(400).json({ error: `CSV parse error: ${err.message}` });
  }

  if (records.length === 0) {
    return res.status(400).json({ error: "CSV has no data rows" });
  }

  const conn = await pool.getConnection();
  let imported = 0;
  const errors = [];

  try {
    await conn.beginTransaction();

    for (const [i, row] of records.entries()) {
      const rowNum = i + 2; // +2 accounts for header row + 0-index

      if (!row.lga_name) {
        errors.push(`Row ${rowNum}: missing lga_name`);
        continue;
      }
      if (!row[config.periodColumn]) {
        errors.push(`Row ${rowNum}: missing ${config.periodColumn}`);
        continue;
      }

      const [lgaRows] = await conn.query("SELECT id FROM lgas WHERE name = ?", [row.lga_name]);
      if (lgaRows.length === 0) {
        errors.push(`Row ${rowNum}: unknown LGA "${row.lga_name}"`);
        continue;
      }
      const lgaId = lgaRows[0].id;

      const columns = ["lga_id", ...config.fields, config.periodColumn];
      const values = [lgaId, ...config.fields.map(f => row[f] || null), row[config.periodColumn]];
      const placeholders = columns.map(() => "?").join(", ");

      // MySQL and Postgres use different upsert syntax. mysql2/pg driver
      // details are abstracted in db.js, but this one query is inherently
      // dialect-specific, so it branches explicitly on pool.isPostgres
      // rather than trying to force one syntax to work on both engines.
      let upsertSql;
      if (pool.isPostgres) {
        const updateClause = config.fields.map(f => `${f} = EXCLUDED.${f}`).join(", ");
        upsertSql = `INSERT INTO ${config.table} (${columns.join(", ")}) VALUES (${placeholders})
           ON CONFLICT (lga_id, ${config.periodColumn}) DO UPDATE SET ${updateClause}`;
      } else {
        const updateClause = config.fields.map(f => `${f} = VALUES(${f})`).join(", ");
        upsertSql = `INSERT INTO ${config.table} (${columns.join(", ")}) VALUES (${placeholders})
           ON DUPLICATE KEY UPDATE ${updateClause}`;
      }

      await conn.query(upsertSql, values);
      imported++;
    }

    await conn.query(
      "INSERT INTO import_logs (admin_id, filename, records_count) VALUES (?, ?, ?)",
      [req.session.adminId, req.file.originalname, imported]
    );

    await conn.commit();
    res.json({ success: true, imported, rowsInFile: records.length, errors });
  } catch (err) {
    await conn.rollback();
    console.error("Import failed:", err.message);
    res.status(500).json({ error: "Import failed", detail: err.message });
  } finally {
    conn.release();
  }
});

// GET /api/admin/import-logs — recent import history, for the admin UI
router.get("/import-logs", async (req, res) => {
  try {
    const [logs] = await pool.query(`
      SELECT import_logs.id, admins.username, import_logs.filename,
             import_logs.records_count, import_logs.imported_at
      FROM import_logs
      JOIN admins ON import_logs.admin_id = admins.id
      ORDER BY import_logs.imported_at DESC
      LIMIT 20
    `);
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch import logs" });
  }
});

module.exports = router;