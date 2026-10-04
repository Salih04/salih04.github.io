import type { CaseStudy, DecisionRecord } from "./types";

/*
 * SAMS — Spatial Agentic Management System.
 *
 * Public boundary: this file describes concepts, responsibilities and
 * decisions. It deliberately contains no endpoints, identifiers, schema,
 * configuration or authentication internals. The live view is a scripted
 * demonstration and is labelled as such wherever it renders.
 */

export type AgentId = "planner" | "coordinator" | "research" | "analysis" | "spatial" | "execution";

export interface AgentNode {
  id: AgentId;
  label: string;
  role: string;
  /** Position inside the topology viewBox (0 0 560 440). */
  x: number;
  y: number;
}

export const agents: AgentNode[] = [
  { id: "planner", label: "Planner", role: "Turns an incoming task into an ordered plan of steps.", x: 280, y: 48 },
  { id: "coordinator", label: "Coordinator", role: "Owns the workflow: assigns steps, tracks progress, handles retries.", x: 280, y: 150 },
  { id: "research", label: "Research", role: "Gathers the context a step needs.", x: 110, y: 270 },
  { id: "analysis", label: "Analysis", role: "Evaluates gathered context and produces intermediate results.", x: 280, y: 270 },
  { id: "spatial", label: "Spatial", role: "Reasons over location and geometry: regions, proximity, layout.", x: 450, y: 270 },
  { id: "execution", label: "Execution", role: "Applies the outcome and emits the final state change.", x: 280, y: 392 },
];

export const agentEdges: [AgentId, AgentId][] = [
  ["planner", "coordinator"],
  ["coordinator", "research"],
  ["coordinator", "analysis"],
  ["coordinator", "spatial"],
  ["research", "execution"],
  ["analysis", "execution"],
  ["spatial", "execution"],
];

/** One message in the scripted live demonstration. */
export interface LiveStep {
  from: AgentId | null;
  to: AgentId;
  feed: string;
}

export const liveScript: LiveStep[] = [
  { from: null, to: "planner", feed: "Task received" },
  { from: "planner", to: "coordinator", feed: "Plan created · 3 steps" },
  { from: "coordinator", to: "coordinator", feed: "Workflow created" },
  { from: "coordinator", to: "research", feed: "Agent assigned · Research" },
  { from: "coordinator", to: "spatial", feed: "Agent assigned · Spatial" },
  { from: "research", to: "execution", feed: "Event persisted · context gathered" },
  { from: "coordinator", to: "analysis", feed: "Agent assigned · Analysis" },
  { from: "spatial", to: "execution", feed: "Event persisted · region resolved" },
  { from: "analysis", to: "execution", feed: "Event persisted · result evaluated" },
  { from: "execution", to: "execution", feed: "Client state synchronized" },
  { from: "execution", to: "execution", feed: "Task completed" },
];

export interface ArchComponent {
  id: string;
  label: string;
  layer: "client" | "api" | "orchestration" | "durability" | "storage" | "events" | "crosscutting";
  why: string;
  responsibilities: string[];
  tradeoff: string;
  /** Present when details are intentionally withheld from the public portfolio. */
  boundary?: string;
}

