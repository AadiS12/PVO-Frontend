// Profile page: account summary, the veteran profile (main survey), and the volunteer
// survey at the bottom. Each form saves only its own fields.
import { MEMBER_TYPES, apiFetch, getSession, messageFrom, roleLabel } from './api.js';
import { setStatus, startGuest, whileBusy } from './auth.js';
import { refreshSession } from './site.js';

const savedFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });

const els = {
  loading: document.querySelector('[data-profile-loading]'),
  gate: document.querySelector('[data-profile-gate]'),
  gateTitle: document.querySelector('[data-gate-title]'),
  gateText: document.querySelector('[data-gate-text]'),
  gateActions: document.querySelector('[data-gate-actions]'),
  gateStatus: document.querySelector('[data-gate-status]'),
  gateGuest: document.querySelector('[data-gate-guest]'),
  profile: document.querySelector('[data-profile]'),
  forms: [...document.querySelectorAll('[data-survey-form]')],
  bioCount: document.querySelector('[data-bio-count]'),
};

function initials(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join('') || '?';
}

function showSaved(survey) {
  const date = survey.updated_at ? new Date(survey.updated_at) : null;
  const text = date && !Number.isNaN(date.getTime()) ? `Last saved ${savedFormat.format(date)}` : 'Not saved yet';
  document.querySelectorAll('[data-saved]').forEach((element) => {
    element.textContent = text;
  });
}

function renderAccount(user, survey) {
  document.querySelector('[data-profile-initials]').textContent = initials(user.name);
  document.querySelector('[data-profile-name]').textContent = user.name;
  document.querySelector('[data-profile-uid]').textContent = user.role === 'Guest' ? 'Temporary guest session' : `Username: ${user.uid}`;
  const role = document.querySelector('[data-profile-role]');
  role.textContent = roleLabel(user.role);
  role.className = `pvo-badge pvo-badge--${user.role.toLowerCase()}`;

  // Members' "connection to the military" answer also sets their member type (on the backend).
  // Administrators, organizers, and guests keep their role, so they do not see the hint.
  const choosesType = MEMBER_TYPES.includes(user.role);
  const hint = document.querySelector('[data-member-type-hint]');
  const affiliation = document.getElementById('survey-affiliation');
  if (hint && affiliation) {
    hint.hidden = !choosesType;
    if (choosesType) affiliation.setAttribute('aria-describedby', hint.id);
    else affiliation.removeAttribute('aria-describedby');
  }

  const facts = [];
  if (user.email) facts.push(['Email', user.email]);
  if (survey.affiliation) facts.push(['Connection', survey.affiliation]);
  if (survey.branch) facts.push(['Branch', survey.branch]);
  if (survey.era) facts.push(['Served', survey.era]);
  if (survey.service_years !== null && survey.service_years !== undefined) {
    facts.push(['Service', `${survey.service_years} year${survey.service_years === 1 ? '' : 's'}`]);
  }
  if (survey.connect_ok) facts.push(['Meetups', 'Open to introductions']);
  if (survey.volunteer?.length) facts.push(['Volunteer', `${survey.volunteer.length} way${survey.volunteer.length === 1 ? '' : 's'} to help`]);
  const list = document.querySelector('[data-profile-facts]');
  list.replaceChildren(...facts.map(([term, value]) => {
    const row = document.createElement('div');
    const dt = document.createElement('dt');
    const dd = document.createElement('dd');
    dt.textContent = term;
    dd.textContent = value;
    row.append(dt, dd);
    return row;
  }));
  list.hidden = facts.length === 0;
}

function updateCount() {
  const bio = document.getElementById('survey-bio');
  if (bio && els.bioCount) els.bioCount.textContent = `${bio.value.length} / 1000`;
}

/** Field names in a form, in order. */
function fieldNames(form) {
  return [...new Set([...form.elements].map((element) => element.name).filter(Boolean))];
}

function fillForm(form, survey) {
  fieldNames(form).forEach((name) => {
    const inputs = [...form.querySelectorAll(`[name="${name}"]`)];
    const value = survey[name];
    if (inputs[0].type === 'checkbox' && inputs[0].hasAttribute('data-boolean')) {
      inputs[0].checked = Boolean(value);
    } else if (inputs[0].type === 'checkbox') {
      const chosen = new Set(value || []);
      inputs.forEach((input) => {
        input.checked = chosen.has(input.value);
      });
    } else {
      inputs[0].value = value ?? '';
    }
  });
}

