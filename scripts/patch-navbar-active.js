const fs = require('fs');

// 1. Update assets/kalpa-components.js
let compJs = fs.readFileSync('assets/kalpa-components.js', 'utf8');

const targetJs = `  // 3. Highlight Active Nav item based on pathname
  function highlightActiveNav() {
    const path = window.location.pathname.toLowerCase();
    const navItems = document.querySelectorAll('.kalpa-nav-item, .kalpa-mobile-menu-link, .footer-horizontal-nav a');
    
    let activeKey = 'inicio';
    if (path.includes('productos') || path.includes('producto')) {
      activeKey = 'productos';
    } else if (path.includes('nosotros')) {
      activeKey = 'nosotros';
    } else {
      activeKey = 'inicio';
    }

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
  }`;

const replJs = `  // 3. Highlight Active Nav item based on pathname
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
  }`;

let normTargetJs = targetJs.replace(/\r\n/g, '\n');
let normCompJs = compJs.replace(/\r\n/g, '\n');

if (normCompJs.includes(normTargetJs)) {
  compJs = normCompJs.replace(normTargetJs, replJs.replace(/\r\n/g, '\n'));
  fs.writeFileSync('assets/kalpa-components.js', compJs, 'utf8');
  console.log('Successfully updated assets/kalpa-components.js');
} else {
  console.log('Target not found in kalpa-components.js');
}

// 2. Update sections/header.liquid
let header = fs.readFileSync('sections/header.liquid', 'utf8');

const targetHeaderNav = `<nav class="kalpa-nav-menu" aria-label="Navegación principal">
      <a href="{{ routes.root_url }}" class="kalpa-nav-item{% if request.path == routes.root_url %} is-active{% endif %}">Inicio</a>
      <a href="{{ routes.all_products_collection_url }}" class="kalpa-nav-item{% if request.path contains 'collections' or request.path contains 'productos' %} is-active{% endif %}">Productos</a>
      <a href="{{ routes.root_url }}#origin-section" class="kalpa-nav-item">Promociones</a>
      <a href="/pages/nosotros" class="kalpa-nav-item{% if request.path contains 'nosotros' or request.path contains 'about' %} is-active{% endif %}">Nosotros</a>
    </nav>`;

const replHeaderNav = `<nav class="kalpa-nav-menu" aria-label="Navegación principal">
      <a href="{{ routes.root_url }}" class="kalpa-nav-item{% if template.name == 'index' or request.path == routes.root_url %} is-active{% endif %}">Inicio</a>
      <a href="{{ routes.all_products_collection_url }}" class="kalpa-nav-item{% if template.name == 'collection' or template.name == 'product' or request.path contains 'collections' or request.path contains 'products' or request.path contains 'productos' %} is-active{% endif %}">Productos</a>
      <a href="{{ routes.root_url }}#origin-section" class="kalpa-nav-item">Promociones</a>
      <a href="/pages/nosotros" class="kalpa-nav-item{% if template.name == 'page' and page.handle contains 'nosotros' or page.handle contains 'contact' or request.path contains 'nosotros' or request.path contains 'about' %} is-active{% endif %}">Nosotros</a>
    </nav>`;

let normTargetHeader = targetHeaderNav.replace(/\r\n/g, '\n');
let normHeader = header.replace(/\r\n/g, '\n');

if (normHeader.includes(normTargetHeader)) {
  header = normHeader.replace(normTargetHeader, replHeaderNav.replace(/\r\n/g, '\n'));
}

// Mobile fallback links in header
const targetMobileLinks = `        <a href="{{ routes.root_url }}" class="kalpa-mobile-item{% if request.path == routes.root_url %} is-active{% endif %}" onclick="closeKallpaMobileMenu()">Inicio</a>
        <a href="{{ routes.all_products_collection_url }}" class="kalpa-mobile-item{% if request.path contains 'collections' or request.path contains 'productos' %} is-active{% endif %}" onclick="closeKallpaMobileMenu()">Productos</a>
        <a href="{{ routes.root_url }}#origin-section" class="kalpa-mobile-item" onclick="closeKallpaMobileMenu()">Promociones</a>
        <a href="/pages/nosotros" class="kalpa-mobile-item{% if request.path contains 'nosotros' or request.path contains 'about' %} is-active{% endif %}" onclick="closeKallpaMobileMenu()">Nosotros</a>`;

const replMobileLinks = `        <a href="{{ routes.root_url }}" class="kalpa-mobile-item{% if template.name == 'index' or request.path == routes.root_url %} is-active{% endif %}" onclick="closeKallpaMobileMenu()">Inicio</a>
        <a href="{{ routes.all_products_collection_url }}" class="kalpa-mobile-item{% if template.name == 'collection' or template.name == 'product' or request.path contains 'collections' or request.path contains 'products' or request.path contains 'productos' %} is-active{% endif %}" onclick="closeKallpaMobileMenu()">Productos</a>
        <a href="{{ routes.root_url }}#origin-section" class="kalpa-mobile-item" onclick="closeKallpaMobileMenu()">Promociones</a>
        <a href="/pages/nosotros" class="kalpa-mobile-item{% if template.name == 'page' and page.handle contains 'nosotros' or page.handle contains 'contact' or request.path contains 'nosotros' or request.path contains 'about' %} is-active{% endif %}" onclick="closeKallpaMobileMenu()">Nosotros</a>`;

normHeader = header.replace(/\r\n/g, '\n');
let normTargetMobile = targetMobileLinks.replace(/\r\n/g, '\n');
if (normHeader.includes(normTargetMobile)) {
  header = normHeader.replace(normTargetMobile, replMobileLinks.replace(/\r\n/g, '\n'));
}

fs.writeFileSync('sections/header.liquid', header, 'utf8');
console.log('Successfully updated sections/header.liquid');
