"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { FIGURE_KINDS } from "@/components/records/FigureLabel";
import { primaryNav, reportsNav, secondaryNav, site } from "@/content/site";
import { isActive, normalizePath } from "@/lib/paths";
import { LabLink } from "./LabLink";
import { useLab } from "./LabProvider";

// The terminal is optional, so its code only loads when it is opened.
const Terminal = dynamic(() => import("@/components/terminal/Terminal"), { ssr: false });

function TerminalIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1.5" y="2.5" width="15" height="13" rx="2" />
      <path d="M5 7l2.5 2L5 11M9.5 11.5H13" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SoundIcon({ on }: { on: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <path d="M3 7h3l4-3v10l-4-3H3z" />
      {on ? <path d="M12.5 6.5a3.5 3.5 0 010 5M14.5 4.5a6.4 6.4 0 010 9" strokeLinecap="round" /> : <path d="M12.5 7l4 4M16.5 7l-4 4" strokeLinecap="round" />}
    </svg>
  );
}

function ModeSwitch() {
  const { mode, toggleMode } = useLab();
  const on = mode === "case";
  return (
    <button
      type="button"
      className="mode-switch"
      role="switch"
      aria-checked={on}
      onClick={toggleMode}
      title={on ? "Return to the interactive lab" : "Read everything as clean case studies"}
    >
      <span className="mode-switch__track" aria-hidden="true">
        <span className="mode-switch__thumb" />
      </span>
      <span className="mode-switch__label">
        Case<span className="mode-switch__long"> study</span>
      </span>
    </button>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { mode } = useLab();
  return (
    <ol className="rail-nav">
      {primaryNav.map((item) => {
        const href = mode === "case" && item.caseHref ? item.caseHref : item.href;
        const active = isActive(pathname, item.href);
        return (
          <li key={item.href}>
            <LabLink href={href} className="rail-nav__link" data-quiet={item.quiet ? "" : undefined} aria-current={active ? "page" : undefined} onClick={onNavigate}>
              <span className="rail-nav__index">{item.index}</span>
              <span className="rail-nav__label">{item.label}</span>
              {item.quiet ? <span className="rail-nav__quiet">{item.quiet}</span> : null}
            </LabLink>
          </li>
        );
      })}
      <li className="rail-nav__reports">
        <LabLink
          href={reportsNav.href}
          className="rail-nav__link"
          aria-current={isActive(pathname, reportsNav.href) ? "page" : undefined}
          onClick={onNavigate}
        >
          <span className="rail-nav__index" aria-hidden="true" />
          <span className="rail-nav__label">{reportsNav.label}</span>
        </LabLink>
      </li>
    </ol>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = normalizePath(usePathname());
  const { mode, soundOn, toggleSound, terminalOpen, openTerminal, closeTerminal } = useLab();
  const [menuOpen, setMenuOpen] = useState(false);
  const isEntry = pathname === "/";

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <div className="shell" data-entry={isEntry || undefined} data-menu={menuOpen || undefined}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <aside className="rail" aria-label="Lab navigation">
        <LabLink href="/" className="rail__mark" aria-label={`${site.mark} — ${site.labName}, entry`}>
          <span className="rail__mark-text">{site.mark}</span>
          <span className="rail__mark-sub">{site.labName}</span>
        </LabLink>
        <nav aria-label="Primary">
          <p className="rail__dir mono" aria-hidden="true">
            Directory
          </p>
          <NavLinks />
        </nav>
        <p className="rail__foot mono">{mode === "case" ? "Case study mode" : "Lab mode"}</p>
      </aside>

      <header className="topbar">
        <LabLink href="/" className="topbar__mark" aria-label={`${site.mark}, entry`}>
          {site.mark}
        </LabLink>
        <nav className="topbar__links" aria-label="Secondary">
          {secondaryNav.map((item) => (
            <LabLink key={item.href} href={item.href} aria-current={isActive(pathname, item.href) ? "page" : undefined}>
              {item.label}
            </LabLink>
          ))}
        </nav>
        <div className="topbar__tools">
          <button type="button" className="icon-btn icon-btn--desk" onClick={toggleSound} aria-pressed={soundOn} aria-label={soundOn ? "Sound on" : "Sound off"} title={soundOn ? "Sound on" : "Sound off (default)"}>
            <SoundIcon on={soundOn} />
          </button>
          <button type="button" className="icon-btn icon-btn--desk" onClick={openTerminal} aria-label="Open terminal" title="Terminal  ( ~ )" aria-haspopup="dialog">
            <TerminalIcon />
          </button>
          <ModeSwitch />
          <button
            type="button"
            className="icon-btn menu-btn"
            aria-expanded={menuOpen}
            aria-controls="pocket-menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="menu-btn__bars" aria-hidden="true" />
            <span className="sr-only">Menu</span>
          </button>
        </div>
      </header>

      <div id="pocket-menu" className="pocket-menu" hidden={!menuOpen}>
        <p className="eyebrow">{site.labName}</p>
        <nav aria-label="Pocket">
          <NavLinks onNavigate={() => setMenuOpen(false)} />
          <ul className="pocket-menu__secondary">
            {secondaryNav.map((item) => (
              <li key={item.href}>
                <LabLink href={item.href}>{item.label}</LabLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="pocket-menu__tools">
          <button type="button" className="btn btn--ghost btn--sm" onClick={toggleSound} aria-pressed={soundOn}>
            <SoundIcon on={soundOn} /> Sound {soundOn ? "on" : "off"}
          </button>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            aria-haspopup="dialog"
            onClick={() => {
              setMenuOpen(false);
              openTerminal();
            }}
          >
            <TerminalIcon /> Terminal
          </button>
        </div>
      </div>

      <main id="main" className="main" tabIndex={-1}>
        <div key={pathname} className="page">
          {children}
        </div>
      </main>

      <footer className="footer">
        <span className="mono">{site.mark} · {site.labName}</span>
        <dl className="footer__legend" aria-label="Figure labels">
          {Object.entries(FIGURE_KINDS).map(([k, v]) => (
            <div key={k}>
              <dt className="mono">{v.label}</dt>
              <dd>{v.meaning.split(".")[0]}.</dd>
            </div>
          ))}
        </dl>
        <button type="button" className="footer__term mono" onClick={openTerminal}>
          Press <kbd>~</kbd> for terminal
        </button>
      </footer>

      {terminalOpen ? <Terminal onClose={closeTerminal} /> : null}
    </div>
  );
}
