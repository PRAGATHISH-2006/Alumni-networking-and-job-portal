const router = require('./routes/eventRoutes');
console.log('Routes in eventRoutes:');
router.stack.forEach(layer => {
    if (layer.route) {
        console.log(`Path: ${layer.route.path}, Methods: ${Object.keys(layer.route.methods)}`);
        layer.route.stack.forEach(s => {
            console.log(`  - Middleware: ${s.name}`);
        });
    }
});
process.exit(0);
