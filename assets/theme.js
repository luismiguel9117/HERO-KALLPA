/**
 * HERO-KALLPA : Global Theme Controller
 * AJAX Cart Drawer, Bento Cards Glow, Contadores Numéricos & Navegación
 */

// 1. Bento Grid Cursor Glow Tracking
function initBentoGlow() {
  const cards = document.querySelectorAll('.bento-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

// 2. Animated Counters
function initAnimatedCounters() {
  const counters = document.querySelectorAll('[data-counter-target]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.dataset.counterTarget);
        const prefix = el.dataset.counterPrefix || '';
        const suffix = el.dataset.counterSuffix || '';
        const decimals = parseInt(el.dataset.counterDecimals || '0');
        const duration = 2000;
        const startTime = performance.now();

        function update(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Ease out cubic
          const easeProgress = 1 - Math.pow(1 - progress, 3);
          const currentVal = (target * easeProgress).toFixed(decimals);
          el.innerText = `${prefix}${currentVal}${suffix}`;

          if (progress < 1) {
            requestAnimationFrame(update);
          } else {
            el.innerText = `${prefix}${target}${suffix}`;
          }
        }

        requestAnimationFrame(update);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.3 });

  counters.forEach(c => observer.observe(c));
}

// 3. Luxury AJAX Cart Drawer
window.openKallpaCart = function() {
  const overlay = document.getElementById('kallpa-cart-overlay');
  const drawer = document.getElementById('kallpa-cart-drawer');
  if (overlay) overlay.classList.add('is-active');
  if (drawer) drawer.classList.add('is-active');
  document.body.style.overflow = 'hidden';
  window.refreshKallpaCart();
};

window.closeKallpaCart = function() {
  const overlay = document.getElementById('kallpa-cart-overlay');
  const drawer = document.getElementById('kallpa-cart-drawer');
  if (overlay) overlay.classList.remove('is-active');
  if (drawer) drawer.classList.remove('is-active');
  document.body.style.overflow = '';
};

// Formato de moneda adaptable en Soles (PEN)
function formatMoney(cents) {
  if (typeof cents !== 'number') return 'S/ ' + cents;
  return 'S/ ' + (cents / 100).toFixed(2);
}

// Renderizar UI del Carrito
function renderCartUI(cart) {
  const itemsContainer = document.getElementById('kallpa-cart-items');
  const footerContainer = document.getElementById('kallpa-cart-footer');

  // Actualizar contadores globales
  const count = cart.item_count || 0;
  document.querySelectorAll('#kallpa-cart-count, #intro-cart-count').forEach(b => {
    b.innerText = count;
  });
  try {
    localStorage.setItem('kallpa_cart_count', count);
  } catch (e) {}

  if (!itemsContainer) return;

  if (!cart.items || cart.items.length === 0) {
    itemsContainer.innerHTML = `
      <div style="text-align: center; padding: 4.5rem 1.5rem; color: #94a3b8;">
        <div style="font-size: 2.5rem; margin-bottom: 0.8rem; opacity: 0.8;">⚡</div>
        <h4 style="font-family: var(--font-brand); color: #ffffff; font-size: 1.15rem; margin: 0 0 0.5rem; font-weight: 800;">TU CARRITO ESTÁ VACÍO</h4>
        <p style="font-size: 0.88rem; line-height: 1.5; margin: 0 0 1.8rem; color: rgba(255,255,255,0.6);">Descubre el café cold brew de altura con energía limpia y sin azúcar.</p>
        <button type="button" onclick="closeKallpaCart()" class="btn-checkout-gold" style="display: inline-flex; width: auto; padding: 0.8rem 2rem; font-size: 0.85rem;">
          <span>EXPLORAR PRODUCTOS</span>
        </button>
      </div>
    `;
    if (footerContainer) footerContainer.innerHTML = '';
    return;
  }

  let itemsHtml = '';
  cart.items.forEach(item => {
    const title = (item.properties && item.properties['Producto']) || item.product_title || item.title;
    const variant = (item.properties && item.properties['Presentación']) || (item.variant_title !== 'Default Title' ? item.variant_title : '');
    const imgSrc = item.image || (item.featured_image && item.featured_image.url) || 'assets/kalpa-can-original.webp';
    const lineTotal = formatMoney(item.final_line_price || item.line_price);

    itemsHtml += `
      <div class="kallpa-cart-item" style="display: flex; gap: 1rem; align-items: center; padding: 1.1rem 0; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
        <img src="${imgSrc}" alt="${title}" style="width: 64px; height: 64px; object-fit: contain; background: #0c0e14; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 4px; flex-shrink: 0;">
        <div style="flex: 1; min-width: 0;">
          <h4 style="font-family: var(--font-brand); font-size: 0.92rem; font-weight: 800; color: #ffffff; margin: 0 0 0.2rem; line-height: 1.25; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${title}</h4>
          ${variant ? `<p style="font-size: 0.76rem; color: rgba(255,255,255,0.55); margin: 0 0 0.5rem;">${variant}</p>` : ''}
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
            <div style="display: inline-flex; align-items: center; background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 6px; overflow: hidden;">
              <button type="button" onclick="updateKallpaCartItem('${item.key}', ${item.quantity - 1})" style="background: transparent; border: none; color: #fff; width: 28px; height: 26px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1rem;" aria-label="Reducir">&minus;</button>
              <span style="padding: 0 0.5rem; font-size: 0.85rem; font-weight: 800; color: #fff;">${item.quantity}</span>
              <button type="button" onclick="updateKallpaCartItem('${item.key}', ${item.quantity + 1})" style="background: transparent; border: none; color: #fff; width: 28px; height: 26px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1rem;" aria-label="Aumentar">+</button>
            </div>
            <span style="font-family: var(--font-brand); font-size: 0.95rem; font-weight: 900; color: #fbd132;">${lineTotal}</span>
          </div>
        </div>
        <button type="button" onclick="updateKallpaCartItem('${item.key}', 0)" style="background: none; border: none; color: rgba(255,255,255,0.4); cursor: pointer; padding: 0.4rem; font-size: 1.2rem; line-height: 1; transition: color 0.2s;" title="Eliminar">&times;</button>
      </div>
    `;
  });
  itemsContainer.innerHTML = itemsHtml;

  if (footerContainer) {
    footerContainer.innerHTML = `
      <div style="padding-top: 1.25rem; border-top: 1px solid rgba(255, 255, 255, 0.1);">
        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.5rem;">
          <span style="font-family: var(--font-brand); font-size: 0.88rem; font-weight: 800; color: rgba(255,255,255,0.7); text-transform: uppercase;">SUBTOTAL</span>
          <span style="font-family: var(--font-brand); font-size: 1.35rem; font-weight: 900; color: #fbd132;">${formatMoney(cart.total_price)}</span>
        </div>
        <p style="font-size: 0.75rem; color: rgba(255,255,255,0.45); margin: 0 0 1.25rem;">
          Envíos e impuestos calculados en el checkout.
        </p>
        <a href="/checkout" class="btn-checkout-gold" id="btn-cart-checkout" style="display: flex; align-items: center; justify-content: center; gap: 0.6rem; width: 100%; padding: 1.1rem; background: #f5ba2c; color: #0b0908; border-radius: 999px; font-family: var(--font-brand); font-size: 0.95rem; font-weight: 900; letter-spacing: 0.06em; text-transform: uppercase; text-decoration: none; box-shadow: 0 8px 24px rgba(245,186,44,0.35); transition: all 0.25s ease;">
          <span>PROCEDER AL CHECKOUT</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </a>
        <div style="display: flex; align-items: center; justify-content: center; gap: 0.4rem; margin-top: 0.75rem; font-size: 0.75rem; color: rgba(255,255,255,0.5);">
          <span>🔒 Pago 100% seguro &middot; Envíos a todo el Perú</span>
        </div>
      </div>
    `;
  }
}

// Actualizar o refrescar contenido del carrito vía Shopify /cart.js
window.refreshKallpaCart = function() {
  fetch('/cart.js')
    .then(res => res.json())
    .then(cart => {
      renderCartUI(cart);
    })
    .catch(err => {
      console.warn('Error fetching Shopify cart:', err);
    });
};

// Modificar cantidad o eliminar item del carrito
window.updateKallpaCartItem = function(itemKey, qty) {
  fetch('/cart/change.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: itemKey, quantity: qty })
  })
  .then(res => res.json())
  .then(cart => {
    renderCartUI(cart);
  })
  .catch(err => {
    console.error('Error updating cart item:', err);
    window.refreshKallpaCart();
  });
};

