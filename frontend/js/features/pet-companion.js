// features/pet-companion.js
// Handles displaying and animating special theme companions via sprite sheets

const pets = {
    'project-hail-mary': {
        sprite: 'assets/pets/phm-sprite.png',
        frames: 7,
        width: 40,
        height: 30,
        reactionClass: 'reaction-bounce',
        durationMs: 500,
        speedMs: 5000 // Time to cross sidebar
    },
    'interstellar': {
        sprite: 'assets/pets/interstellar-sprite.png',
        frames: 8,
        width: 37,
        height: 30,
        reactionClass: 'reaction-flare',
        durationMs: 800,
        speedMs: 4000
    },
    'f1': {
        sprite: 'assets/pets/f1-sprite.png',
        frames: 1, // Updated: Since you uploaded a single static image!
        width: 45, // Updated: Scaled down from 447x447
        height: 45,
        reactionClass: 'reaction-boost',
        durationMs: 600,
        speedMs: 3000
    }
};

let currentPet = null;
let walkAnimation = null;
let spriteAnimation = null;
let isWalkingRight = true;

export function initPetCompanions() {
    const container = document.getElementById('pet-container');
    if (!container) return;

    // Create the sprite element
    const spriteEl = document.createElement('div');
    spriteEl.id = 'pet-sprite';
    container.appendChild(spriteEl);

    document.addEventListener('themeChanged', (e) => {
        const themeId = e.detail.theme;
        
        if (walkAnimation) {
            walkAnimation.cancel();
            walkAnimation = null;
        }
        if (spriteAnimation) {
            spriteAnimation.cancel();
            spriteAnimation = null;
        }

        if (pets[themeId]) {
            currentPet = pets[themeId];
            
            // Setup container
            container.style.width = `${currentPet.width}px`;
            container.style.height = `${currentPet.height}px`;
            container.classList.add('active');
            
            // Setup sprite sheet
            spriteEl.style.backgroundImage = `url(${currentPet.sprite})`;
            spriteEl.style.backgroundSize = `${currentPet.width * currentPet.frames}px 100%`;
            spriteEl.className = ''; // clear classes

            // Animate sprite frames using Web Animations API
            spriteAnimation = spriteEl.animate([
                { backgroundPosition: '0px 0px' },
                { backgroundPosition: `-${currentPet.width * currentPet.frames}px 0px` }
            ], {
                duration: currentPet.frames * 100, // 100ms per frame
                easing: `steps(${currentPet.frames})`,
                iterations: Infinity
            });

            // Start pacing loop
            isWalkingRight = true;
            pace();
        } else {
            container.classList.remove('active');
            currentPet = null;
        }
    });

    function pace() {
        if (!currentPet) return;
        
        const sidebar = container.parentElement;
        sidebar.style.position = 'relative'; // Force relative positioning to avoid CSS cache issues
        container.style.bottom = '0px'; // Ensure it's not overriding

        const maxTravel = sidebar.clientWidth - currentPet.width;

        const startX = isWalkingRight ? 0 : maxTravel;
        const endX = isWalkingRight ? maxTravel : 0;
        const scale = isWalkingRight ? 1 : -1;

        walkAnimation = container.animate([
            { transform: `translateX(${startX}px) scaleX(${scale})` },
            { transform: `translateX(${endX}px) scaleX(${scale})` }
        ], {
            duration: currentPet.speedMs,
            easing: 'linear',
            fill: 'forwards'
        });

        walkAnimation.onfinish = () => {
            isWalkingRight = !isWalkingRight;
            pace(); // loop
        };
    }

    // Handle window resize so the pet doesn't walk out of bounds
    window.addEventListener('resize', () => {
        if (currentPet && walkAnimation) {
            walkAnimation.cancel();
            pace(); // restart animation with new bounds
        }
    });

    // Click reactions
    container.addEventListener('click', () => {
        if (!currentPet) return;
        
        spriteEl.classList.add(currentPet.reactionClass);
        
        setTimeout(() => {
            spriteEl.classList.remove(currentPet.reactionClass);
        }, currentPet.durationMs);
    });
}
