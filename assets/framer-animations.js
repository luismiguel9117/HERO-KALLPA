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
    const interactiveButtons = document.querySelectorAll('.btn-pruebala, .btn-pack-add, .carousel-btn-arrow, .kalpa-cart-capsule');
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

    // 2. Animaciones InView con Stagger en las Tarjetas Editoriales (Terroir)
    inView('.kallpa-terroir-section', () => {
      animate(
        '.editorial-card',
        { opacity: [0, 1], y: [40, 0] },
        { delay: stagger(0.15), duration: 0.85, ease: [0.16, 1, 0.3, 1] }
      );
      animate(
        '.metric-block',
        { opacity: [0, 1], scale: [0.92, 1] },
        { delay: stagger(0.1), duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }
      );
    });

    // 3. Animación InView de las Barras Sensoriales en el Showcase 3D
    inView('.sensory-bars', () => {
      const fills = document.querySelectorAll('.sensory-fill');
      fills.forEach(fill => {
        const targetWidth = fill.style.width || '80%';
        fill.style.width = '0%';
        animate(
          fill,
          { width: targetWidth },
          { duration: 1.2, ease: [0.25, 1, 0.5, 1] }
        );
      });
    });

    // 4. Animación InView en los Packs de Compra
    inView('.kallpa-packs-grid', () => {
      animate(
        '.kallpa-pack-card',
        { opacity: [0, 1], y: [50, 0] },
        { delay: stagger(0.18), duration: 0.9, ease: [0.16, 1, 0.3, 1] }
      );
    });

    // 5. Animación InView en la Línea de Tiempo Circadiana
    inView('.protocol-timeline', () => {
      animate(
        '.timeline-card',
        { opacity: [0, 1], y: [35, 0] },
        { delay: stagger(0.15), duration: 0.8, ease: [0.16, 1, 0.3, 1] }
      );
    });

    // 6. Indicador de Progreso de Lectura Scroll-Linked
    const progressBar = document.createElement('div');
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

    if (typeof scroll === 'function') {
      scroll((progress) => {
        progressBar.style.transform = `scaleX(${progress})`;
      });
    }

    console.log('⚡ Framer Motion inicializado con físicas Spring y control de scroll.');
  }

  // Inicializar al cargar el DOM o en eventos de sección de Shopify
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFramerMotion);
  } else {
    initFramerMotion();
  }

  document.addEventListener('shopify:section:load', initFramerMotion);
})();
