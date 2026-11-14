// Read aloud for the accessibility toolbar. Speaks through the OCS TTSEngine
// (window.SitePreferences.speak, from assets/js/user-preferences.js).
//
// "Read this page" starts at the part of the page you are looking at and reads to the end,
// highlighting each paragraph. "Read selected text" reads only the text you highlighted.
//
// Chrome quirks this works around:
//  - speech longer than about 15 seconds can stop part-way, so text is spoken a sentence
//    or two at a time;
//  - if the page does not keep a reference to the utterance, Chrome may never report that
//    it finished, so the next part never starts;
//  - an utterance occasionally reports "interrupted" for no reason; reading carries on
//    unless the visitor pressed Stop;
//  - speechSynthesis.pause() does nothing on Android and some voices never resume after it,
//    so Pause stops the current sentence and Resume reads that sentence again.

const BLOCKS = 'h1, h2, h3, h4, p, li, dt, dd, label.switch, legend, .pvo-next__event, .pvo-resource, .pvo-recap';
const SKIP = '[hidden], [aria-hidden="true"], .pvo-visually-hidden, nav, dialog:not([open]), [data-a11y-panel], [data-reader], [data-chat]';
const MAX_CHUNK = 200;          // characters per utterance
const SELECTION_MEMORY = 120000; // a highlight made in the last 2 minutes still counts
const GAP_MS = 60;               // pause between utterances

function isVisible(element) {
  if (element.closest(SKIP)) return false;
  const style = window.getComputedStyle(element);
  return element.getClientRects().length > 0 && style.visibility !== 'hidden' && style.display !== 'none';
}

function textOf(element) {
  return (element.innerText || element.textContent || '').replace(/\s+/g, ' ').trim();
}

/** Readable blocks in the main content, outermost first, so nothing is read twice. */
export function readableBlocks(root = document.getElementById('main')) {
  if (!root) return [];
  const candidates = [...root.querySelectorAll(BLOCKS)].filter(isVisible);
  return candidates.filter((element) => {
    const parent = element.parentElement?.closest(BLOCKS);
    return !(parent && root.contains(parent) && candidates.includes(parent)) && textOf(element);
  });
}

