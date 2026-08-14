const fs = require('fs');
const svg = fs.readFileSync('blue_clean.svg', 'utf8');
const paths = svg.match(/<path[^>]+>/g) || [];
const logo3Paths = paths.filter(p => {
    const match = p.match(/matrix\(([^, ]+)[, ]+([^, ]+)[, ]+([^, ]+)[, ]+([^, ]+)[, ]+([^, ]+)[, ]+([^, \)]+)\)/);
    if (match && parseFloat(match[5]) > 800) return true;
    return false;
});

let outSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="850 0 400 1000" width="400" height="1000">\n`;

logo3Paths.forEach(p => {
    if (p.includes('d="m0 0 95.012')) {
        p = p.replace('fill="#2e368f"', 'fill="#2e368f" stroke="#ffffff" stroke-width="4" stroke-linejoin="round"');
    }
    if (p.includes('c-13.211 0-23.92 10.709-23.92 23.921')) { // Circle
        p = p.replace('fill="#2e368f"', 'fill="#2e368f" stroke="#ffffff" stroke-width="4"');
    }
    outSVG += `  ${p}\n`;
});
outSVG += `</svg>`;
fs.writeFileSync('spikey_logo_fixed.svg', outSVG);
console.log('Fixed extract script completed! Found paths: ' + logo3Paths.length);
