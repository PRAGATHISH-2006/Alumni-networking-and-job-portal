try {
    console.log('Requiring models...');
    const models = require('./models');
    console.log('Models loaded.');
    console.log('Requiring adminController...');
    const adminController = require('./controllers/adminController');
    console.log('adminController loaded.');
} catch (e) {
    console.error(e);
}
