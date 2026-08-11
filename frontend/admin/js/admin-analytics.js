import { adminApi } from "./admin-api.js";
import { showToast, setLoading } from "./admin-dashboard.js";

let isInitialized = false;
let pageViewsChartInstance = null;
let topCommandsChartInstance = null;

export async function initAnalyticsEditor() {
  if (isInitialized) return;
  isInitialized = true;

  await loadAnalytics();
}

async function loadAnalytics() {
  const chartsContainer = document.getElementById("analytics-charts-container");
  const emptyState = document.getElementById("analytics-empty-state");

  try {
    setLoading(true);
    const summary = await adminApi.getAnalyticsSummary();

    if (
      !summary ||
      (summary.page_views.length === 0 && summary.top_commands.length === 0)
    ) {
      chartsContainer.style.display = "none";
      emptyState.classList.remove("hidden");
      return;
    }

    chartsContainer.style.display = "flex";
    emptyState.classList.add("hidden");

    renderPageViewsChart(summary.page_views);
    renderTopCommandsChart(summary.top_commands);
  } catch (error) {
    showToast(error.message || "Failed to load analytics", "error");
    chartsContainer.style.display = "none";
    emptyState.textContent = "Failed to load analytics data.";
    emptyState.classList.remove("hidden");
  } finally {
    setLoading(false);
  }
}

function renderPageViewsChart(pageViews) {
  const ctx = document.getElementById("pageViewsChart").getContext("2d");

  if (pageViewsChartInstance) {
    pageViewsChartInstance.destroy();
  }

  if (!pageViews || pageViews.length === 0) return;

  const labels = pageViews.map((pv) => pv.date);
  const data = pageViews.map((pv) => pv.count);

  pageViewsChartInstance = new window.Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Page Views",
          data: data,
          borderColor: "#10b981", // var(--primary-color)
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          borderWidth: 2,
          fill: true,
          tension: 0.1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Page Views Over Time",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
          },
        },
      },
    },
  });
}

function renderTopCommandsChart(topCommands) {
  const ctx = document.getElementById("topCommandsChart").getContext("2d");

  if (topCommandsChartInstance) {
    topCommandsChartInstance.destroy();
  }

  if (!topCommands || topCommands.length === 0) return;

  const labels = topCommands.map((tc) => tc.command);
  const data = topCommands.map((tc) => tc.count);

  topCommandsChartInstance = new window.Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Usage Count",
          data: data,
          backgroundColor: "#3b82f6", // arbitrary nice blue
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Top Terminal Commands",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
          },
        },
      },
    },
  });
}
