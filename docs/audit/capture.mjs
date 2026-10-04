// V1 audit capture script. Usage: npm run build && python3 -m http.server 4173 --directory out & node docs/audit/capture.mjs
// Set PLAYWRIGHT_MODULE to the path of a playwright index.mjs if it is not resolvable (no dependency is added to package.json).
// Post-processing used for the committed images (ImageMagick): mobile shots resized 50% and all PNGs quantised with `convert f -colors 192 -strip PNG8:f`.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const BASE = "http://localhost:4173";
const OUT = new URL("./screenshots/v1", import.meta.url).pathname;
const report = [];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function metrics(page, name) {
  const m = await page.evaluate(() => {
    const vw = window.innerWidth;
    const overflow = document.documentElement.scrollWidth - vw;
    const offenders = [];
    for (const el of document.querySelectorAll("body *")) {
      const r = el.getBoundingClientRect();
      if (r.width && (r.right > vw + 1) && getComputedStyle(el).position !== "fixed") {
        offenders.push((el.className && el.className.baseVal === undefined ? el.className : el.tagName) + " r=" + Math.round(r.right));
      }
    }
    const small = {};
    for (const el of document.querySelectorAll("body *")) {
      if (!el.childNodes.length) continue;
      const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      if (!hasText) continue;
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden") continue;
      const fs = parseFloat(cs.fontSize);
      if (fs < 12) small[fs] = (small[fs] || 0) + 1;
    }
    return { overflow, offenders: offenders.slice(0, 8), small, height: document.documentElement.scrollHeight };
  });
  report.push({ name, ...m });
}

async function shot(page, name, { full = false } = {}) {
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: full });
  await metrics(page, name);
}

async function run(device) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext(device === "d"
    ? { viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 }
    : { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  const P = device === "d" ? "desktop" : "mobile";
  const go = async (path, ms = 900) => { await page.goto(BASE + path, { waitUntil: "networkidle" }); await wait(ms); };

  // Entry
  await go("/", 2500);
  await shot(page, `${P}-01-entry`);
  await shot(page, `${P}-01b-entry-full`, { full: true });
  if (device === "d") {
    await page.hover(".entry__enter"); await wait(300);
    await shot(page, `${P}-02-entry-hover-enter`);
  }

  // Control room
  await go("/lab/", 1200);
  await shot(page, `${P}-03-lab-default`);
  await shot(page, `${P}-03b-lab-full`, { full: true });
  if (device === "d") {
    const room = page.locator(".room").first();
    await room.scrollIntoViewIfNeeded();
    const b = await room.boundingBox();
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await wait(500);
    await shot(page, `${P}-04-lab-room-selected`);
  }

  // SAMS
  await go("/sams/", 7000);
  await shot(page, `${P}-05-sams-live`);
  await shot(page, `${P}-05b-sams-live-full`, { full: true });
  await page.getByRole("button", { name: "Observe system" }).click();
  await wait(5200);
  await shot(page, `${P}-06-sams-observe-mid`);
  await page.getByRole("button", { name: "Skip to end" }).click(); await wait(600);
  await shot(page, `${P}-07-sams-observe-complete`);
  await page.keyboard.press("Escape"); await wait(400);
  await go("/sams/#architecture", 1000);
  await shot(page, `${P}-08-sams-architecture`);
  await shot(page, `${P}-08b-sams-architecture-full`, { full: true });
  await go("/sams/#engineering", 1000);
  await shot(page, `${P}-09-sams-engineering`);
  await shot(page, `${P}-09b-sams-engineering-full`, { full: true });
  await go("/sams/case-study/", 1000);
  await shot(page, `${P}-10-sams-case-study`);
  await shot(page, `${P}-10b-sams-case-study-full`, { full: true });

  // FinanceIQ
  await go("/financeiq/", 1000);
  await shot(page, `${P}-11-fiq-console`);
  await page.locator(".console__run").click(); await wait(2400);
  await shot(page, `${P}-12a-fiq-console-running`, { full: device === "m" });
  await wait(2600);
  await shot(page, `${P}-12-fiq-console-pit-result`, { full: true });
  await page.locator(".field--switch input").uncheck();
  await page.locator(".console__run").click(); await wait(5200);
  await shot(page, `${P}-13-fiq-console-leak-result`, { full: true });
  await go("/financeiq/#pipeline", 900);
  await shot(page, `${P}-14-fiq-pipeline`);
  await go("/financeiq/#pit", 900);
  await shot(page, `${P}-15-fiq-pit-naive`);
  await shot(page, `${P}-15b-fiq-pit-naive-full`, { full: true });
  await page.getByRole("radio", { name: "Point-in-time dataset" }).click(); await wait(400);
  await shot(page, `${P}-16-fiq-pit-pointintime`, { full: true });
  await page.locator(".reconstruct .btn--research").click(); await wait(2300);
  await shot(page, `${P}-17a-fiq-reconstruct-mid`, { full: true });
  await wait(5000);
  await shot(page, `${P}-17-fiq-reconstruct-complete`, { full: true });
  await go("/financeiq/#validation", 900);
  await shot(page, `${P}-18-fiq-validation`, { full: true });
  await go("/financeiq/#results", 900);
  await shot(page, `${P}-19-fiq-results`);
  await shot(page, `${P}-19b-fiq-results-failed-full`, { full: true });
  await go("/financeiq/case-study/", 1000);
  await shot(page, `${P}-20-fiq-case-study`);
  await shot(page, `${P}-20b-fiq-case-study-full`, { full: true });

  // Other
  for (const [path, n] of [["/case-studies/", "21-case-studies"], ["/archive/", "22-archive"], ["/vault/", "23-vault"], ["/notes/", "24-notes"], ["/notes/designing-replayable-event-systems/", "25-note-detail"], ["/about/", "26-about"], ["/resume/", "27-resume"], ["/contact/", "28-contact"], ["/does-not-exist/", "29-404"]]) {
    await go(path, 800);
    await shot(page, `${P}-${n}`, { full: true });
  }
  // Terminal
  await go("/lab/", 800);
  if (device === "d") { await page.keyboard.press("Backquote"); } else { await page.getByRole("button", { name: "Open terminal" }).click(); }
  await wait(900);
  await page.keyboard.type("help"); await page.keyboard.press("Enter"); await wait(300);
  await page.keyboard.type("status"); await page.keyboard.press("Enter"); await wait(400);
  await shot(page, `${P}-30-terminal`);
  await page.keyboard.press("Escape"); await wait(300);
  if (device === "m") {
    await go("/sams/", 800);
    await page.locator(".menu-btn").click(); await wait(400);
    await shot(page, `${P}-31-menu-open`);
  }
  // Case mode on non-paired page
  await go("/lab/", 600);
  await page.locator(".mode-switch").click(); await wait(1000);
  await shot(page, `${P}-32-lab-in-case-mode`, { full: true });
  await page.locator(".mode-switch").click(); await wait(800);

  report.push({ name: `${P}-console-errors`, errors });
  await browser.close();
}

await run("d");
await run("m");
console.log(JSON.stringify(report, null, 1));
