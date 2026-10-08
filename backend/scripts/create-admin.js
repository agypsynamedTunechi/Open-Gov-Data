// scripts/create-admin.js
// Run this once to create your admin login.
// Usage: node scripts/create-admin.js <username> <password>
//
// Deliberately not run automatically or seeded in schema.sql — an admin
// password should never live in a file you might commit or submit.

require("dotenv").config();
const bcrypt = require("bcrypt");
const pool = require("../db");

async function createAdmin() {
  const [, , username, password] = process.argv;

  if (!username || !password) {
    console.error("Usage: node scripts/create-admin.js <username> <password>");
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("Password should be at least 8 characters.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    await pool.query(
      "INSERT INTO admins (username, password_hash) VALUES (?, ?)",
      [username, passwordHash]
    );
    console.log(`Admin "${username}" created successfully.`);
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      console.error(`Username "${username}" already exists.`);
    } else {
      console.error("Failed to create admin:", err.message);
    }
  } finally {
    await pool.end();
  }
}

createAdmin();
