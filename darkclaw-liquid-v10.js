const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const body = document.body;
const boot = $('#boot');
const viewPanels = $$('[data-view-panel]');
const viewButtons = $$('[data-view-btn]');
const viewMap = {
  nexus:['ГЛАВНАЯ','01'], origin:['О СТАЕ','02'], chamber:['СКОРО','03'], forge:['RPC','04'],
  film:['ГАЛЕРЕЯ','05'], signal:['НОВОСТИ','06'], team:['КОМАНДА','07'], core:['ИВЕНТЫ','08'],
  creator:['СОЗДАТЕЛЬ','09'], portals:['ССЫЛКИ','10'], vault:['АРХИВ','11']
};
let currentView = body.dataset.view || 'nexus';

// ===== ARI VOICE ASSISTANT =====
// Озвучка ARI подключена. MP3 лежат в корне рядом с index.html.
const ARI_AUDIO_ENABLED = true;
const ARI_ASSISTANT = {
  nexus: {
    image: 'ari-hello.webp',
    audio: 'ari_nexus.mp3',
    text: 'Приветик~ Я ARI. Добро пожаловать в DARKCLAW. Ну что, куда пойдём сначала?'
  },
  origin: {
    image: 'ari-think.webp',
    audio: 'ari_origin.mp3',
    text: 'Здесь можно узнать, чем живёт DARKCLAW и что объединяет нашу стаю.'
  },
  chamber: {
    image: 'ari-sad.webp',
    audio: 'ari_chamber.mp3',
    text: 'Хмм… сюда пока нельзя. Этот раздел ещё готовится~'
  },
  forge: {
    image: 'ari-good.webp',
    audio: 'ari_forge.mp3',
    text: 'А вот здесь начинается творческая часть. Добро пожаловать в RPC~'
  },
  film: {
    image: 'ari-ok.webp',
    audio: 'ari_film.mp3',
    text: 'Ооо, галерея! Давай посмотрим, что красивого тут накопилось.'
  },
  signal: {
    image: 'ari-alert.webp',
    audio: 'ari_signal.mp3',
    text: 'Так-так… посмотрим, что нового произошло в DARKCLAW.'
  },
  team: {
    image: 'ari-serious.webp',
    audio: 'ari_team.mp3',
    text: 'А вот и наша команда. Именно эти люди стоят за DARKCLAW.'
  },
  core: {
    image: 'ari-laugh.webp',
    audio: 'ari_core.mp3',
    text: 'Здесь будут наши ивенты. Как только появится что-то новое — увидишь это здесь~'
  },
  creator: {
    image: 'ari-love.webp',
    audio: 'ari_creator.mp3',
    text: 'Хочешь узнать, кто всё это устроил? Тогда знакомься — ARI EM.'
  },
  portals: {
    image: 'ari-hello.webp',
    audio: 'ari_portals.mp3',
    text: 'Нужно куда-то перейти? Discord, YouTube и остальные ссылки ждут тебя здесь.'
  },
  vault: {
    image: 'ari-sleep.webp',
    audio: 'ari_vault.mp3',
    text: 'Тс-с… это архив DARKCLAW. Здесь хранится то, что уже стало частью нашей истории.'
  }
};
let ariHideTimer = 0;
let ariAudio = null;
let ariEnabled = false;
let ariConsentAnswered = false;
function showAriForView(id, force = false){
  if(!ariEnabled) return;
  const data = ARI_ASSISTANT[id] || ARI_ASSISTANT.nexus;
  const box = $('#ari-assistant');
  const portrait = $('#ari-portrait-btn');
  const sticker = $('#ari-sticker');
  const text = $('#ari-text');
  if(!box || !sticker || !text) return;
  text.textContent = data.text;
  portrait?.classList.add('is-changing');
  setTimeout(()=>{
    sticker.src = data.image;
    sticker.alt = `ARI — ${viewMap[id]?.[0] || 'DARKCLAW'}`;
    portrait?.classList.remove('is-changing');
  }, 120);
  if(body.classList.contains('is-booting') && !force) return;
  clearTimeout(ariHideTimer);
  box.classList.remove('is-speaking');
  requestAnimationFrame(()=>requestAnimationFrame(()=>box.classList.add('is-speaking')));
  ariHideTimer = setTimeout(()=>box.classList.remove('is-speaking'), Math.max(6500, Math.min(9800, data.text.length * 55)));

  if(ARI_AUDIO_ENABLED && data.audio){
    ariAudio ||= $('#ari-voice');
    if(ariAudio){
      ariAudio.pause();
      ariAudio.currentTime = 0;
      ariAudio.src = data.audio;
      ariAudio.play().catch(()=>{});
    }
  }
}


