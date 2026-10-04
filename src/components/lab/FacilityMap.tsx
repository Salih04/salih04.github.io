"use client";

import { useEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactElement } from "react";
import { LabLink } from "@/components/shell/LabLink";
import { useLab } from "@/components/shell/LabProvider";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import { ArchiveGlyph, FinanceGlyph, NotesGlyph, SamsGlyph, VaultGlyph } from "./Glyphs";

export type RoomId = "sams" | "financeiq" | "archive" | "vault" | "notes";

export interface Room {
  id: RoomId;
  index: string;
  area: string;
  title: string;
  href: string;
  status: string;
  tone: "signal" | "research" | "neutral";
}

/* ---- Floor plan geometry (plane units: 1000 × 640) -------------------- */

interface Space {
  rect: [number, number, number, number];
  centre: [number, number];
  /** Where the upright label's left edge stands, in plane units. */
  label: [number, number];
  /** Route from the control room to the room's doorway. */
  wire: string;
}

const HUB: [number, number] = [500, 320];

const SPACES: Record<RoomId, Space> = {
  sams: { rect: [10, 10, 490, 240], centre: [255, 130], label: [44, 214], wire: "M500 320 H260 V250" },
  financeiq: { rect: [500, 10, 490, 240], centre: [745, 130], label: [534, 214], wire: "M500 320 H740 V250" },
  archive: { rect: [10, 390, 330, 240], centre: [175, 510], label: [40, 404], wire: "M500 320 H175 V390" },
  vault: { rect: [340, 390, 320, 240], centre: [500, 510], label: [370, 404], wire: "M500 320 V390" },
  notes: { rect: [660, 390, 330, 240], centre: [825, 510], label: [690, 404], wire: "M500 320 H825 V390" },
};

const GLYPHS: Record<RoomId, typeof SamsGlyph> = { sams: SamsGlyph, financeiq: FinanceGlyph, archive: ArchiveGlyph, vault: VaultGlyph, notes: NotesGlyph };

/*
 * Projection that mirrors the CSS on .facility__stage / .facility__plane, in
 * units of the stage width: perspective 160cqw, a stage 0.48 tall, a plane
 * 0.86 × 0.5504 centred at (0.5, 0.22) and rotated 40° about X. Every length
 * scales with the stage width, so label positions are constant percentages.
 */
const TILT = (40 * Math.PI) / 180;
const PERSPECTIVE = 1.6;
const STAGE_H = 0.48;
const PLANE_W = 0.86;
const PLANE_H = 0.5504;
const PLANE_CY = 0.22;

export function project([x, y]: [number, number]): { left: number; top: number } {
  const dx = (x / 1000 - 0.5) * PLANE_W;
  const dy = (y / 640 - 0.5) * PLANE_H;
  const y1 = dy * Math.cos(TILT);
  const z = dy * Math.sin(TILT);
  const s = PERSPECTIVE / (PERSPECTIVE - z);
  const X = 0.5 + dx * s;
  const Y = STAGE_H / 2 + (PLANE_CY + y1 - STAGE_H / 2) * s;
  return { left: X * 100, top: (Y / STAGE_H) * 100 };
}

/* Camera: the room's boundary strengthens and the others dim, then the view walks toward it. */
const FOCUS_MS = 140;
const MOVE_MS = 520;
const CAMERA_SCALE = 1.32;
/** How far the room centre travels toward the middle of the view (0–1). */
const CAMERA_PULL = 0.62;

/** Walls as poché: thick dark strokes with doorway gaps. */
function Walls() {
  return (
    <g className="plan__walls">
      <rect x="10" y="10" width="980" height="620" className="plan__outer" />
      <path d="M10 250 H220 M300 250 H700 M780 250 H990" />
      <path d="M500 10 V250" />
      <path d="M10 390 H140 M210 390 H465 M535 390 H790 M860 390 H990" />
      <path d="M340 390 V630 M660 390 V630" />
      <path className="plan__door" d="M220 250 A80 80 0 0 0 300 250 M700 250 A80 80 0 0 0 780 250" />
      <path className="plan__door" d="M140 390 A70 70 0 0 1 210 390 M465 390 A70 70 0 0 1 535 390 M790 390 A70 70 0 0 1 860 390" />
    </g>
  );
}

