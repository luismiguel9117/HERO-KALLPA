# ⚡ Bitácora de Desarrollo - HERO-KALLPA

Documento técnico del estado actual del proyecto, mejoras aplicadas y especificación de las fases de desarrollo.

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

### B. Sección: *"NUESTRO PRODUCTO"* (Carrusel Interactivo de Productos)
* **Objetivo:** Transformar la sección `#products-section` en un carrusel dinámico limpio entre los dos productos principales de la marca, asegurando proporciones idénticas a los mockups:

#### 1. Diapositiva 1: **KALPA ORIGINAL (Cold Brew en Lata 355ml)**
* **Corrección de Altura y Base:**
  * Se restauró la estructura original del commit `4e3199f` con `padding: 2.2rem 0 0` (0 padding inferior).
  * La base de roca volcánica, hielos y granos queda **completamente al ras del borde inferior** (`align-self: end; margin-bottom: -14px; bottom: -2%`), eliminando cualquier franja o brecha vacía debajo de la lata.
  * Se eliminó el conflicto de flujo donde la segunda diapositiva ocupaba espacio invisible debajo.
* **Elementos:**
  * Fondo crema cálido con gradiente radial exclusivo de la diapositiva.
  * Composición central de la lata 355 ml con hielos y roca volcánica.
  * 4 sellos circulares de atributos (0 Calorías, Sin azúcares, Listo para tomar, Cold Brew).
  * Tarjeta dual de compra (Unidad a S/ 7.90 con contador y Pack x 6 a S/ 39.90 con descuento).

#### 2. Diapositiva 2: **KALPA CAFÉ MOLIDO (Lata de Especialidad 500g)**
* **Control de Escala y Proporción Exacta al Mockup:**
  * **Corrección de Tamaño:** Se ajustó la altura del contenedor a `clamp(390px, 32vw, 460px)` con `max-height: 470px` y `background-size: contain no-repeat #070c09`, evitando que la lata de 500g se agrande desproporcionadamente o se recorte verticalmente.
  * **Integración Visual del Fondo HD:** El fondo panorámico (`assets/kalpa-molido-bg.png`) se muestra con sus proporciones naturales (2.33:1), dejando ver el cielo andino superior (50px+), el valle montañoso y la base de saco de yute con café, exactamente como en la referencia de diseño (`media_1793121547687_678c4fd5.png`).
  * **Distribución de Columnas:**
    * **Columna izquierda:** Bloque editorial (ancho ~340-375px) alineado sobre el fondo oscuro sin invadir la lata central. 4 insignias circulares doradas y botón `VER FICHA TÉCNICA →`.
    * **Centro:** Espacio visual despejado que encuadra la lata metálica verde de 500g.
    * **Columna derecha:** Tarjeta flotante compacta de compra (ancho ~260-275px) con selector 500g / Pack x 6 (-15%) y botón `AGREGAR AL CARRITO 🛒`.

#### 3. Arquitectura del Carrusel:
* **Aislamiento de Clases:** Se utiliza `.kalpa-product-carousel-track` para evitar colisiones con el carrusel del Hero.
* **Visibilidad Estricta:** Regla `display: none !important;` en diapositivas inactivas para que no interfieran en la altura ni en el flujo del layout de la diapositiva activa.
* **Flechas Laterales:** Botones circulares translúcidos `<` y `>` con efecto hover ámbar para navegar entre productos.
* **Soporte Táctil:** Gesto swipe en dispositivos móviles.

---

## 🌐 2. Entorno de Pruebas
* **Servidor local:** Activo en `http://localhost:3333/`
* **Rama Git:** `main`
* **Repositorio Remoto:** `https://github.com/luismiguel9117/HERO-KALLPA.git`
