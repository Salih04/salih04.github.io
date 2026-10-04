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

export interface LabNote {
  number: string;
  slug: string;
  title: string;
  summary: string;
  category: NoteCategory;
  date: string;
  body: NoteBlock[];
}

export const notes: LabNote[] = [
  {
    number: "018",
    slug: "designing-replayable-event-systems",
    title: "Designing replayable event systems",
    summary: "If clients can rebuild state from history, reconnects stop being an edge case.",
    category: "Systems",
    date: "2026-10-01",
    body: [
      { type: "p", text: "Real-time interfaces usually start with a simple idea: when something changes, push it to the client. It works until the first dropped connection. Then the client has missed an unknown number of changes, and every screen invents its own way to catch up." },
      { type: "h2", text: "Make history the source of truth" },
      { type: "p", text: "The alternative is to treat every state change as an ordered event, written durably before anyone is told about it. State — on the server and on the client — becomes a projection of that history." },
      { type: "list", items: ["Each stream has a monotonic sequence number.", "An event is persisted before it is broadcast.", "Consumers remember the last sequence they applied.", "Applying the same event twice is a no-op."] },
      { type: "h2", text: "Reconnect is just replay" },
      { type: "p", text: "With those rules, a reconnecting client sends one number: the last sequence it saw. The server replays everything after it. If the gap is larger than retained history, the server sends a snapshot instead, and the client continues from the snapshot's sequence." },
      { type: "code", text: "on reconnect(last_seen):\n  if history.contains(last_seen + 1):\n    send events after last_seen\n  else:\n    send snapshot, then events after snapshot.sequence" },
      { type: "h2", text: "What it costs" },
      { type: "p", text: "Writes are slower, history needs retention, and every consumer must be idempotent. In exchange, a question like \"what did this client see?\" has an exact answer — and that turns consistency bugs from folklore into tests." },
    ],
  },
  {
    number: "017",
    slug: "point-in-time-data-is-a-correctness-problem",
    title: "Point-in-time data is a correctness problem",
    summary: "Look-ahead leakage is not a modelling mistake. It is a data model that forgot when things were known.",
    category: "Data",
    date: "2026-09-12",
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
    number: "015",
    slug: "why-negative-results-stay-in-the-archive",
    title: "Why negative results stay in the archive",
    summary: "An experiment that failed cleanly is worth more than one that succeeded for the wrong reason.",
    category: "Research",
    date: "2026-08-20",
    body: [
      { type: "p", text: "Research archives tend to keep the winners. The losers are deleted, and six months later somebody tests the same idea again, on the same data, with the same outcome." },
      { type: "h2", text: "A failed experiment is a record" },
      { type: "p", text: "Each archived run keeps its hypothesis, configuration, fingerprint and result. A negative result written down this way is evidence: it narrows the search space and documents what has already been ruled out." },
      { type: "h2", text: "Failures that taught the most" },
      { type: "list", items: ["Shuffled cross-validation gave the best numbers in the project — and measured nothing but leakage.", "A fixed publication lag looked conservative and was wrong in both directions.", "Several signals that looked significant stopped looking that way after correcting for how many were tried."] },
      { type: "p", text: "None of those are embarrassing. Each one is a mistake that will not be repeated." },
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

export function formatNoteDate(iso: string): string {
  const [y, m] = iso.split("-");
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${months[Number(m) - 1]} ${y}`;
}
