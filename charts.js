// charts.js
// Owns Chart.js instance creation. Knows nothing about DOM events or
// selection state — app.js decides what data to pass in.
/* global Chart */

let mainChart = null;

const CHART_COLORS = {
  bronze: "#a97c50",
  bronzeLight: "#c79b6e",
  patina: "#5c8374",
  parchment: "#f0e6d2",
  gridLine: "rgba(240, 230, 210, 0.08)"
};

/**
 * Renders (or re-renders) the main bar chart. Generic across categories —
 * app.js decides which field's values to pass in and how to label them.
 * @param {string} canvasId
 * @param {{labels: string[], values: number[], highlightLga: string|null, datasetLabel: string, tooltipSuffix: string, yAxisLabel: string}} config
 */
function renderFaacChart(canvasId, { labels, values, highlightLga, datasetLabel, tooltipSuffix, yAxisLabel }) {
  const ctx = document.getElementById(canvasId).getContext("2d");

  const backgroundColors = labels.map(lga =>
    lga === highlightLga ? CHART_COLORS.patina : CHART_COLORS.bronze
  );

  if (mainChart) {
    mainChart.destroy();
  }

  mainChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: datasetLabel || "Value",
        data: values,
        backgroundColor: backgroundColors,
        borderRadius: 3,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#241f1a",
          titleColor: CHART_COLORS.parchment,
          bodyColor: CHART_COLORS.parchment,
          padding: 10,
          callbacks: {
            label: (item) => `${item.formattedValue}${tooltipSuffix || ""}`
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: CHART_COLORS.parchment,
            maxRotation: 60,
            minRotation: 60,
            font: { size: 11 }
          },
          grid: { display: false }
        },
        y: {
          ticks: { color: CHART_COLORS.parchment, font: { size: 11 } },
          grid: { color: CHART_COLORS.gridLine },
          title: {
            display: true,
            text: yAxisLabel || "",
            color: CHART_COLORS.parchment
          }
        }
      }
    }
  });

  return mainChart;
}

// Deliberately global — called from app.js via plain <script> tags
// (no bundler). This also satisfies linters that flag "defined but
// never used" for top-level function declarations.
window.renderFaacChart = renderFaacChart;