/** Split text into pieces short enough for Chrome to speak reliably. */
export function chunkText(text) {
  const sentences = text.replace(/\s+/g, ' ').trim().match(/[^.!?]+[.!?]+["')\]]*\s*|[^.!?]+$/g) || [];
  const chunks = [];
  let current = '';
  const push = () => {
    if (current.trim()) chunks.push(current.trim());
    current = '';
  };
  sentences.forEach((sentence) => {
    if (sentence.length > MAX_CHUNK) {
      push();
      // a very long sentence: break at commas, then at spaces
      let rest = sentence;
      while (rest.length > MAX_CHUNK) {
        let cut = rest.lastIndexOf(', ', MAX_CHUNK);
        if (cut < MAX_CHUNK / 2) cut = rest.lastIndexOf(' ', MAX_CHUNK);
        if (cut <= 0) cut = MAX_CHUNK;
        chunks.push(rest.slice(0, cut + 1).trim());
        rest = rest.slice(cut + 1);
      }
      current = rest;
    } else if ((current + sentence).length > MAX_CHUNK) {
      push();
      current = sentence;
    } else {
      current += sentence;
    }
  });
  push();
  return chunks;
}

export function createReader({ getRate = () => 1, reduceMotion = () => false } = {}) {
  const supported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  const bar = document.querySelector('[data-reader]');
  const status = bar?.querySelector('[data-reader-status]');
  const pauseButton = bar?.querySelector('[data-reader-pause]');
  const stopButton = bar?.querySelector('[data-reader-stop]');

  let queue = [];
  let index = 0;            // the next piece to read
  let speakingIndex = null; // the piece being read right now, if any
  let current = null;
  let running = false;
  let paused = false;
  let session = 0;
  let activeUtterance = null; // kept so Chrome does not garbage-collect it mid-sentence
  let label = 'Reading aloud';
  let remembered = null;      // { text, range, time } of the last highlight on the page

  // Remember what the visitor highlighted, because pressing a button can clear it
  document.addEventListener('selectionchange', () => {
    const selection = window.getSelection();
    const text = selection ? selection.toString().trim() : '';
    if (!text || !selection.rangeCount) return;
    const node = selection.anchorNode?.nodeType === 1 ? selection.anchorNode : selection.anchorNode?.parentElement;
    if (node?.closest('[data-a11y-panel], [data-reader], [data-chat]')) return;
    remembered = { text, range: selection.getRangeAt(0).cloneRange(), time: Date.now() };
  });

  function speak(text, onDone) {
    const rate = getRate();
    const engine = window.SitePreferences;
    let utterance;
    if (window.speechSynthesis.paused) window.speechSynthesis.resume();
    if (engine && typeof engine.speak === 'function') {
      utterance = engine.speak(text, { rate }); // OCS TTSEngine
    } else {
      utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      window.speechSynthesis.speak(utterance);
    }
    activeUtterance = utterance;
    if (!utterance) {
      onDone();
      return;
    }
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      onDone();
    };
    utterance.onend = finish;
    utterance.onerror = finish; // carry on; pressing Stop is what ends reading
  }

  function highlight(element) {
    if (current) current.classList.remove('pvo-reading');
    current = element;
    if (!element) return;
    element.classList.add('pvo-reading');
    element.scrollIntoView({ block: 'center', behavior: reduceMotion() ? 'auto' : 'smooth' });
  }

  function showBar(show) {
    if (!bar) return;
    bar.hidden = !show;
    if (show) {
      paused = false;
      pauseButton.textContent = 'Pause';
      status.textContent = label;
    }
  }

  function finish() {
    running = false;
    paused = false;
    speakingIndex = null;
    activeUtterance = null;
    highlight(null);
    showBar(false);
  }

  function next(id) {
    if (id !== session || !running || paused) return;
    if (index >= queue.length) {
      finish();
      return;
    }
    const item = queue[index];
    speakingIndex = index;
    index += 1;
    if (item.element && item.element !== current) highlight(item.element);
    speak(item.text, () => {
      if (id !== session) return;
      speakingIndex = null;
      window.setTimeout(() => next(id), GAP_MS);
    });
  }

  function pause() {
    session += 1; // the cut-off sentence must not move reading on
    paused = true;
    if (speakingIndex !== null) index = speakingIndex; // read it again on Resume
    speakingIndex = null;
    window.speechSynthesis.cancel();
    pauseButton.textContent = 'Resume';
    status.textContent = 'Paused';
  }

  function resume() {
    paused = false;
    pauseButton.textContent = 'Pause';
    status.textContent = label;
    session += 1;
    const id = session;
    window.setTimeout(() => next(id), GAP_MS);
  }

  function start(items, statusLabel) {
    if (!supported || !items.length) return false;
    stop();
    session += 1;
    queue = items;
    index = 0;
    running = true;
    label = statusLabel;
    showBar(true);
    const id = session;
    window.setTimeout(() => next(id), GAP_MS); // give Chrome a moment after cancel()
    return true;
  }

  function stop() {
    session += 1;
    if (supported) window.speechSynthesis.cancel();
    finish();
  }

  function toItems(element, text) {
    return chunkText(text).map((piece) => ({ element, text: piece }));
  }

  /** Read from the first paragraph on screen to the end of the page. */
  function readPage() {
    const blocks = readableBlocks();
    const first = blocks.findIndex((element) => element.getBoundingClientRect().bottom > 80);
    const fromHere = first > 0 ? blocks.slice(first) : blocks;
    return start(fromHere.flatMap((element) => toItems(element, textOf(element))), 'Reading the page');
  }

  /** Read only the highlighted text. Returns false when nothing is highlighted. */
  function readSelection() {
    const selection = window.getSelection();
    let text = selection ? selection.toString().trim() : '';
    let range = text && selection.rangeCount ? selection.getRangeAt(0).cloneRange() : null;
    if (!text && remembered && Date.now() - remembered.time < SELECTION_MEMORY
      && remembered.range.commonAncestorContainer.isConnected) {
      ({ text, range } = remembered);
    }
    if (!text) return false;
    remembered = null; // a highlight is read once; highlight again to hear it again
    if (range) {
      // keep the words being read highlighted on the page
      selection.removeAllRanges();
      selection.addRange(range);
    }
    return start(toItems(null, text), 'Reading your selection');
  }

  pauseButton?.addEventListener('click', () => {
    if (!running) return;
    if (paused) resume();
    else pause();
  });
  stopButton?.addEventListener('click', stop);
  window.addEventListener('pagehide', stop);

  return { supported, readPage, readSelection, stop, isRunning: () => running };
}