// Agregar producto al carrito de Shopify
window.addPackToKallpaCart = function(packId, name, price, qty = 1, variantId = null) {
  const vId = variantId || (window.Shopify && window.Shopify.default_variant_id) || 67960537088316;

  // Abrir carrito de inmediato
  window.openKallpaCart();

  fetch('/cart/add.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: vId,
      quantity: qty || 1,
      properties: {
        'Producto': name,
        'Presentación': packId
      }
    })
  })
  .then(res => res.json())
  .then(() => {
    window.refreshKallpaCart();
  })
  .catch(err => {
    console.error('Error adding to Shopify cart:', err);
    window.refreshKallpaCart();
  });
};

window.addToCartKallpa = function(variantId, quantity = 1) {
  window.addPackToKallpaCart('general', 'KALPA Producto', 11.90, quantity, variantId);
};

window.addKallpaToCart = function(title, priceSol, image) {
  window.addPackToKallpaCart('pack', title, priceSol, 1);
};
// 4. Inicialización al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
  initBentoGlow();
  initAnimatedCounters();
  window.refreshKallpaCart();
});


// ==========================================
// CONTROLADOR DEL CARRUSEL DE PRODUCTOS (SLIDE 1 & SLIDE 2)
// ==========================================
let currentProductSlide = 0;
function getTotalProductSlides() {
  return document.querySelectorAll('.kalpa-product-slide').length || 1;
}

