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

When deployed, the prescreener calls `https://flask.opencodingsociety.com`. If the live service is unavailable, the page labels the browser-only estimate and asks users to confirm with PVO.

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
- [ ] Gemini API ID extraction and full end-to-end application submission
- [ ] UI polish and mobile responsiveness
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

## Notes for the Next Person

- The backend is **Flask (Python)** — keep dependencies minimal and documented in a `requirements.txt` so the next person can get up and running with `pip install -r requirements.txt`.
- The chatbot uses **Groq** (not OpenAI or Anthropic) — the API interface is similar but the base URL and model names differ. Check [Groq's docs](https://console.groq.com/docs) if you need to swap models. The Groq API key should be stored as an environment variable, never hardcoded.
- The [member login page](./navigation/member-login.md) creates username-based accounts through `/api/user/guest` and authenticates against the Flask backend's `/api/authenticate` endpoint. The backend sets the login cookie; the PVO homepage checks `/api/id` to show the signed-in user's name. Authentication and authorization for any veteran data must still be enforced by the backend.
- This is a volunteer/community project — keep solutions simple and maintainable by non-engineers where possible.

---

## Contact / Contributors

> *Alice Li @alicewrli009
> Brandon Cheah @BrandonCheah153*

---

*Poway Veterans Organization — Serving those who served.*