/** Grid bubbles along the far edge, as on an architectural drawing. */
function GridMarks() {
  return (
    <g className="plan__marks">
      {["A", "B", "C", "D", "E"].map((l, i) => {
        const x = 10 + i * 245;
        return (
          <g key={l}>
            <path d={`M${x} -6 V-22`} />
            <circle cx={x} cy={-36} r={13} />
            <text x={x} y={-31}>
              {l}
            </text>
          </g>
        );
      })}
    </g>
  );
}

/* ---- What each room contains, drawn on its floor ---------------------- */

/** Agent Systems Lab: an event rail, an agent beneath it, an occasional signal. */
function SamsFloor() {
  const nodes = [110, 180, 250, 320, 390];
  return (
    <g className="floor floor--sams">
      <path className="floor__rail" d="M60 82 H440" />
      {nodes.map((x, i) => (
        <g key={x} className="floor__ev" data-head={i === nodes.length - 1 || undefined}>
          <rect x={x - 7} y={75} width={14} height={14} />
          <text x={x} y={62}>
            {String(41 + i).padStart(3, "0")}
          </text>
        </g>
      ))}
      <path className="floor__drop" d="M250 89 V128" />
      <circle className="floor__agent" cx={250} cy={142} r={13} />
      <text className="floor__note" x={272} y={147}>
        agent
      </text>
      <path className="floor__client" d="M383 104 l7 -10 l7 10 z" />
      <text className="floor__note floor__note--client" x={404} y={108}>
        client
      </text>
      <circle className="floor__pulse" cx={60} cy={82} r={5} />
    </g>
  );
}

/** Market Data Lab: a small point-in-time timeline with an as-of line and a hatched future. */
function FinanceFloor() {
  return (
    <g className="floor floor--fiq">
      <rect className="floor__future" x={800} y={40} width={160} height={132} />
      <path className="floor__axis" d="M540 172 H960" />
      {Array.from({ length: 17 }, (_, i) => (
        <path key={i} className="floor__axis" d={`M${560 + i * 25} 172 v${i % 4 ? 5 : 9}`} />
      ))}
      <path className="floor__lag" d="M630 62 H750" />
      <circle className="floor__period" cx={630} cy={62} r={7} />
      <circle className="floor__known" cx={750} cy={62} r={7} />
      <text className="floor__note" x={618} y={86}>
        report
      </text>
      <text className="floor__note" x={720} y={86}>
        available
      </text>
      <path className="floor__lag floor__lag--later" d="M760 110 H910" />
      <circle className="floor__period" cx={760} cy={110} r={7} />
      <circle className="floor__known floor__known--later" cx={910} cy={110} r={7} />
      <path className="floor__asof" d="M800 34 V180" />
      <text className="floor__note floor__note--asof" x={810} y={56}>
        as of
      </text>
    </g>
  );
}

