/* Plik: /assets/js/galeria-skrypt.js */
// WERSJA NAPRAWCZA: Uproszczona, niezawodna logika ładowania miniaturek.

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
  if (!album || !album.media || album.media.length === 0) return;

  albumTitle.textContent = album.nazwa;
  currentAlbumTitle.textContent = album.nazwa;
  photoGrid.innerHTML = '';
  
  if (activeGallery) activeGallery.destroy();

  const dynamicGalleryItems = album.media.map(mediaItem => {
    const fullUrl = `assets/images/galeria/${album.folder}/${mediaItem.full}`;
    const thumbUrl = `assets/images/galeria/${album.folder}/${mediaItem.thumb}`;
    
    if (isVideo(mediaItem.full)) {
        return { src: fullUrl, thumb: thumbUrl, video: { source: [{ src: fullUrl, type: 'video/mp4' }], attributes: { preload: false, controls: true }}};
    }
    return { src: fullUrl, thumb: thumbUrl };
  });

  dynamicGalleryItems.forEach((item, index) => {
    const itemEl = document.createElement('a'); // Używamy linku `<a>`
    itemEl.className = 'photo-item';
    itemEl.href = item.src; // Link do pełnego pliku dla LightGallery
    itemEl.dataset.lgSize = "1280-853"; // Przykładowy rozmiar, pomaga LightGallery

    if (isVideo(item.src)) {
        // Dla wideo, tworzymy div z tłem miniaturki
        itemEl.innerHTML = `<div class="video-thumb" style="background-image: url('${item.thumb}')"></div><div class="video-icon"><i class="fa-solid fa-play"></i></div>`;
    } else {
        // Dla zdjęć, używamy tagu <img> z leniwym ładowaniem
        itemEl.innerHTML = `<img src="${item.thumb}" alt="${album.nazwa}" loading="lazy" />`;
    }
    photoGrid.appendChild(itemEl);
  });
  
  activeGallery = lightGallery(photoGrid, {
    plugins: [lgZoom, lgThumbnail, lgVideo],
    download: false,
    selector: '.photo-item',
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
  if (!album.media || album.media.length === 0) return;
  const firstMedia = album.media[0];
  const thumbnailUrl = `assets/images/galeria/${album.folder}/${firstMedia.thumb}`;
  
  const albumCard = document.createElement('div');
  albumCard.className = 'album-card';
  let thumbnailHTML = `<div class="album-thumbnail" style="background-image: url('${thumbnailUrl}')">`;
  if (isVideo(firstMedia.full)) {
      thumbnailHTML += `<div class="video-icon"><i class="fa-solid fa-film"></i></div>`;
  }
  thumbnailHTML += `</div>`;

  albumCard.innerHTML = `
    ${thumbnailHTML}
    <div class="album-info">
        <h3>${album.nazwa}</h3>
        <span class="photo-count">${album.media.length} plików</span>
    </div>`;
  albumCard.addEventListener('click', () => showAlbum(album.folder));
  albumGrid.appendChild(albumCard);
});

backToAlbumsBtn.addEventListener('click', showAlbumGrid);
headerBackBtn.addEventListener('click', showAlbumGrid);