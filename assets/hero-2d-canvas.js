/**
 * HERO-KALLPA : 2D Energy Canvas & Micro-Interactions
 * Partículas de energía, chispas flotantes y estela luminosa
 */

class Kallpa2DCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.sparks = [];
    this.mouse = { x: -1000, y: -1000, isMoving: false };
    this.mouseTimer = null;
    this.width = 0;
    this.height = 0;
    this.rafId = null;
    this.isVisible = true;

    this.init();
  }

  init() {
    this.resize();
    this.createSparks(40);
    this.bindEvents();
    this.animate();
  }

  resize() {
    this.width = this.canvas.parentElement.clientWidth || window.innerWidth;
    this.height = this.canvas.parentElement.clientHeight || window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);
  }

  createSparks(count) {
    for (let i = 0; i < count; i++) {
      this.sparks.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 2 + 1,
        speedY: -(Math.random() * 0.8 + 0.3),
        speedX: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.7 + 0.2,
        decay: Math.random() * 0.005 + 0.002,
        color: Math.random() > 0.4 ? 'rgba(253, 181, 21, ' : 'rgba(23, 242, 198, '
      });
    }
  }

  addMouseSpark(x, y) {
    for (let i = 0; i < 2; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        size: Math.random() * 2.5 + 1,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5 - 0.5,
        alpha: 1,
        color: Math.random() > 0.5 ? 'rgba(253, 181, 21,' : 'rgba(23, 242, 198,'
      });
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resize());

    window.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (x >= 0 && x <= this.width && y >= 0 && y <= this.height) {
        this.mouse.x = x;
        this.mouse.y = y;
        this.addMouseSpark(x, y);
      }
    });

    // Observer para ahorrar recursos
    const observer = new IntersectionObserver(([entry]) => {
      this.isVisible = entry.isIntersecting;
    }, { threshold: 0.05 });
    observer.observe(this.canvas);
  }

  animate() {
    this.rafId = requestAnimationFrame(this.animate.bind(this));
    if (!this.isVisible) return;

    this.ctx.clearRect(0, 0, this.width, this.height);

    // Chispas ambientales flotando hacia arriba
    for (let i = 0; i < this.sparks.length; i++) {
      const p = this.sparks[i];
      p.y += p.speedY;
      p.x += p.speedX;

      if (p.y < 0) {
        p.y = this.height + 10;
        p.x = Math.random() * this.width;
      }

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color + p.alpha + ')';
      this.ctx.shadowBlur = 8;
      this.ctx.shadowColor = p.color + '0.8)';
      this.ctx.fill();
    }

    // Partículas de estela del mouse
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.025;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color + p.alpha + ')';
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = p.color + '1)';
      this.ctx.fill();
    }
    this.ctx.shadowBlur = 0;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const c = document.getElementById('kallpa-hero-2d');
  if (c) new Kallpa2DCanvas('kallpa-hero-2d');
});
