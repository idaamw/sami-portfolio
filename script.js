/* ═══════════════════════════════════════════════════════════════
   THEATRE PORTFOLIO — script.js
   Handles: hero fade-in, header scroll state, slideshow,
            mobile nav, scroll-reveal animations, touch swipe.
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────
   CONFIG
───────────────────────────────────────────── */
const SLIDESHOW_INTERVAL = 5000; // ms between auto-advances
const SLIDESHOW_COUNT    = 10;   // number of slides

/* ─────────────────────────────────────────────
   1. HERO FADE-IN
   Adds .loaded to <body> after a short delay so
   the hero content animates in on first load.
───────────────────────────────────────────── */
window.addEventListener('load', () => {
  requestAnimationFrame(() => {
    document.body.classList.add('loaded');
  });
});

/* ─────────────────────────────────────────────
   2. HEADER — becomes opaque after scrolling
───────────────────────────────────────────── */
const header = document.querySelector('.site-header');

function updateHeader() {
  if (window.scrollY > 60) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}

window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader(); // run once on load in case page is already scrolled

/* ─────────────────────────────────────────────
   3. MOBILE NAV TOGGLE
───────────────────────────────────────────── */
const navToggle = document.querySelector('.nav-toggle');
const siteNav   = document.querySelector('.site-nav');

navToggle.addEventListener('click', () => {
  const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!isOpen));
  siteNav.classList.toggle('open', !isOpen);
  // Prevent body scroll while nav is open
  document.body.style.overflow = isOpen ? '' : 'hidden';
});

// Close nav when a link is clicked
siteNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navToggle.setAttribute('aria-expanded', 'false');
    siteNav.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ─────────────────────────────────────────────
   4. SLIDESHOW
───────────────────────────────────────────── */
 const slides        = Array.from(document.querySelectorAll('.slide'));
       const dotsContainer = document.querySelector('.slideshow-dots');
       const prevBtn       = document.querySelector('.slideshow-btn.prev');
       const nextBtn       = document.querySelector('.slideshow-btn.next');
       const progressBar   = document.querySelector('.slideshow-progress-bar');
   
       if (!slides.length || !dotsContainer || !progressBar) {
         // No slideshow on this page — skip all slideshow init.
         // (Jump to the end of section 4 in your editor.)
       } else {

let currentSlide   = 0;
let autoplayTimer  = null;
let isTransitioning = false;

/* --- Build dot indicators dynamically --- */
slides.forEach((_, i) => {
  const dot = document.createElement('button');
  dot.classList.add('dot');
  dot.setAttribute('role', 'tab');
  dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
  dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
  if (i === 0) dot.classList.add('active');
  dot.addEventListener('click', () => goToSlide(i));
  dotsContainer.appendChild(dot);
});

const dots = Array.from(dotsContainer.querySelectorAll('.dot'));

/* --- Core: go to a specific slide --- */
function goToSlide(index, direction = 'next') {
  if (isTransitioning || index === currentSlide) return;
  isTransitioning = true;

  // Deactivate current
  slides[currentSlide].classList.remove('active');
  slides[currentSlide].setAttribute('aria-hidden', 'true');
  dots[currentSlide].classList.remove('active');
  dots[currentSlide].setAttribute('aria-selected', 'false');

  // Activate next
  currentSlide = (index + slides.length) % slides.length;
  slides[currentSlide].classList.add('active');
  slides[currentSlide].setAttribute('aria-hidden', 'false');
  dots[currentSlide].classList.add('active');
  dots[currentSlide].setAttribute('aria-selected', 'true');

  // Reset and animate progress bar
  resetProgressBar();

  // Allow next transition after CSS transition finishes (900ms = --dur-slow)
  setTimeout(() => { isTransitioning = false; }, 900);
}

/* --- Advance forward / backward --- */
function nextSlide() {
  goToSlide(currentSlide + 1, 'next');
}

function prevSlide() {
  goToSlide(currentSlide - 1, 'prev');
}

/* --- Button listeners --- */
nextBtn.addEventListener('click', () => {
  nextSlide();
  resetAutoplay(); // restart timer on manual navigation
});

prevBtn.addEventListener('click', () => {
  prevSlide();
  resetAutoplay();
});

/* --- Progress bar animation --- */
function resetProgressBar() {
  // Kill animation by removing transition, snap to 0, then re-add transition
  progressBar.style.transition = 'none';
  progressBar.style.width = '0%';

  // Force reflow so the browser registers the reset
  progressBar.getBoundingClientRect();

  // Animate to 100% over the autoplay interval
  progressBar.style.transition = `width ${SLIDESHOW_INTERVAL}ms linear`;
  progressBar.style.width = '100%';
}

/* --- Autoplay --- */
function startAutoplay() {
  resetProgressBar();
  autoplayTimer = setInterval(nextSlide, SLIDESHOW_INTERVAL);
}

function stopAutoplay() {
  clearInterval(autoplayTimer);
  autoplayTimer = null;
  // Freeze the progress bar wherever it is
  const computed = getComputedStyle(progressBar).width;
  progressBar.style.transition = 'none';
  progressBar.style.width = computed;
}

function resetAutoplay() {
  stopAutoplay();
  startAutoplay();
}

// Pause on hover; resume on leave
const slideshowEl = document.querySelector('.slideshow');
slideshowEl.addEventListener('mouseenter', stopAutoplay);
slideshowEl.addEventListener('mouseleave', startAutoplay);

// Pause when tab is hidden (battery / bandwidth friendly)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopAutoplay();
  } else {
    resetAutoplay();
  }
});

