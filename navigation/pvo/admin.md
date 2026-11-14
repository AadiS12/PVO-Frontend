---
layout: pvo
title: Administration
permalink: /admin/
search_exclude: true
show_reading_time: false
pvo_script: /assets/js/pvo/admin.js
---

<div class="pvo-page-head">
  <div class="pvo-wrap">
    <span class="pvo-kicker">Administration</span>
    <h1 class="pvo-page-head__title">Admin Tools</h1>
    <p>Post events to the public calendar. Administrators can also give members their roles.</p>
  </div>
</div>

<div class="pvo-wrap pvo-account">
  <p class="pvo-loading" data-admin-loading>Checking your account…</p>

  <div class="pvo-card pvo-gate" data-admin-gate hidden>
    <h2 class="pvo-card__title" data-gate-title>Administrators and event organizers only</h2>
    <p data-gate-text>Log in with an administrator or event organizer account to post events.</p>
    <div class="pvo-actions" data-gate-actions>
      <a class="medium filledHighlight primary" href="{{ '/member-login/' | relative_url }}?next={{ '/admin/' | relative_url | url_encode }}">Member Login</a>
      <a class="medium primary" href="{{ '/' | relative_url }}">Back to the homepage</a>
    </div>
  </div>

  <div class="pvo-admin" data-admin hidden>
    <div class="pvo-tabs" role="tablist" aria-label="Admin sections" data-admin-tabs>
      <button class="medium primary pvo-tab" type="button" role="tab" id="tab-events" aria-controls="panel-events" aria-selected="true" data-admin-tab>Events</button>
      <button class="medium primary pvo-tab" type="button" role="tab" id="tab-people" aria-controls="panel-people" aria-selected="false" tabindex="-1" data-admin-tab>People &amp; Roles</button>
    </div>

    <div class="pvo-admin__events" role="tabpanel" id="panel-events" aria-labelledby="tab-events">
      <section class="pvo-card pvo-admin__editor" aria-labelledby="event-form-title">
        <div class="pvo-card__head">
          <h2 class="pvo-card__title" id="event-form-title" data-event-form-title>Post an event</h2>
          <button class="small secondary" type="button" data-cancel-edit hidden>Cancel editing</button>
        </div>
        <form id="event-form" novalidate>
          <div class="form-group">
            <label for="event-title">Event title</label>
            <input id="event-title" name="title" type="text" maxlength="160" required>
          </div>

          <div class="pvo-form-row">
            <div class="form-group">
              <label for="event-date">Date</label>
              <input id="event-date" name="date" type="date" required>
            </div>
            <div class="form-group">
              <label for="event-start">Start time</label>
              <input id="event-start" name="start" type="time" required>
            </div>
            <div class="form-group">
              <label for="event-end">End time (optional)</label>
              <input id="event-end" name="end" type="time">
            </div>
          </div>

          <div class="form-group">
            <label for="event-location">Location (optional)</label>
            <input id="event-location" name="location" type="text" maxlength="255" placeholder="e.g. Poway Community Park, 13094 Civic Center Dr">
          </div>

          <div class="form-group">
            <label for="event-description">Description</label>
            <textarea class="smallInput" id="event-description" name="description" maxlength="2000" required></textarea>
          </div>

          <fieldset class="pvo-fieldset">
            <legend>Picture or video (optional)</legend>
            <div class="pvo-picture">
              <div class="pvo-picture__preview" data-picture-preview>
                <span class="pvo-picture__empty">No picture yet</span>
              </div>
              <div class="pvo-picture__inputs">
                <label class="medium primary pvo-picture__upload" for="event-picture">Choose a photo…</label>
                <input class="pvo-visually-hidden pvo-picture__file" id="event-picture" name="picture" type="file" accept="image/jpeg,image/png,image/gif,image/webp">
                <span class="pvo-hint">JPEG, PNG, GIF, or WebP. Large photos are resized before uploading. Events whose date has passed show their picture or video on the Photos &amp; Videos page.</span>
                <div class="form-group">
                  <label for="event-image-url">Or paste a link to an image or video (YouTube or .mp4)</label>
                  <input id="event-image-url" name="image_url" type="url" placeholder="https://">
                </div>
                <button class="small secondary" type="button" data-remove-picture hidden>Remove picture</button>
              </div>
            </div>
          </fieldset>

          <div class="pvo-form-footer">
            <button class="large filledHighlight primary" type="submit" data-event-submit>Publish event</button>
            <div class="pvo-status" id="event-status" role="status" aria-live="polite"></div>
          </div>
        </form>
      </section>

      <section class="pvo-card pvo-admin__list" aria-labelledby="event-list-title">
        <div class="pvo-card__head">
          <h2 class="pvo-card__title" id="event-list-title">On the calendar</h2>
          <span class="pvo-hint" data-event-count></span>
        </div>
        <p data-event-empty hidden>No events yet. Anything you publish shows up on the homepage calendar right away.</p>
        <ol class="pvo-admin__events-list" data-event-list></ol>
      </section>
    </div>

    <div role="tabpanel" id="panel-people" aria-labelledby="tab-people" hidden>
      <section class="pvo-card" aria-labelledby="people-title">
        <div class="pvo-card__head">
          <h2 class="pvo-card__title" id="people-title">People &amp; Roles</h2>
          <label class="switch">
            <span class="toggle">
              <input type="checkbox" data-show-guests>
              <span class="slider"></span>
            </span>
            <span class="label-text">Show guest sessions</span>
          </label>
        </div>
        <ul class="pvo-role-guide" aria-label="What each role can do">
          <li><span class="pvo-badge pvo-badge--admin">Administrator</span> Posts and edits events, and gives people their roles.</li>
          <li><span class="pvo-badge pvo-badge--organizer">Event organizer</span> Posts and edits events, but cannot change roles.</li>
          <li><span class="pvo-badge">Veteran</span> <span class="pvo-badge">Family member</span> <span class="pvo-badge">Volunteer</span> <span class="pvo-badge">Member</span> Member accounts with a profile. People choose one when they sign up or in their profile survey, and you can correct it here.</li>
          <li><span class="pvo-badge pvo-badge--guest">Guest</span> Temporary sessions, cleared after a week. They cannot be given a role.</li>
        </ul>
        <p class="pvo-hint">You cannot change your own role. Ask another administrator.</p>
        <div class="pvo-status" id="people-status" role="status" aria-live="polite"></div>
        <div class="pvo-table-wrap">
          <table class="pvo-table">
            <thead>
              <tr><th scope="col">Name</th><th scope="col">Username</th><th scope="col">Email</th><th scope="col">Role</th></tr>
            </thead>
            <tbody data-people></tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</div>
