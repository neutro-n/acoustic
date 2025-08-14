
const burger = document.querySelector('.burger');
const nav = document.querySelector('nav');
const actions = document.querySelector('.actions');
if (burger) {
  burger.addEventListener('click', (e) => {
    e.stopPropagation();
    let mobileMenu = document.querySelector('.mobile-menu');
    if (!mobileMenu) {
      mobileMenu = document.createElement('div');
      mobileMenu.className = 'mobile-menu';
      const clonedNav = nav.querySelector('ul').cloneNode(true);
      const clonedDiscord = actions.querySelector('.btn').cloneNode(true);
      mobileMenu.appendChild(clonedNav);
      mobileMenu.appendChild(clonedDiscord);
      Object.assign(mobileMenu.style, {
        display: 'none', flexDirection: 'column', alignItems: 'center', gap: '16px',
        position: 'fixed', top: '72px', right: '20px',
        width: 'calc(100% - 40px)', maxWidth: '300px', background: 'var(--bg-1)',
        border: '1px solid var(--line)', borderRadius: '12px',
        padding: '20px', zIndex: '60',
      });
      document.body.appendChild(mobileMenu);
      mobileMenu.querySelector('ul').style.flexDirection = 'column';
      mobileMenu.querySelector('ul').style.textAlign = 'center';
      mobileMenu.querySelector('ul').style.gap = '16px';
    }
    const isVisible = mobileMenu.style.display === 'flex';
    mobileMenu.style.display = isVisible ? 'none' : 'flex';
  });
  document.addEventListener('click', () => {
    let mobileMenu = document.querySelector('.mobile-menu');
    if (mobileMenu) mobileMenu.style.display = 'none';
  });
}

const revealEls = document.querySelectorAll('.reveal-up');
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
revealEls.forEach(el => io.observe(el));

document.getElementById('year').textContent = new Date().getFullYear();

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d', { alpha: true });
let w, h, dpr, particles = [];
function rand(min, max){ return Math.random()*(max-min)+min }
function resize(){
  dpr = window.devicePixelRatio || 1;
  w = canvas.clientWidth = canvas.offsetWidth;
  h = canvas.clientHeight = canvas.offsetHeight;
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
function initParticles(count=50){
  particles = Array.from({length: count}, () => ({
    x: rand(0, w), y: rand(0, h),
    vx: rand(-0.1, 0.1), vy: rand(-0.08, 0.08),
    r: rand(0.6, 1.8), a: rand(0.2, 0.5)
  }));
}
function step(){
  if (!ctx) return;
  ctx.clearRect(0,0,w,h);
  for (const p of particles){
    p.x += p.vx; p.y += p.vy;
    if (p.x < -5) p.x = w+5; if (p.x > w+5) p.x = -5;
    if (p.y < -5) p.y = h+5; if (p.y > h+5) p.y = -5;
    ctx.beginPath();
    ctx.fillStyle = `rgba(255,255,255,${p.a})`;
    ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    ctx.fill();
  }
  anim = requestAnimationFrame(step);
}
let anim;
function start(){
  if (canvas) {
    resize();
    initParticles(50);
    if(!prefersReduced) anim = requestAnimationFrame(step);
  }
}
function stop(){ cancelAnimationFrame(anim) }
window.addEventListener('resize', resize);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stop(); else if (!prefersReduced) start();
});
start();