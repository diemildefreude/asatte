const fs = require('fs');
let svg = fs.readFileSync('blue_clean.svg', 'utf8');
svg = svg.replace(/\s*(clip-path|mask)="[^"]+"/g, '');
svg = svg.replace(/<clipPath[\s\S]*?<\/clipPath>/g, '');
svg = svg.replace(/<mask[\s\S]*?<\/mask>/g, '');
fs.writeFileSync('blue_fixed.svg', svg);
console.log('Fixed SVG created.');