function showAriConsent(){
  if(ariConsentAnswered) return;
  const prompt = $('#ari-consent');
  if(!prompt) return;
  prompt.hidden = false;
  prompt.setAttribute('aria-hidden','false');
  requestAnimationFrame(()=>requestAnimationFrame(()=>prompt.classList.add('is-visible')));
}
function closeAriConsent(){
  const prompt = $('#ari-consent');
  if(!prompt) return;
  prompt.classList.add('is-closing');
  prompt.classList.remove('is-visible');
  setTimeout(()=>{
    prompt.hidden = true;
    prompt.setAttribute('aria-hidden','true');
    prompt.classList.remove('is-closing');
  }, 420);
}
function enableAriAssistant(){
  ariConsentAnswered = true;
  ariEnabled = true;
  const assistant = $('#ari-assistant');
  if(assistant) assistant.hidden = false;
  showAriForView(currentView, true);
  closeAriConsent();
}
function declineAriAssistant(){
  ariConsentAnswered = true;
  ariEnabled = false;
  const assistant = $('#ari-assistant');
  if(assistant) assistant.hidden = true;
  if(ariAudio){ ariAudio.pause(); ariAudio.currentTime = 0; }
  closeAriConsent();
}


function toast(title, text){
  const stack = $('#toast-stack'); if(!stack) return;
  const node = document.createElement('div'); node.className = 'toast';
  node.innerHTML = `<b>${title}</b><span>${text}</span>`;
  stack.appendChild(node);
  setTimeout(()=>{node.style.opacity='0'; node.style.transform='translateY(8px)';}, 3200);
  setTimeout(()=>node.remove(), 3600);
}

function updateLabels(id){
  const [label, num] = viewMap[id] || ['NEXUS','01'];
  $('#view-label').textContent = `${label} // ${num}`;
  $('#hud-view').textContent = label;
}

function setActiveView(id, push = true){
  if(!viewMap[id]) id = 'nexus';
  currentView = id;
  body.classList.add('switching');
  setTimeout(()=>{
    viewPanels.forEach(panel => {
      const active = panel.dataset.viewPanel === id;
      panel.hidden = !active;
      panel.classList.toggle('is-active', active);
    });
    viewButtons.forEach(btn => btn.classList.toggle('is-active', btn.dataset.viewBtn === id));
    body.dataset.view = id;
    updateLabels(id);
    showAriForView(id);
    if(push) history.replaceState(null, '', `#${id}`);
    body.classList.remove('switching');
    if(window.innerWidth <= 900) closeMenu();
  }, 140);
}

$$('[data-open-view]').forEach(btn => btn.addEventListener('click', ()=> setActiveView(btn.dataset.openView)));
viewButtons.forEach(btn => btn.addEventListener('click', ()=> setActiveView(btn.dataset.viewBtn)));
window.addEventListener('hashchange', ()=> setActiveView(location.hash.replace('#','') || 'nexus', false));

