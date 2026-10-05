// Final polish capture + verification script.
// Usage: npm run build && (serve out/ on :4173) & node docs/audit/capture-final-polish.mjs > docs/audit/final-polish-checks.json
// PLAYWRIGHT_MODULE may point at a playwright index.mjs if it is not resolvable (no dependency is added).
// Post-processing for committed images (ImageMagick): `convert f -colors 192 -strip PNG8:f`.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const BASE = process.env.BASE ?? "http://localhost:4173";
const OUT = process.env.OUT_DIR ?? new URL("./screenshots/final-polish", import.meta.url).pathname;
const report = { pages: [], checks: [] };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const check = (name, pass, detail = "") => report.checks.push({ name, pass: Boolean(pass), detail });

async function metrics(page, name) {
  const m = await page.evaluate(() => {
    const vw = window.innerWidth;
    const overflow = document.documentElement.scrollWidth - vw;
    let smallTotal = 0;
    for (const el of document.querySelectorAll("body *")) {
      if (!el.childNodes.length) continue;
      const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      if (!hasText) continue;
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden" || el.closest("[hidden],.sr-only,[aria-hidden='true']")) continue;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      if (parseFloat(cs.fontSize) < 11.95) smallTotal++;
    }
    return { overflow, smallTotal, height: document.documentElement.scrollHeight };
  });
  report.pages.push({ name, ...m });
  return m;
}

async function shot(page, name, { full = false } = {}) {
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: full });
  return metrics(page, name);
}

const readout = (page) =>
  page.evaluate(() => {
    const v = [...document.querySelectorAll(".readout__v")].map((c) => c.textContent?.trim());
    return { server: v[0], client: v[1], sync: document.querySelector(".readout__sync")?.textContent?.trim() };
  });

async function untilText(page, selector, text, timeout = 30000) {
  await page.waitForFunction(([s, t]) => document.querySelector(s)?.textContent?.includes(t), [selector, text], { timeout });
}

/** Control Room labels: inside the facility, and not overlapping each other or "you are here". */
const labelLayout = (page) =>
  page.evaluate(() => {
    const f = document.querySelector(".facility").getBoundingClientRect();
    const boxes = [...document.querySelectorAll(".room-tag, .facility__here")].map((e) => e.getBoundingClientRect());
    const hit = (a, b) => a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1;
    let clipped = 0;
    let overlaps = 0;
    for (const b of boxes) if (b.left < f.left || b.right > f.right || b.top < f.top || b.bottom > f.bottom) clipped++;
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) if (hit(boxes[i], boxes[j])) overlaps++;
    return { clipped, overlaps, facility: Math.round(f.width) };
  });

const SIZES = {
  w1440: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  w1280: { viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 },
  w1024: { viewport: { width: 1024, height: 768 }, deviceScaleFactor: 1 },
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true },
  reduced: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: "reduce" },
};

