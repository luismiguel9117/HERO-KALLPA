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
      baseCanUrl: ds.baseCan || 'assets/kalpa-can-base.png',
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
    this.currentOffset = 0.493; // Front logo KALPA
    this.targetOffset = 0.493;
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

    // Layer 0 (Behind Can): Focused coffee beans & ice cubes splash (Capa 3)
    this.compBackImg = document.createElement('img');
    this.compBackImg.className = 'hero-can-comp hero-can-comp__back';
    this.compBackImg.src = 'assets/hero-beans-ice-back.png';
    this.compBackImg.alt = '';
    this.compBackImg.draggable = false;

    // Interactive card container (Lata 2D Animada Cilíndrica)
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

    // Layer 3.5: Photorealistic aluminum lid & base chime rims (commit 6e46cb5)
    this.rimsImg = document.createElement('img');
    this.rimsImg.className = 'hero-kallpa-can__rims';
    this.rimsImg.src = 'assets/kalpa-can-rims.png';
    this.rimsImg.alt = '';
    this.rimsImg.draggable = false;

    // Layer 4 (Mid-Front): Focused coffee beans & ice cubes around lower can (Capa 2 copia 2)
    this.compMidImg = document.createElement('img');
    this.compMidImg.className = 'hero-can-comp hero-can-comp__mid';
    this.compMidImg.src = 'assets/hero-beans-ice-front.png';
    this.compMidImg.alt = '';
    this.compMidImg.draggable = false;

    // Layer 5 (Front Bean): Single sharp coffee bean overlapping right side of can (Capa 4)
    this.compSingleBeanImg = document.createElement('img');
    this.compSingleBeanImg.className = 'hero-can-comp hero-can-comp__bean-single';
    this.compSingleBeanImg.src = 'assets/hero-bean-single.png';
    this.compSingleBeanImg.alt = '';
    this.compSingleBeanImg.draggable = false;

    // Layer 6 (Foreground Base): Volcanic rock pedestal with ice and coffee beans (Capa 2 copia)
    this.compRockImg = document.createElement('img');
    this.compRockImg.className = 'hero-can-comp hero-can-comp__rock';
    this.compRockImg.src = 'assets/hero-rock-base.png';
    this.compRockImg.alt = '';
    this.compRockImg.draggable = false;

    // Assemble layers
    this.canCard.appendChild(this.baseImg);
    this.canCard.appendChild(this.canvas);
    this.canCard.appendChild(this.dropletsImg);
    this.canCard.appendChild(this.rimsImg);

    this.wrapper.appendChild(this.compBackImg);
    this.wrapper.appendChild(this.canCard);
    this.wrapper.appendChild(this.compMidImg);
    this.wrapper.appendChild(this.compSingleBeanImg);
    this.wrapper.appendChild(this.compRockImg);
    this.container.appendChild(this.wrapper);
  }

  initCacaoPhysics() {
    // Si ya existe la escena 3D controlando el parallax del cacao, evitar conflicto
    if (window.kallpa3D) return;
    const beanElements = document.querySelectorAll('.cacao-bean');
    this.cacaoBeans = Array.from(beanElements).map(el => new CacaoBeanPhysics(el));
  }

  initLabels() {
    this.isBaseLoaded = false;
    this.isDropletsLoaded = false;
    this.isLabelReady = false;

    const waitImg = (img, onDone) => {
      if (!img) { onDone(); return; }
      if (img.complete && img.naturalWidth > 0) {
        onDone();
      } else {
        img.addEventListener('load', onDone, { once: true });
        img.addEventListener('error', onDone, { once: true });
      }
    };

    waitImg(this.baseImg, () => {
      this.isBaseLoaded = true;
      this.checkReady();
    });

    waitImg(this.dropletsImg, () => {
      this.isDropletsLoaded = true;
      this.checkReady();
    });

    this.labelMaterials = this.options.labels.map((url, idx) => {
      const matObj = this.renderer.createLabelMaterial(url, () => {
        if (idx === this.activeSlide) {
          this.isLabelReady = true;
          this.renderCanFrame(this.currentOffset);
          this.checkReady();
        }
      });
      return matObj;
    });
  }

  checkReady() {
    if (this.isBaseLoaded && this.isDropletsLoaded && this.isLabelReady && this.canCard) {
      this.renderCanFrame(this.currentOffset);
      this.canCard.classList.add('is-ready');
    }
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
    if (!activeLabelObj || !activeLabelObj.isLoaded) return;

    if (this.renderer.render(activeLabelObj, offset)) {
      this.renderer.blit(this.ctx, 500, 1000);
    }
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
      const baseFrontOffset = 0.493;
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

      // 5. Aplicar Transformación Dinámica en la Lata (Tilt +15° horario como el diseño + Seguimiento Magnético + Levitación)
      const baseRotZ = 15;
      const currentRotZ = baseRotZ + floatRot + (lift * 1.8);
      const currentPosY = floatY - (lift * 14);
      const currentScale = 1.0 + (lift * 0.04);

      this.canCard.style.transform = `
        translate3d(${moveX.toFixed(2)}px, ${(currentPosY + moveY).toFixed(2)}px, 0)
        rotateX(${tiltX.toFixed(2)}deg)
        rotateY(${tiltY.toFixed(2)}deg)
        rotateZ(${currentRotZ.toFixed(2)}deg)
        scale(${currentScale.toFixed(3)})
      `;

      // Parallax sutil sincronizado en las capas de hielos, granos y piedra volcánica
      if (this.compBackImg) {
        this.compBackImg.style.transform = `translate3d(${(moveX * 0.55).toFixed(2)}px, ${(moveY * 0.55 - floatY * 0.35).toFixed(2)}px, 0)`;
      }
      if (this.compMidImg) {
        this.compMidImg.style.transform = `translate3d(${(moveX * 0.85).toFixed(2)}px, ${(moveY * 0.85 + floatY * 0.45).toFixed(2)}px, 0)`;
      }
      if (this.compSingleBeanImg) {
        this.compSingleBeanImg.style.transform = `translate3d(${(moveX * 1.05).toFixed(2)}px, ${(currentPosY * 0.7 + moveY * 1.05).toFixed(2)}px, 0) rotate(${(floatRot * 1.5).toFixed(2)}deg)`;
      }
      if (this.compRockImg) {
        this.compRockImg.style.transform = `translate3d(${(moveX * 0.25).toFixed(2)}px, ${(moveY * 0.15).toFixed(2)}px, 0)`;
      }

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }
}

