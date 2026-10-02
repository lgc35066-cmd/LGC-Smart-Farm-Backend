const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

// GET /api/irrigation/zones
// Returns all zones with their latest moisture reading
router.get("/zones", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        z.id, z.name, z.crop_type, z.area_hectares,
        r.moisture_pct AS latest_moisture,
        r.temperature_c AS latest_temperature,
        r.recorded_at AS last_reading_at
      FROM zones z
      LEFT JOIN LATERAL (
        SELECT moisture_pct, temperature_c, recorded_at
        FROM moisture_readings
        WHERE zone_id = z.id
        ORDER BY recorded_at DESC
        LIMIT 1
      ) r ON true
      ORDER BY z.id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch zones" });
  }
});

// GET /api/irrigation/zones/:id/readings?limit=20
router.get("/zones/:id/readings", async (req, res) => {
  try {
    const { id } = req.params;
    const limit = Math.min(Number(req.query.limit) || 20, 200);

    const result = await db.query(
      `SELECT id, moisture_pct, temperature_c, source, recorded_at
       FROM moisture_readings
       WHERE zone_id = $1
       ORDER BY recorded_at DESC
       LIMIT $2`,
      [id, limit]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch readings" });
  }
});

// POST /api/irrigation/zones/:id/readings
// Body: { moisture_pct, temperature_c?, source? }  (used by sensors or manual entry)
router.post("/zones/:id/readings", async (req, res) => {
  try {
    const { id } = req.params;
    const { moisture_pct, temperature_c, source } = req.body;

    if (moisture_pct === undefined) {
      return res.status(400).json({ error: "moisture_pct is required" });
    }

    const result = await db.query(
      `INSERT INTO moisture_readings (zone_id, moisture_pct, temperature_c, source)
       VALUES ($1, $2, $3, COALESCE($4, 'sensor'))
       RETURNING *`,
      [id, moisture_pct, temperature_c, source]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to record reading" });
  }
});

// POST /api/irrigation/zones/:id/irrigate
// Body: { duration_minutes?, note? }
router.post("/zones/:id/irrigate", async (req, res) => {
  try {
    const { id } = req.params;
    const { duration_minutes, note } = req.body;

    const zoneCheck = await db.query("SELECT id FROM zones WHERE id = $1", [id]);
    if (zoneCheck.rows.length === 0) {
      return res.status(404).json({ error: "Zone not found" });
    }

    const result = await db.query(
      `INSERT INTO irrigation_actions (zone_id, triggered_by, duration_minutes, status, note)
       VALUES ($1, $2, COALESCE($3, 10), 'completed', $4)
       RETURNING *`,
      [id, req.user.id, duration_minutes, note]
    );

    res.status(201).json({
      message: "💧 تم تشغيل الري بنجاح",
      action: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to trigger irrigation" });
  }
});

// GET /api/irrigation/zones/:id/actions?limit=20
router.get("/zones/:id/actions", async (req, res) => {
  try {
    const { id } = req.params;
    const limit = Math.min(Number(req.query.limit) || 20, 200);

    const result = await db.query(
      `SELECT id, duration_minutes, status, note, created_at
       FROM irrigation_actions
       WHERE zone_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [id, limit]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch irrigation actions" });
  }
});

module.exports = router;
