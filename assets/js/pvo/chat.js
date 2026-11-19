// Floating PVO assistant. Only active on pages whose front matter sets `chatbot: true`.
import { apiFetch, escapeHtml } from './api.js';

const FALLBACK = 'Sorry, I could not answer that right now. You can email '
  + '<a href="mailto:contact@powayveterans.org">contact@powayveterans.org</a> or call '
  + '<a href="tel:+18582068854">(858) 206-8854</a>.';

const STARTERS = ['How do I request help?', 'Upcoming events', 'How can I volunteer?', 'How do I donate?'];

function formatReply(text) {
  const html = escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  const lines = html.split('\n');
  const out = [];
  let list = [];
  const flush = () => {
    if (list.length) out.push(`<ul>${list.map((item) => `<li>${item}</li>`).join('')}</ul>`);
    list = [];
  };
  lines.forEach((line) => {
    const bullet = line.match(/^\s*[-•*]\s+(.*)$/);
    if (bullet) {
      list.push(bullet[1]);
    } else {
      flush();
      if (line.trim()) out.push(`<p>${line}</p>`);
    }
  });
  flush();
  return out.join('');
}

export function initChat() {
  const panel = document.querySelector('[data-chat]');
  const launch = document.querySelector('[data-chat-launch]');
  if (!panel || !launch) return;

  const log = panel.querySelector('[data-chat-log]');
  const form = panel.querySelector('[data-chat-form]');
  const input = panel.querySelector('[data-chat-input]');
  const send = panel.querySelector('[data-chat-send]');
  const history = [];
  let busy = false;
  let greeted = false;

  function addMessage(role, html, chips = []) {
    const message = document.createElement('div');
    message.className = `pvo-chat__msg pvo-chat__msg--${role}`;
    const bubble = document.createElement('div');
    bubble.className = 'pvo-chat__bubble';
    bubble.innerHTML = html;
    message.append(bubble);
    if (chips.length) {
      const row = document.createElement('div');
      row.className = 'pvo-chat__chips';
      chips.forEach((label) => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'small filledTinted primary'; // OCS button
        chip.textContent = label;
        chip.addEventListener('click', () => ask(label));
        row.append(chip);
      });
      message.append(row);
    }
    log.append(message);
    log.scrollTop = log.scrollHeight;
    return message;
  }

  function setOpen(open) {
    panel.hidden = !open;
    launch.setAttribute('aria-expanded', String(open));
    launch.hidden = open;
    if (open) {
      if (!greeted) {
        greeted = true;
        addMessage('bot', '<p>Hi, and thank you for stopping by. I can help with assistance requests, volunteering, donations, events, and how to reach PVO.</p>', STARTERS);
      }
      input.focus();
    } else {
      launch.focus();
    }
  }

  async function ask(text) {
    const question = text.trim();
    if (!question || busy) return;
    busy = true;
    send.disabled = true;
    input.value = '';
    addMessage('user', `<span>${escapeHtml(question)}</span>`);
    history.push({ role: 'user', content: question });
    const typing = addMessage('bot', '<span class="pvo-chat__typing" aria-label="Assistant is typing"><span></span><span></span><span></span></span>');

    const result = await apiFetch('/api/chat', { method: 'POST', body: { messages: history }, timeout: 45000 });
    typing.remove();
    const reply = result.ok ? result.data?.content?.[0]?.text : null;
    if (reply) {
      history.push({ role: 'assistant', content: reply });
      addMessage('bot', formatReply(reply));
    } else {
      history.pop();
      addMessage('bot', `<p>${FALLBACK}</p>`);
    }
    busy = false;
    send.disabled = false;
    input.focus();
  }

  launch.addEventListener('click', () => setOpen(true));
  panel.querySelector('[data-chat-close]').addEventListener('click', () => setOpen(false));
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    ask(input.value);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hidden) setOpen(false);
  });
  // Links to the stand-alone assistant page open the panel instead when it is available
  document.querySelectorAll('a[href$="/pvo-chatbot/"], [data-chat-open]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      setOpen(true);
    });
  });
}
