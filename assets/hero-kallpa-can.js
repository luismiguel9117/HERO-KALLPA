/**
 * HERO-KALLPA : Interactive 3D Cylindrical Hero Can Controller
 * Basado en la arquitectura híbrida 2D + 3D de alta fidelidad (Offscreen Blitting)
 * Adaptado del repositorio oficial https://github.com/luismiguel9117/Kallpa.git
 * Incluye física de seguimiento de cursor en la lata y granos de cacao, y switch 2D / 3D.
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

/**
 * Física de seguimiento de cursor para elementos de cacao en planos de profundidad
 */
class CacaoBeanPhysics {
  constructor(element) {
    this.element = element;
    this.depth = parseFloat(element.dataset.depth || '0.04');
    // Rigidez y amortiguación según la distancia de cámara (planos bokeh se desplazan más libremente)
    const stiffness = 38 + this.depth * 140;
    const damping = 10 + this.depth * 20;
    this.springX = new SpringValue(0, stiffness, damping);
    this.springY = new SpringValue(0, stiffness, damping);
    this.springTiltX = new SpringValue(0, 48, 12);
    this.springTiltY = new SpringValue(0, 48, 12);
  }

  updateTarget(normX, normY) {
    // Escala de desplazamiento por plano:
    // Foreground (depth ~0.09) -> hasta 35px
    // Midground (depth ~0.04) -> hasta 15px
    // Background (depth ~0.02) -> hasta 7px
    const distanceFactor = this.depth * 380;
    this.springX.target = normX * distanceFactor;
    this.springY.target = normY * distanceFactor;
    this.springTiltX.target = -normY * (this.depth * 95);
    this.springTiltY.target = normX * (this.depth * 95);
  }

  update(dt) {
    const x = this.springX.update(dt);
    const y = this.springY.update(dt);
    const rx = this.springTiltX.update(dt);
    const ry = this.springTiltY.update(dt);

    this.element.style.transform = `
      translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)
      rotateX(${rx.toFixed(2)}deg)
      rotateY(${ry.toFixed(2)}deg)
    `;
  }
}

