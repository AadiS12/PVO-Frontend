// Accessibility toolbar: text size, colour theme, read aloud, and reading aids.
// Settings are saved on this device (localStorage) and applied as data-pvo-* attributes on
// <html>; the styles are in _sass/open-coding/pvo/_a11y.scss and _themes.scss.
import { createReader } from './reader.js';

const KEY = 'pvoAccessibility';
const DEFAULTS = Object.freeze({ text: '', theme: '', underline: false, spacing: false, motion: false, rate: 1 });
const CHOICES = { text: ['', 'lg', 'xl', 'xxl'], theme: ['', 'light', 'warm', 'navy', 'contrast'] };
const RATES = [0.8, 1, 1.25];

export function loadPrefs() {
  let saved = {};
  try {
    saved = JSON.parse(window.localStorage.getItem(KEY) || '{}') || {};
  } catch {
    saved = {};
  }
  return {
    text: CHOICES.text.includes(saved.text) ? saved.text : DEFAULTS.text,
    theme: CHOICES.theme.includes(saved.theme) ? saved.theme : DEFAULTS.theme,
    underline: saved.underline === true,
    spacing: saved.spacing === true,
    motion: saved.motion === true,
    rate: RATES.includes(Number(saved.rate)) ? Number(saved.rate) : DEFAULTS.rate,
  };
}

function savePrefs(prefs) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    // private browsing or storage disabled: settings still apply for this visit
  }
}

export function applyPrefs(prefs, root = document.documentElement) {
  const set = (name, value) => {
    if (value === '' || value === false) root.removeAttribute(name);
    else root.setAttribute(name, value === true ? '' : value);
  };
  set('data-pvo-text', prefs.text);
  set('data-pvo-theme', prefs.theme);
  set('data-pvo-underline', prefs.underline);
  set('data-pvo-spacing', prefs.spacing);
  set('data-pvo-motion', prefs.motion);
}

export function initA11y() {
  const panel = document.querySelector('[data-a11y-panel]');
  // the button in the top bar and the floating button that is always on screen
  const openButtons = [...document.querySelectorAll('[data-a11y-open]')];
  if (!panel || !openButtons.length) return;
  let opener = openButtons[0];

  let prefs = loadPrefs();
  const reader = createReader({
    getRate: () => prefs.rate,
    reduceMotion: () => prefs.motion || window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  });

  function render() {
    panel.querySelectorAll('[data-a11y-choice]').forEach((group) => {
      const key = group.dataset.a11yChoice;
      group.querySelectorAll('[data-value]').forEach((button) => {
        button.setAttribute('aria-pressed', String(button.dataset.value === prefs[key]));
      });
    });
    panel.querySelectorAll('[data-a11y-toggle]').forEach((input) => {
      input.checked = prefs[input.dataset.a11yToggle];
    });
    panel.querySelector('[data-a11y-rate]').value = String(prefs.rate);
  }

  function update(changes) {
    prefs = { ...prefs, ...changes };
    applyPrefs(prefs);
    savePrefs(prefs);
    render();
  }

  function setOpen(open) {
    panel.hidden = !open;
    openButtons.forEach((button) => button.setAttribute('aria-expanded', String(open)));
    if (open) panel.querySelector('[data-a11y-close]').focus();
  }

  openButtons.forEach((button) => {
    button.addEventListener('click', () => {
      opener = button;
      setOpen(panel.hidden);
    });
  });
  panel.querySelector('[data-a11y-close]').addEventListener('click', () => {
    setOpen(false);
    opener.focus();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hidden) {
      setOpen(false);
      opener.focus();
    }
  });
  document.addEventListener('click', (event) => {
    if (!panel.hidden && !panel.contains(event.target) && !openButtons.some((button) => button.contains(event.target))) {
      setOpen(false);
    }
  });

  panel.querySelectorAll('[data-a11y-choice]').forEach((group) => {
    group.addEventListener('click', (event) => {
      const button = event.target.closest('[data-value]');
      if (button) update({ [group.dataset.a11yChoice]: button.dataset.value });
    });
  });
  panel.querySelectorAll('[data-a11y-toggle]').forEach((input) => {
    input.addEventListener('change', () => update({ [input.dataset.a11yToggle]: input.checked }));
  });
  panel.querySelector('[data-a11y-rate]').addEventListener('change', (event) => {
    update({ rate: Number(event.target.value) });
  });
  panel.querySelector('[data-a11y-reset]').addEventListener('click', () => {
    reader.stop();
    update({ ...DEFAULTS });
  });

  // ---- read aloud ----
  const note = panel.querySelector('[data-read-note]');
  const readButtons = panel.querySelectorAll('[data-read]');
  if (!reader.supported) {
    readButtons.forEach((button) => {
      button.disabled = true;
    });
    note.hidden = false;
    note.textContent = 'Read aloud is not available in this browser.';
  }
  readButtons.forEach((button) => {
    button.addEventListener('click', () => {
      note.hidden = true;
      if (button.dataset.read === 'page') {
        setOpen(false);
        reader.readPage();
        return;
      }
      if (!reader.readSelection()) {
        note.hidden = false;
        note.textContent = 'Nothing is highlighted yet. Drag across some text on the page (or press and hold on a phone), then press Read selected text.';
      } else {
        setOpen(false);
      }
    });
  });

  applyPrefs(prefs);
  render();
}
