/* ============================================================
   BANK OF CURIOSITY — JS
   Lenis + GSAP + ScrollTrigger + Canvas + Cursor + Interactions
   ============================================================ */

gsap.registerPlugin(ScrollTrigger);

/* ── Globals ────────────────────────────────────────────────── */
const isMobile       = window.matchMedia('(max-width: 680px)').matches;
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── Lenis smooth scroll ────────────────────────────────────── */
let lenis;
function initLenis() {
  if (prefersReduced || typeof Lenis === 'undefined') return;

  lenis = new Lenis({
    duration: 1.3,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothTouch: false,
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(time => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Anchor links → Lenis scroll
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -68 });
    });
  });
}

/* ── Content doublers ───────────────────────────────────────── */
(function initTicker() {
  const track = document.getElementById('tickerTrack');
  if (!track) return;
  track.innerHTML += track.innerHTML;
})();

(function initRunline() {
  const track = document.getElementById('runlineTrack');
  if (!track) return;
  track.innerHTML += track.innerHTML;
})();

/* ── Canvas — animated ledger lines ────────────────────────── */
function initCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || isMobile) return;
  const ctx = canvas.getContext('2d');
  let W, H, lines = [], lastTime = 0;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    buildLines();
  }

  function buildLines() {
    const spacing = 26;
    const count   = Math.ceil(H / spacing) + 2;
    lines = Array.from({ length: count }, (_, i) => ({
      baseY:   i * spacing,
      phase:   Math.random() * Math.PI * 2,
      amp:     2 + Math.random() * 5,
      freq:    0.0025 + Math.random() * 0.003,
      speed:   0.00018 + Math.random() * 0.00014,
      opacity: 0.04 + Math.random() * 0.06,
    }));
  }

  let t = 0;
  function draw(now) {
    const delta = lastTime ? (now - lastTime) / 1000 : 0;
    lastTime = now;
    t += delta * 6000;

    ctx.clearRect(0, 0, W, H);
    lines.forEach(l => {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(240,232,213,${l.opacity})`;
      ctx.lineWidth   = 0.6;
      for (let x = 0; x <= W; x += 3) {
        const y = l.baseY + Math.sin(x * l.freq + t * l.speed + l.phase) * l.amp;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    });
    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize);
  if (!prefersReduced) requestAnimationFrame(draw);
}

/* ── Preloader ──────────────────────────────────────────────── */
function initPreloader() {
  const loader  = document.getElementById('preloader');
  const bar     = document.getElementById('preBar');
  const status  = document.getElementById('preStatus');
  if (!loader) return;

  initCanvas();

  const msgs = ['Opening account…', 'Verifying curiosity…', 'Account approved.'];

  const tl = gsap.timeline({
    onComplete: () => {
      gsap.to(loader, {
        opacity: 0, duration: 0.65, delay: 0.3, ease: 'power2.inOut',
        onComplete: () => {
          loader.style.display = 'none';
          document.body.classList.remove('is-loading');
          initHeroEntrance();
        }
      });
    }
  });

  tl.to(bar,   { width: '35%', duration: 0.45, ease: 'power2.out' })
    .call(() => { status.textContent = msgs[1]; })
    .to(bar,   { width: '72%', duration: 0.5,  ease: 'power2.out' })
    .call(() => { status.textContent = msgs[2]; })
    .to(bar,   { width: '100%', duration: 0.3, ease: 'power2.out' });
}

/* ── Hero entrance ──────────────────────────────────────────── */
function initHeroEntrance() {
  if (prefersReduced) return;
  const eyebrow = document.getElementById('heroEyebrow');
  const lines   = document.querySelectorAll('.hero-headline .hl');
  const foot    = document.getElementById('heroFoot');

  gsap.set(lines,  { y: '108%' });
  gsap.set([eyebrow, foot], { opacity: 0, y: 18 });

  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
  tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.7 })
    .to(lines,   { y: '0%', duration: 1.0, stagger: 0.08 }, '-=0.45')
    .to(foot,    { opacity: 1, y: 0, duration: 0.7 }, '-=0.55');
}

/* ── Custom cursor ──────────────────────────────────────────── */
function initCursor() {
  if (isMobile || !window.matchMedia('(hover:hover)').matches) return;
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    gsap.set(dot, { x: mx, y: my });
  });

  gsap.ticker.add(() => {
    rx += (mx - rx) * 0.1;
    ry += (my - ry) * 0.1;
    gsap.set(ring, { x: rx, y: ry });
  });

  document.querySelectorAll('a, button, [data-magnet], input, select').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  document.querySelectorAll('[data-section-theme="light"]').forEach(s => {
    ScrollTrigger.create({
      trigger: s,
      start: 'top 10%', end: 'bottom 10%',
      onEnter:     () => document.body.classList.add('cursor-light'),
      onLeave:     () => document.body.classList.remove('cursor-light'),
      onEnterBack: () => document.body.classList.add('cursor-light'),
      onLeaveBack: () => document.body.classList.remove('cursor-light'),
    });
  });
}

/* ── Magnetic buttons ───────────────────────────────────────── */
function initMagnets() {
  if (isMobile || prefersReduced) return;
  document.querySelectorAll('[data-magnet]').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r  = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width  / 2)) * 0.28;
      const dy = (e.clientY - (r.top  + r.height / 2)) * 0.28;
      gsap.to(el, { x: dx, y: dy, duration: 0.35, ease: 'power2.out' });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.55, ease: 'elastic.out(1, 0.4)' });
    });
  });
}

/* ── Deposit slip 3D tilt ───────────────────────────────────── */
function initTilt() {
  const slip = document.getElementById('depositSlip');
  if (!slip || isMobile || prefersReduced) return;

  slip.addEventListener('mousemove', e => {
    const r  = slip.getBoundingClientRect();
    const rx = ((e.clientY - (r.top  + r.height / 2)) / r.height) *  9;
    const ry = ((e.clientX - (r.left + r.width  / 2)) / r.width)  * -9;
    gsap.to(slip, {
      rotationX: rx, rotationY: ry,
      transformPerspective: 900,
      duration: 0.45, ease: 'power2.out',
    });
  });

  slip.addEventListener('mouseleave', () => {
    gsap.to(slip, {
      rotationX: 0, rotationY: 0,
      transformPerspective: 900,
      duration: 1.0, ease: 'elastic.out(1, 0.35)',
    });
  });
}

/* ── Nav ────────────────────────────────────────────────────── */
function initNav() {
  const nav    = document.getElementById('site-nav');
  const burger = document.getElementById('navBurger');
  const links  = document.getElementById('navLinks');

  ScrollTrigger.create({
    start: '80px top',
    onEnter:     () => nav.classList.add('scrolled'),
    onLeaveBack: () => nav.classList.remove('scrolled'),
  });

  burger?.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
    if (lenis) open ? lenis.stop() : lenis.start();
  });

  links?.querySelectorAll('.nav-link').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      burger?.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      if (lenis) lenis.start();
    });
  });
}

/* ── Generic [data-reveal] handler ─────────────────────────── */
function initReveal() {
  if (prefersReduced) {
    gsap.set('[data-reveal]', { opacity: 1, x: 0, y: 0 });
    return;
  }
  document.querySelectorAll('[data-reveal]').forEach(el => {
    const dir   = el.dataset.reveal;
    const delay = parseFloat(el.dataset.revealDelay || 0);
    const fromX = dir === 'left' ? -20 : dir === 'right' ? 20 : 0;
    const fromY = (!dir || dir === '') ? 24 : 0;

    gsap.to(el, {
      opacity: 1, x: 0, y: 0,
      duration: 0.7, ease: 'power3.out', delay,
      scrollTrigger: { trigger: el, start: 'top 84%', once: true }
    });
  });
}

/* ── Scroll animations ──────────────────────────────────────── */
function initScrollAnimations() {
  if (prefersReduced) return;

  // ── Scroll progress bar ──
  const progressBar = document.querySelector('.scroll-progress');
  if (progressBar) {
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: self => { progressBar.style.width = (self.progress * 100) + '%'; }
    });
  }

  // ── Section heading wipe-reveals ──
  ['.hiw-heading', '.branches-heading', '.oa-heading', '.art-top h2', '.ledger-top h2'].forEach(sel => {
    const el = document.querySelector(sel);
    if (!el) return;
    gsap.set(el, { clipPath: 'inset(0 100% 0 0)' });
    gsap.to(el, {
      clipPath: 'inset(0 0% 0 0)',
      duration: 1.1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 82%', once: true }
    });
  });

  // ── Manifesto text reveal ──
  ['manifestoP1', 'manifestoP2'].forEach((id, i) => {
    const el = document.getElementById(id);
    if (!el) return;
    gsap.to(el, {
      clipPath: 'inset(0 0% 0 0)',
      duration: 1.2, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: `top ${78 + i * 4}%` }
    });
  });

  // ── Manifesto watermark parallax ──
  const watermark = document.querySelector('.manifesto-watermark');
  if (watermark) {
    gsap.to(watermark, {
      yPercent: -18,
      ease: 'none',
      scrollTrigger: {
        trigger: '.manifesto',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      }
    });
  }

  // ── Deposit slip ──
  const slip    = document.getElementById('depositSlip');
  const stampEl = document.getElementById('depositStamp');
  if (slip) {
    gsap.set(slip, { opacity: 0, y: 60, rotation: 0.5 });
    gsap.to(slip, {
      opacity: 1, y: 0, rotation: 0, duration: 1.0, ease: 'power4.out',
      scrollTrigger: { trigger: slip, start: 'top 78%', once: true }
    });
    if (stampEl) {
      gsap.set(stampEl, { opacity: 0, scale: 1.4, rotation: -15 });
      ScrollTrigger.create({
        trigger: slip, start: 'top 70%', once: true,
        onEnter: () => gsap.to(stampEl, {
          opacity: 0.72, scale: 1, rotation: -12,
          duration: 0.5, ease: 'back.out(2)', delay: 0.7
        })
      });
    }
  }

  // ── Metaphor blockquote ──
  const pull = document.getElementById('metaphorPull');
  if (pull) {
    gsap.from(pull, {
      opacity: 0, y: 30, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: pull, start: 'top 78%' }
    });
  }

  // ── Metaphor transforms — GSAP timeline ──
  const metaRows = document.querySelectorAll('[data-meta]');
  if (metaRows.length) {
    ScrollTrigger.create({
      trigger: metaRows[0].closest('.meta-rows') || metaRows[0],
      start: 'top 82%', once: true,
      onEnter: () => {
        const tl = gsap.timeline();
        metaRows.forEach((row, i) => {
          tl.add(() => {
            row.querySelector('.meta-before')?.classList.add('struck');
            row.classList.add('active');
          }, i * 0.09);
        });
      }
    });
  }

  // ── Members heading lines ──
  const mhLines = document.querySelectorAll('.mh-line');
  if (mhLines.length) {
    gsap.set(mhLines, { y: '110%' });
    gsap.to(mhLines, {
      y: '0%', duration: 0.9, stagger: 0.1, ease: 'power4.out',
      scrollTrigger: { trigger: '#membersHeading', start: 'top 80%' }
    });
  }
}

/* ── Form — submit + live name ──────────────────────────────── */
function initForm() {
  const form      = document.getElementById('oaForm');
  const success   = document.getElementById('oaSuccess');
  const stamp     = document.getElementById('successStamp');
  const nameEl    = document.getElementById('successName');
  const nameInput = document.getElementById('oa-name');
  const submitBtn = form?.querySelector('.oa-submit');
  if (!form) return;

  // Live name → button copy
  const defaultBtn = 'Open My Account';
  nameInput?.addEventListener('input', () => {
    const first = nameInput.value.trim().split(/\s+/)[0];
    if (submitBtn) submitBtn.textContent = first ? `Open ${first}'s Account` : defaultBtn;
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const nameVal = (nameInput?.value || '').trim();
    if (nameEl) nameEl.textContent = nameVal || '—';

    // Submit to Formspree if action is configured
    const endpoint = form.action;
    if (endpoint && !endpoint.includes('YOUR_FORM_ID')) {
      try {
        await fetch(endpoint, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });
      } catch (_) { /* show success state regardless */ }
    }

    const passCard = success.querySelector('.passbook-card');
    gsap.set(passCard, { opacity: 0, y: 20 });
    gsap.set('.success-msg', { opacity: 0, y: 12 });
    if (stamp) gsap.set(stamp, { scale: 2.8, rotation: -28, opacity: 0 });

    form.style.display = 'none';
    success.hidden = false;

    gsap.to(passCard,      { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.1 });
    if (stamp) {
      gsap.to(stamp, {
        scale: 1, rotation: -12, opacity: 1, duration: 0.55, ease: 'back.out(2.2)', delay: 0.45,
        onComplete: () => gsap.to(stamp, { opacity: 0.88, duration: 0.4 })
      });
    }
    gsap.to('.success-msg', { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: 0.6 });
  });
}

/* ── Scroll hint fade ───────────────────────────────────────── */
function initScrollHint() {
  ScrollTrigger.create({
    start: '200px top',
    onEnter:     () => gsap.to('.hero-scroll-hint', { opacity: 0, duration: 0.4 }),
    onLeaveBack: () => gsap.to('.hero-scroll-hint', { opacity: 1, duration: 0.4 }),
  });
}

/* ── Boot ───────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initLenis();
  initPreloader();
  initCursor();
  initMagnets();
  initTilt();
  initNav();
  initReveal();
  initScrollAnimations();
  initForm();
  initScrollHint();
});
