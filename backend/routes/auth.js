// routes/auth.js
// Login/logout for the single admin account. Session-based (cookie),
// not JWT — simpler to reason about for a project this size.

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const pool = require("../db");

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT * FROM admins WHERE username = ?",
      [username]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const admin = rows[0];
    const match = await bcrypt.compare(password, admin.password_hash);
    if (!match) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    req.session.adminId = admin.id;
    req.session.username = admin.username;
    res.json({ success: true, username: admin.username });
  } catch (err) {
    console.error("Login failed:", err.message);
    res.status(500).json({ error: "Login failed" });
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

router.get("/session", (req, res) => {
  if (req.session.adminId) {
    res.json({ loggedIn: true, username: req.session.username });
  } else {
    res.json({ loggedIn: false });
  }
});

module.exports = router;