async function run(kind) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext(SIZES[kind]);
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  const go = async (path, ms = 900) => {
    await page.goto(BASE + path, { waitUntil: "networkidle" });
    await wait(ms);
  };

  if (kind === "w1440") {
    // ENTRY
    await go("/", 1500);
    await shot(page, "01-entry-1440");

    // ENTRY → CONTROL ROOM: one persistent reference (the bridge lines) the whole way.
    const t0 = Date.now();
    await page.getByRole("link", { name: "Enter S//LAB" }).click();
    await wait(120);
    const fold = await page.evaluate(() => document.querySelectorAll(".bridge .bridge__line").length);
    await page.waitForURL("**/lab/", { timeout: 3000 });
    const navMs = Date.now() - t0;
    await wait(Math.max(0, 330 - (Date.now() - t0)));
    const mid = await page.evaluate(() => ({ lines: document.querySelectorAll(".bridge .bridge__line").length, phase: document.querySelector(".bridge")?.dataset.phase }));
    await shot(page, "02-entry-transition-midpoint");
    await wait(Math.max(0, 1300 - (Date.now() - t0)));
    const after = await page.evaluate(() => ({ bridge: !!document.querySelector(".bridge"), arrive: document.documentElement.dataset.arrive ?? null }));
    check(
      "Entry → Control Room: the bridge carries three lines from the entry through the route change and then removes itself",
      fold === 3 && mid.lines === 3 && !after.bridge && after.arrive === null,
      JSON.stringify({ fold, mid, after }),
    );
    check("Entry → Control Room: route changes within 400ms of the click", navMs < 400, `${navMs}ms`);
    await shot(page, "03b-control-room-arrived");

    // CONTROL ROOM
    await go("/lab/", 1200);
    await shot(page, "03-control-room-1440");
    const l1440 = await labelLayout(page);
    check("1440: Control Room labels are inside the plan and do not overlap", l1440.clipped === 0 && l1440.overlaps === 0, JSON.stringify(l1440));
    await page.locator(".room-tag", { hasText: "SAMS" }).hover();
    await wait(700);
    await shot(page, "04-control-room-sams-selected");
    const sel = await page.evaluate(() => ({
      others: getComputedStyle(document.querySelector(".plan__room--research")).opacity,
      glow: getComputedStyle(document.querySelector(".plan__room--signal .plan__glow")).opacity,
      spill: getComputedStyle(document.querySelector(".plan__room--signal .plan__spill")).opacity,
      rail: getComputedStyle(document.querySelector(".floor--sams .floor__rail")).strokeOpacity,
    }));
    check(
      "Control Room: a selected room activates from inside (light, rail contrast, corridor spill) while the others recede",
      Number(sel.others) < 0.5 && Number(sel.glow) === 1 && Number(sel.spill) > 0.5 && Number(sel.rail) === 1,
      JSON.stringify(sel),
    );
    await page.mouse.move(5, 5);
    await wait(400);
    await page.locator(".room-tag", { hasText: "FinanceIQ" }).hover();
    await wait(700);
    await shot(page, "05-control-room-financeiq-selected");
    await page.mouse.move(5, 5);
    await wait(400);
    await page.locator(".room-tag", { hasText: "SAMS" }).click();
    await wait(420);
    const cam = await page.evaluate(() => document.querySelector(".facility__plane")?.style.transform ?? "");
    await shot(page, "06-control-room-transition-to-sams");
    check("Control Room: the camera moves the plane in depth (dolly + tilt), not a 2D zoom of the stage", /translate3d\(.+\) rotateX\(33deg\)/.test(cam), cam);
    await page.waitForURL("**/sams/", { timeout: 5000 });
    check("Control Room click navigates to the room after the camera move", page.url().endsWith("/sams/"));

    // SAMS
    await go("/sams/#architecture", 900);
    await shot(page, "07-sams-architecture");
    const archNodes = await page.$$eval(".apath__node .apath__name", (n) => n.map((x) => x.textContent));
    check("SAMS Architecture: request, workflow, state and delivery path drawn from the published components", ["Client", "FastAPI", "Temporal", "Agent workers", "PostgreSQL", "WebSockets", "Redis"].every((n) => archNodes.includes(n)), archNodes.join(", "));
    await page.locator(".apath__node", { hasText: "Temporal" }).focus();
    await page.keyboard.press("Enter");
    await wait(200);
    check(
      "SAMS Architecture: selecting a component keeps keyboard focus and updates the detail",
      (await page.evaluate(() => document.activeElement?.textContent?.includes("Temporal"))) && (await page.locator("#arch-detail-title").textContent()) === "Temporal",
    );

    await go("/sams/", 0);
    await page.waitForFunction(() => document.querySelectorAll(".readout__v")[1]?.textContent?.trim() === "041", null, { timeout: 8000 });
    await page.getByRole("button", { name: "Disconnect client" }).click();
    await page.waitForFunction(() => document.querySelector(".readout__v")?.textContent?.trim() === "047", null, { timeout: 15000 });
    await wait(150);
    const disc = await readout(page);
    check("SAMS disconnected: client frozen at 041, server at 047", disc.client === "041" && disc.server === "047", JSON.stringify(disc));
    await shot(page, "08-sams-disconnected");
    await page.getByRole("button", { name: "Reconnect client" }).click();
    await wait(1250);
    const resume = await page.locator(".readout__request").textContent();
    check("SAMS replay: resume from last_seq=041", resume.includes("last_seq=041"), resume);
    await shot(page, "09-sams-replay");
    await untilText(page, ".readout__sync", "converged", 30000);
    await wait(500);
    const verification = await page.$$eval(".verify__rows dd", (dd) => dd.map((d) => d.textContent));
    check("SAMS converged: continuity PASS, duplicates NONE, convergence PASS", verification.join(",") === "PASS,NONE,PASS", verification.join(","));
    const retained = await page.$$eval(".evlog__dur", (d) => d.map((x) => x.textContent.trim()));
    check("SAMS durability column still reads 'retained'", retained.length > 0 && retained.every((t) => t === "retained"), retained[0]);
    await shot(page, "10-sams-converged");

    // FINANCEIQ
    await go("/financeiq/", 900);
    await shot(page, "11-financeiq-pit");
    const vals = await page.locator(".compare__rows dd").allTextContents();
    check("FinanceIQ PIT unchanged: 31 Mar 2020 · naive 1.18 · known 1.31", vals[0] === "31 Mar 2020" && vals[1] === "1.18" && vals[2] === "1.31", vals.join(" / "));
    for (const [hash, name] of [
      ["bench", "12-financeiq-experiment-bench"],
      ["validation", "13-financeiq-validation"],
      ["pipeline", "14-financeiq-pipeline"],
    ]) {
      await go(`/financeiq/#${hash}`, 700);
      await shot(page, name);
    }

    await go("/financeiq/case-study/", 800);
    const rq = await page.locator(".glance").textContent().catch(() => "");
    check("FinanceIQ research question uses the final wording", rq.includes("only uses information that was actually knowable at each simulated date"), rq.slice(0, 80));

    // ARCHIVE
    await go("/archive/", 800);
    await shot(page, "15-archive-desktop", { full: true });
    const records = await page.$$eval(".eng-record", (rs) =>
      rs.map((r) => ({ role: r.querySelector(".eng-record__disc")?.textContent, fields: [...r.querySelectorAll(".eng-record__fields dt")].map((d) => d.textContent).join(",") })),
    );
    check(
      "Archive: backend record carries Role, Period, Area, Tech, Context, Basis; the QA record stays minimal",
      records.length === 2 &&
        records[0].role === "Backend Engineering Intern" &&
        records[0].fields === "Role,Period,Area,Tech,Context,Basis" &&
        records[1].role === "QA Intern" &&
        records[1].fields === "Role,Period,Basis",
      JSON.stringify(records),
    );
    const area = await page.locator(".eng-record").first().locator("dt:text('Area') + dd").textContent();
    check("Archive: approved areas only (Backend services · Telemetry · Automated testing)", area === "Backend services · Telemetry · Automated testing", area);

    // SAMS case study and lab tab draw the same architecture model.
    await go("/sams/case-study/", 800);
    const figSteps = await page.$$eval(".archfig__step .archfig__name", (n) => n.map((x) => x.textContent).join(">"));
    const figKeys = await page.$$eval(".archfig__reconnect code", (n) => n.map((x) => x.textContent).join(">"));
    await page.locator("#architecture").scrollIntoViewIfNeeded();
    await wait(200);
    await shot(page, "24-sams-case-study-architecture");
    await go("/sams/#architecture", 800);
    const labRoles = await page.$$eval(".apath__node .apath__role", (n) => n.map((x) => x.textContent));
    check(
      "SAMS case study architecture agrees with the lab tab (same paths, roles and reconnect contract)",
      figSteps === "Client>FastAPI>Temporal>PostgreSQL>Redis>WebSockets>Client" &&
        figKeys === "last_seq>replay>gap" &&
        ["Client", "API boundary", "Durable workflow", "Durable state", "Event delivery", "Event gateway"].every((r) => labRoles.includes(r)),
      `${figSteps} | ${figKeys} | ${labRoles.join(",")}`,
    );

    // Keyboard: skip link first, then the entry's keys and Enter S//LAB.
    await go("/", 600);
    await page.keyboard.press("Tab");
    check("first Tab reaches the skip link", await page.evaluate(() => document.activeElement?.classList.contains("skip-link")));
    const order = [];
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Tab");
      order.push(await page.evaluate(() => document.activeElement?.textContent?.trim().slice(0, 24)));
    }
    check("keyboard reaches both project keys and Enter S//LAB on the entry", order.some((t) => t?.startsWith("02 · Independent")) && order.some((t) => t?.startsWith("03 · MSc")) && order.some((t) => t?.startsWith("Enter")), order.join(" | "));

    // Deep links.
    for (const path of ["/sams/#decisions", "/financeiq/#results", "/notes/designing-replayable-event-systems/"]) {
      const res = await page.goto(BASE + path, { waitUntil: "networkidle" });
      check(`deep link ${path} loads`, res.status() === 200);
    }
  }

  if (kind === "w1280" || kind === "w1024") {
    const p = kind.slice(1);
    await go("/lab/", 1200);
    await shot(page, `16-control-room-${p}`);
    const l = await labelLayout(page);
    check(`${p}: Control Room labels are inside the plan and do not overlap`, l.clipped === 0 && l.overlaps === 0, JSON.stringify(l));
    const intro = await page.evaluate(() => {
      const i = document.querySelector(".control__intro").getBoundingClientRect();
      const plan = document.querySelector(".facility__plane").getBoundingClientRect();
      const f = document.querySelector(".facility").getBoundingClientRect();
      return { gap: Math.round(plan.top - i.bottom), fits: f.bottom <= window.innerHeight };
    });
    check(`${p}: intro does not crowd the plan and the plan fits the first viewport`, intro.gap >= 12 && intro.fits, JSON.stringify(intro));
    await go("/", 1200);
    await shot(page, `17-entry-${p}`);
  }

  if (kind === "mobile") {
    await go("/", 1200);
    await shot(page, "18-mobile-entry");
    await go("/lab/", 800);
    await shot(page, "19-mobile-facility-directory");
    const statuses = await page.$$eval(".directory__status", (s) => s.map((x) => x.textContent));
    check("mobile directory: Vault and Notes counts are derived from the records", statuses.includes("4 specimens") && statuses.includes("3 drafts"), statuses.join(" · "));
    await go("/sams/", 9000);
    await page.locator(".machine__events").scrollIntoViewIfNeeded();
    await shot(page, "20-mobile-sams");
    const trunc = await page.$$eval(".evlog__row[data-delivery] .evlog__type", (els) =>
      els.map((e) => ({ id: e.querySelector(".evlog__type-id")?.textContent, shown: e.querySelector(".evlog__type-short")?.textContent, cut: e.scrollWidth > e.clientWidth + 1 })),
    );
    check("mobile SAMS: concise event labels, none truncated, canonical identifiers kept", trunc.length > 0 && trunc.every((t) => !t.cut && t.id && t.shown && !t.shown.includes("_")), JSON.stringify(trunc.slice(0, 8)));
    await go("/financeiq/", 900);
    await page.locator(".pit__plate").scrollIntoViewIfNeeded();
    await shot(page, "21-mobile-financeiq");
    await go("/sams/case-study/", 800);
    await shot(page, "22-mobile-case-study");
    await go("/archive/", 800);
    await shot(page, "25-mobile-archive", { full: true });
    await go("/sams/#architecture", 800);
    await page.locator(".apath").scrollIntoViewIfNeeded();
    await shot(page, "23-mobile-sams-architecture");
  }

  if (kind === "reduced") {
    await go("/", 1200);
    await page.getByRole("link", { name: "Enter S//LAB" }).click();
    await page.waitForURL("**/lab/", { timeout: 2000 });
    const state = await page.evaluate(() => ({ arrive: document.documentElement.dataset.arrive ?? "none", bridge: !!document.querySelector(".bridge") }));
    check("reduced motion: Enter S//LAB navigates at once, with no bridge or floor animation", state.arrive === "none" && !state.bridge, JSON.stringify(state));
    await go("/lab/", 600);
    await page.locator(".room-tag", { hasText: "SAMS" }).click();
    await page.waitForURL("**/sams/", { timeout: 2000 });
    check("reduced motion: choosing a room navigates without the camera move", page.url().endsWith("/sams/"));
  }

  report.pages.push({ name: `${kind}-console-errors`, errors });
  check(`${kind}: zero console errors`, errors.length === 0, errors.join(" | "));
  await browser.close();
}

for (const k of Object.keys(SIZES)) await run(k);
const pages = report.pages.filter((p) => "overflow" in p);
check("no page horizontal overflow on any captured page", pages.every((p) => p.overflow <= 0), pages.filter((p) => p.overflow > 0).map((p) => p.name).join(","));
check("no visible text under 12px on any captured page", pages.every((p) => p.smallTotal === 0), pages.filter((p) => p.smallTotal > 0).map((p) => `${p.name}:${p.smallTotal}`).join(","));
console.log(JSON.stringify(report, null, 1));
