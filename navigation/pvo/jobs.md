---
layout: pvo
title: Employment Board
permalink: /jobs/
search_exclude: true
show_reading_time: false
---
{%- assign board = site.data.pvo_jobs -%}

<div class="pvo-page-head">
  <div class="pvo-wrap">
    <span class="pvo-kicker">Work</span>
    <h1 class="pvo-page-head__title">Employment Board</h1>
    <p>Openings from local employers who want to hire veterans, plus programs that help with training, careers, and federal hiring.</p>
  </div>
</div>

<div class="pvo-wrap pvo-account">
  <section class="pvo-jobs" aria-labelledby="jobs-local-title">
    <div class="pvo-card__head">
      <h2 class="pvo-section__title" id="jobs-local-title">Local openings</h2>
      <span class="pvo-hint">{{ board.listings | size }} posted</span>
    </div>

    {%- if board.listings.size > 0 %}
    <ul class="pvo-resource-list pvo-jobs__list">
      {%- assign listings = board.listings | sort: 'posted' | reverse %}
      {%- for job in listings %}
      <li class="pvo-resource pvo-job">
        <span class="pvo-job__title">{{ job.title }}</span>
        <span class="pvo-job__meta">{{ job.employer }} &middot; {{ job.location }}{% if job.type %} &middot; {{ job.type }}{% endif %}</span>
        {%- if job.text %}<span class="pvo-resource__text">{{ job.text }}</span>{% endif %}
        <span class="pvo-job__foot">
          {%- if job.posted %}<span class="pvo-hint">Posted {{ job.posted | date: '%b %-d, %Y' }}</span>{% endif %}
          {%- if job.url %}<a class="small filledHighlight primary" {% include pvo/link-attrs.html url=job.url %}>How to apply</a>{% endif %}
        </span>
      </li>
      {%- endfor %}
    </ul>
    {%- else %}
    <div class="pvo-card pvo-jobs__empty">
      <h3 class="pvo-card__subtitle">No local openings are posted right now</h3>
      <p>New openings appear here as soon as local employers share them with PVO. In the meantime, the programs below list thousands of veteran-friendly jobs.</p>
    </div>
    {%- endif %}

    <div class="pvo-card pvo-jobs__employers">
      <h3 class="pvo-card__subtitle">Hiring? Share your opening with local veterans</h3>
      <p>Email PVO the job title, location, and how to apply, and we will post it here.</p>
      <a class="medium filledTinted primary" href="mailto:{{ site.pvo_contact.email }}?subject=Job%20opening%20for%20the%20PVO%20Employment%20Board">Email a job opening</a>
    </div>
  </section>

  <section class="pvo-jobs-programs" aria-labelledby="jobs-programs-title">
    <h2 class="pvo-section__title" id="jobs-programs-title">Job programs for veterans</h2>
    <ul class="pvo-resource-list">
      {%- for program in board.programs %}
      <li class="pvo-resource">
        <a class="pvo-resource__title" {% include pvo/link-attrs.html url=program.url %}>{{ program.title }}<span class="pvo-visually-hidden"> (opens in a new tab)</span></a>
        <span class="pvo-resource__text">{{ program.text }}</span>
      </li>
      {%- endfor %}
    </ul>
  </section>
</div>
