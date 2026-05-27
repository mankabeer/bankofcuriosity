/* ============================================================
   Bank of Curiosity
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
    const ey = document.getElementById('heroEyebrow');
    const ft = document.getElementById('heroFoot');
    if (ey) ey.style.opacity = '1';
    if (ft) ft.style.opacity = '1';
    return;
  }

  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

  tl.to('#heroEyebrow', { opacity: 1, duration: 0.6 })
    .to('.hl', { y: 0, duration: 1.1, stagger: 0.07, ease: 'expo.out' }, '-=0.3')
    .to('.hero-clarify', { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, '-=0.5')
    .to('#heroFoot', { opacity: 1, duration: 0.7, ease: 'power2.out' }, '-=0.4');
}

/* ── Generic scroll reveal ────────────────────────────────── */
function initReveal() {
  if (prefersReducedMotion) {
    document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('revealed'));
    return;
  }

  document.querySelectorAll('[data-reveal]').forEach(el => {
    const delay = parseFloat(el.dataset.revealDelay || 0);
    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      onEnter: () => setTimeout(() => el.classList.add('revealed'), delay * 1000),
    });
  });
}

/* ── Scroll animations ────────────────────────────────────── */
function initScrollAnimations() {
  if (prefersReducedMotion) return;

  gsap.from('#manifestoP1', {
    scrollTrigger: { trigger: '#manifestoP1', start: 'top 85%' },
    y: 20, opacity: 0, duration: 0.9, ease: 'power2.out',
  });
  gsap.from('#manifestoP2', {
    scrollTrigger: { trigger: '#manifestoP2', start: 'top 85%' },
    y: 20, opacity: 0, duration: 0.9, ease: 'power2.out', delay: 0.1,
  });

  gsap.from('#depositSlip', {
    scrollTrigger: { trigger: '#depositSlip', start: 'top 80%' },
    y: 30, opacity: 0, duration: 1, ease: 'expo.out',
    onComplete: () => stampIn('#depositStamp'),
  });

  gsap.from('#metaphorPull', {
    scrollTrigger: { trigger: '#metaphorPull', start: 'top 85%' },
    y: 20, opacity: 0, duration: 0.9, ease: 'power2.out',
  });

  gsap.from('[data-meta]', {
    scrollTrigger: { trigger: '#metaRows', start: 'top 82%' },
    y: 12, opacity: 0, duration: 0.6, stagger: 0.08, ease: 'power2.out',
  });

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

  document.querySelectorAll('.section-display').forEach(el => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 88%' },
      y: 18, opacity: 0, duration: 1, ease: 'expo.out',
    });
  });

  /* Hero clarify starts hidden, revealed in initHero */
  const hc = document.querySelector('.hero-clarify');
  if (hc && !prefersReducedMotion) {
    gsap.set(hc, { opacity: 0, y: 12 });
  }
}

/* ── Stamp helper ─────────────────────────────────────────── */
function stampIn(selector) {
  const el = document.querySelector(selector);
  if (!el) return;
  gsap.to(el, { opacity: 1, scale: 1, rotation: -6, duration: 0.55, ease: 'back.out(1.4)', delay: 0.3 });
}

