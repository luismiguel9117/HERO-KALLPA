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

      this.initParallaxScroll();
      this.bindEvents();
      this.startLoop();
    }

    initParallaxScroll() {
      if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
      gsap.registerPlugin(ScrollTrigger);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: this.container,
          start: "top top",
          end: "bottom top",
          scrub: 0.5,
          onUpdate: (self) => {
            // "cuando esté por ponerse toda la pantalla en negro aparezca la web"
            // Cuando el bloque negro ya cubrió más del 85% de la pantalla:
            if (self.progress > 0.85) {
              document.body.classList.add('web-revealed');
              if (this.devControlPanel) {
                this.devControlPanel.classList.add('is-visible');
              }
            } else {
              document.body.classList.remove('web-revealed');
              if (this.devControlPanel) {
                this.devControlPanel.classList.remove('is-visible');
              }
            }

            // Justo cuando el negro llega al tope (self.progress > 0.88), el frame sticky se desvanece
            // para entregar limpiamente el control visual y de eventos a la web debajo
            if (self.progress > 0.88) {
              const fade = (1 - self.progress) / 0.12;
              this.sticky.style.opacity = Math.max(0, fade).toFixed(3);
              this.sticky.style.pointerEvents = fade < 0.1 ? 'none' : 'auto';
            } else {
              this.sticky.style.opacity = '1';
              this.sticky.style.pointerEvents = 'auto';
            }
          }
        }
      });

      // 1. EL BLOQUE NEGRO SUBE DESDE ABAJO (IDÉNTICO A OSMO: Image 2 -> Image 3)
      if (this.risingBlack) {
        tl.fromTo(this.risingBlack,
          { yPercent: 100 },
          { yPercent: 0, ease: "none" },
          0
        );
      }

      // 2. LA MANO SUBE HACIA ARRIBA ACOMPAÑANDO EL ASCENSO DEL FONDO NEGRO
      if (this.layerMano) {
        tl.to(this.layerMano, { yPercent: -50, ease: "none" }, 0);
      }

      // 3. LA LATA SUBE CON MAYOR VELOCIDAD (PARALLAX ASCENDENTE HACIA EL CIELO)
      if (this.layerLata) {
        tl.to(this.layerLata, { yPercent: -80, scale: 1.05, ease: "none" }, 0);
      }

      // 4. EL CONTENIDO EDITORIAL SUBE Y SE DISUELVE TEMPRANO
      if (this.layerContent) {
        tl.to(this.layerContent, { yPercent: -60, opacity: 0, ease: "power1.out" }, 0);
      }

      // 5. CIELO Y CANCHA: ESTÁTICOS SEGÚN LO SOLICITADO
      if (this.layerCielo) {
        tl.to(this.layerCielo, { scale: 1.02, ease: "none" }, 0);
      }
      if (this.layerCancha) {
        tl.to(this.layerCancha, { yPercent: 0, ease: "none" }, 0);
      }

      // 6. HEADER Y FOOTER DE LA INTRO: SE DESVANECEN TEMPRANAMENTE
      const navFooter = this.container.querySelectorAll('.kalpa-intro-nav, .kalpa-intro-footer, .intro-scroll-indicator');
      if (navFooter.length) {
        tl.to(navFooter, { opacity: 0, y: -20, ease: "power1.out" }, 0);
      }
    }

    bindEvents() {
      // 1. Seguimiento de cursor en la pantalla
      window.addEventListener('pointermove', (e) => {
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
          if (e.gamma !== null && e.beta !== null) {
            this.mouse.targetX = Math.min(Math.max(e.gamma / 30, -1), 1);
            this.mouse.targetY = Math.min(Math.max((e.beta - 45) / 30, -1), 1);
          }
        }, { passive: true });
      }

      // 3. Botón "Conoce más" y botón scroll que conducen al contenido principal
      const enterTargets = [this.btnEnter, this.scrollHint];
      enterTargets.forEach(el => {
        if (!el) return;
        el.addEventListener('click', (e) => {
          e.preventDefault();
          this.scrollToMain();
        });
      });

      // 4. Enlaces de navegación dentro de la intro
      const introNavLinks = this.container.querySelectorAll('.intro-menu-link, .intro-btn-shop');
      introNavLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          const href = link.getAttribute('href');
          if (href && href.startsWith('#')) {
            e.preventDefault();
            const targetEl = document.querySelector(href);
            if (targetEl) {
              if (typeof gsap !== 'undefined') {
                gsap.to(window, {
                  scrollTo: { y: targetEl, autoKill: false },
                  duration: 1.4,
                  ease: "power2.inOut"
                });
              } else {
                targetEl.scrollIntoView({ behavior: 'smooth' });
              }
            }
          }
        });
      });
    }

    scrollToMain() {
      const heroSection = document.getElementById('hero-section');
      if (heroSection) {
        if (typeof gsap !== 'undefined') {
          gsap.to(window, {
            scrollTo: { y: heroSection, autoKill: false },
            duration: 1.3,
            ease: "power2.inOut"
          });
        } else {
          heroSection.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        const offset = this.container.offsetHeight || window.innerHeight * 2;
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

  // Inicialización automática
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.kalpaIntro = new KalpaIntroController();
    });
  } else {
    window.kalpaIntro = new KalpaIntroController();
  }
})();