/* --- Touch / swipe support --- */
let touchStartX = 0;
let touchStartY = 0;

slideshowEl.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

slideshowEl.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;

  // Only count as horizontal swipe if x movement is dominant
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
    if (dx < 0) {
      nextSlide();
    } else {
      prevSlide();
    }
    resetAutoplay();
  }
}, { passive: true });

/* --- Keyboard support (when slideshow is focused) --- */
slideshowEl.setAttribute('tabindex', '0');
slideshowEl.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') { nextSlide(); resetAutoplay(); }
  if (e.key === 'ArrowLeft')  { prevSlide(); resetAutoplay(); }
});

/* --- Kick it off --- */
startAutoplay();

       }

/* ─────────────────────────────────────────────
   5. SCROLL REVEAL
   Uses IntersectionObserver. Elements with class
   .reveal or .reveal-stagger animate in when they
   enter the viewport.
───────────────────────────────────────────── */

// Add .reveal to these sections / elements automatically
// (You can also add the class directly in HTML)
const revealTargets = [
  '.about-inner',
  '.section-title',
  '.pages-grid',
];

revealTargets.forEach(selector => {
  document.querySelectorAll(selector).forEach(el => {
    el.classList.add('reveal');
  });
});

// Stagger index for .pages-grid children
document.querySelectorAll('.pages-grid .page-card').forEach((card, i) => {
  card.style.setProperty('--i', i);
});
document.querySelectorAll('.pages-grid').forEach(grid => {
  grid.classList.add('reveal-stagger');
  grid.classList.remove('reveal'); // avoid double-classing
});

// The observer
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target); // fire once
      }
    });
  },
  {
    threshold: 0.12, // trigger when 12% of the element is visible
    rootMargin: '0px 0px -40px 0px', // slight offset from bottom edge
  }
);

document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => {
  revealObserver.observe(el);
});





/* ─────────────────────────────────────────────
   EARLY YEARS — extra reveal targets + plays grid stagger
───────────────────────────────────────────── */

// Stagger index for plays grid cards
document.querySelectorAll('.plays-grid .play-card').forEach((card, i) => {
  card.style.setProperty('--i', i);
});

// Make the plays grid itself a stagger container
document.querySelectorAll('.plays-grid').forEach(grid => {
  grid.classList.add('reveal-stagger');
});