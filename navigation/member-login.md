---
layout: page
title: Member Login
permalink: /member-login
search_exclude: true
show_reading_time: false
---

<style>
  .member-login {
    --member-navy: #1a2744;
    --member-gold: #c9a84c;
    max-width: 560px;
    margin: 3rem auto;
    padding: 2.5rem;
    color: #f4f7fb;
    background: #111c33;
    border: 1px solid rgba(201, 168, 76, 0.55);
    border-top: 4px solid var(--member-gold);
    border-radius: 12px;
    box-shadow: 0 18px 48px rgba(0, 0, 0, 0.25);
  }
  .member-login h1 {
    margin: 0 0 0.5rem;
    color: #fff;
    font-family: Georgia, serif;
  }
  .member-login p { color: #c0cad8; }
  .member-login form { margin-top: 1.5rem; }
  .member-login label {
    display: block;
    margin: 1rem 0 0.35rem;
    color: #f4f7fb;
    font-weight: 600;
  }
  .member-login input {
    width: 100%;
    min-height: 48px;
    padding: 0.7rem 0.8rem;
    color: #172033;
    background: #fff;
    border: 2px solid transparent;
    border-radius: 6px;
    font: inherit;
  }
  .member-login input:focus {
    border-color: var(--member-gold);
    outline: 3px solid rgba(201, 168, 76, 0.25);
  }
  .member-login button {
    width: 100%;
    min-height: 48px;
    margin-top: 1.5rem;
    color: #fff;
    background: #b22234;
    border: 0;
    border-radius: 6px;
    cursor: pointer;
    font: inherit;
    font-weight: 700;
  }
  .member-login button:hover { background: #8c1a28; }
  .member-login button:disabled { cursor: wait; opacity: 0.7; }
  .member-login-message {
    min-height: 1.5em;
    margin-top: 1rem;
    color: #ffd1d5 !important;
  }
  .member-login-message.success { color: #b8f2ca !important; }
  .member-login-divider {
    margin: 2rem 0;
    border: 0;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
  }
  .member-signup h2 {
    margin: 0;
    color: #fff;
    font-family: Georgia, serif;
  }
  .member-login-home {
    display: inline-block;
    margin-top: 1rem;
    color: #e8c97a;
    font-weight: 600;
  }
  @media (max-width: 600px) {
    .member-login { margin: 1.5rem 1rem; padding: 1.5rem; }
  }
</style>

<main class="member-login">
  <h1>Member Login</h1>
  <p>Sign in with your PVO username and password.</p>
  <form id="member-login-form">
    <label for="member-uid">Username</label>
    <input id="member-uid" name="uid" type="text" autocomplete="username" required>

    <label for="member-password">Password</label>
    <input id="member-password" name="password" type="password" autocomplete="current-password" required>

    <button id="member-login-submit" type="submit">Sign in</button>
  </form>
  <p id="member-login-message" class="member-login-message" role="status" aria-live="polite"></p>

  <hr class="member-login-divider">

  <section class="member-signup" aria-labelledby="member-signup-title">
    <h2 id="member-signup-title">Create an Account</h2>
    <p>Create a PVO member account with a username and password.</p>
    <form id="member-signup-form">
      <label for="member-signup-name">Full name</label>
      <input id="member-signup-name" name="name" type="text" autocomplete="name" minlength="2" required>

      <label for="member-signup-uid">Choose a username</label>
      <input id="member-signup-uid" name="uid" type="text" autocomplete="username" minlength="2" required>

      <label for="member-signup-email">Email (optional)</label>
      <input id="member-signup-email" name="email" type="email" autocomplete="email">

      <label for="member-signup-password">Password</label>
      <input id="member-signup-password" name="password" type="password" autocomplete="new-password" minlength="8" required>

      <label for="member-signup-confirm-password">Confirm password</label>
      <input id="member-signup-confirm-password" name="confirm-password" type="password" autocomplete="new-password" minlength="8" required>

      <button id="member-signup-submit" type="submit">Create account</button>
    </form>
    <p id="member-signup-message" class="member-login-message" role="status" aria-live="polite"></p>
  </section>

  <a class="member-login-home" href="{{site.baseurl}}/">Return to the PVO homepage</a>
</main>

<script type="module">
  import { pythonURI } from '{{site.baseurl}}/assets/js/api/config.js';

  const form = document.getElementById('member-login-form');
  const submitButton = document.getElementById('member-login-submit');
  const message = document.getElementById('member-login-message');
  const signupForm = document.getElementById('member-signup-form');
  const signupButton = document.getElementById('member-signup-submit');
  const signupMessage = document.getElementById('member-signup-message');

  async function authenticate(uid, password) {
    const response = await fetch(`${pythonURI}/api/authenticate`, {
      method: 'POST',
      mode: 'cors',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, password })
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || `Sign-in failed (${response.status}).`);
    }

    return result.user;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    message.textContent = '';
    message.classList.remove('success');
    submitButton.disabled = true;
    submitButton.textContent = 'Signing in…';

    try {
      const user = await authenticate(
        document.getElementById('member-uid').value.trim(),
        document.getElementById('member-password').value
      );
      const accountName = user?.name || user?.uid;
      if (!accountName) {
        throw new Error('Sign-in succeeded, but the server did not return account details.');
      }

      message.textContent = `Welcome, ${accountName}. You are signed in.`;
      message.classList.add('success');
      form.hidden = true;
    } catch (error) {
      message.textContent = error instanceof Error
        ? error.message
        : 'Unable to sign in. Please try again.';
      console.error('PVO member sign-in failed:', error);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Sign in';
    }
  });

  signupForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    signupMessage.textContent = '';
    signupMessage.classList.remove('success');

    const name = document.getElementById('member-signup-name').value.trim();
    const uid = document.getElementById('member-signup-uid').value.trim();
    const email = document.getElementById('member-signup-email').value.trim();
    const password = document.getElementById('member-signup-password').value;
    const confirmPassword = document.getElementById('member-signup-confirm-password').value;

    if (password !== confirmPassword) {
      signupMessage.textContent = 'Passwords do not match.';
      document.getElementById('member-signup-confirm-password').focus();
      return;
    }

    signupButton.disabled = true;
    signupButton.textContent = 'Creating account…';

    try {
      const signupResponse = await fetch(`${pythonURI}/api/user/guest`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, uid, email, password })
      });
      const signupResult = await signupResponse.json();

      if (!signupResponse.ok) {
        throw new Error(signupResult.message || `Account creation failed (${signupResponse.status}).`);
      }

      const user = await authenticate(uid, password);
      const accountName = user?.name || user?.uid;
      if (!accountName) {
        throw new Error('Account created, but the server did not return account details after sign-in.');
      }

      signupMessage.textContent = `Account created. Welcome, ${accountName}! You are signed in.`;
      signupMessage.classList.add('success');
      signupForm.hidden = true;
    } catch (error) {
      signupMessage.textContent = error instanceof Error
        ? error.message
        : 'Unable to create your account. Please try again.';
      console.error('PVO account creation failed:', error);
    } finally {
      signupButton.disabled = false;
      signupButton.textContent = 'Create account';
    }
  });
</script>
