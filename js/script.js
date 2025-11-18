const initLogoAnimation = () => {
    const container = document.getElementById('logosvg');
    if (!container) return;

    fetch('./assets/logosvg.svg')
        .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status} while fetching SVG`);
            return res.text();
        })
        .then(svg => {
            container.innerHTML = svg;

            const sterretjes = container.querySelectorAll('svg > g');
            const ster = Array.from(sterretjes).slice(0, 4);
            const starClasses = ['Starpopup', 'StarpopupRight'];
            const hoofdPath = container.querySelector('path[fill="url(#f)"]');

            if (!ster.length) {
                console.warn('No star elements found inside the SVG');
                return;
            }

            const triggerStar = (index) => {
                const star = ster[index];
                if (!star) return;

                if (hoofdPath) {
                    hoofdPath.classList.remove('hoofdAnim');
                    hoofdPath.getBoundingClientRect(); // reflow to restart hoofd animation
                    hoofdPath.classList.add('hoofdAnim');
                }

                const onAnimationEnd = (event) => {
                    if (event.target !== star) return;

                    star.classList.remove(...starClasses);
                    star.removeEventListener('animationend', onAnimationEnd);

                    const nextIndex = (index + 1) % ster.length;
                    requestAnimationFrame(() => triggerStar(nextIndex));
                };

                star.classList.remove(...starClasses);
                star.getBoundingClientRect(); // force reflow so the animation retriggers

                star.addEventListener('animationend', onAnimationEnd);
                const nextClass = starClasses[Math.floor(Math.random() * starClasses.length)];
                requestAnimationFrame(() => star.classList.add(nextClass));
            };

            triggerStar(0);
        })
        .catch(err => console.error('Failed to load SVG:', err));
};

const initSkeleton = () => {
    const container = document.getElementById('skeleton');
    if (!container) return;

    fetch('./assets/skellihead.svg')
        .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status} while fetching SVG`);
            return res.text();
        })
        .then(svg => {
            container.innerHTML = svg;
        })
        .catch(err => console.error('Failed to load SVG:', err));
};

const initContactFooter = () => {
    const footer = document.getElementById('ContactFooter');
    if (!footer) return;

    const contactLinks = Array.from(document.querySelectorAll('nav a, #MainNav a'))
        .filter(link => (link.textContent || '').trim().toLowerCase() === 'contact');

    if (!contactLinks.length) return;

    const AUTO_HIDE_DELAY = 8000;
    let hideTimeoutId = null;

    const updateTriggerState = (expanded) => {
        contactLinks.forEach(link => link.setAttribute('aria-expanded', expanded ? 'true' : 'false'));
        footer.setAttribute('aria-hidden', expanded ? 'false' : 'true');
    };

    const clearHideTimeout = () => {
        if (hideTimeoutId !== null) {
            clearTimeout(hideTimeoutId);
            hideTimeoutId = null;
        }
    };

    const hideFooter = () => {
        if (!footer.classList.contains('is-visible')) return;
        footer.classList.remove('is-visible');
        updateTriggerState(false);
        clearHideTimeout();
    };

    const startHideTimer = () => {
        clearHideTimeout();
        hideTimeoutId = window.setTimeout(hideFooter, AUTO_HIDE_DELAY);
    };

    const showFooter = () => {
        footer.classList.add('is-visible');
        updateTriggerState(true);
        startHideTimer();
    };

    const toggleFooter = (event) => {
        event.preventDefault();
        const visible = footer.classList.contains('is-visible');
        if (visible) {
            hideFooter();
        } else {
            showFooter();
        }
    };

    contactLinks.forEach(link => {
        link.classList.add('contact-trigger');
        link.addEventListener('click', toggleFooter);
    });

    footer.addEventListener('pointerenter', clearHideTimeout);
    footer.addEventListener('pointerleave', () => {
        if (footer.classList.contains('is-visible')) startHideTimer();
    });

    footer.addEventListener('focusin', clearHideTimeout);
    footer.addEventListener('focusout', (event) => {
        if (!footer.contains(event.relatedTarget) && footer.classList.contains('is-visible')) {
            startHideTimer();
        }
    });

    updateTriggerState(false);
};

document.addEventListener('DOMContentLoaded', () => {
    initLogoAnimation();
    initSkeleton();
    initContactFooter();
});
