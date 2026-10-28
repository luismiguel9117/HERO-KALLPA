/**
 * KALPA Reusable Components Controller:
 * Handles Navbar, Footer, Mobile Menu Drawer & Cross-Page State
 */

(function () {
  'use strict';

  // 1. Mobile Menu Drawer Controls
  window.openKallpaMobileMenu = function () {
    const overlay = document.getElementById('kalpa-mobile-menu-overlay');
    const drawer = document.getElementById('kalpa-mobile-menu-drawer');
    if (overlay) overlay.classList.add('is-active');
    if (drawer) drawer.classList.add('is-active');
    document.body.style.overflow = 'hidden';
  };

  window.closeKallpaMobileMenu = function () {
    const overlay = document.getElementById('kalpa-mobile-menu-overlay');
    const drawer = document.getElementById('kalpa-mobile-menu-drawer');
    if (overlay) overlay.classList.remove('is-active');
    if (drawer) drawer.classList.remove('is-active');
    document.body.style.overflow = '';
  };

  // 2. Cross-Page Cart Count Sync via LocalStorage
  function syncCartCount() {
    const storedCount = localStorage.getItem('kallpa_cart_count');
    if (storedCount !== null) {
      document.querySelectorAll('#kallpa-cart-count, #intro-cart-count').forEach(el => {
        el.textContent = storedCount;
      });
    }
  }

  // Hook into any cart count update to persist across pages
  const originalOpenCart = window.openKallpaCart;
  if (typeof originalOpenCart === 'function') {
    // Preserve if already defined
  }

  // Watch count elements
  const observer = new MutationObserver(() => {
    const countEl = document.getElementById('kallpa-cart-count');
    if (countEl) {
      const val = countEl.textContent.trim();
      localStorage.setItem('kallpa_cart_count', val);
      const introEl = document.getElementById('intro-cart-count');
      if (introEl && introEl.textContent !== val) {
        introEl.textContent = val;
      }
    }
  });

  // 3. Highlight Active Nav item based on pathname
  function highlightActiveNav() {
    const path = window.location.pathname.toLowerCase();
    const navItems = document.querySelectorAll('.kalpa-nav-item, .kalpa-mobile-menu-link, .kalpa-mobile-item, .footer-horizontal-nav a');
    
    let activeKey = '';
    if (
      path.includes('collections') || 
      path.includes('collection') || 
      path.includes('products') || 
      path.includes('product') || 
      path.includes('productos') || 
      path.includes('producto')
    ) {
      activeKey = 'productos';
    } else if (
      path.includes('nosotros') || 
      path.includes('about') || 
      path.includes('contact')
    ) {
      activeKey = 'nosotros';
    } else if (
      path === '/' || 
      path === '' || 
      path.endsWith('/index.html') || 
      path.endsWith('/index') ||
      path.includes('home')
    ) {
      activeKey = 'inicio';
    }

    if (!activeKey) return;

    navItems.forEach(item => {
      const text = item.textContent.trim().toLowerCase();
      if (
        (activeKey === 'inicio' && text === 'inicio') ||
        (activeKey === 'productos' && text === 'productos') ||
        (activeKey === 'nosotros' && text === 'nosotros')
      ) {
        item.classList.add('is-active');
      } else if (text !== 'promociones') {
        item.classList.remove('is-active');
      }
    });
  }

  // 4. Initialize Components on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', () => {
    syncCartCount();
    highlightActiveNav();

    // Attach click to mobile hamburger buttons
    document.querySelectorAll('.kalpa-nav-hamburger, #kalpa-mobile-menu-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.openKallpaMobileMenu();
      });
    });

    // Close mobile menu when clicking any link inside it
    document.querySelectorAll('.kalpa-mobile-menu-link').forEach(link => {
      link.addEventListener('click', () => {
        window.closeKallpaMobileMenu();
      });
    });

    // Observe cart count element if present
    const countEl = document.getElementById('kallpa-cart-count');
    if (countEl) {
      observer.observe(countEl, { childList: true, characterData: true, subtree: true });
    }
  });

})();
