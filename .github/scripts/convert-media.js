// Plik: /.github/scripts/convert-media.js
// FINALNA WERSJA: Tworzy osobne, zoptymalizowane miniaturki.

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const sourceDir = path.join(__dirname, '..', '..', '_src', 'galeria');
const outputDir = path.join(__dirname, '..', '..', 'assets', 'images', 'galeria');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

function processImage(sourcePath, outputPath) {
    console.log(`Przetwarzanie obrazu: ${sourcePath}`);
    const thumbPath = outputPath.replace(/(\.[\w\d_-]+)$/i, '-thumb$1');

    try {
        // Tworzenie pełnowymiarowej, zoptymalizowanej wersji
        if (!fs.existsSync(outputPath)) {
            execSync(`convert "${sourcePath}" -strip -resize "1280x>" -quality 85 "${outputPath}"`);
            console.log(`Stworzono zoptymalizowany plik: ${outputPath}`);
        }
        // Tworzenie małej miniaturki
        if (!fs.existsSync(thumbPath)) {
            execSync(`convert "${sourcePath}" -strip -resize "400x>" -quality 75 "${thumbPath}"`);
            console.log(`Stworzono miniaturkę: ${thumbPath}`);
        }
    } catch (error) {
        console.error(`Błąd podczas przetwarzania obrazu ${sourcePath}: ${error}`);
    }
}

function processVideo(sourcePath, outputPath) {
    console.log(`Przetwarzanie wideo: ${sourcePath}`);
    const thumbPath = outputPath.replace('.mp4', '-thumb.jpg');
    try {
        if (!fs.existsSync(outputPath)) {
            execSync(`ffmpeg -i "${sourcePath}" -vcodec libx264 -acodec aac -movflags +faststart "${outputPath}"`);
            console.log(`Stworzono plik wideo: ${outputPath}`);
        }
        if (!fs.existsSync(thumbPath)) {
            execSync(`ffmpeg -i "${outputPath}" -vf "thumbnail,scale=400:-1" -frames:v 1 "${thumbPath}"`);
            console.log(`Stworzono miniaturkę dla wideo: ${thumbPath}`);
        }
    } catch (error) {
        console.error(`Błąd podczas przetwarzania wideo ${sourcePath}: ${error}`);
    }
}

fs.readdirSync(sourceDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .forEach(albumDir => {
        const sourceAlbumPath = path.join(sourceDir, albumDir.name);
        const outputAlbumPath = path.join(outputDir, albumDir.name);
        if (!fs.existsSync(outputAlbumPath)) fs.mkdirSync(outputAlbumPath, { recursive: true });

        fs.readdirSync(sourceAlbumPath).forEach(file => {
            const sourceFile = path.join(sourceAlbumPath, file);
            const ext = path.extname(file).toLowerCase();
            const baseName = path.basename(file, ext);
            
            if (['.heic', '.jpg', '.jpeg', '.png'].includes(ext)) {
                processImage(sourceFile, path.join(outputAlbumPath, `${baseName}.jpg`));
            } else if (['.mov', '.mp4'].includes(ext)) {
                processVideo(sourceFile, path.join(outputAlbumPath, `${baseName}.mp4`));
            } else {
                console.log(`Pominięto nieobsługiwany plik: ${file}`);
            }
        });
    });

console.log('Proces konwersji i optymalizacji zakończony.');