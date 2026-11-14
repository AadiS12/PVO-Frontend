// Applies saved accessibility settings to <html> before the page paints, so a light theme
// or larger text never flashes in the default look. The toolbar itself is in a11y.js.
(function () {
  var KEY = 'pvoAccessibility';
  var ALLOWED = {
    text: ['lg', 'xl', 'xxl'],
    theme: ['light', 'warm', 'navy', 'contrast'],
  };
  var prefs = {};
  try {
    prefs = JSON.parse(window.localStorage.getItem(KEY) || '{}') || {};
  } catch (error) {
    prefs = {};
  }
  var root = document.documentElement;
  if (ALLOWED.text.indexOf(prefs.text) !== -1) root.setAttribute('data-pvo-text', prefs.text);
  if (ALLOWED.theme.indexOf(prefs.theme) !== -1) root.setAttribute('data-pvo-theme', prefs.theme);
  if (prefs.underline === true) root.setAttribute('data-pvo-underline', '');
  if (prefs.spacing === true) root.setAttribute('data-pvo-spacing', '');
  if (prefs.motion === true) root.setAttribute('data-pvo-motion', '');
}());