export const architecture: ArchComponent[] = [
  {
    id: "client",
    label: "Client",
    layer: "client",
    why: "Operators need to watch long-running agent work as it happens, including after a refresh or a dropped connection.",
    responsibilities: ["Render workflow and agent state", "Hold a local projection of server events", "Resume from the last event it saw"],
    tradeoff: "The client keeps a projection instead of re-fetching everything, which means it must be able to detect and repair gaps.",
  },
  {
    id: "api",
    label: "FastAPI",
    layer: "api",
    why: "A thin, typed boundary between clients and the system. Requests start work; they never wait for it to finish.",
    responsibilities: ["Validate and authorize requests", "Start workflows and return immediately", "Serve state snapshots and event history"],
    tradeoff: "Keeping the API thin moves complexity into orchestration, where it can be retried and observed.",
  },
  {
    id: "orchestration",
    label: "Workflow / orchestration",
    layer: "orchestration",
    why: "Agent work is a multi-step plan, not a single function call. The plan needs an owner that outlives any one request.",
    responsibilities: ["Translate plans into workflow steps", "Assign steps to agents", "Decide what happens when a step fails"],
    tradeoff: "Workflow code has to be written deterministically, which constrains how agents are called.",
  },
  {
    id: "temporal",
    label: "Temporal",
    layer: "durability",
    why: "Long-running operations cannot rely on ordinary request/response execution. A process restart must not lose a half-finished workflow.",
    responsibilities: ["Durable orchestration", "Retry semantics", "Workflow recovery"],
    tradeoff: "Adds an operational dependency and a programming model the whole team has to learn.",
  },
  {
    id: "postgres",
    label: "PostgreSQL",
    layer: "storage",
    why: "One source of truth for tenants, workflows and the event log, with transactions where correctness matters.",
    responsibilities: ["Persist domain state", "Persist the ordered event log", "Answer spatial and relational queries"],
    tradeoff: "Writing every event costs storage and write throughput in exchange for replayability.",
  },
  {
    id: "events",
    label: "Event / replay layer",
    layer: "events",
    why: "If every state change is an ordered event, any client or service can rebuild state by replaying from a known point.",
    responsibilities: ["Assign a monotonic sequence per stream", "Serve replay from a sequence number", "Fall back to a snapshot when a gap is too large"],
    tradeoff: "Every consumer must handle replay idempotently.",
  },
  {
    id: "redis",
    label: "Redis",
    layer: "crosscutting",
    why: "Several API instances serve WebSocket clients; an event produced on one must reach clients connected to another.",
    responsibilities: ["Fan out fresh events across instances", "Hold short-lived coordination state"],
    tradeoff: "Delivery is best-effort. Redis is never the source of truth, so lost messages are recovered through replay.",
  },
  {
    id: "websockets",
    label: "WebSockets",
    layer: "crosscutting",
    why: "Agent progress is pushed, not polled, so operators see changes within the same moment they are persisted.",
    responsibilities: ["Push events to subscribed clients", "Accept a resume point on reconnect"],
    tradeoff: "Connections drop. The protocol has to treat reconnects as normal, not exceptional.",
  },
  {
    id: "tenancy",
    label: "Tenant isolation",
    layer: "crosscutting",
    why: "Several organisations share one deployment. One tenant must never observe another tenant's agents, events or data.",
    responsibilities: ["Scope every read and write to a tenant", "Scope event streams and subscriptions to a tenant"],
    tradeoff: "Enforcing scope in one place is safer than trusting every call site, at the cost of a less flexible data layer.",
    boundary: "Enforcement mechanics are intentionally not published.",
  },
  {
    id: "auth",
    label: "Authentication",
    layer: "crosscutting",
    why: "Every request and every socket connection has to be tied to an identity and a tenant before it can do anything.",
    responsibilities: ["Establish identity", "Bind identity to tenant scope"],
    tradeoff: "Socket connections need the same guarantees as requests, which complicates reconnect handling.",
    boundary: "Authentication internals are intentionally not published.",
  },
];

export const archLayers: { id: ArchComponent["layer"]; label: string }[] = [
  { id: "client", label: "Client" },
  { id: "api", label: "API" },
  { id: "orchestration", label: "Orchestration" },
  { id: "durability", label: "Durable execution" },
  { id: "storage", label: "Storage" },
  { id: "events", label: "Events & replay" },
];

/** The signature "Observe System" sequence. */
export const observeSteps: { id: string; label: string; detail: string }[] = [
  { id: "task", label: "Task", detail: "An operator submits a task. The API validates it and returns at once — nobody waits on an open request." },
  { id: "planner", label: "Planner", detail: "The planner breaks the task into ordered steps that agents can execute independently." },
  { id: "workflow", label: "Workflow", detail: "A durable workflow takes ownership of the plan. If a process restarts now, the work continues where it stopped." },
  { id: "agents", label: "Agents", detail: "Research, Analysis and Spatial agents run their steps. Failures are retried by the workflow, not by the agent." },
  { id: "events", label: "Events", detail: "Every state change is written to an ordered event log before anyone is told about it." },
  { id: "state", label: "State", detail: "Projections are rebuilt from events, so the server's view of the task is always derivable from history." },
  { id: "client", label: "Client", detail: "Connected clients receive the events. A client that reconnects resumes from the last sequence number it saw." },
];

