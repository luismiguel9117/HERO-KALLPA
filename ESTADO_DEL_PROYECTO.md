# ⚡ Bitácora de Desarrollo - HERO-KALLPA

Documento técnico del estado actual del proyecto, mejoras aplicadas y especificación de la siguiente fase de desarrollo.

---

## 📌 1. Últimos Avances Implementados y Desplegados

### A. Sección: *"MÁS QUE CAFÉ, ES ENERGÍA NATURAL"* (Banner Cinematográfico)
* **Objetivo:** Alinear al 100% la sección con el mockup de referencia (`media_1793049730125_f376bd6b.png`).
* **Mejoras aplicadas:**
  1. **Integración del arte visual completo:** Se incorporó el asset de alta resolución original (`assets/energy-natural-composition.png`), el cual incluye:
     * El grano de café central con hendidura de rayo luminoso y salpicaduras líquidas de borde a borde.
     * El segundo grano gigante desenfocado en primer plano ubicado en la esquina inferior derecha.
     * La atmósfera envolvente de humo oscuro y partículas de café fundiéndose naturalmente hacia el texto.
  2. **Perfeccionamiento tipográfico:**
     * `MÁS QUE CAFÉ,`: tipografía sans-serif ligera en blanco con tracking sutil.
     * `ES ENERGÍA NATURAL`: fijado estrictamente en **una sola línea** (`white-space: nowrap`), peso ultra bold en tono dorado cálido (`#f5ba2c`) con resplandor ambiental (*drop-shadow/glow*).
     * Barra de acento horizontal superior en tono naranja/cobre.
     * Párrafo descriptivo estructurado en 3 líneas perfectamente balanceadas con contraste optimizado.
* **Archivos modificados:** [index.html](file:///c:/Users/Usuario/Desktop/HERO%20ANIMATION/index.html), [assets/theme.css](file:///c:/Users/Usuario/Desktop/HERO%20ANIMATION/assets/theme.css).
* **Commit:** `e8a5a7b` (*fix(banner): align Más que café banner with original mockup composition and typography*).

---

## 🚀 2. En Proceso: Carrusel Interactivo en la Sección *"NUESTRO PRODUCTO"*

### Objetivo General
Transformar la actual sección de producto estática (`#products-section`) en un **carrusel de productos interactivo** de dos diapositivas que permita al usuario alternar fluidamente entre las dos líneas principales de la marca:

---

### Diapositiva 1: **KALPA ORIGINAL (Café Cold Brew en Lata 355ml)**
* **Fondo visual:** Gradiente radial cálido en tonos crema/arena (`#fbf4e6` a `#ede0ce`).
* **Composición central:** 
  * Lata vertical KALPA Original 355ml.
  * Hielos flotantes translúcidos y granos de café envolventes.
  * Base de piedra volcánica sólida y granos tostados.
* **Bloque editorial (Izquierda):**
  * Ceja: `NUESTRO PRODUCTO`.
  * Título: `KALPA ORIGINAL` (estilo itálico impactante).
  * Descripción de origen VRAEM y 280 mg de cafeína natural.
  * Enlace: `VER FICHA COMPLETA →` hacia [producto.html](file:///c:/Users/Usuario/Desktop/HERO%20ANIMATION/producto.html).
  * 4 sellos circulares:
    * `0 CALORÍAS`
    * `SIN AZÚCARES AÑADIDOS`
    * `LISTO PARA TOMAR`
    * `COLD BREW REFRESCANTE`
* **Caja de compra dual (Derecha):**
  * Opción A (Unidad): S/ 7.90 (355 ml) con contador de unidades `[-] [1] [+]`.
  * Opción B (Pack x 6): S/ 39.90 (antes S/ 47.40, -15% OFF) con render de las 6 latas escalonadas.

---

### Diapositiva 2: **KALPA CAFÉ MOLIDO (Lata Metálica Especialidad 500g)**
* **Fondo visual:** Fotografía panorámica andina en alta resolución (`assets/kalpa-molido-bg.jpg` / `Café Kallpa entre montañas andinas.png`):
  * Paisaje montañoso del VRAEM al amanecer.
  * Lata metálica verde de 500g reposando sobre saco de yute y granos de café tostados.
  * Cuchara de madera con café molido grueso especial para Cold Brew.
* **Bloque editorial (Izquierda):**
  * Barra de acento dorado superior.
  * Ceja: `NUESTRO PRODUCTO` en tipografía dorada.
  * Título: `KALPA` (blanco metálico en cursiva) + `CAFÉ MOLIDO` (amarillo dorado brillante `#f5ba2c`).
  * Descripción: *"Café tostado y molido de especialidad, con notas de cereza, chocolate y manzana. Cultivado en los Andes peruanos para tu Cold Brew."*
  * 4 sellos circulares de especialidad:
    1. `100% OBATA` (icono de grano de café).
    2. `ORIGEN VRAEM` (icono de cumbres montañosas).
    3. `IDEAL PARA COLD BREW` (icono de copa / extracción).
    4. `NOTAS A CEREZA, CHOCOLATE Y MANZANA` (icono de hoja botánica).
  * Botón de acción: `VER FICHA TÉCNICA →` en pastilla dorada con texto negro.
* **Caja de compra oscura (Derecha):**
  * Encabezado: `PRESENTACIÓN`.
  * Selector de variantes:
    * `500 g` (seleccionado con borde dorado activo).
    * `Pack x 6` (con etiqueta roja `-15%`).
  * Precio: `S/ 39.90`.
  * Stepper de cantidad: `[-] 1 [+]`.
  * Botón de compra: `AGREGAR AL CARRITO 🛒` en pastilla amarilla/dorada con icono de carrito.

---

## 🛠️ 3. Plan de Implementación Técnica del Carrusel

1. **Estructura HTML (`index.html`):**
   * Contenedor envolvente `.kalpa-product-carousel` con track deslizable / crossfade.
   * Dos diapositivas `.kalpa-carousel-slide--original` y `.kalpa-carousel-slide--molido`.
   * Flechas de navegación lateral (prev / next) con diseño sutil y elegante.
   * Indicadores de paginación inferiores (dots interactivos).
2. **Estilos CSS (`assets/theme.css`):**
   * Transición fluida de opacidad/transformación con aceleración por GPU.
   * Soporte adaptativo para desktop (1440px+), laptops, tablets y móviles.
   * Tarjeta oscura flotante con `backdrop-filter: blur(12px)` para la diapositiva de Café Molido.
3. **Lógica JavaScript (`assets/theme.js` o inline):**
   * Funciones para navegación por flechas y dots (`goToSlide(index)`).
   * Soporte de gestos táctiles (swipe) en dispositivos móviles.
   * Conexión con el carrito existente `addPackToKallpaCart()` para ambos productos.

---

## 🌐 4. Entorno de Pruebas
* **Servidor local:** `http://localhost:3333/`
* **Rama Git:** `main`
* **Repositorio Remoto:** `https://github.com/luismiguel9117/HERO-KALLPA.git`
