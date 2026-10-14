# ⚡ HERO-KALLPA : 3D WebGL & GSAP Performance Theme (Shopify OS 2.0)

Tema de Shopify de alta gama diseñado para la marca de rendimiento y energía vital **HERO-KALLPA**. Integra aceleración por hardware WebGL con **Three.js**, cinemática con **GSAP + ScrollTrigger**, partículas 2D interactivas y arquitectura nativa de componentes modulares **Shopify Online Store 2.0 (OS 2.0)**.

---

## 💎 Características Principales

*   **Motor 3D WebGL Nativo (Three.js r128):** Carga directa de modelos `.glb` / `.gltf` con iluminación de estudio, sombras y fallback procedimental a un Núcleo de Energía Kallpa.
*   **Cinemática GSAP + ScrollTrigger:** Cámara 3D sincronizada con el scroll del usuario y parallax de cursor suave con lerp.
*   **Partículas 2D Atmosféricas:** Canvas interactivo con chispas de energía y estela luminosa que sigue el puntero.
*   **Bento Grid con Mouse Glow:** Tarjetas con seguimiento de gradiente radial en hover y contadores numéricos animados.
*   **Inspección 3D con Hotspots:** Puntos interactivos con información de ingeniería del producto.
*   **Carrito AJAX Drawer:** Bandeja deslizante ultra-fluida para añadir productos al instante.
*   **100% Personalizable en Theme Editor:** Textos, botones, colores de energía y modelos 3D son editables sin tocar código.
*   **Previsualizador Web Local Incluido (`index.html`):** Puedes probar toda la tienda, el 3D y las animaciones en tu navegador de inmediato.

---

## 🚀 Inicio Rápido Local

### Opción A: Probar en el Navegador (Sin Shopify aún)
Simplemente abre el archivo `index.html` en tu navegador, o inicia un servidor local:

```bash
npm run dev
# Abrirá la experiencia interactiva en http://localhost:3000
```

### Opción B: Conectar con Shopify CLI
```bash
shopify theme dev --store tu-tienda.myshopify.com --theme-editor-sync
```

---

## 📂 Estructura del Proyecto

*   `assets/`: Hojas de estilo HSL, Three.js, GSAP, scripts de partículas y controladores.
*   `layout/`: Plantillas base (`theme.liquid` y `password.liquid`).
*   `sections/`: Módulos configurables en el editor (`hero-kallpa-3d`, `features-grid`, `showcase`, `product-grid`, `header`, `footer`).
*   `snippets/`: Iconos SVG y tarjeta de producto reutilizable (`card-product.liquid`).
*   `templates/`: Esquemas de página en formato JSON (`index.json`, `product.json`, `collection.json`, etc.).
*   `ShopifyThemeArchitecture.md`: Manual técnico completo de desarrollo y estándares de arquitectura.

---
*Desarrollado para HERO-KALLPA.*
