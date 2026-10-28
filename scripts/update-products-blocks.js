const fs = require('fs');
let raw = fs.readFileSync('templates/index.json', 'utf8');

raw = raw.replace(/^\/\*[\s\S]*?\*\//, '').trim();
let index = JSON.parse(raw);

index.sections.products_1 = {
  type: 'kallpa-products',
  settings: {},
  blocks: {
    slide_original: {
      type: 'product_slide',
      settings: {
        theme_variant: 'original',
        eyebrow: 'NUESTRO PRODUCTO',
        title_main: 'KALPA',
        title_sub: 'ORIGINAL',
        description: 'Café cold brew de origen peruano, hecho con granos del VRAEM. 280 mg de cafeína natural. Listo para tomar, en cualquier momento y lugar.',
        product_link: '/products/kalpa-cold-brew',
        btn_link_text: 'Ver ficha completa',
        feat_1: '0<br>CALORÍAS',
        feat_2: 'SIN AZÚCAR<br>AÑADIDA',
        feat_3: 'GRANOS<br>DEL VRAEM',
        feat_4: 'LISTO PARA<br>TOMAR',
        default_asset_image: 'kalpa-can-clean.png',
        unit_label: 'Unidad',
        unit_price: 'S/ 7.90',
        unit_volume: '355 ml',
        pack_label: 'Pack x 6',
        pack_discount: '-15%',
        pack_old_price: 'S/ 47.40',
        pack_price: 'S/ 39.90',
        pack_volume: '6 latas de 355 ml',
        pack_mini_image: 'kalpa-can-original.png'
      }
    },
    slide_molido: {
      type: 'product_slide',
      settings: {
        theme_variant: 'molido',
        eyebrow: 'NUESTRO PRODUCTO',
        title_main: 'KALPA',
        title_sub: 'CAFÉ MOLIDO',
        description: 'Café tostado de origen peruano, 100% Arábica · Variedad Obata. Molienda media fina para métodos de filtrado.',
        product_link: '/products/kalpa-cafe-molido-250g',
        btn_link_text: 'Ver ficha completa',
        feat_1: '100%<br>ARÁBICA',
        feat_2: 'ORIGEN<br>VRAEM',
        feat_3: 'MOLIENDA<br>MEDIA FINA',
        feat_4: 'NOTAS:<br>CEREZA · CACAO',
        default_asset_image: 'kalpa-molido-product.png',
        unit_label: 'Unidad',
        unit_price: 'S/ 34.90',
        unit_volume: '250 g',
        pack_label: 'Pack x 6',
        pack_discount: '-15%',
        pack_old_price: 'S/ 209.40',
        pack_price: 'S/ 177.90',
        pack_volume: '6 latas de 250 g',
        pack_mini_image: 'kalpa-molido-can-solo.png'
      }
    }
  },
  block_order: ['slide_original', 'slide_molido']
};

fs.writeFileSync('templates/index.json', JSON.stringify(index, null, 2), 'utf8');
console.log('templates/index.json successfully updated with product slide blocks');
