// server.js
// Entry point for the Edo Dashboard API.

require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const session = require("express-session");

const lgaRoutes = require("./routes/lgas");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || "dev_only_change_this",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 4 } // 4 hour session
}));

app.use("/api/lgas", lgaRoutes);
app.use("/api/admin", authRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Serve the frontend (index.html, admin.html, app.js, style.css, etc.)
// from this same server, on this same origin. This is deliberate: serving
// the frontend from a separate tool (like VS Code Live Server) puts it on
// a different origin (e.g. 127.0.0.1 vs localhost), and browsers block
// session cookies across that mismatch, which breaks admin login. Serving
// everything from one Express server avoids that whole class of problem.
app.use(express.static(path.join(__dirname, "..")));

app.listen(PORT, () => {
  console.log(`Edo Dashboard running on http://localhost:${PORT}`);
  console.log(`Dashboard:      http://localhost:${PORT}/index.html`);
  console.log(`Admin panel:    http://localhost:${PORT}/admin.html`);
});