// Plik: /.github/scripts/generate-gallery-data.js
// FINALNA WERSJA: Tworzy strukturę danych z osobnymi ścieżkami do miniaturek.

const fs = require('fs');
const path = require('path');

const gallerySourcePath = path.join(__dirname, '..', '..', 'assets', 'images', 'galeria');
const outputPath = path.join(__dirname, '..', '..', 'assets', 'js', 'galeria-dane.js');
const coverFilename = 'tlo';

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

        const media = allFiles
            .filter(file => !file.endsWith('-thumb.jpg'))
            .map(file => {
                const ext = path.extname(file);
                const baseName = path.basename(file, ext);
                const thumbFile = `${baseName}-thumb.jpg`;
                return {
                    full: file,
                    thumb: allFiles.includes(thumbFile) ? thumbFile : file // Użyj pełnego jeśli miniaturka nie istnieje
                };
            });

        if (media.length > 0) {
            const coverIndex = media.findIndex(m => path.basename(m.full, path.extname(m.full)).toLowerCase() === coverFilename);
            if (coverIndex > -1) {
                const cover = media.splice(coverIndex, 1)[0];
                media.unshift(cover);
            }
            
            albumy.push({
                nazwa: formatAlbumName(folder),
                folder: folder,
                media: media.sort((a,b) => a.full.localeCompare(b.full, undefined, {numeric: true}))
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