/**
 * GENERADOR DE ELECTRICIDAD PROCEDURAL 3D PARA LA LATA KALLPA
 * Basado en el motor de arcos y descargas eléctricas del proyecto Animación
 * - 4 arcos asíncronos concurrentes con vidas útiles escalonadas.
 * - Cobertura 360°: Corona superior, descargas basales, envolturas diagonales y flancos laterales.
 * - Doble capa volumétrica: Capa 0 (detrás de la lata) y Capa 1 (delante de la lata).
 * - Trazo triple: Resplandor ambiental (#FFD500), trazo dorado de alta energía y núcleo blanco puro.
 */
const createRng = (seed) => {
  let s = seed | 0;
  return () => {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export class CanElectricArc {
  constructor(slotId, startDelay = 0) {
    this.slotId = slotId;
    this.t0 = performance.now() + startDelay;
    this.duration = 1350 + Math.random() * 450;
    this.seed = Math.floor(Math.random() * 100000);
    this.zone = slotId % 6;
    this.buildPath();
  }

  reset(now, nextZone) {
    this.t0 = now;
    this.duration = 1300 + Math.random() * 450;
    this.seed = Math.floor(Math.random() * 100000);
    this.zone = nextZone != null ? nextZone : Math.floor(Math.random() * 6);
    this.buildPath();
  }

  buildPath() {
    const z = this.zone;
    const r = createRng(this.seed);
    let waypoints = [];

    if (z === 0) {
      // Corona superior (Chispas ascendentes desde la tapa hacia el cielo)
      const side = r() > 0.5 ? 1 : -1;
      waypoints = [
        { u: side * (0.20 + r() * 0.20), v: -0.78 + r() * 0.06, z: 0.2 },
        { u: side * (0.42 + r() * 0.18), v: -0.88 - r() * 0.12, z: -0.2 },
        { u: side * (0.62 + r() * 0.22), v: -1.05 - r() * 0.22, z: -0.6 },
        { u: side * (0.85 + r() * 0.30), v: -1.22 - r() * 0.35, z: -0.9 }
      ];
    } else if (z === 1) {
      // Descarga basal inferior (Chispas descendentes hacia la base)
      const side = r() > 0.5 ? 1 : -1;
      waypoints = [
        { u: side * (0.18 + r() * 0.22), v: 0.78 + r() * 0.06, z: 0.3 },
        { u: side * (0.38 + r() * 0.22), v: 0.92 + r() * 0.10, z: 0.1 },
        { u: side * (0.58 + r() * 0.25), v: 1.08 + r() * 0.18, z: -0.4 },
        { u: side * (0.75 + r() * 0.30), v: 1.25 + r() * 0.28, z: -0.8 }
      ];
    } else if (z === 2) {
      // Envoltura diagonal descendente (Atrás -> Delante -> Atrás adaptado a lata slim)
      const dir = r() > 0.5 ? 1 : -1;
      waypoints = [
        { u: -dir * (0.68 + r() * 0.10), v: -0.62 - r() * 0.15, z: -0.7 },
        { u: -dir * (0.38 + r() * 0.12), v: -0.32 + r() * 0.12, z: -0.1 },
        { u: 0.0 + (r() - 0.5) * 0.20, v: 0.0 + (r() - 0.5) * 0.16, z: 0.8 },
        { u: dir * (0.42 + r() * 0.12), v: 0.35 + r() * 0.12, z: 0.2 },
        { u: dir * (0.70 + r() * 0.10), v: 0.65 + r() * 0.15, z: -0.6 }
      ];
    } else if (z === 3) {
      // Envoltura diagonal ascendente (Atrás -> Delante -> Atrás adaptado a lata slim)
      const dir = r() > 0.5 ? 1 : -1;
      waypoints = [
        { u: -dir * (0.70 + r() * 0.10), v: 0.60 + r() * 0.15, z: -0.6 },
        { u: -dir * (0.38 + r() * 0.12), v: 0.26 + r() * 0.12, z: 0.2 },
        { u: 0.03 * dir, v: -0.04 + (r() - 0.5) * 0.16, z: 0.9 },
        { u: dir * (0.42 + r() * 0.12), v: -0.35 + r() * 0.12, z: 0.1 },
        { u: dir * (0.70 + r() * 0.10), v: -0.68 + r() * 0.15, z: -0.7 }
      ];
    } else if (z === 4) {
      // Flanco lateral izquierdo ceñido al contorno de la nueva lata slim
      waypoints = [
        { u: -0.64 - r() * 0.08, v: -0.52 + r() * 0.12, z: -0.3 },
        { u: -0.70 - r() * 0.08, v: -0.14 + r() * 0.12, z: 0.2 },
        { u: -0.69 - r() * 0.08, v: 0.20 + r() * 0.12, z: 0.4 },
        { u: -0.65 - r() * 0.08, v: 0.58 + r() * 0.12, z: -0.2 }
      ];
    } else {
      // Flanco lateral derecho ceñido al contorno de la nueva lata slim
      waypoints = [
        { u: 0.64 + r() * 0.08, v: -0.50 + r() * 0.12, z: -0.3 },
        { u: 0.70 + r() * 0.08, v: -0.10 + r() * 0.12, z: 0.2 },
        { u: 0.69 + r() * 0.08, v: 0.22 + r() * 0.12, z: 0.4 },
        { u: 0.65 + r() * 0.08, v: 0.60 + r() * 0.12, z: -0.2 }
      ];
    }

    const pts = [];
    for (let i = 0; i < waypoints.length - 1; i++) {
      const p1 = waypoints[i];
      const p2 = waypoints[i + 1];
      const segs = 8 + Math.floor(r() * 4);
      const dx = p2.u - p1.u, dy = p2.v - p1.v, dz = p2.z - p1.z;
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len, ny = dx / len;

      for (let s = 0; s <= segs; s++) {
        if (i > 0 && s === 0) continue;
        const t = s / segs;
        const env = Math.sin(t * Math.PI);
        const harmonic = Math.sin(t * Math.PI * 6 + r() * 6) * 0.05 * env;
        const sharpJitter = (r() - 0.5) * 0.11 * env;
        const jitterAmp = harmonic + sharpJitter;

        const u = p1.u + dx * t + nx * jitterAmp;
        const v = p1.v + dy * t + ny * jitterAmp;
        const z = p1.z + dz * t;
        pts.push({ u, v, z });
      }
    }
    this.points = pts;

    // Sub-ramas de alta tensión
    this.branches = [];
    const numBranches = r() > 0.4 ? (r() > 0.7 ? 2 : 1) : 0;
    for (let b = 0; b < numBranches; b++) {
      const forkIdx = Math.floor(pts.length * (0.28 + r() * 0.42));
      const forkPt = pts[forkIdx];
      const nextPt = pts[Math.min(pts.length - 1, forkIdx + 1)];
      const bdx = nextPt.u - forkPt.u, bdy = nextPt.v - forkPt.v;
      const angle = Math.atan2(bdy, bdx) + (r() > 0.5 ? 0.65 : -0.65) + (r() - 0.5) * 0.25;
      const branchLen = (0.22 + r() * 0.25);
      const bSegs = 5 + Math.floor(r() * 3);
      const bPts = [{ u: forkPt.u, v: forkPt.v, z: forkPt.z }];

      for (let s = 1; s <= bSegs; s++) {
        const bt = s / bSegs;
        const dist = branchLen * bt;
        const jit = (r() - 0.5) * 0.07 * Math.sin(bt * Math.PI);
        const bu = forkPt.u + Math.cos(angle) * dist - Math.sin(angle) * jit;
        const bv = forkPt.v + Math.sin(angle) * dist + Math.cos(angle) * jit;
        bPts.push({ u: bu, v: bv, z: forkPt.z });
      }
      this.branches.push({
        forkFrac: forkIdx / (pts.length - 1),
        points: bPts
      });
    }
  }

  render(ctx, targetLayer, now, cx, cy, canW, canH) {
    const elapsed = now - this.t0;
    if (elapsed < 0) return;
    const prog = elapsed / this.duration;
    if (prog >= 1.0) {
      this.reset(now + Math.random() * 120);
      return;
    }

    const head = Math.min(1, prog / 0.65);
    const tail = prog < 0.36 ? 0 : Math.min(1, (prog - 0.36) / 0.64);
    if (tail >= head) return;

    const fadeIn = Math.min(1, elapsed / 60);
    const fadeOut = prog < 0.72 ? 1.0 : Math.max(0, (1.0 - prog) / 0.28);
    const pulse = 1.0 + 0.14 * Math.sin(now * 0.025 + this.seed);
    const curAlpha = Math.min(1, fadeIn * fadeOut * pulse);
    if (curAlpha <= 0.01) return;

    const totalPts = this.points.length;
    const startIdx = Math.max(0, Math.floor(tail * (totalPts - 1)));
    const endIdx = Math.min(totalPts - 1, Math.ceil(head * (totalPts - 1)));
    if (endIdx <= startIdx) return;

    this.renderSegmentList(ctx, targetLayer, this.points, startIdx, endIdx, curAlpha, cx, cy, canW, canH, 1.0);

    for (const br of this.branches) {
      if (head >= br.forkFrac && tail < br.forkFrac + 0.25) {
        const brProg = Math.min(1, (head - br.forkFrac) / 0.22);
        const brTail = tail < br.forkFrac ? 0 : Math.min(1, (tail - br.forkFrac) / 0.25);
        const brEndIdx = Math.min(br.points.length - 1, Math.ceil(brProg * (br.points.length - 1)));
        const brStartIdx = Math.max(0, Math.floor(brTail * (br.points.length - 1)));
        if (brEndIdx > brStartIdx) {
          this.renderSegmentList(ctx, targetLayer, br.points, brStartIdx, brEndIdx, curAlpha * 0.88, cx, cy, canW, canH, 0.75);
        }
      }
    }
  }

  renderSegmentList(ctx, targetLayer, ptsList, startIdx, endIdx, alpha, cx, cy, canW, canH, scaleWidth) {
    const halfW = canW * 0.5;
    const halfH = canH * 0.5;

    let currentRun = [];
    for (let i = startIdx; i < endIdx; i++) {
      const p1 = ptsList[i];
      const p2 = ptsList[i + 1];
      const avgZ = (p1.z + p2.z) * 0.5;
      const isTarget = targetLayer === 0 ? (avgZ < 0.05) : (avgZ >= 0.05);

      if (isTarget) {
        if (currentRun.length === 0) {
          currentRun.push({ x: cx + p1.u * halfW, y: cy + p1.v * halfH });
        }
        currentRun.push({ x: cx + p2.u * halfW, y: cy + p2.v * halfH });
      } else {
        if (currentRun.length > 1) {
          this.strokePath(ctx, currentRun, alpha, scaleWidth);
        }
        currentRun = [];
      }
    }

    if (currentRun.length > 1) {
      this.strokePath(ctx, currentRun, alpha, scaleWidth);
    }
  }

  strokePath(ctx, path, alpha, scaleWidth) {
    if (path.length < 2) return;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'miter';
    ctx.miterLimit = 3;

    // 1. Resplandor Amarillo Ambiental (#FFD500)
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) ctx.lineTo(path[i].x, path[i].y);
    ctx.strokeStyle = `rgba(255, 213, 0, ${(0.26 * alpha).toFixed(3)})`;
    ctx.lineWidth = 6.0 * scaleWidth;
    ctx.stroke();

    // 2. Trazo Dorado de Alta Energía (#FFD500)
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) ctx.lineTo(path[i].x, path[i].y);
    ctx.strokeStyle = `rgba(255, 213, 0, ${(0.94 * alpha).toFixed(3)})`;
    ctx.lineWidth = 2.2 * scaleWidth;
    ctx.stroke();

    // 3. Núcleo Blanco Puro Incandescente
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) ctx.lineTo(path[i].x, path[i].y);
    ctx.strokeStyle = `rgba(255, 255, 255, ${(0.96 * alpha).toFixed(3)})`;
    ctx.lineWidth = 1.1 * scaleWidth;
    ctx.stroke();

    ctx.restore();
  }
}

