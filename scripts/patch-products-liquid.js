const fs = require('fs');
let liquid = fs.readFileSync('sections/kallpa-products.liquid', 'utf8');

// Replace features HTML
const targetFeaturesHtml = `                  <!-- 4 Badges Circulares de Atributos -->
                  <div class="sale-features-row">
                    <!-- Badge 1 -->
                    <div class="sale-feature-badge">
                      <div class="sale-feature-circle">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                        </svg>
                      </div>
                      <span class="sale-feature-label">{{ block.settings.feat_1 | default: '0<br>CALORÍAS' }}</span>
                    </div>

                    <!-- Badge 2 -->
                    <div class="sale-feature-badge">
                      <div class="sale-feature-circle">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                      </div>
                      <span class="sale-feature-label">{{ block.settings.feat_2 | default: 'SIN AZÚCAR<br>AÑADIDA' }}</span>
                    </div>

                    <!-- Badge 3 -->
                    <div class="sale-feature-badge">
                      <div class="sale-feature-circle">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
                        </svg>
                      </div>
                      <span class="sale-feature-label">{{ block.settings.feat_3 | default: 'GRANOS<br>DEL VRAEM' }}</span>
                    </div>

                    <!-- Badge 4 -->
                    <div class="sale-feature-badge">
                      <div class="sale-feature-circle">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                      </div>
                      <span class="sale-feature-label">{{ block.settings.feat_4 | default: 'LISTO PARA<br>TOMAR' }}</span>
                    </div>
                  </div>`;

const replFeaturesHtml = `                  <!-- 4 Badges Circulares de Atributos -->
                  <div class="sale-features-row">
                    <!-- Badge 1 -->
                    <div class="sale-feature-badge">
                      <div class="sale-feature-circle">
                        {% render 'kallpa-feature-icon', icon: block.settings.feat_1_icon, custom_image: block.settings.feat_1_custom_icon %}
                      </div>
                      <span class="sale-feature-label">{{ block.settings.feat_1 | default: '100%<br>ARÁBICA' }}</span>
                    </div>

                    <!-- Badge 2 -->
                    <div class="sale-feature-badge">
                      <div class="sale-feature-circle">
                        {% render 'kallpa-feature-icon', icon: block.settings.feat_2_icon, custom_image: block.settings.feat_2_custom_icon %}
                      </div>
                      <span class="sale-feature-label">{{ block.settings.feat_2 | default: 'ORIGEN<br>VRAEM' }}</span>
                    </div>

                    <!-- Badge 3 -->
                    <div class="sale-feature-badge">
                      <div class="sale-feature-circle">
                        {% render 'kallpa-feature-icon', icon: block.settings.feat_3_icon, custom_image: block.settings.feat_3_custom_icon %}
                      </div>
                      <span class="sale-feature-label">{{ block.settings.feat_3 | default: 'MOLIENDA<br>MEDIA FINA' }}</span>
                    </div>

                    <!-- Badge 4 -->
                    <div class="sale-feature-badge">
                      <div class="sale-feature-circle">
                        {% render 'kallpa-feature-icon', icon: block.settings.feat_4_icon, custom_image: block.settings.feat_4_custom_icon %}
                      </div>
                      <span class="sale-feature-label">{{ block.settings.feat_4 | default: 'NOTAS:<br>CEREZA · CACAO' }}</span>
                    </div>
                  </div>`;

// Replace Centerpiece HTML
const targetCenterpieceHtml = `                <!-- Columna 2: Centro (Visual Principal) -->
                <div class="kalpa-sale__centerpiece">
                  <div class="sale-can-stage {% if block.type == 'product_molido' or block.settings.theme_variant == 'molido' %}sale-can-stage--molido{% endif %}">
                    {%- if block.settings.main_image != blank -%}
                      <img src="{{ block.settings.main_image | image_url: width: 800 }}" alt="{{ block.settings.title_main }} {{ block.settings.title_sub }}" class="sale-stage__can" draggable="false" width="400" height="700">
                    {%- elsif block.settings.default_asset_image != blank -%}
                      <img src="{{ block.settings.default_asset_image | asset_url }}" alt="{{ block.settings.title_main }} {{ block.settings.title_sub }}" class="sale-stage__can" draggable="false" width="400" height="700">
                    {%- else -%}
                      <img src="{{ 'kalpa-can-clean.png' | asset_url }}" alt="KALPA Producto" class="sale-stage__can" draggable="false" width="400" height="700">
                    {%- endif -%}
                  </div>
                </div>`;

