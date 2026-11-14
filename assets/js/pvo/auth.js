// Member log in, account creation, and guest sessions, shared by the homepage
// member bar and the Member Login page.
import { MEMBER_TYPES, apiFetch, messageFrom } from './api.js';

export const USERNAME_PATTERN = /^[A-Za-z0-9_.-]{2,40}$/;

/** Resolves to { ok, name, message }. */
export async function logIn(uid, password) {
  if (!uid || !password) return { ok: false, message: 'Enter your username (or email) and password.' };
  const result = await apiFetch('/api/authenticate', { method: 'POST', body: { uid, password } });
  if (result.ok) return { ok: true, name: result.data?.user?.name || uid };
  return {
    ok: false,
    message: result.status === 401
      ? 'That username and password do not match. Use the username you signed up with (or the email on your account), not your full name.'
      : messageFrom(result, 'Log in failed. Please try again.'),
  };
}

/**
 * Creates the account, then logs in. role is an optional member type (see MEMBER_TYPES);
 * left empty, the backend makes a plain Member. Resolves to { ok, name, message, field }.
 */
export async function createAccount({ name, uid, email, role = '', password, confirm }) {
  const problems = [
    [name.length < 2, 'name', 'Enter your full name.'],
    [!USERNAME_PATTERN.test(uid), 'uid', 'Usernames are 2 to 40 letters, numbers, dots, dashes, or underscores.'],
    [email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), 'email', 'That email address does not look right.'],
    [role && !MEMBER_TYPES.includes(role), 'role', 'Choose one of the member types in the list.'],
    [password.length < 8, 'password', 'Choose a password with at least 8 characters.'],
    [password !== confirm, 'confirm', 'The two passwords do not match.'],
  ];
  const problem = problems.find(([failed]) => failed);
  if (problem) return { ok: false, field: problem[1], message: problem[2] };

  const body = { name, uid, email, password };
  if (role) body.role = role;
  const created = await apiFetch('/api/user/guest', { method: 'POST', body });
  if (!created.ok) {
    return created.status === 409
      ? { ok: false, field: 'uid', message: 'That username is already taken. Please choose another.' }
      : { ok: false, message: messageFrom(created, 'We could not create your account. Please try again.') };
  }
  const signedIn = await logIn(uid, password);
  if (!signedIn.ok) {
    return { ok: false, created: true, message: 'Your account was created. Please log in with your new username and password.' };
  }
  return { ok: true, name };
}

/** Starts a temporary guest session. Resolves to { ok, message }. */
export async function startGuest() {
  const result = await apiFetch('/api/guest/session', { method: 'POST' });
  if (result.ok) return { ok: true, name: 'Guest' };
  return { ok: false, message: messageFrom(result, 'We could not start a guest session. Please try again.') };
}

export function setStatus(element, text, kind = 'error') {
  if (!element) return;
  element.textContent = text;
  element.classList.toggle('is-error', kind === 'error');
  element.classList.toggle('is-success', kind === 'success');
  element.classList.toggle('is-info', kind === 'info');
}

/** Disable a button and swap its label while a task runs. */
export async function whileBusy(button, label, task) {
  const original = button.textContent;
  button.disabled = true;
  button.textContent = label;
  try {
    return await task();
  } finally {
    button.disabled = false;
    button.textContent = original;
  }
}
