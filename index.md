---
layout: base
title: Poway Veterans Organization
permalink: /
---

<link rel="stylesheet" href="{{ '/assets/css/pvo-home.css' | relative_url }}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,400;0,700;0,900;1,400&family=Source+Sans+3:wght@300;400;600;700&display=swap" rel="stylesheet">

<div class="pvo-site">

<!-- ANNOUNCEMENT BAR -->
<div class="announcement-bar">
  ★ &nbsp;PVO Student Platform &nbsp;·&nbsp;
  <a href="https://pvo.opencodingsociety.com/volunteer" target="_blank" rel="noopener">Volunteer Opportunities Available</a>
</div>

<!-- HEADER -->
<header>
  <div class="header-inner">
    <a class="logo-wrap" href="https://pvo.opencodingsociety.com/">
      <div class="logo-emblem">PVO</div>
      <div>
        <div class="logo-text-main">Poway Veterans Organization</div>
      </div>
    </a>
    <button class="menu-toggle" id="menu-toggle" type="button" aria-controls="primary-navigation" aria-expanded="false">Menu</button>
    <nav id="primary-navigation" aria-label="Primary navigation">
      {%- for item in site.minima.nav_items -%}
      {% if item.title != 'Member Login' %}
      <a href="{{ item.url | relative_url }}">{{ item.title | escape }}</a>
      {% endif %}
      {%- endfor -%}
      <a id="account-link" class="account-link" href="{{ '/member-login/' | relative_url }}">Member Login</a>
      <a href="#tools">Platform Tools</a>
      <a href="https://pvo.opencodingsociety.com/volunteer" target="_blank" rel="noopener">Volunteer</a>
      <button id="logout-button" class="logout-button" type="button" hidden>Log out</button>
      <a href="https://pvo.opencodingsociety.com/prescreener" target="_blank" rel="noopener" class="nav-cta">Check Eligibility</a>
    </nav>
  </div>
</header>

<section class="member-dashboard" id="member-dashboard" aria-live="polite">
  <div class="member-dashboard-inner">
    <div class="member-dashboard-copy">
      <strong id="member-greeting">Welcome back</strong>
      <span>Your Open Coding Society tools are ready.</span>
    </div>
    <div class="member-dashboard-links">
      <a href="{{ '/profile' | relative_url }}">Profile</a>
      <a href="{{ '/dashboard' | relative_url }}">Dashboard</a>
    </div>
  </div>
</section>

<!-- HERO -->
<section class="hero">
  <div class="hero-stars"></div>
  <div class="hero-tag">Serving Poway · Ramona · Surrounding Communities</div>
  <h1>Assisting <span>Poway's Veterans</span><br>with Technology &amp; Community</h1>
  <p class="hero-mission">Our mission is to provide assistance to veterans or their dependents residing in Poway, Ramona and the surrounding areas — now powered by student-built AI tools and volunteer coordination.</p>
  <div class="hero-actions">
    <a href="https://pvo.opencodingsociety.com/prescreener" class="btn-primary" target="_blank" rel="noopener">Apply for Assistance</a>
    <a href="#tools" class="btn-outline">Explore the Platform</a>
  </div>
</section>

<!-- MISSION STRIP -->
<div class="mission-strip">
  <p><strong>Student-built technology serving real veterans.</strong> Every tool on this platform was conceived, designed, and shipped by students at Open Coding Society — connecting veterans with resources, faster.</p>
</div>

<!-- PLATFORM TOOLS -->
<div class="section" id="tools">
  <div class="section-inner">
    <p class="section-eyebrow">Platform Tools</p>
    <h2 class="section-title">Three tools built for real impact</h2>
    <p class="section-desc">Explore these tools to better use our website</p>

    <div class="tool-grid">

      <!-- 01 Chatbot -->
      <a href="https://pvo.opencodingsociety.com/pvo-chatbot/" class="tool-card" data-chatbot-open>
        <div class="card-header">
          <span class="card-num">01 · AI Assistant</span>
          <div class="card-icon">💬</div>
          <h3 class="card-title-text">PVO Chatbot</h3>
        </div>
        <div class="card-body">
          <span class="card-category-tag">AI Assistant</span>
          <p class="card-desc-text">An AI assistant built directly into the platform. Ask it anything — about volunteering, navigating the site, or how to get started — and it responds instantly in plain language, no experience required.</p>
          <p class="card-highlight-box"><strong>Why it matters:</strong> Not everyone knows where to begin. The chatbot removes that friction and makes the platform accessible to any visitor.</p>
          <span class="card-link">Open Chatbot <svg viewBox="0 0 24 24" fill="none" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span>
        </div>
      </a>

      <!-- 02 Prescreener -->
      <a href="https://pvo.opencodingsociety.com/prescreener" class="tool-card" target="_blank" rel="noopener">
        <div class="card-header">
          <span class="card-num">02 · Fast Prescreener</span>
          <div class="card-icon">⭐</div>
          <h3 class="card-title-text">Veteran Eligibility Prescreener</h3>
        </div>
        <div class="card-body">
          <span class="card-category-tag">Fast Prescreener</span>
          <p class="card-desc-text">Veterans can instantly find out whether they qualify for PVO support Enter a few details and our trained machine learning model provides an immediate eligibility result.</p>
          <p class="card-highlight-box"><strong>Why it matters:</strong> Powered by real data, this tool gives veterans a clear, immediate answer — so the right people get connected to resources faster.</p>
          <span class="card-link">Check Eligibility <svg viewBox="0 0 24 24" fill="none" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span>
        </div>
      </a>

      <!-- 03 Volunteer Hub -->
      <a href="https://pvo.opencodingsociety.com/volunteer" class="tool-card" target="_blank" rel="noopener">
        <div class="card-header">
          <span class="card-num">03 · Community</span>
          <div class="card-icon">🤝</div>
          <h3 class="card-title-text">Volunteer Hub</h3>
        </div>
        <div class="card-body">
          <span class="card-category-tag">Community</span>
          <p class="card-desc-text">A dedicated space to find, sign up for, and track volunteer opportunities. It connects students who want to give back with the events and causes that need them most.</p>
          <p class="card-highlight-box"><strong>Why it matters:</strong> Community service is central to what Open Coding Society stands for. This tool turns good intentions into organized, real-world effort.</p>
          <span class="card-link">Get Involved <svg viewBox="0 0 24 24" fill="none" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span>
        </div>
      </a>

    </div>
  </div>
