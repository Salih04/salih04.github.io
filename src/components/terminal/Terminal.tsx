"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useLab } from "@/components/shell/LabProvider";
import { execute } from "@/lib/terminal";

interface Entry {
  id: number;
  input?: string;
  lines: string[];
}

const PROMPT = "salih@slab:~$";
const WELCOME = ["S//LAB terminal — alternative navigation.", "Type 'help' for commands. Esc closes."];

export default function Terminal({ onClose }: { onClose: () => void }) {
  const { navigate, setMode, mode, cue } = useLab();
  const [entries, setEntries] = useState<Entry[]>([{ id: 0, lines: WELCOME }]);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<Element | null>(null);
  const nextId = useRef(1);

  useEffect(() => {
    returnFocus.current = document.activeElement;
    inputRef.current?.focus();
    return () => {
      if (returnFocus.current instanceof HTMLElement) returnFocus.current.focus();
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [entries]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const input = value;
    const result = execute(input, { history, mode });
    setValue("");
    setCursor(null);
    if (input.trim()) setHistory((h) => [...h, input.trim()]);
    cue(result.lines[0]?.startsWith("command not found") ? "warn" : "tick");

    const action = result.action;
    if (action?.type === "clear") {
      setEntries([]);
      return;
    }
    setEntries((list) => [...list, { id: nextId.current++, input, lines: result.lines }]);
    if (action?.type === "close") onClose();
    if (action?.type === "navigate") {
      navigate(action.href);
      onClose();
    }
    if (action?.type === "mode") setMode(action.mode);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp" && history.length) {
      e.preventDefault();
      const i = cursor === null ? history.length - 1 : Math.max(0, cursor - 1);
      setCursor(i);
      setValue(history[i] ?? "");
    } else if (e.key === "ArrowDown" && cursor !== null) {
      e.preventDefault();
      const i = cursor + 1;
      if (i >= history.length) {
        setCursor(null);
        setValue("");
      } else {
        setCursor(i);
        setValue(history[i] ?? "");
      }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setEntries([]);
    }
  };

  // Keep focus inside the dialog and close on Escape.
  const onDialogKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "Tab") {
      const focusable = e.currentTarget.querySelectorAll<HTMLElement>("button, input");
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
  };

  return (
    <div className="terminal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="terminal" role="dialog" aria-modal="true" aria-labelledby="terminal-title" onKeyDown={onDialogKey}>
        <div className="terminal__bar">
          <span id="terminal-title" className="mono">
            terminal — {PROMPT.replace(":~$", "")}
          </span>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close terminal">
            ✕
          </button>
        </div>
        <div className="terminal__screen" ref={scrollRef} onClick={() => inputRef.current?.focus()}>
          <div role="log" aria-live="polite" aria-label="Terminal output">
            {entries.map((entry) => (
              <div key={entry.id} className="terminal__entry">
                {entry.input !== undefined ? (
                  <div>
                    <span className="terminal__prompt">{PROMPT}</span> {entry.input}
                  </div>
                ) : null}
                {entry.lines.map((line, i) => (
                  <div key={i} className="terminal__line">
                    {line || " "}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <form onSubmit={submit} className="terminal__form">
            <label htmlFor="terminal-input" className="terminal__prompt">
              {PROMPT}
            </label>
            <input
              id="terminal-input"
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="send"
            />
          </form>
        </div>
      </div>
    </div>
  );
}
