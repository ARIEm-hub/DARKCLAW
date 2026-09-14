const $=(s,r=document)=>r.querySelector(s);const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const body=document.body;
const scenes=$$('[data-view-panel]');
const desktopBtns=$$('[data-view-btn]');
const mobileBtns=$$('[data-mobile-view]');
const viewNames={home:'ГЛАВНАЯ',story:'ИСТОРИЯ',rpc:'RPC',media:'MEDIA',cast:'КОМАНДА',events:'ИВЕНТЫ',creator:'СОЗДАТЕЛЬ',news:'НОВОСТИ',links:'ССЫЛКИ',archive:'АРХИВ'};
let currentView=location.hash.slice(1) in viewNames?location.hash.slice(1):'home';
let transitionTimer=0;

// ARI audio mapping reuses the complete v12 voice pack.
const ariMap={
 home:{img:'ari-hello.webp',audio:'ari_nexus.mp3',text:'Приветик~ Я ARI. Добро пожаловать в DARKCLAW. Ну что, куда пойдём сначала?'},
 story:{img:'ari-think.webp',audio:'ari_origin.mp3',text:'Здесь можно узнать, чем живёт DARKCLAW и что объединяет нашу стаю.'},
 rpc:{img:'ari-good.webp',audio:'ari_forge.mp3',text:'А вот здесь начинается творческая часть. Добро пожаловать в RPC~'},
 media:{img:'ari-ok.webp',audio:'ari_film.mp3',text:'Ооо, галерея! Давай посмотрим, что красивого тут накопилось.'},
 cast:{img:'ari-serious.webp',audio:'ari_team.mp3',text:'А вот и наша команда. Именно эти люди стоят за DARKCLAW.'},
 events:{img:'ari-laugh.webp',audio:'ari_core.mp3',text:'Здесь будут наши ивенты. Как только появится что-то новое — увидишь это здесь~'},
 creator:{img:'ari-love.webp',audio:'ari_creator.mp3',text:'Хочешь узнать, кто всё это устроил? Тогда знакомься — ARI EM.'},
 news:{img:'ari-alert.webp',audio:'ari_signal.mp3',text:'Так-так… посмотрим, что нового произошло в DARKCLAW.'},
 links:{img:'ari-hello.webp',audio:'ari_portals.mp3',text:'Нужно куда-то перейти? Discord, YouTube и остальные ссылки ждут тебя здесь.'},
 archive:{img:'ari-sleep.webp',audio:'ari_vault.mp3',text:'Тс-с… это архив DARKCLAW. Здесь хранится то, что уже стало частью нашей истории.'}
};
let ariEnabled=sessionStorage.getItem('dc_ari')==='on';
let ariDismissed=sessionStorage.getItem('dc_ari')==='off';
const voice=$('#ari-voice');

function stopVoice(){if(!voice)return;voice.pause();try{voice.currentTime=0}catch{}}
function playAri(id,force=false){
 if(!ariEnabled&&!force)return;
 const d=ariMap[id]||ariMap.home;
 $('#ari-image').src=d.img;$('#ari-text').textContent=d.text;
 $('#ari-assistant').hidden=false;
 stopVoice();voice.src=d.audio;voice.play().catch(()=>{});
}
function enableAri(){ariEnabled=true;ariDismissed=false;sessionStorage.setItem('dc_ari','on');$('#ari-offer').hidden=true;$('#ari-assistant').hidden=false;playAri(currentView,true)}
function dismissAri(){ariEnabled=false;ariDismissed=true;sessionStorage.setItem('dc_ari','off');$('#ari-offer').hidden=true;$('#ari-assistant').hidden=true;stopVoice()}
$('[data-ari-enable]')?.addEventListener('click',enableAri);
$('[data-ari-dismiss]')?.addEventListener('click',dismissAri);
$('#ari-close')?.addEventListener('click',()=>{$('#ari-assistant').hidden=true;stopVoice()});
$('#ari-avatar')?.addEventListener('click',()=>playAri(currentView,true));

