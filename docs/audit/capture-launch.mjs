// Launch readiness: browser matrix, link audit and accessibility checks.
// Usage: npm run build, serve out/ on :4173 like the static host (404.html with status 404,
// trailing-slash redirects, the headers from vercel.json), then:
//   node docs/audit/capture-launch.mjs > docs/audit/launch-checks.json
// PLAYWRIGHT_MODULE may point at a playwright index.mjs (no dependency is added).
// EXTERNAL=1 also requests the external links. Images: `magick f -colors 192 -strip PNG8:f`.
import { mkdirSync } from "node:fs";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const BASE = process.env.BASE ?? "http://localhost:4173";
const OUT = new URL("./screenshots/launch", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const report = { matrix: [], links: {}, a11y: [], focus: [], checks: [] };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const check = (name, pass, detail = "") => report.checks.push({ name, pass: Boolean(pass), detail: typeof detail === "string" ? detail : JSON.stringify(detail) });

const SIZES = {
  d1600: { viewport: { width: 1600, height: 1000 } },
  d1440: { viewport: { width: 1440, height: 900 } },
  d1280: { viewport: { width: 1280, height: 720 } },
  d1024: { viewport: { width: 1024, height: 768 } },
  m390: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
  r1440: { viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" },
};
/** Every scenario is measured at every size; screenshots are kept for these. */
const SHOTS = {
  d1440: "all",
  m390: "all",
  r1440: ["entry", "control-room", "sams-converged", "financeiq-reconstruction"],
  d1600: ["entry", "control-room", "sams-initial", "financeiq-pit"],
  d1280: ["entry", "control-room", "sams-initial", "financeiq-pit"],
  d1024: ["entry", "control-room", "sams-initial", "financeiq-pit"],
};

const go = async (page, path, ms = 900) => {
  const res = await page.goto(BASE + path, { waitUntil: "networkidle" });
  await wait(ms);
  return res;
};
const readout = (page) => page.evaluate(() => [...document.querySelectorAll(".readout__v")].map((c) => c.textContent?.trim()));

async function samsToDisconnected(page) {
  await go(page, "/sams/", 0);
  // Under reduced motion the run does not start on arrival; the visitor starts it.
  if (await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)) await page.getByRole("button", { name: "Run failure demo" }).click();
  await page.waitForFunction(() => document.querySelectorAll(".readout__v")[1]?.textContent?.trim() === "041", null, { timeout: 15000 });
  await page.getByRole("button", { name: "Disconnect client" }).click();
  await page.waitForFunction(() => document.querySelector(".readout__v")?.textContent?.trim() === "047", null, { timeout: 15000 });
  await wait(200);
  await page.locator(".machine").scrollIntoViewIfNeeded();
}

/** name → (page, ctx) => { status?, notes? } */
const SCENARIOS = {
  entry: async (p) => ({ status: (await go(p, "/", 1400)).status() }),
  "control-room": async (p) => ({ status: (await go(p, "/lab/", 1200)).status() }),
  "sams-initial": async (p) => {
    const status = (await go(p, "/sams/", 2000)).status();
    return { status };
  },
  "sams-disconnect": async (p) => {
    await samsToDisconnected(p);
    const [server, client] = await readout(p);
    return { notes: { server, client }, ok: server === "047" && client === "041" };
  },
  "sams-converged": async (p) => {
    await samsToDisconnected(p);
    await p.getByRole("button", { name: "Reconnect client" }).click();
    await p.waitForFunction(() => document.querySelector(".readout__sync")?.textContent?.includes("converged"), null, { timeout: 30000 });
    await wait(400);
    const v = await p.$$eval(".verify__rows dd", (dd) => dd.map((d) => d.textContent).join(","));
    await p.locator(".machine").scrollIntoViewIfNeeded();
    return { notes: { verification: v }, ok: v === "PASS,NONE,PASS" };
  },
  "sams-architecture": async (p) => {
    await go(p, "/sams/#architecture", 900);
    await p.locator(".apath").scrollIntoViewIfNeeded();
    return { ok: (await p.locator(".apath__node").count()) === 7 };
  },
  "sams-case-study": async (p) => ({ status: (await go(p, "/sams/case-study/", 900)).status() }),
  "financeiq-pit": async (p) => {
    await go(p, "/financeiq/", 900);
    const vals = await p.locator(".compare__rows dd").allTextContents();
    return { ok: vals[0] === "31 Mar 2020" && vals[1] === "1.18" && vals[2] === "1.31", notes: vals.slice(0, 3) };
  },
  "financeiq-reconstruction": async (p) => {
    await go(p, "/financeiq/", 600);
    await p.locator(".recon").scrollIntoViewIfNeeded();
    await p.getByRole("button", { name: "Reconstruct history" }).click();
    await p.waitForSelector('.recon[data-state="done"]', { timeout: 20000 });
    await wait(300);
    await p.locator(".recon").scrollIntoViewIfNeeded();
    return { ok: true };
  },
  "financeiq-negative-results": async (p) => {
    await go(p, "/financeiq/#results", 900);
    await p.locator("#financeiq-tabs").scrollIntoViewIfNeeded();
    return { ok: (await p.getByRole("tab", { name: "Results" }).getAttribute("aria-selected")) === "true" };
  },
  "financeiq-case-study": async (p) => ({ status: (await go(p, "/financeiq/case-study/", 900)).status() }),
  archive: async (p) => ({ status: (await go(p, "/archive/", 700)).status() }),
  about: async (p) => ({ status: (await go(p, "/about/", 700)).status() }),
  resume: async (p) => ({ status: (await go(p, "/resume/", 700)).status() }),
  contact: async (p) => ({ status: (await go(p, "/contact/", 700)).status() }),
  "not-found": async (p) => {
    const res = await go(p, "/no-such-room/", 700);
    return { status: res.status(), ok: res.status() === 404 && (await p.locator("h1").textContent()) === "This room does not exist." };
  },
  "mobile-menu": async (p) => {
    await go(p, "/lab/", 700);
    const btn = p.locator(".menu-btn");
    if (!(await btn.isVisible())) return { skipped: "menu button hidden at this width (rail visible)" };
    await btn.click();
    await wait(300);
    const open = await p.evaluate(() => ({ expanded: document.querySelector(".menu-btn")?.getAttribute("aria-expanded"), hidden: document.getElementById("pocket-menu")?.hidden }));
    await p.keyboard.press("Escape");
    await wait(150);
    const closed = await p.evaluate(() => document.getElementById("pocket-menu")?.hidden);
    await btn.click();
    await wait(300);
    return { ok: open.expanded === "true" && open.hidden === false && closed === true, notes: { open, closedByEscape: closed } };
  },
};

async function pageMetrics(page) {
  return page.evaluate(() => {
    const vw = window.innerWidth;
    let small = 0;
    const clipped = [];
    for (const el of document.querySelectorAll("body *")) {
      const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      if (!hasText) continue;
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden" || el.closest("[hidden],.sr-only,[aria-hidden='true']")) continue;
      const r = el.getBoundingClientRect();
      if (r.width <= 1 || r.height <= 1) continue; // visually hidden text for assistive technology
      if (parseFloat(cs.fontSize) < 11.95) small++;
      const hides = /hidden|clip/.test(cs.overflowX) && cs.textOverflow !== "ellipsis";
      if (hides && el.scrollWidth > el.clientWidth + 1) clipped.push(`${el.className || el.tagName}: ${el.textContent.trim().slice(0, 30)}`);
    }
    const brokenImages = [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src);
    return { overflow: document.documentElement.scrollWidth - vw, small, clipped: clipped.slice(0, 5), brokenImages };
  });
}

/** Accessibility checks that need no external checker. */
async function audit(page, touch) {
  return page.evaluate((touch) => {
    const visible = (el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && !el.closest("[hidden],[inert]");
    };
    const text = (el) => (el?.textContent ?? "").replace(/\s+/g, " ").trim();
    const name = (el) => {
      if (el.getAttribute("aria-label")?.trim()) return el.getAttribute("aria-label").trim();
      const by = el.getAttribute("aria-labelledby");
      if (by) return by.split(/\s+/).map((id) => text(document.getElementById(id))).join(" ").trim();
      if (el.labels?.length) return text(el.labels[0]);
      const t = [...el.querySelectorAll("*")].length ? (el.innerText ?? "").trim() : text(el);
      return t || el.getAttribute("title") || el.querySelector("img[alt]")?.alt || el.querySelector("svg title")?.textContent || "";
    };
    const desc = (el) => `${el.tagName.toLowerCase()}.${String(el.className).split(" ")[0]}`;
    const interactive = [
      ...document.querySelectorAll('a[href],button,input,select,textarea,[role="button"],[role="switch"],[role="slider"],[role="tab"],[tabindex]:not([tabindex="-1"])'),
    ].filter(visible);
    const unnamed = interactive.filter((el) => !name(el)).map(desc);

    const headings = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].filter((h) => !h.closest("[hidden]"));
    const levels = headings.map((h) => Number(h.tagName[1]));
    const skips = [];
    levels.forEach((l, i) => i > 0 && l > levels[i - 1] + 1 && skips.push(`h${levels[i - 1]}→h${l} "${text(headings[i]).slice(0, 30)}"`));

    const ids = [...document.querySelectorAll("[id]")].map((e) => e.id);
    const dupIds = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
    const brokenRefs = [...document.querySelectorAll("[aria-labelledby],[aria-controls],[aria-describedby]")].flatMap((el) =>
      ["aria-labelledby", "aria-controls", "aria-describedby"].flatMap((a) => (el.getAttribute(a) ?? "").split(/\s+/).filter((id) => id && !document.getElementById(id)).map((id) => `${a}=${id}`)),
    );

    // Contrast: text colour over the nearest opaque background, with ancestor opacity applied.
    const rgba = (s) => (s.match(/[\d.]+/g) ?? [0, 0, 0, 0]).map(Number).concat(s.startsWith("rgba") ? [] : [1]).slice(0, 4);
    const lum = ([r, g, b]) => {
      const f = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const blend = (fg, bg, a) => fg.slice(0, 3).map((c, i) => c * a + bg[i] * (1 - a));
    const lowContrast = [];
    let measured = 0;
    for (const el of document.querySelectorAll("body *")) {
      if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
      if (!visible(el) || el.closest("[aria-hidden='true'],.sr-only,[disabled],[aria-disabled='true']")) continue;
      const cs = getComputedStyle(el);
      let bg = null;
      let opacity = 1;
      for (let n = el; n; n = n.parentElement) {
        const ns = getComputedStyle(n);
        opacity *= Number(ns.opacity);
        if (ns.backgroundImage !== "none" && !bg) {
          bg = "image";
          break;
        }
        const b = rgba(ns.backgroundColor);
        if (!bg && b[3] >= 0.99) bg = b;
      }
      if (bg === "image") continue;
      bg ??= rgba(getComputedStyle(document.body).backgroundColor);
      const fg = rgba(cs.color);
      const c = blend(fg, bg, fg[3] * opacity);
      const [l1, l2] = [lum(c), lum(bg)].sort((a, b) => b - a);
      const ratio = (l1 + 0.05) / (l2 + 0.05);
      const size = parseFloat(cs.fontSize);
      const large = size >= 24 || (size >= 18.66 && Number(cs.fontWeight) >= 700);
      measured++;
      if (ratio < (large ? 3 : 4.5)) lowContrast.push(`${desc(el)} "${text(el).slice(0, 24)}" ${ratio.toFixed(2)}`);
    }

    // Touch targets, WCAG 2.2 SC 2.5.8 (AA): at least 24×24 CSS px, or an undersized target whose
    // 24px circle overlaps no other target or other undersized target's circle. Links in running text are exempt.
    const smallTargets = [];
    const undersized = [];
    if (touch) {
      const rects = interactive.map((el) => [el, el.getBoundingClientRect()]);
      for (const [el, r] of rects) {
        const inline = el.tagName === "A" && getComputedStyle(el).display === "inline" && el.parentElement && /^(P|LI|DD|SPAN|FIGCAPTION|TD)$/.test(el.parentElement.tagName) && text(el.parentElement).length > text(el).length + 2;
        if (inline || (r.width >= 24 && r.height >= 24)) continue;
        const c = [r.left + r.width / 2, r.top + r.height / 2];
        const dist = (q) => Math.hypot(Math.max(q.left - c[0], 0, c[0] - q.right), Math.max(q.top - c[1], 0, c[1] - q.bottom));
        const crowded = rects.some(([o, q]) => o !== el && !o.contains(el) && !el.contains(o) && (dist(q) < 12 || ((q.width < 24 || q.height < 24) && Math.hypot(q.left + q.width / 2 - c[0], q.top + q.height / 2 - c[1]) < 24)));
        const label = `${desc(el)} "${name(el).slice(0, 20)}" ${Math.round(r.width)}×${Math.round(r.height)}`;
        (crowded ? smallTargets : undersized).push(label);
      }
    }

    return {
      lang: document.documentElement.lang,
      title: document.title,
      h1: levels.filter((l) => l === 1).length,
      skips,
      landmarks: { main: document.querySelectorAll("main").length, nav: [...document.querySelectorAll("nav")].map((n) => n.getAttribute("aria-label") ?? "(unlabelled)") },
      unnamed,
      imgsNoAlt: [...document.querySelectorAll("img:not([alt])")].length,
      dupIds,
      brokenRefs,
      contrast: { measured, failures: lowContrast.slice(0, 10), count: lowContrast.length },
      smallTargets,
      undersizedButSpaced: undersized,
    };
  }, touch);
}

/** Tab through the page; every focus stop must look different from its unfocused state. */
async function focusWalk(page, path, stops = 30) {
  await go(page, path, 800);
  const seen = [];
  for (let i = 0; i < stops; i++) {
    await page.keyboard.press("Tab");
    const s = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      el.dataset.focusProbe = String(Date.now() + Math.random());
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return { probe: el.dataset.focusProbe, label: (el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 28), style: [cs.outlineStyle, cs.outlineWidth, cs.outlineColor, cs.boxShadow, cs.backgroundColor, cs.borderColor, cs.color, cs.textDecorationLine].join("|"), onScreen: r.bottom > 0 && r.top < innerHeight && r.width > 0 };
    });
    if (s) seen.push(s);
  }
  await page.evaluate(() => document.activeElement?.blur());
  const missing = [];
  for (const s of seen) {
    const rest = await page.evaluate((probe) => {
      const el = document.querySelector(`[data-focus-probe="${probe}"]`);
      if (!el) return null;
      const cs = getComputedStyle(el);
      return [cs.outlineStyle, cs.outlineWidth, cs.outlineColor, cs.boxShadow, cs.backgroundColor, cs.borderColor, cs.color, cs.textDecorationLine].join("|");
    }, s.probe);
    if (rest !== null && rest === s.style) missing.push(s.label);
  }
  return { path, stops: seen.length, order: seen.map((s) => s.label), offScreen: seen.filter((s) => !s.onScreen).map((s) => s.label), noIndicator: missing };
}

