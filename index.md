---
layout: pvo
title: Poway Veterans Organization
description: Local veterans helping veterans and their families in Poway, Ramona, and the surrounding area.
permalink: /
chatbot: true
pvo_script: /assets/js/pvo/home.js
---

{% include pvo/member-bar.html %}

<section class="pvo-hero" aria-labelledby="pvo-hero-title">
  <div class="pvo-wrap pvo-hero__inner">
    <div class="pvo-hero__copy">
      <span class="pvo-kicker">Poway &middot; Ramona &middot; Since 2014</span>
      <h1 class="pvo-hero__title" id="pvo-hero-title">Veterans helping veterans, right here at home.</h1>
      <p class="pvo-hero__lede">We are a group of Poway-area veterans who help local veterans and their families with home repairs, vehicle repairs, and the everyday jobs that are hard to manage alone. There is no paid staff. More than 95% of what we raise goes straight to veterans.</p>
      <div class="pvo-hero__actions">
        <a class="large filledHighlight primary" href="{{ '/prescreener' | relative_url }}">Request assistance</a>
        <a class="large primary" href="{{ '/volunteer' | relative_url }}">Volunteer with us</a>
        <a class="large filledTinted primary" href="{{ '/gallery/' | relative_url }}">Photos &amp; videos</a>
      </div>
    </div>

    <div class="pvo-branches" aria-labelledby="pvo-branches-title">
      <div class="pvo-branches__head">
        <h2 class="pvo-branches__title" id="pvo-branches-title">Every branch. Every era.</h2>
        <span class="pvo-branches__intro">Whether you wore the uniform in 1968 or last year, this is your community.</span>
      </div>
      <ul class="pvo-branches__list">
        {%- for branch in site.data.pvo_branches %}
        <li class="pvo-branch pvo-branch--{{ branch.key }}">
          <a class="pvo-branch__link glowOnHover" href="{{ branch.url }}" target="_blank" rel="noopener">
            <span class="pvo-branch__medal">
              {%- if branch.image -%}
              <img src="{{ branch.image | relative_url }}" alt="">
              {%- else -%}
              {% include pvo/emblem.html name=branch.key %}
              {%- endif -%}
            </span>
            <span class="pvo-branch__name">{{ branch.name }}</span>
            <span class="pvo-branch__est">Est. {{ branch.established }}</span>
            <span class="pvo-branch__motto">{{ branch.motto }}</span>
            <span class="pvo-visually-hidden">(official site, opens in a new tab)</span>
          </a>
        </li>
        {%- endfor %}
      </ul>
    </div>
  </div>
</section>

<section class="pvo-next-bar" aria-labelledby="pvo-next-label">
  <div class="pvo-wrap">
    <div class="pvo-next">
      <span class="pvo-next__label" id="pvo-next-label">Next on the calendar</span>
      <div class="pvo-next__slot" data-next-event aria-live="polite">
        <span class="pvo-next__empty">Loading the calendar…</span>
      </div>
      <a class="medium filledTinted primary" href="#calendar">See the full calendar</a>
    </div>
  </div>
</section>

