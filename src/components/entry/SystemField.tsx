"use client";

import { useEffect, useRef } from "react";
import { mulberry32 } from "@/lib/prng";

/**
 * Lightweight background for the entry screen: a sparse system topology in
 * which nodes occasionally transmit a packet to a neighbour. Canvas 2D only —
 * no WebGL — paused when hidden and drawn once when motion is reduced.
 */

interface Node {
  x: number;
  y: number;
  r: number;
  glow: number;
}

interface Packet {
  from: number;
  to: number;
  t: number;
  speed: number;
}

export function SystemField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let nodes: Node[] = [];
    let edges: [number, number][] = [];
    let packets: Packet[] = [];
    let raf = 0;
    let last = 0;
    let visible = true;

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const rand = mulberry32(7);
      const count = Math.round(Math.min(46, Math.max(16, (width * height) / 26000)));
      nodes = Array.from({ length: count }, () => ({
        // Bias toward the right so the field never sits under the hero copy.
        x: width * (0.3 + 0.7 * Math.pow(rand(), 0.8)),
        y: height * (0.06 + 0.88 * rand()),
        r: rand() < 0.15 ? 2.4 : 1.4,
        glow: 0,
      }));
      edges = [];
      nodes.forEach((a, i) => {
        const near = nodes
          .map((b, j) => ({ j, d: Math.hypot(a.x - b.x, a.y - b.y) }))
          .filter((n) => n.j !== i)
          .sort((p, q) => p.d - q.d)
          .slice(0, 2);
        for (const n of near) if (!edges.some(([p, q]) => (p === n.j && q === i) || (p === i && q === n.j))) edges.push([i, n.j]);
      });
      packets = [];
    };

    const draw = (dt: number) => {
      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(92, 208, 203, 0.09)";
      ctx.beginPath();
      for (const [i, j] of edges) {
        const a = nodes[i]!;
        const b = nodes[j]!;
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
      }
      ctx.stroke();

      if (!reduce && packets.length < 5 && Math.random() < dt * 0.0012) {
        const [from, to] = edges[Math.floor(Math.random() * edges.length)] ?? [0, 0];
        const flip = Math.random() < 0.5;
        packets.push({ from: flip ? to : from, to: flip ? from : to, t: 0, speed: 0.00035 + Math.random() * 0.00025 });
      }

      packets = packets.filter((p) => {
        p.t += p.speed * dt;
        const a = nodes[p.from]!;
        const b = nodes[p.to]!;
        if (p.t >= 1) {
          b.glow = 1;
          return false;
        }
        const x = a.x + (b.x - a.x) * p.t;
        const y = a.y + (b.y - a.y) * p.t;
        ctx.strokeStyle = "rgba(92, 208, 203, 0.35)";
        ctx.beginPath();
        ctx.moveTo(a.x + (b.x - a.x) * Math.max(0, p.t - 0.12), a.y + (b.y - a.y) * Math.max(0, p.t - 0.12));
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.fillStyle = "rgba(160, 240, 236, 0.9)";
        ctx.beginPath();
        ctx.arc(x, y, 1.6, 0, Math.PI * 2);
        ctx.fill();
        return true;
      });

      for (const n of nodes) {
        n.glow = Math.max(0, n.glow - dt * 0.0012);
        if (n.glow > 0) {
          ctx.fillStyle = `rgba(92, 208, 203, ${0.18 * n.glow})`;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r + 7 * n.glow, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = n.glow > 0 ? "rgba(160, 240, 236, 0.85)" : "rgba(163, 174, 185, 0.38)";
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = (now: number) => {
      const dt = last ? Math.min(64, now - last) : 16;
      last = now;
      if (visible && !document.hidden) draw(dt);
      raf = requestAnimationFrame(loop);
    };

    build();
    if (reduce) draw(0);
    else raf = requestAnimationFrame(loop);

    const ro = new ResizeObserver(() => {
      build();
      if (reduce) draw(0);
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
    });
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return <canvas ref={ref} className="system-field" aria-hidden="true" />;
}