export class CanElectricEngine {
  constructor() {
    this.arcs = [
      new CanElectricArc(0, 0),
      new CanElectricArc(1, 380),
      new CanElectricArc(2, 760),
      new CanElectricArc(3, 1140)
    ];
  }

  render(ctx, targetLayer, now, cx, cy, canW, canH) {
    for (const arc of this.arcs) {
      arc.render(ctx, targetLayer, now, cx, cy, canW, canH);
    }
  }
}

/**
 * INTRO-KALLPA : Controller para la Lata Animada 2D en la Pantalla de Introducción
 * Renderiza la lata cilíndrica con rotación 3D en tiempo real (Offscreen WebGL Blitting),
 * efecto de electricidad procedural volumétrica 3D, gotas de condensación y física interactiva.
 */
export class IntroKallpaCan {
  constructor(containerId = 'intro-can-card', options = {}) {
    this.container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
    if (!this.container) return;

    const ds = this.container.dataset || {};
    this.options = Object.assign({
      baseCanUrl: ds.baseCan || 'assets/kalpa-can-base.png',
      dropletsUrl: ds.droplets || 'assets/kalpa-can-droplets.png',
      labelUrl: ds.label || 'assets/kalpa-label.png',
      spinDuration: 2400,
      ambientSpinInterval: 6500
    }, options);

    this.renderer = new CanRenderer();
    this.electricEngine = new CanElectricEngine();

    this.labelMaterial = null;
    this.currentOffset = 0.493; // Front logo KALPA
    this.targetOffset = 0.493;
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
    this.initElectricCanvases();
    this.initLabel();
    this.bindEvents();
    if (!this.isPaused) {
      this.startLoop();
    }
  }

