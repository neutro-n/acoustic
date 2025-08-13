/* Plik: /assets/js/galeria-skrypt.js */

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
  
  // ZMIANA: Filtrujemy media, żeby nie pokazywać okładki w siatce zdjęć, jeśli jest to osobny plik
  const mediaToShow = album.media.filter(mediaFile => {
      const basename = mediaFile.split('.').slice(0, -1).join('.').toLowerCase();
      return basename !== coverFilename;
  });
  
  // Jeśli po odfiltrowaniu nic nie zostało (bo był tylko plik tła), pokaż wszystko
  const finalMediaList = mediaToShow.length > 0 ? mediaToShow : album.media;

  finalMediaList.forEach(mediaFile => {
    const isExternal = mediaFile.startsWith('http');
    const mediaUrl = isExternal ? mediaFile : `assets/images/galeria/${album.folder}/${mediaFile}`;
    const item = document.createElement('a');
    item.className = 'photo-item';
    item.href = mediaUrl;
    
    if (isVideo(mediaFile)) {
        item.dataset.src = mediaUrl;
        item.innerHTML = `<video muted loop playsinline><source src="${mediaUrl}" type="video/mp4"></video><div class="video-icon"><i class="fa-solid fa-play"></i></div>`;
    } else {
        item.innerHTML = `<img src="${mediaUrl}" alt="${album.nazwa}" />`;
    }
    photoGrid.appendChild(item);
  });

  lightGallery(photoGrid, {
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
  if (!album.media || album.media.length === 0) {
    console.warn(`Album "${album.nazwa}" jest pusty i został pominięty.`);
    return;
  }

  const firstMedia = album.media[0];
  const isExternal = firstMedia.startsWith('http');
  const thumbnailUrl = isExternal ? firstMedia : `assets/images/galeria/${album.folder}/${firstMedia}`;
  
  const albumCard = document.createElement('div');
  albumCard.className = 'album-card';
  
  let thumbnailHTML;
  if (isVideo(firstMedia)) {
      thumbnailHTML = `<div class="album-thumbnail"><video muted loop playsinline autoplay><source src="${thumbnailUrl}" type="video/mp4"></video><div class="video-icon"><i class="fa-solid fa-film"></i></div></div>`;
  } else {
      thumbnailHTML = `<div class="album-thumbnail" style="background-image: url('${thumbnailUrl}')"></div>`;
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