function syncProductSlideHeights() {
  const others = document.querySelectorAll('.kalpa-product-slide:not(#product-slide-0)');
  if (window.innerWidth <= 860) {
    others.forEach(slide => {
      slide.style.height = '';
      slide.style.minHeight = '';
    });
    return;
  }
  const slide0 = document.getElementById('product-slide-0');
  if (slide0) {
    const h0 = slide0.offsetHeight;
    if (h0 > 350) {
      others.forEach(slide => {
        slide.style.height = h0 + 'px';
        slide.style.minHeight = h0 + 'px';
      });
    }
  }
}

window.goToProductSlide = function(index) {
  const total = getTotalProductSlides();
  if (index < 0) index = total - 1;
  if (index >= total) index = 0;
  currentProductSlide = index;

  if (currentProductSlide > 0) {
    syncProductSlideHeights();
  }

  const slides = document.querySelectorAll(".kalpa-product-slide");
  for (let i = 0; i < slides.length; i++) {
    const slide = document.getElementById(`product-slide-${i}`);
    if (slide) {
      if (i === currentProductSlide) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    }
  }
};

window.nextProductSlide = function() {
  window.goToProductSlide(currentProductSlide + 1);
};

window.prevProductSlide = function() {
  window.goToProductSlide(currentProductSlide - 1);
};

window.updateSaleUnitQty = function(delta) {
  const el = document.getElementById('sale-unit-qty');
  if (!el) return;
  let val = parseInt(el.textContent || '1', 10) + delta;
  if (val < 1) val = 1;
  if (val > 24) val = 24;
  el.textContent = val;
};

