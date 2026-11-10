const menuToggle = document.getElementById('menu-toggle');
const siteNav = document.getElementById('site-nav');
if (menuToggle && siteNav) {
  menuToggle.addEventListener('click', () => {
    const open = siteNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
  });
}

document.querySelectorAll('.reveal').forEach(el => {
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, {threshold: 0.1});
  io.observe(el);
});

const backTop = document.getElementById('back-top');
if (backTop) {
  const toggleTop = () => backTop.classList.toggle('show', window.scrollY > 400);
  window.addEventListener('scroll', toggleTop, {passive: true});
  toggleTop();
  backTop.addEventListener('click', () => window.scrollTo({top: 0, behavior: 'smooth'}));
}

document.getElementById('year')?.replaceChildren(document.createTextNode(new Date().getFullYear()));

const toast = document.getElementById('toast');
function showToast(text) {
  if (!toast) return;
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('show'), 2200);
}

document.querySelectorAll('[data-copy-link]').forEach(btn => {
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(btn.getAttribute('data-copy-link'));
      showToast('Ссылка скопирована');
    } catch {
      showToast('Не удалось скопировать ссылку');
    }
  });
});
