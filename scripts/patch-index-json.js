const fs = require('fs');
const json = JSON.parse(fs.readFileSync('templates/index.json', 'utf8'));

if (json.sections && json.sections.products_1 && json.sections.products_1.blocks) {
  const blocks = json.sections.products_1.blocks;
  if (blocks.slide_original) {
    blocks.slide_original.settings.feat_1_icon = 'drop_zero';
    blocks.slide_original.settings.feat_1 = '0<br>CALORÍAS';
    blocks.slide_original.settings.feat_2_icon = 'check';
    blocks.slide_original.settings.feat_2 = 'SIN AZÚCARES<br>AÑADIDOS';
    blocks.slide_original.settings.feat_3_icon = 'coffee_can';
    blocks.slide_original.settings.feat_3 = 'LISTO<br>PARA TOMAR';
    blocks.slide_original.settings.feat_4_icon = 'snowflake';
    blocks.slide_original.settings.feat_4 = 'COLD BREW<br>REFRESCANTE';
  }
  if (blocks.slide_molido) {
    blocks.slide_molido.settings.feat_1_icon = 'leaf';
    blocks.slide_molido.settings.feat_1 = '100%<br>ARÁBICA';
    blocks.slide_molido.settings.feat_2_icon = 'mountain';
    blocks.slide_molido.settings.feat_2 = 'ORIGEN<br>VRAEM';
    blocks.slide_molido.settings.feat_3_icon = 'filter';
    blocks.slide_molido.settings.feat_3 = 'MOLIENDA<br>MEDIA FINA';
    blocks.slide_molido.settings.feat_4_icon = 'flavor';
    blocks.slide_molido.settings.feat_4 = 'NOTAS: CEREZA<br>· CHOCOLATE · CACAO';
  }
}

fs.writeFileSync('templates/index.json', JSON.stringify(json, null, 2), 'utf8');
console.log('Done updating index.json with icon settings');
