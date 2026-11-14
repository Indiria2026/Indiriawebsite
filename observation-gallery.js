import { MAX_ZOOM, zoomAt, panBy, imageBounds, pointFraction } from './zoom-math.mjs';
import { t, onLanguageChange } from './i18n.js';

const NS = 'http://www.w3.org/2000/svg';
function svgNode(tag, attributes = {}) {
  const node = document.createElementNS(NS, tag);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, String(value));
  return node;
}

document.querySelectorAll('[data-observation]').forEach((link, index) => {
  const thumbnail = link.querySelector('img');
  const width = Number(link.dataset.width || thumbnail?.getAttribute('width'));
  const height = Number(link.dataset.height || thumbnail?.getAttribute('height'));
  if (!(width > 0 && height > 0)) return;
  const rotation = Number(link.dataset.rotation || 0);
  const crop = link.dataset.crop?.split(' ').map(Number);
  const rotated = rotation === 90 || rotation === 270;
  const displayWidth = crop ? crop[2] : (rotated ? height : width);
  const displayHeight = crop ? crop[3] : (rotated ? width : height);
  const initial = { width: displayWidth, height: displayHeight, x: 0, y: 0, scale: 1 };
  let view = { ...initial };
  const wrapper = document.createElement('div');
  wrapper.className = 'observation-zoom';
  wrapper.dataset.day = link.dataset.day;
  wrapper.dataset.gallery = link.dataset.gallery;
  wrapper.setAttribute('role', 'group');
  wrapper.setAttribute('aria-label', `${link.dataset.galleryTitle} · ${link.dataset.day}`);
  const frame = document.createElement('div');
  frame.className = 'observation-photo';
  frame.tabIndex = 0;
  frame.setAttribute('role', 'img');
  frame.setAttribute('aria-roledescription', 'fotografia ingrandibile');
  frame.setAttribute('aria-describedby', 'observation-zoom-help');
  frame.setAttribute('aria-label', `${link.dataset.alt || thumbnail?.alt || link.dataset.galleryTitle}. Invio per ingrandire, frecce per spostarsi, Esc per ripristinare.`);
  const canvas = svgNode('svg', { viewBox: `0 0 ${displayWidth} ${displayHeight}`, 'aria-hidden': 'true' });
  const defs = svgNode('defs');
  const clip = svgNode('clipPath', { id: `inline-photo-clip-${index}`, clipPathUnits: 'userSpaceOnUse' });
  clip.append(svgNode('rect', { width: displayWidth, height: displayHeight }));
  defs.append(clip);
  const group = svgNode('g', { 'clip-path': `url(#inline-photo-clip-${index})` });
  const photo = svgNode('image', { href: link.getAttribute('href'), width, height });
  // Display only: source pixels are preserved, including orientation from the PDF.
  if (crop) photo.setAttribute('transform', `translate(${-crop[0]} ${-crop[1]})`);
  else if (rotation === 90) photo.setAttribute('transform', `translate(${height} 0) rotate(90)`);
  else if (rotation === 270) photo.setAttribute('transform', `translate(0 ${width}) rotate(270)`);
  group.append(photo); canvas.append(defs, group); frame.append(canvas);
  const toolbar = document.createElement('div');
  toolbar.className = 'inline-zoom-tools';
  const makeButton = (text, label) => {
    const button = document.createElement('button');
    button.type = 'button'; button.textContent = text;
    button.setAttribute('aria-label', label); button.title = label;
    return button;
  };
  const minus = makeButton('−', 'Riduci ingrandimento');
  const plus = makeButton('+', 'Aumenta ingrandimento');
  const reset = makeButton('↺', 'Ripristina fotografia intera');
  const zoomLabel = document.createElement('output');
  zoomLabel.setAttribute('aria-label', 'Ingrandimento');
  zoomLabel.setAttribute('aria-live', 'off');
  toolbar.append(minus, zoomLabel, plus, reset);
  wrapper.append(frame, toolbar); link.replaceWith(wrapper);

  onLanguageChange(() => {
    wrapper.setAttribute('aria-label', `${t(link.dataset.galleryTitle)} · ${t(link.dataset.day)}`);
    frame.setAttribute('aria-roledescription', t('fotografia ingrandibile'));
    frame.setAttribute('aria-label', `${t(link.dataset.alt || thumbnail?.alt || link.dataset.galleryTitle)}. ${t('Invio per ingrandire, frecce per spostarsi, Esc per ripristinare.')}`);
    for (const [button, label] of [[minus, 'Riduci ingrandimento'], [plus, 'Aumenta ingrandimento'], [reset, 'Ripristina fotografia intera']]) {
      button.setAttribute('aria-label', t(label)); button.title = t(label);
    }
    zoomLabel.setAttribute('aria-label', t('Ingrandimento'));
  });

  const render = () => {
    canvas.setAttribute('viewBox', `${view.x} ${view.y} ${view.width / view.scale} ${view.height / view.scale}`);
    wrapper.classList.toggle('zoom-active', view.scale > 1.001);
    zoomLabel.textContent = `${Math.round(view.scale * 100)}%`;
    minus.disabled = reset.disabled = view.scale <= 1.001;
    plus.disabled = view.scale >= MAX_ZOOM - .001;
    if ([minus, plus, reset].some(button => button.disabled && document.activeElement === button)) frame.focus({ preventScroll: true });
  };
  const changeZoom = (scale, point = { x: .5, y: .5 }, anchor = null) => {
    view = zoomAt(view, scale, point.x, point.y, anchor); render();
  };
  const restore = () => { view = { ...initial }; render(); };
  const fraction = event => pointFraction(frame.getBoundingClientRect(), displayWidth, displayHeight, event.clientX, event.clientY);
  minus.addEventListener('click', () => changeZoom(view.scale / 1.4));
  plus.addEventListener('click', () => changeZoom(view.scale * 1.4));
  reset.addEventListener('click', restore);
  let suppressClickUntil = 0;
  frame.addEventListener('click', event => {
    if (Date.now() < suppressClickUntil) return;
    if (view.scale <= 1.001) changeZoom(2.5, fraction(event));
  });
  frame.addEventListener('wheel', event => {
    if (view.scale <= 1.001 || event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 300 : 1);
    changeZoom(view.scale * Math.exp(-Math.max(-100, Math.min(100, delta)) * .004), fraction(event));
  }, { passive: false });
  const pointers = new Map();
  let gesture = null;
  const beginGesture = () => {
    const points = [...pointers.values()];
    if (points.length >= 2) {
      const [a, b] = points;
      const point = fraction({ clientX: (a.x + b.x) / 2, clientY: (a.y + b.y) / 2 });
      gesture = { type: 'pinch', scale: view.scale, distance: Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)),
        anchor: { x: view.x + point.x * displayWidth / view.scale, y: view.y + point.y * displayHeight / view.scale } };
    } else if (points.length) gesture = { type: 'pan', x: points[0].x, y: points[0].y, view: { ...view } };
    else gesture = null;
  };
  frame.addEventListener('pointerdown', event => {
    if (view.scale <= 1.001 || (event.pointerType === 'mouse' && event.button !== 0)) return;
    event.preventDefault(); frame.focus({ preventScroll: true });
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    frame.setPointerCapture(event.pointerId); beginGesture();
    wrapper.classList.add('is-panning');
  });
  frame.addEventListener('pointermove', event => {
    if (!pointers.has(event.pointerId)) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const points = [...pointers.values()];
    if (gesture?.type === 'pinch' && points.length >= 2) {
      const [a, b] = points;
      const point = fraction({ clientX: (a.x + b.x) / 2, clientY: (a.y + b.y) / 2 });
      changeZoom(gesture.scale * Math.hypot(a.x - b.x, a.y - b.y) / gesture.distance, point, gesture.anchor);
      suppressClickUntil = Date.now() + 350;
    } else if (gesture?.type === 'pan') {
      const bounds = imageBounds(frame.getBoundingClientRect(), displayWidth, displayHeight);
      const dx = event.clientX - gesture.x, dy = event.clientY - gesture.y;
      view = panBy(gesture.view, dx / bounds.width, dy / bounds.height); render();
      if (Math.hypot(dx, dy) > 3) suppressClickUntil = Date.now() + 350;
    }
  });
  const endPointer = event => {
    if (!pointers.delete(event.pointerId)) return;
    if (frame.hasPointerCapture(event.pointerId)) frame.releasePointerCapture(event.pointerId);
    beginGesture();
    if (!pointers.size) wrapper.classList.remove('is-panning');
  };
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) frame.addEventListener(type, endPointer);
  frame.addEventListener('keydown', event => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    let handled = true;
    switch (event.key) {
      case 'Enter': case ' ': view.scale > 1.001 ? restore() : changeZoom(2.5); break;
      case '+': case '=': changeZoom(view.scale * 1.4); break;
      case '-': case '_': changeZoom(view.scale / 1.4); break;
      case 'Escape': case 'Home': case '0': restore(); break;
      case 'ArrowLeft': case 'ArrowRight': case 'ArrowUp': case 'ArrowDown':
        if (view.scale <= 1.001) { handled = false; break; }
        view = panBy(view, event.key === 'ArrowLeft' ? .12 : event.key === 'ArrowRight' ? -.12 : 0, event.key === 'ArrowUp' ? .12 : event.key === 'ArrowDown' ? -.12 : 0); render(); break;
      default: handled = false;
    }
    if (handled) event.preventDefault();
  });
  render();
});
