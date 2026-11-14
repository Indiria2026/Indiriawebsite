export const MAX_ZOOM = 5;
export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export function boundView(view) {
  const scale = clamp(view.scale, 1, MAX_ZOOM);
  return { ...view, scale,
    x: clamp(view.x, 0, view.width - view.width / scale),
    y: clamp(view.y, 0, view.height - view.height / scale) };
}
export function zoomAt(view, scale, fx = .5, fy = .5, anchor = null) {
  scale = clamp(scale, 1, MAX_ZOOM);
  const point = anchor || { x: view.x + fx * view.width / view.scale, y: view.y + fy * view.height / view.scale };
  return boundView({ ...view, scale, x: point.x - fx * view.width / scale, y: point.y - fy * view.height / scale });
}
export function panBy(view, dx, dy) {
  return boundView({ ...view, x: view.x - dx * view.width / view.scale, y: view.y - dy * view.height / view.scale });
}
export function imageBounds(rect, width, height) {
  const factor = Math.min(rect.width / width, rect.height / height);
  const w = width * factor, h = height * factor;
  return { left: rect.left + (rect.width - w) / 2, top: rect.top + (rect.height - h) / 2, width: w, height: h };
}
export function pointFraction(rect, width, height, clientX, clientY) {
  const bounds = imageBounds(rect, width, height);
  return { x: clamp((clientX - bounds.left) / bounds.width, 0, 1), y: clamp((clientY - bounds.top) / bounds.height, 0, 1) };
}
