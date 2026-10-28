const fs = require('fs');

// 1. Update snippets/kallpa-feature-icon.liquid
const featureSnippet = `{%- comment -%}
  Renders a KALPA Feature Badge Icon
  Usage:
  {% render 'kallpa-feature-icon', icon: block.settings.feat_1_icon, custom_image: block.settings.feat_1_custom_icon %}
{%- endcomment -%}

{%- if custom_image != blank -%}
  <img src="{{ custom_image | image_url: width: 64 }}" alt="Icon" width="24" height="24" style="object-fit: contain;">
{%- else -%}
  {%- assign icon_key = icon | default: 'leaf' | strip | downcase -%}
  {%- case icon_key -%}
    {%- when 'leaf', 'arabica', 'hoja' -%}
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
      </svg>
    {%- when 'mountain', 'montana', 'vraem', 'origen' -%}
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="m8 3 4 8 5-5 5 11H2L8 3z"></path>
      </svg>
    {%- when 'filter', 'filtro', 'molienda', 'grind' -%}
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M5 22h14"></path>
        <path d="M5 2h14"></path>
        <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"></path>
        <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"></path>
      </svg>
    {%- when 'flavor', 'sabor', 'notas', 'aroma' -%}
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"></path>
        <circle cx="9" cy="14" r="3"></circle>
        <circle cx="15" cy="14" r="3"></circle>
      </svg>
    {%- when 'drop_zero', 'drop', 'cero', 'calorias', 'gota' -%}
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
      </svg>
      <span class="drop-zero">0</span>
    {%- when 'check', 'azucar', 'verificado' -%}
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
        <line x1="4" y1="4" x2="20" y2="20"></line>
      </svg>
    {%- when 'coffee_can', 'can', 'lata' -%}
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <rect x="6" y="4" width="10" height="17" rx="2"></rect>
        <path d="M16 8h2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"></path>
        <line x1="8" y1="2" x2="14" y2="2"></line>
      </svg>
    {%- when 'snowflake', 'nieve', 'cold_brew', 'refrescante' -%}
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <line x1="12" y1="2" x2="12" y2="22"></line>
        <path d="m20 16-4-4 4-4"></path>
        <path d="m4 8 4 4-4 4"></path>
        <path d="m16 4-4 4-4-4"></path>
        <path d="m8 20 4-4 4 4"></path>
      </svg>
    {%- when 'lightning', 'energy', 'rayo', 'energia' -%}
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
      </svg>
    {%- when 'clock', 'reloj', 'tiempo', 'time' -%}
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
    {%- when 'coffee_cup', 'taza', 'cup' -%}
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
        <line x1="6" y1="1" x2="6" y2="4"></line>
        <line x1="10" y1="1" x2="10" y2="4"></line>
        <line x1="14" y1="1" x2="14" y2="4"></line>
      </svg>
    {%- when 'heart', 'corazon', 'salud' -%}
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
    {%- when 'star', 'estrella', 'calidad' -%}
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
    {%- else -%}
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
      </svg>
  {%- endcase -%}
{%- endif -%}
`;
fs.writeFileSync('snippets/kallpa-feature-icon.liquid', featureSnippet, 'utf8');
console.log('Updated kallpa-feature-icon.liquid with all aliases');

// 2. Update assets/theme.css
let css = fs.readFileSync('assets/theme.css', 'utf8');

// Replace container and grid
const targetCont = `.kalpa-sale-container {
  position: relative;
  z-index: 5;
  width: 100%;
  max-width: 1340px;
  margin: 0 auto;
  padding: 0 clamp(1.5rem, 3vw, 3.5rem);
  box-sizing: border-box;
}

.kalpa-sale-grid {
  display: grid;
  grid-template-columns: minmax(310px, 350px) 1fr minmax(320px, 430px);
  gap: clamp(1.75rem, 3.2vw, 3.5rem);
  align-items: center;
  width: 100%;
  box-sizing: border-box;
}`;

const replCont = `.kalpa-sale-container {
  position: relative;
  z-index: 5;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 clamp(1.5rem, 3.5vw, 4rem);
  box-sizing: border-box;
}

.kalpa-sale-grid {
  display: grid;
  grid-template-columns: minmax(290px, 330px) 1.15fr minmax(320px, 420px);
  gap: clamp(2.5rem, 4.5vw, 5.5rem);
  align-items: center;
  width: 100%;
  box-sizing: border-box;
}`;

