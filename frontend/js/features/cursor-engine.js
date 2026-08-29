import { themes, getCurrentTheme } from './theme-engine.js';

let mouseX = 0;
let mouseY = 0;
let trailX = 0;
let trailY = 0;
let isInterstellarActive = false;
let animationFrameId = null;

function generateCursorSvg(color, pressed = false) {
    const scale = pressed ? 0.94 : 1;
    const offset = pressed ? 0.5 : 0;
    const cleanColor = color || '#007acc';
    const gradId = 'cs_g_' + cleanColor.replace('#', '') + (pressed ? '_p' : '');
    const filterId = 'cs_f' + (pressed ? '_p' : '');

    // PortfolioOS Precision Cursor:
    // Razor-sharp delta silhouette, contrasting outer boundary, faceted body, spine highlight, and micro-optic tip
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">` +
      `<defs>` +
        `<filter id="${filterId}" x="-20%" y="-20%" width="160%" height="160%">` +
          `<feDropShadow dx="0.5" dy="1.2" stdDeviation="0.8" flood-color="#000000" flood-opacity="0.6"/>` +
        `</filter>` +
        `<linearGradient id="${gradId}" x1="0" y1="0" x2="1" y2="1">` +
          `<stop offset="0%" stop-color="#ffffff" stop-opacity="0.75"/>` +
          `<stop offset="45%" stop-color="${cleanColor}"/>` +
          `<stop offset="100%" stop-color="${cleanColor}"/>` +
        `</linearGradient>` +
      `</defs>` +
      `<g transform="translate(${offset}, ${offset}) scale(${scale})" filter="url(#${filterId})">` +
        `<!-- High-contrast outer silhouette boundary -->` +
        `<path d="M1 1 L15.5 10.2 L8.8 11.8 L11.2 17.6 L8.4 18.8 L6.2 12.8 L1 16 Z" fill="#0d1117" stroke="#0d1117" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>` +
        `<!-- Left faceted blade (illuminated) -->` +
        `<path d="M1 1 L7 12.2 L6.2 12.8 L1 16 Z" fill="url(#${gradId})" />` +
        `<!-- Right faceted wing (deeper accent) -->` +
        `<path d="M1 1 L15.5 10.2 L8.8 11.8 L11.2 17.6 L8.4 18.8 L7 12.2 Z" fill="${cleanColor}" />` +
        `<!-- Precision spine highlight -->` +
        `<line x1="1" y1="1" x2="7" y2="12.2" stroke="#ffffff" stroke-width="0.9" stroke-linecap="round" opacity="0.85"/>` +
        `<!-- Precision micro-optic detail near tip -->` +
        `<circle cx="3.6" cy="4.2" r="0.9" fill="#ffffff" />` +
      `</g>` +
    `</svg>`;

    return `url('data:image/svg+xml;utf8,${encodeURIComponent(svg)}') 1 1, default`;
}

