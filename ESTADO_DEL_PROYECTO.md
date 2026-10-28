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
* **Archivos modificados:** [index.html](file:///g:/Descargas/PAGINA%20DE%20KALLPA/index.html), [assets/theme.css](file:///g:/Descargas/PAGINA%20DE%20KALLPA/assets/theme.css).

---

### B. Sección: *"HERO"* (Composición de Lata 2D y Resplandor)
* **Objetivo:** Equilibrar el espacio visual del Hero y evitar que la lata y sus elementos satélites (cubos de hielo, granos flotantes, base de roca volcánica y flecha de navegación derecha) queden apretados contra el borde derecho de la pantalla (`media_1793163682188_d87b2a56.png`).
* **Ajustes:**
  * **Desplazamiento horizontal a la izquierda:**
    * `.hero-kallpa-can-wrapper`: reposicionado de `right: 13%` a `right: 21%` (y de `6%` a `12%` en tablets).
    * `.kalpa-hero__glow` / `.kalpa-hero__backlight`: sincronizado de `right: 14%` a `right: 22%` para mantener el halo y flare perfectamente calibrados detrás del rim de la lata.
  * **Resultado:** Se genera un margen holgado en el lateral derecho, integrando la lata de manera armónica entre el texto editorial y los límites de la pantalla.

---

### C. Sección: *"NUESTRO PRODUCTO"* (Separación de Recuadros y Anclaje Fijo entre Diapositivas)
* **Objetivo:** Responder a la solicitud (`media_1793164058050_abc704cd.png`) de separar significativamente el bloque editorial izquierdo y la tarjeta de compra derecha para despejar por completo la lata central, garantizando que **ambos recuadros salgan siempre en la misma posición** en todas las diapositivas.
* **Mejoras aplicadas:**
  1. **Expansión del Contenedor a 1440px:**
     * Se amplió el ancho de `.kalpa-sale-container` y `.kalpa-molido-container` de `1260px` a `1440px` con padding `0 clamp(1.5rem, 3.5vw, 4rem)`.
     * Esto otorgó de inmediato más de 180px adicionales de separación lateral.
  2. **Estructura Grid Unificada e Idéntica:**
     * Tanto `.kalpa-sale-grid` como `.kalpa-molido-grid` comparten la misma regla:
       `grid-template-columns: minmax(320px, 360px) 1fr minmax(320px, 440px); gap: clamp(2rem, 4vw, 4.5rem); align-items: center;`
     * **Columna 1 (Izquierda):** Bloque editorial anclado a `justify-self: start; width: 100%; max-width: 360px; margin: 0; padding: 0;`.
     * **Columna 2 (Centro):** `1fr` dedicado exclusivamente al producto protagonista (Lata 355ml en Slide 1 y Lata 250g en Slide 2), libre de solapamientos con los textos o las tarjetas.
     * **Columna 3 (Derecha):** Tarjeta de compra (`.kalpa-sale__buy-box`) anclada a `justify-self: end; margin: 0;`.
  3. **Estabilidad Geométrica al Navegar:**
     * Al cambiar entre productos con las flechas `<` y `>`, ni el bloque de información izquierdo ni la tarjeta de compra derecha saltan o se desfasan en la pantalla: ambos se mantienen en las mismas coordenadas exactas.

---

### D. Optimización HD y Cobertura Total del Banner: KALPA CAFÉ MOLIDO
* **Objetivo:** Resolver el pixelado y eliminar las barras negras laterales para que el arte cubra el 100% del banner (`media_1793166299075_44da00e6.png` y `media_1793166326805_7941bc88.png`).
* **Implementación:**
  * **Renderizado Ultra HD a 2048x682 px:** Se procesó y remasterizó el archivo [assets/kalpa-molido-bg.png](file:///g:/Descargas/PAGINA%20DE%20KALLPA/assets/kalpa-molido-bg.png) a resolución 2K con interpolación bicúbica de alta precisión para eliminar cualquier borrosidad en pantallas Retina y 1080p/4K.
  * **Cobertura Edge-to-Edge:** Se cambió `background-size: contain` a `background-size: cover` con `image-rendering: high-quality;` en `.molido-slide-bg`. De este modo la imagen se extiende de borde a borde sin dejar franjas negras a los costados.

---

### E. Eliminación de Secciones Antiguas y Creación del Carrusel de Reseñas
* **Objetivo:** Retirar las secciones obsoletas marcadas por el usuario (`media_1793165473906_77365258.png`) e integrar un carrusel dinámico de opiniones reales de la comunidad ubicado inmediatamente bajo la sección de Reels.
* **Acciones aplicadas:**
  1. **Secciones eliminadas:**
     * `#benefits-section` (*Hecho para tu día / Rendir ahora y cuidarte después*).
     * `#promo-section` (*Promoción de lanzamiento / ¿Todavía sacrificando tu cuerpo por energía?*).
  2. **Nuevo Carrusel de Reviews (`#reviews-section`):**
     * Encabezado con insignia de calificación global (`4.9 / 5` con estrellas doradas y contador de +1,200 reseñas).
     * 6 tarjetas con diseño glassmorphism oscuro, borde dorado sutil al hover, 5 estrellas, insignia de *Compra verificada*, avatar con iniciales y perfil del comprador (runners, developers, baristas, deportistas).
     * Control interactivo con flechas circulares `<` y `>`, dots indicadores, swipe táctil y adaptabilidad responsive (3 en desktop, 2 en tablet, 1 en mobile).
* **Archivos modificados:** [index.html](file:///g:/Descargas/PAGINA%20DE%20KALLPA/index.html), [assets/theme.css](file:///g:/Descargas/PAGINA%20DE%20KALLPA/assets/theme.css).

---

### F. Corrección Definitiva de Slide 2 (Kalpa Café Molido)
* **Objetivo:** Solucionar el descuadre visual y recorte reportado en `media_1793169526908_87997b64.png`, igualando la fidelidad del mockup `media_1793167809150_633c387d.png`.
* **Mejoras aplicadas:**
  1. **Pieza Central Erguida y Proporcionada:**
     * Se sustituyó el recorte y escalado erróneo por `.sale-can-stage--molido` y `.sale-stage__can--molido` con anclaje inferior absoluto (`bottom: 0; left: 50%; transform: translateX(-50%); height: 100%; width: auto;`).
     * La lata alcanza la misma altura de tapa que Slide 1, reposando sobre su base de roca volcánica, hojas y cerezas de café sin cubos de hielo.
  2. **Tarjeta de Compra Glassmorphism Crema Unificada:**
     * Se eliminó el estilo oscuro heredado de `.kalpa-molido__buy-box`, adoptando `.kalpa-sale__buy-box` con fondo translúcido crema (`rgba(255, 252, 247, 0.74)`), borde sutil y tipografía oscura de máximo contraste.
  3. **Cluster de Latas Mini en Pack x 6:**
     * Se generó un asset individual aislado [assets/kalpa-molido-can-solo.png](file:///g:/Descargas/PAGINA%20DE%20KALLPA/assets/kalpa-molido-can-solo.png) para las miniaturas del pack, luciendo nítidas y limpias.
  4. **Adaptabilidad Mobile:**
     * Calibrado responsive completo en pantallas móviles (<= 768px).

---

### G. Nueva Vista de Productos Oficial: `productos.html`
* **Objetivo:** Implementar la página de catálogo general basada en `media_1793169161491_d3982f04.jpg` y `media_1793168011779_f0f982b8.jpg`.
* **Componentes implementados:**
  1. **Hero Panorámico de Productos:** Imagen panorámica ultra HD [assets/productos-hero-bg.png](file:///g:/Descargas/PAGINA%20DE%20KALLPA/assets/productos-hero-bg.png) (2560x852 px) con frutos de cacao y amanecer en la cordillera, breadcrumb de navegación y kicker dorado.
  2. **Barra de Controles y Filtros:** Píldoras interactivas con SVG (*Todos los productos*, *Cold Brew*, *Café Molido*, *Accesorios*) con filtrado en tiempo real y selector de ordenamiento.
  3. **Tarjeta Destacada 01 (Cold Brew 355ml):** Con buy-box dual interactivo para unidad (S/ 7.90) y pack x 6 (S/ 39.90, -15%).
  4. **Cuadrícula Duo de Café Molido:**
     * Tarjeta 02: KALLPA CAFÉ MOLIDO 250G con visual remasterizado [assets/product-card-250g.png](file:///g:/Descargas/PAGINA%20DE%20KALLPA/assets/product-card-250g.png).
     * Tarjeta 03: KALLPA CAFÉ MOLIDO 500G con visual remasterizado [assets/product-card-500g.png](file:///g:/Descargas/PAGINA%20DE%20KALLPA/assets/product-card-500g.png).
  5. **Carrito Lateral Integrado:** Drawer AJAX completamente funcional con conteo dinámico, resumen de items y botón de checkout.
* **Archivos:** [productos.html](file:///g:/Descargas/PAGINA%20DE%20KALLPA/productos.html), [assets/products-pages.css](file:///g:/Descargas/PAGINA%20DE%20KALLPA/assets/products-pages.css).

---

### H. Nueva Vista de Nosotros: `nosotros.html`
* **Objetivo:** Implementar la página editorial de marca basada en la referencia del Hero `media_1793169380967_47daa4b1.png` y los textos del manifiesto oficial.
* **Estructura y narrativa desarrollada:**
  1. **Hero del Arco Andino:** Fondo remasterizado en alta resolución [assets/nosotros-hero-bg-hd.jpg](file:///g:/Descargas/PAGINA%20DE%20KALLPA/assets/nosotros-hero-bg-hd.jpg) (2048x1152 px) que enmarca la lata de Kalpa al amanecer. Tipografía a ambos lados del arco:
     * Izquierda: `CAFÉ DE ALTURA` / `E N E R G Í A` (blanco con tracking extendido).
     * Derecha: `V R A E M` / `N A T U R A L` (dorado brillante con tracking extendido).
     * Botón inferior: `DESCUBRE KALPA →` en cápsula dorada.
  2. **Sección: Energía de los Andes:** Significado de *Kalpa* en quechua (fuerza, energía y poder) y su misión de rendir al máximo sin sacrificar el cuerpo.
  3. **Sección: La Raíz de Kalpa — Ayacucho:** Conexión con el origen, cultura y valor de los insumos andinos, acompañada por fotografía de cosecha en el VRAEM ([assets/vraem-harvest.jpg](file:///g:/Descargas/PAGINA%20DE%20KALLPA/assets/vraem-harvest.jpg)).
  4. **Bento Grid: Cómo lo Hacemos:** Métrica de Altura (1,800 - 2,200 msnm), Cosecha (Mayo - Sept.), Cafeína Real (280 mg), Origen con Productores y Sin Sacrificar tu Cuerpo (0% azúcar añadida).
  5. **Sección: Por Qué Existimos (Manifiesto):** Liberar el máximo potencial del cuerpo humano con insumos andinos limpios y de excelencia.
  6. **Sección: La Gente Detrás del Café:** Tres tarjetas fotográficas editoriales (*Productores de Ayacucho*, *Finca y Cosecha*, *Equipo Kalpa*).
  7. **Sección CTA: Pruébala Bien Helada:** Cierre de alto impacto con botón directo `ELEGIR MI PACK →` hacia la tienda.
  8. **Footer Unificado y Carrito:** Conexión completa de navegación y carrito de compras.
* **Archivos:** [nosotros.html](file:///g:/Descargas/PAGINA%20DE%20KALLPA/nosotros.html), [assets/nosotros.css](file:///g:/Descargas/PAGINA%20DE%20KALLPA/assets/nosotros.css).

---

---

### I. Catálogo de Productos: Cards 02 y 03 con Glassmorphism y Fondo Completo
* **Objetivo:** Replicar con fidelidad el diseño de referencia (`media_1793197867535_3124be26.png`) en `productos.html`, utilizando la imagen panorámica de las montañas del VRAEM como fondo de borde a borde (*cover*) con efecto glassmorphism difuminado en el lateral izquierdo.
* **Archivos modificados:** [productos.html](file:///c:/Users/Usuario/Desktop/HERO%20ANIMATION/productos.html), [assets/theme.css](file:///c:/Users/Usuario/Desktop/HERO%20ANIMATION/assets/theme.css).

---

### J. Componentes Globales Únicos: Navbar y Footer Unificados (Cero Desplazamiento y Menú Móvil)
* **Objetivo:** Unificar la barra de navegación y el pie de página en un estándar único de componentes reutilizables a lo largo de todas las páginas (`index.html`, `productos.html`, `nosotros.html`, `producto.html`), eliminando enlaces inexistentes ("Origen", "Contacto"), resolviendo cualquier salto de posición (*layout shift*) y dotando al sitio de consistencia absoluta.
* **Mejoras aplicadas:**
  1. **Arquitectura CSS Grid en 3 Columnas (`assets/theme.css`):**
     * `.kalpa-navbar__container` configurado como `grid-template-columns: 1fr auto 1fr; align-items: center;`.
     * **Logo Izquierdo:** `justify-self: start`.
     * **Menú Central:** `justify-self: center` con los enlaces oficiales estandarizados: `Inicio`, `Productos`, `Promociones`, `Nosotros`. Se eliminaron enlaces inexistentes que alteraban el centrado entre pantallas.
     * **Acciones Derechas:** `justify-self: end` con la secuencia canónica completa: Buscar, Mi Cuenta, Favoritos, Cápsula de Carrito con contador interactivo, Botón CTA "COMPRAR AHORA" y Hamburguesa responsive.
     * **Resultado:** Cero movimiento o salto (*pixel-perfect stability*) al navegar entre cualquiera de las páginas del sitio.
  2. **Footer Oficial Unificado en Todas las Pestañas:**
     * Integración del **Banner Newsletter Cinematográfico** superior: arte de lata con hielos y salpicaduras (`assets/footer-banner-can.png`), titular *"SÉ PARTE DE KALPA"*, formulario de suscripción reactivo y grano flotante superior (`assets/hero-bean-single.png`).
     * Barra inferior estandarizada: Logo oficial KALPA, menú horizontal de 4 enlaces, iconos de redes (Instagram, TikTok, YouTube), insignia de "Envíos a todo el Perú" y bloque legal 2026 con Términos, Privacidad y Contacto.
  3. **Controlador Reutilizable (`assets/kalpa-components.js`):**
     * Manejo interactivo del Menú Móvil Lateral (*Drawer*) con apertura y cierre fluidos.
     * Detección y activación automática del enlace correspondiente (`is-active`) según la URL activa.
     * Sincronización del contador de productos en el carrito a través de `localStorage` entre todas las pestañas.

---

---

### K. Sección Unificada: Comunidad KALPA (Reels & Reseñas en Fila Única)
* **Objetivo:** Unificar las secciones independientes de Reels y Reseñas en un único bloque de alto impacto visual basado fielmente en la referencia (`media_1793200179357_10acd330.png`).
* **Implementación y Estructura:**
  1. **Encabezado Editorial:**
     * Eyebrow con guion dorado: `— COMUNIDAD KALPA`.
     * Título principal: `ENERGÍA QUE` (blanco itálica) `SE COMPARTE` (dorado vibrante).
     * Párrafo descriptivo: *"Historias reales de personas que viven la energía de los Andes. Entrena, trabaja, explora. Kallpa te acompaña."*
     * Botón de seguimiento: `SEGUIR EN INSTAGRAM >` en cápsula redondeada.
  2. **Bloque Izquierdo (3 Reels Verticales):**
     * 3 tarjetas en proporción vertical (`aspect-ratio: 9/13`) con `assets/reel-1.jpg`, `assets/reel-2.jpg` y `assets/reel-3.jpg`.
     * Botón play circular central con fondo translúcido y aro blanco, activo al hover con resplandor dorado.
     * Insignia inferior con icono de ojo y contador de visualizaciones (`125K`, `98K`, `210K`).
  3. **Bloque Derecho (Tarjeta de Reseña Destacada con Glassmorphism):**
     * 5 estrellas doradas superiores y pill verde esmeralda `✓ COMPRA VERIFICADA`.
     * Titular con frase destacada dorada: *“Me da <span class="text-gold">energía limpia</span> para mis fondos de 15K”*.
     * Cita de reseña completa, avatar circular dorado `RA`, nombre (*Rodrigo Alarcón*) y subtítulo (*Triatleta & Runner · Lima*).
     * Navegación interactiva con flechas `<` `>` y puntos indicadores (*dots*) sincronizados para alternar fluidamente entre las reseñas reales de la comunidad.
* **Archivos modificados:** [index.html](file:///c:/Users/Usuario/Desktop/HERO%20ANIMATION/index.html), [assets/theme.css](file:///c:/Users/Usuario/Desktop/HERO%20ANIMATION/assets/theme.css).

---

## 🌐 2. Entorno de Pruebas
* **Servidor local:** Activo en `http://localhost:3000/`
* **Páginas activas:**
  * `http://localhost:3000/` (Home / Carrusel / Reviews)
  * `http://localhost:3000/productos.html` (Catálogo de Productos)
  * `http://localhost:3000/nosotros.html` (Historia y Manifiesto)
* **Rama Git:** `main`
* **Repositorio Remoto:** `https://github.com/luismiguel9117/HERO-KALLPA.git`
