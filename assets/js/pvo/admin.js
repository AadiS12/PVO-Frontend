// Admin tools: post, edit, and delete calendar events (picture, text, time) and manage roles.
// Administrators get both tabs. Event organizers get the Events tab only.
import {
  ASSIGNABLE_ROLES, apiFetch, canManageEvents, escapeHtml, formatShortDate, formatTimeRange,
  getSession, isAdmin, mediaInfo, loadEvents, loginUrl, messageFrom, roleLabel,
} from './api.js';

const MAX_SIDE = 1600;
const MAX_UPLOAD_BYTES = 3_400_000;
const ASSIGNABLE = ASSIGNABLE_ROLES;

const els = {
  loading: document.querySelector('[data-admin-loading]'),
  gate: document.querySelector('[data-admin-gate]'),
  admin: document.querySelector('[data-admin]'),
  form: document.getElementById('event-form'),
  formTitle: document.querySelector('[data-event-form-title]'),
  submit: document.querySelector('[data-event-submit]'),
  cancel: document.querySelector('[data-cancel-edit]'),
  status: document.getElementById('event-status'),
  preview: document.querySelector('[data-picture-preview]'),
  fileInput: document.getElementById('event-picture'),
  removePicture: document.querySelector('[data-remove-picture]'),
  list: document.querySelector('[data-event-list]'),
  empty: document.querySelector('[data-event-empty]'),
  count: document.querySelector('[data-event-count]'),
  people: document.querySelector('[data-people]'),
  peopleStatus: document.getElementById('people-status'),
  showGuests: document.querySelector('[data-show-guests]'),
};

const state = {
  me: null,
  events: [],
  editing: null, // event being edited
  pendingImage: null, // data URL of a newly chosen photo
  keepImage: '', // image_url already stored on the event being edited
};

function setStatus(element, text, kind = 'error') {
  element.textContent = text;
  element.classList.toggle('is-error', kind === 'error');
  element.classList.toggle('is-success', kind === 'success');
}

function showGate(title, text, { signIn = true } = {}) {
  els.gate.querySelector('[data-gate-title]').textContent = title;
  els.gate.querySelector('[data-gate-text]').textContent = text;
  els.gate.querySelector('[data-gate-actions] a').hidden = !signIn;
  els.gate.hidden = false;
}

// ---- tabs -------------------------------------------------------------------

function initTabs() {
  const tabs = [...document.querySelectorAll('[data-admin-tab]')];
  const select = (tab, focus = false) => {
    tabs.forEach((other) => {
      const active = other === tab;
      other.setAttribute('aria-selected', String(active));
      other.tabIndex = active ? 0 : -1;
      document.getElementById(other.getAttribute('aria-controls')).hidden = !active;
    });
    if (focus) tab.focus();
    if (tab.id === 'tab-people') loadPeople();
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      const step = event.key === 'ArrowRight' ? 1 : -1;
      select(tabs[(index + step + tabs.length) % tabs.length], true);
    });
  });
}

// ---- dates ------------------------------------------------------------------

const pad = (number) => String(number).padStart(2, '0');

function localParts(date) {
  return {
    date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  };
}

function toUtcIso(date, time) {
  const local = new Date(`${date}T${time}`);
  return Number.isNaN(local.getTime()) ? null : local.toISOString();
}

// ---- pictures -----------------------------------------------------------------

function readAsDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('That file could not be read.'));
    reader.readAsDataURL(blob);
  });
}

function dataUrlBytes(dataUrl) {
  return Math.floor((dataUrl.length - dataUrl.indexOf(',') - 1) * 0.75);
}

async function prepareImage(file) {
  if (!/^image\/(jpeg|png|gif|webp)$/.test(file.type)) {
    throw new Error('Please choose a JPEG, PNG, GIF, or WebP image.');
  }
  if (file.type === 'image/gif') {
    if (file.size > MAX_UPLOAD_BYTES) throw new Error('That GIF is too large. Please use one under 3 MB.');
    return readAsDataUrl(file);
  }
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext('2d');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  for (const quality of [0.86, 0.75, 0.6]) {
    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    if (dataUrlBytes(dataUrl) <= MAX_UPLOAD_BYTES) return dataUrl;
  }
  throw new Error('That photo is too large to upload. Please choose a smaller one.');
}

