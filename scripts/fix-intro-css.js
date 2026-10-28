const fs = require('fs');
let css = fs.readFileSync('assets/kalpa-intro.css', 'utf8');

const regex = /\.kalpa-announcement-bar,\s*\r?\n\.kalpa-navbar\s*\{[\s\S]*?pointer-events:\s*none;\s*\}/;
const replacement = `.has-intro .kalpa-announcement-bar,
.has-intro .kalpa-navbar {
  opacity: 0;
  transform: translateY(-20px);
  transition: opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1), transform 0.65s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
}`;

css = css.replace(regex, replacement);
fs.writeFileSync('assets/kalpa-intro.css', css, 'utf8');
console.log('Fixed intro css scoped to .has-intro');
