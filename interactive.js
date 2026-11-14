import './observation-gallery.js';
import { t, onLanguageChange } from './i18n.js';

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
function revealChange(element) {
  if (!reducedMotion.matches && element.animate) {
    element.animate([{ opacity: .65 }, { opacity: 1 }], { duration: 180, easing: 'ease-out' });
  }
}

// Reuse the original photo frames: no resampling, artificial alignment or recolouring.
const panels = [...document.querySelectorAll('[data-observation-panel]')];
const areaTabs = [...document.querySelectorAll('[data-observation-tab]')];
const selectionStatus = document.querySelector('#observation-selection-status');
const comparisons = new Map();
let activeArea = 'mani';

for (const panel of panels) {
  const area = panel.dataset.observationPanel;
  const sequence = panel.querySelector('.observation-sequence, .detail-sequence');
  const figures = [...sequence.children].filter(node => node.tagName === 'FIGURE');
  const days = figures.map(figure => figure.querySelector('.observation-zoom').dataset.day);
  let first = 0, last = days.length - 1, all = false;
  const controls = document.createElement('div'); controls.className = 'comparison-controls';
  const fields = document.createElement('div'); fields.className = 'comparison-fields';
  function field(labelText, name) {
    const label = document.createElement('label');
    const caption = document.createElement('span'); label.append(caption);
    const select = document.createElement('select'); select.id = `${area}-${name}`;
    label.htmlFor = select.id;
    days.forEach((day, i) => { const option = document.createElement('option'); option.value = i; select.append(option); });
    onLanguageChange(() => {
      caption.textContent = t(labelText);
      [...select.options].forEach((option, i) => { option.textContent = t(days[i]); });
    });
    label.append(select); fields.append(label); return select;
  }
  const start = field('Giorno iniziale', 'first-day');
  const end = field('Giorno successivo', 'last-day');
  const toggle = document.createElement('button'); toggle.type = 'button'; toggle.className = 'comparison-toggle btn';
  toggle.setAttribute('aria-controls', `${area}-sequence`); sequence.id = `${area}-sequence`;
  controls.append(fields, toggle); sequence.before(controls);
  function render(animate = true) {
    start.value = String(first); end.value = String(last);
    [...start.options].forEach((option, i) => { option.disabled = i === days.length - 1; });
    [...end.options].forEach((option, i) => { option.disabled = i === 0; });
    fields.hidden = all;
    toggle.textContent = t(all ? 'Confronta due giorni' : 'Mostra tutti i giorni');
    toggle.setAttribute('aria-expanded', String(all));
    sequence.classList.toggle('is-comparing', !all);
    figures.forEach((figure, i) => { figure.hidden = !all && i !== first && i !== last; });
    if (area === activeArea) selectionStatus.textContent = `${t(area === 'mani' ? 'Mani' : area === 'gomiti' ? 'Gomiti' : 'Piedi e talloni')}: ${all ? t('tutti i giorni') : `${t(days[first])} ${t('e')} ${t(days[last])}`}.`;
    if (animate) revealChange(sequence);
  }
  start.addEventListener('change', () => {
    first = Number(start.value); if (first >= last) last = first + 1; render();
  });
  end.addEventListener('change', () => {
    last = Number(end.value); if (last <= first) first = last - 1; render();
  });
  toggle.addEventListener('click', () => { all = !all; render(); });
  panel.setAttribute('role', 'tabpanel'); panel.setAttribute('aria-labelledby', `obs-tab-${area}`);
  comparisons.set(area, { render }); render(false);
  onLanguageChange(() => render(false));
}

function selectObservationArea(area, focus = false) {
  if (!comparisons.has(area)) return;
  activeArea = area;
  panels.forEach(panel => {
    const selected = panel.dataset.observationPanel === area;
    panel.hidden = !selected;
    if (selected) {
      document.querySelector('#observation-context').textContent = t(panel.dataset.observationContext);
      revealChange(panel);
    }
  });
  areaTabs.forEach(tab => {
    const selected = tab.dataset.observationTab === area;
    tab.setAttribute('aria-selected', String(selected)); tab.tabIndex = selected ? 0 : -1;
    if (selected && focus) tab.focus({ preventScroll: true });
  });
  comparisons.get(area).render(false);
}
areaTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectObservationArea(tab.dataset.observationTab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % areaTabs.length;
    else if (event.key === 'ArrowLeft') next = (index + areaTabs.length - 1) % areaTabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = areaTabs.length - 1;
    else return;
    event.preventDefault(); selectObservationArea(areaTabs[next].dataset.observationTab, true);
  });
});
document.querySelector('.observation-area-tabs').hidden = false;
document.querySelector('#osservazioni').classList.add('observations-interactive');
selectObservationArea('mani');
onLanguageChange(() => {
  const panel = panels.find(item => item.dataset.observationPanel === activeArea);
  document.querySelector('#observation-context').textContent = t(panel.dataset.observationContext);
});

