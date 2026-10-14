const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const lataDir = path.join(rootDir, 'lata-3d');
const assetsDir = path.join(rootDir, 'assets');

console.log('⚡ Sincronizando modelo final FBX, refinadores y texturas de lata-3d hacia assets/...');

// Archivos y texturas oficiales del modelo final
const filesToCopy = [
  { src: 'Models/SM_BeerCan_A.fbx', dest: 'SM_BeerCan_A.fbx' },
  { src: 'CanRefinerPro.js', dest: 'CanRefinerPro.js' },
  { src: 'Materials/Ready/T_BeerCan_Kalpa.png', dest: 'can-kalpa-label.png' },
  { src: 'Materials/Ready/T_BeerCan_BaseColor.png', dest: 'can-base.png' },
  { src: 'Materials/Ready/T_BeerCan_Normal.png', dest: 'can-normal.png' },
  { src: 'Materials/Ready/T_BeerCan_RMAO.png', dest: 'can-rmao.png' },
  { src: 'Materials/T_Kalpa_Pattern.png', dest: 'kalpa-pattern.png' }
];

filesToCopy.forEach(item => {
  const srcPath = path.join(lataDir, item.src);
  const destPath = path.join(assetsDir, item.dest);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`✓ Sincronizado: ${item.src} -> assets/${item.dest}`);
  } else {
    console.warn(`! Archivo no encontrado: ${srcPath}`);
  }
});

console.log('✅ Sincronización completa de la lata final KALPA.');
