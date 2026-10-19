/**
 * HERO-KALLPA : Cinematic Parallax Intro Controller (Osmo Parallax Engine)
 * Capas de profundidad: Cielo, Cancha, Tipografía, Mano y Lata
 * Animación de Referencia (Osmo):
 *  1. Inicio: Pantalla nítida y brillante con la escena completa (cielo, cancha, mano, lata y textos).
 *  2. Scroll: Un bloque negro sólido asciende desde la base cubriendo la pantalla hacia arriba.
 *  3. Upward Parallax: La mano y la lata suben acompañando el ascenso hacia el cielo.
 *  4. Transición a la web: Cuando la pantalla está por ponerse toda en negro (progress > 85%),
 *     la web aparece suavemente (Announcement Bar, Navbar y Hero 3D).
 */

(function() {
  'use strict';

  class KalpaIntroController {
    constructor() {
      this.container = document.getElementById('kalpa-intro-section');
      this.sticky = document.getElementById('kalpa-intro-sticky');
      this.visuals = document.getElementById('kalpa-intro-visuals');
      if (!this.container || !this.sticky || !this.visuals) return;

      this.layerCielo = this.container.querySelector('.intro-layer--cielo');
      this.layerCancha = this.container.querySelector('.intro-layer--cancha');
      this.layerContent = this.container.querySelector('.intro-layer--content');
      this.layerMano = this.container.querySelector('.intro-layer--mano');
      this.layerLata = this.container.querySelector('.intro-layer--lata');

      this.innerCielo = this.container.querySelector('.intro-img--cielo');
      this.innerCancha = this.container.querySelector('.intro-img--cancha');
      this.innerContent = this.container.querySelector('.intro-content-wrap');
      this.innerMano = this.container.querySelector('.intro-img--mano');
      this.innerLata = document.getElementById('intro-can-card');

      this.risingBlack = document.getElementById('intro-rising-black');
      this.devControlPanel = document.getElementById('dev-control-panel');

      this.scrollHint = document.getElementById('intro-scroll-hint');
      this.btnEnter = document.getElementById('btn-intro-enter');

      // Coordenadas de mouse normalizadas (-1 a 1)
      this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
      this.clock = 0;
      this.rafId = null;

      // Estado de transición
      this.isTransitioning = false;
      this.isFinished = false;

      // Si la página ya está scrolleada, omitir intro
      if (window.scrollY > 20) {
        this.container.style.display = 'none';
        document.body.classList.add('web-revealed');
        this.isFinished = true;
        if (window.kallpaIntroCan && typeof window.kallpaIntroCan.pause === 'function') {
          window.kallpaIntroCan.pause();
        }
        return;
      }

      this.bindEvents();
      this.startLoop();
    }

    bindEvents() {
      // 1. Seguimiento de cursor en la pantalla para efecto de profundidad en las capas
      window.addEventListener('pointermove', (e) => {
        if (this.isTransitioning || this.isFinished) return;
        this.mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
        this.mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
      }, { passive: true });

      window.addEventListener('pointerleave', () => {
        this.mouse.targetX = 0;
        this.mouse.targetY = 0;
      });

      // 2. Detección inmediata de cualquier intento de scroll con la rueda (Wheel)
      window.addEventListener('wheel', (e) => {
        if (this.isTransitioning || this.isFinished) return;
        if (e.deltaY > 0) {
          this.transitionToWeb();
        }
      }, { passive: true });

      // 3. Detección de Scroll nativo de la ventana
      window.addEventListener('scroll', () => {
        if (this.isTransitioning || this.isFinished) return;
        if (window.scrollY > 5) {
          this.transitionToWeb();
        }
      }, { passive: true });

      // 4. Detección de Gesto Táctil / Swipe en Móviles
      let touchStartY = 0;
      window.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches[0]) {
          touchStartY = e.touches[0].clientY;
        }
      }, { passive: true });

      window.addEventListener('touchmove', (e) => {
        if (this.isTransitioning || this.isFinished) return;
        if (e.touches && e.touches[0]) {
          const currentY = e.touches[0].clientY;
          const diff = touchStartY - currentY;
          if (diff > 12) { // Deslizamiento hacia arriba
            this.transitionToWeb();
          }
        }
      }, { passive: true });

      // 5. Teclado (Flecha Abajo, Espacio, PageDown)
      window.addEventListener('keydown', (e) => {
        if (this.isTransitioning || this.isFinished) return;
        if (['ArrowDown', 'Space', 'PageDown'].includes(e.code)) {
          this.transitionToWeb();
        }
      });

      // 6. Botones "Conoce más", indicador de scroll o enlaces
      const enterTargets = [this.btnEnter, this.scrollHint];
      enterTargets.forEach(el => {
        if (!el) return;
        el.addEventListener('click', (e) => {
          e.preventDefault();
          this.transitionToWeb();
        });
      });

      const introLinks = this.container.querySelectorAll('.intro-menu-link, .intro-btn-shop');
      introLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          this.transitionToWeb();
        });
      });
    }

    transitionToWeb() {
      if (this.isTransitioning || this.isFinished) return;
      this.isTransitioning = true;
      this.container.style.pointerEvents = 'none';

      if (typeof gsap === 'undefined') {
        this.container.style.display = 'none';
        document.body.classList.add('web-revealed');
        this.isFinished = true;
        return;
      }

      const tl = gsap.timeline({
        onComplete: () => {
          this.container.style.display = 'none';
          document.body.classList.add('web-revealed');
          this.isFinished = true;
          if (this.rafId) cancelAnimationFrame(this.rafId);
          if (window.kallpaIntroCan && typeof window.kallpaIntroCan.pause === 'function') {
            window.kallpaIntroCan.pause();
          }
          if (window.kallpa3D && typeof window.kallpa3D.onResize === 'function') {
            window.kallpa3D.onResize();
          }
        }
      });

      // 1. La mano y la lata continúan su deslizamiento ascendente hacia el cielo sin cortarse jamás
      const flyDist = window.innerHeight * 1.4;
      if (this.layerMano) {
        tl.to(this.layerMano, {
          y: -flyDist,
          duration: 1.15,
          ease: "power2.in"
        }, 0);
      }

      if (this.layerLata) {
        tl.to(this.layerLata, {
          y: -flyDist * 1.25,
          scale: 1.15,
          duration: 1.15,
          ease: "power2.in"
        }, 0);
      }

      // 2. Textos, logo y botones se desvanecen
      const uiElements = this.container.querySelectorAll(
        '.kalpa-intro-nav, .kalpa-intro-footer, .intro-content-wrap, .intro-scroll-indicator'
      );
      if (uiElements.length) {
        tl.to(uiElements, {
          opacity: 0,
          y: -40,
          duration: 0.45,
          ease: "power1.out"
        }, 0);
      }

      // 3. Efecto blur de desvanecimiento general de la intro
      tl.to(this.container, {
        filter: "blur(28px)",
        opacity: 0,
        scale: 1.04,
        duration: 0.85,
        ease: "power2.inOut"
      }, 0.25);

      // 4. Revelar la web limpia y nítida por debajo
      tl.call(() => {
        document.body.classList.add('web-revealed');
        if (this.devControlPanel) {
          this.devControlPanel.classList.add('is-visible');
        }
      }, null, 0.45);
    }

    startLoop() {
      const loop = () => {
        this.clock += 0.016;

        // 1. Suavizado inercial del mouse
        this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.055;
        this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.055;

        // 2. Levitación senoidal suave para la lata
        const floatY = Math.sin(this.clock * 2.0) * 8;
        const floatRot = Math.cos(this.clock * 1.6) * 1.5;

        // 3. Aplicar transformaciones 3D diferenciadas por plano de profundidad (Cursor Tracking)
        if (this.innerCielo) {
          const cx = (this.mouse.x * -12).toFixed(2);
          const cy = (this.mouse.y * -8).toFixed(2);
          this.innerCielo.style.transform = `translate3d(${cx}px, ${cy}px, 0) scale(1.05)`;
        }

        if (this.innerCancha) {
          const cx = (this.mouse.x * -22).toFixed(2);
          const cy = (this.mouse.y * -14).toFixed(2);
          this.innerCancha.style.transform = `translate3d(${cx}px, ${cy}px, 0) scale(1.05)`;
        }

        if (this.innerContent) {
          const cx = (this.mouse.x * 14).toFixed(2);
          const cy = (this.mouse.y * 10).toFixed(2);
          this.innerContent.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
        }

        if (this.innerMano) {
          const cx = (this.mouse.x * 32).toFixed(2);
          const cy = (this.mouse.y * 20).toFixed(2);
          this.innerMano.style.transform = `translate3d(calc(-50% + ${cx}px), ${cy}px, 0)`;
        }

        if (this.innerLata) {
          const cx = (this.mouse.x * 42).toFixed(2);
          const cy = (this.mouse.y * 26 + floatY).toFixed(2);
          const rx = (-this.mouse.y * 12).toFixed(2);
          const ry = (this.mouse.x * 14).toFixed(2);
          const rz = (-16 + floatRot).toFixed(2);
          this.innerLata.style.transform = `translate3d(calc(-50% + ${cx}px), ${cy}px, 0) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`;
        }

        this.rafId = requestAnimationFrame(loop);
      };

      this.rafId = requestAnimationFrame(loop);
    }

    destroy() {
      if (this.rafId) cancelAnimationFrame(this.rafId);
    }
  }

  // Inicialización automática
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.kalpaIntro = new KalpaIntroController();
    });
  } else {
    window.kalpaIntro = new KalpaIntroController();
  }
})();
