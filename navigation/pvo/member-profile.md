---
layout: pvo
title: My Profile
permalink: /member-profile/
search_exclude: true
show_reading_time: false
pvo_script: /assets/js/pvo/profile.js
---

<div class="pvo-page-head">
  <div class="pvo-wrap">
    <span class="pvo-kicker">Members</span>
    <h1 class="pvo-page-head__title">My Profile</h1>
    <p>Build your veteran profile so PVO can connect you with veterans who share your interests. If you would like to help out, the volunteer survey is at the bottom of the page.</p>
  </div>
</div>

<div class="pvo-wrap pvo-account">
  <p class="pvo-loading" data-profile-loading>Checking your account…</p>

  <div class="pvo-card pvo-gate" data-profile-gate hidden>
    <h2 class="pvo-card__title" data-gate-title>Log in to fill out your profile</h2>
    <p data-gate-text>Your profile and survey answers are saved to your PVO account. You can also continue as a guest.</p>
    <div class="pvo-actions" data-gate-actions>
      <a class="medium filledHighlight primary" href="{{ '/member-login/' | relative_url }}?next={{ '/member-profile/' | relative_url | url_encode }}">Member Login</a>
      <a class="medium primary" href="{{ '/member-login/' | relative_url }}?next={{ '/member-profile/' | relative_url | url_encode }}#create">Create an account</a>
      <button class="medium filledTinted primary" type="button" data-gate-guest>Continue as guest</button>
    </div>
    <div class="pvo-status" role="status" aria-live="polite" data-gate-status></div>
  </div>

  <div class="pvo-profile" data-profile hidden>
    <aside class="pvo-card pvo-profile__card" aria-labelledby="profile-name">
      <span class="pvo-avatar" aria-hidden="true" data-profile-initials></span>
      <h2 class="pvo-profile__name" id="profile-name" data-profile-name></h2>
      <span class="pvo-profile__uid" data-profile-uid></span>
      <span class="pvo-badge" data-profile-role></span>
      <dl class="pvo-profile__facts" data-profile-facts></dl>
      <div class="pvo-notice" data-show="guest" hidden>You are using a temporary guest session. Answers are kept for about a week. <a href="{{ '/member-login/' | relative_url }}#create">Create an account</a> to keep them.</div>
      <nav class="pvo-profile__jump" aria-label="On this page">
        <a href="#survey">Veteran profile</a>
        <a href="#volunteer-survey">Volunteer survey</a>
      </nav>
      <div class="pvo-profile__links">
        <a class="medium primary" href="{{ '/admin/' | relative_url }}" data-show="staff" hidden>Admin Tools</a>
        <button class="medium secondary" type="button" data-pvo-signout>Log out</button>
      </div>
    </aside>

    <div class="pvo-profile__surveys">
      <section class="pvo-card pvo-survey" id="survey" aria-labelledby="survey-title">
        <div class="pvo-survey__head">
          <h2 class="pvo-card__title" id="survey-title">Your veteran profile</h2>
          <span class="pvo-survey__saved" data-saved="profile"></span>
        </div>
        <p>Tell us a little about yourself. PVO uses your profile to introduce you to veterans who share your interests and to plan meetups you will enjoy. Every question is optional, and your answers are never shown publicly.</p>

        <form class="pvo-survey__form" id="survey-form" data-survey-form="profile" novalidate>
          <fieldset class="pvo-fieldset">
            <legend>Your service</legend>
            <div class="pvo-form-row">
              <div class="form-group">
                <label for="survey-affiliation">Your connection to the military</label>
                <select id="survey-affiliation" name="affiliation">
                  <option value="">Choose one</option>
                  {%- assign affiliations = "Veteran|Active duty|Guard or Reserve|Family member|Volunteer or supporter" | split: "|" %}
                  {%- for option in affiliations %}
                  <option value="{{ option }}">{{ option }}</option>
                  {%- endfor %}
                </select>
                <span class="pvo-hint" id="survey-affiliation-hint" hidden data-member-type-hint>Your answer also sets the member type on your profile: Veteran, Family member, or Volunteer.</span>
              </div>
              <div class="form-group">
                <label for="survey-branch">Branch</label>
                <select id="survey-branch" name="branch">
                  <option value="">Choose one</option>
                  {%- for branch in site.data.pvo_branches %}
                  <option value="{{ branch.name }}">{{ branch.name }}</option>
                  {%- endfor %}
                  <option value="Did not serve">Did not serve / not applicable</option>
                </select>
              </div>
            </div>
            <div class="pvo-form-row">
              <div class="form-group">
                <label for="survey-era">When you served</label>
                <select id="survey-era" name="era">
                  <option value="">Choose one</option>
                  {%- assign eras = "World War II|Korea|Vietnam|Cold War|Gulf War (1990-1991)|Post-9/11 (Iraq, Afghanistan)|Peacetime service|Currently serving" | split: "|" %}
                  {%- for option in eras %}
                  <option value="{{ option }}">{{ option }}</option>
                  {%- endfor %}
                </select>
              </div>
              <div class="form-group">
                <label for="survey-years">Years of service</label>
                <input id="survey-years" name="service_years" type="number" min="0" max="80" step="1" inputmode="numeric">
              </div>
            </div>
          </fieldset>

          <fieldset class="pvo-fieldset">
            <legend>What do you enjoy?</legend>
            <span class="pvo-hint pvo-fieldset__hint">Pick anything you would like to do with other veterans.</span>
            {% include pvo/switch-list.html name="interests" options="Fishing|Hiking and the outdoors|Golf|Woodworking and building|Cars and motorcycles|Military history|Sports, watching or playing|Cards and board games|Coffee and conversation|Gardening|Faith and fellowship|Family activities" %}
          </fieldset>

          <fieldset class="pvo-fieldset">
            <legend>How would you like to meet up?</legend>
            {% include pvo/switch-list.html name="meetup" options="Coffee meetups|Group outings and day trips|Family-friendly events|Service projects together|Phone or text check-ins|Online video chats" %}
          </fieldset>

          <div class="form-group">
            <label for="survey-bio">About me</label>
            <textarea class="smallInput" id="survey-bio" name="bio" maxlength="1000" aria-describedby="survey-bio-hint survey-bio-count"></textarea>
            <span class="pvo-hint" id="survey-bio-hint">A few words other members would enjoy knowing: where you served, what you did, what you are into now.</span>
            <span class="pvo-hint" id="survey-bio-count" data-bio-count>0 / 1000</span>
          </div>

          <fieldset class="pvo-fieldset">
            <legend>Is there anything that would make meetups easier for you?</legend>
            {% include pvo/switch-list.html name="accessibility_needs" options="Wheelchair or mobility access|Hearing assistance|Vision assistance|Transportation to events|Large-print materials" green=true %}
          </fieldset>

          <fieldset class="pvo-fieldset pvo-consent">
            <legend>Meeting other members</legend>
            <label class="switch">
              <span class="toggle">
                <input type="checkbox" name="connect_ok" data-boolean>
                <span class="slider green"></span>
              </span>
              <span class="label-text">Yes, PVO may introduce me to members who share my interests.</span>
            </label>
            <span class="pvo-hint">A PVO coordinator makes the introduction. Your contact details are never shared without asking you first.</span>
          </fieldset>

          <div class="pvo-form-footer">
            <button class="large filledHighlight primary" type="submit">Save my profile</button>
            <div class="pvo-status" role="status" aria-live="polite" data-form-status></div>
          </div>
        </form>
      </section>

      <section class="pvo-card pvo-survey pvo-survey--volunteer" id="volunteer-survey" aria-labelledby="volunteer-survey-title">
        <div class="pvo-survey__head">
          <h2 class="pvo-card__title" id="volunteer-survey-title">Volunteer survey</h2>
          <span class="pvo-survey__saved" data-saved="volunteer"></span>
        </div>
        <p>Want to lend a hand? Tell us how you would like to help and when you are usually free, and a PVO coordinator will reach out. This is optional. For the full sign-up, use the <a href="{{ '/volunteer' | relative_url }}">volunteer form</a>.</p>

        <form class="pvo-survey__form" id="volunteer-form" data-survey-form="volunteer" novalidate>
          <fieldset class="pvo-fieldset">
            <legend>How would you like to help?</legend>
            {% include pvo/switch-list.html name="volunteer" options="Home repairs|Vehicle repairs|Yard work and cleanup|Driving veterans to appointments|Events and fundraisers|Phone calls and check-ins|Office help" %}
          </fieldset>

          <fieldset class="pvo-fieldset">
            <legend>When are you usually free?</legend>
            {% include pvo/switch-list.html name="volunteer_availability" options="Weekday mornings|Weekday afternoons|Weekday evenings|Weekends" %}
          </fieldset>

          <div class="pvo-form-footer">
            <button class="large filledHighlight primary" type="submit">Save volunteer answers</button>
            <div class="pvo-status" role="status" aria-live="polite" data-form-status></div>
          </div>
        </form>
      </section>
    </div>
  </div>
</div>
