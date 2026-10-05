#!/usr/bin/env node
/**
 * Renders the brand assets from their sources:
 *
 *   scripts/brand/og-image.html  →  public/og.png         (1200×630 social preview)
 *   src/app/icon.svg             →  src/app/apple-icon.png (180×180, full bleed)
 *                                →  src/app/favicon.ico    (16, 32, 48)
 *
 * Run after changing a source: `node scripts/brand/render.mjs`. It needs
 * Playwright, which is not a project dependency; point PLAYWRIGHT_MODULE at
 * any local playwright/index.mjs (for example from `npx playwright`).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const root = new URL("../../", import.meta.url);
const at = (p) => fileURLToPath(new URL(p, root));

const browser = await chromium.launch();

// Social preview.
const og = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await og.goto(pathToFileURL(at("scripts/brand/og-image.html")).href);
await og.evaluate(() => document.fonts.ready);
await og.screenshot({ path: at("public/og.png") });

// Icons. The Apple icon is square and full bleed: iOS applies its own mask.
const svg = readFileSync(at("src/app/icon.svg"), "utf8");
async function png(size, { bleed = false } = {}) {
  const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
  const art = bleed ? svg.replace(/ rx="[\d.]+"/, "") : svg;
  await page.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${art}`);
  const buf = await page.screenshot({ omitBackground: true });
  await page.close();
  return buf;
}
writeFileSync(at("src/app/apple-icon.png"), await png(180, { bleed: true }));

// favicon.ico: an ICO container holding PNG images, which every current browser reads.
const sizes = [16, 32, 48];
const images = [];
for (const s of sizes) images.push(await png(s));
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((s, i) => {
  const e = 6 + 16 * i;
  header.writeUInt8(s, e);
  header.writeUInt8(s, e + 1);
  header.writeUInt16LE(1, e + 4);
  header.writeUInt16LE(32, e + 6);
  header.writeUInt32LE(images[i].length, e + 8);
  header.writeUInt32LE(offset, e + 12);
  offset += images[i].length;
});
writeFileSync(at("src/app/favicon.ico"), Buffer.concat([header, ...images]));

await browser.close();
console.log("Rendered public/og.png, src/app/apple-icon.png, src/app/favicon.ico");
