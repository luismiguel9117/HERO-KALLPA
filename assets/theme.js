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
  refreshKallpaCart();
};

window.closeKallpaCart = function() {
  const overlay = document.getElementById('kallpa-cart-overlay');
  const drawer = document.getElementById('kallpa-cart-drawer');
  if (overlay) overlay.classList.remove('is-active');
  if (drawer) drawer.classList.remove('is-active');
  document.body.style.overflow = '';
};

// Formato de moneda adaptable
function formatMoney(cents) {
  if (typeof cents !== 'number') return cents;
  return 'S/ ' + (cents / 100).toFixed(2) + ' PEN';
}

// Actualizar o refrescar contenido del carrito
window.refreshKallpaCart = function() {
  const itemsContainer = document.getElementById('kallpa-cart-items');
  const footerContainer = document.getElementById('kallpa-cart-footer');
  const countBadge = document.getElementById('kallpa-cart-count');

  if (!itemsContainer) return;

  // Si estamos en entorno Shopify nativo
  if (window.Shopify && window.Shopify.routes) {
    fetch('/cart.js')
      .then(res => res.json())
      .then(cart => {
        renderCartUI(cart);
      })
      .catch(err => console.warn('Error fetching Shopify cart:', err));
  } else {
    // Modo preview local interactivo con datos auténticos KALPA
    const demoCart = window._demoCart || {
      item_count: 1,
      total_price: 10500,
      items: [
        {
          id: 102,
          title: "KALPA 12-Pack Pro Performance",
          variant_title: "12 x 355ml Sleek Can • Maceración 24H",
          price: 10500,
          quantity: 1,
          image: "assets/kalpa-hero-bg.png"
        }
      ]
    };
    renderCartUI(demoCart);
  }

  function renderCartUI(cart) {
    document.querySelectorAll('#kallpa-cart-count, #intro-cart-count').forEach(b => b.innerText = cart.item_count);

    if (!cart.items || cart.items.length === 0) {
      itemsContainer.innerHTML = `
        <div style="text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
          <p style="font-size: 1.1rem; margin-bottom: 1.5rem;">Tu selección de energía está vacía.</p>
          <button onclick="closeKallpaCart()" class="btn-kallpa btn-kallpa--primary" style="padding: 0.8rem 1.8rem; font-size: 0.85rem;">Descubrir Colección</button>
        </div>
      `;
      if (footerContainer) footerContainer.innerHTML = '';
      return;
    }

    let itemsHtml = '';
    cart.items.forEach(item => {
      itemsHtml += `
        <div style="display: flex; gap: 1rem; align-items: center; padding: 1.25rem 0; border-bottom: 1px solid var(--border-subtle);">
          <img src="${item.image}" alt="${item.title}" style="width: 70px; height: 70px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border-subtle);">
          <div style="flex: 1;">
            <h4 style="font-size: 0.95rem; font-weight: 700; margin: 0; color: var(--text-main);">${item.title}</h4>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0.25rem 0 0.5rem;">${item.variant_title || 'Edición Pro'}</p>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 700; color: var(--accent-gold);">${formatMoney(item.price)}</span>
              <span style="font-size: 0.85rem; color: var(--text-muted);">Cant: ${item.quantity}</span>
            </div>
          </div>
        </div>
      `;
    });
    itemsContainer.innerHTML = itemsHtml;

    if (footerContainer) {
      footerContainer.innerHTML = `
        <div style="padding-top: 1.5rem;">
          <div style="display: flex; justify-content: space-between; font-size: 1.1rem; font-weight: 700; margin-bottom: 1.25rem;">
            <span>Subtotal</span>
            <span style="color: var(--accent-gold);">${formatMoney(cart.total_price)}</span>
          </div>
          <a href="/checkout" class="btn-kallpa btn-kallpa--primary" style="width: 100%; text-align: center;">
            Proceder al Checkout
          </a>
        </div>
      `;
    }
  }
};

