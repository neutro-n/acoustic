/* Plik: /assets/js/galeria-skrypt.js */
// Zaktualizowany, aby używać statycznych miniaturek dla filmów, co eliminuje lagi.

document.getElementById('year').textContent = new Date().getFullYear();

const mainHeader = document.getElementById('main-header');
const albumHeaderBar = document.getElementById('album-header-bar');
const currentAlbumTitle = document.getElementById('current-album-title');
const headerBackBtn = document.getElementById('header-back-btn');
const albumView = document.getElementById('album-view');
const photoView = document.getElementById('photo-view');
const albumGrid = document.getElementById('album-grid');
const photoGrid = document.getElementById('photo-grid');
const albumTitle = document.getElementById('album-title');
const backToAlbumsBtn = document.getElementById('back-to-albums');
const videoExtensions = ['.mp4', '.mov', '.webm'];
const coverFilename = 'tlo';

let activeGallery = null; 

function isVideo(filename) {
    if (!filename) return false;
    return videoExtensions.some(ext => filename.toLowerCase().endsWith(ext));
}

function showAlbum(albumFolder) {
  const album = albumy.find(a => a.folder === albumFolder);
  if (!album || !album.media || album.media.length === 0) {
      console.error("Nie można wyświetlić albumu, ponieważ nie zawiera on mediów lub nie został znaleziony.");
      return;
  };

  albumTitle.textContent = album.nazwa;
  currentAlbumTitle.textContent = album.nazwa;
  photoGrid.innerHTML = '';
  
  if (activeGallery) {
    activeGallery.destroy();
  }

  const mediaToShow = album.media.filter(mediaFile => {
      const basename = mediaFile.split('.').slice(0, -1).join('.').toLowerCase();
      return basename !== coverFilename;
  });
  
  const finalMediaList = mediaToShow.length > 0 ? mediaToShow : album.media;

  const dynamicGalleryItems = [];

  finalMediaList.forEach((mediaFile, index) => {
    const isExternal = mediaFile.startsWith('http');
    const mediaUrl = isExternal ? mediaFile : `assets/images/galeria/${album.folder}/${mediaFile}`;
    const thumbnailUrl = isVideo(mediaFile) ? mediaUrl.replace(/\.[^/.]+$/, ".jpg") : mediaUrl;
    
    const item = document.createElement('div'); // Teraz to jest div, który otworzy galerię
    item.className = 'photo-item';
    item.dataset.index = index; 
    
    // ZMIANA: Zamiast tagu <video>, używamy tła z miniaturki .jpg
    if (isVideo(mediaFile)) {
        item.innerHTML = `<div class="video-thumb" style="background-image: url('${thumbnailUrl}')"></div><div class="video-icon"><i class="fa-solid fa-play"></i></div>`;
        dynamicGalleryItems.push({
            src: mediaUrl,
            thumb: thumbnailUrl,
            video: {
                source: [{ src: mediaUrl, type: 'video/mp4' }],
                attributes: { preload: false, controls: true }
            }
        });
    } else {
        item.innerHTML = `<img src="${mediaUrl}" alt="${album.nazwa}" />`;
        dynamicGalleryItems.push({
            src: mediaUrl,
            thumb: thumbnailUrl,
        });
    }
    photoGrid.appendChild(item);
  });

  activeGallery = lightGallery(photoGrid, {
    dynamic: true,
    dynamicEl: dynamicGalleryItems,
    plugins: [lgZoom, lgThumbnail, lgVideo],
    download: false,
  });

  photoGrid.addEventListener('click', (event) => {
    const clickedItem = event.target.closest('.photo-item');
    if (clickedItem) {
        const index = parseInt(clickedItem.dataset.index, 10);
        activeGallery.openGallery(index);
    }
  });
  
  mainHeader.classList.add('hidden');
  albumHeaderBar.classList.remove('hidden');
  albumView.classList.add('hidden');
  photoView.classList.remove('hidden');
  window.scrollTo(0, 0);
}

function showAlbumGrid() {
    mainHeader.classList.remove('hidden');
    albumHeaderBar.classList.add('hidden');
    photoView.classList.add('hidden');
    albumView.classList.remove('hidden');
}

albumy.forEach(album => {
  if (!album.media || album.media.length === 0) {
    return; 
  }

  const firstMedia = album.media[0];
  const isExternal = firstMedia.startsWith('http');
  const mediaUrl = isExternal ? firstMedia : `assets/images/galeria/${album.folder}/${firstMedia}`;
  
  const albumCard = document.createElement('div');
  albumCard.className = 'album-card';
  
  let thumbnailHTML;
  if (isVideo(firstMedia)) {
      const thumbnailUrl = mediaUrl.replace(/\.[^/.]+$/, ".jpg");
      thumbnailHTML = `<div class="album-thumbnail" style="background-image: url('${thumbnailUrl}')"><div class="video-icon"><i class="fa-solid fa-film"></i></div></div>`;
  } else {
      thumbnailHTML = `<div class="album-thumbnail" style="background-image: url('${mediaUrl}')"></div>`;
  }

  albumCard.innerHTML = `
    ${thumbnailHTML}
    <div class="album-info">
        <h3>${album.nazwa}</h3>
        <span class="photo-count">${album.media.length} plików</span>
    </div>
  `;
  albumCard.addEventListener('click', () => showAlbum(album.folder));
  albumGrid.appendChild(albumCard);
});

backToAlbumsBtn.addEventListener('click', showAlbumGrid);
headerBackBtn.addEventListener('click', showAlbumGrid);