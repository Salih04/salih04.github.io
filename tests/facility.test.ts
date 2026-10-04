import { describe, expect, it } from "vitest";
import { CORRIDOR, corridorLines, dolly, planeTransform, project } from "@/lib/facility";
import { countLabel } from "@/lib/count";

describe("facility projection", () => {
  it("keeps the plane centre on the stage centre line and narrows the far side", () => {
    const centre = project([500, 320]);
    expect(centre.left).toBeCloseTo(50, 6);
    const far = project([10, 10]);
    const near = project([10, 630]);
    // Perspective: the near edge is wider (further from centre) than the far edge.
    expect(Math.abs(near.left - 50)).toBeGreaterThan(Math.abs(far.left - 50));
    expect(near.top).toBeGreaterThan(far.top);
  });

  it("dolly at rest is the identity", () => {
    const cam = dolly([255, 130], { pull: 0, zoom: 1, tilt: 40 });
    expect(cam.tx).toBeCloseTo(0, 9);
    expect(cam.ty).toBeCloseTo(0, 9);
    expect(cam.tz).toBeCloseTo(0, 9);
    expect(planeTransform(cam)).toMatch(/^translate3d\(.+\) rotateX\(40deg\)$/);
  });

  it("dolly moves the room toward the middle of the view and brings it closer", () => {
    for (const c of [[255, 130], [745, 130], [175, 510], [825, 510]] as [number, number][]) {
      const start = project(c);
      const cam = dolly(c, { pull: 0.55, zoom: 1.42, tilt: 33 });
      const end = project(c, cam);
      expect(cam.tz).toBeGreaterThan(0);
      expect(Math.abs(end.left - 50)).toBeCloseTo(Math.abs(start.left - 50) * 0.45, 6);
      expect(Math.abs(end.top - 50)).toBeCloseTo(Math.abs(start.top - 50) * 0.45, 6);
    }
  });

  it("maps the corridor to three horizontal lines inside the stage, centre between walls", () => {
    const stage = { left: 200, top: 100, width: 1000, height: 480 };
    const { top, axis, bottom } = corridorLines(stage);
    expect(top.y).toBeLessThan(axis.y);
    expect(axis.y).toBeLessThan(bottom.y);
    // The far wall is drawn narrower than the near wall.
    expect(top.w).toBeLessThan(bottom.w);
    for (const l of [top, axis, bottom]) {
      expect(l.x).toBeGreaterThanOrEqual(stage.left);
      expect(l.x + l.w).toBeLessThanOrEqual(stage.left + stage.width);
    }
    expect(CORRIDOR.centre).toBe((CORRIDOR.top + CORRIDOR.bottom) / 2);
  });
});

describe("derived counts", () => {
  it("pluralises from the record count", () => {
    expect(countLabel(0, "draft")).toBe("0 drafts");
    expect(countLabel(1, "draft")).toBe("1 draft");
    expect(countLabel(4, "specimen")).toBe("4 specimens");
  });
});
