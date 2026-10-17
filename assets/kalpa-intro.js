/**
 * HERO-KALLPA : Cinematic Parallax Intro Controller
 * Capas de profundidad: Cielo, Cancha, Tipografía, Mano y Lata
 * Arquitectura: Capa flotante SUPERPUESTA sobre la web (Fixed Overlay)
 * Efectos:
 *  1. Seguimiento de cursor magnético 3D e inercia elástica
 *  2. Levitación orgánica en la lata
 *  3. Transición deslizante hacia arriba (Slide-Up) que revela la web completa debajo
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

      this.fadeBlack = document.getElementById('intro-fade-black');
      this.devControlPanel = document.getElementById('dev-control-panel');

      this.scrollHint = document.getElementById('intro-scroll-hint');
      this.btnEnter = document.getElementById('btn-intro-enter');

      // Estado de la intro
      this.isDismissed = false;
      this.isTransitioning = false;

      // Bloquear scroll de la web mientras la intro esté abierta encima
      document.body.classList.add('kalpa-intro-active');

      // Coordenadas de mouse normalizadas (-1 a 1)
      this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
      this.clock = 0;
      this.rafId = null;

      this.bindEvents();
      this.startLoop();
    }

    bindEvents() {
      // 1. Seguimiento de cursor en la pantalla
      window.addEventListener('pointermove', (e) => {
        if (this.isDismissed) return;
        this.mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
        this.mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
      }, { passive: true });

      window.addEventListener('pointerleave', () => {
        this.mouse.targetX = 0;
        this.mouse.targetY = 0;
      });

      // 2. Giroscopio en móviles
      if (window.DeviceOrientationEvent && 'ontouchstart' in window) {
        window.addEventListener('deviceorientation', (e) => {
          if (this.isDismissed) return;
          if (e.gamma !== null && e.beta !== null) {
            this.mouse.targetX = Math.min(Math.max(e.gamma / 30, -1), 1);
            this.mouse.targetY = Math.min(Math.max((e.beta - 45) / 30, -1), 1);
          }
        }, { passive: true });
      }

      // 3. Deslizamiento hacia arriba con rueda de mouse (wheel)
      window.addEventListener('wheel', (e) => {
        if (this.isDismissed || this.isTransitioning) return;
        if (e.deltaY > 15) {
          this.dismissIntro();
        }
      }, { passive: true });

      // 4. Deslizamiento hacia arriba con gesto táctil (touch swipe up)
      let touchStartY = 0;
      window.addEventListener('touchstart', (e) => {
        if (this.isDismissed || this.isTransitioning) return;
        touchStartY = e.touches[0].clientY;
      }, { passive: true });

      window.addEventListener('touchmove', (e) => {
        if (this.isDismissed || this.isTransitioning) return;
        const touchCurrentY = e.touches[0].clientY;
        const diff = touchStartY - touchCurrentY;
        if (diff > 25) { // Deslizó hacia arriba
          this.dismissIntro();
        }
      }, { passive: true });

      // 5. Clicks en botón "Conoce más" y en indicador de scroll
      const enterTargets = [this.btnEnter, this.scrollHint];
      enterTargets.forEach(el => {
        if (!el) return;
        el.addEventListener('click', (e) => {
          e.preventDefault();
          this.dismissIntro('#hero-section');
        });
      });

      // 6. Clicks en enlaces del navbar de la intro
      const introNavLinks = this.container.querySelectorAll('.intro-menu-link, .intro-btn-shop');
      introNavLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          const href = link.getAttribute('href');
          if (href && href.startsWith('#')) {
            e.preventDefault();
            this.dismissIntro(href);
          }
        });
      });
    }

    dismissIntro(targetSectionId) {
      if (this.isDismissed || this.isTransitioning) return;
      this.isTransitioning = true;

      // Animar el telón superpuesto deslizándose hacia arriba con GSAP
      if (typeof gsap !== 'undefined') {
        const tl = gsap.timeline({
          onComplete: () => {
            this.finishDismiss(targetSectionId);
          }
        });

        // El contenedor entero se desliza hacia arriba saliendo del viewport
        tl.to(this.container, {
          yPercent: -100,
          duration: 0.95,
          ease: "power3.inOut"
        }, 0);

        // Movimiento parallax ascendente interno mientras sube
        if (this.layerLata) {
          tl.to(this.layerLata, {
            yPercent: -40,
            scale: 1.05,
            duration: 0.85,
            ease: "power2.in"
          }, 0);
        }

        if (this.layerMano) {
          tl.to(this.layerMano, {
            yPercent: -25,
            duration: 0.85,
            ease: "power2.in"
          }, 0);
        }

        if (this.layerContent) {
          tl.to(this.layerContent, {
            y: -70,
            opacity: 0,
            duration: 0.55,
            ease: "power2.out"
          }, 0);
        }

        const navFooter = this.container.querySelectorAll('.kalpa-intro-nav, .kalpa-intro-footer, .intro-scroll-indicator');
        if (navFooter.length) {
          tl.to(navFooter, {
            opacity: 0,
            duration: 0.35,
            ease: "power1.out"
          }, 0);
        }
      } else {
        // Fallback con transición CSS si GSAP no estuviera disponible
        this.container.style.transition = 'transform 0.85s cubic-bezier(0.65, 0, 0.35, 1)';
        this.container.style.transform = 'translateY(-100%)';
        setTimeout(() => {
          this.finishDismiss(targetSectionId);
        }, 850);
      }
    }

    finishDismiss(targetSectionId) {
      this.isDismissed = true;
      this.isTransitioning = false;
      this.container.style.display = 'none';
      this.container.style.visibility = 'hidden';
      this.container.style.pointerEvents = 'none';

      // Restaurar el scroll del body
      document.body.classList.remove('kalpa-intro-active');

      // Cancelar loop de RAF
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }

      // Mostrar calibrador 3D en la web
      if (this.devControlPanel) {
        this.devControlPanel.classList.add('is-visible');
      }

      // Desplazar a la sección solicitada si corresponde
      if (targetSectionId && targetSectionId !== '#hero-section') {
        const targetEl = document.querySelector(targetSectionId);
        if (targetEl) {
          setTimeout(() => {
            targetEl.scrollIntoView({ behavior: 'smooth' });
          }, 50);
        }
      }
    }

    showIntro() {
      if (!this.isDismissed && !this.isTransitioning) return;
      this.isDismissed = false;
      this.isTransitioning = true;
      this.container.style.display = 'block';
      this.container.style.visibility = 'visible';
      this.container.style.pointerEvents = 'auto';
      document.body.classList.add('kalpa-intro-active');

      if (this.devControlPanel) {
        this.devControlPanel.classList.remove('is-visible');
      }

      if (typeof gsap !== 'undefined') {
        gsap.to(this.container, {
          yPercent: 0,
          duration: 0.85,
          ease: "power3.out",
          onComplete: () => {
            this.isTransitioning = false;
            this.startLoop();
          }
        });
      } else {
        this.container.style.transform = 'translateY(0%)';
        this.isTransitioning = false;
        this.startLoop();
      }
    }

    startLoop() {
      const loop = () => {
        if (this.isDismissed) return;
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
          const rz = (-11 + floatRot).toFixed(2);
          this.innerLata.style.transform = `translate3d(calc(-50% + ${cx}px), ${cy}px, 0) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`;
        }

        this.rafId = requestAnimationFrame(loop);
      };

      this.rafId = requestAnimationFrame(loop);
    }

    destroy() {
      if (this.rafId) cancelAnimationFrame(this.rafId);
      document.body.classList.remove('kalpa-intro-active');
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
