// ─── THEME (system default, user override persisted) ───
const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const themeToggleMenu = document.getElementById('themeToggleMenu');
const themeLabel = document.querySelector('.theme-toggle-label');
const systemThemeQuery = window.matchMedia('(prefers-color-scheme: dark)');

function getStoredPreference(){
  return localStorage.getItem('theme');
}

function getSystemTheme(){
  return systemThemeQuery.matches ? 'dark' : 'light';
}

function resolveTheme(preference){
  return preference === 'light' || preference === 'dark' ? preference : getSystemTheme();
}

function getResolvedTheme(){
  return resolveTheme(getStoredPreference());
}

function applyResolvedTheme(theme){
  const next = theme === 'dark' ? 'dark' : 'light';
  root.setAttribute('data-theme', next);
  const toDark = next === 'light';
  const label = toDark ? 'Switch to dark mode' : 'Switch to light mode';
  if(themeToggle) themeToggle.setAttribute('aria-label', label);
  if(themeToggleMenu) themeToggleMenu.setAttribute('aria-label', label);
  if(themeLabel) themeLabel.textContent = toDark ? 'Dark mode' : 'Light mode';
  window.dispatchEvent(new Event('themechange'));
}

function setPreference(preference){
  localStorage.setItem('theme', preference);
  applyResolvedTheme(resolveTheme(preference));
}

function toggleTheme(){
  const resolved = getResolvedTheme();
  setPreference(resolved === 'dark' ? 'light' : 'dark');
}

applyResolvedTheme(getResolvedTheme());
systemThemeQuery.addEventListener('change', () => {
  const pref = getStoredPreference();
  if(pref !== 'light' && pref !== 'dark') applyResolvedTheme(getSystemTheme());
});
themeToggle?.addEventListener('click', toggleTheme);
themeToggleMenu?.addEventListener('click', toggleTheme);

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
window.addEventListener('themechange',()=>{particles.forEach(p=>p.reset())});

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
document.querySelectorAll('.rv,.rv-l,.rv-s').forEach(el=>{
  if(!el.matches('.exp-item,.exp-reveal')) obs.observe(el);
});

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

// ─── PARALLAX ───
const pxEls = document.querySelectorAll('[data-px]');

function runParallax(){
  const sy = window.scrollY;
  pxEls.forEach(el=>{
    const speed = parseFloat(el.dataset.px);
    // Use element's section offset so effect is relative to scroll into view
    const parent = el.closest('section') || el.parentElement;
    const rect = parent.getBoundingClientRect();
    const centerOffset = rect.top + rect.height / 2;
    el.style.transform = `translate3d(0,${centerOffset * speed * -1}px,0)`;
  });
}

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
    runParallax();
    runHeroParallax();
    motionTicking = false;
  });
}
if(!reduceMotion){
  window.addEventListener('scroll', onScrollMotion, {passive:true});
  window.addEventListener('resize', onScrollMotion, {passive:true});
  runParallax();
  runHeroParallax();
}

// ─── EXP TIMELINE ───
// Fly-in: each row's card and text slide in from opposite sides (CSS
// .on-left/.on-right translateX + .rv opacity). Triggered once the element has
// risen to at least 15% of the viewport height from the bottom (-15% bottom
// rootMargin). Adds .in, one-shot — staggers down the timeline, never reverses.
const flyEls = document.querySelectorAll('.exp-item, .exp-reveal');
if(flyEls.length){
  const flyObs = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ e.target.classList.add('in'); flyObs.unobserve(e.target); }
    });
  },{rootMargin:'0px 0px -15% 0px',threshold:0});
  flyEls.forEach(el=>flyObs.observe(el));
}

// Card open: a separate observer opens each lid once the card has risen to at
// least 40% of the viewport height from the bottom (-40% bottom rootMargin).
// One-shot — opens on scroll-down, never reverses.
const revealCards = document.querySelectorAll('.exp-reveal');
if(revealCards.length){
  const lidObs = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ e.target.classList.add('lid-open'); lidObs.unobserve(e.target); }
    });
  },{rootMargin:'0px 0px -40% 0px',threshold:0});
  revealCards.forEach(c=>lidObs.observe(c));
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