function ArchiveFloor() {
  return (
    <g className="floor floor--archive">
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${148 + i * 16} ${494 + i * 12})`}>
          <rect className="floor__sheet" width={130} height={86} />
          <path className="floor__ink" d="M14 18 H96 M14 32 H116 M14 46 H80 M14 60 H104" />
        </g>
      ))}
    </g>
  );
}

function VaultFloor() {
  return (
    <g className="floor floor--vault">
      {[0, 1].map((r) =>
        [0, 1, 2, 3].map((c) => (
          <g key={`${r}-${c}`} transform={`translate(${372 + c * 66} ${500 + r * 58})`}>
            <rect className="floor__drawer" width={56} height={46} />
            <path className="floor__ink" d="M20 10 H36" />
            {(r + c) % 3 !== 2 ? <circle className="floor__specimen" cx={28} cy={30} r={9} /> : null}
          </g>
        )),
      )}
    </g>
  );
}

function NotesFloor() {
  return (
    <g className="floor floor--notes">
      {[0, 1].map((i) => (
        <g key={i} transform={`translate(${770 + i * 64} ${490 + i * 8}) rotate(${i ? 4 : -3})`}>
          <rect className="floor__sheet" width={104} height={124} />
          <path className="floor__ink" d="M14 22 H88 M14 38 H84 M14 54 H90 M14 70 H60 M14 86 H82" />
        </g>
      ))}
    </g>
  );
}

const FLOORS: Record<RoomId, () => ReactElement> = { sams: SamsFloor, financeiq: FinanceFloor, archive: ArchiveFloor, vault: VaultFloor, notes: NotesFloor };

export function FacilityMap({ rooms }: { rooms: Room[] }) {
  const { navigate } = useLab();
  const [active, setActive] = useState<RoomId | null>(null);
  const [selected, setSelected] = useState<RoomId | null>(null);
  const [camera, setCamera] = useState<CSSProperties | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const enter = (room: Room) => (e: MouseEvent) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    if (selected) return;
    const stage = stageRef.current;
    if (!stage || prefersReducedMotion()) {
      navigate(room.href);
      return;
    }
    // 1. The room's boundary strengthens and the others dim.
    setSelected(room.id);
    setActive(room.id);
    // 2. The view walks toward the room, then the route changes.
    const r = stage.getBoundingClientRect();
    const p = project(SPACES[room.id].centre);
    const ox = (p.left / 100) * r.width;
    const oy = (p.top / 100) * r.height;
    timers.current.push(
      window.setTimeout(() => {
        setCamera({
          transformOrigin: `${ox}px ${oy}px`,
          transform: `translate(${(r.width / 2 - ox) * CAMERA_PULL}px, ${(r.height / 2 - oy) * CAMERA_PULL}px) scale(${CAMERA_SCALE})`,
        });
      }, FOCUS_MS),
      window.setTimeout(() => navigate(room.href), FOCUS_MS + MOVE_MS),
    );
  };

  const hub = project(HUB);
  const lit = selected ?? active;

  return (
    <div className="facility" data-focus={lit ?? undefined} data-moving={camera ? "" : undefined}>
      <div className="facility__stage" ref={stageRef} style={camera ?? undefined}>
        <div className="facility__plane">
          <svg className="plan" viewBox="0 0 1000 640" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <pattern id="plan-fine" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M20 0 H0 V20" className="plan__grid" />
              </pattern>
              <pattern id="plan-major" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M100 0 H0 V100" className="plan__grid plan__grid--major" />
              </pattern>
              <pattern id="plan-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <path d="M0 0 V8" className="plan__hatch" />
              </pattern>
              <radialGradient id="glow-signal" cx="50%" cy="45%" r="55%">
                <stop offset="0%" stopColor="#5cd0cb" stopOpacity="0.16" />
                <stop offset="100%" stopColor="#5cd0cb" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="glow-research" cx="50%" cy="45%" r="55%">
                <stop offset="0%" stopColor="#9b96f4" stopOpacity="0.16" />
                <stop offset="100%" stopColor="#9b96f4" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="glow-hub" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#c8d6e2" stopOpacity="0.07" />
                <stop offset="100%" stopColor="#c8d6e2" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="plan-fade" cx="50%" cy="50%" r="62%">
                <stop offset="0%" stopColor="#fff" stopOpacity="1" />
                <stop offset="100%" stopColor="#fff" stopOpacity="0.25" />
              </radialGradient>
              <mask id="plan-mask">
                <rect x="-60" y="-60" width="1120" height="760" fill="url(#plan-fade)" />
              </mask>
            </defs>

            <rect x="10" y="10" width="980" height="620" className="plan__floor" />
            <g mask="url(#plan-mask)">
              <rect x="10" y="10" width="980" height="620" fill="url(#plan-fine)" />
              <rect x="10" y="10" width="980" height="620" fill="url(#plan-major)" />
            </g>
            <rect x="10" y="250" width="980" height="140" className="plan__corridor" />
            <ellipse cx="500" cy="320" rx="300" ry="90" fill="url(#glow-hub)" />
            <path className="plan__guide" d="M40 320 H960" />

            {rooms.map((room) => {
              const [x, y, w, h] = SPACES[room.id].rect;
              const Floor = FLOORS[room.id];
              return (
                <g
                  key={room.id}
                  className={`plan__room plan__room--${room.tone}`}
                  data-active={lit === room.id || undefined}
                  onPointerEnter={() => setActive(room.id)}
                  onPointerLeave={() => setActive(null)}
                  onClick={enter(room)}
                >
                  <rect x={x} y={y} width={w} height={h} className="plan__space" />
                  {room.tone !== "neutral" ? (
                    <ellipse cx={x + w / 2} cy={y + h * 0.44} rx={w * 0.48} ry={h * 0.5} fill={`url(#glow-${room.tone})`} className="plan__glow" />
                  ) : null}
                  <g className="plan__preview" style={{ transformOrigin: `${x + w / 2}px ${y + h / 2}px` }}>
                    <Floor />
                  </g>
                  <rect x={x + 6} y={y + 6} width={w - 12} height={h - 12} className="plan__edge" />
                </g>
              );
            })}

            <g className="plan__wires">
              {rooms.map((room) => (
                <path key={room.id} d={SPACES[room.id].wire} className="plan__wire" data-active={lit === room.id || undefined} />
              ))}
            </g>
            <Walls />
            <GridMarks />
            <circle cx={HUB[0]} cy={HUB[1]} r="40" className="plan__hub" />
            <circle cx={HUB[0]} cy={HUB[1]} r="5" className="plan__hub-dot" />
          </svg>
        </div>

        <div className="facility__labels">
          <div className="facility__here" style={{ left: `${hub.left}%`, top: `${hub.top}%` }}>
            <span className="facility__here-k">01 · You are here</span>
            <span className="facility__here-t">Control room</span>
          </div>
          {rooms.map((room) => {
            const p = project(SPACES[room.id].label);
            return (
              <LabLink
                key={room.id}
                href={room.href}
                className={`room-tag room-tag--${room.tone}`}
                data-hang={SPACES[room.id].rect[1] > 300 ? "down" : undefined}
                data-active={lit === room.id || undefined}
                style={{ left: `${p.left}%`, top: `${p.top}%` }}
                onPointerEnter={() => setActive(room.id)}
                onPointerLeave={() => setActive(null)}
                onFocus={() => setActive(room.id)}
                onBlur={() => setActive(null)}
                onClick={enter(room)}
              >
                <span className="room-tag__k">
                  {room.index}
                  <span className="room-tag__area"> · {room.area}</span>
                </span>
                <span className="room-tag__t">{room.title}</span>
                <span className="room-tag__s">{room.status}</span>
              </LabLink>
            );
          })}
        </div>

        <p className="facility__title mono" aria-hidden="true">
          S//LAB · Level 01 · Plan <span>Schematic · not to scale</span>
        </p>
      </div>
    </div>
  );
}

/** Below desktop: the same rooms as a facility directory, one line per room. */
export function FacilityDirectory({ rooms }: { rooms: Room[] }) {
  return (
    <div className="directory">
      <p className="directory__head mono">
        <span>Facility directory</span>
        <span>Level 01</span>
      </p>
      <ol className="directory__list" aria-label="Rooms">
        {rooms.map((room) => {
          const Glyph = GLYPHS[room.id];
          return (
            <li key={room.id}>
              <LabLink href={room.href} className={`directory__room directory__room--${room.tone}`}>
                <span className="directory__floor mono">{room.index}</span>
                <span className="directory__body">
                  <span className="directory__title">{room.title}</span>
                  <span className="directory__area">{room.area}</span>
                </span>
                <span className="directory__status mono">{room.status}</span>
                <span className="directory__glyph">
                  <Glyph />
                </span>
              </LabLink>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
