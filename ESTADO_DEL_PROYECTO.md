# ⚡ Bitácora de Desarrollo - HERO-KALLPA
### Tema Oficial Shopify OS 2.0 & Experiencia WebGL 3D / 2D Cinematográfica

Documento técnico del estado actual del proyecto, arquitectura Shopify OS 2.0, mejoras aplicadas y especificación de desarrollo.

---

## 📌 1. Últimos Avances Implementados: Homologación Total a Shopify OS 2.0

### A. Integración del Shopify AI Toolkit y Limpieza de Directorios
* **Objetivo:** Resolver el problema de detección en el entorno de desarrollo de Shopify (`shopify theme dev`) y habilitar el personalizador visual (Theme Editor) al 100%, preservando el diseño actual de forma estricta.
* **Diagnóstico del problema inicial:**
  1. El directorio raíz contenía archivos de previsualización estática (`.html`, `node_modules`, scripts) sin un archivo `.shopifyignore`. Shopify CLI intentaba empaquetar e inspeccionar dependencias ajenas, lo que generaba conflictos de detección y múltiples errores de parseo.
  2. Las secciones Liquid en `sections/` y plantillas en `templates/` estaban desactualizadas respecto a las versiones perfeccionadas en HTML (faltaban los nuevos componentes de Navbar centrada al 50%, Footer con banner de newsletter, Reels & Reseñas unificados y las plantillas de catálogo y detalle).
  3. Múltiples etiquetas `<img>` carecían de atributos explícitos `width` y `height`, lo que provocaba fallos estrictos en `shopify theme check` (regla `ImgWidthAndHeight` para mitigación de Cumulative Layout Shift).
* **Soluciones aplicadas:**
  1. **Instalación de la habilidad oficial de Shopify:** Clonado y configurado el toolkit oficial de Shopify (`Shopify/shopify-ai-toolkit`) en `.agents/skills/shopify/` con todas las referencias técnicas de Liquid, CLI, Admin API y mejores prácticas de OS 2.0.
  2. **Creación de `.shopifyignore`:** Excluye `node_modules/`, `temp_*/`, `lata-3d/`, scripts auxiliares y archivos HTML de prueba local, asegurando que Shopify CLI procese exclusivamente la arquitectura nativa del tema.
  3. **Corrección completa de Theme Check:**
     * Se añadieron dimensiones `width` y `height` a todas las imágenes en Liquid (`sections/` y `snippets/`).
     * Se acortó el nombre del esquema en `sections/kallpa-protocol.liquid` a menos de 25 caracteres.
     * **Resultado:** `npm run shopify:check` finaliza con **0 ERRORES** (código de salida 0).
  4. **Preservación Visual Total:**
     * Cero cambios en estilos (`assets/theme.css`, `assets/kalpa-intro.css`, `assets/products-pages.css`, `assets/nosotros.css`).
     * Motor 3D Three.js, partículas 2D y cinemática GSAP intactos y sincronizados vía CDN de Shopify (`asset_url`).

---

### B. Módulos y Plantillas Shopify OS 2.0 Sincronizados

1. **`layout/theme.liquid`:**
   * Wrapper principal HTML5 con `{{ content_for_header }}` y `{{ content_for_layout }}`.
   * Carga ordenada y diferida (`defer`) de CSS y librerías JS (Three.js importmap, GSAP, ScrollTrigger, `kalpa-intro.js`, `theme.js` y `kalpa-components.js`).
   * Drawer de Carrito AJAX global inyectado dinámicamente.

2. **`sections/header.liquid`:**
   * Announcement bar editable (`section.settings.show_announcement`, texto y enlace).
   * Barra de navegación fija con menú central al 50% de la pantalla (`Inicio`, `Productos`, `Promociones`, `Nosotros`).
   * Soporte para selector de menú nativo de Shopify (`linklists[section.settings.menu]`) con respaldo automático.
   * Drawer modal móvil reactivo.

3. **`sections/footer.liquid`:**
   * Banner de suscripción newsletter superior con lata y granos en primer plano.
   * Fila principal con logo, menú horizontal, enlaces a redes sociales y sello de envíos.
   * Fila inferior con copyright dinámico (`{{ 'now' | date: '%Y' }}`) y enlaces legales.

