/* ============================================================
   Bank of Curiosity — Stripe Press Edition
   GSAP + ScrollTrigger
   ============================================================ */

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── Preloader ────────────────────────────────────────────── */
function initPreloader() {
  const pre = document.getElementById('preloader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      pre.classList.add('done');
      document.body.classList.remove('is-loading');
      initHero();
    }, 400);
  });
}

/* ── Nav ──────────────────────────────────────────────────── */
function initNav() {
  const nav    = document.getElementById('site-nav');
  const burger = document.getElementById('navBurger');
  const links  = document.getElementById('navLinks');

  ScrollTrigger.create({
    start: 'top -80',
    onUpdate: self => nav.classList.toggle('scrolled', self.progress > 0),
  });

  burger.addEventListener('click', () => {
    const open = burger.getAttribute('aria-expanded') === 'true';
    burger.setAttribute('aria-expanded', String(!open));
    links.classList.toggle('open', !open);
  });

  links.querySelectorAll('.nav-link').forEach(a => {
    a.addEventListener('click', () => {
      burger.setAttribute('aria-expanded', 'false');
      links.classList.remove('open');
    });
  });
}

/* ── Hero entrance ────────────────────────────────────────── */
function initHero() {
  if (prefersReducedMotion) {
    document.querySelectorAll('.hl').forEach(el => { el.style.transform = 'none'; });
    document.getElementById('heroEyebrow').style.opacity = '1';
    document.getElementById('heroFoot').style.opacity    = '1';
    return;
  }

  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

  tl.to('#heroEyebrow', { opacity: 1, duration: 0.6 })
    .to('.hl', {
      y: 0,
      duration: 1.1,
      stagger: 0.07,
      ease: 'expo.out',
    }, '-=0.3')
    .to('#heroFoot', { opacity: 1, duration: 0.7, ease: 'power2.out' }, '-=0.4');
}

/* ── Generic scroll reveal ────────────────────────────────── */
function initReveal() {
  if (prefersReducedMotion) {
    document.querySelectorAll('[data-reveal]').forEach(el => {
      el.classList.add('revealed');
    });
    return;
  }

  document.querySelectorAll('[data-reveal]').forEach(el => {
    const delay = parseFloat(el.dataset.revealDelay || 0);
    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      onEnter: () => {
        setTimeout(() => el.classList.add('revealed'), delay * 1000);
      },
    });
  });
}

/* ── Scroll animations ────────────────────────────────────── */
function initScrollAnimations() {
  if (prefersReducedMotion) return;

  /* Manifesto paragraphs */
  gsap.from('#manifestoP1', {
    scrollTrigger: { trigger: '#manifestoP1', start: 'top 85%' },
    y: 20, opacity: 0, duration: 0.9, ease: 'power2.out',
  });
  gsap.from('#manifestoP2', {
    scrollTrigger: { trigger: '#manifestoP2', start: 'top 85%' },
    y: 20, opacity: 0, duration: 0.9, ease: 'power2.out', delay: 0.1,
  });

  /* Deposit slip entrance */
  gsap.from('#depositSlip', {
    scrollTrigger: { trigger: '#depositSlip', start: 'top 80%' },
    y: 30, opacity: 0, duration: 1, ease: 'expo.out',
    onComplete: () => stampIn('#depositStamp'),
  });

  /* Metaphor pull quote */
  gsap.from('#metaphorPull', {
    scrollTrigger: { trigger: '#metaphorPull', start: 'top 85%' },
    y: 20, opacity: 0, duration: 0.9, ease: 'power2.out',
  });

  /* Metaphor rows stagger */
  gsap.from('[data-meta]', {
    scrollTrigger: { trigger: '#metaRows', start: 'top 82%' },
    y: 12, opacity: 0, duration: 0.6, stagger: 0.08, ease: 'power2.out',
  });

  /* Members heading lines */
  const mhLines = document.querySelectorAll('.mh-line');
  if (mhLines.length) {
    mhLines.forEach(line => {
      const inner = document.createElement('span');
      inner.style.cssText = 'display:block;transform:translateY(110%)';
      inner.textContent = line.textContent;
      line.textContent = '';
      line.appendChild(inner);
    });
    gsap.to('.mh-line > span', {
      scrollTrigger: { trigger: '#membersHeading', start: 'top 80%' },
      y: 0, duration: 1, stagger: 0.12, ease: 'expo.out',
    });
  }

  /* Section display headings (clip-path wipe) */
  document.querySelectorAll('.section-display').forEach(el => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 88%' },
      y: 18, opacity: 0, duration: 1, ease: 'expo.out',
    });
  });
}

/* ── Stamp helper ─────────────────────────────────────────── */
function stampIn(selector) {
  const el = document.querySelector(selector);
  if (!el) return;
  gsap.to(el, {
    opacity: 1,
    scale: 1,
    rotation: -6,
    duration: 0.55,
    ease: 'back.out(1.4)',
    delay: 0.3,
  });
}

/* ── Form ─────────────────────────────────────────────────── */
function initForm() {
  const form      = document.getElementById('oaForm');
  const submit    = document.getElementById('oaSubmit');
  const success   = document.getElementById('oaSuccess');
  const nameInput = document.getElementById('oa-name');
  const nameOut   = document.getElementById('successName');

  if (!form) return;

  /* Live name echo */
  nameInput.addEventListener('input', () => {
    const val = nameInput.value.trim();
    submit.textContent = val ? `Open ${val}'s Account` : 'Open My Account';
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    submit.textContent = 'Processing...';
    submit.disabled = true;

    const data = new FormData(form);

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        const name = data.get('name') || '';
        nameOut.textContent = name || '—';
        form.hidden = true;
        success.hidden = false;
        gsap.set(success, { opacity: 0, y: 20 });
        gsap.to(success, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' });
        stampIn('#successStamp');
      } else {
        submit.textContent = 'Something went wrong — try again';
        submit.disabled = false;
      }
    } catch {
      submit.textContent = 'Network error — try again';
      submit.disabled = false;
    }
  });
}

/* ── Init ─────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initNav();
  initReveal();
  initScrollAnimations();
  initForm();
});
