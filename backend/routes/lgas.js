// routes/lgas.js
// Public read endpoints. No auth required — this is the data the
// dashboard itself consumes.

const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET /api/lgas
// Returns all 18 LGAs with their latest figures across every category,
// shaped to match the structure app.js already expects from data.js.
router.get("/", async (req, res) => {
  try {
    const [lgas] = await pool.query("SELECT id, name FROM lgas ORDER BY name");

    const [demographics] = await pool.query("SELECT * FROM demographics");
    const [education] = await pool.query("SELECT * FROM education");
    const [health] = await pool.query("SELECT * FROM health");
    const [economy] = await pool.query("SELECT * FROM economy");

    const byLga = (rows) => {
      const map = {};
      rows.forEach(r => { map[r.lga_id] = r; });
      return map;
    };

    const demoMap = byLga(demographics);
    const eduMap = byLga(education);
    const healthMap = byLga(health);
    const econMap = byLga(economy);

    const result = lgas.map(lga => ({
      name: lga.name,
      demographics: demoMap[lga.id] || null,
      education: eduMap[lga.id] || null,
      health: healthMap[lga.id] || null,
      economy: econMap[lga.id] || null
    }));

    res.json({ lgas: result });
  } catch (err) {
    console.error("GET /api/lgas failed:", err.message);
    res.status(500).json({ error: "Failed to fetch LGA data" });
  }
});

// GET /api/lgas/:name
// Single LGA lookup, used by the LGA-detail panel.
router.get("/:name", async (req, res) => {
  try {
    const [lgas] = await pool.query("SELECT id, name FROM lgas WHERE name = ?", [req.params.name]);
    if (lgas.length === 0) {
      return res.status(404).json({ error: "LGA not found" });
    }
    const lga = lgas[0];

    const [demographics] = await pool.query("SELECT * FROM demographics WHERE lga_id = ?", [lga.id]);
    const [education] = await pool.query("SELECT * FROM education WHERE lga_id = ?", [lga.id]);
    const [health] = await pool.query("SELECT * FROM health WHERE lga_id = ?", [lga.id]);
    const [economy] = await pool.query("SELECT * FROM economy WHERE lga_id = ?", [lga.id]);

    res.json({
      name: lga.name,
      demographics: demographics[0] || null,
      education: education[0] || null,
      health: health[0] || null,
      economy: economy[0] || null
    });
  } catch (err) {
    console.error(`GET /api/lgas/${req.params.name} failed:`, err.message);
    res.status(500).json({ error: "Failed to fetch LGA data" });
  }
});

module.exports = router;
