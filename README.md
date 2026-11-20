# Poway Veterans Organization — Website Redesign
### Project Handoff & Status Document

> **Status:** 🚧 Early Exploration / In Progress  
> **Last Updated:** May 2026

---

## Overview

This project is an early-stage redesign and digital tooling effort for the **Poway Veterans Organization (PVO)**. The goal is to modernize the organization's web presence and build AI-assisted tools that help veterans navigate eligibility, connect with volunteers, and get quick answers to common questions.

The three components built so far can be found on this website: https://pvo.opencodingsociety.com/

---

## Project Files

### 1. `pvo-chatbot.html` — AI Chatbot
An AI-powered chat interface built with the **Groq API**. Designed to give veterans a conversational way to ask questions about PVO services, eligibility, events, and resources.

- **Tech:** Plain HTML/CSS/JS + Groq API
- **Status:** ✅ Mostly complete — minor refinements may remain
- **Key decisions:** Groq was chosen for its fast inference speeds, which keeps the chat feel responsive and natural
- **To run:** Open `pvo-chatbot.html` directly in a browser. Requires a valid Groq API key set in the file.

---

### 2. `prescreener.md` — Eligibility Prescreener
A prescreener flow to help veterans (or their families) quickly determine whether they may qualify for PVO services or programs before submitting a full application.

- **Status:** 🚧 In Progress — connected to the Flask prediction API and SQLite submission store
- **Purpose:** Reduce friction for new applicants and filter inquiries before they reach staff
- **Current focus:** Integrating the **Gemini API** to extract data from uploaded veteran IDs, improving accuracy of eligibility determination
- **Format:** Markdown file

---

### 3. `volunteer.md` — Volunteer Application Form
A form spec for prospective volunteers to express interest, share availability, and describe relevant skills or military background.

