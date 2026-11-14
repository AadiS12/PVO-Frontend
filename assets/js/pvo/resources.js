// Resource Hub: search box and category filter.

const search = document.querySelector('[data-resource-search]');
const filters = [...document.querySelectorAll('[data-resource-filter]')];
const groups = [...document.querySelectorAll('[data-resource-group]')];
const count = document.querySelector('[data-resource-count]');
const empty = document.querySelector('[data-resource-empty]');
let category = '';

function apply() {
  const words = search.value.toLowerCase().split(/\s+/).filter(Boolean);
  let shown = 0;
  groups.forEach((group) => {
    let groupShown = 0;
    group.querySelectorAll('[data-resource]').forEach((item) => {
      const text = item.textContent.toLowerCase();
      const match = (!category || group.dataset.resourceGroup === category) && words.every((word) => text.includes(word));
      item.hidden = !match;
      if (match) groupShown += 1;
    });
    group.hidden = groupShown === 0;
    shown += groupShown;
  });
  empty.hidden = shown > 0;
  count.textContent = words.length || category ? `Showing ${shown} resource${shown === 1 ? '' : 's'}` : '';
}

search?.addEventListener('input', apply);
filters.forEach((button) => {
  button.addEventListener('click', () => {
    category = button.dataset.resourceFilter;
    filters.forEach((other) => other.setAttribute('aria-pressed', String(other === button)));
    apply();
  });
});