4. **`sections/kalpa-intro.liquid`:**
   * Preloader cinematográfico con capas de profundidad (Cielo, Cancha, Tipografía editorial, Mano y Lata interactiva con canvas eléctrico).
   * Navbar del preloader alineada y sincronizada con el menú oficial.

5. **`sections/hero-kallpa-3d.liquid`:**
   * 3 diapositivas editables mediante bloques Shopify (`slide_1`, `slide_2`, `slide_3`).
   * Viewport 3D WebGL Three.js con lata Ultra-HD + Viewport 2D cilíndrico interactivo.

6. **`sections/kallpa-ticker.liquid`:**
   * Ticker bar con los 4 sellos de confianza (Granos del VRAEM, Energía Natural, Cold Brew 24H, Envíos a todo el Perú) + Marquee banner infinito.

7. **`sections/kallpa-products.liquid`:**
   * Carrusel de venta directa con 2 diapositivas:
     - Slide 1: KALPA Cold Brew 355ml (Unidad S/ 7.90 | Pack x 6 S/ 39.90).
     - Slide 2: KALPA Café Molido 250g (Unidad S/ 34.90 | Pack x 6 S/ 177.90).
   * Selectores de cantidad, cálculo dinámico y botones de adición directa al carrito.

8. **`sections/kallpa-vraem-origin.liquid`:**
   * Panorama del VRAEM con los 4 pilares andinos e iconografía blanca.

9. **`sections/kallpa-clean-energy.liquid`:**
   * Sección "Más que café, es energía natural" con arte de alta resolución y tipografía en una sola línea.

10. **`sections/kallpa-reels.liquid`:**
    * Sección unificada de Comunidad KALPA con 3 Reels verticales + Carrusel interactivo de reseñas con glassmorphism.

11. **`sections/products-catalog.liquid` (`templates/collection.json` & `templates/page.productos.json`):**
    * Catálogo oficial con hero, filtros por categoría (Cold Brew, Café Molido, Accesorios), selector de ordenamiento, Tarjeta Destacada 01 y Duo Cards 02 & 03.

12. **`sections/main-product.liquid` (`templates/product.json`):**
    * Ficha de producto con breadcrumb, galería de 3 miniaturas, selector de sabores (Original / Orange), selector de packs (Unidad, Tripack, Six-pack, 12-pack), tabla nutricional, cross-sell y acordeón de FAQs.

13. **`sections/page-nosotros.liquid` (`templates/page.nosotros.json` & `templates/page.about.json`):**
    * Historia y origen de KALPA con el arco andino, bento grid de 5 tarjetas de proceso, manifiesto y equipo cafetalero de Ayacucho.

---

## 🛠️ 2. Comandos para Desarrollo y Pruebas

### A. Previsualización Local (Navegador)
```bash
# Iniciar servidor local en el puerto 3333:
python -m http.server 3333
# O mediante npm:
npm start
```
* **URLs de prueba local:**
  * Inicio: `http://localhost:3333/index.html`
  * Catálogo de Productos: `http://localhost:3333/productos.html`
  * Detalle de Producto: `http://localhost:3333/producto.html`
  * Nosotros: `http://localhost:3333/nosotros.html`

### B. Desarrollo en Entorno Shopify (Shopify CLI)
```bash
# 1. Validar integridad y reglas de Shopify:
npm run shopify:check

# 2. Conectar e iniciar servidor de desarrollo con sincronización en vivo del Theme Editor:
npm run shopify:dev -- --store tu-tienda.myshopify.com

# 3. Subir como tema inédito a tu tienda:
npm run shopify:push
```

---

## 🔒 3. Garantía de Fidelidad de Diseño
* **Aspecto 100% idéntico:** Se preservaron sin alteraciones las fuentes (`Outfit`, `Syne`, `Work Sans`), el sistema de colores HSL/Hex (`#0c0e12`, `#fbd132`, `#17f2c6`), los gradientes oscuros, los bordes sutiles y las sombras glassmorphic.
* **Componentes Reutilizables:** Tanto la cabecera como el pie de página operan de manera sincronizada y uniforme en todas las páginas del sitio.
