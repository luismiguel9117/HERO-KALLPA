const fs = require('fs');
let code = fs.readFileSync('assets/theme.js', 'utf8');

// Replace static totalProductSlides = 2 with dynamic count based on DOM slides
code = code.replace(/let currentProductSlide = 0;\s*\r?\nconst totalProductSlides = 2;/, `let currentProductSlide = 0;
function getTotalProductSlides() {
  return document.querySelectorAll('.kalpa-product-slide').length || 1;
}`);

code = code.replace(/if \(index < 0\) index = totalProductSlides - 1;\s*\r?\n\s*if \(index >= totalProductSlides\) index = 0;/, `const total = getTotalProductSlides();
  if (index < 0) index = total - 1;
  if (index >= total) index = 0;`);

code = code.replace(/for \(let i = 0; i < totalProductSlides; i\+\+\)/, 'const slides = document.querySelectorAll(".kalpa-product-slide");\n  for (let i = 0; i < slides.length; i++)');

fs.writeFileSync('assets/theme.js', code, 'utf8');
console.log('theme.js updated with dynamic product slides support');
