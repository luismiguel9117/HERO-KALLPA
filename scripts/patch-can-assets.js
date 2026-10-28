const fs = require('fs');
let code = fs.readFileSync('assets/hero-kallpa-can.js', 'utf8');

const assetResolver = `
function resolveAsset(filename) {
  if (typeof window !== 'undefined' && window.ShopifyAssetUrls && window.ShopifyAssetUrls[filename]) {
    return window.ShopifyAssetUrls[filename];
  }
  return 'assets/' + filename;
}
`;

if (!code.includes('function resolveAsset')) {
  code = assetResolver + '\n' + code;
}

code = code.replace(/'assets\/hero-beans-ice-back\.png'/g, "resolveAsset('hero-beans-ice-back.png')");
code = code.replace(/'assets\/kalpa-can-rims\.png'/g, "resolveAsset('kalpa-can-rims.png')");
code = code.replace(/'assets\/hero-beans-ice-front\.png'/g, "resolveAsset('hero-beans-ice-front.png')");
code = code.replace(/'assets\/hero-bean-single\.png'/g, "resolveAsset('hero-bean-single.png')");
code = code.replace(/'assets\/hero-rock-base\.png'/g, "resolveAsset('hero-rock-base.png')");

fs.writeFileSync('assets/hero-kallpa-can.js', code, 'utf8');
console.log('hero-kallpa-can.js updated with resolveAsset');
