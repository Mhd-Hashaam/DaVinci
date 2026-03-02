const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const directory = 'public/Apparel Media/Shirt 3D Models';

const filesToCompress = [
    'basic_t-shirt.glb',
    'long_sleeve_t-_shirt.glb',
    'oversized_t-shirt.glb',
    'sweater_pack.glb',
    't-shirt_for_female.glb'
];

// Try to find local binary first
const localBin = path.join('node_modules', '.bin', 'gltf-pipeline.cmd'); // Windows
const useLocal = fs.existsSync(localBin);
const cmdPrefix = useLocal ? `"${localBin}"` : 'npx gltf-pipeline';

console.log(`Using compressor: ${cmdPrefix}`);

filesToCompress.forEach(file => {
    const inputPath = path.join(directory, file);
    const outputPath = path.join(directory, 'compressed_' + file);

    if (fs.existsSync(inputPath)) {
        console.log(`Compressing: ${file}...`);
        try {
            // -d: apply draco compression
            // -b: binary output (.glb)
            execSync(`${cmdPrefix} -i "${inputPath}" -o "${outputPath}" -d -b`, { stdio: 'inherit' });

            // Check sizes
            if (fs.existsSync(outputPath)) {
                const originalSize = fs.statSync(inputPath).size / (1024 * 1024);
                const compressedSize = fs.statSync(outputPath).size / (1024 * 1024);

                console.log(`Original: ${originalSize.toFixed(2)} MB -> Compressed: ${compressedSize.toFixed(2)} MB`);

                if (compressedSize < originalSize) {
                    fs.unlinkSync(inputPath);
                    fs.renameSync(outputPath, inputPath);
                    console.log(`SUCCESS: Replaced ${file} with compressed version.`);
                } else {
                    fs.unlinkSync(outputPath);
                    console.log(`SKIPPED: Compressed version was larger.`);
                }
            } else {
                console.error(`ERROR: Output file not created for ${file}`);
            }

        } catch (error) {
            console.error(`ERROR compressing ${file}:`, error.message);
        }
    } else {
        console.log(`File not found: ${file}`);
    }
});
