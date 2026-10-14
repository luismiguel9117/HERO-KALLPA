# ⚡ HERO-KALLPA : Manual de Arquitectura de Tema Shopify OS 2.0
### Integración Nativa de Three.js WebGL, GSAP ScrollTrigger & Físicas 2D

> **Estado:** 🚀 PRODUCCIÓN & COMPATIBILIDAD SHOPIFY OS 2.0  
> **Concepto:** Energía, Rendimiento Celular & Animaciones 3D Cinematográficas a 60 FPS  
> **Repositorio Oficial:** `https://github.com/luismiguel9117/HERO-KALLPA.git`

---

## 1. Visión Técnica: De "Next.js + R3F" a Shopify Nativo

Muchos desarrolladores creen erróneamente que para tener una experiencia 3D cinematográfica como la de **Next.js + React Three Fiber + GSAP**, es obligatorio montar una arquitectura Headless compleja (pagando servidores en Vercel y perdiendo el Theme Editor de Shopify).

En **HERO-KALLPA** demostramos la arquitectura inversa de máxima eficiencia:
*   **Contenido, SEO y Checkout:** Gestionados al 100% por **Shopify Liquid OS 2.0**.
*   **Personalización Visual en Vivo:** Todas las secciones y bloques cuentan con esquemas JSON (`{% schema %}`) y atributos de inspección (`{{ block.shopify_attributes }}`), permitiendo al comerciante editar textos, métricas y colores directamente en el personalizador sin tocar código.
*   **Motor 3D WebGL (Three.js):** Encapsulado en `assets/hero-3d-scene.js`. Renderiza modelos GLB/GLTF reales o un núcleo procedural reactivo de energía con sombras, luces de estudio y optimización de batería vía `IntersectionObserver`.
*   **Cinemática (GSAP + ScrollTrigger):** Orquesta la intro de la cámara 3D, el parallax del cursor y las transiciones de scroll a 60 FPS.
*   **Partículas 2D (Canvas API):** En `assets/hero-2d-canvas.js`, genera chispas de energía ascendentes y estela interactiva al mover el puntero.

---

## 2. Estructura de Directorios (Estándar Estricto de Shopify)

```
HERO-KALLPA/
├── assets/                     # Scripts 3D, GSAP, CSS HSL y loaders
│   ├── GLTFLoader.js           # Cargador Three.js para modelos 3D (.glb/.gltf)
│   ├── ScrollTrigger.min.js    # Plugin de GSAP para sincronizar scroll y 3D
│   ├── gsap.min.js             # Motor de cinemática y easing
│   ├── hero-2d-canvas.js       # Motor 2D de partículas y estela del mouse
│   ├── hero-3d-scene.js        # Controlador principal WebGL Three.js
│   ├── theme.css               # Sistema de diseño con variables HSL
│   ├── theme.js                # Carrito AJAX, Bento Glow y contadores
│   └── three.min.js            # Three.js r128 optimizado
├── config/
│   ├── settings_data.json      # Valores por defecto de la tienda
│   └── settings_schema.json    # Opciones globales en el Theme Editor
├── layout/
│   ├── password.liquid         # Pantalla privada de pre-lanzamiento
│   └── theme.liquid            # Wrapper global con scripts diferidos (defer)
├── locales/
│   ├── en.default.json         # Traducción Inglés
│   └── es.json                 # Traducción Español
├── sections/                   # Módulos Liquid editables en el Theme Editor
│   ├── footer.liquid           # Pie de página con newsletter
│   ├── header.liquid           # Cabecera fija glassmorphic con carrito
│   ├── hero-kallpa-3d.liquid   # Hero insignia con Viewport 3D y bloques
│   ├── kallpa-3d-product-showcase.liquid # Inspección 3D y hotspots
│   ├── kallpa-features-grid.liquid       # Bento Grid 2D interactivo
│   ├── kallpa-stats-ticker.liquid        # Marquee infinito de alto impacto
│   └── product-grid.liquid     # Colección con Quick Add al carrito
├── snippets/                   # Componentes atómicos reutilizables
│   ├── card-product.liquid     # Tarjeta de producto con aspect-ratio
│   ├── icon-arrow.liquid
│   ├── icon-cart.liquid
│   ├── icon-check.liquid
│   └── icon-energy.liquid
├── templates/                  # Plantillas modulares JSON (OS 2.0)
│   ├── 404.json
│   ├── collection.json
│   ├── index.json              # Home page con el orden de secciones
│   ├── page.about.json
│   └── product.json
├── index.html                  # Previsualizador web local interactivo
└── package.json                # Scripts para desarrollo local y Shopify CLI
```

---

## 3. Integración de la Lata 3D (`Lata-3d-`) y Flujo de Merge

El elemento 3D principal del Hero es la **Lata de Aluminio Ultra-HD KALPA (128 segmentos radiales)** vinculada al repositorio oficial:
👉 `https://github.com/luismiguel9117/Lata-3d-.git`

### 3.1 Arquitectura de Sincronización y Merge
Para permitir actualizaciones continuas sin romper la estructura de Shopify, la lata está vinculada mediante **Git Subtree** en la carpeta `lata-3d/` y con el remote `lata-repo`.

### 3.2 ¿Cómo actualizar la lata cuando haya cambios en `Lata-3d-`?
Simplemente ejecuta en tu consola:
```bash
npm run merge:can
```
Este comando ejecuta automáticamente:
1. `git subtree pull --prefix=lata-3d lata-repo main --squash` (Realiza el merge trayendo los últimos cambios del repositorio de la lata).
2. `node scripts/sync-can-assets.js` (Copia las texturas actualizadas `T_BeerCan_Kalpa.png`, normales y RMAO a `assets/`).

### 3.3 Cargar Otros Modelos GLB / GLTF Externos
Si además deseas cargar modelos GLB adicionales desde el admin de Shopify:
1. En tu panel de Shopify, ve a **Contenido > Archivos** (`Content > Files`).
2. Sube tu archivo `.glb`.
3. Pega la URL en el Theme Editor en el campo **URL del Modelo GLB / GLTF**.

---

## 4. Comandos de Terminal para Desarrollo y Producción

### 4.1 Probar Localmente en el Navegador
Puedes abrir `index.html` directamente en tu navegador o ejecutar:
```bash
npm run dev
# Inicia un servidor web local en http://localhost:3000
```

### 4.2 Conectar con una Tienda Shopify (Shopify CLI v3)
```powershell
# Iniciar servidor sincronizado con el Theme Editor de Shopify
shopify theme dev --store tu-tienda-prueba.myshopify.com --theme-editor-sync

# Descargar configuraciones realizadas en el editor visual
shopify theme pull

# Subir a una ranura de desarrollo inédita sin tocar la tienda en vivo
shopify theme push --unpublished --theme "HERO-KALLPA v1.0"

# Publicar oficialmente en vivo
shopify theme publish
```

---

## 5. Reglas de Rendimiento Aplicadas

1. **Scripts con atributo `defer`:** Three.js y GSAP no bloquean el renderizado del HTML inicial.
2. **IntersectionObserver 3D:** El bucle `requestAnimationFrame` del WebGL se congela cuando el usuario hace scroll hacia abajo y la sección 3D sale de pantalla, liberando el 100% del procesador gráfico del móvil.
3. **Aspect Ratio estricto:** Todas las imágenes y cards usan proporciones matemáticas (`1 / 1` o `16 / 9`) para eliminar por completo el Cumulative Layout Shift (CLS).
4. **Paleta HSL Calibrada:** Evita contrastes duros y permite mutaciones dinámicas de color en tiempo real desde CSS Custom Properties.
