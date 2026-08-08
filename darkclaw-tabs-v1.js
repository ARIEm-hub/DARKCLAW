(() => {
  'use strict';
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
  const stages = [[0,'ПРОБУЖДАЕМ СТАЮ'],[22,'СОБИРАЕМ ТЕНИ'],[46,'НАСТРАИВАЕМ ПРОСТРАНСТВО'],[72,'ОТКРЫВАЕМ ПОРТАЛ'],[94,'ДОБРО ПОЖАЛОВАТЬ']];

  function updateLoader(){
    if(!loadingScreen) return;
    const elapsed=performance.now()-loadingStartedAt;
    const linear=Math.min(1,elapsed/loadingDuration);
    const eased=1-Math.pow(1-linear,3);
    const progress=Math.min(100,Math.round(eased*100));
    const stage=[...stages].reverse().find(([t])=>progress>=t)?.[1]||stages[0][1];
    if(loadingTitle) loadingTitle.textContent=stage;
    if(loadingStatus) loadingStatus.textContent=stage;
    if(loadingPercent) loadingPercent.textContent=`${String(progress).padStart(3,'0')}%`;
    if(loadingBar) loadingBar.style.width=`${progress}%`;
    if(loadingCursor) loadingCursor.style.left=`${progress}%`;
    loadingSteps.forEach((el,i)=>el.classList.toggle('active',progress>=[8,28,52,76][i]));
    if(linear<1) requestAnimationFrame(updateLoader);
  }
  function hideLoader(){
    if(!loadingScreen||loadingScreen.classList.contains('is-closing')) return;
    const wait=Math.max(0,loadingDuration-(performance.now()-loadingStartedAt));
    setTimeout(()=>{loadingScreen.classList.add('is-closing');delete body.dataset.appLoading;setTimeout(()=>loadingScreen.remove(),760)},wait);
  }
  requestAnimationFrame(updateLoader);
  if(document.readyState==='complete') hideLoader(); else window.addEventListener('load',hideLoader,{once:true});

  const tabNames={home:'01 / ГЛАВНАЯ',about:'02 / О СТАЕ',inside:'03 / ВНУТРИ',rpc:'04 / RPC',gallery:'05 / ГАЛЕРЕЯ',creator:'06 / СОЗДАТЕЛЬ',contact:'07 / КОНТАКТЫ'};
  const validTabs=new Set(Object.keys(tabNames));
  const panels=[...document.querySelectorAll('[data-panel]')];
  const tabButtons=[...document.querySelectorAll('button[data-tab]')];
  const label=document.getElementById('current-section-label');
  let activeTab='home';

  function openTab(tab,{pushHash=true}={}){
    if(!validTabs.has(tab)) tab='home';
    activeTab=tab;
    panels.forEach(panel=>{
      const active=panel.dataset.panel===tab;
      panel.hidden=!active;
      requestAnimationFrame(()=>panel.classList.toggle('is-active',active));
      if(active){const scroll=panel.querySelector('.panel-scroll'); if(scroll) scroll.scrollTop=0;}
    });
    document.querySelectorAll('[data-tab]').forEach(btn=>btn.classList.toggle('is-active',btn.dataset.tab===tab));
    if(label) label.textContent=tabNames[tab];
    document.title=`DARKCLAW — ${tabNames[tab].replace(/^\d+ \/ /,'')}`;
    if(pushHash){history.pushState({tab},'',`#${tab}`);}
  }

  tabButtons.forEach(btn=>btn.addEventListener('click',()=>openTab(btn.dataset.tab)));
  document.querySelectorAll('[data-tab-link]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();openTab(link.dataset.tabLink)}));
  window.addEventListener('popstate',()=>openTab(location.hash.slice(1)||'home',{pushHash:false}));
  const initial=validTabs.has(location.hash.slice(1))?location.hash.slice(1):'home';
  openTab(initial,{pushHash:false});

  const toast=document.getElementById('support-toast');
  let toastTimer;
  document.querySelectorAll('[data-disabled-support]').forEach(button=>{
    button.addEventListener('click',event=>{
      event.preventDefault();
      clearTimeout(toastTimer);
      toast?.classList.add('is-visible');
      toastTimer=setTimeout(()=>toast?.classList.remove('is-visible'),2400);
    });
  });

  const visitCounter=document.getElementById('visit-counter');
  const visitCounterValue=document.getElementById('visit-counter-value');
  const counterBase='https://api.counterapi.dev/v1/darkclaw-vrchat-2026/page-visits';
  const sessionKey='darkclaw-page-visit-counted-v1';
  function extractCounterValue(payload){if(!payload||typeof payload!=='object')return null;const raw=payload.value??payload.count;const n=Number(raw);if(Number.isFinite(n))return n;const nested=payload.data??payload.result;return nested&&typeof nested==='object'?extractCounterValue(nested):null;}
  async function updateCounter(){
    if(!visitCounter||!visitCounterValue)return;
    try{const local=['localhost','127.0.0.1','0.0.0.0'].includes(location.hostname);const counted=sessionStorage.getItem(sessionKey)==='1';const inc=!local&&!counted;const response=await fetch(inc?`${counterBase}/up`:counterBase,{cache:'no-store'});if(!response.ok)throw new Error(String(response.status));const value=extractCounterValue(await response.json());if(value===null)throw new Error('no value');if(inc)sessionStorage.setItem(sessionKey,'1');visitCounterValue.textContent=value.toLocaleString('ru-RU');visitCounter.dataset.status='ready';}catch(error){console.warn('DARKCLAW counter unavailable',error);visitCounterValue.textContent='—';visitCounter.dataset.status='error';}
  }
  void updateCounter();

  const works=[
    {title:'Avatar Lab',type:'VRChat / Character',image:'./avatar-lab.svg',description:'Работа с образами, аватарами и визуальной идентичностью участников.'},
    {title:'Night World',type:'VRChat / World',image:'./world-night.svg',description:'Атмосферные пространства для встреч, отдыха и совместных событий.'},
    {title:'Community Event',type:'Events / Social',image:'./event-stage.svg',description:'Игровые вечера, небольшие ивенты и поводы собраться вместе.'},
    {title:'Creator Studio',type:'RPC / Production',image:'./studio-grid.svg',description:'Внутреннее творческое направление и производство контента для VRChat.'}
  ];
  const lightbox=document.getElementById('lightbox');const image=document.getElementById('lightbox-image');const type=document.getElementById('lightbox-type');const title=document.getElementById('lightbox-title');const desc=document.getElementById('lightbox-description');const count=document.getElementById('lightbox-count');let index=0;
  function render(){const work=works[index];image.src=work.image;image.alt=work.title;type.textContent=work.type;title.textContent=work.title;desc.textContent=work.description;count.textContent=`0${index+1} / 0${works.length}`;}
  function openLightbox(i){index=i;render();lightbox.hidden=false;body.style.overflow='hidden'}
  function closeLightbox(){lightbox.hidden=true;body.style.overflow=''}
  function move(d){index=(index+d+works.length)%works.length;render()}
  document.querySelectorAll('[data-gallery-index]').forEach(btn=>btn.addEventListener('click',()=>openLightbox(Number(btn.dataset.galleryIndex))));
  document.querySelector('.lightbox-backdrop')?.addEventListener('click',closeLightbox);document.querySelector('.lightbox-close')?.addEventListener('click',closeLightbox);document.getElementById('lightbox-prev')?.addEventListener('click',()=>move(-1));document.getElementById('lightbox-next')?.addEventListener('click',()=>move(1));
  window.addEventListener('keydown',event=>{if(lightbox?.hidden)return;if(event.key==='Escape')closeLightbox();if(event.key==='ArrowLeft')move(-1);if(event.key==='ArrowRight')move(1)});
})();
