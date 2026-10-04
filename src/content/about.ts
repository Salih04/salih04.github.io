export const about = {
  title: "About the researcher",
  summary: ["Software engineer", "Data Science MSc", "Systems + AI + research"],
  intro: [
    "I build software systems that have to keep working when things go wrong: long-running agent workflows, real-time state that survives reconnects, and research pipelines that cannot quietly use the future.",
    "My path runs from backend engineering into distributed and agentic systems, and from there into data science — because the systems I find interesting are the ones whose correctness you have to prove, not assume.",
  ],
  trajectory: [
    { stage: "Software Engineering", note: "Fundamentals, and a habit of testing before trusting." },
    { stage: "Backend Engineering", note: "Production services, APIs and telemetry." },
    { stage: "Distributed Systems", note: "Durability, ordering and consistency." },
    { stage: "Agentic Systems", note: "Coordinating agents with real failure handling." },
    { stage: "Data Science / Research", note: "Reproducible experiments and honest negative results." },
  ],
  principles: [
    { title: "Correctness first", body: "A fast wrong answer is still wrong. Prove the invariant, then optimise." },
    { title: "Record decisions", body: "Every significant choice has a problem, options, a reason and evidence." },
    { title: "Keep the failures", body: "Negative results are evidence. They stop the same mistake from being made twice." },
    { title: "Explain clearly", body: "If a system cannot be explained simply, it is not understood well enough yet." },
  ],
};

/** Resume entries. Kept deliberately factual; extend with dates and institutions. */
export const resume = {
  experience: [
    {
      role: "Backend Engineer",
      organisation: "Crytek",
      points: ["Production backend and API development", "Telemetry", "Automated testing"],
    },
    {
      role: "Software Engineer — SAMS",
      organisation: "Spatial Agentic Management System",
      points: ["Durable agent orchestration", "Event-sourced real-time synchronization", "Multi-tenant backend architecture"],
    },
  ],
  education: [
    {
      degree: "MSc Data Science",
      points: ["Capstone: FinanceIQ — point-in-time market data for reproducible financial research"],
    },
  ],
  skills: [
    { group: "Languages", items: ["Python", "TypeScript", "SQL"] },
    { group: "Systems", items: ["FastAPI", "Temporal", "PostgreSQL", "Redis", "WebSockets"] },
    { group: "Data & research", items: ["Time-series validation", "Statistical testing", "Experiment tracking"] },
    { group: "Practice", items: ["Testing", "Telemetry", "Architecture decision records"] },
  ],
};
