// Member Login page: log in, create an account, or continue as a guest.
import { baseurl, getSession, safeNextUrl } from './api.js';
import { createAccount, logIn, setStatus, startGuest, whileBusy } from './auth.js';

function finish(statusElement, name, fallback) {
  setStatus(statusElement, `Welcome, ${name}. You are logged in.`, 'success');
  window.location.assign(safeNextUrl(fallback));
}

function initLogIn() {
  const form = document.getElementById('signin-form');
  const status = document.getElementById('signin-status');
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
    finish(status, result.name);
  });
}

function initCreateAccount() {
  const form = document.getElementById('signup-form');
  const status = document.getElementById('signup-status');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    setStatus(status, '');
    const values = {
      name: form.name.value.trim(),
      uid: form.uid.value.trim(),
      email: form.email.value.trim(),
      role: form.role.value,
      password: form.password.value,
      confirm: form.confirm.value,
    };
    const button = form.querySelector('[type="submit"]');
    const result = await whileBusy(button, 'Creating account…', () => createAccount(values));
    if (!result.ok) {
      setStatus(status, result.message, result.created ? 'success' : 'error');
      if (result.field) form[result.field].focus();
      return;
    }
    finish(status, result.name);
  });
}

function initGuest() {
  const button = document.getElementById('guest-button');
  const status = document.getElementById('guest-status');
  button.addEventListener('click', async () => {
    setStatus(status, '');
    const result = await whileBusy(button, 'Starting guest session…', startGuest);
    if (!result.ok) {
      setStatus(status, result.message);
      return;
    }
    // guests usually come to try the survey
    finish(status, result.name, `${baseurl}/member-profile/#survey`);
  });
}

initLogIn();
initCreateAccount();
initGuest();
if (window.location.hash === '#create') {
  document.getElementById('signup-name')?.focus({ preventScroll: false });
}
getSession();