</div>

<hr class="rule-full" />

<!-- ABOUT -->
<div class="section" id="about">
  <div class="section-inner">
    <p class="section-eyebrow">About PVO</p>
    <h2 class="section-title">Poway Veterans Organization</h2>
    <div class="about-copy">
      <p>We are a group of veterans from the Poway area that established our organization in 2014. The mission of the Poway Veterans Organization (PVO) is to provide various types of assistance to veterans and their families residing in Poway, Ramona and surrounding areas. Our objective is to reach out to area veterans who are in need and to do what we can to help meet their needs. Specifically we are providing assistance in areas such as home repairs and upkeep, repairs on personal transportation vehicles and similar activities that are requested by the veterans/families that apply for our assistance.</p>
      <p>The PVO has no paid staff members, capital assets or buildings/equipment to maintain. We have a small storage shed located at Lake Poway where we keep various PVO materials, such as a pop-up that is used during our fund raising events. The City of Poway provides a secure facility for this storage shed at no cost to PVO.</p>
      <p>The PVO annual overhead costs for operation include purchasing required liability insurance for our volunteers and board members. We also pay annual fees for our web site and land-line telephone service. State and federal licensing/operation fees are also required annually. Miscellaneous costs (printing, stamps, etc) are kept to a minimum.</p>
      <p>By keeping PVO operating costs under rigid control, the PVO dedicates more than 95% of our funds to veteran assistance projects and providing financial donations to other veteran service organizations, such as the Disabled American Veterans. At all times we strive to be good stewards of funds donated by the friends of PVO.</p>
    </div>
  </div>
</div>

<!-- DONATE BANNER -->
<div class="donate-banner">
  <h2>Help Us Help Our Veterans</h2>
  <p>Your donations let us help more veterans in the Poway community. Every contribution makes a direct difference in the lives of those who served.</p>
  <a href="https://powayveterans.org/donate/" class="btn-primary" target="_blank" rel="noopener">Donate to PVO</a>
</div>

<!-- FOOTER -->
<footer>
  <div class="footer-inner">
    <div>
      <div class="footer-brand-name">Poway Veterans Organization</div>
      <p class="footer-tagline">Assisting veterans or their dependents in Poway, Ramona, and the surrounding areas.</p>
    </div>
    <div class="footer-links">
      <a href="https://pvo.opencodingsociety.com/pvo-chatbot/" data-chatbot-open>PVO Chatbot</a>
      <a href="https://pvo.opencodingsociety.com/prescreener" target="_blank" rel="noopener">Eligibility Prescreener</a>
      <a href="https://pvo.opencodingsociety.com/volunteer" target="_blank" rel="noopener">Volunteer Hub</a>
      <a href="https://powayveterans.org/" target="_blank" rel="noopener">PVO Main Site</a>
    </div>
  </div>
  <div class="footer-bottom">
    <span class="footer-copy">Open Coding Society &copy; 2025 &nbsp;·&nbsp; Platform built by students</span>
    <span class="footer-org-tag">PVO &nbsp;·&nbsp; 501(c)3 Organization</span>
  </div>
</footer>

<button class="pvo-chatbot-fab" id="pvoChatbotFab" type="button" aria-label="Open PVO assistant" aria-controls="pvoChatbotWidget" aria-expanded="false">🎖️</button>

<aside class="pvo-chatbot-widget" id="pvoChatbotWidget" aria-label="PVO Virtual Assistant" aria-hidden="true" inert>
  <div class="pvo-chatbot-topbar">
    <div class="pvo-chatbot-avatar">🎖️</div>
    <div class="pvo-chatbot-title">
      <strong>PVO Virtual Assistant</strong>
      <span>Help and site guide</span>
    </div>
    <button class="pvo-chatbot-close" id="pvoChatbotClose" type="button" aria-label="Close PVO assistant">&times;</button>
  </div>
  <div class="pvo-prescreener-strip">
    <div class="pvo-prescreener-copy">
      <strong>Veteran Eligibility Prescreener</strong>
      <span>Start with the quick eligibility check.</span>
    </div>
    <a class="pvo-prescreener-link" href="https://pvo.opencodingsociety.com/prescreener" target="_blank" rel="noopener">Check Eligibility</a>
  </div>
  <div class="pvo-chatbot-messages" id="pvoChatbotMessages" aria-live="polite"></div>
  <form class="pvo-chatbot-form" id="pvoChatbotForm">
    <input class="pvo-chatbot-input" id="pvoChatbotInput" type="text" placeholder="Ask about PVO..." autocomplete="off" />
    <button class="pvo-chatbot-send" id="pvoChatbotSend" type="submit" aria-label="Send message">
      <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
    </button>
  </form>
</aside>

</div>


<script type="module" src="{{ '/assets/js/pvo-home.js' | relative_url }}"></script>
