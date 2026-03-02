const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const directory = 'public/Graphics';

fs.readdir(directory, (err, files) => {
    if (err) throw err;

    files.forEach(file => {
        const ext = path.extname(file).toLowerCase();
        if (ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
            const inputPath = path.join(directory, file);
            const outputPath = path.join(directory, path.basename(file, ext) + '.webp');

            sharp(inputPath)
                .webp({ quality: 80 })
                .toFile(outputPath)
                .then(() => {
                    console.log(`Converted: ${file} -> ${path.basename(file, ext)}.webp`);
                    fs.unlinkSync(inputPath); // Delete original
                })
                .catch(err => {
                    console.error(`Error converting ${file}:`, err);
                });
        }
    });
});
