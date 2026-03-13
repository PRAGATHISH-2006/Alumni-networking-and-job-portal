const fs = require('fs');
const router = require('./routes/eventRoutes');
let output = 'Routes in eventRoutes:\n';
router.stack.forEach(layer => {
    if (layer.route) {
        output += `Path: ${layer.route.path}, Methods: ${Object.keys(layer.route.methods).join(',')}\n`;
        layer.route.stack.forEach(s => {
            output += `  - Middleware: ${s.name}\n`;
        });
    }
});
fs.writeFileSync('router_debug_v2.txt', output, 'utf8');
console.log('Done');
process.exit(0);
