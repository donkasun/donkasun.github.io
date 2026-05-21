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
window.addEventListener('scroll',()=>{
  prog.style.width=(scrollY/(document.body.scrollHeight-innerHeight)*100)+'%';
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
    this.color=Math.random()>.5?'0,229,180':'56,182,255';
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
        ctx.strokeStyle=`rgba(0,229,180,${a})`;
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
      ctx.beginPath();
      ctx.moveTo(particles[i].x,particles[i].y);
      ctx.lineTo(pmx,pmy);
      ctx.strokeStyle=`rgba(0,229,180,${a})`;
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
const obs = new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');obs.unobserve(e.target)}});
},{threshold:.08,rootMargin:'0px 0px -40px 0px'});
document.querySelectorAll('.rv,.rv-l,.rv-s').forEach(el=>obs.observe(el));

// ─── SCROLL SPY nav ───
const navAs = document.querySelectorAll('nav .nav-links a');
const secs = ['about','experience','projects','contact'].map(id=>document.getElementById(id)).filter(Boolean);
const navSpy = new IntersectionObserver(entries=>{
  entries.filter(e=>e.isIntersecting).forEach(e=>{
    navAs.forEach(a=>a.style.color=a.getAttribute('href')==='#'+e.target.id?'var(--teal)':'');
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

// ─── MOBILE MENU ───
const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');
function setMenu(open){
  document.body.classList.toggle('menu-open', open);
  navToggle.setAttribute('aria-expanded', open);
}
navToggle.addEventListener('click', ()=>setMenu(!document.body.classList.contains('menu-open')));
mobileMenu.querySelectorAll('a').forEach(a=>a.addEventListener('click', ()=>setMenu(false)));

