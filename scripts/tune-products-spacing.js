const fs = require('fs');

// 1. Update theme.css
let css = fs.readFileSync('assets/theme.css', 'utf8');

// Target previous container & grid
const targetContainer = `.kalpa-sale-container {
  position: relative;
  z-index: 5;
  width: 100%;
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 clamp(1.25rem, 3vw, 3rem);
  box-sizing: border-box;
}

.kalpa-sale-grid {
  display: grid;
  grid-template-columns: minmax(300px, 340px) 1fr minmax(320px, 420px);
  gap: clamp(1.25rem, 2.5vw, 2.75rem);
  align-items: center;
  width: 100%;
  box-sizing: border-box;
}`;

const replContainer = `.kalpa-sale-container {
  position: relative;
  z-index: 5;
  width: 100%;
  max-width: 1340px;
  margin: 0 auto;
  padding: 0 clamp(1.5rem, 3vw, 3.5rem);
  box-sizing: border-box;
}

.kalpa-sale-grid {
  display: grid;
  grid-template-columns: minmax(310px, 350px) 1fr minmax(320px, 430px);
  gap: clamp(1.75rem, 3.2vw, 3.5rem);
  align-items: center;
  width: 100%;
  box-sizing: border-box;
}`;

if (css.includes(targetContainer.replace(/\n/g, '\r\n'))) {
  css = css.replace(targetContainer.replace(/\n/g, '\r\n'), replContainer.replace(/\n/g, '\r\n'));
} else if (css.includes(targetContainer.replace(/\r\n/g, '\n'))) {
  css = css.replace(targetContainer.replace(/\r\n/g, '\n'), replContainer.replace(/\r\n/g, '\n'));
}

// Adjust molido height to 102%
css = css.replace('height: 106%;', 'height: 102%;');

fs.writeFileSync('assets/theme.css', css, 'utf8');
console.log('Updated theme.css with balanced spacing');

// 2. Update index.json to use kalpa-can-original.png
let indexJson = JSON.parse(fs.readFileSync('templates/index.json', 'utf8'));
if (indexJson.sections && indexJson.sections.products_1 && indexJson.sections.products_1.blocks) {
  if (indexJson.sections.products_1.blocks.slide_original) {
    indexJson.sections.products_1.blocks.slide_original.settings.default_asset_image = 'kalpa-can-original.png';
  }
}
fs.writeFileSync('templates/index.json', JSON.stringify(indexJson, null, 2), 'utf8');
console.log('Updated index.json default_asset_image');

// 3. Update kallpa-products.liquid fallback and schema
let liquid = fs.readFileSync('sections/kallpa-products.liquid', 'utf8');

// Ensure fallback in liquid code
liquid = liquid.replace(
  `{%- elsif block.settings.default_asset_image != blank -%}
                        <img src="{{ block.settings.default_asset_image | asset_url }}" alt="{{ block.settings.title_main }} {{ block.settings.title_sub }}" class="sale-stage__can" draggable="false" width="400" height="700">`,
  `{%- elsif block.settings.default_asset_image != blank and block.settings.default_asset_image != 'kalpa-can-clean.png' -%}
                        <img src="{{ block.settings.default_asset_image | asset_url }}" alt="{{ block.settings.title_main }} {{ block.settings.title_sub }}" class="sale-stage__can" draggable="false" width="400" height="700">`
);

// Schema default
liquid = liquid.replace(
  `"label": "O nombre del archivo en assets (ej: kalpa-can-clean.png)",\n          "default": "kalpa-can-clean.png"`,
  `"label": "O nombre del archivo en assets (ej: kalpa-can-original.png)",\n          "default": "kalpa-can-original.png"`
).replace(
  `"label": "O nombre del archivo en assets (ej: kalpa-can-clean.png)",\r\n          "default": "kalpa-can-clean.png"`,
  `"label": "O nombre del archivo en assets (ej: kalpa-can-original.png)",\r\n          "default": "kalpa-can-original.png"`
);

fs.writeFileSync('sections/kallpa-products.liquid', liquid, 'utf8');
console.log('Updated kallpa-products.liquid');
