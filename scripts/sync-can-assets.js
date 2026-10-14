const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const lataDir = path.join(rootDir, 'lata-3d');
const assetsDir = path.join(rootDir, 'assets');

console.log('⚡ Sincronizando texturas y modelos 3D de lata-3d hacia assets/...');

// 1. Copiar texturas principales
const texturesToCopy = [
  { src: 'Materials/Ready/T_BeerCan_Kalpa.png', dest: 'can-kalpa-label.png' },
  { src: 'Materials/Ready/T_BeerCan_Normal.png', dest: 'can-normal.png' },
  { src: 'Materials/Ready/T_BeerCan_RMAO.png', dest: 'can-rmao.png' }
];

texturesToCopy.forEach(item => {
  const srcPath = path.join(lataDir, item.src);
  const destPath = path.join(assetsDir, item.dest);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`✓ Copiado: ${item.src} -> assets/${item.dest}`);
  } else {
    console.warn(`! No encontrado: ${srcPath}`);
  }
});

console.log('✅ Sincronización de texturas de la lata completada con éxito.');
