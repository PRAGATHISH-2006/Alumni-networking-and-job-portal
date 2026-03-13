const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'frontend', 'src');

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // 1. Replace hardcoded localhost URLs in API calls
    // Supports: axios.get('http://localhost:5000/api/...') -> API.get('/api/...')
    // Supports: axios[method]('http://localhost:5000/api/...') -> API[method]('/api/...')
    content = content.replace(/axios(\.get|\.post|\.put|\.patch|\.delete|\[method\])\(['"`]http:\/\/localhost:5000(\/api\/.*?)['"`]/g, 'API$1(\'$2\'');
    
    // 2. Also catch cases where it just says /api/... but still uses axios
    // axios.get('/api/...') -> API.get('/api/...')
    content = content.replace(/axios(\.get|\.post|\.put|\.patch|\.delete)\(['"`](\/api\/.*?)['"`]/g, 'API$1(\'$2\'');

    // 3. Special case for Admin.jsx backticks
    content = content.replace(/axios(\.get|\.post|\.put|\.patch|\.delete|\[method\])\(`http:\/\/localhost:5000(\/api\/.*?)`/g, 'API$1(\`$2\`');

    // 4. If we replaced axios with API, ensure API is imported and axios is not used incorrectly
    // This is tricky to automate perfectly with regex, but most files already have the API import.
    // Let's just do the string replacements for now.
    
    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed URLs in: ${filePath}`);
    }
}

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            fixFile(fullPath);
        }
    }
}

console.log('Starting URL fix...');
processDir(targetDir);
console.log('Finished.');