/* ── Utility ──────────────────────────────────────────────── */
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function formatDateShort(d) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function formatDateLong(d) {
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function generateAccountNumber() {
  const n = Math.floor(Math.random() * 90000) + 10000;
  return `BOC-${n}`;
}

/* ── Account Opening Overlay ──────────────────────────────── */
function initAccountOverlay() {
  const overlay        = document.getElementById('accountOverlay');
  if (!overlay) return;

  const phaseForm      = document.getElementById('aoPhaseForm');
  const phaseProcess   = document.getElementById('aoPhaseProcessing');
  const phaseSuccess   = document.getElementById('aoPhaseSuccess');
  const form           = document.getElementById('aoForm');
  const submitBtn      = document.getElementById('aoSubmit');
  const closeBtn       = document.getElementById('aoClose');
  const closeSuccessBtn= document.getElementById('aoCloseSuccess');
  const refNumEl       = document.getElementById('aoRefNum');
  const docDateEl      = document.getElementById('aoDocDate');

  function showPhase(active) {
    [phaseForm, phaseProcess, phaseSuccess].forEach(p => {
      if (p) p.hidden = (p !== active);
    });
  }

  function openOverlay() {
    const now = new Date();
    if (docDateEl) docDateEl.textContent = formatDateShort(now);
    if (refNumEl) {
      const ref = Math.floor(Math.random() * 9000) + 1000;
      refNumEl.textContent = `BOC-REF-${ref}`;
    }

    showPhase(phaseForm);
    if (form) { form.reset(); }
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Submit Application'; }

    overlay.hidden = false;
    document.body.style.overflow = 'hidden';

    if (!prefersReducedMotion) {
      gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.out' });
    }

    setTimeout(() => {
      const first = overlay.querySelector('input');
      if (first) first.focus();
    }, 350);
  }

  function closeOverlay() {
    if (!prefersReducedMotion) {
      gsap.to(overlay, { opacity: 0, duration: 0.25, ease: 'power2.in', onComplete: () => {
        overlay.hidden = true;
        document.body.style.overflow = '';
      }});
    } else {
      overlay.hidden = true;
      document.body.style.overflow = '';
    }
  }

  /* Triggers */
  document.querySelectorAll('.js-open-account').forEach(el => {
    el.addEventListener('click', e => { e.preventDefault(); openOverlay(); });
  });

  if (closeBtn)        closeBtn.addEventListener('click', closeOverlay);
  if (closeSuccessBtn) closeSuccessBtn.addEventListener('click', closeOverlay);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !overlay.hidden) closeOverlay();
  });

  /* Processing sequence */
  async function runProcessing(name, city) {
    showPhase(phaseProcess);

    const steps = [
      document.getElementById('aoStep1'),
      document.getElementById('aoStep2'),
      document.getElementById('aoStep3'),
      document.getElementById('aoStep4'),
    ].filter(Boolean);

    for (let i = 0; i < steps.length; i++) {
      await sleep(i === 0 ? 300 : 950);
      if (i > 0) {
        steps[i - 1].classList.remove('ao-step-visible');
        steps[i - 1].classList.add('ao-step-done');
      }
      steps[i].classList.add('ao-step-visible');
    }

    await sleep(900);
    const last = steps[steps.length - 1];
    if (last) { last.classList.remove('ao-step-visible'); last.classList.add('ao-step-done'); }

    await sleep(350);
    showSuccess(name, city);
  }

  function showSuccess(name, city) {
    showPhase(phaseSuccess);

    const now = new Date();
    const nameEl   = document.getElementById('aoSuccessName');
    const numEl    = document.getElementById('aoAccountNum');
    const branchEl = document.getElementById('aoSuccessBranch');
    const dateEl   = document.getElementById('aoSuccessDate');

    if (nameEl)   nameEl.textContent   = name || '—';
    if (numEl)    numEl.textContent    = generateAccountNumber();
    if (branchEl) branchEl.textContent = city || 'Pune';
    if (dateEl)   dateEl.textContent   = formatDateLong(now);

    if (!prefersReducedMotion) {
      gsap.fromTo(phaseSuccess, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' });
    }

    stampIn('#aoStamp');

    /* scroll overlay to top */
    overlay.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* Form submit */
  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();

      const nameVal = (form.querySelector('#ao-name')?.value || '').trim();
      const emailVal = (form.querySelector('#ao-email')?.value || '').trim();

      if (!nameVal) {
        form.querySelector('#ao-name')?.focus();
        return;
      }
      if (!emailVal) {
        form.querySelector('#ao-email')?.focus();
        return;
      }

      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Processing…'; }

      const cityVal = (form.querySelector('#ao-city')?.value || '').trim();
      const data = new FormData(form);

      /* Non-blocking submission to Formspree */
      fetch('https://formspree.io/f/YOUR_FORM_ID', {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      }).catch(() => {});

      runProcessing(nameVal, cityVal || 'Pune');
    });
  }
}

/* ── Init ─────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initNav();
  initReveal();
  initScrollAnimations();
  initAccountOverlay();
});