export const samsDecisions: DecisionRecord[] = [
  {
    id: "004",
    title: "Durable orchestration for agent workflows",
    problem: "Agent plans run for minutes and involve several external calls. A deploy or crash in the middle of a plan lost work and left state half-written.",
    options: [
      { key: "A", label: "Durable workflow engine (Temporal)", detail: "Workflow state is persisted by the engine; steps are retried and resumed after failure." },
      { key: "B", label: "Task queue with workers", detail: "Familiar and light, but multi-step progress, retries and compensation are hand-written." },
      { key: "C", label: "Background tasks in the API process", detail: "Simplest to start; any restart drops in-flight work." },
    ],
    selected: "A",
    reason: "The hard part was not running a task but surviving partial failure across many steps. A durable engine makes that the default instead of something each feature re-implements.",
    tradeoff: "An extra service to operate, and workflow code must be deterministic, so non-deterministic agent calls live in activities.",
    evidence: "Failure-injection runs that stop a worker mid-plan and check that the workflow completes with the same final state.",
  },
  {
    id: "009",
    title: "Persist the event before telling anyone",
    problem: "Clients occasionally saw a state change that the database did not contain after a failed write, and the two never reconciled.",
    options: [
      { key: "A", label: "Broadcast, then persist", detail: "Lowest latency; clients can observe events that never existed." },
      { key: "B", label: "Persist, then broadcast", detail: "A broadcast is only sent for an event that is already durable." },
      { key: "C", label: "Persist and broadcast in parallel", detail: "Faster than B, with the same failure mode as A." },
    ],
    selected: "B",
    reason: "The event log is the source of truth. Anything a client sees must be replayable from it.",
    tradeoff: "A few milliseconds of extra latency per event, and the write path becomes the throughput limit.",
    evidence: "Tests that fail the write after an event is produced and assert that no client receives it.",
  },
  {
    id: "012",
    title: "Redis as fan-out, never as truth",
    problem: "With several API instances, a client connected to one instance missed events produced on another.",
    options: [
      { key: "A", label: "Sticky sessions", detail: "Route each tenant to one instance; breaks on scaling and failover." },
      { key: "B", label: "Redis pub/sub fan-out", detail: "Every instance receives fresh events; delivery is best-effort." },
      { key: "C", label: "Clients poll the database", detail: "Simple and correct, but slow and wasteful." },
    ],
    selected: "B",
    reason: "Fan-out solves the multi-instance problem, and the replay layer already covers lost messages, so best-effort delivery is acceptable.",
    tradeoff: "Two delivery paths to reason about: live fan-out for speed and replay for correctness.",
    evidence: "Multi-instance tests where producer and subscriber sit on different instances, with messages dropped on purpose.",
  },
  {
    id: "017",
    title: "Reconnects resume from a sequence number",
    problem: "WebSocket reconnects could create state inconsistencies: events emitted while a client was disconnected were missed, and the client's view drifted from the server.",
    options: [
      { key: "A", label: "Resume from last sequence", detail: "The client reports the last sequence number it applied; the server replays everything after it, or sends a snapshot if the gap is too large." },
      { key: "B", label: "Full snapshot on every reconnect", detail: "Always correct; expensive for large workspaces and noisy for brief disconnects." },
      { key: "C", label: "Client-side diffing", detail: "The client re-fetches and diffs; correctness depends on every view implementing it right." },
    ],
    selected: "A",
    reason: "Brief disconnects are the common case, and replaying a handful of events is cheaper and more precise than a snapshot. The snapshot is kept as the fallback, so correctness never depends on replay alone.",
    tradeoff: "Requires a monotonic sequence per stream, retained history, and idempotent event handling on the client.",
    evidence: "Reconnect scenarios that drop the socket mid-workflow and assert that the client projection equals the server projection after resume.",
  },
  {
    id: "021",
    title: "Tenant scope enforced in one layer",
    problem: "Tenant filtering written by hand at each query site is easy to forget once, and once is enough.",
    options: [
      { key: "A", label: "Filter at every call site", detail: "Flexible; relies on discipline and review." },
      { key: "B", label: "Enforce scope in a single data-access layer", detail: "Every query passes through one scoped path." },
      { key: "C", label: "Separate deployment per tenant", detail: "Strongest isolation; heavy to operate at this scale." },
    ],
    selected: "B",
    reason: "Isolation should be a property of the system, not of each developer's memory.",
    tradeoff: "Cross-tenant administrative tasks need an explicit, audited path around the scoped layer.",
    evidence: "Tests that issue requests as one tenant against another tenant's resources and expect nothing back.",
  },
];

