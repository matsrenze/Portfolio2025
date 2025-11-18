

// SVG PROJECTS page




// Scroll Animation for Projects Page


const projects = [
    {
        image: '../assets/BlahBlahBanner.png',
        title: '../assets/BlahHeader.svg',
        link: '../html/blahblah.html',
        orderValue: 0,
    },

    {
        image: '../assets/Necromancer.png',
        title: '../assets/NecromancerHeader.svg',
        link: '../html/necromancer.html',
        orderValue: 1,
    },
    {
        image: '../assets/RecordPlayer.png',
        title: '../assets/RecordplayerTitle-2.svg',
        link: '../html/recordplayer.html',
        orderValue: 2,
    },
     {
        image: '../assets/TDIMG.png',
        title: '../assets/TDtitle.svg',
        link: '../html/touchdesigner.html',
        orderValue: 3,
    },
      {
        image: '../assets/DSC25img.png',
        title: '../assets/DSCtitle.svg',
        link: '../html/dsc.html',
        orderValue: 4,
    },
         {
        image: '../assets/MeesterproefIMG.png',
        title: '../assets/MeesterproefTitle.svg',
        link: '../html/meesterproef.html',
        orderValue: 5,
    },

];

const ProjectLink = document.getElementById('ProjectItemLink');
const ProjectImage = document.getElementById('ProjectImage');
const ProjectTitle = document.querySelector('.ProjectTitleText img');
const ProjectItem = document.getElementById('ProjectItem')
const stars = document.querySelectorAll('.Projectstar svg path');

let currentOrderValue = 0;
const threshold = 10; // scroll distance before triggering a new project
let isThrottled = false; // prevents multiple triggers per gesture
let isLoaded = false;

document.addEventListener('DOMContentLoaded', () => {
    isLoaded = true; 
    updateProject(0, { instant: true }); // first project active on load
    ProjectItem.classList.remove('fade-out');
    ProjectTitle.classList.remove('fade-out');
    toggleIdleAnimations(true);
});

window.addEventListener('wheel', async (e) => {
    if (isThrottled || !isLoaded) return;

    if (e.deltaY > threshold && currentOrderValue < projects.length - 1) {
        currentOrderValue++;
        isLoaded = false; // stop idle while updating
        await updateProject(currentOrderValue);
        isLoaded = true; // restore idle after update
        toggleIdleAnimations(isLoaded);
    }
    else if (e.deltaY < -11 && currentOrderValue > 0) {
        currentOrderValue--;
        isLoaded = false;
        await updateProject(currentOrderValue);
        isLoaded = true;
        toggleIdleAnimations(isLoaded);
    }

    isThrottled = true;
    setTimeout(() => (isThrottled = false), 100); // adjustable delay
});

const toggleIdleAnimations = (state) => {
    [ProjectItem, ProjectImage].forEach(el => {
        el.classList.toggle('Idle', state);
    });
};

let isAnimating = false;
let pendingIndex = null;

async function waitForTransition(el, type = 'animationend', fallback = 1500) {
    return new Promise((resolve) => {
        let done = false;
        const handler = () => {
            if (done) return;
            done = true;
            el.removeEventListener(type, handler);
            resolve();
        };
        el.addEventListener(type, handler);
        setTimeout(() => {
            if (done) return;
            done = true;
            el.removeEventListener(type, handler);
            resolve();
        }, fallback);
    });
}



async function updateProject(index, options = {}) {
    const { instant = false } = options;

    if (!instant && isAnimating) { pendingIndex = index; return; }

    const project = projects[index];
    const applyProjectData = () => {
        ProjectImage.src = project.image;
        ProjectTitle.src = project.title;
        ProjectLink.href = project.link;
    };
    const updateStarStates = () => {
        stars.forEach((path, i) => {
            path.classList.toggle('active', i === project.orderValue);
        });
    };

    if (instant) {
        applyProjectData();
        updateStarStates();
        isLoaded = true;
        toggleIdleAnimations(true);
        return;
    }

    isAnimating = true;
    isLoaded = false;

    // Fade out both elements
    ProjectItem.classList.add('fade-out');
    ProjectTitle.classList.add('fade-out');

    setTimeout(applyProjectData, 300);
    updateStarStates();

    await Promise.all([
        waitForTransition(ProjectImage),
        waitForTransition(ProjectTitle)
    ]);

    // Remove old state, trigger fade-in keyframes
    ProjectItem.classList.remove('fade-out');
    ProjectTitle.classList.remove('fade-out');

    // Wait for fade-in animation to complete
    await Promise.all([
        waitForTransition(ProjectImage, 'animationend'),
        waitForTransition(ProjectTitle, 'animationend')
    ]);

    // Unlock and process queued request if any
    isAnimating = false;
    isLoaded = true;
    toggleIdleAnimations(true);

    if (pendingIndex !== null) {
        const next = pendingIndex;
        pendingIndex = null;
        updateProject(next);
    }
}

// Add click listeners to each star
stars.forEach((star, i) => {
  star.style.cursor = 'pointer'; // optional: show clickable cursor
  star.addEventListener('click', async () => {
    // Prevent spam clicks or redundant reloads
    if (isAnimating || i === currentOrderValue) return;

    // Update global index
    currentOrderValue = i;

    // Stop idle animation while transitioning
    isLoaded = false;
    toggleIdleAnimations(false);
    
    toggleIdleAnimations(true);
    // Trigger update for the selected project
    await updateProject(i);

    // Re-enable idle animations after transition
    isLoaded = true;

  });
});

const initSkeleton = () => {
    const container = document.getElementById('skeleton');
    if (!container) return;

    fetch('../assets/skellihead.svg')
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
    initSkeleton();
    initContactFooter();
});
