import { english } from './translations-en.js';
import { chinese } from './translations-zh.js';

// Italian stays in the source HTML. Translations use local catalogues;
// switching language never replaces controls, photographs or their state.
const catalogues = { en: english, 'zh-Hans': chinese };
const locales = { it: 'it_IT', en: 'en_GB', 'zh-Hans': 'zh_CN' };
const hasTranslation = source => Object.values(catalogues).some(catalogue => Object.hasOwn(catalogue, source));
let language = 'it';
try {
  const saved = localStorage.getItem('indiria-language');
  if (Object.hasOwn(locales, saved)) language = saved;
} catch { /* The switch also works when browser storage is unavailable. */ }
const listeners = new Set();
export function t(source) { return catalogues[language]?.[source] ?? source; }
export function onLanguageChange(callback) { listeners.add(callback); callback(); }

const bindings = [];
const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT);
while (walker.nextNode()) {
  const node = walker.currentNode;
  if (node.parentElement?.closest('script, style')) continue;
  const original = node.textContent, key = original.trim();
  if (hasTranslation(key)) bindings.push(() => {
    node.textContent = original.replace(key, t(key));
  });
}
for (const element of document.querySelectorAll('[alt], [aria-label], [title], meta[content]')) {
  for (const attribute of ['alt', 'aria-label', 'title', 'content']) {
    const original = element.getAttribute(attribute);
    if (original && hasTranslation(original)) bindings.push(() => element.setAttribute(attribute, t(original)));
  }
}
for (const link of document.querySelectorAll('a[href^="mailto:"]')) {
  const original = link.getAttribute('href');
  if (original.includes('?subject=')) {
    const [address, subject] = original.split('?subject=');
    bindings.push(() => link.setAttribute('href', `${address}?subject=${encodeURIComponent(t(decodeURIComponent(subject)))}`));
  }
}
function renderLanguage() {
  document.documentElement.lang = language;
  document.querySelector('meta[property="og:locale"]').content = locales[language];
  bindings.forEach(update => update());
  document.querySelectorAll('[data-language]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.language === language));
  });
  listeners.forEach(update => update());
}
document.querySelectorAll('[data-language]').forEach(button => {
  button.addEventListener('click', () => {
    const next = button.dataset.language;
    if (!Object.hasOwn(locales, next) || next === language) return;
    language = next;
    try { localStorage.setItem('indiria-language', language); } catch { /* Optional persistence. */ }
    renderLanguage();
  });
});
renderLanguage();

document.querySelector('.language-switch').hidden = false;
