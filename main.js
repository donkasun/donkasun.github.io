const root = document.documentElement;

// ─── CURSOR (pointer:fine only) ───
const cur = document.getElementById('cur');
const cur2 = document.getElementById('cur2');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
if(!finePointer){
  cur.style.display='none';
  cur2.style.display='none';
} else {
  let mx=window.innerWidth/2, my=window.innerHeight/2;
  let cx=mx, cy=my, ux=mx, uy=my;
  document.addEventListener('mousemove', e=>{
    mx=e.clientX; my=e.clientY;
  },{passive:true});
  (function animCur(){
    ux+=(mx-ux)*.5; uy+=(my-uy)*.5;
    cur.style.transform=`translate(${ux}px,${uy}px) translate(-50%,-50%)`;
    cx+=(mx-cx)*.15; cy+=(my-cy)*.15;
    cur2.style.transform=`translate(${cx}px,${cy}px) translate(-50%,-50%)`;
    requestAnimationFrame(animCur);
  })();
}

// ─── PROGRESS ───
const prog = document.getElementById('prog');
let progTicking = false;
window.addEventListener('scroll',()=>{
  if(progTicking) return;
  progTicking = true;
  requestAnimationFrame(()=>{
    prog.style.width=(scrollY/(document.body.scrollHeight-innerHeight)*100)+'%';
    progTicking = false;
  });
},{passive:true});

// ─── HERO CANVAS: Particle network ───
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canvas = document.getElementById('heroCanvas');
const ctx = canvas.getContext('2d');
let W,H,particles=[];

function resize(){
  const dpr=Math.min(window.devicePixelRatio||1,2);
  W=canvas.offsetWidth; H=canvas.offsetHeight;
  canvas.width=W*dpr; canvas.height=H*dpr;
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
resize();
window.addEventListener('resize',()=>{resize();initP()},{passive:true});

class Particle{
  constructor(){this.reset()}
  reset(){
    this.x=Math.random()*W;
    this.y=Math.random()*H;
    this.vx=(Math.random()-.5)*.4;
    this.vy=(Math.random()-.5)*.4;
    this.r=Math.random()*1.5+.5;
    this.a=Math.random()*.6+.1;
    const rgb = getComputedStyle(root);
    this.color=Math.random()>.5?rgb.getPropertyValue('--teal-rgb').trim():rgb.getPropertyValue('--blue-rgb').trim();
  }
  update(){
    this.x+=this.vx; this.y+=this.vy;
    if(this.x<0||this.x>W||this.y<0||this.y>H) this.reset();
  }
  draw(){
    ctx.beginPath();
    ctx.arc(this.x,this.y,this.r,0,Math.PI*2);
    ctx.fillStyle=`rgba(${this.color},${this.a})`;
    ctx.fill();
  }
}

function initP(){
  const count = Math.min(Math.floor(W*H/8000),120);
  particles=Array.from({length:count},()=>new Particle());
}
initP();

// Mouse influence
let pmx=W/2,pmy=H/2;
document.addEventListener('mousemove',e=>{pmx=e.clientX;pmy=e.clientY},{passive:true});

function drawConnections(){
  const maxDist=140;
  for(let i=0;i<particles.length;i++){
    for(let j=i+1;j<particles.length;j++){
      const dx=particles[i].x-particles[j].x;
      const dy=particles[i].y-particles[j].y;
      const d=Math.sqrt(dx*dx+dy*dy);
      if(d<maxDist){
        const a=(1-d/maxDist)*.15;
        ctx.beginPath();
        ctx.moveTo(particles[i].x,particles[i].y);
        ctx.lineTo(particles[j].x,particles[j].y);
        const tr = getComputedStyle(root).getPropertyValue('--teal-rgb').trim();
        ctx.strokeStyle=`rgba(${tr},${a})`;
        ctx.lineWidth=.5;
        ctx.stroke();
      }
    }
    // Mouse connections
    const dx=particles[i].x-pmx;
    const dy=particles[i].y-pmy;
    const d=Math.sqrt(dx*dx+dy*dy);
    if(d<200){
      const a=(1-d/200)*.3;
      const tr = getComputedStyle(root).getPropertyValue('--teal-rgb').trim();
      ctx.beginPath();
      ctx.moveTo(particles[i].x,particles[i].y);
      ctx.lineTo(pmx,pmy);
      ctx.strokeStyle=`rgba(${tr},${a})`;
      ctx.lineWidth=.8;
      ctx.stroke();
    }
  }
}

let canvasRunning=false;
function animCanvas(){
  if(!canvasRunning) return;
  ctx.clearRect(0,0,W,H);
  drawConnections();
  particles.forEach(p=>{p.update();p.draw()});
  requestAnimationFrame(animCanvas);
}
// Only run while the hero is on screen, and never under reduced-motion
if(!reduceMotion){
  const heroEl=document.getElementById('hero');
  new IntersectionObserver(entries=>{
    const visible=entries[0].isIntersecting;
    if(visible && !canvasRunning){canvasRunning=true;animCanvas();}
    else if(!visible){canvasRunning=false;}
  }).observe(heroEl);
}

// ─── SCROLL REVEAL ───
// Site-wide reveals. Timeline elements are handled by their own observer below
// (different trigger point), so they're excluded here.
const obs = new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');obs.unobserve(e.target)}});
},{threshold:.08,rootMargin:'0px 0px -40px 0px'});
document.querySelectorAll('.rv,.rv-l,.rv-s').forEach(el=>obs.observe(el));