  initDOM() {
    // 0. Capa trasera de electricidad
    let backCanvas = this.container.querySelector('.intro-can__electric-back');
    if (!backCanvas) {
      backCanvas = document.createElement('canvas');
      backCanvas.className = 'intro-can__electric-back';
      this.container.appendChild(backCanvas);
    }
    this.electricBackCanvas = backCanvas;

    // 1. Base metálica
    let baseImg = this.container.querySelector('.intro-can__base');
    if (!baseImg) {
      baseImg = document.createElement('img');
      baseImg.className = 'intro-can__base';
      baseImg.loading = 'eager';
      baseImg.draggable = false;
      this.container.appendChild(baseImg);
    }
    baseImg.src = this.options.baseCanUrl;
    baseImg.alt = 'Lata KALPA Cold Brew 2D Animada';
    this.baseImg = baseImg;

    // 2. Canvas 3D de la etiqueta cilíndrica
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

    // 3. Gotas de condensación
    let droplets = this.container.querySelector('.intro-can__droplets');
    if (!droplets) {
      droplets = document.createElement('img');
      droplets.className = 'intro-can__droplets';
      droplets.alt = '';
      droplets.draggable = false;
      this.container.appendChild(droplets);
    }
    droplets.src = this.options.dropletsUrl;
    this.dropletsImg = droplets;

    // 3.5 Tapa y aro de aluminio fotográfico (commit 6e46cb5)
    let rims = this.container.querySelector('.intro-can__rims');
    if (!rims) {
      rims = document.createElement('img');
      rims.className = 'intro-can__rims';
      rims.loading = 'eager';
      rims.draggable = false;
      this.container.appendChild(rims);
    }
    rims.src = 'assets/kalpa-can-rims.png';
    rims.alt = '';
    this.rimsImg = rims;

    // 4. Capa frontal de electricidad
    let frontCanvas = this.container.querySelector('.intro-can__electric-front');
    if (!frontCanvas) {
      frontCanvas = document.createElement('canvas');
      frontCanvas.className = 'intro-can__electric-front';
      this.container.appendChild(frontCanvas);
    }
    this.electricFrontCanvas = frontCanvas;

    // 5. Destello solar
    let flare = this.container.querySelector('.intro-can-flare');
    if (!flare) {
      flare = document.createElement('div');
      flare.className = 'intro-can-flare';
      this.container.appendChild(flare);
    }
    this.flare = flare;
  }