export function initCursorEngine() {
    document.addEventListener('themeChanged', (e) => {
        applyCursor(e.detail.theme);
    });

    // Create the trail element but keep it hidden by default
    let trailEl = document.getElementById('cursor-trail');
    if (!trailEl) {
        trailEl = document.createElement('div');
        trailEl.className = 'cursor-trail';
        trailEl.id = 'cursor-trail';
        document.body.appendChild(trailEl);
    }

    document.addEventListener('mousemove', (e) => {
        if (!isInterstellarActive) return;
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Apply cursor on initial startup
    applyCursor(getCurrentTheme());
}

function generateF1SpeedVectorSvg(state = 'normal') {
    const isHover = state === 'hover';
    const isActive = state === 'active';

    const glowOpacity = isHover ? '0.85' : (isActive ? '0.95' : '0.6');
    const glowRadius = isHover ? '1.8' : (isActive ? '2.2' : '1.2');
    const scale = isActive ? 0.94 : 1;
    const offset = isActive ? 0.8 : 0;
    const trailExtend = isHover ? 2 : 0;

    const f1Red = '#e10600';
    const f1RedLight = isActive ? '#ff5247' : '#ff2a1a';
    const carbonDark = '#141418';
    const carbonMid = '#22222a';

    const filterId = `f1_glow_${state}`;

    return `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" fill="none">` +
      `<defs>` +
        `<filter id="${filterId}" x="-25%" y="-25%" width="170%" height="170%">` +
          `<feDropShadow dx="0" dy="1" stdDeviation="${glowRadius}" flood-color="${f1Red}" flood-opacity="${glowOpacity}"/>` +
          `<feDropShadow dx="0.5" dy="1.2" stdDeviation="0.8" flood-color="#000000" flood-opacity="0.8"/>` +
        `</filter>` +
        `<linearGradient id="bladeGrad_${state}" x1="2" y1="2" x2="11" y2="15" gradientUnits="userSpaceOnUse">` +
          `<stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>` +
          `<stop offset="25%" stop-color="${f1RedLight}"/>` +
          `<stop offset="100%" stop-color="${f1Red}"/>` +
        `</linearGradient>` +
        `<linearGradient id="carbonGrad_${state}" x1="2" y1="2" x2="20" y2="12" gradientUnits="userSpaceOnUse">` +
          `<stop offset="0%" stop-color="${carbonMid}"/>` +
          `<stop offset="60%" stop-color="${carbonDark}"/>` +
          `<stop offset="100%" stop-color="#09090b"/>` +
        `</linearGradient>` +
      `</defs>` +
      `<g transform="translate(${offset}, ${offset}) scale(${scale})" filter="url(#${filterId})">` +
        `<!-- Speed Trail Elements (Concept #6) -->` +
        `<line x1="12.5" y1="15.5" x2="${16.5 + trailExtend}" y2="${19.5 + trailExtend}" stroke="${f1Red}" stroke-width="1.8" stroke-linecap="round" opacity="${isHover ? 0.95 : 0.8}"/>` +
        `<circle cx="${18 + trailExtend}" cy="${21 + trailExtend}" r="1.3" fill="${f1RedLight}" opacity="0.9"/>` +
        `<line x1="15" y1="13.5" x2="${20 + trailExtend}" y2="${18.5 + trailExtend}" stroke="${f1Red}" stroke-width="1.6" stroke-linecap="round" opacity="${isHover ? 0.9 : 0.75}"/>` +
        `<circle cx="${21.5 + trailExtend}" cy="${20 + trailExtend}" r="1.1" fill="${f1RedLight}" opacity="0.85"/>` +
        `<!-- Dark carbon backing silhouette -->` +
        `<path d="M2 2 L20.5 11.5 L11.5 14.8 L6.5 20.5 L2 2 Z" fill="#0a0a0d" stroke="#0a0a0d" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>` +
        `<!-- F1 Red outer perimeter structural rim -->` +
        `<path d="M2 2 L20.5 11.5 L11.5 14.8 L6.5 20.5 L2 2 Z" stroke="${f1Red}" stroke-width="1.2" stroke-linejoin="round"/>` +
        `<!-- Right Wing: Carbon-fiber facet -->` +
        `<path d="M2.5 2.5 L19.8 11.2 L11.3 14.3 Z" fill="url(#carbonGrad_${state})"/>` +
        `<line x1="6" y1="5" x2="15" y2="10.5" stroke="#383842" stroke-width="0.6" opacity="0.6"/>` +
        `<line x1="8" y1="7" x2="13" y2="12" stroke="#383842" stroke-width="0.5" opacity="0.5"/>` +
        `<!-- Left Wing: Red telemetry power blade -->` +
        `<path d="M2.5 2.5 L11.3 14.3 L6.8 19.8 Z" fill="url(#bladeGrad_${state})"/>` +
        `<!-- Center telemetry divider spine -->` +
        `<line x1="2.5" y1="2.5" x2="11.3" y2="14.3" stroke="#ffffff" stroke-width="0.9" stroke-linecap="round" opacity="0.95"/>` +
        `<!-- Leading edge white racing stripe -->` +
        `<line x1="2" y1="2" x2="6.5" y2="20.5" stroke="#ffffff" stroke-width="0.85" stroke-linecap="round" opacity="0.85"/>` +
        `<!-- Micro apex optic marker near sharp tip -->` +
        `<circle cx="4.2" cy="4.5" r="0.8" fill="#ffffff" opacity="0.95"/>` +
      `</g>` +
    `</svg>`;
}

function applyF1Cursor() {
    const normal = `url('data:image/svg+xml;utf8,${encodeURIComponent(generateF1SpeedVectorSvg('normal'))}') 2 2, default`;
    const hover = `url('data:image/svg+xml;utf8,${encodeURIComponent(generateF1SpeedVectorSvg('hover'))}') 2 2, default`;
    const active = `url('data:image/svg+xml;utf8,${encodeURIComponent(generateF1SpeedVectorSvg('active'))}') 2 2, default`;

    document.documentElement.style.setProperty('--cursor-f1', normal);
    document.documentElement.style.setProperty('--cursor-f1-hover', hover);
    document.documentElement.style.setProperty('--cursor-f1-active', active);
}

export function applyCursor(themeId) {
    const body = document.body;
    
    // Clean up previous classes
    body.classList.remove('cursor-phm', 'cursor-f1', 'cursor-interstellar', 'has-portfolio-cursor');
    isInterstellarActive = false;

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    // Special themes retain their unique custom identities
    if (themeId === 'project-hail-mary') {
        body.classList.add('cursor-phm');
        return;
    }

    if (themeId === 'f1') {
        body.classList.add('cursor-f1');
        applyF1Cursor();
        return;
    }

    if (themeId === 'interstellar') {
        body.classList.add('cursor-interstellar');
        isInterstellarActive = true;
        trailX = mouseX;
        trailY = mouseY;
        animateTrail();
        return;
    }

    // Standard 10 themes get the theme-adaptive PortfolioOS precision cursor
    const themeObj = themes.find(t => t.id === themeId);
    const accentColor = (themeObj && themeObj.color) ? themeObj.color : '#007acc';
    const cursorNormal = generateCursorSvg(accentColor, false);
    const cursorActive = generateCursorSvg(accentColor, true);

    document.documentElement.style.setProperty('--portfolio-cursor', cursorNormal);
    document.documentElement.style.setProperty('--portfolio-cursor-active', cursorActive);
    body.classList.add('has-portfolio-cursor');
}

function animateTrail() {
    if (!isInterstellarActive) return;
    
    // Ease the trail towards the cursor (gravitational drag effect)
    trailX += (mouseX - trailX) * 0.15;
    trailY += (mouseY - trailY) * 0.15;

    const trailEl = document.getElementById('cursor-trail');
    if (trailEl) {
        trailEl.style.left = `${trailX}px`;
        trailEl.style.top = `${trailY}px`;
    }

    animationFrameId = requestAnimationFrame(animateTrail);
}
