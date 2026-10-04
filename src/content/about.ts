export const about = {
  title: "About",
  summary: ["Software engineer", "MSc Data Science student · University of Basel", "Systems · agents · research"],
  intro: [
    "I build software that has to keep working when things go wrong: long-running agent workflows that survive a lost worker, event streams that replay what a client missed or say plainly what they cannot recover, and research pipelines that are not allowed to use the future.",
    "I am a software engineer with a Software Engineering undergraduate background, currently studying for an MSc in Data Science at the University of Basel.",
  ],
  /** Areas of work. Deliberately not a chronology. */
  areas: [
    { area: "Backend engineering", note: "Services, APIs and the tests around them." },
    { area: "Reliable distributed systems", note: "Durability, ordering, replay and failure handling." },
    { area: "Agentic infrastructure", note: "Coordinating agent work that outlives a single process." },
    { area: "Data science research", note: "Point-in-time data, walk-forward evaluation and honest negative results." },
  ],
  principles: [
    { title: "Correctness first", body: "A fast wrong answer is still wrong. Prove the invariant, then optimise." },
    { title: "Record decisions", body: "Every significant choice has a problem, alternatives, a reason and evidence." },
    { title: "Keep the failures", body: "Negative results are evidence. They stop the same mistake from being made twice." },
    { title: "Explain clearly", body: "If a system cannot be explained simply, it is not understood well enough yet." },
  ],
};

/** Resume entries. Only verified facts; no invented dates. */
export const resume = {
  experience: [
    {
      role: "Backend Engineering Intern",
      organisation: "Crytek",
      period: "May–Jul 2026",
      points: ["Go services for the live game backend of Hunt: Showdown", "Telemetry and automated testing"],
    },
    {
      role: "QA Intern",
      organisation: "Crytek",
      period: "Feb–Apr 2026",
      points: [],
    },
    {
      role: "Technical Lead / Maintainer — SAMS",
      organisation: "Independent project · 2-person team",
      period: "",
      points: [
        "Durable LLM agent workflows (Temporal)",
        "Resumable event delivery with replay and explicit gaps",
        "Multi-tenant backend with fail-closed ownership boundaries",
      ],
    },
  ],
  education: [
    {
      degree: "MSc Data Science",
      institution: "University of Basel",
      period: "In progress",
      points: ["Research / semester project: FinanceIQ — point-in-time market data and research infrastructure (in progress)"],
    },
    {
      degree: "Software Engineering",
      institution: "Undergraduate studies",
      period: "",
      points: [],
    },
  ],
  skills: [
    { group: "Languages", items: ["Python", "Go", "TypeScript", "SQL"] },
    { group: "Systems", items: ["FastAPI", "Temporal", "PostgreSQL", "Redis", "WebSockets"] },
    { group: "Data & research", items: ["Walk-forward evaluation", "Permutation tests", "Power analysis", "Point-in-time data"] },
    { group: "Practice", items: ["Failure-scenario testing", "Negative controls", "Decision records"] },
  ],
};
