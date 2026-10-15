/**
 * HERO-KALLPA : Interactive 3D Cylindrical Hero Can Controller
 * Basado en la arquitectura híbrida 2D + 3D de alta fidelidad (Offscreen Blitting)
 * Adaptado del repositorio oficial https://github.com/luismiguel9117/Kallpa.git
 */

import { CanRenderer } from './canRenderer.js';

class SpringValue {
  constructor(initial = 0, stiffness = 90, damping = 12) {
    this.value = initial;
    this.target = initial;
    this.velocity = 0;
    this.stiffness = stiffness;
    this.damping = damping;
  }

  update(dt) {
    const force = (this.target - this.value) * this.stiffness;
    const dampingForce = -this.velocity * this.damping;
    const acceleration = force + dampingForce;
    this.velocity += acceleration * dt;
    this.value += this.velocity * dt;

    if (Math.abs(this.velocity) < 0.0005 && Math.abs(this.target - this.value) < 0.0005) {
      this.value = this.target;
      this.velocity = 0;
    }
    return this.value;
  }
}

export class HeroKallpaCan {
  constructor(containerId = 'kallpa-hero-3d', options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    const ds = this.container.dataset || {};
    this.options = Object.assign({
      baseCanUrl: ds.baseCan || 'assets/kalpa-can-clean.png',
      dropletsUrl: ds.droplets || 'assets/kalpa-can-droplets.png',
      labels: [
        ds.labelOriginal || 'assets/kalpa-label.png',        // Slide 1: Original Cold Brew
        ds.labelGold || 'assets/kalpa-label-gold.png',       // Slide 2: Extracción 24H / Gold
        ds.labelCitrus || 'assets/kalpa-label-citrus.png'    // Slide 3: Energía Limpia / Citrus
      ],
      spinDuration: 2400, // ms for 360° turn
      ambientSpinInterval: 7500 // ms between spontaneous ambient rotations
    }, options);

    // Initial state
    this.activeSlide = 0;
    this.renderer = new CanRenderer();
    this.labelMaterials = [];
    this.currentOffset = 0.475; // Front logo KALPA
    this.targetOffset = 0.475;
    this.spinCycleStart = -1;
    this.lastAmbientSpinTime = performance.now();
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartOffset = 0;
    this.lastPointerX = 0;
    this.lastPointerTime = 0;
    this.velocity = 0;

    // Cursor tracking
    this.cursorNormX = 0;
    this.cursorNormY = 0;

    // Physical springs
    this.liftSpring = new SpringValue(0, 70, 11);
    this.tiltXSpring = new SpringValue(0, 60, 12);
    this.tiltYSpring = new SpringValue(0, 60, 12);
    this.floatTime = 0;

    this.initDOM();
    this.initLabels();
    this.bindEvents();
    this.startLoop();
  }

  initDOM() {
    this.container.innerHTML = '';
    this.container.classList.add('hero-kallpa-can-stage');

    // Outer responsive anchor positioned exactly like the mockup
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'hero-kallpa-can-wrapper';

    // Interactive card container
    this.canCard = document.createElement('div');
    this.canCard.className = 'hero-kallpa-can-card';

    // Layer 1: Base can with metallic lid, rim, chime, and studio lighting
    this.baseImg = document.createElement('img');
    this.baseImg.className = 'hero-kallpa-can__base';
    this.baseImg.src = this.options.baseCanUrl;
    this.baseImg.alt = 'Lata KALPA Cold Brew 3D';
    this.baseImg.loading = 'eager';
    this.baseImg.draggable = false;

    // Layer 2: 2D Canvas blitting the 3D rotating cylinder
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'hero-kallpa-can__canvas';
    this.canvas.width = 500;
    this.canvas.height = 1000;
    this.ctx = this.canvas.getContext('2d');

    // Layer 3: Ultra-sharp water droplets and condensation overlay
    this.dropletsImg = document.createElement('img');
    this.dropletsImg.className = 'hero-kallpa-can__droplets';
    this.dropletsImg.src = this.options.dropletsUrl;
    this.dropletsImg.alt = '';
    this.dropletsImg.draggable = false;

    // Assemble layers
    this.canCard.appendChild(this.baseImg);
    this.canCard.appendChild(this.canvas);
    this.canCard.appendChild(this.dropletsImg);
    this.wrapper.appendChild(this.canCard);
    this.container.appendChild(this.wrapper);
  }

  initLabels() {
    this.labelMaterials = this.options.labels.map((url, idx) => {
      const matObj = this.renderer.createLabelMaterial(url, () => {
        if (idx === this.activeSlide) {
          this.renderCanFrame(this.currentOffset);
        }
      });
      return matObj;
    });
  }

