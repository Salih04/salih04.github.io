// V2 Pass 2 capture + verification script.
// Usage: npm run build && (cd out && python3 -m http.server 4173) & node docs/audit/capture-v2-pass2.mjs
// PLAYWRIGHT_MODULE may point at a playwright index.mjs if it is not resolvable (no dependency is added).
// Post-processing for committed images (ImageMagick): `convert f -colors 192 -strip PNG8:f`.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const BASE = process.env.BASE ?? "http://localhost:4173";
const OUT = new URL("./screenshots/v2-pass2", import.meta.url).pathname;
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

const SIZES = {
  desktop: { viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 },
  w1440: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  w1280: { viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 },
  w1024: { viewport: { width: 1024, height: 768 }, deviceScaleFactor: 1 },
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true },
  reduced: { viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1, reducedMotion: "reduce" },
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

  if (kind === "desktop") {
    await go("/", 1500);
    await shot(page, "01-entry");
    await page.locator(".trace__key--sams").hover();
    await wait(400);
    await shot(page, "02-entry-hover");

    // Entry → Control Room: the trace folds, the route changes promptly, the floor opens.
    await page.mouse.move(5, 5);
    const t0 = Date.now();
    await page.getByRole("link", { name: "Enter S//LAB" }).click();
    await wait(140);
    await shot(page, "02b-entry-transition");
    await page.waitForURL("**/lab/", { timeout: 3000 });
    const navMs = Date.now() - t0;
    const arrived = await page
      .waitForFunction(() => document.documentElement.dataset.arrive, null, { timeout: 1000 })
      .then((h) => h.jsonValue())
      .catch(() => undefined);
    check("Enter S//LAB reaches the Control Room within 900ms and plays the floor arrival", navMs < 900 && arrived === "facility", `${navMs}ms, arrive=${arrived}`);
    await wait(260);
    await shot(page, "03b-control-room-arrival");

    await go("/lab/", 1200);
    await shot(page, "03-control-room");
    await page.locator(".room-tag", { hasText: "SAMS" }).hover();
    await wait(700);
    await shot(page, "04-control-room-room-active");
    const dimmed = await page.evaluate(() => getComputedStyle(document.querySelector(".plan__room--research")).opacity);
    check("Control Room: focusing a room dims the others", Number(dimmed) < 0.6, `opacity ${dimmed}`);
    await page.locator(".room-tag", { hasText: "SAMS" }).click();
    await wait(380);
    await shot(page, "05-control-room-camera");
    await page.waitForURL("**/sams/", { timeout: 5000 });
    check("Control Room click navigates to the room after the camera move", page.url().endsWith("/sams/"));

    // SAMS
    await go("/sams/", 4600);
    await shot(page, "06-sams-initial");

    await go("/sams/", 0);
    await page.waitForFunction(() => document.querySelectorAll(".readout__v")[1]?.textContent?.trim() === "041", null, { timeout: 8000 });
    await page.getByRole("button", { name: "Disconnect client" }).click();
    await page.waitForFunction(() => document.querySelector(".readout__v")?.textContent?.trim() === "047", null, { timeout: 15000 });
    await wait(150);
    const disc = await readout(page);
    const broken = await page.evaluate(() => document.querySelector(".cable")?.getAttribute("data-state"));
    check("disconnected: client cursor frozen at 041 while the server reaches 047; the cable is broken", disc.client === "041" && disc.server === "047" && broken === "disconnected", JSON.stringify({ ...disc, broken }));
    await shot(page, "07-sams-disconnected");
    await page.getByRole("button", { name: "Reconnect client" }).click();
    await wait(1250);
    const mid = await readout(page);
    const resume = await page.locator(".readout__request").textContent();
    check("reconnect sends last_seq=041 and replays through the cursor", resume.includes("last_seq=041") && mid.sync.startsWith("Replaying"), `${resume} · ${JSON.stringify(mid)}`);
    await shot(page, "08-sams-replay");
    await untilText(page, ".readout__sync", "converged", 30000);
    await wait(500);
    const done = await readout(page);
    check("replay converges: client equals server", done.client === done.server, JSON.stringify(done));
    const deliveries = await page.$$eval(".evlog__row[data-delivery]", (rows) => rows.map((r) => r.getAttribute("data-delivery")));
    check("every event delivered exactly once (no pending rows)", deliveries.length > 0 && !deliveries.includes("pending"), deliveries.join(","));
    const verification = await page.$$eval(".verify__rows dd", (dd) => dd.map((d) => d.textContent));
    check("verification readout: continuity PASS, duplicates NONE, convergence PASS", verification.join(",") === "PASS,NONE,PASS", verification.join(","));
    await shot(page, "09-sams-converged");

    // Worker stop / resume.
    await go("/sams/", 0);
    await page.waitForFunction(() => document.querySelector(".readout__v")?.textContent?.trim() === "044", null, { timeout: 12000 });
    await page.getByRole("button", { name: "Stop worker" }).click();
    await wait(1400);
    await shot(page, "09b-sams-worker-stopped");
    await untilText(page, ".evlog", "WORKFLOW_RESUMED", 10000);
    await untilText(page, ".readout__sync", "converged", 30000);
    await wait(400);
    const steps = await page.$$eval(".verify__rows dt", (dt) => dt.map((d) => d.textContent));
    check("stopped worker is replaced, the workflow resumes and no step is re-run", steps.some((s) => s.includes("Steps re-run")) && (await page.locator(".verify__rows").textContent()).includes("NONE"), steps.join(" | "));
    await shot(page, "09c-sams-worker-verified");

    // Focus is kept on the initiating control.
    await go("/sams/", 1800);
    await page.getByRole("button", { name: "Disconnect client" }).focus();
    await page.keyboard.press("Enter");
    await wait(400);
    check("SAMS: focus stays on the connection control", await page.evaluate(() => document.activeElement?.textContent?.includes("Reconnect client")));

    // FinanceIQ
    await go("/financeiq/", 900);
    check("FinanceIQ opens on point-in-time reconstruction", (await page.getByRole("tab", { selected: true }).textContent()).includes("Point-in-time"));
    const plateTop = await page.evaluate(() => document.querySelector(".tl")?.getBoundingClientRect().top);
    check("FinanceIQ: the timeline starts in the first viewport", plateTop < 600, `${Math.round(plateTop)}px`);
    await shot(page, "10-financeiq-pit");
    const vals = await page.locator(".compare__rows dd").allTextContents();
    check("leakage moment: 31 Mar 2020 · naive 1.18 · actually known 1.31", vals[0] === "31 Mar 2020" && vals[1] === "1.18" && vals[2] === "1.31", vals.join(" / "));

    await page.locator(".tl__handle").focus();
    for (let i = 0; i < 3; i++) await page.keyboard.press("ArrowRight");
    check("as-of slider is keyboard operable", (await page.locator(".tl__handle-v").textContent()).includes("21 Apr 2020"), await page.locator(".tl__handle-v").textContent());
    await page.getByRole("button", { name: /Company A · Q1 2020 EPS/ }).click();
    await wait(300);
    check("leaked rows are annotated with a pull back to the cursor", (await page.locator(".tl__pull").count()) > 0);
    await shot(page, "11-financeiq-leakage");

    await go("/financeiq/", 600);
    const recon = page.getByRole("button", { name: "Reconstruct history" });
    await recon.scrollIntoViewIfNeeded();
    await recon.focus();
    await page.keyboard.press("Enter");
    await wait(400);
    check("FinanceIQ: focus stays on the reconstruct control while running", await page.evaluate(() => document.activeElement?.textContent?.includes("Reconstruct")));
    await page.waitForSelector(".recon__done", { timeout: 10000 });
    const stepLabels = await page.$$eval(".recon__label", (l) => l.map((x) => x.textContent));
    check("reconstruction shows five checks ending in an accepted point-in-time record", stepLabels.length === 5 && stepLabels[3] === "Revision excluded" && stepLabels[4] === "Point-in-time record accepted", stepLabels.join(" | "));
    await page.locator(".recon").scrollIntoViewIfNeeded();
    await wait(200);
    await shot(page, "12-financeiq-reconstruction");
    await page.getByRole("button", { name: "Open experiment bench" }).click();
    await wait(600);
    check("reconstruction hands over to the experiment bench", (await page.getByRole("tab", { selected: true }).textContent()).includes("Experiment bench"));

    // Drag the as-of cursor with the pointer.
    await go("/financeiq/", 600);
    const track = page.locator(".tl__row--axis .tl__track");
    const b = await track.boundingBox();
    await page.mouse.move(b.x + b.width * 0.4, b.y + b.height - 6);
    await page.mouse.down();
    await page.mouse.move(b.x + b.width * 0.85, b.y + b.height - 6, { steps: 8 });
    await page.mouse.up();
    const dragged = await page.locator(".tl__handle-v").textContent();
    check("as-of cursor is draggable on the timeline", dragged.includes("2020") && !dragged.includes("31 Mar"), dragged);

    await go("/financeiq/#results", 600);
    await shot(page, "12b-financeiq-negative-results");

    // Case studies
    await go("/sams/case-study/", 900);
    await shot(page, "13-sams-case-study");
    await page.locator(".cs-toc a", { hasText: "Key decisions" }).click();
    await wait(600);
    const decisionsTop = await page.evaluate(() => document.getElementById("decisions")?.getBoundingClientRect().top);
    check("Case Study: contents link scrolls to its section", decisionsTop < 200, `${Math.round(decisionsTop)}px`);
    await go("/financeiq/case-study/", 900);
    await shot(page, "14-financeiq-case-study");

    await go("/archive/", 800);
    await shot(page, "15-archive");

    // Case Study Mode route model.
    await go("/sams/case-study/", 500);
    const m1 = await page.evaluate(() => document.documentElement.dataset.mode);
    await page.locator(".rail .rail-nav__link", { hasText: "FinanceIQ" }).click();
    await page.waitForURL("**/financeiq/case-study/", { timeout: 5000 });
    check("paired routes preserve case mode (SAMS case → FinanceIQ case)", m1 === "case" && page.url().endsWith("/financeiq/case-study/"));
    for (const path of ["/resume/", "/vault/", "/about/", "/notes/"]) {
      await go(path, 300);
      const mode = await page.evaluate(() => document.documentElement.dataset.mode);
      check(`unrelated route ${path} opens in lab mode`, mode === "lab", mode);
    }

    // Keyboard only: skip link, then arrow keys between tabs.
    await go("/financeiq/", 600);
    await page.keyboard.press("Tab");
    check("first Tab reaches the skip link", await page.evaluate(() => document.activeElement?.classList.contains("skip-link")));
    await page.getByRole("tab", { selected: true }).focus();
    await page.keyboard.press("ArrowRight");
    await wait(300);
    check("ArrowRight moves to the next tab", (await page.evaluate(() => document.activeElement?.textContent)).includes("Experiment bench"));
    await go("/", 600);
    const order = [];
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Tab");
      order.push(await page.evaluate(() => document.activeElement?.textContent?.trim().slice(0, 24)));
    }
    check("keyboard reaches both project keys and Enter S//LAB on the entry", order.some((t) => t?.startsWith("02 · Independent")) && order.some((t) => t?.startsWith("03 · MSc")) && order.some((t) => t?.startsWith("EnterS//LAB") || t?.startsWith("Enter")), order.join(" | "));
  }

  if (kind === "w1440" || kind === "w1280" || kind === "w1024") {
    const p = kind.slice(1);
    for (const [path, name, ms] of [
      ["/", "entry", 1200],
      ["/lab/", "control-room", 1000],
      ["/sams/", "sams", 4600],
      ["/financeiq/", "financeiq", 900],
      ["/sams/case-study/", "sams-case-study", 800],
    ]) {
      await go(path, ms);
      await shot(page, `w${p}-${name}`);
    }
    await go("/sams/", 4600);
    const seen = await page.$$eval(".evlog__row[data-delivery]", (rows) => rows.filter((r) => r.getBoundingClientRect().bottom <= window.innerHeight).length);
    check(`${p}: SAMS shows system activity in the first viewport`, seen >= 3, `${seen} event rows visible`);
  }

  if (kind === "mobile") {
    await go("/", 1200);
    await shot(page, "16-mobile-entry");
    await go("/lab/", 800);
    await shot(page, "17-mobile-facility-directory");
    await go("/sams/", 4200);
    await page.locator(".instrument").scrollIntoViewIfNeeded();
    await shot(page, "18-mobile-sams");
    const tb = await page.evaluate(() => {
      const bar = document.querySelector(".tabbar");
      const sel = document.querySelector(".tabs__tab[aria-selected='true']").getBoundingClientRect();
      const scroller = document.querySelector(".tabbar__scroll").getBoundingClientRect();
      return { right: bar.hasAttribute("data-right"), left: bar.hasAttribute("data-left"), activeVisible: sel.left >= scroller.left - 1 && sel.right <= scroller.right + 1 };
    });
    check("mobile SAMS tab bar shows an overflow affordance and the active tab is fully visible", (tb.right || tb.left) && tb.activeVisible, JSON.stringify(tb));
    const order = await page.evaluate(() => {
      const top = (s) => document.querySelector(s).getBoundingClientRect().top;
      return { client: top(".machine__client"), events: top(".machine__events"), system: top(".machine__system") };
    });
    check("mobile SAMS: client state, then events, then topology", order.client < order.events && order.events < order.system, JSON.stringify(order));
    await go("/sams/", 0);
    await page.waitForFunction(() => document.querySelectorAll(".readout__v")[1]?.textContent?.trim() === "041", null, { timeout: 8000 });
    await page.getByRole("button", { name: "Disconnect client" }).tap();
    await page.waitForFunction(() => document.querySelector(".readout__v")?.textContent?.trim() === "046", null, { timeout: 15000 });
    await page.locator(".instrument").scrollIntoViewIfNeeded();
    await shot(page, "19-mobile-sams-disconnected");

    await go("/financeiq/", 900);
    await page.locator(".pit__plate").scrollIntoViewIfNeeded();
    await shot(page, "20-mobile-financeiq-pit");
    await page.getByRole("button", { name: /Company A · Q4 2019 EPS \(corrected\)/ }).tap();
    await page.locator(".compare").scrollIntoViewIfNeeded();
    await wait(200);
    await shot(page, "21-mobile-financeiq-evidence");
    const collisions = await page.evaluate(() => {
      const ticks = [...document.querySelectorAll(".tl__tick")].filter((t) => getComputedStyle(t).color !== "rgba(0, 0, 0, 0)" && t.textContent.trim());
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

    // Mobile tab navigation.
    await go("/financeiq/", 600);
    await page.getByRole("tab", { name: "Results" }).tap();
    await wait(500);
    check("mobile: tapping a tab opens its panel", (await page.getByRole("tab", { selected: true }).textContent()).includes("Results") && (await page.locator("#panel-results").isVisible()));

    await go("/sams/case-study/", 800);
    await shot(page, "22-mobile-case-study");
    await page.locator(".menu-btn").tap();
    await wait(300);
    await shot(page, "23-mobile-menu");
  }

  if (kind === "reduced") {
    await go("/sams/", 2500);
    const r = await readout(page);
    check("reduced motion: SAMS demo does not auto-start", r.server === "—", JSON.stringify(r));
    await page.getByRole("button", { name: "Run failure demo" }).first().click();
    await wait(2600);
    await shot(page, "24-reduced-motion-sams");
    await go("/financeiq/", 600);
    await page.getByRole("button", { name: "Reconstruct history" }).click();
    await wait(200);
    check("reduced motion: reconstruction jumps to its final state", (await page.locator(".recon__done").count()) === 1);
    await go("/", 5200);
    const seq = await page.locator(".trace__ev[data-head] .trace__ev-n").textContent();
    check("reduced motion: the entry trace stays still", seq.includes("044"), seq);
    await page.getByRole("link", { name: "Enter S//LAB" }).click();
    await page.waitForURL("**/lab/", { timeout: 2000 });
    const arrive = await page.evaluate(() => document.documentElement.dataset.arrive ?? "none");
    check("reduced motion: Enter S//LAB navigates at once, without the floor animation", arrive === "none", arrive);
  }

  report.pages.push({ name: `${kind}-console-errors`, errors });
  await browser.close();
}

for (const k of Object.keys(SIZES)) await run(k);
console.log(JSON.stringify(report, null, 1));
