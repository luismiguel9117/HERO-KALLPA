/**
 * HERO-KALLPA : Cinematic Parallax Intro Controller
 * Capas de profundidad: Cielo, Cancha, Tipografía, Mano y Lata
 * Efectos:
 *  1. Seguimiento de cursor magnético 3D con inercia elástica (Cursor Tracking & Gyroscope)
 *  2. Levitación orgánica en la lata
 *  3. Transición Parallax Scroll hacia la web principal impulsada por GSAP ScrollTrigger
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

      this.scrollHint = document.getElementById('intro-scroll-hint');
      this.btnEnter = document.getElementById('btn-intro-enter');

      // Coordenadas de mouse normalizadas (-1 a 1)
      this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
      this.isHovering = true;
      this.clock = 0;
      this.rafId = null;

      this.initParallaxScroll();
      this.bindEvents();
      this.startLoop();
    }

    initParallaxScroll() {
      // Si GSAP y ScrollTrigger están cargados, configurar timeline de scroll sincronizado
      if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: this.container,
            start: "top top",
            end: "bottom top",
            scrub: 0.6,
            onUpdate: (self) => {
              // Si el scroll supera el 85%, reducir opacidad general de la intro
              if (self.progress > 0.85) {
                const fade = (1 - self.progress) / 0.15;
                this.sticky.style.opacity = Math.max(0, fade).toFixed(3);
                this.sticky.style.pointerEvents = fade < 0.1 ? 'none' : 'auto';
              } else {
                this.sticky.style.opacity = '1';
                this.sticky.style.pointerEvents = 'auto';
              }
            }
          }
        });

        // 1. La mano del atleta se desliza hacia abajo saliendo de cuadro
        if (this.layerMano) {
          tl.to(this.layerMano, { yPercent: 85, ease: "none" }, 0);
        }

        // 2. La lata se desliza hacia abajo y hace una sutil rotación
        if (this.layerLata) {
          tl.to(this.layerLata, { yPercent: 65, scale: 0.92, ease: "none" }, 0);
        }

        // 3. La cancha se desliza hacia abajo con menor velocidad
        if (this.layerCancha) {
          tl.to(this.layerCancha, { yPercent: 45, ease: "none" }, 0);
        }

        // 4. El contenido tipográfico se eleva y desvanece
        if (this.layerContent) {
          tl.to(this.layerContent, { yPercent: -50, opacity: 0, ease: "none" }, 0);
        }

        // 5. El cielo se expande sutilmente
        if (this.layerCielo) {
          tl.to(this.layerCielo, { yPercent: -15, scale: 1.06, ease: "none" }, 0);
        }

        // 6. Header y footer de la intro se desvanecen rápidamente
        const navFooter = this.container.querySelectorAll('.kalpa-intro-nav, .kalpa-intro-footer, .intro-scroll-indicator');
        if (navFooter.length) {
          tl.to(navFooter, { opacity: 0, y: -25, ease: "none" }, 0);
        }
      }
    }

    bindEvents() {
      // Seguimiento de cursor en toda la ventana
      window.addEventListener('pointermove', (e) => {
        this.mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
        this.mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
      }, { passive: true });

      window.addEventListener('pointerleave', () => {
        this.mouse.targetX = 0;
        this.mouse.targetY = 0;
      });

      // Giroscopio en dispositivos móviles si está disponible
      if (window.DeviceOrientationEvent && 'ontouchstart' in window) {
        window.addEventListener('deviceorientation', (e) => {
          if (e.gamma !== null && e.beta !== null) {
            // gamma [-90, 90], beta [-180, 180]
            this.mouse.targetX = Math.min(Math.max(e.gamma / 30, -1), 1);
            this.mouse.targetY = Math.min(Math.max((e.beta - 45) / 30, -1), 1);
          }
        }, { passive: true });
      }

      // Botón "Conoce más" y botón scroll que conducen al contenido principal
      const enterTargets = [this.btnEnter, this.scrollHint];
      enterTargets.forEach(el => {
        if (!el) return;
        el.addEventListener('click', (e) => {
          e.preventDefault();
          this.scrollToMain();
        });
      });
    }

    scrollToMain() {
      const heroSection = document.getElementById('hero-section');
      if (heroSection) {
        if (typeof gsap !== 'undefined') {
          gsap.to(window, {
            scrollTo: { y: heroSection, autoKill: false },
            duration: 1.2,
            ease: "power2.inOut"
          });
        } else {
          heroSection.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        const offset = this.container.offsetHeight || window.innerHeight * 1.5;
        window.scrollTo({ top: offset, behavior: 'smooth' });
      }
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
          const rz = (-11 + floatRot).toFixed(2);
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

  // Inicialización automática tolerante al ciclo de carga
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.kalpaIntro = new KalpaIntroController();
    });
  } else {
    window.kalpaIntro = new KalpaIntroController();
  }
})();