export class HeroKallpaCan {
  constructor(containerId = 'kallpa-hero-2d-anim', options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    const ds = this.container.dataset || {};
    this.options = Object.assign({
      baseCanUrl: ds.baseCan || 'assets/kalpa-can-clean.png',
      dropletsUrl: ds.droplets || 'assets/kalpa-can-droplets.png',
      photo2dUrl: ds.photo2d || 'assets/kalpa-can-original.png',
      labels: [
        ds.labelOriginal || 'assets/kalpa-label.png',        // Slide 1: Original Cold Brew
        ds.labelGold || 'assets/kalpa-label-gold.png',       // Slide 2: Extracción 24H / Gold
        ds.labelCitrus || 'assets/kalpa-label-citrus.png'    // Slide 3: Energía Limpia / Citrus
      ],
      spinDuration: 2400, // ms for 360° turn
      ambientSpinInterval: 7500 // ms between spontaneous ambient rotations
    }, options);

    // Initial state: Always active interactive cylinder canvas
    this.mode = '3d'; // Interactive cylinder mode
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

    // Physical springs para la lata
    this.liftSpring = new SpringValue(0, 70, 11);
    this.tiltXSpring = new SpringValue(0, 55, 11);
    this.tiltYSpring = new SpringValue(0, 55, 11);
    this.moveXSpring = new SpringValue(0, 48, 11);
    this.moveYSpring = new SpringValue(0, 48, 11);
    this.floatTime = 0;

    // Elementos de cacao con física
    this.cacaoBeans = [];

    this.initDOM();
    this.initCacaoPhysics();
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
    this.canCard.className = 'hero-kallpa-can-card mode-3d';

    // Layer 1: Base can with metallic lid, rim, chime, and studio lighting
    this.baseImg = document.createElement('img');
    this.baseImg.className = 'hero-kallpa-can__base';
    this.baseImg.src = this.options.baseCanUrl;
    this.baseImg.alt = 'Lata KALPA Cold Brew 2D Animada';
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

  initCacaoPhysics() {
    // Si ya existe la escena 3D controlando el parallax del cacao, evitar conflicto
    if (window.kallpa3D) return;
    const beanElements = document.querySelectorAll('.cacao-bean');
    this.cacaoBeans = Array.from(beanElements).map(el => new CacaoBeanPhysics(el));
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
    // Pointer move across window for magnetic 3D perspective & cacao beans tracking
    window.addEventListener('pointermove', (e) => {
      this.cursorNormX = (e.clientX / window.innerWidth - 0.5) * 2;
      this.cursorNormY = (e.clientY / window.innerHeight - 0.5) * 2;

      // Seguimiento magnético de la lata
      this.tiltXSpring.target = -this.cursorNormY * 9;  // degrees
      this.tiltYSpring.target = this.cursorNormX * 12;  // degrees
      this.moveXSpring.target = this.cursorNormX * 24;  // px
      this.moveYSpring.target = this.cursorNormY * 20;  // px

      // Aplicar seguimiento de cursor idéntico a todos los elementos flotantes de cacao
      if (this.cacaoBeans && this.cacaoBeans.length) {
        this.cacaoBeans.forEach(b => b.updateTarget(this.cursorNormX, this.cursorNormY));
      }
    }, { passive: true });

    // Cuando el cursor sale de la pantalla, regresar suavemente a posición de reposo
    window.addEventListener('pointerleave', () => {
      this.cursorNormX = 0;
      this.cursorNormY = 0;
      this.tiltXSpring.target = 0;
      this.tiltYSpring.target = 0;
      this.moveXSpring.target = 0;
      this.moveYSpring.target = 0;
      if (this.cacaoBeans && this.cacaoBeans.length) {
        this.cacaoBeans.forEach(b => b.updateTarget(0, 0));
      }
    });

    // Hover on can card
    this.canCard.addEventListener('pointerenter', () => {
      this.liftSpring.target = 1.0;
      if (this.mode === '3d' && this.spinCycleStart < 0) {
        this.spinCycleStart = performance.now();
      }
    });

    this.canCard.addEventListener('pointerleave', () => {
      this.liftSpring.target = 0.0;
    });

    // Drag to spin horizontally (solo activo en modo 3D)
    const onPointerDown = (e) => {
      if (this.mode !== '3d') return;
      this.isDragging = true;
      this.dragStartX = e.clientX;
      this.dragStartOffset = this.currentOffset;
      this.lastPointerX = e.clientX;
      this.lastPointerTime = performance.now();
      this.canCard.classList.add('is-dragging');
    };

    const onPointerMove = (e) => {
      if (!this.isDragging || this.mode !== '3d') return;
      const dx = e.clientX - this.dragStartX;
      this.targetOffset = this.dragStartOffset + dx / 500;
      this.currentOffset = this.targetOffset;

      const now = performance.now();
      const dt = Math.max(1, now - this.lastPointerTime);
      this.velocity = ((e.clientX - this.lastPointerX) / dt) * 0.003;
      this.lastPointerX = e.clientX;
      this.lastPointerTime = now;
      this.spinCycleStart = -1;
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

  bindSwitchEvents() {
    const btn2d = document.getElementById('btn-dim-2d');
    const btn3d = document.getElementById('btn-dim-3d');
    const switchEl = document.getElementById('kalpa-dimension-switch');

    if (btn2d) {
      btn2d.addEventListener('click', () => this.setMode('2d'));
    }
    if (btn3d) {
      btn3d.addEventListener('click', () => this.setMode('3d'));
    }
    if (switchEl) {
      switchEl.addEventListener('click', (e) => {
        const btn = e.target.closest('.dim-switch-btn');
        if (btn && btn.dataset.mode) {
          this.setMode(btn.dataset.mode);
        }
      });
    }
  }

  setMode(newMode) {
    if (newMode !== '2d' && newMode !== '3d') return;
    this.mode = newMode;

    const switchEl = document.getElementById('kalpa-dimension-switch');
    const btn2d = document.getElementById('btn-dim-2d');
    const btn3d = document.getElementById('btn-dim-3d');

    if (switchEl) switchEl.setAttribute('data-active', newMode);
    if (btn2d) {
      btn2d.classList.toggle('is-active', newMode === '2d');
      btn2d.setAttribute('aria-checked', newMode === '2d');
    }
    if (btn3d) {
      btn3d.classList.toggle('is-active', newMode === '3d');
      btn3d.setAttribute('aria-checked', newMode === '3d');
    }

    if (newMode === '2d') {
      this.canCard.classList.remove('mode-3d');
      this.canCard.classList.add('mode-2d');
      this.isDragging = false;
      this.canCard.classList.remove('is-dragging');
      this.targetOffset = 0.475;
      this.currentOffset = 0.475;
      this.spinCycleStart = -1;
    } else {
      this.canCard.classList.remove('mode-2d');
      this.canCard.classList.add('mode-3d');
      // Giro de bienvenida 360° al pasar a 3D
      this.spinCycleStart = performance.now();
      this.lastAmbientSpinTime = performance.now();
    }
  }

  setSlide(slideIndex) {
    if (slideIndex < 0 || slideIndex >= this.labelMaterials.length) return;
    this.activeSlide = slideIndex;
    if (this.mode === '3d') {
      this.spinCycleStart = performance.now();
    }
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

      // 1. Levitación sinusoidal orgánica
      const floatY = Math.sin(this.floatTime * 1.8) * 9;
      const floatRot = Math.sin(this.floatTime * 1.2) * 1.2;

      // 2. Actualización de Resortes Físicos de la lata
      const lift = this.liftSpring.update(dt);
      const tiltX = this.tiltXSpring.update(dt);
      const tiltY = this.tiltYSpring.update(dt);
      const moveX = this.moveXSpring.update(dt);
      const moveY = this.moveYSpring.update(dt);

      // 3. Actualización de Resortes Físicos de los Elementos de Cacao (Seguimiento de cursor sincronizado)
      if (this.cacaoBeans && this.cacaoBeans.length) {
        this.cacaoBeans.forEach(bean => bean.update(dt));
      }

      // Inercia tras arrastre manual (solo modo 3D)
      if (this.mode === '3d' && !this.isDragging && Math.abs(this.velocity) > 0.0001) {
        this.currentOffset += this.velocity;
        this.velocity *= 0.92;
      }

      // 4. Rotación 360° en modo 3D
      const baseFrontOffset = 0.475;
      if (this.mode === '3d') {
        if (this.spinCycleStart > 0) {
          const elapsed = currentTime - this.spinCycleStart;
          const progress = Math.min(elapsed / this.options.spinDuration, 1.0);
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
          if (currentTime - this.lastAmbientSpinTime > this.options.ambientSpinInterval) {
            this.spinCycleStart = currentTime;
          }
        }

        // Renderizado del Canvas 3D
        this.renderCanFrame(this.currentOffset);
      }

      // 5. Aplicar Transformación Dinámica en la Lata (Tilt + Seguimiento Magnético + Levitación)
      const baseRotZ = -11;
      const currentRotZ = baseRotZ + floatRot + (lift * 2);
      const currentPosY = floatY - (lift * 18);
      const currentScale = 1.0 + (lift * 0.05);

      this.canCard.style.transform = `
        translate3d(${moveX.toFixed(2)}px, ${(currentPosY + moveY).toFixed(2)}px, 0)
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
  const container = document.getElementById('kallpa-hero-2d-anim');
  if (container) {
    window.kallpa2DAnim = new HeroKallpaCan('kallpa-hero-2d-anim');
    console.log('⚡ Hero Kallpa 2D Animada (Offscreen Canvas) montado con éxito.');
  }
});