const replCenterpieceHtml = `                <!-- Columna 2: Centro (Visual Principal Heroico) -->
                <div class="kalpa-sale__centerpiece">
                  {%- if block.settings.theme_variant == 'original' -%}
                    <div class="sale-can-stage">
                      <img src="{{ 'hero-beans-ice-back.png' | asset_url }}" alt="" class="sale-stage__beans-back" draggable="false">
                      <img src="{{ 'hero-beans-ice-front.png' | asset_url }}" alt="" class="sale-stage__beans-mid" draggable="false">
                      {%- if block.settings.main_image != blank -%}
                        <img src="{{ block.settings.main_image | image_url: width: 800 }}" alt="{{ block.settings.title_main }} {{ block.settings.title_sub }}" class="sale-stage__can" draggable="false" width="400" height="700">
                      {%- elsif block.settings.default_asset_image != blank -%}
                        <img src="{{ block.settings.default_asset_image | asset_url }}" alt="{{ block.settings.title_main }} {{ block.settings.title_sub }}" class="sale-stage__can" draggable="false" width="400" height="700">
                      {%- else -%}
                        <img src="{{ 'kalpa-can-original.png' | asset_url }}" alt="KALPA Café Cold Brew Original 355ml" class="sale-stage__can" draggable="false" width="400" height="700">
                      {%- endif -%}
                      <img src="{{ 'hero-bean-single.png' | asset_url }}" alt="" class="sale-stage__bean-front" draggable="false">
                      <img src="{{ 'hero-rock-base.png' | asset_url }}" alt="" class="sale-stage__rock" draggable="false">
                    </div>
                  {%- else -%}
                    <div class="sale-can-stage sale-can-stage--molido">
                      {%- if block.settings.main_image != blank -%}
                        <img src="{{ block.settings.main_image | image_url: width: 1400 }}" alt="{{ block.settings.title_main }} {{ block.settings.title_sub }}" class="sale-stage__can sale-stage__can--molido" draggable="false">
                      {%- elsif block.settings.default_asset_image != blank -%}
                        <img src="{{ block.settings.default_asset_image | asset_url }}" alt="{{ block.settings.title_main }} {{ block.settings.title_sub }}" class="sale-stage__can sale-stage__can--molido" draggable="false">
                      {%- else -%}
                        <img src="{{ 'kalpa-molido-product.png' | asset_url }}" alt="KALPA Café Molido 250g" class="sale-stage__can sale-stage__can--molido" draggable="false">
                      {%- endif -%}
                    </div>
                  {%- endif -%}
                </div>`;

// Replace Schema Features
const targetSchemaFeatures = `        {
          "type": "header",
          "content": "Sellos y Atributos (Badges)"
        },
        {
          "type": "text",
          "id": "feat_1",
          "label": "Atributo 1",
          "default": "0<br>CALORÍAS"
        },
        {
          "type": "text",
          "id": "feat_2",
          "label": "Atributo 2",
          "default": "SIN AZÚCAR<br>AÑADIDA"
        },
        {
          "type": "text",
          "id": "feat_3",
          "label": "Atributo 3",
          "default": "GRANOS<br>DEL VRAEM"
        },
        {
          "type": "text",
          "id": "feat_4",
          "label": "Atributo 4",
          "default": "LISTO PARA<br>TOMAR"
        },`;

