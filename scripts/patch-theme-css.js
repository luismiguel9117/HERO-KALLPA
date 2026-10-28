const fs = require('fs');
let css = fs.readFileSync('assets/theme.css', 'utf8');

// 1. Update container and grid
const target1 = `.kalpa-sale-container {
  position: relative;
  z-index: 5;
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 clamp(1.5rem, 3.5vw, 4rem);
  box-sizing: border-box;
}

.kalpa-sale-grid {
  display: grid;
  grid-template-columns: minmax(320px, 360px) 1fr minmax(320px, 440px);
  gap: clamp(2rem, 4vw, 4.5rem);
  align-items: center;
  width: 100%;
  box-sizing: border-box;
}`;

const repl1 = `.kalpa-sale-container {
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

// Normalize CRLF
let normalizedTarget1 = target1.replace(/\r\n/g, '\n');
let normalizedRepl1 = repl1.replace(/\r\n/g, '\n');

if (css.includes(target1.replace(/\n/g, '\r\n'))) {
  css = css.replace(target1.replace(/\n/g, '\r\n'), repl1.replace(/\n/g, '\r\n'));
  console.log('Applied target1 with CRLF');
} else if (css.includes(normalizedTarget1)) {
  css = css.replace(normalizedTarget1, normalizedRepl1);
  console.log('Applied target1 with LF');
} else {
  console.log('Warning: target1 not found');
}

// 2. Update centerpiece overflow
css = css.replace(
  '.kalpa-sale__centerpiece {\n  position: relative;',
  '.kalpa-sale__centerpiece {\n  position: relative;\n  overflow: visible;'
).replace(
  '.kalpa-sale__centerpiece {\r\n  position: relative;',
  '.kalpa-sale__centerpiece {\r\n  position: relative;\r\n  overflow: visible;'
);

// 3. Update sale-can-stage--molido & sale-stage__can--molido
const target3 = `.sale-can-stage--molido {
  position: relative;
  width: clamp(235px, 19.5vw, 275px);
  height: clamp(470px, 39vw, 550px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  margin-bottom: -14px;
}

.sale-stage__can--molido {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  height: 100%;
  width: auto;
  max-width: none;
  object-fit: contain;
  pointer-events: none;
  user-select: none;
  filter: drop-shadow(0 18px 32px rgba(40, 18, 4, 0.35));
}`;

const repl3 = `.sale-can-stage--molido {
  position: relative;
  width: clamp(260px, 22vw, 320px);
  height: clamp(490px, 41vw, 570px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  margin-bottom: -16px;
  overflow: visible;
}

.sale-stage__can--molido {
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  height: 106%;
  width: auto;
  max-width: none;
  object-fit: contain;
  pointer-events: none;
  user-select: none;
  filter: drop-shadow(0 20px 38px rgba(35, 15, 5, 0.42));
}`;

let normalizedTarget3 = target3.replace(/\r\n/g, '\n');
let normalizedRepl3 = repl3.replace(/\r\n/g, '\n');

if (css.includes(target3.replace(/\n/g, '\r\n'))) {
  css = css.replace(target3.replace(/\n/g, '\r\n'), repl3.replace(/\n/g, '\r\n'));
  console.log('Applied target3 with CRLF');
} else if (css.includes(normalizedTarget3)) {
  css = css.replace(normalizedTarget3, normalizedRepl3);
  console.log('Applied target3 with LF');
} else {
  console.log('Warning: target3 not found');
}

fs.writeFileSync('assets/theme.css', css, 'utf8');
console.log('Done patching theme.css');
