// Plik: /.github/scripts/generate-gallery-data.js
// FINALNA WERSJA: Z naprawioną logiką priorytetyzacji okładki "tlo".

const fs = require('fs');
const path = require('path');

const gallerySourcePath = path.join(__dirname, '..', '..', 'assets', 'images', 'galeria');
const outputPath = path.join(__dirname, '..', '..', 'assets', 'js', 'galeria-dane.js');
const coverFilename = 'tlo'; // Nasza magiczna nazwa pliku okładki

function formatAlbumName(folderName) {
    return folderName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

try {
    if (!fs.existsSync(gallerySourcePath)) {
        fs.writeFileSync(outputPath, 'const albumy = [];', 'utf8');
        process.exit(0);
    }

    const albumFolders = fs.readdirSync(gallerySourcePath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory()).map(d => d.name);

    const albumy = [];

    for (const folder of albumFolders) {
        const albumPath = path.join(gallerySourcePath, folder);
        const allFiles = fs.readdirSync(albumPath);

        let media = allFiles
            .filter(file => !file.endsWith('-thumb.jpg'))
            .map(file => {
                const ext = path.extname(file);
                const baseName = path.basename(file, ext);
                const thumbFile = `${baseName}-thumb.jpg`;
                return {
                    full: file,
                    thumb: allFiles.includes(thumbFile) ? thumbFile : file
                };
            });

        if (media.length > 0) {
            // ZMIANA: Poprawiona i uproszczona logika priorytetyzacji okładki
            // Najpierw sortujemy wszystko alfabetycznie.
            media.sort((a, b) => a.full.localeCompare(b.full, undefined, { numeric: true }));

            // Następnie szukamy okładki i przenosimy ją na początek.
            const coverIndex = media.findIndex(m => path.basename(m.full, path.extname(m.full)).toLowerCase() === coverFilename);
            
            if (coverIndex > 0) { // Jeśli znaleziono i nie jest już na początku
                const coverItem = media.splice(coverIndex, 1)[0];
                media.unshift(coverItem);
            }
            
            albumy.push({
                nazwa: formatAlbumName(folder),
                folder: folder,
                media: media
            });
        }
    }

    albumy.reverse();
    const fileContent = `// Ten plik został wygenerowany automatycznie.\nconst albumy = ${JSON.stringify(albumy, null, 4)};`;
    fs.writeFileSync(outputPath, fileContent, 'utf8');
    console.log(`Pomyślnie wygenerowano galeria-dane.js z ${albumy.length} albumami.`);
} catch (error) {
    console.error('Błąd podczas generowania danych galerii:', error);
    process.exit(1);
}