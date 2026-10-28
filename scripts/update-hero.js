const fs = require('fs');
let content = fs.readFileSync('sections/hero-kallpa-3d.liquid', 'utf8');

// Replace viewports with only the 2D animated viewport (using kalpa-can-base.png and clean assets matching index.html)
const targetViewportRegex = /<!-- 4\. Viewport 3D WebGL[\s\S]*?<canvas id="kallpa-hero-2d" class="hero-2d-canvas"><\/canvas>/;

const newViewport = `  <!-- Viewport 2D Animada con Canvas Cilíndrico Interactivo (Kallpa Repo) -->
  <div id="kallpa-hero-2d-anim" 
       class="hero-2d-anim-viewport"
       data-base-can="{{ 'kalpa-can-base.png' | asset_url }}"
       data-droplets="{{ 'kalpa-can-droplets.png' | asset_url }}"
       data-label-original="{{ 'kalpa-label.png' | asset_url }}"
       data-label-gold="{{ 'kalpa-label-gold.png' | asset_url }}"
       data-label-citrus="{{ 'kalpa-label-citrus.png' | asset_url }}">
  </div>`;

content = content.replace(targetViewportRegex, newViewport);

// Remove the dimension switch (switch 2D/3D)
const targetSwitchRegex = /<!-- Separador Sutil en Barra de Controles -->[\s\S]*?<!-- Switch de Alternancia 2D FOTO[\s\S]*?<\/div>(\s*<\/div>)/;
content = content.replace(targetSwitchRegex, '$1');

fs.writeFileSync('sections/hero-kallpa-3d.liquid', content, 'utf8');
console.log('Successfully updated sections/hero-kallpa-3d.liquid');
