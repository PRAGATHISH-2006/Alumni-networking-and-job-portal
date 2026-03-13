const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'frontend', 'src', 'pages');

function resolveFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Regex to match conflict blocks and keep only the HEAD part
    // This matches:
    // <<<<<<< HEAD
    // [KEEP THIS]
    // =======
    // [DISCARD THIS]
    // >>>>>>> [ID]
    const regex = /<<<<<<< HEAD\r?\n([\s\S]*?)\r?\n=======\r?\n[\s\S]*?\r?\n>>>>>>> .*/g;
    
    const newContent = content.replace(regex, '$1');
    
    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Resolved: ${filePath}`);
    }
}

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            resolveFile(fullPath);
        }
    }
}

console.log('Starting conflict resolution...');
processDir(targetDir);
console.log('Finished.');