function renderPreview() {
  const linked = els.form.image_url.value.trim();
  const media = state.pendingImage
    ? { type: 'image', src: state.pendingImage, thumb: state.pendingImage }
    : mediaInfo(linked) || mediaInfo(state.keepImage);
  if (!media) {
    els.preview.innerHTML = '<span class="pvo-picture__empty">No picture yet</span>';
  } else if (media.type === 'video') {
    els.preview.innerHTML = `<video src="${escapeHtml(media.src)}" controls preload="metadata" aria-label="Preview of the event video"></video>`;
  } else {
    const label = media.type === 'youtube' ? 'Preview of the YouTube video' : 'Preview of the event picture';
    els.preview.innerHTML = `<img src="${escapeHtml(media.thumb)}" alt="${label}">${media.type === 'youtube' ? '<span class="pvo-recap__badge">Video</span>' : ''}`;
  }
  els.removePicture.hidden = !media;
}

function clearPicture() {
  state.pendingImage = null;
  state.keepImage = '';
  els.fileInput.value = '';
  els.form.image_url.value = '';
  renderPreview();
}

function initPicture() {
  els.fileInput.addEventListener('change', async () => {
    const [file] = els.fileInput.files;
    if (!file) return;
    setStatus(els.status, 'Preparing photo…', 'info');
    try {
      state.pendingImage = await prepareImage(file);
      els.form.image_url.value = '';
      setStatus(els.status, '');
    } catch (error) {
      state.pendingImage = null;
      els.fileInput.value = '';
      setStatus(els.status, error.message);
    }
    renderPreview();
  });
  els.form.image_url.addEventListener('input', () => {
    if (els.form.image_url.value.trim()) {
      state.pendingImage = null;
      els.fileInput.value = '';
    }
    renderPreview();
  });
  els.removePicture.addEventListener('click', clearPicture);
}

// ---- event form ------------------------------------------------------------------

function resetForm() {
  state.editing = null;
  els.form.reset();
  clearPicture();
  els.formTitle.textContent = 'Post an event';
  els.submit.textContent = 'Publish event';
  els.cancel.hidden = true;
}

function startEditing(event) {
  state.editing = event;
  const start = localParts(event.start);
  els.form.title.value = event.title;
  els.form.date.value = start.date;
  els.form.start.value = start.time;
  els.form.end.value = event.end ? localParts(event.end).time : '';
  els.form.location.value = event.location || '';
  els.form.description.value = event.description || '';
  state.pendingImage = null;
  els.fileInput.value = '';
  state.keepImage = event.image_url || '';
  els.form.image_url.value = /^https?:\/\//i.test(state.keepImage) ? state.keepImage : '';
  renderPreview();
  els.formTitle.textContent = `Editing “${event.title}”`;
  els.submit.textContent = 'Save changes';
  els.cancel.hidden = false;
  setStatus(els.status, '');
  els.form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  els.form.title.focus({ preventScroll: true });
}

function validate() {
  const { form } = els;
  const values = {
    title: form.title.value.trim(),
    date: form.date.value,
    start: form.start.value,
    end: form.end.value,
    location: form.location.value.trim(),
    description: form.description.value.trim(),
    link: form.image_url.value.trim(),
  };
  const checks = [
    [!values.title, form.title, 'Give the event a title.'],
    [!values.date, form.date, 'Choose the date of the event.'],
    [!values.start, form.start, 'Choose a start time.'],
    [values.end && values.end <= values.start, form.end, 'The end time needs to be after the start time.'],
    [!values.description, form.description, 'Add a short description so people know what to expect.'],
    [values.link && !/^https?:\/\/\S+$/i.test(values.link), form.image_url, 'The picture link should start with http:// or https://.'],
  ];
  const problem = checks.find(([failed]) => failed);
  if (problem) {
    setStatus(els.status, problem[2]);
    problem[1].focus();
    return null;
  }
  return values;
}

