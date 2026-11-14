// Month calendar + agenda used on the homepage.
import {
  dayKey, escapeHtml, formatLongDate, formatShortDate, formatTimeRange, mediaHtml, mediaInfo, sameDay,
} from './api.js';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthTitle = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' });
const monthShort = new Intl.DateTimeFormat(undefined, { month: 'short' });

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Every calendar day an event touches (multi-day events appear on each day). */
function eventDays(event) {
  const days = [];
  const last = startOfDay(event.end && event.end > event.start ? event.end : event.start);
  for (let day = startOfDay(event.start); day <= last && days.length < 62; day.setDate(day.getDate() + 1)) {
    days.push(dayKey(day));
  }
  return days;
}

export function eventCardHtml(event, { compact = false } = {}) {
  const media = mediaInfo(event.image_url);
  const thumb = media?.thumb;
  return `
    <button class="pvo-event${compact ? ' pvo-event--compact' : ''}" type="button" data-event-id="${event.id}">
      <span class="pvo-event__date" aria-hidden="true">
        <span class="pvo-event__month">${escapeHtml(monthShort.format(event.start))}</span>
        <span class="pvo-event__day">${event.start.getDate()}</span>
      </span>
      <span class="pvo-event__body">
        <span class="pvo-event__title">${escapeHtml(event.title)}</span>
        <span class="pvo-event__meta">${escapeHtml(formatShortDate(event.start))} · ${escapeHtml(formatTimeRange(event.start, event.end))}</span>
        ${event.location ? `<span class="pvo-event__meta">${escapeHtml(event.location)}</span>` : ''}
      </span>
      ${thumb && !compact ? `<img class="pvo-event__thumb" src="${escapeHtml(thumb)}" alt="" loading="lazy">` : ''}
    </button>`;
}

export function openEventDialog(dialog, event) {
  dialog.querySelector('[data-dialog-body]').innerHTML = `
    ${mediaHtml(mediaInfo(event.image_url), event.title)}
    <div class="pvo-dialog__text">
      <span class="pvo-dialog__when">${escapeHtml(formatLongDate(event.start))}<br>${escapeHtml(formatTimeRange(event.start, event.end))}</span>
      <h2 class="pvo-dialog__title" id="pvo-event-dialog-title">${escapeHtml(event.title)}</h2>
      ${event.location ? `<span class="pvo-dialog__where">${escapeHtml(event.location)}</span>` : ''}
      <p class="pvo-dialog__desc">${escapeHtml(event.description)}</p>
    </div>`;
  if (typeof dialog.showModal === 'function') dialog.showModal();
  else dialog.setAttribute('open', '');
}

