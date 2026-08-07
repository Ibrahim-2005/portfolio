// Adds visual-only interactions: pane transitions, scroll reveals, and soft pointer light.
export function initUiPolish() {
    const app = document.querySelector('.app-container');
    const pane = document.querySelector('.content-pane');

    if (!app || !pane) return;

    const syncPointerGlow = (event) => {
        app.style.setProperty('--pointer-x', `${event.clientX}px`);
        app.style.setProperty('--pointer-y', `${event.clientY}px`);
    };

    window.addEventListener('pointermove', syncPointerGlow, { passive: true });

    const revealObserver = 'IntersectionObserver' in window
        ? new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { root: pane, threshold: 0.12, rootMargin: '0px 0px -8% 0px' })
        : null;

    const prepareReveals = () => {
        const targets = pane.querySelectorAll(
            '.home-comment, .home-title, .home-tagline, .home-badges, .home-intro, .home-ctas, .stat-block, .project-card, .content-pane > h1, .content-pane > h2, .content-pane > p, .content-pane li, .content-pane table, iframe'
        );

        targets.forEach((target, index) => {
            target.classList.add('reveal-on-scroll');
            target.style.setProperty('--reveal-delay', `${Math.min(index * 45, 360)}ms`);
            if (revealObserver) {
                revealObserver.observe(target);
            } else {
                target.classList.add('is-visible');
            }
        });
    };

    const runPaneTransition = () => {
        pane.classList.remove('content-enter');
        void pane.offsetWidth;
        pane.classList.add('content-enter');
        prepareReveals();
    };

    const mutationObserver = new MutationObserver(runPaneTransition);
    mutationObserver.observe(pane, { childList: true });
    runPaneTransition();
}
