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

  // Control de diapositiva sincronizada con el carrusel hero
  setSlide(slideIndex) {
    if (slideIndex < 0 || slideIndex >= this.labelMaterials.length) return;
    this.activeSlide = slideIndex;
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

/**
 * INTRO-KALLPA : Controller para la Lata Animada 2D en la Pantalla de Introducción
 * Renderiza la lata cilíndrica con rotación 3D en tiempo real (Offscreen WebGL Blitting),
 * gotas de condensación, resplandor solar y física de arrastre con inercia.
 */
export class IntroKallpaCan {
  constructor(containerId = 'intro-can-card', options = {}) {
    this.container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
    if (!this.container) return;

    const ds = this.container.dataset || {};
    this.options = Object.assign({
      baseCanUrl: ds.baseCan || 'assets/kalpa-can-clean.png',
      dropletsUrl: ds.droplets || 'assets/kalpa-can-droplets.png',
      labelUrl: ds.label || 'assets/kalpa-label.png',
      spinDuration: 2400,
      ambientSpinInterval: 6500
    }, options);

    this.renderer = new CanRenderer();
    this.labelMaterial = null;
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
    this.isPaused = window.scrollY > 20;
    this.rafId = null;

    this.initDOM();
    this.initLabel();
    this.bindEvents();
    if (!this.isPaused) {
      this.startLoop();
    }
  }

  initDOM() {
    // Reutilizar o inyectar elementos de las capas
    let baseImg = this.container.querySelector('.intro-can__base');
    if (!baseImg) {
      baseImg = document.createElement('img');
      baseImg.className = 'intro-can__base';
      baseImg.src = this.options.baseCanUrl;
      baseImg.alt = 'Lata KALPA Cold Brew 2D Animada';
      baseImg.loading = 'eager';
      baseImg.draggable = false;
      this.container.appendChild(baseImg);
    }
    this.baseImg = baseImg;

    let canvas = this.container.querySelector('.intro-can__canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.className = 'intro-can__canvas';
      canvas.width = 500;
      canvas.height = 1000;
      this.container.appendChild(canvas);
    }
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');

    let droplets = this.container.querySelector('.intro-can__droplets');
    if (!droplets) {
      droplets = document.createElement('img');
      droplets.className = 'intro-can__droplets';
      droplets.src = this.options.dropletsUrl;
      droplets.alt = '';
      droplets.draggable = false;
      this.container.appendChild(droplets);
    }
    this.dropletsImg = droplets;

    let flare = this.container.querySelector('.intro-can-flare');
    if (!flare) {
      flare = document.createElement('div');
      flare.className = 'intro-can-flare';
      this.container.appendChild(flare);
    }
    this.flare = flare;
  }

  initLabel() {
    this.labelMaterial = this.renderer.createLabelMaterial(this.options.labelUrl, () => {
      this.renderFrame(this.currentOffset);
    });
  }

  bindEvents() {
    const onPointerDown = (e) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      this.isDragging = true;
      this.dragStartX = e.clientX;
      this.dragStartOffset = this.currentOffset;
      this.lastPointerX = e.clientX;
      this.lastPointerTime = performance.now();
      this.container.classList.add('is-dragging');
    };

    const onPointerMove = (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.dragStartX;
      this.targetOffset = this.dragStartOffset + dx / 480;
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
      this.container.classList.remove('is-dragging');
    };

    this.container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  }

  renderFrame(offset) {
    if (!this.labelMaterial) return;
    this.renderer.render(this.labelMaterial, offset);
    this.renderer.blit(this.ctx, 500, 1000);
  }

  startLoop() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    let lastTime = performance.now();

    const loop = (currentTime) => {
      if (this.isPaused) return;

      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      // 1. Inercia tras arrastre manual
      if (!this.isDragging && Math.abs(this.velocity) > 0.0001) {
        this.currentOffset += this.velocity;
        this.velocity *= 0.92;
      }

      // 2. Rotación 360° ambiental periódica
      const baseFrontOffset = 0.475;
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

      // 3. Renderizado cilíndrico en el canvas
      this.renderFrame(this.currentOffset);

      this.rafId = requestAnimationFrame(loop);
    };

    this.rafId = requestAnimationFrame(loop);
  }

  pause() {
    this.isPaused = true;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  resume() {
    if (!this.isPaused) return;
    this.isPaused = false;
    this.startLoop();
  }

  destroy() {
    this.pause();
    if (this.renderer) this.renderer.destroy();
  }
}

// Auto-inicialización global en DOM Ready
function initAllKallpaCans() {
  // 1. Lata Animada 2D en la Pantalla de Introducción
  const introContainer = document.getElementById('intro-can-card');
  if (introContainer && !window.kallpaIntroCan) {
    window.kallpaIntroCan = new IntroKallpaCan(introContainer);
    console.log('⚡ Intro Kallpa 2D Animada montada con éxito.');
  }

  // 2. Lata Animada 2D en el Hero Principal (Modo 2D Animada)
  const heroContainer = document.getElementById('kallpa-hero-2d-anim');
  if (heroContainer && !window.kallpa2DAnim) {
    window.kallpa2DAnim = new HeroKallpaCan('kallpa-hero-2d-anim');
    console.log('⚡ Hero Kallpa 2D Animada (Offscreen Canvas) montado con éxito.');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAllKallpaCans);
} else {
  initAllKallpaCans();
}

