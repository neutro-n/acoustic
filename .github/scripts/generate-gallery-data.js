// Plik: /.github/scripts/generate-gallery-data.js
// Zaktualizowany, aby dawać priorytet plikowi "tlo" jako okładce.

const fs = require('fs');
const path = require('path');

const gallerySourcePath = path.join(__dirname, '..', '..', 'assets', 'images', 'galeria');
const outputPath = path.join(__dirname, '..', '..', 'assets', 'js', 'galeria-dane.js');

const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const videoExtensions = ['.mp4', '.mov', '.webm'];
const coverFilename = 'tlo'; // Nasza magiczna nazwa pliku okładki

function formatAlbumName(folderName) {
    return folderName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

try {
    if (!fs.existsSync(gallerySourcePath)) {
        console.log("Folder galerii w 'assets' jeszcze nie istnieje. Pomijam generowanie pliku.");
        const fileContent = `const albumy = [];`;
        fs.writeFileSync(outputPath, fileContent, 'utf8');
        process.exit(0);
    }

    const albumFolders = fs.readdirSync(gallerySourcePath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    const albumy = [];

    for (const folder of albumFolders) {
        const albumPath = path.join(gallerySourcePath, folder);
        
        let mediaFiles = fs.readdirSync(albumPath)
            .filter(file => {
                const ext = path.extname(file).toLowerCase();
                return imageExtensions.includes(ext) || videoExtensions.includes(ext);
            });

        if (mediaFiles.length > 0) {
            // ZMIANA: Logika szukania i priorytetyzacji okładki
            const coverIndex = mediaFiles.findIndex(file => path.basename(file, path.extname(file)).toLowerCase() === coverFilename);
            
            if (coverIndex > -1) {
                // Znaleziono plik "tlo", przenieś go na początek listy
                const coverFile = mediaFiles.splice(coverIndex, 1)[0];
                mediaFiles.unshift(coverFile);
            }
            
            albumy.push({
                nazwa: formatAlbumName(folder),
                folder: folder,
                media: mediaFiles.sort((a, b) => {
                    // Sortuj, ale upewnij się, że okładka zawsze jest pierwsza
                    if (path.basename(a, path.extname(a)).toLowerCase() === coverFilename) return -1;
                    if (path.basename(b, path.extname(b)).toLowerCase() === coverFilename) return 1;
                    return a.localeCompare(b, undefined, {numeric: true, sensitivity: 'base'});
                })
            });
        }
    }

    albumy.reverse();
    const fileContent = `// Ten plik został wygenerowany automatycznie przez GitHub Actions.\n// Nie edytuj go ręcznie!\n\nconst albumy = ${JSON.stringify(albumy, null, 4)};`;
    fs.writeFileSync(outputPath, fileContent, 'utf8');
    console.log(`Pomyślnie wygenerowano galeria-dane.js z ${albumy.length} albumami.`);

} catch (error) {
    console.error('Wystąpił błąd podczas generowania danych galerii:', error);
    process.exit(1);
}