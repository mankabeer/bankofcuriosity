/* ============================================================
   BANK OF CURIOSITY — JS
   GSAP + ScrollTrigger + Canvas + Cursor + Interactions
   ============================================================ */

gsap.registerPlugin(ScrollTrigger);

/* ── Globals ────────────────────────────────────────────────── */
const isMobile      = window.matchMedia('(max-width: 680px)').matches;
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── Ticker duplication (double content for seamless -50% loop) */
(function initTicker() {
  const track = document.getElementById('tickerTrack');
  if (!track) return;
  track.innerHTML += track.innerHTML;
})();

/* ── Canvas — animated ledger lines ────────────────────────── */
function initCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || isMobile) return;
  const ctx = canvas.getContext('2d');
  let W, H, lines = [], raf, lastTime = 0;

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
    const deltaTime = lastTime ? (now - lastTime) / 1000 : 0;
    lastTime = now;
    t += deltaTime * 6000;

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
    raf = requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize);
  if (!prefersReduced) raf = requestAnimationFrame(draw);
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

  gsap.set(lines, { y: '108%' });
  gsap.set([eyebrow, foot], { opacity: 0, y: 18 });

  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
  tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.7 })
    .to(lines,   { y: '0%', duration: 1.0, stagger: 0.08 }, '-=0.45')
    .to(foot,    { opacity: 1, y: 0, duration: 0.7 },       '-=0.55');
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
      start: 'top 10%',
      end: 'bottom 10%',
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
      const cx = r.left + r.width  / 2;
      const cy = r.top  + r.height / 2;
      const dx = (e.clientX - cx) * 0.28;
      const dy = (e.clientY - cy) * 0.28;
      gsap.to(el, { x: dx, y: dy, duration: 0.35, ease: 'power2.out' });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.55, ease: 'elastic.out(1, 0.4)' });
    });
  });
}

/* ── Nav: scroll state + burger ─────────────────────────────── */
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
  });

  links?.querySelectorAll('.nav-link').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      burger?.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
}

/* ── Generic [data-reveal] scroll handler ───────────────────── */
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
      duration: 0.7,
      ease: 'power3.out',
      delay,
      scrollTrigger: { trigger: el, start: 'top 84%', once: true }
    });
  });
}

/* ── Scroll animations ──────────────────────────────────────── */
function initScrollAnimations() {
  if (prefersReduced) return;

  // ── Manifesto text reveal ──
  const mP1 = document.getElementById('manifestoP1');
  const mP2 = document.getElementById('manifestoP2');
  if (mP1) {
    gsap.to(mP1, {
      clipPath: 'inset(0 0% 0 0)',
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: { trigger: mP1, start: 'top 78%' }
    });
  }
  if (mP2) {
    gsap.to(mP2, {
      clipPath: 'inset(0 0% 0 0)',
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: { trigger: mP2, start: 'top 82%' }
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

  // ── Metaphor transforms — GSAP timeline, no setTimeout ──
  const metaRows = document.querySelectorAll('[data-meta]');
  if (metaRows.length) {
    ScrollTrigger.create({
      trigger: metaRows[0].closest('.meta-rows') || metaRows[0],
      start: 'top 82%',
      once: true,
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

/* ── Form submission + passbook state ───────────────────────── */
function initForm() {
  const form    = document.getElementById('oaForm');
  const success = document.getElementById('oaSuccess');
  const stamp   = document.getElementById('successStamp');
  const nameEl  = document.getElementById('successName');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    const nameVal = (document.getElementById('oa-name')?.value || '').trim();
    if (nameEl) nameEl.textContent = nameVal || '—';

    // Set initial states before revealing so there's no flash
    const passCard = success.querySelector('.passbook-card');
    gsap.set(passCard, { opacity: 0, y: 20 });
    gsap.set('.success-msg', { opacity: 0, y: 16 });
    if (stamp) gsap.set(stamp, { scale: 2.8, rotation: -28, opacity: 0 });

    form.style.display = 'none';
    success.hidden = false;

    gsap.to(passCard, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.1 });
    if (stamp) {
      gsap.to(stamp, {
        scale: 1, rotation: -12, opacity: 1, duration: 0.55, ease: 'back.out(2.2)', delay: 0.4,
        onComplete: () => gsap.to(stamp, { opacity: 0.88, duration: 0.4 })
      });
    }
    gsap.to('.success-msg', { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: 0.55 });
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
  initPreloader();
  initCursor();
  initMagnets();
  initNav();
  initReveal();
  initScrollAnimations();
  initForm();
  initScrollHint();
});
