const dialog = document.querySelector('.image-dialog');
const dialogImage = dialog?.querySelector('img');
const dialogCaption = dialog?.querySelector('figcaption');
const interviewPlayer = document.querySelector('.interview-player');
const interviewPlay = document.querySelector('.interview-play');

interviewPlay?.addEventListener('click', () => {
  if (!interviewPlayer) return;
  interviewPlay.hidden = true;
  interviewPlayer.play().catch(() => {
    // Native controls remain available if the browser cannot start playback.
  });
});

document.querySelectorAll('[data-lightbox]').forEach((button) => {
  button.addEventListener('click', () => {
    if (!dialog || !dialogImage || !dialogCaption) return;
    dialogImage.src = button.dataset.lightbox;
    dialogImage.alt = button.dataset.caption || '项目图片';
    dialogCaption.textContent = button.dataset.caption || '';
    dialog.showModal();
  });
});

dialog?.querySelector('.dialog-close')?.addEventListener('click', () => dialog.close());
dialog?.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});
dialog?.addEventListener('close', () => {
  if (dialogImage) dialogImage.removeAttribute('src');
});

// Paper slips arrive with a short overshoot; keep everything visible when
// motion is reduced or IntersectionObserver is unavailable.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const revealItems = document.querySelectorAll(
  '.section-heading, .education-card, .awards-line, .skill-card, .interview-card, .project, .contact-inner'
);

if (!reducedMotion.matches && 'IntersectionObserver' in window) {
  revealItems.forEach((item, index) => {
    item.classList.add('reveal');
    item.style.setProperty('--reveal-delay', `${(index % 4) * 75}ms`);
  });

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -7% 0px' });

  revealItems.forEach((item) => revealObserver.observe(item));
  document.documentElement.classList.add('motion-ready');
}

const scene = document.querySelector('[data-scene]');
const hero = document.querySelector('.hero');
const projects = [...document.querySelectorAll('.project')];
const navLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];
const navSections = navLinks.map((link) => document.querySelector(link.getAttribute('href')));
let scrollFrame = 0;

function paintScrollScene() {
  scrollFrame = 0;
  const scrollRange = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const progress = Math.min(100, Math.max(0, (window.scrollY / scrollRange) * 100));
  document.documentElement.style.setProperty('--page-progress', `${progress}%`);

  if (!reducedMotion.matches && scene && hero) {
    const heroProgress = Math.min(1, Math.max(0, window.scrollY / hero.offsetHeight));
    scene.style.setProperty('--scene-y', `${Math.round(heroProgress * -38)}px`);
    scene.style.setProperty('--scene-back', `${Math.round(heroProgress * 30)}px`);
    scene.style.setProperty('--scene-rotate', `${-6 + heroProgress * 11}deg`);

    projects.forEach((project) => {
      const center = project.getBoundingClientRect().top + project.offsetHeight / 2;
      const shift = Math.max(-25, Math.min(25, (center - window.innerHeight / 2) * -0.045));
      project.style.setProperty('--project-shift', `${shift.toFixed(1)}px`);
    });
  }

  let currentSection = null;
  navSections.forEach((section, index) => {
    if (section && section.getBoundingClientRect().top <= 190) currentSection = index;
  });
  navLinks.forEach((link, index) => {
    const active = index === currentSection;
    link.classList.toggle('is-current', active);
    if (active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}

function queueScrollPaint() {
  if (!scrollFrame) scrollFrame = window.requestAnimationFrame(paintScrollScene);
}

window.addEventListener('scroll', queueScrollPaint, { passive: true });
window.addEventListener('resize', queueScrollPaint);
queueScrollPaint();
