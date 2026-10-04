"use client";

import { useRef, useState, type PointerEvent } from "react";
import { LabLink } from "@/components/shell/LabLink";
import { useReducedMotion } from "@/lib/useReducedMotion";

export interface Room {
  id: string;
  index: string;
  area: string;
  title: string;
  href: string;
  status: string[];
  tone: "signal" | "research" | "neutral";
  /** Grid cell in the 3×3 facility plan. */
  cell: [number, number];
}

// Connector routes in a 300×300 plan; cell centres sit at 50 / 150 / 250.
const ROUTES: Record<string, string> = {
  sams: "M150 150 V50",
  financeiq: "M150 150 H250",
  archive: "M150 150 H50",
  vault: "M150 150 V250",
  notes: "M150 250 H250",
};

export function FacilityMap({ rooms }: { rooms: Room[] }) {
  const [active, setActive] = useState<string | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setTilt({ x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 });
  };

  return (
    <div className="facility" ref={ref} onPointerMove={onMove} onPointerLeave={() => setTilt({ x: 0, y: 0 })}>
      <div
        className="facility__plane"
        style={{ transform: `rotateX(${12 - tilt.y * 6}deg) rotateY(${tilt.x * 7}deg)` }}
      >
        <svg className="facility__wires" viewBox="0 0 300 300" preserveAspectRatio="none" aria-hidden="true">
          {Object.entries(ROUTES).map(([id, d]) => (
            <g key={id} data-active={active === id || undefined}>
              <path d={d} className="facility__wire" vectorEffect="non-scaling-stroke" />
              <path d={d} className="facility__flow" vectorEffect="non-scaling-stroke" />
            </g>
          ))}
        </svg>

        <div className="facility__core" style={{ gridRow: 2, gridColumn: 2 }}>
          <span className="eyebrow">01 · You are here</span>
          <span className="facility__core-title">Control Room</span>
        </div>

        {rooms.map((room) => (
          <LabLink
            key={room.id}
            href={room.href}
            className={`room room--${room.tone}`}
            style={{ gridRow: room.cell[0], gridColumn: room.cell[1] }}
            onPointerEnter={() => setActive(room.id)}
            onPointerLeave={() => setActive(null)}
            onFocus={() => setActive(room.id)}
            onBlur={() => setActive(null)}
          >
            <span className="eyebrow">
              {room.index} · {room.area}
            </span>
            <span className="room__title">{room.title}</span>
            <span className="room__status mono">
              {room.status.map((line) => (
                <span key={line}>
                  <span className="room__pip" aria-hidden="true" />
                  {line}
                </span>
              ))}
            </span>
          </LabLink>
        ))}
      </div>
    </div>
  );
}
