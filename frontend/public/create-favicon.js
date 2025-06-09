const fs = require('fs');
const path = require('path');

// Simple ASCII art target with checkmark for favicon
const createSimpleFavicon = () => {
  // This creates a simple data URI for a 32x32 favicon
  const canvas = `
<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <circle cx="16" cy="16" r="14" fill="none" stroke="#2563eb" stroke-width="2"/>
  <circle cx="16" cy="16" r="9" fill="none" stroke="#3b82f6" stroke-width="1"/>
  <circle cx="16" cy="16" r="5" fill="#2563eb"/>
  <path d="M12 16 L14 18 L20 12" stroke="white" stroke-width="2" stroke-linecap="round" fill="none"/>
</svg>`;
  
  return canvas;
};

// Create the favicon SVG
const faviconSvg = createSimpleFavicon();
fs.writeFileSync(path.join(__dirname, 'favicon.svg'), faviconSvg);

console.log('Created favicon.svg - you can convert this to favicon.ico using online tools or ImageMagick');
console.log('To convert: Use https://favicon.io/favicon-converter/ or run: convert favicon.svg favicon.ico');
