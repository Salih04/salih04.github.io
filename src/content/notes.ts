/*
 * Lab Notes — engineering and research writing.
 *
 * Bodies are structured blocks rather than Markdown so that no parser ships
 * to the browser and every note renders as semantic HTML.
 */

export type NoteCategory = "Systems" | "Agents" | "Data" | "Research" | "Engineering" | "Experiments";

export type NoteBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "list"; items: string[] }
  | { type: "code"; text: string }
  | { type: "quote"; text: string };

/**
 * A lab note. Notes carry no number and no publication date until Salih has
 * reviewed and published them; until then every note is a draft.
 */
export interface LabNote {
  slug: string;
  title: string;
  summary: string;
  category: NoteCategory;
  status: "Draft";
  body: NoteBlock[];
}

export const notes: LabNote[] = [
  {
    slug: "designing-replayable-event-systems",
    title: "Designing replayable event systems",
    summary: "If clients can rebuild state from history, reconnects stop being an edge case.",
    category: "Systems",
    status: "Draft",
    body: [
      { type: "p", text: "Real-time interfaces usually start with a simple idea: when something changes, push it to the client. It works until the first dropped connection. Then the client has missed an unknown number of changes, and every screen invents its own way to catch up." },
      { type: "h2", text: "Make history the source of truth" },
      { type: "p", text: "The alternative is to treat every state change as an ordered event. State — on the server and on the client — becomes a projection of that history." },
      { type: "list", items: ["Each stream is ordered.", "Consumers remember the last event they applied.", "A reconnecting client states where it stopped.", "If the history it needs is gone, the server says so."] },
      { type: "h2", text: "Reconnect is just replay" },
      { type: "p", text: "With those rules, a reconnecting client sends one number: the last event it applied. The server replays everything after it, then continues with live events from exactly the next one. If retained history cannot prove the interval is complete — it was trimmed, or the stream was reset — the server returns an explicit gap instead of a replay that only looks complete." },
      { type: "code", text: "on reconnect(last_seq):\n  if history provably covers last_seq + 1 .. head:\n    replay last_seq + 1 .. head\n    continue live from head + 1\n  else:\n    report an explicit gap" },
      { type: "h2", text: "What it costs" },
      { type: "p", text: "History needs retention, resets must be detectable, and the handoff from replay to live delivery has to be tested under concurrency. In exchange, a question like \"what did this client see?\" has an exact answer — and that turns consistency bugs from folklore into tests." },
    ],
  },
  {
    slug: "point-in-time-data-is-a-correctness-problem",
    title: "Point-in-time data is a correctness problem",
    summary: "Look-ahead leakage is not a modelling mistake. It is a data model that forgot when things were known.",
    category: "Data",
    status: "Draft",
    body: [
      { type: "p", text: "A backtest asks a historical question: on this date, with what was known, what would the model have done? Most datasets cannot answer it, because they store what is true now, not what was knowable then." },
      { type: "h2", text: "Three ways the future leaks in" },
      { type: "list", items: ["Timing: a quarter's figures are attached to the quarter's end, weeks before they were published.", "Revisions: a restated value silently replaces the original.", "Survivorship: companies that later disappeared are missing from the universe."] },
      { type: "h2", text: "Store two times, not one" },
      { type: "p", text: "The fix is structural. Every observation records the period it describes and the moment it became known. Revisions are appended, never overwritten. An as-of query keeps only what was known by a date and resolves each fact to its latest known version." },
      { type: "quote", text: "If availability matters, store it. Do not estimate it." },
      { type: "p", text: "Once the data model is right, leakage becomes measurable: compare the naive dataset with the point-in-time one on the same date, and every difference is a specific fact used too early." },
    ],
  },
  {
    slug: "why-negative-results-stay-in-the-archive",
    title: "Why negative results stay in the archive",
    summary: "An experiment that failed cleanly is worth more than one that succeeded for the wrong reason.",
    category: "Research",
    status: "Draft",
    body: [
      { type: "p", text: "Research archives tend to keep the winners. The losers are deleted, and six months later somebody tests the same idea again, on the same data, with the same outcome." },
      { type: "h2", text: "A failed experiment is a record" },
      { type: "p", text: "Each archived run keeps its hypothesis, configuration, fingerprint and result. A negative result written down this way is evidence: it narrows the search space and documents what has already been ruled out." },
      { type: "h2", text: "A documented example" },
      { type: "p", text: "The public FinanceIQ repository keeps one such record. An equal-weight baseline looked like a weak signal, IC +0.150 (p = 0.017). An audit then found that most of its features were annual statements used weeks before they were published. Re-evaluated point-in-time, the IC is +0.031 (p = 0.63). Both numbers stay in the record, with the audit between them." },
      { type: "list", items: ["The withdrawn result shows what the leak looked like from the inside.", "The audit shows how it was found.", "The corrected result is the one to cite."] },
      { type: "p", text: "None of this is embarrassing. A negative result kept this way is a mistake that will not be repeated." },
    ],
  },
];

export const noteCategories: NoteCategory[] = ["Systems", "Agents", "Data", "Research", "Engineering", "Experiments"];

export function readingMinutes(note: LabNote): number {
  const words = note.body
    .map((b) => ("text" in b ? b.text : b.items.join(" ")))
    .join(" ")
    .split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}