async function run(kind) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ deviceScaleFactor: 1, ...SIZES[kind] });
  const page = await ctx.newPage();
  let errors = [];
  let failed = [];
  page.on("console", (m) => m.type() === "error" && !/status of 404/.test(m.text()) && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("response", (r) => r.status() >= 400 && !r.url().includes("/no-such-room/") && failed.push(`${r.status()} ${r.url()}`));
  // Requests aborted by the next navigation (route prefetches) are not missing assets.
  page.on("requestfailed", (r) => r.failure()?.errorText !== "net::ERR_ABORTED" && failed.push(`failed ${r.url()} ${r.failure()?.errorText}`));

  for (const [name, fn] of Object.entries(SCENARIOS)) {
    errors = [];
    failed = [];
    let result;
    try {
      result = await fn(page);
    } catch (e) {
      result = { error: String(e).split("\n")[0] };
    }
    const m = await pageMetrics(page);
    const keep = SHOTS[kind] === "all" || SHOTS[kind]?.includes(name);
    if (keep && !result.skipped) await page.screenshot({ path: `${OUT}/${kind}-${name}.png` });
    report.matrix.push({ size: kind, scenario: name, ...result, ...m, errors, failed });
    if (kind === "d1440" || kind === "m390") {
      if (!["sams-disconnect", "sams-converged", "financeiq-reconstruction", "mobile-menu"].includes(name)) report.a11y.push({ size: kind, scenario: name, ...(await audit(page, kind === "m390")) });
    }
  }

  if (kind === "d1440") {
    // Keyboard focus order and visible focus on the main pages.
    for (const path of ["/", "/lab/", "/sams/", "/financeiq/", "/sams/case-study/", "/archive/", "/contact/", "/resume/"]) report.focus.push(await focusWalk(page, path));

    // Case Study Mode: a switch, and on a paired route it navigates to the partner.
    await go(page, "/sams/", 600);
    const sw = page.getByRole("switch", { name: /case/i });
    const before = await sw.getAttribute("aria-checked");
    await sw.click();
    await page.waitForURL("**/sams/case-study/", { timeout: 5000 });
    await wait(500);
    const after = await page.getByRole("switch", { name: /case/i }).getAttribute("aria-checked");
    const railSams = await page.locator(".rail .rail-nav a", { hasText: "SAMS" }).getAttribute("href");
    check("Case Study Mode toggle is a switch; on /sams/ it moves to /sams/case-study/ and the rail follows", before === "false" && after === "true" && railSams === "/sams/case-study/", { before, after, railSams });
    await page.getByRole("switch", { name: /case/i }).click();
    await page.waitForURL("**/sams/", { timeout: 5000 });
    check("Case Study Mode toggles back to the lab", page.url().endsWith("/sams/"));

    // FinanceIQ cursor: a slider operable from the keyboard.
    await go(page, "/financeiq/", 800);
    const slider = page.getByRole("slider", { name: "As-of date" });
    await slider.focus();
    const v0 = Number(await slider.getAttribute("aria-valuenow"));
    await page.keyboard.press("ArrowRight");
    const v1 = Number(await slider.getAttribute("aria-valuenow"));
    await page.keyboard.press("End");
    const vEnd = Number(await slider.getAttribute("aria-valuenow"));
    const vMax = Number(await slider.getAttribute("aria-valuemax"));
    check("FinanceIQ as-of cursor: role=slider, arrow keys and End move it", v1 === v0 + 7 && vEnd === vMax, { v0, v1, vEnd, vMax, text: await slider.getAttribute("aria-valuetext") });

    // SAMS simulation controls: named buttons, keyboard operable.
    await go(page, "/sams/", 0);
    await page.waitForFunction(() => document.querySelectorAll(".readout__v")[1]?.textContent?.trim() === "041", null, { timeout: 15000 });
    const disc = page.getByRole("button", { name: "Disconnect client" });
    await disc.focus();
    await page.keyboard.press("Enter");
    await wait(300);
    check("SAMS controls work from the keyboard (Enter on Disconnect client)", await page.getByRole("button", { name: "Reconnect client" }).isVisible());
    const controls = await page.$$eval('[aria-label="Demo controls"] button', (b) => b.map((x) => x.textContent.trim()));
    report.links.samsControls = controls;

    // Terminal is optional: opened with ~, a modal dialog, closed with Escape, focus returned.
    await go(page, "/lab/", 600);
    await page.locator("main").focus();
    await page.keyboard.press("Shift+Backquote");
    await wait(300);
    const term = await page.evaluate(() => ({ dialog: !!document.querySelector('[role="dialog"][aria-modal="true"]'), focusInside: !!document.activeElement?.closest('[role="dialog"]') }));
    await page.keyboard.press("Escape");
    await wait(300);
    const closed = await page.evaluate(() => !document.querySelector('[role="dialog"][aria-modal="true"]'));
    check("Terminal is optional: ~ opens a modal dialog with focus inside, Escape closes it", term.dialog && term.focusInside && closed, { ...term, closed });
    const navWithoutTerminal = await page.$$eval(".rail .rail-nav a", (a) => a.length);
    check("Every room is reachable without the terminal (rail links)", navWithoutTerminal >= 7, `${navWithoutTerminal} rail links`);

    // Link audit: every href on every public page.
    const pages = ["/", "/lab/", "/sams/", "/sams/case-study/", "/financeiq/", "/financeiq/case-study/", "/case-studies/", "/archive/", "/vault/", "/notes/", "/about/", "/resume/", "/contact/", "/no-such-room/"];
    const sitemap = await (await page.request.get(BASE + "/sitemap.xml")).text();
    const hrefs = new Map();
    for (const path of pages) {
      await go(page, path, 300);
      for (const h of await page.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href")))) if (!hrefs.has(h)) hrefs.set(h, path);
    }
    await go(page, "/notes/", 300);
    for (const h of await page.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href")))) if (!hrefs.has(h)) hrefs.set(h, "/notes/");
    const internal = [];
    const external = [];
    const malformed = [];
    for (const [href, from] of hrefs) {
      if (/^https?:\/\//.test(href)) external.push(href);
      else if (href.startsWith("/") || href.startsWith("#")) internal.push([href, from]);
      else if (href.startsWith("mailto:")) internal.push([href, from]);
      else malformed.push(`${href} (on ${from})`);
    }
    const broken = [];
    for (const [href, from] of internal) {
      if (href.startsWith("mailto:")) continue;
      const [path, hash] = href.startsWith("#") ? [from, href.slice(1)] : href.split("#");
      const res = await page.request.get(BASE + path, { maxRedirects: 0 });
      if (res.status() !== 200) broken.push(`${href} → ${res.status()} (on ${from})`);
      if (!path.endsWith("/")) broken.push(`${href} has no trailing slash (on ${from})`);
      if (hash) {
        await go(page, `${path}#${hash}`, 500);
        const ok = await page.evaluate((h) => !!document.getElementById(h) || document.querySelector(`[role="tab"][aria-selected="true"]`)?.id?.includes(h) || location.hash === `#${h}` && !!document.querySelector(`[role="tab"][aria-selected="true"]`), hash);
        if (!ok) broken.push(`${href}: no target for #${hash} (on ${from})`);
      }
    }
    const externalStatus = {};
    for (const href of external) {
      if (!href.startsWith("https://")) malformed.push(`${href} is not https`);
      if (!process.env.EXTERNAL) continue;
      // GitHub rate-limits bursts (429); back off and retry rather than report a false failure.
      for (let attempt = 0; attempt < 4; attempt++) {
        externalStatus[href] = (await page.request.get(href, { timeout: 20000 }).catch(() => ({ status: () => "error" }))).status();
        if (externalStatus[href] !== 429) break;
        await wait(5000 * (attempt + 1));
      }
      await wait(1000);
    }
    report.links = { ...report.links, internal: internal.map(([h]) => h), external, externalStatus, broken, malformed, sitemapUrls: (sitemap.match(/<loc>/g) ?? []).length };
    check("link audit: every internal link resolves (200, trailing slash, hash target present)", broken.length === 0, broken.join(" | "));
    check("link audit: no malformed hrefs; external links use https", malformed.length === 0, malformed.join(" | "));
    if (process.env.EXTERNAL) check("link audit: external public links respond 200", Object.values(externalStatus).every((s) => s === 200), externalStatus);

    // Assets the head and the host rely on.
    const assets = {};
    for (const a of ["/og.png", "/favicon.ico", "/icon.svg", "/apple-icon.png", "/robots.txt", "/sitemap.xml"]) {
      const r = await page.request.get(BASE + a);
      assets[a] = `${r.status()} ${r.headers()["content-type"]}`;
    }
    report.links.assets = assets;
    check("brand and crawler assets are served (og.png, favicon.ico, icon.svg, apple-icon.png, robots.txt, sitemap.xml)", Object.values(assets).every((s) => s.startsWith("200")), assets);
    const icons = await go(page, "/", 200).then(() => page.$$eval('link[rel="icon"],link[rel="apple-touch-icon"]', (l) => l.map((x) => x.getAttribute("href"))));
    check("head links the favicon, SVG icon and Apple touch icon", icons.length === 3, icons.join(" "));
    const headers = (await page.request.get(BASE + "/")).headers();
    check("hosting headers present (nosniff, referrer policy, permissions policy, frame-ancestors)", headers["x-content-type-options"] === "nosniff" && !!headers["referrer-policy"] && !!headers["permissions-policy"] && /frame-ancestors 'none'/.test(headers["content-security-policy"] ?? ""), headers["content-security-policy"]);
  }

  if (kind === "m390") {
    await go(page, "/sams/", 400);
    const sw = await page.evaluate(() => {
      const el = document.querySelector('[role="switch"]');
      return { name: el?.textContent?.replace(/\s+/g, " ").trim(), visible: el?.querySelector(".mode-switch__long")?.getBoundingClientRect().width };
    });
    check("mobile: the Case Study switch keeps its full accessible name while showing the short label", sw.name === "Case study" && sw.visible <= 1, sw);
  }

  if (kind === "r1440") {
    await go(page, "/", 1000);
    await page.getByRole("link", { name: "Enter S//LAB" }).click();
    await page.waitForURL("**/lab/", { timeout: 2000 });
    const state = await page.evaluate(() => ({ arrive: document.documentElement.dataset.arrive ?? "none", bridge: !!document.querySelector(".bridge") }));
    check("reduced motion: Enter S//LAB navigates at once, no bridge or floor animation", state.arrive === "none" && !state.bridge, state);
  }

  await browser.close();
}

for (const k of Object.keys(SIZES)) await run(k);

const m = report.matrix;
const bad = (f) => m.filter(f).map((r) => `${r.size}/${r.scenario}`);
check("matrix: every scenario ran without a script error", bad((r) => r.error).length === 0, m.filter((r) => r.error).map((r) => `${r.size}/${r.scenario}: ${r.error}`).join(" | "));
check("matrix: scenario expectations hold (SAMS states, PIT values, 404 status, menu)", bad((r) => r.ok === false).length === 0, bad((r) => r.ok === false).join(", "));
check("matrix: no page-level horizontal overflow", bad((r) => r.overflow > 0).join(",") === "", bad((r) => r.overflow > 0).join(", "));
check("matrix: no console errors", bad((r) => r.errors.length).length === 0, m.filter((r) => r.errors.length).map((r) => `${r.size}/${r.scenario}: ${r.errors[0]}`).join(" | "));
check("matrix: no missing assets or failed requests", bad((r) => r.failed.length).length === 0, m.filter((r) => r.failed.length).map((r) => `${r.size}/${r.scenario}: ${r.failed[0]}`).join(" | "));
check("matrix: no broken images", bad((r) => r.brokenImages?.length).length === 0);
check("matrix: no visible text under 12px", bad((r) => r.small > 0).length === 0, m.filter((r) => r.small > 0).map((r) => `${r.size}/${r.scenario}:${r.small}`).join(", "));
check("matrix: no clipped text", bad((r) => r.clipped?.length).length === 0, m.filter((r) => r.clipped?.length).map((r) => `${r.size}/${r.scenario}: ${r.clipped[0]}`).join(" | "));

const a = report.a11y;
const abad = (f) => a.filter(f).map((r) => `${r.size}/${r.scenario}`);
check("a11y: html lang set and one h1 per page", abad((r) => r.lang !== "en" || r.h1 !== 1).length === 0, abad((r) => r.lang !== "en" || r.h1 !== 1).join(", "));
check("a11y: no skipped heading levels", abad((r) => r.skips.length).length === 0, a.filter((r) => r.skips.length).map((r) => `${r.scenario}: ${r.skips[0]}`).join(" | "));
check("a11y: one main landmark; every nav is labelled", abad((r) => r.landmarks.main !== 1 || r.landmarks.nav.includes("(unlabelled)")).length === 0);
check("a11y: every visible control has an accessible name", abad((r) => r.unnamed.length).length === 0, a.filter((r) => r.unnamed.length).map((r) => `${r.size}/${r.scenario}: ${r.unnamed.join(",")}`).join(" | "));
check("a11y: no duplicate ids; aria references resolve", abad((r) => r.dupIds.length || r.brokenRefs.length).length === 0, a.filter((r) => r.dupIds.length || r.brokenRefs.length).map((r) => `${r.scenario}: ${[...r.dupIds, ...r.brokenRefs].join(",")}`).join(" | "));
check("a11y: text contrast meets WCAG AA (4.5:1, 3:1 for large text)", abad((r) => r.contrast.count).length === 0, a.filter((r) => r.contrast.count).map((r) => `${r.size}/${r.scenario}: ${r.contrast.failures.join("; ")}`).join(" | "));
check("a11y: mobile touch targets meet WCAG 2.5.8 (24×24 px, or spaced)", abad((r) => r.smallTargets.length).length === 0, a.filter((r) => r.smallTargets.length).map((r) => `${r.scenario}: ${r.smallTargets.join("; ")}`).join(" | "));
check("a11y: every keyboard focus stop has a visible indicator", report.focus.every((f) => f.noIndicator.length === 0), report.focus.filter((f) => f.noIndicator.length).map((f) => `${f.path}: ${f.noIndicator.join(", ")}`).join(" | "));
check("a11y: first Tab on every page reaches the skip link", report.focus.every((f) => f.order[0] === "Skip to content"), report.focus.map((f) => f.order[0]).join(","));
console.log(JSON.stringify(report, null, 1));
