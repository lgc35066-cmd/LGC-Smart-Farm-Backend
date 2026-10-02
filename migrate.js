const fs = require("fs");
const path = require("path");
const { pool } = require("../db");

async function migrate() {
  const schemaPath = path.join(__dirname, "..", "..", "sql", "schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf8");

  console.log("Applying schema.sql ...");
  await pool.query(sql);
  console.log("Schema applied successfully.");
  await pool.end();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
