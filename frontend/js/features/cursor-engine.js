// features/cursor-engine.js
// Handles applying custom cursors based on the active theme

let mouseX = 0;
let mouseY = 0;
let trailX = 0;
let trailY = 0;
let isInterstellarActive = false;
let animationFrameId = null;

export function initCursorEngine() {
    document.addEventListener('themeChanged', (e) => {
        applyCursor(e.detail.theme);
    });

    // Create the trail element but keep it hidden by default
    const trailEl = document.createElement('div');
    trailEl.className = 'cursor-trail';
    trailEl.id = 'cursor-trail';
    document.body.appendChild(trailEl);

    document.addEventListener('mousemove', (e) => {
        if (!isInterstellarActive) return;
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
}

function applyCursor(themeId) {
    const body = document.body;
    
    // Clean up previous classes
    body.classList.remove('cursor-phm', 'cursor-f1', 'cursor-interstellar');
    isInterstellarActive = false;

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    if (themeId === 'project-hail-mary') {
        body.classList.add('cursor-phm');
    } else if (themeId === 'f1') {
        body.classList.add('cursor-f1');
    } else if (themeId === 'interstellar') {
        body.classList.add('cursor-interstellar');
        isInterstellarActive = true;
        // Start the trail animation loop
        trailX = mouseX;
        trailY = mouseY;
        animateTrail();
    }
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
