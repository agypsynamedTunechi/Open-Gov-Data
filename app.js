// app.js
// Fetches live data from the Express API (/api/lgas). Falls back to the
// static edoData (data.js) if the backend is unreachable — e.g. during a
// demo where the server didn't get started — so the dashboard never shows
// a blank page.
/* global edoData, renderFaacChart */

const API_URL = "/api/lgas";

// Category definitions: each knows how to read its own value off a
// normalized LGA record and how to label/format it. Adding a new category
// (e.g. once education data lands) means adding one entry here — nothing
// else in this file needs to change.
const CATEGORIES = {
  economy: {
    label: "Economy",
    title: "FAAC Allocation by LGA",
    subtitle: "April 2026 · ₦ millions · Source: OurLgaMoni.com",
    datasetLabel: "FAAC Allocation (₦ millions)",
    tooltipSuffix: "M",
    yAxisLabel: "₦ Millions",
    formatValue: (v) => `₦${v.toFixed(1)}M`,
    getValue: (lga) => lga.economy?.faacAllocationMillionNaira ?? null
  },
  demographics: {
    label: "Demographics",
    title: "Population by LGA",
    subtitle: "2006 census · Source: Edo State Statistical Year Book 2013, Table 2.3",
    datasetLabel: "Population",
    tooltipSuffix: "",
    yAxisLabel: "Population",
    formatValue: (v) => Math.round(v).toLocaleString(),
    getValue: (lga) => lga.demographics?.population ?? null
  },
  health: {
    label: "Health",
    title: "Health Facilities by LGA",
    subtitle: "2012 · Source: Edo State Statistical Year Book 2013, Table 5.8 (Etsako Central: gap in source)",
    datasetLabel: "Health Facilities",
    tooltipSuffix: "",
    yAxisLabel: "Number of Facilities",
    formatValue: (v) => Math.round(v).toLocaleString(),
    getValue: (lga) => lga.health?.healthFacilities ?? null
  },
  education: {
    label: "Education",
    title: "Primary Schools by LGA",
    subtitle: "2012 · Source: Edo State Statistical Year Book 2013, Table 8.1D",
    datasetLabel: "Primary Schools",
    tooltipSuffix: "",
    yAxisLabel: "Number of Schools",
    formatValue: (v) => Math.round(v).toLocaleString(),
    getValue: (lga) => lga.education?.primarySchools ?? null
  }
};

let lgas = [];          // normalized, in-memory working data for this session
let activeCategory = "economy";