export function initCalendar(root, events, { today = new Date() } = {}) {
  const title = root.querySelector('[data-cal-title]');
  const body = root.querySelector('[data-cal-body]');
  const agendaTitle = root.querySelector('[data-agenda-title]');
  const agendaList = root.querySelector('[data-agenda-list]');
  const agendaStatus = root.querySelector('[data-agenda-status]');
  const showAll = root.querySelector('[data-agenda-all]');
  const dialog = document.querySelector('[data-event-dialog]');

  const byDay = new Map();
  events.forEach((event) => {
    eventDays(event).forEach((key) => {
      if (!byDay.has(key)) byDay.set(key, []);
      byDay.get(key).push(event);
    });
  });

  let view = new Date(today.getFullYear(), today.getMonth(), 1);
  let selected = null;

  function renderAgenda() {
    let list;
    if (selected) {
      list = byDay.get(dayKey(selected)) || [];
      agendaTitle.textContent = formatLongDate(selected);
      showAll.hidden = false;
    } else {
      const now = startOfDay(today);
      list = events.filter((event) => (event.end || event.start) >= now).slice(0, 6);
      agendaTitle.textContent = 'Coming up';
      showAll.hidden = true;
    }
    agendaList.innerHTML = list.map((event) => `<li>${eventCardHtml(event)}</li>`).join('');
    if (list.length) {
      agendaStatus.hidden = true;
    } else {
      agendaStatus.hidden = false;
      agendaStatus.textContent = selected
        ? 'Nothing is scheduled on this day.'
        : 'No upcoming events are posted yet. New workdays and gatherings appear here as soon as they are scheduled.';
    }
  }

  function renderMonth() {
    title.textContent = monthTitle.format(view);
    const first = new Date(view.getFullYear(), view.getMonth(), 1);
    const cursor = new Date(first);
    cursor.setDate(1 - first.getDay());
    const rows = [];
    for (let week = 0; week < 6; week += 1) {
      const cells = [];
      for (let weekday = 0; weekday < 7; weekday += 1) {
        const date = new Date(cursor);
        const key = dayKey(date);
        const dayEvents = byDay.get(key) || [];
        const classes = ['pvo-cal__day'];
        if (date.getMonth() !== view.getMonth()) classes.push('is-outside');
        if (sameDay(date, today)) classes.push('is-today');
        if (selected && sameDay(date, selected)) classes.push('is-selected');
        if (dayEvents.length) classes.push('has-events');
        const label = `${formatLongDate(date)}${dayEvents.length ? `, ${dayEvents.length} event${dayEvents.length > 1 ? 's' : ''}` : ''}`;
        const names = dayEvents.slice(0, 2)
          .map((event) => `<span class="pvo-cal__chip">${escapeHtml(event.title)}</span>`).join('');
        const more = dayEvents.length > 2 ? `<span class="pvo-cal__more">+${dayEvents.length - 2} more</span>` : '';
        cells.push(`
          <td>
            <button type="button" class="${classes.join(' ')}" data-day="${key}" aria-label="${escapeHtml(label)}"${selected && sameDay(date, selected) ? ' aria-pressed="true"' : ''}>
              <span class="pvo-cal__num">${date.getDate()}</span>
              ${dayEvents.length ? `<span class="pvo-cal__dots" aria-hidden="true">${'<i></i>'.repeat(Math.min(dayEvents.length, 3))}</span>` : ''}
              <span class="pvo-cal__chips" aria-hidden="true">${names}${more}</span>
            </button>
          </td>`);
        cursor.setDate(cursor.getDate() + 1);
      }
      rows.push(`<tr>${cells.join('')}</tr>`);
      if (cursor.getMonth() !== view.getMonth() && week >= 4) break;
    }
    body.innerHTML = rows.join('');
  }

  function render() {
    renderMonth();
    renderAgenda();
  }

  root.querySelector('[data-cal-head]').innerHTML = WEEKDAYS.map((day) => `<th scope="col"><abbr title="${day}">${day}</abbr></th>`).join('');
  root.querySelector('[data-cal-prev]').addEventListener('click', () => {
    view = new Date(view.getFullYear(), view.getMonth() - 1, 1);
    renderMonth();
  });
  root.querySelector('[data-cal-next]').addEventListener('click', () => {
    view = new Date(view.getFullYear(), view.getMonth() + 1, 1);
    renderMonth();
  });
  root.querySelector('[data-cal-today]').addEventListener('click', () => {
    view = new Date(today.getFullYear(), today.getMonth(), 1);
    selected = null;
    render();
  });
  showAll.addEventListener('click', () => {
    selected = null;
    render();
  });
  body.addEventListener('click', (event) => {
    const button = event.target.closest('[data-day]');
    if (!button) return;
    const [year, month, day] = button.dataset.day.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    selected = selected && sameDay(selected, date) ? null : date;
    if (date.getMonth() !== view.getMonth()) view = new Date(year, month - 1, 1);
    render();
    root.querySelector(`[data-day="${button.dataset.day}"]`)?.focus();
  });
  agendaList.addEventListener('click', (event) => {
    const card = event.target.closest('[data-event-id]');
    const match = card && events.find((item) => String(item.id) === card.dataset.eventId);
    if (match && dialog) openEventDialog(dialog, match);
  });

  render();
}

export function initEventDialog() {
  const dialog = document.querySelector('[data-event-dialog]');
  if (!dialog) return;
  dialog.querySelector('[data-dialog-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  // stop any video that was playing
  dialog.addEventListener('close', () => {
    dialog.querySelector('[data-dialog-body]').innerHTML = '';
  });
}