// boot sequence — MIDNIGHT FRAME / stable ~6s
(function initBoot(){
  const status = $('#boot-status');
  const step = $('#boot-step');
  const bar = $('#boot-progress-bar');
  const timeline = [
    [250,  '12%', 'ПРОБУЖДЕНИЕ СИМВОЛА'],
    [1450, '32%', 'СИНХРОНИЗАЦИЯ СТАИ'],
    [2750, '55%', 'ОТКРЫТИЕ MIDNIGHT FRAME'],
    [4050, '78%', 'ПОДКЛЮЧЕНИЕ DARKCLAW'],
    [5200, '100%','ВХОД В СТАЮ...']
  ];
  timeline.forEach(([ms, pct, text])=>setTimeout(()=>{
    if(bar) bar.style.width = pct;
    if(step) step.textContent = pct;
    if(status) status.textContent = text;
  }, ms));
  setTimeout(()=> body.classList.add('boot-open'), 5550);
  setTimeout(()=>{
    body.classList.remove('is-booting','boot-open');
    boot?.remove();
    setTimeout(showAriConsent, 300);
  }, 6450);
})();

// live clock & session
(function misc(){
  const session = 'DC-' + Math.random().toString(36).slice(2, 8).toUpperCase();
  $('#session-id').textContent = session;
  setInterval(()=>{
    const d = new Date();
    $('#live-clock').textContent = d.toLocaleTimeString('ru-RU', {hour12:false});
  }, 250);
})();

// mobile menu
const menuBtn = $('[data-toggle-menu]');
const menuScrim = $('[data-close-menu]');
function openMenu(){body.classList.add('menu-open'); menuScrim.hidden = false; menuBtn.classList.add('is-open');}
function closeMenu(){body.classList.remove('menu-open'); menuScrim.hidden = true; menuBtn.classList.remove('is-open');}
menuBtn?.addEventListener('click', ()=> body.classList.contains('menu-open') ? closeMenu() : openMenu());
menuScrim?.addEventListener('click', closeMenu);
window.addEventListener('resize', ()=> { if(window.innerWidth > 900) closeMenu(); });

// command palette
const palette = $('#palette');
const paletteInput = $('#palette-input');
const paletteResults = $('#palette-results');
const entries = Object.entries(viewMap).map(([id,[label,num]]) => ({id,label,num}));
function renderPalette(query = ''){
  const q = query.trim().toLowerCase();
  paletteResults.innerHTML = '';
  entries.filter(e => !q || e.label.toLowerCase().includes(q) || e.id.includes(q)).forEach(e => {
    const row = document.createElement('button');
    row.type = 'button'; row.className = 'palette-result';
    row.innerHTML = `<span>${e.num} / ${e.label}</span><b>OPEN</b>`;
    row.addEventListener('click', ()=>{ closePalette(); setActiveView(e.id);});
    paletteResults.appendChild(row);
  });
}
function openPalette(){palette.hidden = false; palette.setAttribute('aria-hidden','false'); renderPalette(); setTimeout(()=> paletteInput.focus(), 30);} 
function closePalette(){palette.hidden = true; palette.setAttribute('aria-hidden','true'); paletteInput.value='';}
$('[data-open-palette]')?.addEventListener('click', openPalette);
paletteInput?.addEventListener('input', e => renderPalette(e.target.value));
palette?.addEventListener('click', e => { if(e.target === palette) closePalette(); });

