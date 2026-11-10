/* DARKCLAW — все настройки сайта здесь. Без сервера и сборщиков. */
const SITE_CONFIG = {
  // Впиши адрес, например: '123.123.123.123:27015' (НЕ добавляй слово connect)
  serverAddress: '',
  // Вставь свою полную пригласительную ссылку на Discord
  discordInvite: '',
  workshopCollection: 'https://steamcommunity.com/sharedfiles/filedetails/?id=3824762059',
};

// Демонстрационные идеи ивентов. Это НЕ объявленные мероприятия и не даты.
// Можно изменять названия, описания и даже добавлять новые карточки.
const EVENT_DATA = [
  {id:1,cat:'rp',name:'Ночь в Бэнгклоу',tag:'RP-СЦЕНАРИЙ',status:'Концепт',summary:'Ночной город, неожиданные встречи и история, исход которой зависит от участников.',details:'Сценарный RP-ивент в атмосфере ночного города. Участники взаимодействуют, расследуют происходящее и сами решают, как будет развиваться история. Официальная дата ещё не назначена.'},
  {id:2,cat:'community',name:'Знакомство с RPC',tag:'СООБЩЕСТВО',status:'Концепт',summary:'Спокойная встреча, знакомства и обсуждение идей для развития сообщества.',details:'Открытая встреча для знакомства игроков, обсуждения новых идей и совместных активностей. Формат, площадка и время пока не утверждены.'},
  {id:3,cat:'contest',name:'Битва импровизации',tag:'КОНКУРС',status:'Концепт',summary:'Придумывай необычные RP-сцены, удивляй других и проявляй фантазию.',details:'Творческий конкурс импровизированных сцен с добровольным участием. Правила и дата появятся только после отдельного анонса.'},
  {id:4,cat:'rp',name:'Город без сна',tag:'RP-СЦЕНАРИЙ',status:'Идея',summary:'Большая история для жителей сервера с несколькими возможными развязками.',details:'Концепция сюжетного вечера, в котором решения персонажей влияют на общую историю. Детали будут определены организаторами при подготовке.'},
  {id:5,cat:'community',name:'Вечер сообщества',tag:'СООБЩЕСТВО',status:'Идея',summary:'Общение, совместные игры и время без напряжённого соревновательного формата.',details:'Неформальная активность для участников DarkClaw и RPC. Возможные игры и точная дата ещё не определены.'},
  {id:6,cat:'contest',name:'Лучший RP-момент',tag:'КОНКУРС',status:'Идея',summary:'Делись самыми интересными сюжетами и сценами из жизни сервера.',details:'Идея конкурса запоминающихся историй и RP-моментов. Условия участия и способ подачи работ пока не установлены.'}
];

const iconArrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
let toastTimer;
function toast(message) {
  let el = document.getElementById('toast');
  if (!el) { el = document.createElement('div'); el.id='toast'; el.className='toast'; el.setAttribute('role','status'); el.setAttribute('aria-live','polite'); document.body.appendChild(el); }
  el.textContent = message; el.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(()=>el.classList.remove('show'),3800);
}
function safeUrl(value) { try { const u = new URL(value); return ['https:','http:'].includes(u.protocol) ? u.href : null; } catch { return null; } }
function discordAction(event) {
  event.preventDefault(); const url = safeUrl(SITE_CONFIG.discordInvite);
  if (url) window.open(url,'_blank','noopener,noreferrer');
  else toast('Ссылка на Discord пока не указана. Добавь discordInvite в script.js.');
}
function joinAction(event) {
  event.preventDefault(); const address=SITE_CONFIG.serverAddress.trim();
  if (!address) { toast('IP сервера ещё не указан. Добавь serverAddress в script.js.'); return; }
  window.location.href='steam://connect/'+address;
}
function copyText(value){
  if(!value){toast('Адрес сервера ещё не настроен.');return;}
  if(navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(value).then(()=>toast('Скопировано: '+value)).catch(()=>fallbackCopy(value));
  else fallbackCopy(value);
}
function fallbackCopy(value){const input=document.createElement('textarea');input.value=value;input.style.position='fixed';input.style.opacity='0';document.body.appendChild(input);input.select();try{document.execCommand('copy');toast('Скопировано: '+value)}catch{toast('Адрес: '+value)}input.remove()}
function updateAddress(){
  const address=SITE_CONFIG.serverAddress.trim();
  document.querySelectorAll('[data-server-address]').forEach(el=>el.textContent=address||'IP скоро появится');
  document.querySelectorAll('[data-connect-command]').forEach(el=>el.textContent=address?'connect '+address:'connect ВАШ_IP:27015');
  document.querySelectorAll('[data-copy-address]').forEach(el=>{el.disabled=!address;el.addEventListener('click',()=>copyText(address))});
  document.querySelectorAll('[data-copy-command]').forEach(el=>el.addEventListener('click',()=>copyText(address?'connect '+address:'')));
}
function buildEvents(){
  const grid=document.getElementById('events-grid');if(!grid)return;
  const labels={rp:'ROLEPLAY',community:'СООБЩЕСТВО',contest:'КОНКУРС'};
  const esc=(s)=>String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  function render(filter){
    const items=EVENT_DATA.filter(item=>filter==='all'||item.cat===filter);
    grid.innerHTML=items.map(item=>`<article class="event-card" data-category="${esc(item.cat==='community'?'community':item.cat==='contest'?'contest':'rp')}"><div class="event-art"><span class="art-label">${esc(labels[item.cat]||'СОБЫТИЕ')}</span><span class="art-number">${String(item.id).padStart(2,'0')}</span></div><div class="event-body"><div class="event-meta"><span class="event-status">✧ ${esc(item.status)}</span><span>• Дата не назначена</span></div><h3>${esc(item.name)}</h3><p>${esc(item.summary)}</p><button class="text-link" type="button" data-event-id="${item.id}" aria-label="Подробнее: ${esc(item.name)}">Подробнее ${iconArrow}</button></div></article>`).join('')||'<div class="empty-state">Здесь пока нет ивентов.</div>';
  }
  render('all');
  document.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{
    document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.remove('active');b.setAttribute('aria-pressed','false')});
    btn.classList.add('active');btn.setAttribute('aria-pressed','true');render(btn.dataset.filter);
  }));
  const dialog=document.getElementById('event-dialog');
  grid.addEventListener('click',event=>{
    const button=event.target.closest('[data-event-id]');if(!button||!dialog)return;
    const item=EVENT_DATA.find(x=>x.id===Number(button.dataset.eventId));if(!item)return;
    dialog.querySelector('[data-dialog-tag]').textContent=item.tag;
    dialog.querySelector('[data-dialog-title]').textContent=item.name;
    dialog.querySelector('[data-dialog-body]').textContent=item.details;
    dialog.showModal();
  });
  if(dialog){dialog.querySelector('[data-close-dialog]').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()})}
}
document.documentElement.classList.add('js-ready');
document.addEventListener('DOMContentLoaded',()=>{
  const menu=document.getElementById('site-nav');const toggle=document.getElementById('menu-toggle');
  if(toggle&&menu){toggle.addEventListener('click',()=>{const open=menu.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню')});menu.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{menu.classList.remove('open');toggle.setAttribute('aria-expanded','false')}))}
  document.querySelectorAll('[data-link="discord"]').forEach(el=>el.addEventListener('click',discordAction));
  document.querySelectorAll('[data-join-server]').forEach(el=>el.addEventListener('click',joinAction));
  document.querySelectorAll('[data-link="workshop"]').forEach(el=>{const url=safeUrl(SITE_CONFIG.workshopCollection);if(url){el.href=url;el.target='_blank';el.rel='noopener noreferrer'}else el.addEventListener('click',e=>{e.preventDefault();toast('Ссылка на Workshop пока не настроена.')})});
  updateAddress();buildEvents();
  const reveal=document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');io.unobserve(entry.target)}}),{threshold:.08});reveal.forEach(el=>io.observe(el))}
  else reveal.forEach(el=>el.classList.add('visible'));
  const top=document.getElementById('back-top');if(top){const check=()=>top.classList.toggle('show',window.scrollY>700);window.addEventListener('scroll',check,{passive:true});check();top.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}))}
});
document.addEventListener('DOMContentLoaded',()=>{const year=document.getElementById('year');if(year)year.textContent=new Date().getFullYear();});
