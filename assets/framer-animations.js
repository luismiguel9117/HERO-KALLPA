/**
 * HERO-KALLPA : Framer Motion Animation Controller
 * Impulsado por el motor oficial de Framer Motion (Motion)
 * Físicas Spring hiper-reactivas, animaciones inView con stagger y control táctil
 */

(function() {
  'use strict';

  function initFramerMotion() {
    const Motion = window.Motion;
    if (!Motion || typeof Motion.animate !== 'function') {
      console.warn('⚡ Framer Motion no encontrado, esperando carga de assets/motion.js...');
      return;
    }

    const { animate, inView, scroll, stagger } = Motion;

    // 1. Efecto Spring Táctil en Botones (Tap / Click Spring Physics)
    const interactiveButtons = document.querySelectorAll(
      '.btn-pruebala, .btn-product-add, .btn-all-products, .btn-banner-black, .btn-instagram-follow, .nav-arrow-btn, .social-icon-btn, .carousel-btn-arrow, .kalpa-cart-capsule'
    );
    interactiveButtons.forEach(btn => {
      btn.addEventListener('mousedown', () => {
        animate(btn, { scale: 0.94 }, { type: "spring", stiffness: 500, damping: 15 });
      });
      btn.addEventListener('mouseup', () => {
        animate(btn, { scale: 1.0 }, { type: "spring", stiffness: 400, damping: 20 });
      });
      btn.addEventListener('mouseleave', () => {
        animate(btn, { scale: 1.0 }, { type: "spring", stiffness: 300, damping: 25 });
      });
    });

    // 2. Animación InView de Productos con Stagger
    if (document.querySelector('.kallpa-products-section')) {
      inView('.kallpa-products-section', () => {
        animate(
          '.kallpa-product-card',
          { opacity: [0, 1], y: [45, 0] },
          { delay: stagger(0.15), duration: 0.85, ease: [0.16, 1, 0.3, 1] }
        );
      });
    }

    // 3. Animación InView en Energía Limpia
    if (document.querySelector('.kallpa-clean-energy-section')) {
      inView('.kallpa-clean-energy-section', () => {
        animate(
          '.clean-energy__content',
          { opacity: [0, 1], x: [-35, 0] },
          { duration: 0.9, ease: [0.16, 1, 0.3, 1] }
        );
        animate(
          '.clean-energy__media',
          { opacity: [0, 1], scale: [0.94, 1] },
          { duration: 0.95, ease: [0.16, 1, 0.3, 1] }
        );
      });
    }

    // 4. Animación InView en Origen VRAEM
    if (document.querySelector('.kallpa-vraem-section')) {
      inView('.kallpa-vraem-section', () => {
        animate(
          '.vraem-origin__media',
          { opacity: [0, 1], scale: [0.94, 1] },
          { duration: 0.95, ease: [0.16, 1, 0.3, 1] }
        );
        animate(
          '.vraem-origin__content',
          { opacity: [0, 1], x: [35, 0] },
          { duration: 0.9, ease: [0.16, 1, 0.3, 1] }
        );
      });
    }

    // 5. Animación InView en Beneficios Bento
    if (document.querySelector('.kallpa-benefits-section')) {
      inView('.kallpa-benefits-section', () => {
        animate(
          '.benefit-bento-card',
          { opacity: [0, 1], y: [40, 0] },
          { delay: stagger(0.18), duration: 0.85, ease: [0.16, 1, 0.3, 1] }
        );
      });
    }

    // 6. Animación InView en Banner Promocional
    if (document.querySelector('.kallpa-promo-banner-section')) {
      inView('.kallpa-promo-banner-section', () => {
        animate(
          '.kallpa-gold-banner',
          { opacity: [0, 1], scale: [0.96, 1] },
          { duration: 0.9, ease: [0.16, 1, 0.3, 1] }
        );
      });
    }

    // 7. Animación InView en Reels con Stagger
    if (document.querySelector('.kallpa-reels-section')) {
      inView('.kallpa-reels-section', () => {
        animate(
          '.reel-card',
          { opacity: [0, 1], y: [45, 0] },
          { delay: stagger(0.12), duration: 0.8, ease: [0.16, 1, 0.3, 1] }
        );
      });
    }

    // 8. Indicador de Progreso de Lectura Scroll-Linked
    let progressBar = document.getElementById('kallpa-framer-progress');
    if (!progressBar) {
      progressBar = document.createElement('div');
      progressBar.id = 'kallpa-framer-progress';
      progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, #d97706, #f5ba2c, #fef08a);
        transform-origin: 0%;
        transform: scaleX(0);
        z-index: 9999;
        pointer-events: none;
      `;
      document.body.appendChild(progressBar);
    }

    if (typeof scroll === 'function') {
      scroll((progress) => {
        progressBar.style.transform = `scaleX(${progress})`;
      });
    }

    console.log('⚡ Framer Motion (Official Engine) inicializado con físicas Spring y scroll triggers.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFramerMotion);
  } else {
    initFramerMotion();
  }
})();
