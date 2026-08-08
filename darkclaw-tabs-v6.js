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
  const stages = [[0,'ПРОБУЖДАЕМ СТАЮ'],[22,'СОБИРАЕМ ТЕНИ'],[46,'НАСТРАИВАЕМ ПРОСТРАНСТВО'],[72,'ОТКРЫВАЕМ ПОРТАЛ'],[94,'COMMAND CENTER ONLINE']];

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

  const tabNames={home:'01 / ГЛАВНАЯ',about:'02 / О СТАЕ',inside:'03 / ВНУТРИ',rpc:'04 / RPC',gallery:'05 / ГАЛЕРЕЯ',news:'06 / НОВОСТИ',team:'07 / КОМАНДА',events:'08 / ИВЕНТЫ',codex:'09 / КОДЕКС',creator:'10 / СОЗДАТЕЛЬ',contact:'11 / КОНТАКТЫ',archive:'12 / АРХИВ'};
  const validTabs=new Set(Object.keys(tabNames));
  const panels=[...document.querySelectorAll('[data-panel]')];
  const tabButtons=[...document.querySelectorAll('button[data-tab]')];
  const label=document.getElementById('current-section-label');
  let activeTab='home';
  let activityLogger=()=>{};

  function openTab(tab,{pushHash=true}={}){
    if(!validTabs.has(tab)) tab='home';
    activeTab=tab;
    body.dataset.activeTab=tab;
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
    activityLogger('NAVIGATION',`Открыт раздел: ${tabNames[tab].replace(/^\d+ \/ /,'')}`);
  }

  tabButtons.forEach(btn=>btn.addEventListener('click',()=>openTab(btn.dataset.tab)));
  document.querySelectorAll('[data-tab-link]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();openTab(link.dataset.tabLink)}));
  window.addEventListener('popstate',()=>openTab(location.hash.slice(1)||'home',{pushHash:false}));
  const initial=validTabs.has(location.hash.slice(1))?location.hash.slice(1):'home';
  openTab(initial,{pushHash:false});

  // Small manual easter egg: five clicks on the DARKCLAW brand. Never auto-opens anything.
  let brandClicks=0; let brandReset; const shadowToast=document.getElementById('shadow-toast');
  document.querySelectorAll('.side-brand,.mobile-brand').forEach(brand=>brand.addEventListener('click',()=>{
    brandClicks++; clearTimeout(brandReset); brandReset=setTimeout(()=>brandClicks=0,1800);
    if(brandClicks>=5){brandClicks=0;shadowToast?.classList.add('is-visible');setTimeout(()=>shadowToast?.classList.remove('is-visible'),1800);const node=document.getElementById('shadow-node');if(node){node.hidden=false;node.setAttribute('aria-hidden','false');body.style.overflow='hidden';}}
  }));

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


  // Media protection: blocks normal save/copy/drag actions.
  // This is a deterrent only; any image shown by a browser can still be captured with screenshots or developer tools.
  const protectionToast=document.getElementById('protection-toast');
  let protectionTimer;
  function showProtectionToast(){
    clearTimeout(protectionTimer);
    protectionToast?.classList.add('is-visible');
    protectionTimer=setTimeout(()=>protectionToast?.classList.remove('is-visible'),2200);
  }
  document.querySelectorAll('img').forEach(img=>{
    img.draggable=false;
    img.setAttribute('draggable','false');
  });
  document.addEventListener('contextmenu',event=>{
    event.preventDefault();
    showProtectionToast();
  },{capture:true});
  document.addEventListener('dragstart',event=>{
    const target=event.target;
    if(target instanceof HTMLImageElement || (target instanceof Element && target.closest('img,.gallery-card-new,.creator-photo,.team-creator,.home-visual,.rpc-visual-new,.lightbox-image'))){
      event.preventDefault();
      showProtectionToast();
    }
  },{capture:true});
  document.addEventListener('selectstart',event=>{
    const target=event.target;
    if(target instanceof HTMLImageElement){event.preventDefault();}
  },{capture:true});
  window.addEventListener('keydown',event=>{
    const key=event.key.toLowerCase();
    if((event.ctrlKey||event.metaKey) && key==='s'){
      event.preventDefault();
      showProtectionToast();
    }
  },{capture:true});


  // v5: random pack signal
  const packQuotes=[
    '«Твоя тень не обязана идти одна.»',
    '«Стая начинается не с числа. Она начинается с людей.»',
    '«Не ищи идеальное место — создавай атмосферу вместе с нами.»',
    '«DARKCLAW — там, где виртуальный мир становится живым.»',
    '«Лучшие истории начинаются с простого: “залетай”.»'
  ];
  const quoteEl=document.getElementById('pack-quote');
  function nextQuote(){if(!quoteEl)return;let next=packQuotes[Math.floor(Math.random()*packQuotes.length)];if(packQuotes.length>1&&next===quoteEl.textContent)next=packQuotes[(packQuotes.indexOf(next)+1)%packQuotes.length];quoteEl.animate([{opacity:.15,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],{duration:360,easing:'ease-out'});quoteEl.textContent=next;}
  document.getElementById('quote-refresh')?.addEventListener('click',nextQuote);
  if(quoteEl) nextQuote();

  // v5: secret Shadow Node closes only by user action.
  const shadowNode=document.getElementById('shadow-node');
  document.getElementById('shadow-close')?.addEventListener('click',()=>{if(!shadowNode)return;shadowNode.hidden=true;shadowNode.setAttribute('aria-hidden','true');body.style.overflow='';});
  window.addEventListener('keydown',event=>{if(event.key==='Escape'&&shadowNode&&!shadowNode.hidden){shadowNode.hidden=true;shadowNode.setAttribute('aria-hidden','true');body.style.overflow='';}});

  // v5: restrained 3D tilt on desktop only.
  const canTilt=window.matchMedia('(hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)').matches;
  if(canTilt){
    document.querySelectorAll('.tilt-card').forEach(card=>{
      card.addEventListener('mousemove',event=>{const r=card.getBoundingClientRect();const x=(event.clientX-r.left)/r.width-.5;const y=(event.clientY-r.top)/r.height-.5;card.style.transform=`perspective(850px) rotateX(${-y*4}deg) rotateY(${x*5}deg) translateY(-2px)`;});
      card.addEventListener('mouseleave',()=>{card.style.transform='';});
    });
  }


  // v6: local activity feed. It reflects only actions on this page, not fake external server events.
  const activityList=document.getElementById('activity-list');
  function stamp(){return new Date().toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'});}
  activityLogger=(kind,text)=>{
    if(!activityList)return;
    const row=document.createElement('div');row.className='is-new';
    row.innerHTML=`<time>${stamp()}</time><i></i><p><strong>${kind}</strong><span>${text}</span></p>`;
    activityList.prepend(row);
    while(activityList.children.length>5)activityList.lastElementChild?.remove();
  };

  // v6: interactive network map.
  document.querySelectorAll('[data-network-tab]').forEach(button=>button.addEventListener('click',()=>{
    const tab=button.dataset.networkTab;if(tab)openTab(tab);activityLogger('NETWORK',`Переход через узел ${String(tab||'').toUpperCase()}`);
  }));

  // v6: configurable real countdown. Set data-event-time to an ISO date to activate it.
  const countdown=document.getElementById('event-countdown');
  const countdownLabel=document.getElementById('event-countdown-label');
  let countdownTimer;
  function tickCountdown(){
    if(!countdown)return;const raw=countdown.dataset.eventTime?.trim();if(!raw)return;
    const target=new Date(raw).getTime();if(!Number.isFinite(target))return;
    const diff=Math.max(0,target-Date.now());
    const vals={days:Math.floor(diff/86400000),hours:Math.floor(diff/3600000)%24,minutes:Math.floor(diff/60000)%60,seconds:Math.floor(diff/1000)%60};
    Object.entries(vals).forEach(([key,value])=>{const el=countdown.querySelector(`[data-count="${key}"]`);if(el)el.textContent=String(value).padStart(2,'0');});
    if(countdownLabel)countdownLabel.textContent=diff>0?'ДО НАЧАЛА СОБЫТИЯ':'СОБЫТИЕ НАЧАЛОСЬ';
    if(diff<=0&&countdownTimer)clearInterval(countdownTimer);
  }
  if(countdown?.dataset.eventTime?.trim()){tickCountdown();countdownTimer=setInterval(tickCountdown,1000);}

  // v6: Command Palette (Ctrl/Cmd + K).
  const palette=document.getElementById('command-palette');const paletteInput=document.getElementById('palette-input');const paletteResults=document.getElementById('palette-results');let paletteIndex=0;
  const paletteItems=[
    ...Object.entries(tabNames).map(([id,label])=>({id,type:'tab',icon:'◆',title:label.replace(/^\d+ \/ /,''),desc:`Перейти в раздел ${label.replace(/^\d+ \/ /,'')}`})),
    {id:'terminal',type:'action',icon:'>_',title:'Терминал',desc:'Открыть DARKCLAW DC-SHELL'},
    {id:'shadow',type:'action',icon:'◈',title:'Shadow Node',desc:'Открыть скрытый узел'},
    {id:'discord',type:'external',icon:'DC',title:'Discord',desc:'Открыть Discord DARKCLAW'}
  ];
  function filteredPalette(){const q=(paletteInput?.value||'').trim().toLowerCase();return paletteItems.filter(item=>`${item.title} ${item.desc}`.toLowerCase().includes(q));}
  function renderPalette(){if(!paletteResults)return;const items=filteredPalette();paletteIndex=Math.max(0,Math.min(paletteIndex,items.length-1));paletteResults.innerHTML=items.length?items.map((item,i)=>`<button type="button" class="palette-item ${i===paletteIndex?'is-selected':''}" data-palette-index="${i}"><span>${item.icon}</span><div><strong>${item.title}</strong><small>${item.desc}</small></div><b>${item.type==='tab'?'OPEN':'RUN'}</b></button>`).join(''):'<div class="palette-empty">НИЧЕГО НЕ НАЙДЕНО // TRY ANOTHER SIGNAL</div>';paletteResults.querySelectorAll('[data-palette-index]').forEach(btn=>btn.addEventListener('click',()=>runPalette(Number(btn.dataset.paletteIndex))));}
  function openPalette(){if(!palette)return;palette.hidden=false;palette.setAttribute('aria-hidden','false');body.style.overflow='hidden';paletteIndex=0;if(paletteInput)paletteInput.value='';renderPalette();setTimeout(()=>paletteInput?.focus(),30);activityLogger('SYSTEM','Открыта Command Palette');}
  function closePalette(){if(!palette)return;palette.hidden=true;palette.setAttribute('aria-hidden','true');if(document.getElementById('dc-terminal')?.hidden!==false&&document.getElementById('shadow-node')?.hidden!==false)body.style.overflow='';}
  function runPalette(index){const items=filteredPalette();const item=items[index];if(!item)return;if(item.type==='tab'){closePalette();openTab(item.id);}else if(item.id==='terminal'){closePalette();openTerminal();}else if(item.id==='shadow'){closePalette();openShadowNode();}else if(item.id==='discord'){window.open('https://discord.gg/mGGN2RqEHw','_blank','noopener,noreferrer');closePalette();activityLogger('EXTERNAL','Discord открыт вручную');}}
  document.querySelectorAll('[data-open-palette]').forEach(btn=>btn.addEventListener('click',openPalette));document.querySelectorAll('[data-close-palette]').forEach(btn=>btn.addEventListener('click',closePalette));paletteInput?.addEventListener('input',()=>{paletteIndex=0;renderPalette();});paletteInput?.addEventListener('keydown',event=>{const items=filteredPalette();if(event.key==='ArrowDown'){event.preventDefault();paletteIndex=Math.min(items.length-1,paletteIndex+1);renderPalette();}if(event.key==='ArrowUp'){event.preventDefault();paletteIndex=Math.max(0,paletteIndex-1);renderPalette();}if(event.key==='Enter'){event.preventDefault();runPalette(paletteIndex);}});

  // v6: interactive terminal.
  const terminal=document.getElementById('dc-terminal');const terminalOutput=document.getElementById('terminal-output');const terminalInput=document.getElementById('terminal-input');const terminalForm=document.getElementById('terminal-form');
  function terminalPrint(html,cls=''){if(!terminalOutput)return;const p=document.createElement('p');if(cls)p.className=cls;p.innerHTML=html;terminalOutput.appendChild(p);terminalOutput.scrollTop=terminalOutput.scrollHeight;}
  function openTerminal(){if(!terminal)return;terminal.hidden=false;terminal.setAttribute('aria-hidden','false');body.style.overflow='hidden';setTimeout(()=>terminalInput?.focus(),30);activityLogger('TERMINAL','DC-SHELL открыт');}
  function closeTerminal(){if(!terminal)return;terminal.hidden=true;terminal.setAttribute('aria-hidden','true');if(palette?.hidden!==false&&shadowNode?.hidden!==false)body.style.overflow='';}
  document.querySelectorAll('[data-open-terminal]').forEach(btn=>btn.addEventListener('click',openTerminal));document.querySelectorAll('[data-close-terminal]').forEach(btn=>btn.addEventListener('click',closeTerminal));
  const navCommands=new Set(Object.keys(tabNames));
  function executeCommand(raw){const [cmd,...args]=raw.trim().toLowerCase().split(/\s+/);if(!cmd)return;terminalPrint(`<span>ARI@DARKCLAW:~$</span> ${raw}`);if(cmd==='help'){terminalPrint('Команды: <strong>status</strong>, <strong>home</strong>, <strong>about</strong>, <strong>rpc</strong>, <strong>gallery</strong>, <strong>news</strong>, <strong>team</strong>, <strong>events</strong>, <strong>codex</strong>, <strong>creator</strong>, <strong>contact</strong>, <strong>archive</strong>, <strong>discord</strong>, <strong>shadow</strong>, <strong>time</strong>, <strong>clear</strong>.','ok');return;}if(cmd==='clear'){if(terminalOutput)terminalOutput.innerHTML='';return;}if(cmd==='status'){terminalPrint('CORE: ONLINE // DISCORD: ACTIVE // SUPPORT: DEV // EVENTS: STANDBY // BUILD: v6.0','ok');return;}if(cmd==='time'){terminalPrint(new Date().toLocaleString('ru-RU'),'ok');return;}if(navCommands.has(cmd)){closeTerminal();openTab(cmd);activityLogger('TERMINAL',`Команда перехода: ${cmd}`);return;}if(cmd==='discord'){window.open('https://discord.gg/mGGN2RqEHw','_blank','noopener,noreferrer');terminalPrint('Discord открыт в новой вкладке.','ok');activityLogger('TERMINAL','Discord открыт вручную');return;}if(cmd==='shadow'){closeTerminal();openShadowNode();return;}terminalPrint(`command not found: ${cmd}. Используйте <strong>help</strong>.`,'err');}
  terminalForm?.addEventListener('submit',event=>{event.preventDefault();const value=terminalInput?.value||'';if(terminalInput)terminalInput.value='';executeCommand(value);});

  function openShadowNode(){if(!shadowNode)return;shadowNode.hidden=false;shadowNode.setAttribute('aria-hidden','false');body.style.overflow='hidden';shadowToast?.classList.add('is-visible');setTimeout(()=>shadowToast?.classList.remove('is-visible'),1600);activityLogger('SHADOW','Открыт скрытый узел');}
  document.querySelector('[data-shadow-archive]')?.addEventListener('click',()=>{if(shadowNode){shadowNode.hidden=true;shadowNode.setAttribute('aria-hidden','true');}body.style.overflow='';openTab('archive');});

  // v6: sealed archive files.
  const vaultToast=document.getElementById('vault-toast');let vaultTimer;
  document.querySelectorAll('[data-sealed-file]').forEach(btn=>btn.addEventListener('click',()=>{clearTimeout(vaultTimer);vaultToast?.classList.add('is-visible');vaultTimer=setTimeout(()=>vaultToast?.classList.remove('is-visible'),2300);activityLogger('VAULT',`${btn.dataset.sealedFile} запечатан`);}));

  // v6: keyboard layer and Konami easter egg.
  let konami=[];const sequence=['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  window.addEventListener('keydown',event=>{
    const key=event.key.toLowerCase();
    if((event.ctrlKey||event.metaKey)&&key==='k'){event.preventDefault();palette?.hidden===false?closePalette():openPalette();return;}
    if((event.ctrlKey||event.metaKey)&&(event.key==='`'||event.key==='~'||event.code==='Backquote')){event.preventDefault();terminal?.hidden===false?closeTerminal():openTerminal();return;}
    if(event.key==='Escape'){if(palette?.hidden===false)closePalette();if(terminal?.hidden===false)closeTerminal();}
    konami.push(event.key.length===1?event.key.toLowerCase():event.key);if(konami.length>sequence.length)konami.shift();if(sequence.every((v,i)=>konami[i]===v)){konami=[];openShadowNode();}
  },{capture:true});

  // v5: custom cursor on precise pointing devices.
  const cursor=document.getElementById('dc-cursor');const cursorDot=document.getElementById('dc-cursor-dot');
  if(window.matchMedia('(hover:hover) and (pointer:fine)').matches&&cursor&&cursorDot){
    let cx=innerWidth/2,cy=innerHeight/2,tx=cx,ty=cy;
    window.addEventListener('mousemove',event=>{tx=event.clientX;ty=event.clientY;cursor.classList.add('is-visible');cursorDot.classList.add('is-visible');cursorDot.style.left=`${tx}px`;cursorDot.style.top=`${ty}px`;});
    const tick=()=>{cx+=(tx-cx)*.18;cy+=(ty-cy)*.18;cursor.style.left=`${cx}px`;cursor.style.top=`${cy}px`;requestAnimationFrame(tick)};requestAnimationFrame(tick);
    document.addEventListener('mouseover',event=>{if(event.target instanceof Element&&event.target.closest('a,button,summary,[role="button"]'))cursor.classList.add('is-hover');});
    document.addEventListener('mouseout',event=>{if(event.target instanceof Element&&event.target.closest('a,button,summary,[role="button"]'))cursor.classList.remove('is-hover');});
  }

})();