const replSchemaFeatures = `        {
          "type": "header",
          "content": "Sellos y Atributos Circulares (Configurables)"
        },
        {
          "type": "select",
          "id": "feat_1_icon",
          "label": "Ícono Atributo 1",
          "options": [
            { "value": "leaf", "label": "🌿 Hoja / 100% Arábica" },
            { "value": "mountain", "label": "⛰️ Montaña / Origen VRAEM" },
            { "value": "filter", "label": "⌛ Filtro / Molienda Media Fina" },
            { "value": "flavor", "label": "🎯 Notas de Sabor / Aromas" },
            { "value": "drop_zero", "label": "💧 Gota con Cero (0 Calorías)" },
            { "value": "check", "label": "✓ Check (Sin Azúcar Añadida)" },
            { "value": "coffee_can", "label": "🥫 Lata KALPA" },
            { "value": "snowflake", "label": "❄️ Nieve / Refrescante" },
            { "value": "lightning", "label": "⚡ Rayo / Energía" },
            { "value": "clock", "label": "🕒 Reloj / Tiempo" },
            { "value": "coffee_cup", "label": "☕ Taza de Café" },
            { "value": "heart", "label": "❤️ Salud / Bienestar" },
            { "value": "star", "label": "⭐ Calidad Premium" }
          ],
          "default": "leaf"
        },
        {
          "type": "image_picker",
          "id": "feat_1_custom_icon",
          "label": "Ícono 1 Personalizado (opcional)"
        },
        {
          "type": "text",
          "id": "feat_1",
          "label": "Texto Atributo 1",
          "default": "100%<br>ARÁBICA"
        },
        {
          "type": "select",
          "id": "feat_2_icon",
          "label": "Ícono Atributo 2",
          "options": [
            { "value": "leaf", "label": "🌿 Hoja / 100% Arábica" },
            { "value": "mountain", "label": "⛰️ Montaña / Origen VRAEM" },
            { "value": "filter", "label": "⌛ Filtro / Molienda Media Fina" },
            { "value": "flavor", "label": "🎯 Notas de Sabor / Aromas" },
            { "value": "drop_zero", "label": "💧 Gota con Cero (0 Calorías)" },
            { "value": "check", "label": "✓ Check (Sin Azúcar Añadida)" },
            { "value": "coffee_can", "label": "🥫 Lata KALPA" },
            { "value": "snowflake", "label": "❄️ Nieve / Refrescante" },
            { "value": "lightning", "label": "⚡ Rayo / Energía" },
            { "value": "clock", "label": "🕒 Reloj / Tiempo" },
            { "value": "coffee_cup", "label": "☕ Taza de Café" },
            { "value": "heart", "label": "❤️ Salud / Bienestar" },
            { "value": "star", "label": "⭐ Calidad Premium" }
          ],
          "default": "mountain"
        },
        {
          "type": "image_picker",
          "id": "feat_2_custom_icon",
          "label": "Ícono 2 Personalizado (opcional)"
        },
        {
          "type": "text",
          "id": "feat_2",
          "label": "Texto Atributo 2",
          "default": "ORIGEN<br>VRAEM"
        },
        {
          "type": "select",
          "id": "feat_3_icon",
          "label": "Ícono Atributo 3",
          "options": [
            { "value": "leaf", "label": "🌿 Hoja / 100% Arábica" },
            { "value": "mountain", "label": "⛰️ Montaña / Origen VRAEM" },
            { "value": "filter", "label": "⌛ Filtro / Molienda Media Fina" },
            { "value": "flavor", "label": "🎯 Notas de Sabor / Aromas" },
            { "value": "drop_zero", "label": "💧 Gota con Cero (0 Calorías)" },
            { "value": "check", "label": "✓ Check (Sin Azúcar Añadida)" },
            { "value": "coffee_can", "label": "🥫 Lata KALPA" },
            { "value": "snowflake", "label": "❄️ Nieve / Refrescante" },
            { "value": "lightning", "label": "⚡ Rayo / Energía" },
            { "value": "clock", "label": "🕒 Reloj / Tiempo" },
            { "value": "coffee_cup", "label": "☕ Taza de Café" },
            { "value": "heart", "label": "❤️ Salud / Bienestar" },
            { "value": "star", "label": "⭐ Calidad Premium" }
          ],
          "default": "filter"
        },
        {
          "type": "image_picker",
          "id": "feat_3_custom_icon",
          "label": "Ícono 3 Personalizado (opcional)"
        },
        {
          "type": "text",
          "id": "feat_3",
          "label": "Texto Atributo 3",
          "default": "MOLIENDA<br>MEDIA FINA"
        },
        {
          "type": "select",
          "id": "feat_4_icon",
          "label": "Ícono Atributo 4",
          "options": [
            { "value": "leaf", "label": "🌿 Hoja / 100% Arábica" },
            { "value": "mountain", "label": "⛰️ Montaña / Origen VRAEM" },
            { "value": "filter", "label": "⌛ Filtro / Molienda Media Fina" },
            { "value": "flavor", "label": "🎯 Notas de Sabor / Aromas" },
            { "value": "drop_zero", "label": "💧 Gota con Cero (0 Calorías)" },
            { "value": "check", "label": "✓ Check (Sin Azúcar Añadida)" },
            { "value": "coffee_can", "label": "🥫 Lata KALPA" },
            { "value": "snowflake", "label": "❄️ Nieve / Refrescante" },
            { "value": "lightning", "label": "⚡ Rayo / Energía" },
            { "value": "clock", "label": "🕒 Reloj / Tiempo" },
            { "value": "coffee_cup", "label": "☕ Taza de Café" },
            { "value": "heart", "label": "❤️ Salud / Bienestar" },
            { "value": "star", "label": "⭐ Calidad Premium" }
          ],
          "default": "flavor"
        },
        {
          "type": "image_picker",
          "id": "feat_4_custom_icon",
          "label": "Ícono 4 Personalizado (opcional)"
        },
        {
          "type": "text",
          "id": "feat_4",
          "label": "Texto Atributo 4",
          "default": "NOTAS:<br>CEREZA · CACAO"
        },`;

// Normalize replacements
function replaceFlexible(content, target, repl) {
  const normTarget = target.replace(/\r\n/g, '\n').trim();
  const normContent = content.replace(/\r\n/g, '\n');
  if (normContent.includes(normTarget)) {
    return normContent.replace(normTarget, repl.replace(/\r\n/g, '\n'));
  }
  return content;
}

liquid = replaceFlexible(liquid, targetFeaturesHtml, replFeaturesHtml);
liquid = replaceFlexible(liquid, targetCenterpieceHtml, replCenterpieceHtml);
liquid = replaceFlexible(liquid, targetSchemaFeatures, replSchemaFeatures);

fs.writeFileSync('sections/kallpa-products.liquid', liquid, 'utf8');
console.log('Done updating kallpa-products.liquid');