  initElectricCanvases() {
    this.backCtx = this.electricBackCanvas ? this.electricBackCanvas.getContext('2d') : null;
    this.frontCtx = this.electricFrontCanvas ? this.electricFrontCanvas.getContext('2d') : null;
    this.resizeElectricCanvases();
    window.addEventListener('resize', () => this.resizeElectricCanvases());
  }

  resizeElectricCanvases() {
    const rect = this.container.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.cssCanW = rect.width || 200;
    this.cssCanH = rect.height || 400;
    this.cssW = this.cssCanW * 1.7;
    this.cssH = this.cssCanH * 1.5;

    if (this.electricBackCanvas) {
      this.electricBackCanvas.width = Math.round(this.cssW * dpr);
      this.electricBackCanvas.height = Math.round(this.cssH * dpr);
    }
    if (this.electricFrontCanvas) {
      this.electricFrontCanvas.width = Math.round(this.cssW * dpr);
      this.electricFrontCanvas.height = Math.round(this.cssH * dpr);
    }
  }

  initLabel() {
    this.isBaseLoaded = false;
    this.isDropletsLoaded = false;
    this.isLabelReady = false;

    const waitImg = (img, onDone) => {
      if (!img) { onDone(); return; }
      if (img.complete && img.naturalWidth > 0) {
        onDone();
      } else {
        img.addEventListener('load', onDone, { once: true });
        img.addEventListener('error', onDone, { once: true });
      }
    };

    waitImg(this.baseImg, () => {
      this.isBaseLoaded = true;
      this.checkReady();
    });

    waitImg(this.dropletsImg, () => {
      this.isDropletsLoaded = true;
      this.checkReady();
    });

    this.labelMaterial = this.renderer.createLabelMaterial(this.options.labelUrl, () => {
      this.isLabelReady = true;
      this.renderFrame(this.currentOffset);
      this.checkReady();
    });
  }