document.addEventListener("DOMContentLoaded", async () => {
  const lgaSelect = document.getElementById("lga-select");
  const summaryCardsEl = document.getElementById("summary-cards");
  const lgaDetailEl = document.getElementById("lga-detail");
  const dataSourceBanner = document.getElementById("data-source-banner");
  const categoryTabsEl = document.getElementById("category-tabs");
  const chartTitleEl = document.getElementById("chart-title");
  const chartSubtitleEl = document.getElementById("chart-subtitle");

  lgas = await loadData(dataSourceBanner);

  populateLgaSelect();
  enableDataTabs();
  renderAll();

  lgaSelect.addEventListener("change", () => renderAll());

  categoryTabsEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".tab");
    if (!btn || btn.disabled) return;
    activeCategory = btn.dataset.category;
    categoryTabsEl.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t === btn));
    renderAll();
  });

  // ---------------------------------------------------------------
  // Data loading — API first, static file as fallback
  // ---------------------------------------------------------------
  async function loadData(banner) {
    try {
      const res = await fetch(API_URL, { signal: AbortSignal.timeout(15000) });
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const json = await res.json();
      return normalizeApiData(json.lgas);
    } catch (err) {
      console.warn("Live API unreachable, falling back to static data.js:", err.message);
      if (banner) {
        banner.hidden = false;
        banner.textContent =
          "⚠ Live server unreachable — showing locally saved data. Start the backend (node server.js) for current figures.";
      }
      if (typeof edoData !== "undefined") {
        return normalizeStaticData(edoData.lgas);
      }
      return [];
    }
  }

  // API returns snake_case fields straight from MySQL (numbers as strings).
  // Normalize to one consistent shape so the rest of the app never needs
  // to know whether data came from the live API or the static fallback.
  function normalizeApiData(apiLgas) {
    return apiLgas.map(lga => ({
      name: lga.name,
      economy: lga.economy ? {
        faacAllocationMillionNaira: numOrNull(lga.economy.faac_allocation_million)
      } : null,
      demographics: lga.demographics ? {
        population: numOrNull(lga.demographics.population),
        maleFemaleRatio: numOrNull(lga.demographics.male_female_ratio)
      } : null,
      health: lga.health ? {
        healthFacilities: numOrNull(lga.health.health_facilities),
        healthWorkers: numOrNull(lga.health.health_workers)
      } : null,
      education: lga.education ? {
        primarySchools: numOrNull(lga.education.primary_schools),
        secondarySchools: numOrNull(lga.education.secondary_schools),
        teachers: numOrNull(lga.education.teachers)
      } : null
    }));
  }

  function normalizeStaticData(staticLgas) {
    return staticLgas.map(lga => ({
      name: lga.name,
      economy: {
        faacAllocationMillionNaira: lga.economy.faacAllocationMillionNaira
      },
      demographics: lga.demographics.population ? {
        population: lga.demographics.population,
        maleFemaleRatio: lga.demographics.maleFemaleRatio
      } : null,
      health: lga.health.healthFacilities !== undefined ? {
        healthFacilities: lga.health.healthFacilities,
        healthWorkers: lga.health.healthWorkers
      } : null,
      education: lga.education.primarySchools ? {
        primarySchools: lga.education.primarySchools,
        secondarySchools: lga.education.secondarySchools,
        teachers: lga.education.teachers
      } : null
    }));
  }

  function numOrNull(v) {
    if (v === null || v === undefined) return null;
    const n = parseFloat(v);
    return Number.isNaN(n) ? null : n;
  }

  // ---------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------
  function populateLgaSelect() {
    lgas.forEach(lga => {
      const opt = document.createElement("option");
      opt.value = lga.name;
      opt.textContent = lga.name;
      lgaSelect.appendChild(opt);
    });
  }

  // Enable a category tab only if at least one LGA actually has data for it.
  function enableDataTabs() {
    Object.keys(CATEGORIES).forEach(key => {
      if (key === "economy") return; // always on, always has data
      const hasData = lgas.some(l => CATEGORIES[key].getValue(l) != null);
      const btn = categoryTabsEl.querySelector(`[data-category="${key}"]`);
      if (btn && hasData) {
        btn.disabled = false;
        btn.title = "";
      }
    });
  }

  function renderAll() {
    const selected = lgaSelect.value;
    const highlightLga = selected === "all" ? null : selected;
    drawChart(highlightLga);
    renderSummaryCards();
    renderLgaDetail(highlightLga);
  }

  function drawChart(highlightLga) {
    const cat = CATEGORIES[activeCategory];
    chartTitleEl.textContent = cat.title;
    chartSubtitleEl.textContent = cat.subtitle;

    const withData = lgas.filter(l => cat.getValue(l) != null);
    const labels = withData.map(l => l.name);
    const values = withData.map(l => cat.getValue(l));

    renderFaacChart("main-chart", {
      labels, values, highlightLga,
      datasetLabel: cat.datasetLabel,
      tooltipSuffix: cat.tooltipSuffix,
      yAxisLabel: cat.yAxisLabel
    });
  }

  function renderSummaryCards() {
    const cat = CATEGORIES[activeCategory];
    const withData = lgas.filter(l => cat.getValue(l) != null);

    if (withData.length === 0) {
      summaryCardsEl.innerHTML = `<p class="chart-subtitle">No data available for this category yet.</p>`;
      return;
    }

    const values = withData.map(l => cat.getValue(l));
    const total = values.reduce((a, b) => a + b, 0);
    const avg = total / values.length;
    const top = [...withData].sort((a, b) => cat.getValue(b) - cat.getValue(a))[0];
    const bottom = [...withData].sort((a, b) => cat.getValue(a) - cat.getValue(b))[0];

    const cards = [
      { label: `Total (${withData.length} LGAs)`, value: cat.formatValue(total) },
      { label: "Average per LGA", value: cat.formatValue(avg) },
      { label: "Highest — " + top.name, value: cat.formatValue(cat.getValue(top)) },
      { label: "Lowest — " + bottom.name, value: cat.formatValue(cat.getValue(bottom)) }
    ];

    summaryCardsEl.innerHTML = cards.map(c => `
      <div class="summary-card">
        <p class="label">${c.label}</p>
        <p class="value">${c.value}</p>
      </div>
    `).join("");
  }

  function renderLgaDetail(lgaName) {
    if (!lgaName) {
      lgaDetailEl.hidden = true;
      lgaDetailEl.innerHTML = "";
      return;
    }
    const lga = lgas.find(l => l.name === lgaName);
    if (!lga) return;

    lgaDetailEl.hidden = false;

    const rows = Object.entries(CATEGORIES)
      .map(([, cat]) => {
        const v = cat.getValue(lga);
        return `<p>${cat.label}: ${v != null ? cat.formatValue(v) : "No data yet"}</p>`;
      }).join("");

    lgaDetailEl.innerHTML = `
      <h3>${lga.name}</h3>
      ${rows}
    `;
  }
});