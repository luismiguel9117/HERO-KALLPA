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
* **Objetivo:** Transformar la sección de producto `#products-section` en un carrusel dinámico interactivo con soporte de dos diapositivas completas basadas en los mockups suministrados:
  
#### Diapositiva 1: **KALPA ORIGINAL (Cold Brew en Lata 355ml)**
* **Fondo visual:** Gradiente radial crema/arena cálido.
* **Composición central:** Lata vertical Kalpa Original 355ml con cubos de hielo, granos flotantes y base de roca volcánica sólida.
* **Bloque editorial:** Ceja `NUESTRO PRODUCTO`, título `KALPA ORIGINAL`, 4 badges circulares de atributos (0 Calorías, Sin azúcares añadidos, Listo para tomar, Cold Brew refrescante) y botón "Ver ficha completa →".
* **Tarjeta de compra dual:** Opción Unidad (S/ 7.90) con stepper y Opción Pack x 6 (S/ 39.90, -15% desc.) con miniaturas de 6 latas.

#### Diapositiva 2: **KALPA CAFÉ MOLIDO (Lata Metálica Especialidad 500g)**
* **Fondo visual:** Fotografía panorámica de los Andes peruanos (`assets/kalpa-molido-bg.jpg`) con la lata de 500g sobre saco de yute y café molido.
* **Bloque editorial:** Barra de acento dorada, ceja `NUESTRO PRODUCTO`, título bicolor `KALPA` (blanco) / `CAFÉ MOLIDO` (dorado itálico), descripción y 4 badges circulares de especialidad (100% Obata, Origen VRAEM, Ideal para Cold Brew, Notas sensoriales).
* **Botón de acción:** `VER FICHA TÉCNICA →` en pastilla amarilla/dorada con texto negro.
* **Tarjeta de compra flotante oscura:**
  * Selector de variantes interactivo: `500 g` (S/ 39.90) vs `Pack x 6` (S/ 203.50, -15% desc.).
  * Stepper de cantidad `[-] 1 [+]`.
  * Botón `AGREGAR AL CARRITO 🛒` conectado al drawer del carrito.
* **Barra inferior de especificaciones técnicas:** 5 atributos de especialidad (Variedad, Origen, Proceso, Tueste, Ideal para).

#### Controles del Carrusel:
* **Flechas de navegación:** Botones circulares translúcidos (`Prev` / `Next`) en los laterales con efecto hover dorado.
* **Paginación / Tabs inferiores:** Puntos interactivos con nombres de producto y estado activo.
* **Gestos táctiles:** Soporte de swipe touch para móviles y tablets.
* **Archivos modificados:** [index.html](file:///c:/Users/Usuario/Desktop/HERO%20ANIMATION/index.html), [assets/theme.css](file:///c:/Users/Usuario/Desktop/HERO%20ANIMATION/assets/theme.css).

---

## 🌐 2. Entorno de Pruebas
* **Servidor local:** Activo en `http://localhost:3333/`
* **Rama Git:** `main`
* **Repositorio Remoto:** `https://github.com/luismiguel9117/HERO-KALLPA.git`