// ─── STAT COUNT-UP + DOT-LIST STAGGER ───
const STAT_DUR = 1900;   // shared animation envelope (ms)
const ITEM_FADE = 600;   // must match .dot-item transition duration in CSS
function animateCount(el){
  const target = +el.dataset.count;
  const t0 = performance.now();
  (function step(now){
    const p = Math.min((now - t0) / STAT_DUR, 1);
    el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target);
    if(p < 1) requestAnimationFrame(step);
    else el.textContent = target;
  })(t0);
}

function splitDotItems(el){
  const items = [], frag = document.createDocumentFragment();
  Array.from(el.childNodes).forEach(node=>{
    if(node.nodeType === Node.TEXT_NODE){
      const words = node.textContent.split(/( · )/).filter(p => p && p !== ' · ');
      words.forEach((word, i)=>{
        const s = document.createElement('span');
        s.className = 'dot-item';
        s.textContent = i < words.length - 1 ? word.trim() + ' · ' : word.trim();
        frag.appendChild(s);
        items.push(s);
      });
    } else {
      frag.appendChild(node.cloneNode(true));
    }
  });
  el.textContent = '';
  el.appendChild(frag);
  return items;
}

const wrapLists = [...document.querySelectorAll('.sc-list--wrap')];
const dotLists = [...document.querySelectorAll('.sc-list:not(.sc-list--wrap)')].map(el=>({el, items: splitDotItems(el)}));
const counters = document.querySelectorAll('[data-count]');

if(reduceMotion){
  dotLists.forEach(({items})=>items.forEach(s=>s.classList.add('show')));
  wrapLists.forEach(el=>el.classList.add('show'));
} else {
  counters.forEach(el=>el.textContent = '0');
  const statObs = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(!e.isIntersecting) return;
      if(e.target.dataset.count !== undefined) animateCount(e.target);
      else if(e.target.classList.contains('sc-list--wrap')) e.target.classList.add('show');
      else { const list = dotLists.find(d=>d.el === e.target);
        if(list){ const n = list.items.length;
          const step = n > 1 ? (STAT_DUR - ITEM_FADE) / (n - 1) : 0;
          list.items.forEach((s,i)=>setTimeout(()=>s.classList.add('show'), i * step)); } }
      statObs.unobserve(e.target);
    });
  },{threshold:.4});
  counters.forEach(el=>statObs.observe(el));
  dotLists.forEach(({el})=>statObs.observe(el));
  wrapLists.forEach(el=>statObs.observe(el));
}

// ─── SCROLL SPY nav ───
const navAs = document.querySelectorAll('nav .nav-links a');
const secs = ['about','experience','projects','contact'].map(id=>document.getElementById(id)).filter(Boolean);
const navSpy = new IntersectionObserver(entries=>{
  entries.filter(e=>e.isIntersecting).forEach(e=>{
    navAs.forEach(a=>a.style.color=a.getAttribute('href')==='#'+e.target.id?'var(--teal)':'var(--dim)');
  });
},{rootMargin:'-30% 0px -55% 0px'});
secs.forEach(s=>navSpy.observe(s));

// ─── HERO FLOAT PARALLAX (4 product floats) ───
const heroPxWraps = document.querySelectorAll('[data-hero-px]');
const heroSection = document.getElementById('hero');

function runHeroParallax(){
  if(!heroSection || !heroPxWraps.length) return;
  const rect = heroSection.getBoundingClientRect();
  const vh = window.innerHeight;
  const range = rect.height * 0.85 + vh * 0.15;
  // 0 while hero is in view → 1 as hero scrolls past the top
  const t = Math.max(0, Math.min(1, -rect.top / range));

  heroPxWraps.forEach(el=>{
    const speed = parseFloat(el.dataset.heroPx) || 0.1;
    const y = t * vh * speed * 0.32;
    el.style.setProperty('--hero-scroll-y', `${y}px`);
  });
}