export const samsCaseStudy: CaseStudy = {
  slug: "sams",
  name: "SAMS",
  fullName: "Spatial Agentic Management System",
  lab: "Agent Systems Lab",
  oneLiner: "A multi-tenant platform where agents plan and execute long-running spatial tasks, and every client sees the same state — even after it disconnects.",
  overview: [
    "SAMS coordinates a set of specialised agents — planning, research, analysis, spatial reasoning and execution — around tasks that take minutes rather than milliseconds.",
    "The engineering problem is not calling agents. It is making their work durable, observable and consistent: surviving restarts, recovering from partial failure and keeping every connected client in agreement with the server.",
  ],
  problem: {
    existed: "Agent work ran as ordinary request handlers and background jobs. It was fine for demos and fragile for anything longer than one request.",
    difficulty: [
      "Long-running plans are interrupted by deploys, crashes and timeouts.",
      "Several clients watch the same work, and connections drop.",
      "Multiple tenants share infrastructure that must never leak between them.",
      "Spatial reasoning adds data that is expensive to recompute and easy to get subtly wrong.",
    ],
  },
  constraints: {
    technical: ["Work must survive process restarts", "Clients must converge after reconnecting", "Several API instances behind one entry point"],
    research: ["Agent behaviour is non-deterministic and must be isolated from deterministic workflow logic", "Plans must be inspectable after the fact"],
    operational: ["Small team: every added service has to earn its place", "Multi-tenant from the first release", "No visitor-facing component may expose infrastructure details"],
  },
  role: {
    owned: [
      "Backend architecture for orchestration, events and real-time synchronization",
      "The event and replay model, including reconnect semantics",
      "Workflow design for agent plans and their failure handling",
      "Test strategy for failure, reconnect and isolation scenarios",
    ],
    context: "Described at the level of concepts and decisions. Infrastructure, identifiers and security internals are intentionally omitted.",
  },
  architectureSummary:
    "Requests start work and return. A durable workflow owns each plan and assigns steps to agents. Every state change becomes an ordered event in PostgreSQL before it is fanned out through Redis to WebSocket clients, which can always rebuild state by replaying from their last sequence number.",
  hardProblems: [
    { title: "Partial failure across many steps", body: "A plan that fails at step four of seven must neither restart from zero nor leave steps one to three half-applied. Durable workflows and idempotent steps made recovery a default rather than a per-feature effort." },
    { title: "Consistency across reconnects", body: "A client that blinks offline for two seconds must end up exactly where the server is. Sequence numbers, replay and a snapshot fallback replaced ad-hoc refetching." },
    { title: "Multi-instance real-time delivery", body: "Events produced on one instance must reach clients connected to another, without making the message bus a second source of truth." },
    { title: "Determinism around non-deterministic agents", body: "Workflow logic must replay identically, while agent calls cannot. Separating orchestration from agent activities kept both honest." },
  ],
  decisions: samsDecisions,
  implementation: [
    { title: "Thin API, thick workflows", body: "Endpoints validate, authorize and start work. Everything that can fail slowly lives inside a workflow where it can be retried and observed." },
    { title: "Ordered event streams", body: "Each stream carries a monotonic sequence. Consumers track the last sequence applied and treat duplicates as no-ops." },
    { title: "Projection from history", body: "Server-side and client-side state are projections of the same events, which makes \"what did the client see?\" an answerable question." },
    { title: "Scoped data access", body: "Tenant scope is applied in one layer that every read and write passes through." },
  ],
  evidence: [
    { kind: "Tests", items: ["Failure injection during workflow steps", "Reconnect scenarios with dropped and duplicated events", "Cross-tenant access attempts expected to return nothing"] },
    { kind: "Methodology", items: ["Each decision recorded with the problem, the options and the evidence that would prove it wrong"] },
  ],
  didntWork: [
    { title: "Refetch-on-reconnect", body: "The first reconnect strategy re-fetched every view. It was correct for simple screens and drifted for complex ones, because each view had to get it right on its own.", lesson: "Consistency belongs in the protocol, not in each screen." },
    { title: "Retries inside agents", body: "Agents originally retried their own failures. Combined with workflow retries this multiplied calls and hid real failures.", lesson: "One owner per failure policy." },
  ],
  result: [
    "Agent plans survive restarts and resume where they stopped.",
    "Clients converge on server state after reconnecting.",
    "Tenant isolation is a property of the data layer.",
  ],
  next: ["Richer replay tooling for inspecting a plan step by step", "Back-pressure for very chatty agent streams", "Published, sanitized architecture notes as Lab Notes"],
};