  bindEvents() {
    // Pointer move across window for magnetic 3D perspective and depth planes parallax
    window.addEventListener('pointermove', (e) => {
      this.cursorNormX = (e.clientX / window.innerWidth - 0.5) * 2;
      this.cursorNormY = (e.clientY / window.innerHeight - 0.5) * 2;
      this.tiltXSpring.target = -this.cursorNormY * 6; // degrees
      this.tiltYSpring.target = this.cursorNormX * 8;

      // Parallax en elementos de cacao jugando con los planos
      const beans = document.querySelectorAll('.cacao-bean');
      if (beans.length) {
        beans.forEach((b) => {
          const depth = parseFloat(b.dataset.depth || '0.04');
          const px = (this.cursorNormX * depth * 85).toFixed(2);
          const py = (this.cursorNormY * depth * 85).toFixed(2);
          b.style.setProperty('--parallax-x', `${px}px`);
          b.style.setProperty('--parallax-y', `${py}px`);
        });
      }
    }, { passive: true });

    // Hover on can card
    this.canCard.addEventListener('pointerenter', () => {
      this.liftSpring.target = 1.0;
      if (this.spinCycleStart < 0) {
        this.spinCycleStart = performance.now();
      }
    });

    this.canCard.addEventListener('pointerleave', () => {
      this.liftSpring.target = 0.0;
      // Do not kill spinCycle: let it gracefully complete 360° rotation back to front
    });

    // Drag to spin horizontally
    const onPointerDown = (e) => {
      this.isDragging = true;
      this.dragStartX = e.clientX;
      this.dragStartOffset = this.currentOffset;
      this.lastPointerX = e.clientX;
      this.lastPointerTime = performance.now();
      this.canCard.classList.add('is-dragging');
    };

    const onPointerMove = (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.dragStartX;
      // Sensitivity: drag 500px for full 360 turn
      this.targetOffset = this.dragStartOffset + dx / 500;
      this.currentOffset = this.targetOffset;

      const now = performance.now();
      const dt = Math.max(1, now - this.lastPointerTime);
      this.velocity = ((e.clientX - this.lastPointerX) / dt) * 0.003;
      this.lastPointerX = e.clientX;
      this.lastPointerTime = now;
      this.spinCycleStart = -1; // interrupt auto-spin on manual drag
    };

    const onPointerUp = () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.canCard.classList.remove('is-dragging');
    };

    this.canCard.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    // Synchronize with hero carousel slide changes
    document.addEventListener('kallpa:slidechange', (e) => {
      if (typeof e.detail?.index === 'number') {
        this.setSlide(e.detail.index);
      }
    });
  }

  setSlide(slideIndex) {
    if (slideIndex < 0 || slideIndex >= this.labelMaterials.length) return;
    this.activeSlide = slideIndex;
    // Trigger celebratory spin on slide change
    this.spinCycleStart = performance.now();
  }

  renderCanFrame(offset) {
    const activeLabelObj = this.labelMaterials[this.activeSlide];
    if (!activeLabelObj) return;

    this.renderer.render(activeLabelObj, offset);
    this.renderer.blit(this.ctx, 500, 1000);
  }

  startLoop() {
    let lastTime = performance.now();

    const loop = (currentTime) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;
      this.floatTime += dt;

      // 1. Natural Sinusoidal Floating
      const floatY = Math.sin(this.floatTime * 1.8) * 9;
      const floatRot = Math.sin(this.floatTime * 1.2) * 1.2;

      // 2. Physics Springs Update
      const lift = this.liftSpring.update(dt);
      const tiltX = this.tiltXSpring.update(dt);
      const tiltY = this.tiltYSpring.update(dt);

      // Inertia after drag
      if (!this.isDragging && Math.abs(this.velocity) > 0.0001) {
        this.currentOffset += this.velocity;
        this.velocity *= 0.92;
      }

      // 3. Spontaneous Ambient Spin or Hover Spin
      const baseFrontOffset = 0.475;
      if (this.spinCycleStart > 0) {
        const elapsed = currentTime - this.spinCycleStart;
        const progress = Math.min(elapsed / this.options.spinDuration, 1.0);
        // EaseInOutCubic
        const ease = progress < 0.5 
          ? 4 * progress * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        this.currentOffset = baseFrontOffset + ease * 1.0;

        if (progress >= 1.0) {
          this.spinCycleStart = -1;
          this.currentOffset = baseFrontOffset;
          this.lastAmbientSpinTime = currentTime;
        }
      } else if (!this.isDragging) {
        // Check ambient spin trigger
        if (currentTime - this.lastAmbientSpinTime > this.options.ambientSpinInterval) {
          this.spinCycleStart = currentTime;
        }
      }

      // 4. Render 3D Label & Blit
      this.renderCanFrame(this.currentOffset);

      // 5. Apply dynamic 3D transform on the can card
      // Base diagonal pose matching the hero mockup: rotateZ around -11deg
      const baseRotZ = -11;
      const currentRotZ = baseRotZ + floatRot + (lift * 2);
      const currentPosY = floatY - (lift * 18);
      const currentScale = 1.0 + (lift * 0.05);

      this.canCard.style.transform = `
        translate3d(0, ${currentPosY.toFixed(2)}px, 0)
        rotateX(${tiltX.toFixed(2)}deg)
        rotateY(${tiltY.toFixed(2)}deg)
        rotateZ(${currentRotZ.toFixed(2)}deg)
        scale(${currentScale.toFixed(3)})
      `;

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }
}

// Global auto-mount on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('kallpa-hero-3d');
  if (container) {
    window.kallpaHeroCan = new HeroKallpaCan('kallpa-hero-3d');
    console.log('⚡ Hero Kallpa Can 3D (Hybrid Offscreen Engine) montado con éxito.');
  }
});