function initEventForm() {
  els.cancel.addEventListener('click', () => {
    resetForm();
    setStatus(els.status, '');
  });

  els.form.addEventListener('submit', async (submitEvent) => {
    submitEvent.preventDefault();
    const values = validate();
    if (!values) return;
    els.submit.disabled = true;
    setStatus(els.status, state.pendingImage ? 'Uploading picture…' : 'Saving…', 'info');

    try {
      let picture = values.link || state.keepImage || '';
      if (state.pendingImage) {
        const upload = await apiFetch('/api/events/image', { method: 'POST', body: { image: state.pendingImage }, timeout: 90000 });
        if (!upload.ok) throw new Error(messageFrom(upload, 'The picture could not be uploaded.'));
        picture = upload.data.image_url;
      }
      const payload = {
        title: values.title,
        description: values.description,
        location: values.location,
        starts_at: toUtcIso(values.date, values.start),
        ends_at: values.end ? toUtcIso(values.date, values.end) : null,
        image_url: picture,
      };
      const editing = state.editing;
      const result = editing
        ? await apiFetch(`/api/events/${editing.id}`, { method: 'PUT', body: payload })
        : await apiFetch('/api/events', { method: 'POST', body: payload });
      if (!result.ok) throw new Error(messageFrom(result, 'The event could not be saved.'));

      resetForm();
      await refreshEvents();
      setStatus(els.status, editing ? 'Changes saved. The calendar is up to date.' : 'Event published. It is now on the homepage calendar.', 'success');
    } catch (error) {
      setStatus(els.status, error.message);
    } finally {
      els.submit.disabled = false;
    }
  });
}

// ---- event list --------------------------------------------------------------------

function renderEvents() {
  const now = new Date();
  const upcoming = state.events.filter((event) => (event.end || event.start) >= now);
  const past = state.events.filter((event) => (event.end || event.start) < now).reverse();
  els.count.textContent = `${upcoming.length} upcoming · ${past.length} past`;
  els.empty.hidden = state.events.length > 0;

  els.list.innerHTML = [...upcoming, ...past].map((event) => {
    const picture = mediaInfo(event.image_url)?.thumb;
    const isPast = (event.end || event.start) < now;
    return `
      <li class="pvo-admin__event${isPast ? ' is-past' : ''}">
        ${picture
    ? `<img class="pvo-admin__thumb" src="${escapeHtml(picture)}" alt="">`
    : '<span class="pvo-admin__thumb pvo-admin__thumb--empty" aria-hidden="true"></span>'}
        <div class="pvo-admin__event-text">
          <span class="pvo-admin__event-title">${escapeHtml(event.title)}${isPast ? ' <span class="pvo-badge pvo-badge--past">Past</span>' : ''}</span>
          <span class="pvo-admin__event-meta">${escapeHtml(formatShortDate(event.start))} · ${escapeHtml(formatTimeRange(event.start, event.end))}</span>
          ${event.location ? `<span class="pvo-admin__event-meta">${escapeHtml(event.location)}</span>` : ''}
        </div>
        <div class="pvo-admin__event-actions">
          <button class="small filledTinted primary" type="button" data-edit="${event.id}">Edit</button>
          <button class="small secondary" type="button" data-delete="${event.id}">Delete</button>
        </div>
      </li>`;
  }).join('');
}

async function refreshEvents() {
  const { ok, events } = await loadEvents();
  if (!ok) {
    els.empty.hidden = false;
    els.empty.textContent = 'The event list could not be loaded. Please refresh the page.';
    return;
  }
  state.events = events;
  renderEvents();
}

function initEventList() {
  els.list.addEventListener('click', async (clickEvent) => {
    const editButton = clickEvent.target.closest('[data-edit]');
    const deleteButton = clickEvent.target.closest('[data-delete]');
    if (editButton) {
      const match = state.events.find((item) => String(item.id) === editButton.dataset.edit);
      if (match) startEditing(match);
      return;
    }
    if (!deleteButton) return;
    const match = state.events.find((item) => String(item.id) === deleteButton.dataset.delete);
    if (!match || !window.confirm(`Delete “${match.title}”? This removes it from the public calendar.`)) return;
    deleteButton.disabled = true;
    const result = await apiFetch(`/api/events/${match.id}`, { method: 'DELETE' });
    if (!result.ok) {
      deleteButton.disabled = false;
      setStatus(els.status, messageFrom(result, 'The event could not be deleted.'));
      return;
    }
    if (state.editing?.id === match.id) resetForm();
    await refreshEvents();
    setStatus(els.status, `Deleted “${match.title}”.`, 'success');
  });
}