// terminal
const terminal = $('#terminal');
const terminalOut = $('#terminal-output');
const terminalInput = $('#terminal-input');
function printTerm(html, cls=''){ const p=document.createElement('p'); if(cls) p.className=cls; p.innerHTML=html; terminalOut.appendChild(p); terminalOut.scrollTop = terminalOut.scrollHeight; }
function openTerminal(){terminal.hidden = false; terminal.setAttribute('aria-hidden','false'); setTimeout(()=> terminalInput.focus(), 20);} 
function closeTerminal(){terminal.hidden = true; terminal.setAttribute('aria-hidden','true');}
$('[data-open-terminal]')?.addEventListener('click', openTerminal);
$('[data-close-terminal]')?.addEventListener('click', closeTerminal);
$('#terminal-form')?.addEventListener('submit', e => {
  e.preventDefault(); const v = terminalInput.value.trim().toLowerCase(); if(!v) return;
  printTerm(`<strong>ARI@DARKCLAW:~$</strong> ${v}`);
  const map = {
    help: 'Commands: <strong>help</strong>, <strong>status</strong>, <strong>team</strong>, <strong>rpc</strong>, <strong>events</strong>, <strong>creator</strong>, <strong>vault</strong>, <strong>discord</strong>, <strong>shadow</strong>, <strong>alert</strong>, <strong>clear</strong>.',
    status: 'CORE ONLINE // RPC ACTIVE // MEDIA INDEXED // EVENT TBA',
    team: ()=>setActiveView('team'),
    rpc: ()=>setActiveView('forge'),
    events: ()=>setActiveView('core'),
    creator: ()=>setActiveView('creator'),
    vault: ()=>setActiveView('vault'),
    discord: ()=>window.open('https://discord.gg/mGGN2RqEHw','_blank','noopener'),
    shadow: ()=>openShadow(),
    alert: ()=>triggerAlert(),
    clear: ()=> terminalOut.innerHTML = '<p class="ok">Терминал DARKCLAW готов. Введите <strong>help</strong>.</p>'
  };
  const act = map[v];
  if(typeof act === 'function'){ act(); if(v !== 'clear') printTerm('Команда выполнена.', 'ok'); }
  else if(typeof act === 'string') printTerm(act, 'ok');
  else printTerm('Неизвестная команда.', 'err');
  terminalInput.value = '';
});
terminal?.addEventListener('click', e => { if(e.target === terminal) closeTerminal(); });

// shadow node
const shadow = $('#shadow');
function openShadow(){shadow.hidden = false; shadow.setAttribute('aria-hidden','false');}
function closeShadow(){shadow.hidden = true; shadow.setAttribute('aria-hidden','true');}
$('[data-open-shadow]')?.addEventListener('click', openShadow);
$('[data-close-shadow]')?.addEventListener('click', closeShadow);
$('[data-shadow-relics]')?.addEventListener('click', ()=>{closeShadow(); setActiveView('vault');});
shadow?.addEventListener('click', e => { if(e.target === shadow) closeShadow(); });