// Agregar producto al carrito
window.addToCartKallpa = function(variantId, quantity = 1) {
  if (window.Shopify && window.Shopify.routes) {
    fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: variantId, quantity: quantity })
    })
    .then(res => res.json())
    .then(() => {
      openKallpaCart();
    })
    .catch(err => console.error(err));
  } else {
    // Demo interactivo local
    window._demoCart = window._demoCart || { item_count: 0, total_price: 0, items: [] };
    window._demoCart.item_count += quantity;
    window._demoCart.total_price += 1190 * quantity;
    window._demoCart.items.push({
      id: Date.now(),
      title: "COLD BREW ORIGINAL",
      variant_title: "355ml Sleek Can • Maceración 24H",
      price: 1190,
      quantity: quantity,
      image: "assets/prod-original.jpg"
    });
    openKallpaCart();
  }
};

// Agregar producto individual desde el catálogo del mockup
window.addKallpaToCart = function(title, priceSol, image) {
  const priceCents = Math.round(priceSol * 100);
  window._demoCart = window._demoCart || { item_count: 0, total_price: 0, items: [] };
  window._demoCart.item_count += 1;
  window._demoCart.total_price += priceCents;
  window._demoCart.items.push({
    id: Date.now(),
    title: title,
    variant_title: "355ml Sleek Can • Café del VRAEM",
    price: priceCents,
    quantity: 1,
    image: image || "assets/prod-original.jpg"
  });
  openKallpaCart();
};

// 4. Inicialización al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
  initBentoGlow();
  initAnimatedCounters();
});


// ==========================================
// CONTROLADOR DEL CARRUSEL DE PRODUCTOS (SLIDE 1 & SLIDE 2)
// ==========================================
let currentProductSlide = 0;
const totalProductSlides = 2;

function syncProductSlideHeights() {
  if (window.innerWidth <= 860) {
    const slide1 = document.getElementById('product-slide-1');
    if (slide1) {
      slide1.style.height = '';
      slide1.style.minHeight = '';
    }
    return;
  }
  const slide0 = document.getElementById('product-slide-0');
  const slide1 = document.getElementById('product-slide-1');
  if (slide0 && slide1) {
    const h0 = slide0.offsetHeight;
    if (h0 > 350) {
      slide1.style.height = h0 + 'px';
      slide1.style.minHeight = h0 + 'px';
    }
  }
}

window.goToProductSlide = function(index) {
  if (index < 0) index = totalProductSlides - 1;
  if (index >= totalProductSlides) index = 0;
  currentProductSlide = index;

  if (currentProductSlide === 1) {
    syncProductSlideHeights();
  }

  for (let i = 0; i < totalProductSlides; i++) {
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

window.addPackToKallpaCart = function(packId, name, price) {
  document.querySelectorAll('#kallpa-cart-count, #intro-cart-count').forEach(countEl => {
    const current = parseInt(countEl.textContent || '0');
    countEl.textContent = current + 1;
  });

  const drawer = document.getElementById('kallpa-cart-drawer');
  if (drawer) {
    const body = drawer.querySelector('.cart-drawer-body');
    if (body) {
      const empty = body.querySelector('.cart-empty');
      if (empty) empty.remove();

      const item = document.createElement('div');
      item.className = 'cart-drawer-item';
      item.innerHTML = `
        <div class="cart-item-info" style="display:flex; justify-content:space-between; align-items:center; width:100%; padding:0.75rem 0; border-bottom:1px solid rgba(255,255,255,0.08);">
          <div>
            <div style="font-weight:700; color:#fff;">${name}</div>
            <div style="font-size:0.8rem; color:#888;">Agregado recientemente</div>
          </div>
          <div style="font-weight:800; color:#fdb515;">S/ ${price.toFixed(2)}</div>
        </div>
      `;
      body.appendChild(item);
    }
  }

  if (typeof openKallpaCart === 'function') {
    openKallpaCart();
  }
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
