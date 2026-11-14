// Runs on every page that uses the PVO layout: menu, login state, log out, assistant.
import { baseurl, canManageEvents, getSession, isAdmin, isGuest, roleLabel, signOut } from './api.js';
import { initA11y } from './a11y.js';
import { initChat } from './chat.js';

function initMenu() {
  const toggle = document.querySelector('[data-pvo-menu-toggle]');
  const nav = document.getElementById('pvo-nav');
  // on small screens the Menu button opens both the account row and the links
  const panels = [...document.querySelectorAll('[data-pvo-menu-panel]')];
  const triggers = [...document.querySelectorAll('[data-pvo-submenu]')];

  const closeSubmenus = (except) => {
    triggers.forEach((trigger) => {
      if (trigger !== except) trigger.setAttribute('aria-expanded', 'false');
    });
  };

  const setMenuOpen = (open) => {
    toggle?.setAttribute('aria-expanded', String(open));
    panels.forEach((panel) => panel.classList.toggle('is-open', open));
    if (!open) closeSubmenus();
  };

  toggle?.addEventListener('click', () => {
    setMenuOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const open = trigger.getAttribute('aria-expanded') !== 'true';
      closeSubmenus(trigger);
      trigger.setAttribute('aria-expanded', String(open));
    });
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.pvo-nav__item--menu')) closeSubmenus();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const open = triggers.find((trigger) => trigger.getAttribute('aria-expanded') === 'true');
    if (open) {
      closeSubmenus();
      open.focus();
    }
  });

  // Close the mobile menu after following an in-page link such as /#calendar
  nav?.addEventListener('click', (event) => {
    const link = event.target.closest('a[href*="#"]');
    if (link && toggle?.getAttribute('aria-expanded') === 'true') setMenuOpen(false);
  });
}

/**
 * Show or hide elements by their data-show attribute:
 * signed-in, signed-out, admin, not-admin (everyone except admins), non-admin (signed in, not admin),
 * staff (administrators and event organizers, who can open Admin Tools), not-staff,
 * guest, member (signed in, not a guest). Also fills in [data-pvo-name] and [data-pvo-role].
 */
export function applySession(session, root = document) {
  const signedIn = session.state === 'signed-in';
  const rules = {
    'signed-in': signedIn,
    'signed-out': !signedIn,
    admin: isAdmin(session),
    'not-admin': !isAdmin(session),
    'non-admin': signedIn && !isAdmin(session),
    staff: canManageEvents(session),
    'not-staff': !canManageEvents(session),
    guest: isGuest(session),
    member: signedIn && !isGuest(session),
  };
  root.querySelectorAll('[data-show]').forEach((element) => {
    element.hidden = !rules[element.dataset.show];
  });
  root.querySelectorAll('[data-pvo-name]').forEach((element) => {
    element.textContent = signedIn ? session.user.name : '';
  });
  root.querySelectorAll('[data-pvo-role]').forEach((element) => {
    element.textContent = signedIn ? roleLabel(session.user.role).toLowerCase() : '';
  });
}

/** Re-check the login with the backend and update the page. */
export async function refreshSession() {
  const session = await getSession({ refresh: true });
  applySession(session);
  return session;
}

function initLogOut() {
  document.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-pvo-signout]');
    if (!button) return;
    button.disabled = true;
    button.textContent = 'Logging out…';
    await signOut();
    window.location.assign(`${baseurl}/`);
  });
}

initMenu();
initLogOut();
initA11y();
initChat();
getSession().then((session) => applySession(session));

// Like the old homepage: re-check the login when the page is shown again
// (back/forward navigation) or the tab becomes visible.
window.addEventListener('pageshow', (event) => {
  if (event.persisted) refreshSession();
});
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') refreshSession();
});
