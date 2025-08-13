// Plik: /.github/scripts/convert-media.js
// Ten skrypt konwertuje pliki HEIC na JPG i MOV na MP4.

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const sourceDir = path.join(__dirname, '..', '..', '_src', 'galeria');
const outputDir = path.join(__dirname, '..', '..', 'assets', 'images', 'galeria');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

function convertHeicToJpg(sourceFile, outputFile) {
    console.log(`Konwertowanie ${sourceFile} -> ${outputFile}`);
    try {
        execSync(`convert "${sourceFile}" "${outputFile}"`);
        console.log('Konwersja HEIC zakończona sukcesem.');
    } catch (error) {
        console.error(`Błąd podczas konwersji HEIC: ${error}`);
    }
}

function convertMovToMp4(sourceFile, outputFile) {
    console.log(`Konwertowanie ${sourceFile} -> ${outputFile}`);
    try {
        execSync(`ffmpeg -i "${sourceFile}" -q:v 0 "${outputFile}"`);
        console.log('Konwersja MOV zakończona sukcesem.');
    } catch (error) {
        console.error(`Błąd podczas konwersji MOV: ${error}`);
    }
}

fs.readdirSync(sourceDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .forEach(albumDir => {
        const sourceAlbumPath = path.join(sourceDir, albumDir.name);
        const outputAlbumPath = path.join(outputDir, albumDir.name);

        if (!fs.existsSync(outputAlbumPath)) {
            fs.mkdirSync(outputAlbumPath, { recursive: true });
        }

        fs.readdirSync(sourceAlbumPath).forEach(file => {
            const sourceFile = path.join(sourceAlbumPath, file);
            const ext = path.extname(file).toLowerCase();
            const baseName = path.basename(file, ext);
            
            let outputFile;

            if (ext === '.heic') {
                outputFile = path.join(outputAlbumPath, `${baseName}.jpg`);
                if (!fs.existsSync(outputFile)) {
                    convertHeicToJpg(sourceFile, outputFile);
                }
            } else if (ext === '.mov') {
                outputFile = path.join(outputAlbumPath, `${baseName}.mp4`);
                if (!fs.existsSync(outputFile)) {
                    convertMovToMp4(sourceFile, outputFile);
                }
            } else {
                outputFile = path.join(outputAlbumPath, file);
                if (!fs.existsSync(outputFile)) {
                    console.log(`Kopiowanie ${sourceFile} -> ${outputFile}`);
                    fs.copyFileSync(sourceFile, outputFile);
                }
            }
        });
    });

console.log('Proces konwersji i kopiowania zakończony.');