  checkReady() {
    if (this.isBaseLoaded && this.isDropletsLoaded && this.isLabelReady && this.container) {
      this.resizeElectricCanvases();
      this.renderFrame(this.currentOffset);
      this.renderElectricity(performance.now());
      this.container.classList.add('is-ready');
    }
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
    if (!this.labelMaterial || !this.labelMaterial.isLoaded) return;
    if (this.renderer.render(this.labelMaterial, offset)) {
      this.renderer.blit(this.ctx, 500, 1000);
    }
  }

  renderElectricity(currentTime) {
    if (!this.electricEngine) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = this.cssW;
    const H = this.cssH;
    const canW = this.cssCanW;
    const canH = this.cssCanH;
    const cx = W / 2;
    const cy = H / 2;

    // Capa 0: Arcos detrás de la lata
    if (this.backCtx) {
      this.backCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.backCtx.clearRect(0, 0, W, H);
      this.electricEngine.render(this.backCtx, 0, currentTime, cx, cy, canW, canH);
    }

    // Capa 1: Arcos por delante de la lata
    if (this.frontCtx) {
      this.frontCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.frontCtx.clearRect(0, 0, W, H);
      this.electricEngine.render(this.frontCtx, 1, currentTime, cx, cy, canW, canH);
    }
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
      const baseFrontOffset = 0.493;
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

      // 3. Renderizado cilíndrico en el canvas de la lata
      this.renderFrame(this.currentOffset);

      // 4. Renderizado procedural de rayos y electricidad 3D envolvente
      this.renderElectricity(currentTime);

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
    // Limpiar canvas para liberar GPU
    if (this.backCtx && this.cssW && this.cssH) {
      this.backCtx.clearRect(0, 0, this.cssW, this.cssH);
    }
    if (this.frontCtx && this.cssW && this.cssH) {
      this.frontCtx.clearRect(0, 0, this.cssW, this.cssH);
    }
  }

  resume() {
    if (!this.isPaused) return;
    this.isPaused = false;
    this.resizeElectricCanvases();
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

