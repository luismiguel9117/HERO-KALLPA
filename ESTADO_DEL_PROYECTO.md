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
     * **Columna 1 (Izquierda):** Bloque editorial (`.kalpa-sale__info` y `.kalpa-molido__info`) anclado a `justify-self: start; width: 100%; max-width: 360px; margin: 0; padding: 0;`.
     * **Columna 2 (Centro):** `1fr` dedicado exclusivamente al producto protagonista (Lata 355ml en Slide 1 y Lata 500g en Slide 2), libre de solapamientos con los textos o las tarjetas.
     * **Columna 3 (Derecha):** Tarjeta de compra (`.kalpa-sale__buy-box` y `.kalpa-molido__buy-box`) anclada a `justify-self: end; margin: 0;`.
  3. **Estabilidad Geométrica al Navegar:**
     * Al cambiar entre productos con las flechas `<` y `>`, ni el bloque de información izquierdo ni la tarjeta de compra derecha saltan o se desfasan en la pantalla: ambos se mantienen en las mismas coordenadas exactas.

---

### D. Actualización de Imagen de Alta Calidad: KALPA CAFÉ MOLIDO
* **Objetivo:** Reemplazar el fondo de la segunda diapositiva por la versión de alta definición aportada por el usuario (`media_1793165630753_3415eba3.png`).
* **Implementación:**
  * Actualizado en [assets/kalpa-molido-bg.png](file:///g:/Descargas/PAGINA%20DE%20KALLPA/assets/kalpa-molido-bg.png).
  * Resolución nativa optimizada panorámica (1024x341, proporción 3.0:1) con fondo limpio, iluminación de amanecer andino y lata 500g centrada en alta fidelidad.

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

## 🌐 2. Entorno de Pruebas
* **Servidor local:** Activo en `http://localhost:3000/`
* **Rama Git:** `main`
* **Repositorio Remoto:** `https://github.com/luismiguel9117/HERO-KALLPA.git`