<section class="pvo-section pvo-hub" id="services" aria-labelledby="pvo-hub-title">
  <div class="pvo-wrap">
    <div class="pvo-section__head">
      <span class="pvo-kicker">Start here</span>
      <h2 class="pvo-section__title" id="pvo-hub-title">What you can do on this site</h2>
    </div>
    <ul class="pvo-hub__list">
      <li>
        <a class="pvo-hub__item glowOnHover" href="{{ '/prescreener' | relative_url }}">
          <span class="pvo-hub__icon">{% include pvo/icon.html name="hammer" %}</span>
          <span class="pvo-hub__name">Request assistance</span>
          <span class="pvo-hub__desc">Answer a few short questions about what you need. We will tell you whether PVO can take it on or point you to someone who can.</span>
          <span class="pvo-hub__go">Start a request</span>
        </a>
      </li>
      <li>
        <a class="pvo-hub__item glowOnHover" href="{{ '/resources/' | relative_url }}">
          <span class="pvo-hub__icon">{% include pvo/icon.html name="book" %}</span>
          <span class="pvo-hub__name">Resource Hub</span>
          <span class="pvo-hub__desc">Trusted help for health care, benefits, housing, work, and family, including the 24/7 Veterans Crisis Line.</span>
          <span class="pvo-hub__go">Find resources</span>
        </a>
      </li>
      <li>
        <a class="pvo-hub__item glowOnHover" href="{{ '/volunteer' | relative_url }}">
          <span class="pvo-hub__icon">{% include pvo/icon.html name="hands" %}</span>
          <span class="pvo-hub__name">Volunteer</span>
          <span class="pvo-hub__desc">Help repair a home, work a booth at a fundraiser, or give a neighbor a ride. Every skill level is useful.</span>
          <span class="pvo-hub__go">Sign up to help</span>
        </a>
      </li>
      <li>
        <a class="pvo-hub__item glowOnHover" href="{{ '/pvo-chatbot/' | relative_url }}" data-chat-open>
          <span class="pvo-hub__icon">{% include pvo/icon.html name="chat" %}</span>
          <span class="pvo-hub__name">Ask a question</span>
          <span class="pvo-hub__desc">Our assistant answers common questions about services, events, and how to reach us, any time of day.</span>
          <span class="pvo-hub__go">Open the assistant</span>
        </a>
      </li>
      <li>
        <a class="pvo-hub__item glowOnHover" href="{{ '/member-profile/' | relative_url }}#survey">
          <span class="pvo-hub__icon">{% include pvo/icon.html name="clipboard" %}</span>
          <span class="pvo-hub__name">Veteran profile</span>
          <span class="pvo-hub__desc">Share your service and interests so we can introduce you to veterans who enjoy the same things. Volunteers can sign up there too.</span>
          <span class="pvo-hub__go">Take the survey</span>
        </a>
      </li>
      <li>
        <a class="pvo-hub__item glowOnHover" href="{{ '/jobs/' | relative_url }}">
          <span class="pvo-hub__icon">{% include pvo/icon.html name="briefcase" %}</span>
          <span class="pvo-hub__name">Employment Board</span>
          <span class="pvo-hub__desc">Local openings from employers who want to hire veterans, plus programs for training and federal jobs.</span>
          <span class="pvo-hub__go">See the job board</span>
        </a>
      </li>
      <li>
        <a class="pvo-hub__item glowOnHover" href="{{ '/gallery/' | relative_url }}">
          <span class="pvo-hub__icon">{% include pvo/icon.html name="image" %}</span>
          <span class="pvo-hub__name">Photos &amp; videos</span>
          <span class="pvo-hub__desc">Photos and videos from past workdays, fundraisers, and get-togethers.</span>
          <span class="pvo-hub__go">See the photos</span>
        </a>
      </li>
      <li>
        <a class="pvo-hub__item glowOnHover" href="https://powayveterans.org/donate/" target="_blank" rel="noopener">
          <span class="pvo-hub__icon">{% include pvo/icon.html name="heart" %}</span>
          <span class="pvo-hub__name">Donate</span>
          <span class="pvo-hub__desc">Donations pay for materials and parts on assistance projects and support other veteran service organizations.</span>
          <span class="pvo-hub__go">Give to PVO</span>
        </a>
      </li>
      <li data-show="not-staff">
        <a class="pvo-hub__item glowOnHover" href="#calendar">
          <span class="pvo-hub__icon">{% include pvo/icon.html name="calendar" %}</span>
          <span class="pvo-hub__name">Events</span>
          <span class="pvo-hub__desc">Workdays, fundraisers, meetings, and get-togethers, all in one calendar.</span>
          <span class="pvo-hub__go">See the calendar</span>
        </a>
      </li>
      <li data-show="staff" hidden>
        <a class="pvo-hub__item glowOnHover" href="{{ '/admin/' | relative_url }}">
          <span class="pvo-hub__icon">{% include pvo/icon.html name="key" %}</span>
          <span class="pvo-hub__name">Admin tools</span>
          <span class="pvo-hub__desc">Post events with a picture and keep the calendar up to date. Administrators also manage member roles.</span>
          <span class="pvo-hub__go">Open admin</span>
        </a>
      </li>
    </ul>
  </div>
</section>