if (css.includes(targetCont.replace(/\n/g, '\r\n'))) {
  css = css.replace(targetCont.replace(/\n/g, '\r\n'), replCont.replace(/\n/g, '\r\n'));
} else if (css.includes(targetCont.replace(/\r\n/g, '\n'))) {
  css = css.replace(targetCont.replace(/\r\n/g, '\n'), replCont.replace(/\r\n/g, '\n'));
}

// Ensure .kalpa-sale__info has max-width: 330px
css = css.replace(
  '.kalpa-sale__info {\n  display: flex;\n  flex-direction: column;\n  align-items: flex-start;\n  position: relative;\n  z-index: 6;\n  width: 100%;\n  max-width: 360px;',
  '.kalpa-sale__info {\n  display: flex;\n  flex-direction: column;\n  align-items: flex-start;\n  position: relative;\n  z-index: 10;\n  width: 100%;\n  max-width: 330px;'
).replace(
  '.kalpa-sale__info {\r\n  display: flex;\r\n  flex-direction: column;\r\n  align-items: flex-start;\r\n  position: relative;\r\n  z-index: 6;\r\n  width: 100%;\r\n  max-width: 360px;',
  '.kalpa-sale__info {\r\n  display: flex;\r\n  flex-direction: column;\r\n  align-items: flex-start;\r\n  position: relative;\r\n  z-index: 10;\r\n  width: 100%;\r\n  max-width: 330px;'
);

// Ensure .sale-description has max-width: 320px
css = css.replace(
  '.sale-description {\n  font-size: 0.96rem;\n  line-height: 1.5;\n  color: #4a4138;\n  margin: 0 0 1.65rem 0;\n  max-width: 365px;',
  '.sale-description {\n  font-size: 0.96rem;\n  line-height: 1.5;\n  color: #4a4138;\n  margin: 0 0 1.65rem 0;\n  max-width: 320px;'
).replace(
  '.sale-description {\r\n  font-size: 0.96rem;\r\n  line-height: 1.5;\r\n  color: #4a4138;\r\n  margin: 0 0 1.65rem 0;\r\n  max-width: 365px;',
  '.sale-description {\r\n  font-size: 0.96rem;\r\n  line-height: 1.5;\r\n  color: #4a4138;\r\n  margin: 0 0 1.65rem 0;\r\n  max-width: 320px;'
);

// Sizing for sale-can-stage--molido and sale-stage__can--molido
const targetMolido = `.sale-can-stage--molido {
  position: relative;
  width: clamp(260px, 22vw, 320px);
  height: clamp(490px, 41vw, 570px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  margin-bottom: -16px;
  overflow: visible;
}

.sale-stage__can--molido {
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  height: 102%;
  width: auto;
  max-width: none;
  object-fit: contain;
  pointer-events: none;
  user-select: none;
  filter: drop-shadow(0 20px 38px rgba(35, 15, 5, 0.42));
}`;

const replMolido = `.sale-can-stage--molido {
  position: relative;
  width: clamp(240px, 19vw, 280px);
  height: clamp(460px, 37vw, 530px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  margin-bottom: -14px;
  overflow: visible;
}

.sale-stage__can--molido {
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  height: 86%;
  width: auto;
  max-width: none;
  object-fit: contain;
  pointer-events: none;
  user-select: none;
  filter: drop-shadow(0 18px 32px rgba(35, 15, 5, 0.38));
}`;

if (css.includes(targetMolido.replace(/\n/g, '\r\n'))) {
  css = css.replace(targetMolido.replace(/\n/g, '\r\n'), replMolido.replace(/\n/g, '\r\n'));
} else if (css.includes(targetMolido.replace(/\r\n/g, '\n'))) {
  css = css.replace(targetMolido.replace(/\r\n/g, '\n'), replMolido.replace(/\r\n/g, '\n'));
}

fs.writeFileSync('assets/theme.css', css, 'utf8');
console.log('Updated theme.css with spacious layout for molido');

// 3. Update theme.js to handle shopify:block:select
let js = fs.readFileSync('assets/theme.js', 'utf8');
if (!js.includes('shopify:block:select')) {
  js += `\n
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
`;
  fs.writeFileSync('assets/theme.js', js, 'utf8');
  console.log('Added Shopify Theme Editor listeners to theme.js');
}

console.log('Done!');
