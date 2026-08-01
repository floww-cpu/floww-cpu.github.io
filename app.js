const files = [...document.querySelectorAll('.file')]
const pages = [...document.querySelectorAll('.page')]
const tabName = document.querySelector('#tab-name')
const statusLeft = document.querySelector('#status-left')
const projectList = document.querySelector('#project-list')
const galleryGrid = document.querySelector('#gallery-grid')
const albumGrid = document.querySelector('#album-grid')
const albumDetail = document.querySelector('#album-detail')
const albumTitle = document.querySelector('#album-title')
const albumDescription = document.querySelector('#album-description')
const gameCarousel = document.querySelector('#game-carousel')
const favoriteGameCount = document.querySelector('#favorite-game-count')
let albums = []
let favoriteGames = []
let favoriteGameIndex = 0
let favoriteGamesTimer = null
const names = {
  home: 'index.html',
  projects: 'projects.json',
  gallery: 'gallery.json'
}

function openPage(name) {
  files.forEach(file => file.setAttribute('aria-selected', String(file.dataset.page === name)))
  pages.forEach(page => page.classList.toggle('is-active', page.dataset.content === name))
  tabName.textContent = names[name]
  statusLeft.textContent = name === 'home' ? 'index.html · about + profile.py' : names[name]
}

files.forEach(file => file.addEventListener('click', () => openPage(file.dataset.page)))

function updateTime() {
  const now = new Date()
  const time = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Brussels',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(now)
  const date = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Brussels',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(now)
  document.querySelectorAll('.belgium-time').forEach(element => {
    element.textContent = time
  })
  document.querySelectorAll('.belgium-date').forEach(element => {
    element.textContent = date
  })
}

function normalizeMediaSource(src) {
  return String(src).replaceAll('\\', '/')
}

function createImage(src, alt) {
  if (!src) {
    return null
  }
  const image = document.createElement('img')
  image.src = normalizeMediaSource(src)
  image.alt = alt
  image.loading = 'lazy'
  image.addEventListener('error', () => {
    image.remove()
  })
  return image
}

