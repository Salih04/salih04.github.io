import { corridorLines, type Line } from "@/lib/facility";

/*
 * Entry → Control Room: the persistent visual reference.
 *
 * Three lines are lifted out of the entry's instrument (its top rule, the
 * shared time axis and its bottom rule) into a fixed layer that survives the
 * route change. They compress onto the axis while the entry recedes, travel
 * to the Control Room's corridor once it has mounted, then open with the
 * floor into the corridor's walls and hand over to the plan.
 *
 * The layer lives outside React (it must outlive the entry page) and removes
 * itself; every step has a timeout fallback.
 */

type Lines = { top: Line; axis: Line; bottom: Line };

/** Timing, in ms. Fold + travel + open stays under ~900ms including routing. */
export const BRIDGE = { fold: 200, travel: 180, open: 400 } as const;
const COMPRESS = 5;

let layer: HTMLDivElement | null = null;
let cleanup: number | undefined;

function place(el: HTMLElement, l: Line) {
  el.style.transform = `translate(${l.x}px, ${l.y}px)`;
  el.style.width = `${Math.max(0, l.w)}px`;
}

function draw(lines: Lines) {
  if (!layer) return;
  const [top, axis, bottom] = Array.from(layer.children) as HTMLElement[];
  place(top!, lines.top);
  place(axis!, lines.axis);
  place(bottom!, lines.bottom);
}

function compressed(axis: Line): Lines {
  return { top: { ...axis, y: axis.y - COMPRESS }, axis, bottom: { ...axis, y: axis.y + COMPRESS } };
}

export function removeBridge() {
  window.clearTimeout(cleanup);
  layer?.remove();
  layer = null;
}

/** Lift the entry instrument's lines into the bridge and fold them onto the axis. Returns false when there is no instrument. */
export function startBridge(): boolean {
  removeBridge();
  const field = document.querySelector<HTMLElement>(".trace__field");
  const axisEl = document.querySelector<HTMLElement>(".trace__axis");
  if (!field || !axisEl) return false;
  const f = field.getBoundingClientRect();
  const a = axisEl.getBoundingClientRect();
  const axis: Line = { x: f.left, y: Math.round(a.top + a.height / 2), w: f.width };

  layer = document.createElement("div");
  layer.className = "bridge";
  layer.setAttribute("aria-hidden", "true");
  for (const k of ["top", "axis", "bottom"]) {
    const i = document.createElement("i");
    i.className = `bridge__line bridge__line--${k}`;
    layer.appendChild(i);
  }
  document.body.appendChild(layer);
  draw({ top: { x: f.left, y: f.top, w: f.width }, axis, bottom: { x: f.left, y: f.bottom - 1, w: f.width } });
  layer.getBoundingClientRect(); // commit the start position before transitions apply
  // Next frame: compress onto the axis (the entry's bands fold at the same time).
  requestAnimationFrame(() => {
    if (!layer) return;
    layer.dataset.phase = "fold";
    draw(compressed(axis));
  });
  cleanup = window.setTimeout(removeBridge, 2500);
  return true;
}

/**
 * The Control Room has mounted: travel to the corridor, then open into its
 * walls as the floor opens. Falls back to the facility directory's head rule
 * on narrow screens, where there is no plan.
 */
export function landBridge() {
  if (!layer) return;
  const stage = document.querySelector<HTMLElement>(".facility__stage");
  const s = stage?.getBoundingClientRect();
  let target: Lines;
  let open = true;
  if (s && s.width > 0) {
    target = corridorLines(s);
  } else {
    const head = document.querySelector<HTMLElement>(".directory__head");
    const h = head?.getBoundingClientRect();
    if (!h || h.width === 0) return removeBridge();
    target = compressed({ x: h.left, y: h.bottom - 1, w: h.width });
    open = false;
  }
  layer.dataset.phase = "travel";
  draw(compressed(target.axis));
  window.clearTimeout(cleanup);
  cleanup = window.setTimeout(() => {
    if (!layer) return;
    layer.dataset.phase = "open";
    if (open) draw(target);
    else draw({ ...target, top: target.axis, bottom: target.axis });
    cleanup = window.setTimeout(removeBridge, BRIDGE.open + 40);
  }, BRIDGE.travel);
}