function syncNav(id){desktopBtns.forEach(b=>b.classList.toggle('active',b.dataset.viewBtn===id));mobileBtns.forEach(b=>b.classList.toggle('active',b.dataset.mobileView===id));}
function openView(id,push=true){
 if(!(id in viewNames))id='home';
 clearTimeout(transitionTimer);
 const active=$('.scene.is-active');
 currentView=id;
 body.dataset.view=id;
 if(active&&active.dataset.viewPanel===id){syncNav(id);closeMenu();return;}
 body.classList.add('scene-switching');
 transitionTimer=setTimeout(()=>{
  scenes.forEach(s=>{const yes=s.dataset.viewPanel===id;s.hidden=!yes;s.classList.toggle('is-active',yes);if(yes){const sc=$('.scene-inner',s);if(sc)sc.scrollTop=0;}});
  syncNav(id);
  if(push)history.replaceState(null,'',`#${id}`);
  body.classList.remove('scene-switching');
  closeMenu();
  if(ariEnabled)playAri(id);
 },260);
}
$$('[data-open-view]').forEach(b=>b.addEventListener('click',()=>openView(b.dataset.openView)));
desktopBtns.forEach(b=>b.addEventListener('click',()=>openView(b.dataset.viewBtn)));
mobileBtns.forEach(b=>b.addEventListener('click',()=>openView(b.dataset.mobileView)));
$$('[data-menu-view]').forEach(b=>b.addEventListener('click',()=>openView(b.dataset.menuView)));
window.addEventListener('hashchange',()=>openView(location.hash.slice(1)||'home',false));

const menu=$('#menu-overlay');
function openMenu(){menu.hidden=false;menu.setAttribute('aria-hidden','false');document.body.classList.add('menu-open')}
function closeMenu(){menu.hidden=true;menu.setAttribute('aria-hidden','true');document.body.classList.remove('menu-open')}
$$('[data-open-menu]').forEach(b=>b.addEventListener('click',openMenu));
$('[data-close-menu]')?.addEventListener('click',closeMenu);
menu?.addEventListener('click',e=>{if(e.target===menu)closeMenu()});

// Cinematic boot. 5.6s total, CSS-only visuals + light JS status updates.
(function bootCinema(){
 const boot=$('#boot'),count=$('#boot-count'),status=$('#boot-status'),percent=$('#boot-percent');
 const beats=[
  [250,'03','PROJECTOR // START','08%'],
  [1050,'02','FILM // LOADED','24%'],
  [1900,'01','DARKCLAW // PRESENTS','41%'],
  [2800,'','A DARKCLAW PRODUCTION','62%'],
  [3700,'','OPENING FRAME','81%'],
  [4550,'','NOW SCREENING','100%']
 ];
 beats.forEach(([ms,c,s,p])=>setTimeout(()=>{if(count)count.textContent=c;if(status)status.textContent=s;if(percent)percent.textContent=p},ms));
 setTimeout(()=>boot?.classList.add('is-ending'),4900);
 setTimeout(()=>{
   body.classList.remove('is-booting');boot?.remove();openView(currentView,false);
   if(ariEnabled){$('#ari-assistant').hidden=false;setTimeout(()=>playAri(currentView,true),350)}
   else if(!ariDismissed){const o=$('#ari-offer');o.hidden=false;}
 },5850);
})();

// Gallery lightbox
const lightbox=$('#lightbox'),lightImg=$('#lightbox-image'),lightCaption=$('#lightbox-caption');
$$('[data-gallery]').forEach(b=>b.addEventListener('click',()=>{lightImg.src=b.dataset.gallery;lightImg.alt=b.dataset.caption||'';lightCaption.textContent=b.dataset.caption||'';lightbox.hidden=false;lightbox.setAttribute('aria-hidden','false')}));
function closeLightbox(){lightbox.hidden=true;lightbox.setAttribute('aria-hidden','true');lightImg.removeAttribute('src')}
$('[data-lightbox-close]')?.addEventListener('click',closeLightbox);
lightbox?.addEventListener('click',e=>{if(e.target===lightbox)closeLightbox()});

// Keyboard
window.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();closeLightbox()}if(['ArrowRight','ArrowLeft'].includes(e.key)&&!body.classList.contains('is-booting')){const order=Object.keys(viewNames);let i=order.indexOf(currentView);i=(i+(e.key==='ArrowRight'?1:-1)+order.length)%order.length;openView(order[i])}});

// Image protection requested for DARKCLAW presentation assets. This is deterrence, not DRM.
document.addEventListener('contextmenu',e=>{if(e.target.closest('img,.still,.cast-photo,.creator-visual'))e.preventDefault()});
document.addEventListener('dragstart',e=>{if(e.target.matches('img'))e.preventDefault()});
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&['s','u'].includes(e.key.toLowerCase()))e.preventDefault()});

// Mobile safety: no fullscreen ARI overlay, ever. Remove stale hidden states on page restore.
window.addEventListener('pageshow',()=>{if($('#ari-offer')?.hidden)$('#ari-offer').style.removeProperty('display');if(menu?.hidden)body.classList.remove('menu-open')});