<section class="pvo-section pvo-section--alt pvo-calendar" id="calendar" aria-labelledby="pvo-calendar-title">
  <div class="pvo-wrap">
    <div class="pvo-section__head pvo-section__head--split">
      <div>
        <span class="pvo-kicker">Calendar</span>
        <h2 class="pvo-section__title" id="pvo-calendar-title">Events &amp; gatherings</h2>
      </div>
      <p class="pvo-section__note">Workdays, fundraisers, meetings, and get-togethers. Pick a day to see what is on, or open an event for details.</p>
    </div>

    <div class="pvo-calendar__layout" data-pvo-calendar>
      <div class="pvo-cal">
        <div class="pvo-cal__bar">
          <h3 class="pvo-cal__title" data-cal-title aria-live="polite">Calendar</h3>
          <div class="pvo-cal__controls">
            <button class="small primary pvo-cal__btn" type="button" data-cal-prev aria-label="Previous month">{% include pvo/icon.html name="chevron-left" %}</button>
            <button class="small primary" type="button" data-cal-today>Today</button>
            <button class="small primary pvo-cal__btn" type="button" data-cal-next aria-label="Next month">{% include pvo/icon.html name="chevron-right" %}</button>
          </div>
        </div>
        <table class="pvo-cal__grid">
          <thead><tr data-cal-head></tr></thead>
          <tbody data-cal-body></tbody>
        </table>
      </div>

      <div class="pvo-agenda">
        <div class="pvo-agenda__head">
          <h3 class="pvo-agenda__title" data-agenda-title>Coming up</h3>
          <button class="small filledTinted primary" type="button" data-agenda-all hidden>Show all upcoming</button>
        </div>
        <ol class="pvo-agenda__list" data-agenda-list></ol>
        <div class="pvo-agenda__status" data-agenda-status>Loading events…</div>
      </div>
    </div>
  </div>
</section>

<section class="pvo-section pvo-home-recaps" aria-labelledby="pvo-recaps-title" hidden data-home-recaps>
  <div class="pvo-wrap">
    <div class="pvo-section__head pvo-section__head--split">
      <div>
        <span class="pvo-kicker">Photos &amp; videos</span>
        <h2 class="pvo-section__title" id="pvo-recaps-title">From recent events</h2>
      </div>
      <a class="medium filledTinted primary" href="{{ '/gallery/' | relative_url }}">See all photos &amp; videos</a>
    </div>
    <ul class="pvo-recaps" data-recaps></ul>
  </div>
</section>

<section class="pvo-section pvo-about" id="about" aria-labelledby="pvo-about-title">
  <div class="pvo-wrap pvo-about__layout">
    <div class="pvo-about__text">
      <span class="pvo-kicker">About PVO</span>
      <h2 class="pvo-section__title" id="pvo-about-title">Local veterans, looking out for each other</h2>
      <p>We are a group of veterans from the Poway area who started this organization in 2014. Our mission is to provide assistance to veterans and their families living in Poway, Ramona, and the surrounding areas: to reach the veterans who need help, and do what we can to meet that need.</p>
      <p>Most of our work is hands-on. We help with home repairs and upkeep, repairs on personal vehicles, and similar jobs requested by the veterans and families who apply for assistance.</p>
      <p>PVO has no paid staff and no buildings or equipment to maintain. Our only overhead is volunteer liability insurance, our website and phone line, and required state and federal fees. That lets us put more than 95% of our funds into veteran assistance projects and into donations to other veteran service organizations, such as the Disabled American Veterans.</p>
    </div>
    <dl class="pvo-facts">
      <div class="pvo-facts__row"><dt>2014</dt><dd>Founded by Poway-area veterans</dd></div>
      <div class="pvo-facts__row"><dt>0</dt><dd>Paid staff. Everyone is a volunteer</dd></div>
      <div class="pvo-facts__row"><dt>95%+</dt><dd>Of funds go to veteran assistance</dd></div>
      <div class="pvo-facts__row"><dt>501(c)(3)</dt><dd>Registered nonprofit organization</dd></div>
    </dl>
  </div>
</section>

<section class="pvo-donate" aria-labelledby="pvo-donate-title">
  <div class="pvo-wrap pvo-donate__inner">
    <div>
      <h2 class="pvo-donate__title" id="pvo-donate-title">Help us help our veterans</h2>
      <p>Your donation buys lumber, parts, and supplies for veterans in our community. Every contribution goes to work locally.</p>
    </div>
    <div class="pvo-donate__actions">
      <a class="large filledHighlight primary" href="https://powayveterans.org/donate/" target="_blank" rel="noopener">Donate to PVO</a>
      <a class="large primary" href="{{ '/volunteer' | relative_url }}">Give your time</a>
    </div>
  </div>
</section>

{% include pvo/media-dialog.html %}