let motionTicking = false;
function onScrollMotion(){
  if(motionTicking) return;
  motionTicking = true;
  requestAnimationFrame(()=>{
    runHeroParallax();
    motionTicking = false;
  });
}
if(!reduceMotion){
  window.addEventListener('scroll', onScrollMotion, {passive:true});
  window.addEventListener('resize', onScrollMotion, {passive:true});
  runHeroParallax();
}

// ─── EXPERIENCE: sticky horizontal arc timeline ───
// Markers slide along an oval arc as the tall .xt-track scrolls under the
// sticky viewport; the centered entry fold-opens its card. Enhanced mode only
// runs on wide screens without reduced motion — otherwise the CSS fallback
// shows the cards as a plain stack.
const xtSection = document.getElementById('experience');
const xtTrack = document.getElementById('xtTrack');
if(xtTrack){
  const xtArc = document.getElementById('xtArc');
  const xtSvg = document.getElementById('xtArcSvg');
  const xtPath = document.getElementById('xtArcPath');
  const xtNowLogos = document.getElementById('xtNowLogos');
  const xtNowName = document.getElementById('xtNowName');
  const xtCards = [...document.querySelectorAll('.xt-card')];
  const XT_N = xtCards.length;
  const XT_SPREAD = 0.5;           // radians between adjacent markers
  const XT_ARC_SPAN = 1.15;        // arc endpoints; rx derived so path spans full width
  const xtWide = window.matchMedia('(min-width:901px)');
  let xtMarks = [], xtActive = -1, xtOn = false, xtTicking = false, xtClosingIdx = -1;

  xtCards.forEach(c=>{
    const m = document.createElement('div');
    m.className = 'xt-mark';
    m.innerHTML = `<div class="xt-mark-label">${c.dataset.period}</div><div class="xt-mark-dot"></div>`;
    xtArc.appendChild(m);
    xtMarks.push(m);
  });

  function xtGeom(){
    const w = xtArc.clientWidth, h = xtArc.clientHeight;
    const rx = (w / 2) / Math.sin(XT_ARC_SPAN);
    return {w, h, cx: w/2, baseY: h-26, rx, ry: Math.min(h*1.1, 150)};
  }

  function xtDrawPath(){
    const g = xtGeom();
    xtSvg.setAttribute('viewBox', `0 0 ${g.w} ${g.h}`);
    let d = '';
    for(let a=-XT_ARC_SPAN; a<=XT_ARC_SPAN+.001; a+=0.05){
      const x = g.cx + g.rx*Math.sin(a);
      const y = g.baseY - g.ry*(1-Math.cos(a));
      d += (d?'L':'M') + x.toFixed(1) + ' ' + y.toFixed(1);
    }
    xtPath.setAttribute('d', d);
  }

  function xtSetActive(i){
    if(i === xtActive) return;
    const prev = xtActive;
    xtActive = i;
    // Only the card folding open and the one immediately behind it (still
    // folding shut) may ever be visible. If scrolling advances again before
    // that previous card finishes its lingering fold, it's now stale — snap
    // it out instantly instead of letting it sit there mid-fold.
    if(xtClosingIdx !== -1 && xtClosingIdx !== prev){
      const stale = xtCards[xtClosingIdx];
      stale.classList.add('xt-force-hide');
      requestAnimationFrame(()=>requestAnimationFrame(()=>stale.classList.remove('xt-force-hide')));
    }
    if(prev !== -1) xtClosingIdx = prev;
    xtCards.forEach((c,j)=>c.classList.toggle('is-open', j===i));
    xtMarks.forEach((m,j)=>m.classList.toggle('is-active', j===i));
    const c = xtCards[i];
    xtNowName.textContent = c.dataset.company + ' · ' + c.dataset.loc;
    xtNowLogos.innerHTML = (c.dataset.logos||'').split(',').filter(Boolean)
      .map(src=>`<img src="${src}" alt="">`).join('');
  }

  function xtLayout(){
    const rect = xtTrack.getBoundingClientRect();
    const span = rect.height - window.innerHeight;
    const p = span > 0 ? Math.max(0, Math.min(1, -rect.top/span)) : 0;
    const pos = p * (XT_N - 1);
    const g = xtGeom();
    xtMarks.forEach((m,i)=>{
      const d = i - pos;
      const a = d * XT_SPREAD;
      const x = g.cx + g.rx*Math.sin(a);
      const y = g.baseY - g.ry*(1-Math.cos(a));
      const t = Math.min(Math.abs(d), 2.4);
      m.style.transform = `translate(-50%,-92%) translate(${x}px,${y}px) scale(${1 - t*0.18})`;
      m.style.opacity = String(Math.max(0, 1 - t*0.34));
    });
    xtSetActive(Math.max(0, Math.min(XT_N-1, Math.round(pos))));
  }

  function xtScroll(){
    if(!xtOn || xtTicking) return;
    xtTicking = true;
    requestAnimationFrame(()=>{ xtLayout(); xtTicking = false; });
  }

  function xtRefresh(){
    const want = !reduceMotion && xtWide.matches;
    if(want && !xtOn){
      xtOn = true;
      xtSection.classList.add('xt-on');
    } else if(!want && xtOn){
      xtOn = false;
      xtActive = -1;
      xtClosingIdx = -1;
      xtSection.classList.remove('xt-on');
      xtCards.forEach(c=>c.classList.remove('is-open','xt-force-hide'));
    }
    if(xtOn){ xtDrawPath(); xtLayout(); }
  }

  window.addEventListener('scroll', xtScroll, {passive:true});
  window.addEventListener('resize', xtRefresh, {passive:true});
  xtRefresh();
}

