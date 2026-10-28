const fs = require('fs');
let css = fs.readFileSync('assets/products-pages.css', 'utf8');

const target = `.products-controls-bar {
  background-color: #0b0e14;
  padding: 1.25rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  position: sticky;
  top: 72px;
  z-index: 40;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}`;

const replacement = `.products-controls-bar {
  background-color: #0b0e14;
  padding: 1.25rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  position: relative;
  z-index: 10;
}`;

if (css.includes('top: 72px;') && css.includes('position: sticky;')) {
  css = css.replace(/position:\s*sticky;\s*top:\s*72px;\s*z-index:\s*40;\s*backdrop-filter:\s*blur\(12px\);\s*-webkit-backdrop-filter:\s*blur\(12px\);/, 'position: relative;\n  z-index: 10;');
  fs.writeFileSync('assets/products-pages.css', css, 'utf8');
  console.log('Successfully made filter bar relative (no longer floating on scroll)');
} else {
  console.log('Pattern not matched');
}