window.updateMolidoUnitQty = function(delta) {
  const el = document.getElementById('molido-unit-qty');
  if (!el) return;
  let val = parseInt(el.textContent || '1', 10) + delta;
  if (val < 1) val = 1;
  if (val > 24) val = 24;
  el.textContent = val;
};

window.addSaleUnitToCart = function() {
  const el = document.getElementById('sale-unit-qty');
  const qty = el ? Math.max(1, parseInt(el.textContent || '1', 10)) : 1;
  const total = +(7.90 * qty).toFixed(2);
  window.addPackToKallpaCart('unit-kalpa-original', `${qty}x KALPA Original 355ml`, total);
};

window.addMolidoUnitToCart = function() {
  const el = document.getElementById('molido-unit-qty');
  const qty = el ? Math.max(1, parseInt(el.textContent || '1', 10)) : 1;
  const total = +(34.90 * qty).toFixed(2);
  window.addPackToKallpaCart('unit-kalpa-molido', `${qty}x KALPA Café Molido 250g`, total);
};



document.addEventListener('DOMContentLoaded', () => {
  syncProductSlideHeights();
  window.addEventListener('resize', syncProductSlideHeights);

  let touchStartX = 0;
  let touchEndX = 0;
  const carousel = document.getElementById('kalpaProductCarousel');
  if (!carousel) return;

  carousel.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  carousel.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) > 45) {
      if (diff < 0) window.nextProductSlide();
      else window.prevProductSlide();
    }
  }, { passive: true });
});


