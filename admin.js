// admin.js
// Talks to the Express API for login, session check, and CSV import.
// Uses credentials: 'include' throughout so the session cookie is sent.

const API_BASE = "/api/admin";

const loginView = document.getElementById("login-view");
const importView = document.getElementById("import-view");
const loginMsg = document.getElementById("login-msg");
const importMsg = document.getElementById("import-msg");
const logsList = document.getElementById("logs-list");

document.addEventListener("DOMContentLoaded", checkSession);

document.getElementById("login-btn").addEventListener("click", login);
document.getElementById("logout-btn").addEventListener("click", logout);
document.getElementById("import-btn").addEventListener("click", importCsv);

async function checkSession() {
  const res = await fetch(`${API_BASE}/session`, { credentials: "include" });
  const data = await res.json();
  if (data.loggedIn) {
    showImportView();
  } else {
    showLoginView();
  }
}

async function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();

  if (res.ok) {
    showImportView();
  } else {
    showMsg(loginMsg, data.error || "Login failed", "error");
  }
}

async function logout() {
  await fetch(`${API_BASE}/logout`, { method: "POST", credentials: "include" });
  showLoginView();
}

async function importCsv() {
  const category = document.getElementById("category").value;
  const fileInput = document.getElementById("csv-file");
  const file = fileInput.files[0];

  if (!file) {
    showMsg(importMsg, "Choose a CSV file first.", "error");
    return;
  }

  const formData = new FormData();
  formData.append("category", category);
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/import`, {
    method: "POST",
    credentials: "include",
    body: formData
  });
  const data = await res.json();

  if (res.ok) {
    let text = `Imported ${data.imported} of ${data.rowsInFile} rows.`;
    if (data.errors.length > 0) {
      text += ` ${data.errors.length} row(s) had issues: ${data.errors.join("; ")}`;
    }
    showMsg(importMsg, text, data.errors.length > 0 ? "error" : "success");
    loadLogs();
  } else {
    showMsg(importMsg, data.error || "Import failed", "error");
  }
}

async function loadLogs() {
  const res = await fetch(`${API_BASE}/import-logs`, { credentials: "include" });
  if (!res.ok) return;
  const data = await res.json();
  logsList.innerHTML = data.logs.map(log => `
    <li>${log.filename} — ${log.records_count} records by ${log.username}
    (${new Date(log.imported_at).toLocaleString()})</li>
  `).join("");
}

function showLoginView() {
  loginView.classList.remove("hidden");
  importView.classList.add("hidden");
}

function showImportView() {
  loginView.classList.add("hidden");
  importView.classList.remove("hidden");
  loadLogs();
}

function showMsg(el, text, type) {
  el.innerHTML = `<div class="msg ${type}">${text}</div>`;
}