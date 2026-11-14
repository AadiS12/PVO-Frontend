---
layout: pvo
title: Photos & Videos
permalink: /gallery/
search_exclude: true
show_reading_time: false
pvo_script: /assets/js/pvo/gallery.js
---

<div class="pvo-page-head">
  <div class="pvo-wrap">
    <span class="pvo-kicker">Get involved</span>
    <h1 class="pvo-page-head__title">Photos &amp; Videos</h1>
    <p>Photos and videos from past PVO workdays, fundraisers, and get-togethers.</p>
  </div>
</div>

<div class="pvo-wrap pvo-account">
  <ul class="pvo-recaps pvo-recaps--page" data-recaps aria-live="polite"></ul>
  <p class="pvo-recaps__status" data-recaps-status>Loading photos and videos…</p>
  <div class="pvo-notice pvo-recaps__admin" data-show="staff" hidden>Administrators and event organizers: to add photos here, open <a href="{{ '/admin/' | relative_url }}">Admin Tools</a>, then post or edit an event whose date has passed and give it a photo, a YouTube link, or an .mp4 link.</div>
</div>

{% include pvo/media-dialog.html %}