// ─── PROJECT CARDS (mobile) ───
const mobileProjMq = window.matchMedia('(max-width: 768px)');
const projCards = document.querySelectorAll('.proj-card');
const PROJ_DESC_LINES = 4;

function resetProjDescWrap(wrap){
  wrap.classList.remove('is-collapsed','is-expanded');
  const desc = wrap.querySelector('.proj-desc');
  const btn = wrap.querySelector('.proj-desc-toggle');
  if(desc) desc.style.maxHeight = '';
  if(btn){
    btn.hidden = true;
    btn.textContent = 'See more';
    btn.setAttribute('aria-expanded','false');
  }
}

function setupProjDescCollapse(){
  document.querySelectorAll('.proj-desc-wrap').forEach(resetProjDescWrap);
  if(!mobileProjMq.matches || reduceMotion) return;

  document.querySelectorAll('.proj-desc-wrap').forEach(wrap=>{
    const desc = wrap.querySelector('.proj-desc');
    const btn = wrap.querySelector('.proj-desc-toggle');
    if(!desc || !btn) return;

    desc.style.maxHeight = 'none';
    const lineHeight = parseFloat(getComputedStyle(desc).lineHeight) || 23;
    const collapsedMax = Math.ceil(lineHeight * PROJ_DESC_LINES);
    const fullHeight = desc.scrollHeight;

    if(fullHeight <= collapsedMax + 1){
      btn.hidden = true;
      return;
    }

    btn.hidden = false;
    wrap.classList.add('is-collapsed');
    desc.style.maxHeight = collapsedMax + 'px';

    if(!btn.dataset.bound){
      btn.dataset.bound = '1';
      btn.addEventListener('click', ()=>{
        const expanded = !wrap.classList.contains('is-expanded');
        wrap.classList.toggle('is-expanded', expanded);
        wrap.classList.toggle('is-collapsed', !expanded);
        desc.style.maxHeight = expanded ? fullHeight + 'px' : collapsedMax + 'px';
        btn.textContent = expanded ? 'See less' : 'See more';
        btn.setAttribute('aria-expanded', String(expanded));
      });
    }
  });
}

function updateCenteredProjCards(){
  if(!mobileProjMq.matches){
    projCards.forEach(c=>c.classList.remove('is-centered'));
    return;
  }
  const centerY = window.innerHeight * 0.5;
  const band = window.innerHeight * 0.22;
  projCards.forEach(card=>{
    const rect = card.getBoundingClientRect();
    if(rect.bottom < 0 || rect.top > window.innerHeight){
      card.classList.remove('is-centered');
      return;
    }
    const cardCenter = rect.top + rect.height * 0.5;
    card.classList.toggle('is-centered', Math.abs(cardCenter - centerY) < band);
  });
}

setupProjDescCollapse();
updateCenteredProjCards();
let projCenterTicking = false;
window.addEventListener('scroll', ()=>{
  if(projCenterTicking) return;
  projCenterTicking = true;
  requestAnimationFrame(()=>{
    updateCenteredProjCards();
    projCenterTicking = false;
  });
},{passive:true});
window.addEventListener('resize', ()=>{
  setupProjDescCollapse();
  updateCenteredProjCards();
},{passive:true});

// ─── MOBILE MENU ───
const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');
function setMenu(open){
  document.body.classList.toggle('menu-open', open);
  navToggle.setAttribute('aria-expanded', open);
}
navToggle.addEventListener('click', ()=>setMenu(!document.body.classList.contains('menu-open')));
mobileMenu.querySelectorAll('a').forEach(a=>a.addEventListener('click', ()=>setMenu(false)));