function isVideo(item) {
  if (item.type === 'video' || item.video) {
    return true
  }
  return /\.(mp4|webm|ogv|mov)(?:[?#]|$)/i.test(item.image || '')
}

function createGalleryMedia(item) {
  const source = item.video || item.image
  if (!source) {
    return null
  }
  if (!isVideo(item)) {
    return createImage(source, item.title || 'Gallery image')
  }
  const video = document.createElement('video')
  video.src = normalizeMediaSource(source)
  video.controls = true
  video.preload = 'metadata'
  video.playsInline = true
  video.addEventListener('error', () => video.remove())
  return video
}

function createProject(project) {
  const hasLink = typeof project.link === 'string' && project.link.trim() !== ''
  const element = document.createElement(hasLink ? 'a' : 'div')
  element.className = hasLink ? 'project is-link' : 'project'
  if (hasLink) {
    element.href = project.link
    element.target = '_blank'
    element.rel = 'noreferrer'
  }

  const thumbnail = document.createElement('div')
  thumbnail.className = 'project-thumbnail'
  const image = createImage(project.thumbnail, `${project.title || 'Project'} thumbnail`)
  if (image) {
    thumbnail.append(image)
  } else {
    thumbnail.textContent = (project.title || '?').slice(0, 2).toUpperCase()
  }

  const copy = document.createElement('div')
  copy.className = 'project-copy'

  const titleRow = document.createElement('div')
  titleRow.className = 'project-title-row'

  const title = document.createElement('strong')
  title.textContent = project.title || 'Untitled project'
  titleRow.append(title)

  if (hasLink) {
    const mark = document.createElement('span')
    mark.className = 'project-link-mark'
    mark.textContent = '↗'
    titleRow.append(mark)
  }

  const description = document.createElement('p')
  description.textContent = project.description || ''
  copy.append(titleRow, description)

  const meta = document.createElement('div')
  meta.className = 'project-meta'

  const period = document.createElement('span')
  period.className = 'project-period'
  period.textContent = project.period || ''

  const technology = document.createElement('span')
  technology.className = 'project-tech'
  technology.textContent = project.technology || ''

  meta.append(period, technology)
  element.append(thumbnail, copy, meta)
  return element
}

function createGalleryItem(item) {
  const element = document.createElement('article')
  element.className = 'gallery-item'

  const media = document.createElement('div')
  media.className = 'gallery-media'
  const galleryMedia = createGalleryMedia(item)
  if (galleryMedia) {
    media.append(galleryMedia)
  } else {
    media.textContent = 'add image'
  }

  const info = document.createElement('div')
  info.className = 'gallery-info'

  const title = document.createElement('strong')
  title.textContent = item.title || 'Untitled image'

  const description = document.createElement('p')
  description.textContent = item.description || ''

  if (false) {
    const remove = document.createElement('button')
    remove.className = 'photo-remove'
    remove.type = 'button'
    remove.setAttribute('aria-label', `Remove ${item.title || 'photo'}`)
    remove.title = 'Remove photo'
    remove.textContent = '×'
    remove.addEventListener('click', () => {
      album.photos = album.photos.filter(photo => photo.id !== item.id)
      saveLocalAlbums()
      renderAlbum(album.id)
    })
    info.append(remove)
  }

  info.append(title, description)
  element.append(media, info)
  return element
}

function createAlbumCard(album) {
  const element = document.createElement('button')
  element.className = 'album-card'
  element.type = 'button'

  const cover = document.createElement('div')
  cover.className = 'album-cover'
  const firstPhoto = album.photos[0]
  const coverSource = firstPhoto && (firstPhoto.poster || (!isVideo(firstPhoto) && firstPhoto.image))
  const image = createImage(coverSource, album.title || 'Album cover')
  if (image) cover.append(image)
  else cover.textContent = firstPhoto && isVideo(firstPhoto) ? 'video album' : 'empty album'

  const copy = document.createElement('div')
  copy.className = 'album-copy'
  const title = document.createElement('strong')
  title.textContent = album.title || 'Untitled album'
  const meta = document.createElement('span')
  meta.textContent = `${album.photos.length} ${album.photos.length === 1 ? 'photo' : 'photos'}`
  const description = document.createElement('p')
  description.textContent = album.description || 'No description.'
  copy.append(title, meta, description)
  element.append(cover, copy)
  element.addEventListener('click', () => renderAlbum(album.id))
  return element
}

async function loadJson(path) {
  const response = await fetch(path, { cache: 'no-store' })
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`)
  }
  return response.json()
}

async function loadProjects() {
  try {
    const projects = await loadJson('data/projects.json')
    projectList.replaceChildren()
    if (!Array.isArray(projects) || projects.length === 0) {
      projectList.innerHTML = '<p class="empty-text">No projects added yet.</p>'
      return
    }
    projects.forEach(project => projectList.append(createProject(project)))
  } catch {
    projectList.innerHTML = '<p class="error-text">Could not load data/projects.json. Run the site through a local web server.</p>'
  }
}

function renderFavoriteGame() {
  const game = favoriteGames[favoriteGameIndex]
  gameCarousel.replaceChildren()
  if (!game) {
    gameCarousel.innerHTML = '<p class="empty-text">No favorite games added yet.</p>'
    favoriteGameCount.textContent = ''
    return
  }

  const card = document.createElement('article')
  card.className = 'game-card'
  const image = createImage(game.image, `${game.title || 'Game'} artwork`)
  if (image) {
    image.className = 'game-artwork'
    card.append(image)
  }

  const copy = document.createElement('div')
  copy.className = 'game-copy'
  const title = document.createElement('strong')
  title.textContent = game.title || 'Untitled game'
  const platform = document.createElement('span')
  platform.textContent = game.platform || ''
  const description = document.createElement('p')
  description.textContent = game.description || ''
  copy.append(title, platform, description)
  card.append(copy)
  gameCarousel.append(card)
  favoriteGameCount.textContent = `${favoriteGameIndex + 1} of ${favoriteGames.length}`
  gameCarousel.classList.remove('is-changing')
  requestAnimationFrame(() => gameCarousel.classList.add('is-changing'))
}

function changeFavoriteGame(step) {
  if (favoriteGames.length < 2) return
  favoriteGameIndex = (favoriteGameIndex + step + favoriteGames.length) % favoriteGames.length
  renderFavoriteGame()
}

async function loadFavoriteGames() {
  try {
    const data = await loadJson('data/games.json')
    favoriteGames = Array.isArray(data) ? data : []
    renderFavoriteGame()
    if (favoriteGames.length > 1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      favoriteGamesTimer = window.setInterval(() => changeFavoriteGame(1), 4500)
    }
  } catch {
    gameCarousel.innerHTML = '<p class="error-text">Could not load data/games.json.</p>'
  }
}

function normalizeAlbums(data) {
  if (Array.isArray(data)) {
    return [{ id: 'gallery', title: 'Gallery', description: '', photos: data }]
  }
  return Array.isArray(data && data.albums) ? data.albums : []
}

function renderAlbums() {
  albumDetail.hidden = true
  albumGrid.hidden = false
  document.querySelector('[data-content="gallery"] .section-title').textContent = 'Photo albums'
  albumGrid.replaceChildren()
  if (albums.length === 0) {
    albumGrid.innerHTML = '<p class="empty-text">No albums added yet.</p>'
    return
  }
  albums.forEach(album => albumGrid.append(createAlbumCard(album)))
}

function renderAlbum(id) {
  const album = albums.find(item => item.id === id)
  if (!album) return renderAlbums()
  albumGrid.hidden = true
  albumDetail.hidden = false
  document.querySelector('[data-content="gallery"] .section-title').textContent = album.title || 'Album'
  albumTitle.textContent = album.title || 'Untitled album'
  albumDescription.textContent = album.description || ''
  galleryGrid.replaceChildren()
  if (album.photos.length === 0) {
    galleryGrid.innerHTML = '<p class="empty-text">No photos in this album yet.</p>'
    return
  }
  album.photos.forEach(photo => galleryGrid.append(createGalleryItem(photo)))
}

async function loadGallery() {
  try {
    albums = normalizeAlbums(await loadJson('data/gallery.json'))
    renderAlbums()
  } catch {
    albumGrid.innerHTML = '<p class="error-text">Could not load data/gallery.json. Run the site through a local web server.</p>'
  }
}

document.querySelector('#back-to-albums').addEventListener('click', renderAlbums)
document.querySelector('#previous-game').addEventListener('click', () => changeFavoriteGame(-1))
document.querySelector('#next-game').addEventListener('click', () => changeFavoriteGame(1))
gameCarousel.addEventListener('mouseenter', () => {
  window.clearInterval(favoriteGamesTimer)
  favoriteGamesTimer = null
})
gameCarousel.addEventListener('mouseleave', () => {
  if (favoriteGames.length > 1 && !favoriteGamesTimer && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    favoriteGamesTimer = window.setInterval(() => changeFavoriteGame(1), 4500)
  }
})

updateTime()
setInterval(updateTime, 1000)
loadProjects()
loadGallery()
loadFavoriteGames()
