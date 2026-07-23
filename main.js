// ─── CURSOR (pointer:fine only) ───
const cur = document.getElementById('cur');
const cur2 = document.getElementById('cur2');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
if(!finePointer){
  if(cur) cur.style.display='none';
  if(cur2) cur2.style.display='none';
} else if(cur && cur2) {
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
if(prog){
  let progTicking = false;
  window.addEventListener('scroll',()=>{
    if(progTicking) return;
    progTicking = true;
    requestAnimationFrame(()=>{
      const max = document.body.scrollHeight - innerHeight;
      prog.style.width = (max > 0 ? scrollY / max * 100 : 0) + '%';
      progTicking = false;
    });
  },{passive:true});
}

// ─── MOBILE MENU ───
const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');
function setMenu(open){
  if(!navToggle) return;
  document.body.classList.toggle('menu-open', open);
  navToggle.setAttribute('aria-expanded', open);
}
if(navToggle && mobileMenu){
  navToggle.addEventListener('click', ()=>setMenu(!document.body.classList.contains('menu-open')));
  mobileMenu.querySelectorAll('a').forEach(a=>a.addEventListener('click', ()=>setMenu(false)));
}

// ─── CAMPUS ZONE JUMPS ───
document.querySelectorAll('[data-jump]').forEach((el) => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    if(typeof window.campusJumpTo === 'function'){
      window.campusJumpTo(el.dataset.jump);
    }
    setMenu(false);
  });
});
