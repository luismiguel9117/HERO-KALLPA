const fs = require('fs');
let raw = fs.readFileSync('templates/index.json', 'utf8');

// Strip leading /* ... */ comment if present
raw = raw.replace(/^\/\*[\s\S]*?\*\//, '').trim();

let index = JSON.parse(raw);

index.sections.reels_1 = {
  type: 'kallpa-reels',
  settings: {
    eyebrow: 'COMUNIDAD KALPA',
    title_part1: 'ENERGÍA QUE',
    title_part2: 'SE COMPARTE',
    desc: 'Historias reales de personas que viven la energía de los Andes.<br>Entrena, trabaja, explora. Kallpa te acompaña.',
    instagram_url: 'https://instagram.com'
  },
  blocks: {
    reel_1: {
      type: 'reel',
      settings: {
        title: 'Atleta Mujer',
        default_image: 'reel-1.jpg',
        views: '125K',
        reel_url: 'https://www.instagram.com'
      }
    },
    reel_2: {
      type: 'reel',
      settings: {
        title: 'Runner Hombre',
        default_image: 'reel-2.jpg',
        views: '98K',
        reel_url: 'https://www.instagram.com'
      }
    },
    reel_3: {
      type: 'reel',
      settings: {
        title: 'Lata KALPA',
        default_image: 'reel-3.jpg',
        views: '210K',
        reel_url: 'https://www.instagram.com'
      }
    }
  },
  block_order: ['reel_1', 'reel_2', 'reel_3']
};

fs.writeFileSync('templates/index.json', JSON.stringify(index, null, 2), 'utf8');
console.log('templates/index.json successfully updated with reel blocks');
