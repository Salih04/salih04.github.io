"use client";

import { useRef, useState, type CSSProperties, type MouseEvent } from "react";
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
  /** Where the upright label stands, in plane units. */
  label: [number, number];
  /** Floor preview: x, y, width, height in plane units. */
  glyph: [number, number, number, number];
  wire: string;
}

const HUB: [number, number] = [500, 320];

const SPACES: Record<RoomId, Space> = {
  sams: { rect: [10, 10, 490, 240], centre: [255, 130], label: [160, 130], glyph: [300, 80, 180, 90], wire: "M500 320 H260 V130" },
  financeiq: { rect: [500, 10, 490, 240], centre: [745, 130], label: [650, 130], glyph: [790, 80, 180, 90], wire: "M500 320 H740 V130" },
  archive: { rect: [10, 390, 330, 240], centre: [175, 510], label: [175, 450], glyph: [85, 515, 180, 90], wire: "M500 320 H175 V510" },
  vault: { rect: [340, 390, 320, 240], centre: [500, 510], label: [500, 450], glyph: [410, 515, 180, 90], wire: "M500 320 V510" },
  notes: { rect: [660, 390, 330, 240], centre: [825, 510], label: [825, 450], glyph: [735, 515, 180, 90], wire: "M500 320 H825 V510" },
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

const CAMERA_MS = 560;

/** Walls with doorway gaps, drawn once. */
function Walls() {
  return (
    <g className="plan__walls">
      <rect x="10" y="10" width="980" height="620" />
      <path d="M10 250 H220 M300 250 H700 M780 250 H990" />
      <path d="M500 10 V250" />
      <path d="M10 390 H140 M210 390 H465 M535 390 H790 M860 390 H990" />
      <path d="M340 390 V630 M660 390 V630" />
      {/* door swings */}
      <path className="plan__door" d="M220 250 A80 80 0 0 0 300 250 M700 250 A80 80 0 0 0 780 250" />
      <path className="plan__door" d="M140 390 A70 70 0 0 1 210 390 M465 390 A70 70 0 0 1 535 390 M790 390 A70 70 0 0 1 860 390" />
    </g>
  );
}

export function FacilityMap({ rooms }: { rooms: Room[] }) {
  const { navigate } = useLab();
  const [active, setActive] = useState<RoomId | null>(null);
  const [camera, setCamera] = useState<CSSProperties | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const zooming = useRef(false);

  const enter = (room: Room) => (e: MouseEvent) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    if (zooming.current) return;
    const stage = stageRef.current;
    if (!stage || prefersReducedMotion()) {
      navigate(room.href);
      return;
    }
    zooming.current = true;
    setActive(room.id);
    const r = stage.getBoundingClientRect();
    const p = project(SPACES[room.id].centre);
    const ox = (p.left / 100) * r.width;
    const oy = (p.top / 100) * r.height;
    setCamera({
      transformOrigin: `${ox}px ${oy}px`,
      transform: `translate(${r.width / 2 - ox}px, ${r.height / 2 - oy}px) scale(1.9)`,
    });
    window.setTimeout(() => navigate(room.href), CAMERA_MS);
  };

  const hub = project(HUB);

  return (
    <div className="facility" data-zoom={camera ? "" : undefined}>
      <div className="facility__stage" ref={stageRef} style={camera ?? undefined}>
        <div className="facility__plane">
          <svg className="plan" viewBox="0 0 1000 640" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <pattern id="plan-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M40 0 H0 V40" className="plan__grid" />
              </pattern>
              <radialGradient id="plan-fade" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor="#fff" stopOpacity="1" />
                <stop offset="100%" stopColor="#fff" stopOpacity="0" />
              </radialGradient>
              <mask id="plan-mask">
                <rect width="1000" height="640" fill="url(#plan-fade)" />
              </mask>
            </defs>
            <rect width="1000" height="640" fill="url(#plan-grid)" mask="url(#plan-mask)" />
            <rect x="10" y="250" width="980" height="140" className="plan__corridor" />

            {rooms.map((room) => {
              const sp = SPACES[room.id];
              const [x, y, w, h] = sp.rect;
              const [gx, gy, gw, gh] = sp.glyph;
              const Glyph = GLYPHS[room.id];
              return (
                <g
                  key={room.id}
                  className={`plan__room plan__room--${room.tone}`}
                  data-active={active === room.id || undefined}
                  onPointerEnter={() => setActive(room.id)}
                  onPointerLeave={() => setActive(null)}
                  onClick={enter(room)}
                >
                  <rect x={x} y={y} width={w} height={h} className="plan__space" />
                  <Glyph x={gx} y={gy} width={gw} height={gh} />
                </g>
              );
            })}

            <g className="plan__wires">
              {rooms.map((room) => (
                <path key={room.id} d={SPACES[room.id].wire} className="plan__wire" data-active={active === room.id || undefined} />
              ))}
            </g>
            <Walls />
            <circle cx={HUB[0]} cy={HUB[1]} r="46" className="plan__hub" />
            <circle cx={HUB[0]} cy={HUB[1]} r="6" className="plan__hub-dot" />
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
                data-active={active === room.id || undefined}
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
      </div>
    </div>
  );
}

/** Below desktop: the same rooms as a building directory, one floor per room. */
export function FacilityDirectory({ rooms }: { rooms: Room[] }) {
  return (
    <ol className="directory" aria-label="Rooms">
      {rooms.map((room) => {
        const Glyph = GLYPHS[room.id];
        return (
          <li key={room.id}>
            <LabLink href={room.href} className={`directory__room directory__room--${room.tone}`}>
              <span className="directory__floor mono">{room.index}</span>
              <span className="directory__body">
                <span className="directory__area">{room.area}</span>
                <span className="directory__title">{room.title}</span>
                <span className="directory__status">{room.status}</span>
              </span>
              <span className="directory__glyph">
                <Glyph />
              </span>
            </LabLink>
          </li>
        );
      })}
    </ol>
  );
}
