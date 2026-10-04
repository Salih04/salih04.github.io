/*
 * Control Room floor-plan geometry, shared by the plan (labels, camera) and
 * the entry → Control Room transition. Pure: no DOM.
 *
 * The plan is drawn in plane units (1000 × 640) on a plane that mirrors the
 * CSS on .facility__stage / .facility__plane, in units of the stage width:
 * perspective 160cqw, a stage 0.48 tall, a plane 0.86 × 0.5504 centred at
 * (0.5, 0.22) and rotated 40° about X. Every length scales with the stage
 * width, so projected positions are constant percentages of the stage.
 */

export type PlanPoint = [number, number];

export const PLAN_W = 1000;
export const PLAN_H = 640;
export const TILT_DEG = 40;
const PERSPECTIVE = 1.6;
const STAGE_H = 0.48;
const PLANE_W = 0.86;
const PLANE_H = 0.5504;
const PLANE_CY = 0.22;

/** The corridor: its two walls and its centre line, in plane units. */
export const CORRIDOR = { top: 250, centre: 320, bottom: 390, left: 10, right: 990 } as const;

interface Camera {
  tilt: number;
  /** Plane translation in stage widths (tz toward the viewer). */
  tx: number;
  ty: number;
  tz: number;
}

const REST: Camera = { tilt: TILT_DEG, tx: 0, ty: 0, tz: 0 };

/** Where a plane point lands on the stage, in % of the stage's width and height. */
export function project([x, y]: PlanPoint, cam: Camera = REST): { left: number; top: number } {
  const a = (cam.tilt * Math.PI) / 180;
  const dx = (x / PLAN_W - 0.5) * PLANE_W;
  const dy = (y / PLAN_H - 0.5) * PLANE_H;
  const z = dy * Math.sin(a) + cam.tz;
  const s = PERSPECTIVE / (PERSPECTIVE - z);
  const X = 0.5 + (dx + cam.tx) * s;
  const Y = STAGE_H / 2 + (PLANE_CY + dy * Math.cos(a) + cam.ty - STAGE_H / 2) * s;
  return { left: X * 100, top: (Y / STAGE_H) * 100 };
}

/**
 * Walking toward a room: the plane moves toward the viewer (a dolly, so near
 * parts grow more than far ones), the tilt eases a few degrees, and the room
 * centre travels `pull` of the way to the middle of the view while its local
 * scale grows by `zoom`. Returns translations in stage widths (cqw / 100).
 */
export function dolly(centre: PlanPoint, { pull, zoom, tilt }: { pull: number; zoom: number; tilt: number }): Camera {
  const a = (tilt * Math.PI) / 180;
  const start = project(centre);
  const dx = (centre[0] / PLAN_W - 0.5) * PLANE_W;
  const dy = (centre[1] / PLAN_H - 0.5) * PLANE_H;
  const z = dy * Math.sin(a);
  const sRest = PERSPECTIVE / (PERSPECTIVE - dy * Math.sin((TILT_DEG * Math.PI) / 180));
  const sNew = sRest * zoom;
  const tz = PERSPECTIVE - z - PERSPECTIVE / sNew;
  const X = 0.5 + (start.left / 100 - 0.5) * (1 - pull);
  const Y = STAGE_H / 2 + ((start.top / 100) * STAGE_H - STAGE_H / 2) * (1 - pull);
  const tx = (X - 0.5) / sNew - dx;
  const ty = (Y - STAGE_H / 2) / sNew - (PLANE_CY + dy * Math.cos(a) - STAGE_H / 2);
  return { tilt, tx, ty, tz };
}

/** CSS transform for the plane under a camera. Same function list at rest and in motion. */
export function planeTransform(cam: Camera = REST): string {
  const f = (n: number) => `${(n * 100).toFixed(3)}cqw`;
  return `translate3d(${f(cam.tx)}, ${f(cam.ty)}, ${f(cam.tz)}) rotateX(${cam.tilt}deg)`;
}

export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface Line {
  x: number;
  y: number;
  w: number;
}

/** The corridor's walls and centre line in page pixels, for a stage at `stage`. */
export function corridorLines(stage: Rect): { top: Line; axis: Line; bottom: Line } {
  const line = (y: number): Line => {
    const l = project([CORRIDOR.left, y]);
    const r = project([CORRIDOR.right, y]);
    return {
      x: stage.left + (l.left / 100) * stage.width,
      y: stage.top + (l.top / 100) * stage.height,
      w: ((r.left - l.left) / 100) * stage.width,
    };
  };
  return { top: line(CORRIDOR.top), axis: line(CORRIDOR.centre), bottom: line(CORRIDOR.bottom) };
}