// ==========================================
// CONTROLADOR DE RESEÑAS DE LA COMUNIDAD (SLIDER)
// ==========================================
(function() {
  document.addEventListener('DOMContentLoaded', () => {
    const cardEl = document.getElementById('communityReviewCard');
    const headlineEl = document.getElementById('communityReviewHeadline');
    const textEl = document.getElementById('communityReviewText');
    const avatarEl = document.getElementById('communityReviewAvatar');
    const nameEl = document.getElementById('communityReviewName');
    const metaEl = document.getElementById('communityReviewMeta');
    const prevBtn = document.getElementById('communityPrevBtn');
    const nextBtn = document.getElementById('communityNextBtn');
    const dotsWrap = document.getElementById('communityDotsWrap');

    // Reseñas sincronizables (Google Maps / Comunidad)
    window.communityReviews = window.communityReviews || [
      {
        headline: '“Me da <span class="text-gold">energía limpia</span> para mis fondos de 15K”',
        text: 'Solía tomar geles o energizantes con taurina y siempre me daban taquicardia o acidez estomacal. Kallpa me da un empuje sostenido durante todo el fondo y sin bajón. Además el sabor a café frío es súper limpio y refrescante.',
        avatar: 'RA',
        name: 'Rodrigo Alarcón',
        meta: 'Triatleta & Runner · Lima'
      },
      {
        headline: '“Enfoque brutal durante <span class="text-gold">horas de código</span>”',
        text: 'Trabajo como dev y las tardes eran mortales. Tomarme una lata de KALPA helada a las 3 pm me mantiene 100% concentrado sin la ansiedad de los energéticos artificiales. 280 mg de cafeína natural que realmente se notan.',
        avatar: 'DM',
        name: 'Diego Mendoza',
        meta: 'Software Engineer · Arequipa'
      },
      {
        headline: '“Como barista me sorprendió <span class="text-gold">el perfil del VRAEM</span>”',
        text: 'Muchos cold brew enlatados saben planos o quemados. KALPA conserva notas achocolatadas y acidez brillante balanceada. Sin azúcar añadida y listo para tomar directamente de la lata helada. Gran nivel.',
        avatar: 'VT',
        name: 'Valeria Torres',
        meta: 'Barista & Sommelier · Cusco'
      },
      {
        headline: '“El pack de 6 es <span class="text-gold">mi infaltable</span> semanal”',
        text: 'Pido el pack todas las semanas. Lo llevo a la oficina y al gimnasio. Cero calorías, cero azúcar y me ahorro preparar café por la mañana. La lata mantiene el gas y el frío perfecto.',
        avatar: 'CS',
        name: 'Camila Silva',
        meta: 'CrossFit Athlete · Miraflores'
      }
    ];

    let reviewIndex = 0;

    function showReview(idx) {
      const list = window.communityReviews;
      if (!list || !list.length) return;
      if (idx < 0) idx = list.length - 1;
      if (idx >= list.length) idx = 0;
      reviewIndex = idx;

      if (cardEl) {
        cardEl.style.opacity = '0.4';
        cardEl.style.transform = 'translateY(4px)';
      }

      setTimeout(() => {
        const r = list[reviewIndex];
        if (headlineEl) headlineEl.innerHTML = r.headline;
        if (textEl) textEl.textContent = r.text;
        if (avatarEl) avatarEl.textContent = r.avatar;
        if (nameEl) nameEl.textContent = r.name;
        if (metaEl) metaEl.textContent = r.meta;

        if (dotsWrap) {
          dotsWrap.querySelectorAll('.review-dot').forEach((dot, i) => {
            dot.classList.toggle('is-active', i === reviewIndex);
          });
        }

        if (cardEl) {
          cardEl.style.opacity = '1';
          cardEl.style.transform = 'translateY(0)';
        }
      }, 150);
    }

    if (prevBtn) prevBtn.addEventListener('click', () => showReview(reviewIndex - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => showReview(reviewIndex + 1));

    if (dotsWrap) {
      dotsWrap.querySelectorAll('.review-dot').forEach((dot, i) => {
        dot.addEventListener('click', () => showReview(i));
      });
    }
  });
})();


// Integración con el Editor de Temas de Shopify (Sincronización en vivo de diapositivas)
document.addEventListener('shopify:block:select', function(event) {
  const blockEl = event.target;
  if (blockEl && blockEl.classList && blockEl.classList.contains('kalpa-product-slide')) {
    const idx = parseInt(blockEl.getAttribute('data-slide-index'), 10);
    if (!isNaN(idx) && typeof window.goToProductSlide === 'function') {
      window.goToProductSlide(idx);
    }
  }
});

document.addEventListener('shopify:section:load', function(event) {
  if (event.target && event.target.querySelector && event.target.querySelector('.kalpa-product-carousel')) {
    if (typeof window.goToProductSlide === 'function') {
      window.goToProductSlide(window.currentProductSlide || 0);
    }
    if (typeof syncProductSlideHeights === 'function') {
      syncProductSlideHeights();
    }
  }
});


// 6. Sistema Global de Notificaciones Toast KALPA
window.showKallpaToast = function(message, iconSvg) {
  let container = document.getElementById('kallpa-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'kallpa-toast-container';
    container.className = 'kallpa-toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'kallpa-toast';
  
  const icon = iconSvg || `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="kallpa-toast-icon">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  `;

  toast.innerHTML = `${icon}<span>${message}</span>`;
  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('is-visible');
  });

  // Auto remove after 3.8s
  setTimeout(() => {
    toast.classList.remove('is-visible');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 350);
  }, 3800);
};

// 7. Manejador de Favoritos (Wishlist) con Feedback Háptico / Toast
window.handleKallpaWishlist = function(btn) {
  if (btn) {
    btn.classList.toggle('is-favorited');
    const svg = btn.querySelector('svg');
    if (svg) {
      if (btn.classList.contains('is-favorited')) {
        svg.setAttribute('fill', '#fbd132');
        svg.setAttribute('stroke', '#fbd132');
      } else {
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
      }
    }
  }

  const heartIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#fbd132" stroke="#fbd132" stroke-width="2" class="kallpa-toast-icon">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
  `;
  window.showKallpaToast('¡Guardado en tu lista de deseos KALPA!', heartIcon);
};
