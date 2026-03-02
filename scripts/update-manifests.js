const fs = require('fs');

const filesToUpdate = [
    'lib/graphicsManifest.ts',
    'lib/galleryData.ts'
];

filesToUpdate.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        content = content.replace(/\.jpg(?="|\s)/g, '.webp');
        content = content.replace(/\.jpeg(?="|\s)/g, '.webp');
        content = content.replace(/\.png(?="|\s)/g, '.webp');
        fs.writeFileSync(file, content);
        console.log(`Updated references in: ${file}`);
    } else {
        console.log(`File not found: ${file}`);
    }
});
