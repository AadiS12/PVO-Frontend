// Event recaps: photos and videos from past events (the events API, newest first).
// Used by the /gallery/ page and the "From recent events" section on the homepage.
import { escapeHtml, formatLongDate, loadEvents, mediaInfo } from './api.js';
import { initEventDialog, openEventDialog } from './calendar.js';

/** Past events that have a picture or video, newest first. */
export function recapEvents(events, now = new Date()) {
  return events
    .filter((event) => (event.end || event.start) < now && mediaInfo(event.image_url))
    .sort((a, b) => b.start - a.start);
}

function recapHtml(event) {
  const media = mediaInfo(event.image_url);
  const isVideo = media.type !== 'image';
  const picture = media.thumb
    ? `<img class="pvo-recap__img" src="${escapeHtml(media.thumb)}" alt="" loading="lazy">`
    : '<span class="pvo-recap__placeholder" aria-hidden="true"></span>';
  return `
    <li>
      <button class="pvo-recap" type="button" data-recap-id="${event.id}">
        <span class="pvo-recap__media">
          ${picture}
          ${isVideo ? '<span class="pvo-recap__badge">Video</span>' : ''}
        </span>
        <span class="pvo-recap__title">${escapeHtml(event.title)}</span>
        <span class="pvo-recap__date">${escapeHtml(formatLongDate(event.start))}</span>
      </button>
    </li>`;
}

/** Fill a list with recap tiles. Returns how many were shown. */
export function renderRecaps(list, events, { limit = Infinity } = {}) {
  const recaps = recapEvents(events).slice(0, limit);
  list.innerHTML = recaps.map(recapHtml).join('');
  const dialog = document.querySelector('[data-event-dialog]');
  list.onclick = (clickEvent) => {
    const tile = clickEvent.target.closest('[data-recap-id]');
    const match = tile && recaps.find((item) => String(item.id) === tile.dataset.recapId);
    if (match && dialog) openEventDialog(dialog, match);
  };
  return recaps.length;
}

async function initGalleryPage() {
  const list = document.querySelector('.pvo-recaps--page[data-recaps]');
  if (!list) return;
  initEventDialog();
  const status = document.querySelector('[data-recaps-status]');
  const { ok, events } = await loadEvents();
  if (!ok) {
    status.textContent = 'Photos and videos could not be loaded right now. Please try again later.';
    return;
  }
  const shown = renderRecaps(list, events);
  status.textContent = shown
    ? `${shown} event${shown === 1 ? '' : 's'} with photos or video.`
    : 'No photos or videos yet. Pictures and clips from past events will appear here.';
}

initGalleryPage();
