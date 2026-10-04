"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { modeForRoute, normalizePath, pairFor } from "@/lib/paths";
import { playCue, type Cue } from "@/lib/sound";
import { readPref, writePref } from "@/lib/storage";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import { BRIDGE, landBridge, removeBridge, startBridge } from "./facilityBridge";

export type Mode = "lab" | "case";

interface LabContextValue {
  mode: Mode;
  setMode: (mode: Mode) => void;
  toggleMode: () => void;
  /** Client-side navigation with the lab's room transition. */
  navigate: (href: string) => void;
  /** Entry → Control Room: the trace folds into the floor line, then the floor opens. */
  enterFacility: (href: string) => void;
  soundOn: boolean;
  toggleSound: () => void;
  cue: (cue: Cue) => void;
  terminalOpen: boolean;
  openTerminal: () => void;
  closeTerminal: () => void;
}

const LabContext = createContext<LabContextValue | null>(null);

const SOUND_KEY = "slab:sound";
const OUT_MS = 160;
const IN_MS = 240;
/**
 * Entry exit: the hero recedes and the instrument folds onto its time axis,
 * which is lifted into a bridge layer that survives the route change. The
 * bridge then travels to the Control Room's corridor and opens with the floor.
 */
const ENTER_OUT_MS = BRIDGE.fold;
const ARRIVE_MS = BRIDGE.travel + BRIDGE.open + 240;

function setTransition(phase: "out" | "in" | "enter" | null) {
  const root = document.documentElement;
  if (phase) root.dataset.transition = phase;
  else delete root.dataset.transition;
}

function isEditable(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

export function LabProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mode, setModeState] = useState<Mode>(() => modeForRoute(pathname));
  const [soundOn, setSoundOn] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const pendingNav = useRef(false);
  const arriving = useRef(false);
  const timers = useRef<number[]>([]);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  // Sound is the only stored preference. Mode is never restored from storage.
  useEffect(() => {
    setSoundOn(readPref(SOUND_KEY) === "on");
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  // Every navigation resets the mode to the one the route defines. A toggle on
  // an unpaired page applies to that page only.
  useEffect(() => {
    setModeState(modeForRoute(pathname));
    if (pendingNav.current) {
      pendingNav.current = false;
      setTransition("in");
      later(() => setTransition(null), IN_MS);
    }
    if (arriving.current) {
      arriving.current = false;
      setTransition(null);
      const root = document.documentElement;
      root.dataset.arrive = "facility";
      requestAnimationFrame(landBridge);
      later(() => delete root.dataset.arrive, ARRIVE_MS);
    }
  }, [pathname]);

  useEffect(() => {
    document.documentElement.dataset.mode = mode;
  }, [mode]);

  const cue = useCallback((c: Cue) => {
    if (soundOn) playCue(c);
  }, [soundOn]);

  const navigate = useCallback(
    (href: string) => {
      if (prefersReducedMotion() || normalizePath(href) === normalizePath(pathname)) {
        router.push(href);
        return;
      }
      pendingNav.current = true;
      setTransition("out");
      later(() => router.push(href), OUT_MS);
      // Never leave the page faded out if navigation stalls.
      later(() => {
        if (document.documentElement.dataset.transition === "out") setTransition(null);
      }, 2500);
    },
    [router, pathname],
  );

  const enterFacility = useCallback(
    (href: string) => {
      if (prefersReducedMotion()) {
        router.push(href);
        return;
      }
      arriving.current = true;
      setTransition("enter");
      startBridge();
      later(() => router.push(href), ENTER_OUT_MS);
      later(() => {
        if (document.documentElement.dataset.transition === "enter") {
          setTransition(null);
          removeBridge();
        }
      }, 2500);
    },
    [router],
  );

  const setMode = useCallback(
    (target: Mode) => {
      const p = pairFor(pathname);
      if (p && p.side !== target) {
        setModeState(target);
        navigate(target === "case" ? p.pair.caseStudy : p.pair.lab);
        return;
      }
      if (prefersReducedMotion()) {
        setModeState(target);
        return;
      }
      setTransition("out");
      later(() => {
        setModeState(target);
        setTransition("in");
        later(() => setTransition(null), IN_MS);
      }, OUT_MS);
    },
    [pathname, navigate],
  );

  const toggleMode = useCallback(() => setMode(mode === "lab" ? "case" : "lab"), [mode, setMode]);

  const toggleSound = useCallback(() => {
    setSoundOn((on) => {
      const next = !on;
      writePref(SOUND_KEY, next ? "on" : "off");
      if (next) playCue("step");
      return next;
    });
  }, []);

  const openTerminal = useCallback(() => setTerminalOpen(true), []);
  const closeTerminal = useCallback(() => setTerminalOpen(false), []);

  // `~` (or the backtick key it shares) toggles the terminal anywhere except inside form fields.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "~" && e.key !== "`") return;
      if (e.metaKey || e.ctrlKey || e.altKey || isEditable(e.target)) return;
      e.preventDefault();
      setTerminalOpen((open) => !open);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value = useMemo(
    () => ({ mode, setMode, toggleMode, navigate, enterFacility, soundOn, toggleSound, cue, terminalOpen, openTerminal, closeTerminal }),
    [mode, setMode, toggleMode, navigate, enterFacility, soundOn, toggleSound, cue, terminalOpen, openTerminal, closeTerminal],
  );

  return <LabContext.Provider value={value}>{children}</LabContext.Provider>;
}

export function useLab(): LabContextValue {
  const ctx = useContext(LabContext);
  if (!ctx) throw new Error("useLab must be used inside <LabProvider>");
  return ctx;
}
