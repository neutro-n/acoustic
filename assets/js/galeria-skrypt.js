/* Plik: /assets/js/galeria-skrypt.js */
// FINALNA WERSJA: Z leniwym ładowaniem dla maksymalnej wydajności.

document.getElementById('year').textContent = new Date().getFullYear();

// Wszystkie stałe elementy DOM
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

let activeGallery = null; 

// Funkcja Leniwego Ładowania
const lazyLoadObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            observer.unobserve(img);
        }
    });
});

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
        return { src: fullUrl, thumb: thumbUrl, video: { source: [{ src: fullUrl, type: 'video/mp4' }] } };
    }
    return { src: fullUrl, thumb: thumbUrl };
  });

  dynamicGalleryItems.forEach((item, index) => {
    const itemEl = document.createElement('div');
    itemEl.className = 'photo-item';
    itemEl.dataset.index = index;
    
    // Zamiast `img`, tworzymy `div` z tłem, żeby uniknąć problemów z aspect-ratio
    const thumbDiv = document.createElement('div');
    thumbDiv.className = 'photo-thumb lazy';
    thumbDiv.dataset.src = item.thumb; // URL do leniwego ładowania tła
    
    if (isVideo(item.src)) {
        thumbDiv.innerHTML = `<div class="video-icon"><i class="fa-solid fa-play"></i></div>`;
    }
    itemEl.appendChild(thumbDiv);
    photoGrid.appendChild(itemEl);
  });
  
  // Leniwe ładowanie dla teł
  const lazyThumbs = photoGrid.querySelectorAll('.lazy');
  lazyThumbs.forEach(thumb => lazyLoadObserver.observe(thumb));

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