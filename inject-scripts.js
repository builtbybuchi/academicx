const fs = require('fs');
const path = require('path');

const appsDir = path.join(__dirname, 'apps');
const apps = fs.readdirSync(appsDir);

const liquidGLScripts = `
  <!-- LiquidGL Dependencies Added for v2 Redesign -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/naughtyduk/liquidGL/scripts/liquidGL.js"></script>
`;

apps.forEach(app => {
    const htmlPath = path.join(appsDir, app, 'index.html');
    if (fs.existsSync(htmlPath)) {
        let content = fs.readFileSync(htmlPath, 'utf8');
        if (!content.includes('liquidGL.js')) {
            content = content.replace('</head>', `${liquidGLScripts}\n</head>`);
            fs.writeFileSync(htmlPath, content, 'utf8');
            console.log(`Updated ${app}/index.html with LiquidGL CDN links.`);
        } else {
            console.log(`${app}/index.html already has LiquidGL.`);
        }
    }
});
