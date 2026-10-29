import { baseurl, pythonURI, fetchOptions } from './api/config.js';

  document.addEventListener('DOMContentLoaded', () => {
    const accountLink = document.getElementById('account-link');
    const logoutButton = document.getElementById('logout-button');
    const memberDashboard = document.getElementById('member-dashboard');
    const memberGreeting = document.getElementById('member-greeting');
    const menuToggle = document.getElementById('menu-toggle');
    const primaryNavigation = document.getElementById('primary-navigation');

    menuToggle.addEventListener('click', () => {
      const isOpen = primaryNavigation.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    async function updateAccountLink() {
      try {
        const accountResponse = await fetch(`${pythonURI}/api/id`, {
          ...fetchOptions,
          headers: { ...fetchOptions.headers, Accept: 'application/json' }
        });

        if (accountResponse.ok) {
          const responseData = await accountResponse.json();
          const account = responseData.user || responseData.data || responseData;
          const accountName = account.name || account.uid;
          if (!accountName) {
            throw new Error('The account response did not include a name or user ID.');
          }
          accountLink.textContent = `Welcome, ${accountName}`;
          accountLink.href = `${baseurl}/profile`;
          logoutButton.hidden = false;
          memberGreeting.textContent = `Welcome back, ${accountName}`;
          memberDashboard.classList.add('is-visible');
        } else if (accountResponse.status !== 401) {
          throw new Error(`Account status request failed (${accountResponse.status}).`);
        }
      } catch (error) {
        accountLink.textContent = 'Member Login';
        accountLink.href = `${baseurl}/member-login/`;
        console.error('Could not check PVO login status:', error);
      }
    }
    updateAccountLink();
    window.addEventListener('pageshow', updateAccountLink);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        updateAccountLink();
      }
    });
    logoutButton.addEventListener('click', async () => {
    logoutButton.disabled = true;
    logoutButton.textContent = 'Logging out…';
    try {
      const response = await fetch(`${pythonURI}/api/authenticate`, {
        ...fetchOptions,
        method: 'DELETE',
        headers: { ...fetchOptions.headers, Accept: 'application/json' }
      });
      if (!response.ok) {
        const detail = await response.text();
        throw new Error(detail || `Logout failed (${response.status}).`);
      }
      window.location.assign(`${baseurl}/`);
    } catch (error) {
      console.error('PVO logout failed:', error);
      logoutButton.textContent = 'Logout failed — retry';
      logoutButton.disabled = false;
    }
    });
  });

  const widget = document.getElementById('pvoChatbotWidget');
  const fab = document.getElementById('pvoChatbotFab');
  const closeButton = document.getElementById('pvoChatbotClose');
  const messagesEl = document.getElementById('pvoChatbotMessages');
  const form = document.getElementById('pvoChatbotForm');
  const input = document.getElementById('pvoChatbotInput');
  const sendButton = document.getElementById('pvoChatbotSend');
  const openLinks = document.querySelectorAll('[data-chatbot-open]');

  let chatHistory = [];
  let chatLoading = false;
  let welcomeShown = false;

  function setChatOpen(open) {
    widget.classList.toggle('is-open', open);
    widget.setAttribute('aria-hidden', String(!open));
    widget.inert = !open;
    fab.setAttribute('aria-expanded', String(open));
    fab.setAttribute('aria-label', open ? 'Close PVO assistant' : 'Open PVO assistant');
    if (open) {
      showWelcome();
      window.setTimeout(() => input.focus(), 120);
    }
  }

  function showWelcome() {
    if (welcomeShown) return;
    welcomeShown = true;
    addChatMessage('bot',
      'Welcome, and thank you for your service!<br><br>I am the <strong>PVO Virtual Assistant</strong>. I can help with assistance requests, volunteering, donations, events, and contact information.',
      ['Apply for Assistance', 'Scholarships', 'Volunteer / Donate', 'Upcoming Events', 'Contact PVO']
    );
  }

  function addChatMessage(role, html, chips = []) {
    const message = document.createElement('div');
    message.className = `pvo-chatbot-message ${role}`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = role === 'bot' ? '🎖️' : '👤';

    const content = document.createElement('div');
    const bubble = document.createElement('div');
    bubble.className = 'pvo-chatbot-bubble';
    bubble.innerHTML = html;
    content.appendChild(bubble);

    if (chips.length) {
      const chipRow = document.createElement('div');
      chipRow.className = 'pvo-chatbot-chips';
      chips.forEach((chipText) => {
        const chip = document.createElement('button');
        chip.className = 'pvo-chatbot-chip';
        chip.type = 'button';
        chip.textContent = chipText;
        chip.addEventListener('click', () => sendChatMessage(chipText));
        chipRow.appendChild(chip);
      });
      content.appendChild(chipRow);
    }

    message.appendChild(avatar);
    message.appendChild(content);
    messagesEl.appendChild(message);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function formatChatResponse(text) {
    return escapeHtml(text)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/^[-•] (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>[\s\S]*<\/li>)/, '<ul style="padding-left:18px;margin-top:6px;display:flex;flex-direction:column;gap:4px">$1</ul>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');
  }

  function addTypingIndicator() {
    const message = document.createElement('div');
    message.className = 'pvo-chatbot-message bot';
    message.id = 'pvoChatbotTyping';
    message.innerHTML = '<div class="message-avatar">🎖️</div><div class="pvo-chatbot-bubble"><div class="pvo-chatbot-typing"><span></span><span></span><span></span></div></div>';
    messagesEl.appendChild(message);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  async function sendChatMessage(overrideText) {
    if (chatLoading) return;
    const text = (overrideText || input.value).trim();
    if (!text) return;

    input.value = '';
    addChatMessage('user', escapeHtml(text));
    chatHistory.push({ role: 'user', content: text });
    chatLoading = true;
    sendButton.disabled = true;
    addTypingIndicator();

    try {
      const response = await fetch(`${pythonURI}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatHistory })
      });
      const data = await response.json();
      document.getElementById('pvoChatbotTyping')?.remove();
      const reply = data.content?.[0]?.text || 'Sorry, I could not get a response. Please call (858) 206-8854.';
      chatHistory.push({ role: 'assistant', content: reply });
      addChatMessage('bot', formatChatResponse(reply));
    } catch (error) {
      document.getElementById('pvoChatbotTyping')?.remove();
      addChatMessage('bot', 'Sorry, something went wrong. Please <a href="mailto:contact@powayveterans.org">email us</a> or call (858) 206-8854.');
    } finally {
      chatLoading = false;
      sendButton.disabled = false;
      input.focus();
    }
  }

  fab.addEventListener('click', () => setChatOpen(!widget.classList.contains('is-open')));
  closeButton.addEventListener('click', () => setChatOpen(false));
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    sendChatMessage();
  });
  openLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      setChatOpen(true);
    });
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && widget.classList.contains('is-open')) {
      setChatOpen(false);
      fab.focus();
    }
  });