- **Status:** ✅ Complete
- **Purpose:** Streamline volunteer intake and give coordinators structured data to work with
- **Format:** Markdown file

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Plain HTML, CSS, JavaScript |
| AI / Chat | [Groq API](https://groq.com) |
| AI / ID Extraction | [Gemini API](https://ai.google.dev) |
| Backend | Python / Flask |
| Database | SQLite |

---

## Local Teacher Demo

The eligibility flow is served by Jekyll and calls the Flask `/api/veteran/predict` endpoint. The API validates the answers, predicts a routing estimate, and saves a submission to SQLite. The result is only a prescreening aid; PVO must confirm eligibility.

1. In `PVO-Backend`, create/activate a Python virtual environment and install `requirements.txt` if needed.
2. Start the Flask backend:
   ```bash
   cd PVO-Backend
   python main.py
   ```
   The API listens at `http://localhost:8426`; startup creates the prescreener tables in `instance/pvo.db`.
3. In a second terminal, start the frontend:
   ```bash
   cd PVO-Frontend
   bundle install
   bundle exec jekyll serve --host 127.0.0.1 --port 4000
   ```
4. Open `http://127.0.0.1:4000/prescreener`. Complete the questions and confirm the result says it was saved as a live submission.
5. Check `http://localhost:8426/api/veteran/submissions?limit=1` to verify the saved response.

When deployed, the prescreener calls the PVO backend at `https://pvoteam-api.opencodingsociety.com`. If the live service is unavailable, the page labels the browser-only estimate and asks users to confirm with PVO.

### Capstone Requirements

The capstone goal—helping veterans and their families navigate PVO services—drives these requirements:

- Keep the eligibility flow short, mobile-friendly, and understandable without technical knowledge.
- Accept only the supported service-area, need, and household answers; explain next steps rather than promise eligibility.
- Send the completed answers to the Flask API, show a clear service/error state, and persist successful submissions for PVO follow-up.
- Minimize collection of sensitive information in the prescreener and have PVO staff validate the routing recommendations before relying on them.

## How to Run

Follow the **Local Teacher Demo** steps above to run the Jekyll frontend and Flask backend together. The chatbot also requires its configured Groq API key.
---

## What's Been Done

- [x] Volunteer form — complete
- [x] AI chatbot — mostly complete
- [x] Flask backend set up
- [x] SQLite database set up
- [x] Eligibility prescreener — connected to Flask prediction and SQLite persistence
- [x] Homepage hub with member login + survey at the top, member login page (with guest sessions), profile survey, admin tools, and community calendar
- [x] UI polish and mobile responsiveness for the PVO pages, built on the OCS design system
- [ ] Gemini API ID extraction and full end-to-end application submission
- [ ] Connect and validate all remaining forms against Flask routes and SQLite
- [ ] User testing with veterans

---

## Next Steps

### 🎨 UI Polish & Mobile Responsiveness
The current chatbot prototype is functional but unstyled for production. All three components need a cohesive visual design pass and should be fully responsive on mobile — many veterans access services from phones.

### 🗄️ Backend & Database Integration
A Flask backend and SQLite database are in place. The next milestone is wiring the volunteer form and prescreener up to it so that submissions are actually saved and accessible to staff.

### 👥 User Testing with Veterans
Before any wider rollout, the tools — especially the chatbot and prescreener — should be tested with real veterans and PVO staff to validate that the language, flow, and outputs actually serve their needs.

---

## PVO Site Structure

| Page | URL | Who can use it |
|---|---|---|
| Homepage: member login + survey bar, branches, hub, calendar | `/` | Everyone |
| Member Login: log in, create an account, continue as guest | `/member-login/` | Everyone |
| My Profile: the veteran profile survey (`#survey`), then the volunteer survey (`#volunteer-survey`) at the bottom | `/member-profile/` | Members and guests |
| Admin Tools: Events tab, and People & Roles (administrators only) | `/admin/` | Administrators and event organizers |
| Resource Hub (with the Veterans Crisis Line) | `/resources/` | Everyone |
| Employment Board | `/jobs/` | Everyone |
| Photos & Videos (pictures and clips from past events; the **Photos & videos** button on the homepage, or menu: Get Involved → Photos & videos) | `/gallery/` | Everyone |

- **Menu:** the header and footer links come from `pvo_menu` in `_config.yml`. Add, rename, or reorder items there; `children` makes a drop-down. Restart `jekyll serve` after editing `_config.yml`. Signed out, the header shows **Member Login**; signed in, it shows **Welcome, name**, **Admin** (administrators and event organizers), and **Log out**.
- **Layout:** PVO pages use `layout: pvo` (`_layouts/pvo.html`) with includes in `_includes/pvo/` (the homepage login/survey bar is `_includes/pvo/member-bar.html`).
- **Styles: Open Coding Society design system.** Pages are built from OCS ("Aesthetihawk") pieces, not custom ones:
  - Buttons: `<button class="medium filledHighlight primary">` and friends (`small/medium/large` + `primary`, `secondary`, `filledHighlight`, `filledTinted`). The same classes work on links.
  - Forms: OCS `.form-group` fields, `.login-container` / `.login-card` / `.signup-card`, and `.switch` toggles.
  - Materials: `.tintedGlass` (header, drop-downs) and `.glowOnHover` (branch and hub tiles).
  - Typography: semantic `h1`–`h3` and `p` with OCS's global fonts and colours. Do not restyle text.
  - The PVO Sass in `_sass/open-coding/pvo/` only does layout, using OCS mixins (`widget-container`, `header-bar`, `modal-container`, `select-control`, `status-indicator-state`, `hover-darken`) and OCS variables (`$bg-1`, `$blue1`, `$lightBlue1`, `$spacing-*`, `$radius-*`, `$breakpoint-*`). It is imported at the end of `_sass/open-coding/_main.scss`; every rule is scoped to `body.pvo` or a `pvo-` class, so the rest of the OCS site is unaffected. Do not add `<style>` blocks or inline styles to the pages.
- **Branches:** the seven branches at the top of the homepage come from `_data/pvo_branches.yml`. Their emblems are original drawings, not official seals. If PVO gets permission to use official insignia, add an `image:` path to each entry.
- **Scripts:** `assets/js/pvo/` (`site.js` runs on every PVO page; each page loads its own script through `pvo_script` in its front matter).
- **Resource Hub and Employment Board content:** edit `_data/pvo_resources.yml` and `_data/pvo_jobs.yml`. Only post real job openings, with the employer's permission. The board shows a note when there are none.
- **Photos & Videos:** once an event's date has passed, if it has a picture (uploaded, or a YouTube or `.mp4` link in the picture field) it appears on `/gallery/` and in "From recent events" on the homepage. Upcoming events stay on the calendar only.
- **Adding events:** sign in as an administrator or event organizer, open **Admin** in the header, and use **Post an event** (title, date, start/end time, place, description, optional picture or video). Published events appear on the homepage calendar right away.
- **Surveys:** the veteran profile survey (service, interests, how they like to meet up, about me, accessibility needs, and a consent switch for introductions) helps PVO connect veterans with shared interests. The volunteer survey (kinds of help, availability) is separate and optional. Each form saves only its own answers.
- **Log in:** members sign in with their **username** (any capitalisation) or the **email** on their account, not their display name. The backend refuses a login that matches more than one account.

### Accessibility toolbar

Every PVO page has an **Accessibility** button in the top bar and a round floating one in the bottom-left corner that stays on screen while scrolling. Settings are saved in the visitor's browser (`localStorage`, key `pvoAccessibility`) and applied before the page paints (`assets/js/pvo/a11y-boot.js`).

| Feature | How it works |
|---|---|
| Text size: 100%, 115%, 130%, 150% | Scales the root font size; PVO text and the OCS button/input sizes are in `rem` so they all grow. The header switches to the Menu button earlier at larger sizes. |
| Color theme: Dark (default OCS), Light, Warm, Navy, High contrast | `_sass/open-coding/pvo/_themes.scss` redefines the OCS CSS custom properties (`--bg-1`, `--panel-mid`, `--ui-border`, `--white1`, `--lightBlue1`, ...), the same ones the OCS ThemeEngine uses, so OCS components follow the theme. Every theme meets WCAG AA contrast. |
| Read aloud: read the page, or read selected text; pause, resume, stop; three speeds | **Read this page** starts at the first paragraph on screen and reads to the end, highlighting each block. **Read selected text** reads only what the visitor highlighted (a highlight from the last two minutes still counts if pressing the button cleared it). Speaks through the OCS TTSEngine (`window.SitePreferences.speak`) a sentence or two at a time, because Chrome cuts off long speech. Pause stops the current sentence and Resume reads it again, which also works on Android, where the browser's own pause does nothing. Code: `assets/js/pvo/reader.js`. |
| Reading aids: underline all links, extra line spacing, reduce motion | Switches in the panel (OCS `.switch` toggles). |
| Reset all | Back to the default OCS look. |

The Veterans Crisis Line (988, then press 1; text 838255) is in the footer of every PVO page and at the top of the Resource Hub.

### Roles

The stored role name (backend `users._role`) is on the left; the site shows the label in brackets.

| Role | Who | Can do |
|---|---|---|
| `Admin` (Administrator) | PVO administrators | Post, edit, and delete events (with a picture or video), and give anyone a role on **Admin → People & Roles**. Cannot change their own role. |
| `Organizer` (Event organizer) | People who run events | Post, edit, and delete events. Sees only the Events tab; cannot change roles. |
| `Veteran` (Veteran) | Veterans and service members | Member account: profile and surveys. |
| `Family` (Family member) | Family of a veteran | Member account. |
| `Volunteer` (Volunteer) | Volunteers and supporters | Member account. |
| `User` (Member) | Everyone else (the default) | Member account. |
| `Guest` (Guest) | "Continue as guest" | Temporary session; can fill out the survey. Removed after 7 days. Cannot be given a role. |

How people get a role:
- **Member types** (Veteran, Family member, Volunteer, Member) are chosen by the person: on the sign-up form ("I am joining as"), and again whenever they answer "Your connection to the military" in the profile survey (Veteran, Active duty, or Guard or Reserve → Veteran; Family member → Family member; Volunteer or supporter → Volunteer). The survey never changes an Administrator's, Event organizer's, or Guest's role.
- **Administrator and Event organizer** are only given by an administrator, on **Admin → People & Roles**. Sign-up refuses them.
- To make the first administrator, set `ADMIN_UID` / `ADMIN_PASSWORD` in the backend `.env` and run `flask custom generate_data`, or update `_role` to `Admin` for that user in the database.

The role names and labels the pages use are in `assets/js/pvo/api.js` (`roleLabel`, `MEMBER_TYPES`, `ASSIGNABLE_ROLES`). The backend must use the same names.

### Backend endpoints used by these pages

| Endpoint | Purpose |
|---|---|
| `POST /api/authenticate`, `DELETE /api/authenticate` | Sign in / sign out (JWT cookie) |
| `GET /api/id` | Current user and role |
| `POST /api/user/guest` | Create a member account (optional `role`: a member type) |
| `POST /api/guest/session` | Start a guest session |
| `GET`/`PUT /api/profile/survey` | Read / save the veteran profile and volunteer answers (new columns are added on startup). Saving `affiliation` also sets a member's member type. |
| `GET /api/events` | Public calendar |
| `POST /api/events`, `PUT`/`DELETE /api/events/<id>` | Admin or Organizer: manage events |
| `POST /api/events/image` | Admin or Organizer: upload an event picture |
| `GET /api/admin/users`, `PUT /api/admin/users/<uid>/role` | Admin: list people, change roles |

Backend tests for these live in `PVO-Backend/testing/test_pvo_community.py` (`venv/bin/python testing/test_pvo_community.py`).

---

## Notes for the Next Person

- The backend is **Flask (Python)** — keep dependencies minimal and documented in a `requirements.txt` so the next person can get up and running with `pip install -r requirements.txt`.
- The chatbot uses **Groq** (not OpenAI or Anthropic) — the API interface is similar but the base URL and model names differ. Check [Groq's docs](https://console.groq.com/docs) if you need to swap models. The Groq API key should be stored as an environment variable, never hardcoded.
- The [member login page](./navigation/member-login.md) creates username-based accounts through `/api/user/guest` and authenticates against the Flask backend's `/api/authenticate` endpoint. The backend sets the login cookie; PVO pages check `/api/id` for the signed-in user and role. Hiding admin links in the browser is only for convenience. The backend enforces who can post events and change roles.
- This is a volunteer/community project — keep solutions simple and maintainable by non-engineers where possible.

---

## Contact / Contributors

> *Alice Li @alicewrli009
> Brandon Cheah @BrandonCheah153*

---

*Poway Veterans Organization — Serving those who served.*
