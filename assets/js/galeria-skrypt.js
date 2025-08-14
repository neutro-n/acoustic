/* Plik: /assets/js/galeria-skrypt.js */
// FINALNA WERSJA POPRAWKOWA 2: Z autoodtwarzaniem wideo i naprawą błędu spacji.

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
  if (!album || !album.media || !album.media.length === 0) return;

  albumTitle.textContent = album.nazwa;
  currentAlbumTitle.textContent = album.nazwa;
  photoGrid.innerHTML = '';
  
  if (activeGallery) activeGallery.destroy();

  const dynamicGalleryItems = album.media.map(mediaItem => {
    const fullUrl = `assets/images/galeria/${album.folder}/${mediaItem.full}`;
    const thumbUrl = `assets/images/galeria/${album.folder}/${mediaItem.thumb}`;
    
    if (isVideo(mediaItem.full)) {
        return { 
            video: { 
                source: [{ src: fullUrl, type: 'video/mp4' }],
                attributes: { preload: false, controls: true }
            },
            thumb: thumbUrl,
            subHtml: `<h4>${album.nazwa}</h4>`
        };
    }
    return { src: fullUrl, thumb: thumbUrl, subHtml: `<h4>${album.nazwa}</h4>` };
  });

  dynamicGalleryItems.forEach((item, index) => {
    const itemEl = document.createElement('div');
    itemEl.className = 'photo-item';
    itemEl.dataset.index = index;
    
    if (item.video) {
        itemEl.innerHTML = `<div class="video-thumb" style="background-image: url('${item.thumb}')"></div><div class="video-icon"><i class="fa-solid fa-play"></i></div>`;
    } else {
        itemEl.innerHTML = `<img src="${item.thumb}" alt="${album.nazwa}" loading="lazy" />`;
    }
    photoGrid.appendChild(itemEl);
  });
  
  // ZMIANA: Dodano nowe opcje konfiguracyjne i eventy
  activeGallery = lightGallery(photoGrid, {
    dynamic: true,
    dynamicEl: dynamicGalleryItems,
    plugins: [lgZoom, lgThumbnail, lgVideo],
    download: false,
    autoplayVideoOnSlide: true, // Automatyczne odtwarzanie wideo
  });

  // ZMIANA: Dodano event listener do naprawy błędu ze spacją
  photoGrid.addEventListener('lgAfterSlide', (event) => {
    const { a: lightGalleryInstance, index: currentSlideIndex } = event.detail;
    
    // Znajdź wszystkie odtwarzacze wideo w galerii
    const videos = lightGalleryInstance.container.querySelectorAll('.lg-video-object');
    
    videos.forEach((video, videoIndex) => {
      // Jeśli to nie jest wideo na aktualnym slajdzie, zatrzymaj je
      if (videoIndex !== currentSlideIndex) {
        try {
          video.pause();
        } catch(e) {
          console.warn("Nie można zatrzymać wideo:", e);
        }
      }
    });
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