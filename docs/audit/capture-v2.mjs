// V2 Pass 1 capture + verification script.
// Usage: npm run build && (cd out && python3 -m http.server 4173) & node docs/audit/capture-v2.mjs
// PLAYWRIGHT_MODULE may point at a playwright index.mjs if it is not resolvable (no dependency is added).
// Post-processing for committed images (ImageMagick): `convert f -colors 192 -strip PNG8:f`.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const BASE = process.env.BASE ?? "http://localhost:4173";
const OUT = new URL("./screenshots/v2-pass1", import.meta.url).pathname;
const report = { pages: [], checks: [] };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const check = (name, pass, detail = "") => report.checks.push({ name, pass: Boolean(pass), detail });

async function metrics(page, name) {
  const m = await page.evaluate(() => {
    const vw = window.innerWidth;
    const overflow = document.documentElement.scrollWidth - vw;
    const small = {};
    let smallTotal = 0;
    for (const el of document.querySelectorAll("body *")) {
      if (!el.childNodes.length) continue;
      const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      if (!hasText) continue;
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden" || el.closest("[hidden],.sr-only,[aria-hidden='true']")) continue;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      const fs = parseFloat(cs.fontSize);
      if (fs < 11.95) {
        small[fs] = (small[fs] || 0) + 1;
        smallTotal++;
      }
    }
    return { overflow, small, smallTotal, height: document.documentElement.scrollHeight };
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
    const v = [...document.querySelectorAll(".readout__cell")].map((c) => c.querySelector(".readout__v")?.textContent?.trim());
    return { server: v[0], client: v[1], sync: v[2], connection: v[3], worker: v[4] };
  });

async function untilText(page, selector, text, timeout = 30000) {
  await page.waitForFunction(([s, t]) => document.querySelector(s)?.textContent?.includes(t), [selector, text], { timeout });
}

async function run(kind) {
  const browser = await chromium.launch();
  const sizes = {
    desktop: { viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 },
    laptop1280: { viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 },
    laptop1024: { viewport: { width: 1024, height: 768 }, deviceScaleFactor: 1 },
    mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true },
    reduced: { viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1, reducedMotion: "reduce" },
  };
  const ctx = await browser.newContext(sizes[kind]);
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  const go = async (path, ms = 900) => {
    await page.goto(BASE + path, { waitUntil: "networkidle" });
    await wait(ms);
  };

  if (kind === "desktop") {
    await go("/", 1500);
    await shot(page, "01-entry");

    await go("/lab/", 900);
    await shot(page, "02-control-room");
    await page.locator(".room-tag").first().hover();
    await wait(700);
    await shot(page, "03-control-room-selected");
    // Camera move: capture mid-flight, before the route changes.
    await page.locator(".room-tag").first().click();
    await wait(330);
    await shot(page, "03b-control-room-camera");
    await page.waitForURL("**/sams/", { timeout: 5000 });
    check("control room click navigates to the room after the camera move", page.url().endsWith("/sams/"));

    // SAMS: default (auto-run), then the guided disconnect → replay → converged sequence.
    await go("/sams/", 4200);
    await shot(page, "04-sams-default");

    await go("/sams/", 0);
    await page.waitForFunction(() => document.querySelector(".readout__cell .readout__v")?.textContent?.trim() === "041", null, { timeout: 8000 });
    await page.getByRole("button", { name: "Disconnect client" }).click();
    await page.waitForFunction(() => document.querySelector(".readout__cell .readout__v")?.textContent?.trim() === "047", null, { timeout: 15000 });
    await wait(150);
    const disc = await readout(page);
    check("disconnected client cursor stops while the server appends", disc.client === "041" && disc.server === "047", JSON.stringify(disc));
    await shot(page, "05-sams-disconnected");
    await page.getByRole("button", { name: "Reconnect client" }).click();
    await wait(1300);
    const mid = await readout(page);
    check("reconnect sends last_seq and replays", (await page.locator(".readout__request").textContent()).includes("041") && mid.connection === "Replaying", JSON.stringify(mid));
    await shot(page, "06-sams-replay");
    await untilText(page, ".readout", "State converged", 30000);
    const done = await readout(page);
    check("replay converges: client equals server", done.client === done.server && done.sync.includes("converged"), JSON.stringify(done));
    const deliveries = await page.$$eval(".evlog__row[data-delivery]", (rows) => rows.map((r) => r.getAttribute("data-delivery")));
    check("every event delivered exactly once (no pending rows)", deliveries.length > 0 && !deliveries.includes("pending"), deliveries.join(","));
    await shot(page, "07-sams-completed");

    // Worker failure.
    await go("/sams/", 0);
    await page.waitForFunction(() => document.querySelector(".readout__cell .readout__v")?.textContent?.trim() === "044", null, { timeout: 12000 });
    await page.getByRole("button", { name: "Stop worker" }).click();
    await wait(1400);
    await shot(page, "07b-sams-worker-stopped");
    await untilText(page, ".evlog", "WORKFLOW_RESUMED", 10000);
    await wait(400);
    await shot(page, "07c-sams-worker-resumed");
    check("stopped worker is replaced and the workflow resumes", (await page.locator(".evlog").textContent()).includes("WORKFLOW_RESUMED"));

    // Focus is kept on the initiating control during simulations.
    await go("/sams/", 1800);
    await page.getByRole("button", { name: "Disconnect client" }).focus();
    await page.keyboard.press("Enter");
    await wait(400);
    check("SAMS: focus stays on the connection control", await page.evaluate(() => document.activeElement?.textContent?.includes("Reconnect client")));
    await page.keyboard.press("Enter");
    await wait(300);
    check("SAMS: focus stays after reconnect", await page.evaluate(() => document.activeElement?.tagName === "BUTTON"));

    await go("/sams/case-study/", 900);
    await shot(page, "08-sams-case-study");

    // FinanceIQ
    await go("/financeiq/", 900);
    check("FinanceIQ opens on point-in-time reconstruction", (await page.getByRole("tab", { selected: true }).textContent()).includes("Point-in-time"));
    await shot(page, "09-fiq-pit-default");
    // Move the cursor with the keyboard to a date where another value leaks, and inspect it.
    await page.locator(".tl__handle").focus();
    for (let i = 0; i < 3; i++) await page.keyboard.press("ArrowRight");
    await page.getByRole("button", { name: /Company A · Q1 2020 EPS/ }).click();
    await wait(300);
    await page.locator(".pit__bench").scrollIntoViewIfNeeded();
    await shot(page, "10-fiq-naive-leakage");
    check("as-of slider is keyboard operable", (await page.locator(".pit__asof-v").textContent()).includes("21 Apr 2020"), await page.locator(".pit__asof-v").textContent());

    await go("/financeiq/", 600);
    await page.getByRole("radio", { name: "Point-in-time" }).click();
    await wait(300);
    await shot(page, "11-fiq-pit-corrected");
    const vals = await page.locator(".compare__rows dd").allTextContents();
    check("comparison shows naive 1.18 vs available 1.31 on 31 Mar 2020", vals[0] === "1.18" && vals[1] === "1.31", vals.join(" / "));

    await go("/financeiq/", 600);
    const recon = page.getByRole("button", { name: "Reconstruct history" }).last();
    await recon.focus();
    await page.keyboard.press("Enter");
    await wait(400);
    check("FinanceIQ: focus stays on the reconstruct control while running", await page.evaluate(() => document.activeElement?.textContent?.includes("Reconstruct")));
    await untilText(page, ".reconstruct", "dataset ready", 15000);
    await page.locator(".reconstruct").scrollIntoViewIfNeeded();
    await shot(page, "12-fiq-reconstruction", { full: true });

    await go("/financeiq/#bench", 600);
    const runBtn = page.getByRole("button", { name: "Run demo" });
    await runBtn.focus();
    await page.keyboard.press("Enter");
    await wait(300);
    check("FinanceIQ: focus stays on Run demo while running", await page.evaluate(() => document.activeElement?.textContent?.includes("Run")));
    await untilText(page, ".bench__out", "Leakage audit", 10000);
    await shot(page, "12b-fiq-bench", { full: true });

    await go("/financeiq/case-study/", 900);
    await shot(page, "13-fiq-case-study");

    // Drag the as-of cursor with the pointer.
    await go("/financeiq/", 600);
    const track = page.locator(".tl__row--axis .tl__track");
    const b = await track.boundingBox();
    await page.mouse.move(b.x + b.width * 0.4, b.y + b.height / 2);
    await page.mouse.down();
    await page.mouse.move(b.x + b.width * 0.85, b.y + b.height / 2, { steps: 8 });
    await page.mouse.up();
    const dragged = await page.locator(".pit__asof-v").textContent();
    check("as-of cursor is draggable on the timeline", dragged.includes("2020"), dragged);

    // Case Study Mode route model.
    await go("/sams/case-study/", 500);
    const m1 = await page.evaluate(() => document.documentElement.dataset.mode);
    await page.locator(".rail .rail-nav__link", { hasText: "FinanceIQ" }).click();
    await page.waitForURL("**/financeiq/case-study/", { timeout: 5000 });
    check("paired routes preserve case mode (SAMS case → FinanceIQ case)", m1 === "case" && page.url().endsWith("/financeiq/case-study/"));
    for (const path of ["/resume/", "/vault/", "/about/", "/notes/"]) {
      await page.locator(`a[href="${path}"]`).first().click().catch(async () => go(path, 300));
      await page.waitForURL(`**${path}`, { timeout: 5000 }).catch(() => {});
      await wait(300);
      const mode = await page.evaluate(() => document.documentElement.dataset.mode);
      check(`unrelated route ${path} does not inherit case mode`, mode === "lab", mode);
    }
    await go("/lab/", 400);
    await page.locator(".mode-switch").click();
    await wait(600);
    const onLab = await page.evaluate(() => document.documentElement.dataset.mode);
    await page.locator('a[href="/about/"]').first().click();
    await page.waitForURL("**/about/");
    await wait(400);
    const after = await page.evaluate(() => document.documentElement.dataset.mode);
    check("a toggle on an unpaired page applies to that page only", onLab === "case" && after === "lab", `${onLab} → ${after}`);
    await go("/resume/", 300);
    check("fresh load of /resume/ opens in lab mode", (await page.evaluate(() => document.documentElement.dataset.mode)) === "lab");

    // Keyboard-only: skip link first, then arrow keys move between tabs.
    await go("/financeiq/", 600);
    await page.keyboard.press("Tab");
    check("first Tab reaches the skip link", await page.evaluate(() => document.activeElement?.classList.contains("skip-link")));
    await page.getByRole("tab", { selected: true }).focus();
    await page.keyboard.press("ArrowRight");
    await wait(300);
    check("ArrowRight moves to the next tab", (await page.evaluate(() => document.activeElement?.textContent)).includes("Experiment bench"));
  }

  if (kind === "laptop1280" || kind === "laptop1024") {
    const p = kind;
    await go("/", 1200);
    await shot(page, `${p}-entry`);
    await go("/lab/", 800);
    await shot(page, `${p}-control-room`);
    await go("/sams/", 4200);
    await shot(page, `${p}-sams`);
    await go("/financeiq/", 800);
    await shot(page, `${p}-fiq-pit`);
  }

  if (kind === "mobile") {
    await go("/", 1200);
    await shot(page, "14-mobile-entry");
    await shot(page, "14b-mobile-entry-full", { full: true });
    await go("/lab/", 800);
    await shot(page, "15-mobile-control-room", { full: true });
    await go("/sams/", 4200);
    await shot(page, "16-mobile-sams");
    await shot(page, "16b-mobile-sams-full", { full: true });
    const tb = await page.evaluate(() => {
      const bar = document.querySelector(".tabbar");
      const sel = document.querySelector(".tabs__tab[aria-selected='true']").getBoundingClientRect();
      const scroller = document.querySelector(".tabbar__scroll").getBoundingClientRect();
      return { right: bar.hasAttribute("data-right"), left: bar.hasAttribute("data-left"), activeVisible: sel.left >= scroller.left - 1 && sel.right <= scroller.right + 1 };
    });
    check("mobile SAMS tab bar shows an overflow affordance and the active tab is fully visible", (tb.right || tb.left) && tb.activeVisible, JSON.stringify(tb));
    const nodeFont = await page.evaluate(() => parseFloat(getComputedStyle(document.querySelector(".spine__node")).fontSize));
    check("mobile SAMS topology labels are at least 14px (not a scaled-down diagram)", nodeFont >= 14, `${nodeFont}px`);
    await page.locator(".spine__node", { hasText: "Approval" }).tap();
    await wait(200);
    check("mobile: tap a node to inspect it", (await page.locator(".spine__inspect").textContent()).includes("Approval"));

    await go("/financeiq/", 900);
    await shot(page, "17-mobile-fiq-pit");
    await shot(page, "17b-mobile-fiq-pit-full", { full: true });
    await go("/financeiq/#results", 600);
    const fiqTabs = await page.evaluate(() => {
      const bar = document.querySelector(".tabbar");
      const sel = document.querySelector(".tabs__tab[aria-selected='true']").getBoundingClientRect();
      const scroller = document.querySelector(".tabbar__scroll").getBoundingClientRect();
      return { left: bar.hasAttribute("data-left"), activeVisible: sel.left >= scroller.left - 1 && sel.right <= scroller.right + 1 };
    });
    check("mobile FinanceIQ: deep-linked last tab is scrolled into view", fiqTabs.activeVisible && fiqTabs.left, JSON.stringify(fiqTabs));
    const collisions = await page.evaluate(() => {
      location.hash = "#pit";
      const ticks = [...document.querySelectorAll(".tl__tick")].filter((t) => getComputedStyle(t).display !== "none" && !t.hasAttribute("data-hidden"));
      const handle = document.querySelector(".tl__handle").getBoundingClientRect();
      const boxes = ticks.map((t) => t.getBoundingClientRect());
      const hit = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
      let n = 0;
      for (let i = 0; i < boxes.length; i++) {
        if (hit(boxes[i], handle)) n++;
        for (let j = i + 1; j < boxes.length; j++) if (hit(boxes[i], boxes[j])) n++;
      }
      return n;
    });
    check("mobile PIT axis: no tick/cursor label collisions", collisions === 0, `${collisions} overlaps`);
    await go("/sams/case-study/", 800);
    await shot(page, "18-mobile-sams-case-study");
    await page.locator(".menu-btn").click();
    await wait(300);
    await shot(page, "19-mobile-menu");
  }

  if (kind === "reduced") {
    await go("/sams/", 2500);
    const r = await readout(page);
    check("reduced motion: SAMS demo does not auto-start", r.server === "—", JSON.stringify(r));
    await page.getByRole("button", { name: "Run failure demo" }).first().click();
    await wait(2600);
    await shot(page, "20-reduced-motion-sams");
    await go("/financeiq/", 600);
    await page.getByRole("button", { name: "Reconstruct history" }).last().click();
    await wait(200);
    check("reduced motion: reconstruction jumps to its final state", (await page.locator(".reconstruct").textContent()).includes("dataset ready"));
    await go("/", 4500);
    const seq = await page.locator(".trace__seq[data-head]").textContent();
    check("reduced motion: the entry trace stays still", seq.includes("044"), seq);
  }

  report.pages.push({ name: `${kind}-console-errors`, errors });
  await browser.close();
}

for (const k of ["desktop", "laptop1280", "laptop1024", "mobile", "reduced"]) await run(k);
console.log(JSON.stringify(report, null, 1));
