// Homepage: member login bar, "next event" bar, and the community calendar.
import { escapeHtml, formatLongDate, formatTimeRange, loadEvents } from './api.js';
import { logIn, setStatus, startGuest, whileBusy } from './auth.js';
import { initCalendar, initEventDialog, openEventDialog } from './calendar.js';
import { renderRecaps } from './gallery.js';
import { refreshSession } from './site.js';

const monthShort = new Intl.DateTimeFormat(undefined, { month: 'short' });

function initMemberBar() {
  const form = document.querySelector('[data-quick-login]');
  const status = document.querySelector('[data-quick-status]');
  const guestButton = document.querySelector('[data-quick-guest]');
  if (!form) return;

  const signedIn = async (name) => {
    form.reset();
    setStatus(status, '');
    await refreshSession(); // the bar switches to "Welcome back, <name>"
    document.querySelector('.pvo-memberbar__welcome h2')?.setAttribute('tabindex', '-1');
    document.querySelector('.pvo-memberbar__welcome h2')?.focus();
    return name;
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    setStatus(status, '');
    const uid = form.uid.value.trim();
    const button = form.querySelector('[type="submit"]');
    const result = await whileBusy(button, 'Logging in…', () => logIn(uid, form.password.value));
    if (!result.ok) {
      setStatus(status, result.message);
      (uid ? form.password : form.uid).focus();
      return;
    }
    await signedIn(result.name);
  });

  guestButton?.addEventListener('click', async () => {
    setStatus(status, '');
    const result = await whileBusy(guestButton, 'Starting…', startGuest);
    if (!result.ok) {
      setStatus(status, result.message);
      return;
    }
    await signedIn(result.name);
  });
}

function renderNextEvent(slot, events, ok) {
  if (!slot) return;
  if (!ok) {
    slot.innerHTML = '<span class="pvo-next__empty">The calendar could not be loaded right now. Please check back soon.</span>';
    return;
  }
  const now = new Date();
  const next = events.find((event) => (event.end || event.start) >= now);
  if (!next) {
    slot.innerHTML = '<span class="pvo-next__empty">Nothing is scheduled yet. New workdays, fundraisers, and get-togethers are posted here first.</span>';
    return;
  }
  slot.innerHTML = `
    <button class="pvo-next__event" type="button" data-next-id="${next.id}">
      <span class="pvo-next__date" aria-hidden="true">
        <span>${escapeHtml(monthShort.format(next.start))}</span>
        <strong>${next.start.getDate()}</strong>
      </span>
      <span class="pvo-next__text">
        <span class="pvo-next__title">${escapeHtml(next.title)}</span>
        <span class="pvo-next__meta">${escapeHtml(formatLongDate(next.start))} · ${escapeHtml(formatTimeRange(next.start, next.end))}</span>
        ${next.location ? `<span class="pvo-next__meta">${escapeHtml(next.location)}</span>` : ''}
      </span>
    </button>`;
  slot.querySelector('[data-next-id]').addEventListener('click', () => {
    const dialog = document.querySelector('[data-event-dialog]');
    if (dialog) openEventDialog(dialog, next);
  });
}

async function init() {
  initMemberBar();
  initEventDialog();
  const calendar = document.querySelector('[data-pvo-calendar]');
  const { ok, events } = await loadEvents();
  renderNextEvent(document.querySelector('[data-next-event]'), events, ok);
  const recaps = document.querySelector('[data-home-recaps]');
  if (recaps && ok && renderRecaps(recaps.querySelector('[data-recaps]'), events, { limit: 4 }) > 0) {
    recaps.hidden = false;
  }
  if (calendar) {
    initCalendar(calendar, events);
    if (!ok) {
      const status = calendar.querySelector('[data-agenda-status]');
      status.hidden = false;
      status.textContent = 'The calendar is temporarily unavailable. Please try again later.';
    }
  }
}

init();
