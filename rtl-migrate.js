const fs = require('fs');
const path = require('path');

function walk(dir) {
    if (!fs.existsSync(dir)) return [];
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        if(file.includes('node_modules') || file.includes('.git') || file.includes('.next')) return;
        const fullPath = path.resolve(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(fullPath));
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            results.push(fullPath);
        }
    });
    return results;
}

const files = [...walk('components/ui'), ...walk('app/dashboard')];

const replacements = [
    [/(\s|^|["'`])ml-([a-z0-9\-\[\]]+)/g, '$1ms-$2'],
    [/(\s|^|["'`])mr-([a-z0-9\-\[\]]+)/g, '$1me-$2'],
    [/(\s|^|["'`])pl-([a-z0-9\-\[\]]+)/g, '$1ps-$2'],
    [/(\s|^|["'`])pr-([a-z0-9\-\[\]]+)/g, '$1pe-$2'],
    [/(\s|^|["'`])left-([a-z0-9\-\[\]]+)/g, '$1start-$2'],
    [/(\s|^|["'`])right-([a-z0-9\-\[\]]+)/g, '$1end-$2'],
    [/(\s|^|["'`])border-l-([a-z0-9\-\[\]]+)/g, '$1border-s-$2'],
    [/(\s|^|["'`])border-l(\s|["'`])/g, '$1border-s$2'],
    [/(\s|^|["'`])border-r-([a-z0-9\-\[\]]+)/g, '$1border-e-$2'],
    [/(\s|^|["'`])border-r(\s|["'`])/g, '$1border-e$2'],
    [/(\s|^|["'`])rounded-l-([a-z0-9\-\[\]]+)/g, '$1rounded-s-$2'],
    [/(\s|^|["'`])rounded-r-([a-z0-9\-\[\]]+)/g, '$1rounded-e-$2'],
    [/(\s|^|["'`])rounded-tl-([a-z0-9\-\[\]]+)/g, '$1rounded-ts-$2'],
    [/(\s|^|["'`])rounded-tr-([a-z0-9\-\[\]]+)/g, '$1rounded-te-$2'],
    [/(\s|^|["'`])rounded-bl-([a-z0-9\-\[\]]+)/g, '$1rounded-bs-$2'],
    [/(\s|^|["'`])rounded-br-([a-z0-9\-\[\]]+)/g, '$1rounded-be-$2'],
    [/(\s|^|["'`])text-left(\s|["'`])/g, '$1text-start$2'],
    [/(\s|^|["'`])text-right(\s|["'`])/g, '$1text-end$2'],
    [/slide-in-from-left-([a-z0-9\-\[\]]+)/g, 'slide-in-from-start-$1'],
    [/slide-in-from-right-([a-z0-9\-\[\]]+)/g, 'slide-in-from-end-$1'],
    [/slide-out-to-left-([a-z0-9\-\[\]]+)/g, 'slide-out-to-start-$1'],
    [/slide-out-to-right-([a-z0-9\-\[\]]+)/g, 'slide-out-to-end-$1'],
];

let changedFiles = 0;
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    replacements.forEach(([regex, replace]) => {
        content = content.replace(regex, replace);
    });

    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log('Updated', file);
        changedFiles++;
    }
});

console.log('Migration complete. Modified ' + changedFiles + ' files.');