function readForm(form) {
  const answers = {};
  fieldNames(form).forEach((name) => {
    const inputs = [...form.querySelectorAll(`[name="${name}"]`)];
    if (inputs[0].type === 'checkbox' && inputs[0].hasAttribute('data-boolean')) {
      answers[name] = inputs[0].checked;
    } else if (inputs[0].type === 'checkbox') {
      answers[name] = inputs.filter((input) => input.checked).map((input) => input.value);
    } else if (inputs[0].type === 'number') {
      const text = inputs[0].value.trim();
      answers[name] = text === '' ? null : Number(text);
    } else {
      answers[name] = inputs[0].value.trim();
    }
  });
  return answers;
}

function preselectBranchFromLink() {
  const branch = new URLSearchParams(window.location.search).get('branch');
  const select = document.getElementById('survey-branch');
  if (branch && select && !select.value && [...select.options].some((option) => option.value === branch)) {
    select.value = branch;
  }
}

function showGate(state) {
  els.gate.hidden = false;
  els.profile.hidden = true;
  if (state === 'offline') {
    els.gateTitle.textContent = 'The member service is unavailable';
    els.gateText.textContent = 'We could not reach the PVO server, so your profile cannot be loaded right now. Please try again later.';
    els.gateActions.hidden = true;
  }
}

function initGateGuest() {
  els.gateGuest?.addEventListener('click', async () => {
    setStatus(els.gateStatus, '');
    const result = await whileBusy(els.gateGuest, 'Starting guest session…', startGuest);
    if (!result.ok) {
      setStatus(els.gateStatus, result.message);
      return;
    }
    await refreshSession();
    await load();
  });
}

let formsReady = false;

function initForms(firstSession) {
  if (formsReady) return;
  formsReady = true;
  let session = firstSession;
  document.getElementById('survey-bio')?.addEventListener('input', updateCount);
  els.forms.forEach((form) => {
    const status = form.querySelector('[data-form-status]');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const answers = readForm(form);
      if ('service_years' in answers && answers.service_years !== null
        && (!Number.isInteger(answers.service_years) || answers.service_years < 0 || answers.service_years > 80)) {
        setStatus(status, 'Years of service should be a whole number between 0 and 80.');
        form.service_years.focus();
        return;
      }
      const button = form.querySelector('[type="submit"]');
      button.disabled = true;
      setStatus(status, 'Saving…', 'info');
      const saved = await apiFetch('/api/profile/survey', { method: 'PUT', body: answers });
      button.disabled = false;
      if (!saved.ok) {
        setStatus(status, messageFrom(saved, 'Your answers could not be saved. Please try again.'));
        return;
      }
      if ('affiliation' in answers && MEMBER_TYPES.includes(session.user.role)) {
        // the answer may have changed the member type: update the badge and the header
        const fresh = await refreshSession();
        if (fresh.state === 'signed-in') session = fresh;
      }
      renderAccount(session.user, saved.data);
      showSaved(saved.data);
      setStatus(status, form.dataset.surveyForm === 'volunteer'
        ? 'Thanks! Your volunteer answers are saved. A PVO coordinator will be in touch.'
        : 'Thanks, your profile is saved.', 'success');
    });
  });
}

async function load() {
  const session = await getSession();
  els.loading.hidden = true;
  if (session.state !== 'signed-in') {
    showGate(session.state);
    return;
  }

  const result = await apiFetch('/api/profile/survey');
  if (!result.ok) {
    showGate('error');
    els.gateTitle.textContent = 'Your profile could not be loaded';
    els.gateText.textContent = messageFrom(result, 'Please refresh the page or try again later.');
    els.gateActions.hidden = true;
    return;
  }
  const survey = result.data;
  els.gate.hidden = true;
  renderAccount(session.user, survey);
  els.forms.forEach((form) => fillForm(form, survey));
  updateCount();
  preselectBranchFromLink();
  showSaved(survey);
  els.profile.hidden = false;
  initForms(session);

  // /member-profile/#survey and #volunteer-survey jump straight to that section
  const target = window.location.hash && document.getElementById(window.location.hash.slice(1));
  if (target) target.scrollIntoView({ block: 'start' });
}

initGateGuest();
load();