const areas = {
  mani: { title: 'La pelle delle mani.', copy: 'Per la pelle secca e ruvida del dorso delle mani, il progetto punta a morbidezza e a un aspetto più levigato. Esplora gli scatti dei giorni 1, 3 e 7.', product: 'corpo', observation: 'mani' },
  gomiti: { title: 'Le zone ruvide dei gomiti.', copy: 'Nei gomiti, secchezza e squame possono rendere la superficie irregolare. Il progetto della crema corpo nasce anche per ammorbidire queste aree. Guarda la sequenza dei giorni 0, 3 e 7.', product: 'corpo', observation: 'gomiti' },
  piedi: { title: 'Pianta dei piedi e talloni.', copy: 'Una zona soggetta a pressione e sfregamento, dove la pelle può risultare secca e ruvida. Esplora le fotografie dei giorni 0, 2 e 4 e il progetto della crema corpo.', product: 'corpo', observation: 'piedi' },
  capelli: { title: 'Tra i capelli, sulla cute.', copy: 'Stiamo studiando una formula da distribuire direttamente sul cuoio capelluto, con attenzione alla facilità di applicazione e ai residui sui capelli.', product: 'capelli' },
  delicate: { title: 'Viso e zone delicate.', copy: 'La ricerca si estende al viso e alla cute delle zone intime esterne. La formulazione e la destinazione d’uso saranno definite attraverso verifiche specifiche per queste aree.', product: 'delicate' }
};
const productRoutes = { corpo: ['#crema-corpo', 'Esplora la crema corpo'], capelli: ['#cuoio-capelluto', 'Esplora il progetto cuoio capelluto'], delicate: ['#zone-delicate', 'Esplora il progetto zone delicate'] };
let selectedBodyArea = 'mani';
function renderBodyArea(animate = false) {
    const area = areas[selectedBodyArea];
    document.querySelectorAll('[data-area]').forEach(item => item.setAttribute('aria-pressed', String(item.dataset.area === selectedBodyArea)));
    document.querySelector('#area-name').textContent = t(area.title);
    document.querySelector('#area-copy').textContent = t(area.copy);
    document.querySelector('#area-stage').textContent = t(area.product === 'corpo' ? 'Crema corpo · Prototipo' : 'Formulazione dedicata · In sviluppo');
    const observation = document.querySelector('#area-observations');
    observation.hidden = !area.observation; observation.dataset.observationTarget = area.observation || '';
    const product = document.querySelector('#area-product');
    product.dataset.product = area.product; product.href = productRoutes[area.product][0];
    product.replaceChildren(document.createTextNode(t(productRoutes[area.product][1]) + ' '));
    const arrow = document.createElement('span'); arrow.setAttribute('aria-hidden', 'true'); arrow.textContent = '↗'; product.append(arrow);
    if (animate) revealChange(document.querySelector('#area-content'));
}
document.querySelectorAll('[data-area]').forEach(button => {
  button.addEventListener('click', () => {
    selectedBodyArea = button.dataset.area;
    renderBodyArea(true);
  });
});
onLanguageChange(() => renderBodyArea());
document.querySelector('#area-observations').addEventListener('click', event => {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  selectObservationArea(event.currentTarget.dataset.observationTarget, true);
});

// Current location changes silently; scrolling remains native.
const navLinks = [...document.querySelectorAll('#site-nav a[href^="#"]')];
const navSections = navLinks.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
let scheduled = false;
function markLocation() {
  const edge = document.querySelector('.sitehead').getBoundingClientRect().bottom + 120;
  let current = null;
  for (const section of navSections) if (section.getBoundingClientRect().top <= edge) current = section.id;
  navLinks.forEach(link => {
    if (link.hash === `#${current}`) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
  });
  scheduled = false;
}
window.addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(markLocation); } }, { passive: true });
window.addEventListener('resize', markLocation);
markLocation();

document.querySelectorAll('.faq-list details').forEach(item => {
  item.addEventListener('toggle', () => {
    item.querySelector('summary span').textContent = item.open ? '−' : '+';
    if (item.open) revealChange(item.querySelector('div'));
  });
});