// ---- people & roles ----------------------------------------------------------------

/** "a veteran", "an administrator", "an event organizer" */
function withArticle(role) {
  const label = roleLabel(role).toLowerCase();
  return `${/^[aeiou]/.test(label) ? 'an' : 'a'} ${label}`;
}

function roleCell(user) {
  if (user.uid === state.me.uid) return `<span class="pvo-badge pvo-badge--admin">${roleLabel(user.role)} (you)</span>`;
  if (user.role === 'Guest') return '<span class="pvo-badge pvo-badge--guest">Guest</span>';
  const options = ASSIGNABLE.includes(user.role) ? ASSIGNABLE : [user.role, ...ASSIGNABLE];
  return `
    <label class="pvo-visually-hidden" for="role-${escapeHtml(user.uid)}">Role for ${escapeHtml(user.name)}</label>
    <select class="pvo-role-select" id="role-${escapeHtml(user.uid)}" data-role-for="${escapeHtml(user.uid)}" data-current="${escapeHtml(user.role)}">
      ${options.map((role) => `<option value="${escapeHtml(role)}"${role === user.role ? ' selected' : ''}${ASSIGNABLE.includes(role) ? '' : ' disabled'}>${escapeHtml(roleLabel(role))}</option>`).join('')}
    </select>`;
}

async function loadPeople() {
  const query = els.showGuests.checked ? '?include_guests=1' : '';
  const result = await apiFetch(`/api/admin/users${query}`);
  if (!result.ok) {
    setStatus(els.peopleStatus, messageFrom(result, 'The list of people could not be loaded.'));
    return;
  }
  els.people.innerHTML = result.data.map((user) => `
    <tr>
      <td data-label="Name">${escapeHtml(user.name)}</td>
      <td data-label="Username">${escapeHtml(user.uid)}</td>
      <td data-label="Email">${escapeHtml(user.email) || '<span class="pvo-muted">None</span>'}</td>
      <td data-label="Role">${roleCell(user)}</td>
    </tr>`).join('');
}

function initPeople() {
  els.showGuests.addEventListener('change', loadPeople);
  els.people.addEventListener('change', async (changeEvent) => {
    const select = changeEvent.target.closest('[data-role-for]');
    if (!select) return;
    const uid = select.dataset.roleFor;
    select.disabled = true;
    const result = await apiFetch(`/api/admin/users/${encodeURIComponent(uid)}/role`, { method: 'PUT', body: { role: select.value } });
    select.disabled = false;
    if (!result.ok) {
      select.value = select.dataset.current;
      setStatus(els.peopleStatus, messageFrom(result, `The role for ${uid} could not be changed.`));
      return;
    }
    select.dataset.current = result.data.role;
    [...select.options].forEach((option) => {
      if (!ASSIGNABLE.includes(option.value)) option.remove();
    });
    setStatus(els.peopleStatus, `${result.data.name} is now ${withArticle(result.data.role)}.`, 'success');
  });
}

// ---- start -------------------------------------------------------------------------

async function init() {
  const session = await getSession();
  els.loading.hidden = true;

  if (session.state === 'offline') {
    showGate('The admin service is unavailable', 'We could not reach the PVO server. Please try again later.', { signIn: false });
    return;
  }
  if (session.state !== 'signed-in') {
    els.gate.querySelector('[data-gate-actions] a').href = loginUrl();
    showGate('Administrators and event organizers only', 'Sign in with an administrator or event organizer account to post events.');
    return;
  }
  if (!canManageEvents(session)) {
    showGate(
      'This account cannot post events',
      `You are signed in as ${session.user.name} (${roleLabel(session.user.role)}). Posting events needs the Administrator or Event organizer role, which an administrator can give you from this page.`,
      { signIn: false },
    );
    return;
  }

  state.me = session.user;
  els.admin.hidden = false;
  initPicture();
  initEventForm();
  initEventList();
  if (isAdmin(session)) {
    initTabs();
    initPeople();
  } else {
    // event organizers: events only, so there are no tabs to switch between
    document.querySelector('[data-admin-tabs]').remove();
    document.getElementById('panel-people').remove();
    const events = document.getElementById('panel-events');
    events.removeAttribute('role');
    events.removeAttribute('aria-labelledby');
  }
  await refreshEvents();
}

init();
