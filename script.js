// Nav hamburger
const hamburger = document.querySelector('.nav-hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger?.addEventListener('click', () => {
  navLinks.classList.toggle('nav-open');
});

navLinks?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('nav-open'));
});

// Account form
const form = document.getElementById('accountForm');
const success = document.getElementById('formSuccess');

form?.addEventListener('submit', e => {
  e.preventDefault();
  form.hidden = true;
  success.hidden = false;
});

// Subtle scroll fade for hero ledger
const ledgerRows = document.querySelectorAll('.ledger-row');
if (ledgerRows.length && 'IntersectionObserver' in window) {
  const obs = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  ledgerRows.forEach((row, i) => {
    row.style.opacity = '0';
    row.style.transform = 'translateY(8px)';
    row.style.transition = `opacity 0.5s ease ${i * 0.12}s, transform 0.5s ease ${i * 0.12}s`;
    obs.observe(row);
  });
}

// Scroll-reveal for cards and sections
const revealEls = document.querySelectorAll(
  '.product-card, .artefact-card, .topic-item, .metaphor-item, .deposit-slip'
);

if ('IntersectionObserver' in window) {
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition = `opacity 0.45s ease ${(i % 6) * 0.07}s, transform 0.45s ease ${(i % 6) * 0.07}s`;
    revealObs.observe(el);
  });
}
