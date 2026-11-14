---
layout: pvo
title: Member Login
permalink: /member-login/
search_exclude: true
show_reading_time: false
pvo_script: /assets/js/pvo/login.js
---

<div class="pvo-page-head">
  <div class="pvo-wrap">
    <span class="pvo-kicker">Members</span>
    <h1 class="pvo-page-head__title">Member Login</h1>
    <p>Sign in with your PVO username and password, or create an account. Members can build a veteran profile to meet others with shared interests.</p>
  </div>
</div>

<div class="pvo-wrap pvo-account">
  <div class="pvo-card pvo-signed-in" data-show="signed-in" hidden>
    <h2 class="pvo-card__title">You are signed in as <span data-pvo-name>member</span></h2>
    <p>Go to your profile, or log out if this is a shared computer.</p>
    <div class="pvo-actions">
      <a class="medium filledHighlight primary" href="{{ '/member-profile/' | relative_url }}">My Profile</a>
      <a class="medium filledTinted primary" href="{{ '/member-profile/' | relative_url }}#survey">Member Survey</a>
      <a class="medium primary" href="{{ '/admin/' | relative_url }}" data-show="staff" hidden>Admin Tools</a>
      <button class="medium secondary" type="button" data-pvo-signout>Log out</button>
    </div>
  </div>

  <div data-show="signed-out">
    <div class="login-container">
      <section class="login-card" aria-labelledby="login-title">
        <h2 class="pvo-card__title" id="login-title">Member Login</h2>
        <hr>
        <form id="signin-form" novalidate>
          <div class="form-group">
            <label for="signin-uid">Username or email</label>
            <input id="signin-uid" name="uid" type="text" autocomplete="username" autocapitalize="none" autocorrect="off" spellcheck="false" aria-describedby="signin-uid-hint" required>
            <span class="pvo-hint" id="signin-uid-hint">The username you chose when you signed up (or the email on your account), not your full name.</span>
          </div>
          <div class="form-group">
            <label for="signin-password">Password</label>
            <input id="signin-password" name="password" type="password" autocomplete="current-password" required>
          </div>
          <button class="large filledHighlight primary submit-button" type="submit">Log in</button>
          <div class="pvo-status" id="signin-status" role="status" aria-live="polite"></div>
          <p class="pvo-account__help">Forgot your username or password? Call <a href="{{ site.pvo_contact.phone_link }}">{{ site.pvo_contact.phone }}</a> or email <a href="mailto:{{ site.pvo_contact.email }}">{{ site.pvo_contact.email }}</a> and a PVO administrator will help.</p>
        </form>

        <hr>
        <h3 class="pvo-card__subtitle" id="guest-title">Just looking around?</h3>
        <p>Continue as a guest to try the profile survey without making an account. Guest sessions are temporary and are cleared after a week.</p>
        <button class="medium filledTinted primary" type="button" id="guest-button">Continue as guest</button>
        <div class="pvo-status" id="guest-status" role="status" aria-live="polite"></div>
      </section>

      <section class="signup-card" id="create" aria-labelledby="signup-title">
        <h2 class="pvo-card__title" id="signup-title">Create an Account</h2>
        <hr>
        <form id="signup-form" novalidate>
          <div class="form-group">
            <label for="signup-name">Full name</label>
            <input id="signup-name" name="name" type="text" autocomplete="name" minlength="2" required>
          </div>
          <div class="form-group">
            <label for="signup-uid">Choose a username</label>
            <input id="signup-uid" name="uid" type="text" autocomplete="username" autocapitalize="none" autocorrect="off" spellcheck="false" minlength="2" maxlength="40" aria-describedby="signup-uid-hint" required>
            <span class="pvo-hint" id="signup-uid-hint">Letters, numbers, dots, dashes, or underscores. You will log in with this, so pick one you will remember.</span>
          </div>
          <div class="form-group">
            <label for="signup-email">Email (optional)</label>
            <input id="signup-email" name="email" type="email" autocomplete="email">
          </div>
          <div class="form-group">
            <label for="signup-role">I am joining as</label>
            <select id="signup-role" name="role" aria-describedby="signup-role-hint">
              <option value="">Choose one (optional)</option>
              <option value="Veteran">A veteran or service member</option>
              <option value="Family">A family member of a veteran</option>
              <option value="Volunteer">A volunteer or supporter</option>
            </select>
            <span class="pvo-hint" id="signup-role-hint">This is your member type, shown on your profile. You can change it later in your profile survey.</span>
          </div>
          <div class="form-group">
            <label for="signup-password">Password</label>
            <input id="signup-password" name="password" type="password" autocomplete="new-password" minlength="8" aria-describedby="signup-password-hint" required>
            <span class="pvo-hint" id="signup-password-hint">At least 8 characters.</span>
          </div>
          <div class="form-group">
            <label for="signup-confirm">Confirm password</label>
            <input id="signup-confirm" name="confirm" type="password" autocomplete="new-password" minlength="8" required>
          </div>
          <button class="large primary submit-button" type="submit">Create account</button>
          <div class="pvo-status" id="signup-status" role="status" aria-live="polite"></div>
        </form>
      </section>
    </div>
  </div>

  <p class="pvo-account__back"><a href="{{ '/' | relative_url }}">Return to the PVO homepage</a></p>
</div>
