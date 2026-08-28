// features/window-controls.js
// Handles desktop-style window controls:
// - Red: Playful Easter Egg rotating messages beside window controls
// - Yellow: Normal-screen Easter Egg rotating messages; Restores normal window layout when in fullscreen
// - Green: Fullscreen mode with diagonal arrows icon
// - Center Command Pill: Triggers existing command palette

import { openPaletteWithMode } from "../components/command-palette.js";

const RED_PLAYFUL_MESSAGES = [
  "Nice try. I'm staying open 💜",
  "You can't close the portfolio that easily 😏",
  "Close button? More like a suggestion.",
  "I'm not going anywhere 🚀",
  "Portfolio says: nope 😎",
];

const YELLOW_PLAYFUL_MESSAGES = [
  "Nice try, but there's nowhere to minimize 😏",
  "We're already at minimum size 😂",
  "The minimize button is feeling unemployed 💼",
];

let redMessageIndex = 0;
let yellowMessageIndex = 0;
let messageTimeout = null;
let isFullscreen = false;
let isManualFullscreen = false;

export function initWindowControls() {
  const appContainer = document.querySelector(".app-container");
  const easterEggEl = document.getElementById("titlebar-easter-egg");
  const searchPill = document.getElementById("titlebar-search-pill");
  const closeBtn = document.querySelector(".mac-btn.close");
  const minBtn = document.querySelector(".mac-btn.minimize");
  const maxBtn = document.querySelector(".mac-btn.maximize");

  if (!appContainer) return;

  // --- Center Search Pill: Opens Command Palette ---
  if (searchPill) {
    searchPill.addEventListener("click", (e) => {
      e.stopPropagation();
      openPaletteWithMode("all");
    });
  }

  // --- Red Button: Playful Easter Egg beside controls ---
  if (closeBtn && easterEggEl) {
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      triggerEasterEgg(easterEggEl, "red");
    });
  }

  // --- Yellow Button: Easter Egg in normal mode; Restore in fullscreen ---
  if (minBtn) {
    minBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (isFullscreen) {
        exitFullscreenMode(appContainer, maxBtn, minBtn);
      } else if (easterEggEl) {
        triggerEasterEgg(easterEggEl, "yellow");
      }
    });
  }

  // --- Green Button: Fullscreen ---
  if (maxBtn) {
    maxBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      enterFullscreenMode(appContainer, maxBtn, minBtn);
    });
  }

  // Listen to browser fullscreen changes (e.g. Esc or F11)
  document.addEventListener("fullscreenchange", () => {
    const inBrowserFullscreen = Boolean(document.fullscreenElement);
    if (inBrowserFullscreen) {
      isFullscreen = true;
      appContainer.classList.add("is-fullscreen");
      updateControlsState(maxBtn, minBtn, true);
    } else if (!isManualFullscreen) {
      isFullscreen = false;
      appContainer.classList.remove("is-fullscreen");
      updateControlsState(maxBtn, minBtn, false);
    }
  });
}

function triggerEasterEgg(easterEggEl, type = "red") {
  if (isFullscreen) return;

  if (messageTimeout) {
    clearTimeout(messageTimeout);
    messageTimeout = null;
  }

  let message = "";
  if (type === "yellow") {
    message = YELLOW_PLAYFUL_MESSAGES[yellowMessageIndex];
    yellowMessageIndex =
      (yellowMessageIndex + 1) % YELLOW_PLAYFUL_MESSAGES.length;
  } else {
    message = RED_PLAYFUL_MESSAGES[redMessageIndex];
    redMessageIndex = (redMessageIndex + 1) % RED_PLAYFUL_MESSAGES.length;
  }

  easterEggEl.textContent = message;
  easterEggEl.classList.remove("is-visible");
  void easterEggEl.offsetWidth; // force reflow for smooth animation restart
  easterEggEl.classList.add("is-visible");

  messageTimeout = setTimeout(() => {
    easterEggEl.classList.remove("is-visible");
    messageTimeout = null;
  }, 2800);
}

function enterFullscreenMode(appContainer, maxBtn, minBtn) {
  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen().catch(() => {
      isManualFullscreen = true;
      appContainer.classList.add("is-fullscreen");
      isFullscreen = true;
      updateControlsState(maxBtn, minBtn, true);
    });
  } else {
    isManualFullscreen = true;
    appContainer.classList.add("is-fullscreen");
    isFullscreen = true;
    updateControlsState(maxBtn, minBtn, true);
  }
  appContainer.classList.add("is-fullscreen");
  isFullscreen = true;
  updateControlsState(maxBtn, minBtn, true);
}

function exitFullscreenMode(appContainer, maxBtn, minBtn) {
  if (document.fullscreenElement && document.exitFullscreen) {
    document.exitFullscreen().catch(() => {});
  }
  isManualFullscreen = false;
  appContainer.classList.remove("is-fullscreen");
  isFullscreen = false;
  updateControlsState(maxBtn, minBtn, false);
}

function updateControlsState(maxBtn, minBtn, fullscreenActive) {
  if (maxBtn) {
    maxBtn.setAttribute("title", "Fullscreen");
    maxBtn.setAttribute("aria-label", "Fullscreen");
  }
  if (minBtn) {
    if (fullscreenActive) {
      minBtn.setAttribute("title", "Restore");
      minBtn.setAttribute("aria-label", "Restore Portfolio");
    } else {
      minBtn.setAttribute("title", "Minimize Portfolio");
      minBtn.setAttribute("aria-label", "Minimize Portfolio");
    }
  }
}

export function toggleFullscreen() {
  const appContainer = document.querySelector(".app-container");
  const maxBtn = document.querySelector(".mac-btn.maximize");
  const minBtn = document.querySelector(".mac-btn.minimize");
  if (!appContainer) return;

  if (isFullscreen || appContainer.classList.contains("is-fullscreen")) {
    exitFullscreenMode(appContainer, maxBtn, minBtn);
  } else {
    enterFullscreenMode(appContainer, maxBtn, minBtn);
  }
}

export function getIsFullscreen() {
  return isFullscreen;
}
