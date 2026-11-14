---
layout: pvo
title: Resource Hub
permalink: /resources/
search_exclude: true
show_reading_time: false
pvo_script: /assets/js/pvo/resources.js
---
{%- assign hub = site.data.pvo_resources -%}

<div class="pvo-page-head">
  <div class="pvo-wrap">
    <span class="pvo-kicker">Get help</span>
    <h1 class="pvo-page-head__title">Resource Hub</h1>
    <p>Trusted places to turn for health care, benefits, housing, work, and family support. PVO is not affiliated with these organizations, but our volunteers are glad to help you get started.</p>
  </div>
</div>

<div class="pvo-wrap pvo-account">
  <section class="pvo-card pvo-crisis" aria-labelledby="crisis-title">
    <div class="pvo-crisis__text">
      <span class="pvo-kicker">24/7 confidential support</span>
      <h2 class="pvo-card__title" id="crisis-title">{{ hub.crisis.title }}</h2>
      <p>{{ hub.crisis.text }}</p>
    </div>
    <div class="pvo-crisis__actions">
      {%- for action in hub.crisis.actions %}
      <a class="large {% if forloop.first %}filledHighlight{% endif %} primary" {% include pvo/link-attrs.html url=action.url %}>{{ action.label }}</a>
      {%- endfor %}
    </div>
  </section>

  <div class="pvo-resource-tools">
    <div class="form-group pvo-resource-tools__search">
      <label for="resource-search">Search resources</label>
      <input id="resource-search" type="text" placeholder="Try housing, claim, or counseling" autocomplete="off" data-resource-search>
    </div>
    <div class="pvo-resource-tools__filters" role="group" aria-label="Show one category">
      <button class="small primary" type="button" aria-pressed="true" data-resource-filter="">All</button>
      {%- for group in hub.categories %}
      <button class="small primary" type="button" aria-pressed="false" data-resource-filter="{{ group.name | slugify }}">{{ group.name }}</button>
      {%- endfor %}
    </div>
    <span class="pvo-hint" aria-live="polite" data-resource-count></span>
  </div>

  {%- for group in hub.categories %}
  {%- assign slug = group.name | slugify %}
  <section class="pvo-resource-group" data-resource-group="{{ slug }}" aria-labelledby="resources-{{ slug }}">
    <h2 class="pvo-resource-group__title" id="resources-{{ slug }}">{{ group.name }}</h2>
    <ul class="pvo-resource-list">
      {%- for item in group.items %}
      <li class="pvo-resource" data-resource>
        <a class="pvo-resource__title" {% include pvo/link-attrs.html url=item.url %}>{{ item.title }}{% if item.url contains '://' %}<span class="pvo-visually-hidden"> (opens in a new tab)</span>{% endif %}</a>
        <span class="pvo-resource__text">{{ item.text }}</span>
        {%- if item.phone %}
        <a class="pvo-resource__phone" href="tel:{{ item.phone | remove: '-' }}">{{ item.phone_label }}: {{ item.phone }}</a>
        {%- endif %}
      </li>
      {%- endfor %}
    </ul>
  </section>
  {%- endfor %}

  <p class="pvo-resource-empty" data-resource-empty hidden>No resources match that search. Try a different word, or <a href="{{ '/pvo-chatbot/' | relative_url }}" data-chat-open>ask the assistant</a>.</p>

  <section class="pvo-card pvo-resource-cta" aria-labelledby="resource-cta-title">
    <h2 class="pvo-card__title" id="resource-cta-title">Need hands-on help?</h2>
    <p>PVO volunteers help veterans and their families in Poway, Ramona, and nearby with home repairs, vehicle repairs, and more.</p>
    <div class="pvo-actions">
      <a class="medium filledHighlight primary" href="{{ '/prescreener' | relative_url }}">Request assistance</a>
      <a class="medium primary" href="{{ site.pvo_contact.phone_link }}">Call PVO at {{ site.pvo_contact.phone }}</a>
    </div>
  </section>
</div>
