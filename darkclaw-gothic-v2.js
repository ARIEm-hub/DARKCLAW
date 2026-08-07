(() => {
  const body = document.body;
  const loadingScreen = document.getElementById('loading-screen');
  const loadingTitle = document.getElementById('loading-title');
  const loadingStatus = document.getElementById('loading-status');
  const loadingPercent = document.getElementById('loading-percent');
  const loadingBar = document.getElementById('loading-bar');
  const loadingCursor = document.getElementById('loading-cursor');
  const loadingSteps = [...document.querySelectorAll('.loading-sequence span')];
  const loadingStartedAt = performance.now();
  const loadingDuration = 5600;
  const loadingStages = [
    [0, 'ПРОБУЖДАЕМ СТАЮ'],
    [22, 'СОБИРАЕМ ТЕНИ'],
    [46, 'НАСТРАИВАЕМ ПРОСТРАНСТВО'],
    [72, 'ОТКРЫВАЕМ ПОРТАЛ'],
    [94, 'ДОБРО ПОЖАЛОВАТЬ']
  ];

  function updateLoadingScreen() {
    if (!loadingScreen) return;
    const elapsed = performance.now() - loadingStartedAt;
    const linear = Math.min(1, elapsed / loadingDuration);
    const eased = 1 - Math.pow(1 - linear, 3);
    const progress = Math.min(100, Math.round(eased * 100));
    const stage = [...loadingStages].reverse().find(([threshold]) => progress >= threshold)?.[1] || loadingStages[0][1];

    if (loadingTitle) loadingTitle.textContent = stage;
    if (loadingStatus) loadingStatus.textContent = stage;
    if (loadingPercent) loadingPercent.textContent = `${String(progress).padStart(3, '0')}%`;
    if (loadingBar) loadingBar.style.width = `${progress}%`;
    if (loadingCursor) loadingCursor.style.left = `${progress}%`;
    loadingSteps.forEach((step, index) => step.classList.toggle('active', progress >= [8, 28, 52, 76][index]));

    if (linear < 1) requestAnimationFrame(updateLoadingScreen);
  }

  function hideLoadingScreen() {
    if (!loadingScreen || loadingScreen.classList.contains('is-closing')) return;
    const elapsed = performance.now() - loadingStartedAt;
    const waitMore = Math.max(0, loadingDuration - elapsed);
    window.setTimeout(() => {
      loadingScreen.classList.add('is-closing');
      delete body.dataset.appLoading;
      window.setTimeout(() => {
        loadingScreen.remove();
      }, 780);
    }, waitMore);
  }

  requestAnimationFrame(updateLoadingScreen);
  if (document.readyState === 'complete') hideLoadingScreen();
  else window.addEventListener('load', hideLoadingScreen, { once: true });



  const visitCounter = document.getElementById('visit-counter');
  const visitCounterValue = document.getElementById('visit-counter-value');
  const counterBase = 'https://api.counterapi.dev/v1/darkclaw-vrchat-2026/page-visits';
  const counterSessionKey = 'darkclaw-page-visit-counted-v1';

  function extractCounterValue(payload) {
    if (!payload || typeof payload !== 'object') return null;
    const raw = payload.value ?? payload.count;
    const numeric = Number(raw);
    if (Number.isFinite(numeric)) return numeric;
    const nested = payload.data ?? payload.result;
    return nested && typeof nested === 'object' ? extractCounterValue(nested) : null;
  }

  async function updateVisitCounter() {
    if (!visitCounter || !visitCounterValue) return;
    try {
      const localHost = ['localhost', '127.0.0.1', '0.0.0.0'].includes(location.hostname);
      const alreadyCounted = sessionStorage.getItem(counterSessionKey) === '1';
      const shouldIncrement = !localHost && !alreadyCounted;
      const response = await fetch(shouldIncrement ? `${counterBase}/up` : counterBase, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Counter API ${response.status}`);
      const payload = await response.json();
      const value = extractCounterValue(payload);
      if (value === null) throw new Error('Counter API returned no value');
      if (shouldIncrement) sessionStorage.setItem(counterSessionKey, '1');
      visitCounterValue.textContent = value.toLocaleString('ru-RU');
      visitCounter.dataset.status = 'ready';
    } catch (error) {
      console.warn('DARKCLAW visit counter unavailable:', error);
      visitCounterValue.textContent = '—';
      visitCounter.dataset.status = 'error';
    }
  }

  void updateVisitCounter();

  const menuButton = document.querySelector('.menu-toggle');
  const mobilePanel = document.querySelector('.mobile-panel');
  const mobileLinks = document.querySelectorAll('.mobile-panel a');

  function setMenu(open) {
    menuButton?.classList.toggle('is-open', open);
    mobilePanel?.classList.toggle('is-open', open);
    menuButton?.setAttribute('aria-expanded', String(open));
    menuButton?.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    mobilePanel?.setAttribute('aria-hidden', String(!open));
    if (open) body.dataset.menuOpen = 'true';
    else delete body.dataset.menuOpen;
  }

  menuButton?.addEventListener('click', () => {
    setMenu(!menuButton.classList.contains('is-open'));
  });

  mobileLinks.forEach((link) => link.addEventListener('click', () => setMenu(false)));
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1020) setMenu(false);
  });

  const hero = document.querySelector('.hero');
  hero?.addEventListener('pointermove', (event) => {
    const bounds = hero.getBoundingClientRect();
    hero.style.setProperty('--pointer-x', `${((event.clientX - bounds.left) / bounds.width) * 100}%`);
    hero.style.setProperty('--pointer-y', `${((event.clientY - bounds.top) / bounds.height) * 100}%`);
  });

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.dataset.visible = 'true';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => { item.dataset.visible = 'true'; });
  }

  const works = [
    { title: 'Avatar Lab', type: 'VRChat / Character', image: './avatar-lab.svg', description: 'Работа с образами, аватарами и визуальной идентичностью участников.' },
    { title: 'Night World', type: 'VRChat / World', image: './world-night.svg', description: 'Атмосферные пространства для встреч, отдыха и совместных событий.' },
    { title: 'Community Event', type: 'Events / Social', image: './event-stage.svg', description: 'Игровые вечера, небольшие ивенты и поводы собраться вместе.' },
    { title: 'Creator Studio', type: 'RPC / Production', image: './studio-grid.svg', description: 'Внутреннее творческое направление и производство контента для VRChat.' }
  ];

  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightbox-image');
  const lightboxType = document.getElementById('lightbox-type');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxDescription = document.getElementById('lightbox-description');
  const lightboxCount = document.getElementById('lightbox-count');
  let activeIndex = 0;

  function renderLightbox() {
    const work = works[activeIndex];
    lightboxImage.src = work.image;
    lightboxImage.alt = work.title;
    lightboxType.textContent = work.type;
    lightboxTitle.textContent = work.title;
    lightboxDescription.textContent = work.description;
    lightboxCount.textContent = `0${activeIndex + 1} / 0${works.length}`;
  }

  function openLightbox(index) {
    activeIndex = index;
    renderLightbox();
    lightbox.hidden = false;
    body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.hidden = true;
    body.style.overflow = '';
  }

  function moveLightbox(direction) {
    activeIndex = (activeIndex + direction + works.length) % works.length;
    renderLightbox();
  }

  document.querySelectorAll('[data-gallery-index]').forEach((button) => {
    button.addEventListener('click', () => openLightbox(Number(button.dataset.galleryIndex)));
  });
  document.querySelector('.lightbox-backdrop')?.addEventListener('click', closeLightbox);
  document.querySelector('.lightbox-close')?.addEventListener('click', closeLightbox);
  document.getElementById('lightbox-prev')?.addEventListener('click', () => moveLightbox(-1));
  document.getElementById('lightbox-next')?.addEventListener('click', () => moveLightbox(1));

  window.addEventListener('keydown', (event) => {
    if (!lightbox || lightbox.hidden) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') moveLightbox(-1);
    if (event.key === 'ArrowRight') moveLightbox(1);
  });
})();