// keyboard shortcuts
window.addEventListener('keydown', e => {
  if((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k'){ e.preventDefault(); openPalette(); }
  if(e.ctrlKey && e.key === '`'){ e.preventDefault(); openTerminal(); }
  if(e.key === 'Escape'){ closePalette(); closeTerminal(); closeShadow(); closeMenu(); closeLightbox(); }
});

// gallery lightbox
const galleryItems = $$('[data-gallery-index]');
const lightbox = $('#lightbox');
const lightImg = $('#lightbox-img');
const lightCaption = $('#lightbox-caption');
let currentGalleryIndex = 0;
function openLightbox(index){
  const item = galleryItems[index]; if(!item) return;
  currentGalleryIndex = index;
  const img = $('img', item); const strong = $('strong', item); const small = $('small', item);
  lightImg.src = img.src; lightImg.alt = img.alt; lightCaption.textContent = `${small?.textContent || ''} — ${strong?.textContent || img.alt}`;
  lightbox.hidden = false; lightbox.setAttribute('aria-hidden','false');
}
function closeLightbox(){ if(!lightbox) return; lightbox.hidden = true; lightbox.setAttribute('aria-hidden','true'); }
function shiftLightbox(dir){ const total = galleryItems.length; currentGalleryIndex = (currentGalleryIndex + dir + total) % total; openLightbox(currentGalleryIndex); }
galleryItems.forEach((item, i)=> item.addEventListener('click', ()=> openLightbox(i)));
$('[data-close-lightbox]')?.addEventListener('click', closeLightbox);
$('[data-light-prev]')?.addEventListener('click', ()=> shiftLightbox(-1));
$('[data-light-next]')?.addEventListener('click', ()=> shiftLightbox(1));
lightbox?.addEventListener('click', e => { if(e.target === lightbox) closeLightbox(); });

// media filter
$$('[data-media-filter]').forEach(btn => btn.addEventListener('click', ()=>{
  const kind = btn.dataset.mediaFilter;
  $$('[data-media-filter]').forEach(b => b.classList.toggle('is-active', b === btn));
  galleryItems.forEach(item => {
    const match = kind === 'all' || item.dataset.mediaKind === kind;
    item.style.display = match ? '' : 'none';
  });
}));

// countdown
(function eventCountdown(){
  const holder = $('#countdown'); if(!holder) return;
  const dateStr = holder.dataset.eventDate;
  if(!dateStr) return;
  function tick(){
    const diff = new Date(dateStr) - new Date();
    if(diff <= 0) return;
    const d = Math.floor(diff / 86400000);
    const h = Math.floor(diff % 86400000 / 3600000);
    const m = Math.floor(diff % 3600000 / 60000);
    $('#cd-days').textContent = String(d).padStart(2,'0');
    $('#cd-hours').textContent = String(h).padStart(2,'0');
    $('#cd-mins').textContent = String(m).padStart(2,'0');
  }
  tick(); setInterval(tick, 60000);
})();

// visit counter
(function visitCounter(){
  const key='darkclaw_visits'; const value = Number(localStorage.getItem(key) || '0') + 1; localStorage.setItem(key, String(value));
  $('#visit-counter-value').textContent = value.toLocaleString('ru-RU');
  $('#visit-counter').textContent = 'LOCAL COUNTER / THIS DEVICE';
})();

// disabled support and image protection
$$('[data-disabled-support]').forEach(btn => btn.addEventListener('click', ()=> toast('В РАЗРАБОТКЕ', 'Техподдержка пока недоступна.')));
document.addEventListener('contextmenu', e => {
  if(e.target.closest('img,.portrait-shell,.creator-photo,.film-frame')){ e.preventDefault(); toast('ИЗОБРАЖЕНИЕ ЗАЩИЩЕНО', 'Скачивание и копирование отключено.'); }
});
document.addEventListener('dragstart', e => { if(e.target.closest?.('img')) e.preventDefault(); });
document.addEventListener('selectstart', e => { if(e.target.closest?.('img,.portrait-shell,.creator-photo,.film-frame')) e.preventDefault(); });
document.addEventListener('copy', e => { if(window.getSelection()?.toString() === '' && e.target.closest?.('img,.portrait-shell,.creator-photo,.film-frame')) e.preventDefault(); });
document.addEventListener('keydown', e => {
  const key = e.key.toLowerCase();
  const typing = ['INPUT','TEXTAREA'].includes(document.activeElement?.tagName);
  if(!typing && (e.ctrlKey || e.metaKey) && ['s','c','u'].includes(key)) e.preventDefault();
});

// cursor
(function customCursor(){
  const dot = $('#cursor-dot'), glow = $('#cursor-glow');
  if(!window.matchMedia('(pointer:fine)').matches) return;
  body.classList.add('has-pointer');
  let x = innerWidth/2, y = innerHeight/2, gx = x, gy = y;
  window.addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; dot.style.left = x+'px'; dot.style.top = y+'px'; });
  function loop(){ gx += (x-gx)*0.15; gy += (y-gy)*0.15; glow.style.left = gx+'px'; glow.style.top = gy+'px'; requestAnimationFrame(loop);} loop();
})();

// magnetic hover
$$('.magnetic').forEach(el => {
  el.addEventListener('mousemove', e => {
    const r = el.getBoundingClientRect(); const x = e.clientX - r.left - r.width/2; const y = e.clientY - r.top - r.height/2;
    el.style.transform = `translate(${x*0.05}px, ${y*0.05}px)`;
  });
  el.addEventListener('mouseleave', ()=> el.style.transform = 'translate(0,0)');
});

function triggerAlert(){
  const alert = $('#red-alert');
  alert.classList.add('show');
  setTimeout(()=> alert.classList.remove('show'), 1600);
}

// initialize start view
setActiveView(location.hash.replace('#','') || currentView || 'nexus', false);

$('#ari-portrait-btn')?.addEventListener('click', ()=>showAriForView(currentView, true));
$$('[data-ari-consent]').forEach(btn=>btn.addEventListener('click',()=>{
  btn.dataset.ariConsent === 'yes' ? enableAriAssistant() : declineAriAssistant();
}));
