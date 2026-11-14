// Shared helpers for PVO pages: backend requests, the signed-in session, and formatting.
import { baseurl, pythonURI, fetchOptions } from '../api/config.js';

export { baseurl, pythonURI };

/**
 * Call the Flask backend. Resolves to { ok, status, data } and never throws for
 * HTTP errors. Network failures resolve with status 0 so callers can show an
 * "unavailable" message instead of crashing.
 */
export async function apiFetch(path, { method = 'GET', body } = {}) {
  const options = {
    ...fetchOptions,
    method,
    cache: 'no-store',
    headers: { ...fetchOptions.headers, Accept: 'application/json' },
  };
  if (body !== undefined) options.body = JSON.stringify(body);

  let response;
  try {
    response = await fetch(`${pythonURI}${path}`, options);
  } catch (error) {
    return { ok: false, status: 0, data: null, error };
  }
  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      // Not JSON (e.g. the backend's HTML 404 page when an endpoint is not deployed yet).
      // Leave data empty so callers show their own friendly message.
      data = null;
    }
  }
  return { ok: response.ok, status: response.status, data };
}

export function messageFrom(result, fallback) {
  if (result.status === 0) return 'We could not reach the PVO server. Please try again in a moment.';
  return result.data?.message || fallback;
}

let sessionPromise = null;

/**
 * The current visitor: { state: 'signed-in' | 'signed-out' | 'offline', user }
 * user = { uid, name, role, email }
 */
export function getSession({ refresh = false } = {}) {
  if (!sessionPromise || refresh) {
    sessionPromise = apiFetch('/api/id').then((result) => {
      if (result.ok && result.data) {
        const user = result.data;
        return {
          state: 'signed-in',
          user: {
            uid: user.uid,
            name: user.name || user.uid,
            role: user.role || 'User',
            email: user.email && user.email !== '?' ? user.email : '',
          },
        };
      }
      return { state: result.status === 0 ? 'offline' : 'signed-out', user: null };
    });
  }
  return sessionPromise;
}

// ---- roles -------------------------------------------------------------------
// Stored role name (users._role on the backend) -> what people see.
// "User" is the backend's default role, shown as "Member".
const ROLE_LABELS = {
  Admin: 'Administrator',
  Organizer: 'Event organizer',
  Veteran: 'Veteran',
  Family: 'Family member',
  Volunteer: 'Volunteer',
  User: 'Member',
  Guest: 'Guest',
  Teacher: 'Teacher',
};

/** Member types people choose for themselves (at sign-up, or through the profile survey). */
export const MEMBER_TYPES = ['Veteran', 'Family', 'Volunteer', 'User'];

/** Every role an administrator can give someone on the People & Roles tab. */
export const ASSIGNABLE_ROLES = ['User', 'Veteran', 'Family', 'Volunteer', 'Organizer', 'Admin'];

/** Roles that can post, edit, and delete calendar events. */
const EVENT_ROLES = ['Admin', 'Organizer'];

export function roleLabel(role) {
  return ROLE_LABELS[role] || 'Member';
}

export function isAdmin(session) {
  return session.state === 'signed-in' && session.user.role === 'Admin';
}

export function canManageEvents(session) {
  return session.state === 'signed-in' && EVENT_ROLES.includes(session.user.role);
}

export function isGuest(session) {
  return session.state === 'signed-in' && session.user.role === 'Guest';
}

export async function signOut() {
  await apiFetch('/api/authenticate', { method: 'DELETE' });
  sessionPromise = null;
}

/** Only allow redirects back into this site. */
export function safeNextUrl(fallback = `${baseurl}/`) {
  const next = new URLSearchParams(window.location.search).get('next');
  if (next && next.startsWith(`${baseurl}/`) && !next.startsWith('//')) return next;
  return fallback;
}

export function loginUrl(nextPath = window.location.pathname) {
  return `${baseurl}/member-login/?next=${encodeURIComponent(nextPath)}`;
}

/** Uploaded event pictures are stored as /uploads/... on the backend. */
export function imageUrl(url) {
  if (!url) return '';
  if (url.startsWith('/uploads/')) return `${pythonURI}${url}`;
  return /^https?:\/\//i.test(url) ? url : '';
}

const YOUTUBE = /^https?:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/i;
const VIDEO_FILE = /^https?:\/\/[^?#]+\.(mp4|webm|ogg)(?:[?#].*)?$/i;

/**
 * What an event's media link is. Events store one link: an uploaded picture, an image
 * link, a YouTube link, or a direct .mp4/.webm/.ogg video link.
 * Returns null, or { type: 'image' | 'youtube' | 'video', src, thumb, embed }.
 */
export function mediaInfo(url) {
  if (!url) return null;
  const youtube = url.match(YOUTUBE);
  if (youtube) {
    const id = youtube[1];
    return {
      type: 'youtube',
      src: url,
      thumb: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      embed: `https://www.youtube-nocookie.com/embed/${id}`,
    };
  }
  if (VIDEO_FILE.test(url)) return { type: 'video', src: url, thumb: '' };
  const src = imageUrl(url);
  return src ? { type: 'image', src, thumb: src } : null;
}

/** Player/picture markup for the event dialog. */
export function mediaHtml(media, title = '') {
  if (!media) return '';
  if (media.type === 'youtube') {
    return `<div class="pvo-media pvo-media--video"><iframe src="${escapeHtml(media.embed)}" title="${escapeHtml(`Video: ${title}`)}" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`;
  }
  if (media.type === 'video') {
    return `<div class="pvo-media pvo-media--video"><video src="${escapeHtml(media.src)}" controls preload="metadata" aria-label="${escapeHtml(`Video: ${title}`)}"></video></div>`;
  }
  return `<img class="pvo-dialog__image" src="${escapeHtml(media.src)}" alt="">`;
}

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ---- dates -----------------------------------------------------------------
// The backend stores event times in UTC and returns them with a trailing "Z".

export function parseEventDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function dayKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

const timeFormat = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });
const longDate = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
const shortDate = new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

export function formatTime(date) {
  return timeFormat.format(date);
}

export function formatLongDate(date) {
  return longDate.format(date);
}

export function formatShortDate(date) {
  return shortDate.format(date);
}

export function formatTimeRange(start, end) {
  if (!end) return formatTime(start);
  if (sameDay(start, end)) return `${formatTime(start)} – ${formatTime(end)}`;
  return `${formatTime(start)} – ${formatShortDate(end)}, ${formatTime(end)}`;
}

/** Normalise an event from the API into Date objects, dropping malformed rows. */
export function normaliseEvents(rows) {
  if (!Array.isArray(rows)) return [];
  return rows
    .map((row) => ({ ...row, start: parseEventDate(row.starts_at), end: row.ends_at ? parseEventDate(row.ends_at) : null }))
    .filter((event) => event.start)
    .sort((a, b) => a.start - b.start);
}

export async function loadEvents() {
  const result = await apiFetch('/api/events');
  if (!result.ok) return { ok: false, events: [], result };
  return { ok: true, events: normaliseEvents(result.data) };
}
