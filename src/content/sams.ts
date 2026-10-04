import type { CaseStudy, DecisionRecord, SourceLink } from "./types";

/*
 * SAMS — Spatial Agentic Management System.
 *
 * An independent engineering project with a private codebase. Every claim in
 * this file is either (a) a design concept stated at the level of the public
 * evidence package, or (b) a historical verification result from that
 * package, labelled as such. Nothing here describes production telemetry:
 * SAMS has not served production traffic.
 *
 * Public boundary: no endpoints, identifiers, schema, migrations,
 * configuration, security mechanics or private source. See
 * docs/PUBLIC_BOUNDARY.md.
 */

const REPO = "https://github.com/Salih04/sams-reliability-core";

export const samsSources = {
  evidence: { label: "SAMS reliability evidence package", href: REPO },
  verification: { label: "Verification matrix", href: `${REPO}/blob/main/docs/VERIFICATION.md` },
  limitations: { label: "Limitations of the evidence", href: `${REPO}/blob/main/docs/LIMITATIONS.md` },
  ci: { label: "Historical CI record, 4 Oct 2026", href: `${REPO}/blob/main/results/CI_2026-10-04.md` },
} satisfies Record<string, SourceLink>;

/* ---- Agent topology (schematic) --------------------------------------- */

export type NodeId = "api" | "workflow" | "planner" | "research" | "analysis" | "approval" | "execution";

export interface TopologyNode {
  id: NodeId;
  label: string;
  kind: "entry" | "coordinator" | "agent" | "human";
  role: string;
}

/**
 * A simplified, portfolio-safe topology. It shows the shape of the system —
 * an entry point, a durable coordinator, agent steps and a human decision —
 * not the exact production agent set.
 */
export const topology: TopologyNode[] = [
  { id: "api", label: "API", kind: "entry", role: "Accepts the task and returns immediately. Nobody waits on an open request." },
  { id: "workflow", label: "Workflow", kind: "coordinator", role: "Durable coordinator. Owns the plan, assigns steps and survives the loss of a worker." },
  { id: "planner", label: "Planner", kind: "agent", role: "Turns the task into an ordered plan of steps." },
  { id: "research", label: "Research", kind: "agent", role: "Gathers the context a step needs." },
  { id: "analysis", label: "Analysis", kind: "agent", role: "Evaluates the context and produces an intermediate result." },
  { id: "approval", label: "Approval", kind: "human", role: "A person approves or rejects. The decision is stored durably before the workflow acts on it." },
  { id: "execution", label: "Execution", kind: "agent", role: "Applies the approved outcome and emits the final state change." },
];

/* ---- Event script for the failure demo (simulation) ------------------- */

export type EventType =
  | "TASK_ACCEPTED"
  | "WORKFLOW_STARTED"
  | "PLAN_CREATED"
  | "STEP_COMPLETED"
  | "APPROVAL_REQUESTED"
  | "APPROVAL_RECORDED"
  | "STATE_UPDATED"
  | "TASK_COMPLETED"
  | "WORKFLOW_RESUMED";

export interface ScriptEvent {
  type: EventType;
  node: NodeId;
  /** Plain-language caption for the narration region. */
  note: string;
  /** Plan step this event completes, if any. */
  step?: number;
}

/** First sequence number the demo assigns. The stream's earlier history is out of frame. */
export const FIRST_SEQ = 41;

/** One deterministic task, in the order the workflow appends its events. */
export const replayScript: ScriptEvent[] = [
  { type: "TASK_ACCEPTED", node: "api", note: "The API accepts the task and returns at once." },
  { type: "WORKFLOW_STARTED", node: "workflow", note: "A durable workflow takes ownership of the task." },
  { type: "PLAN_CREATED", node: "planner", note: "The planner produces three ordered steps." },
  { type: "STEP_COMPLETED", node: "research", note: "Step 1 of 3 complete: context gathered.", step: 1 },
  { type: "STEP_COMPLETED", node: "analysis", note: "Step 2 of 3 complete: result evaluated.", step: 2 },
  { type: "APPROVAL_REQUESTED", node: "approval", note: "The workflow waits for a human decision." },
  { type: "APPROVAL_RECORDED", node: "approval", note: "The decision is stored durably; the workflow reads it from state." },
  { type: "STEP_COMPLETED", node: "execution", note: "Step 3 of 3 complete: outcome applied.", step: 3 },
  { type: "STATE_UPDATED", node: "workflow", note: "Task state updated from the event history." },
  { type: "TASK_COMPLETED", node: "workflow", note: "Task complete." },
];

/* ---- Architecture (schematic) ----------------------------------------- */

export interface ArchComponent {
  id: string;
  label: string;
  layer: "client" | "api" | "orchestration" | "workers" | "state" | "crosscutting";
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
    why: "People watch long-running agent work as it happens, including after a refresh or a dropped connection.",
    responsibilities: ["Render task and agent state", "Remember the last event it applied", "Resume from that position after reconnecting"],
    tradeoff: "The client keeps its own projection instead of re-fetching everything, so it has to detect and handle gaps.",
  },
  {
    id: "api",
    label: "FastAPI",
    layer: "api",
    why: "A thin, typed boundary. Requests start work; they never wait for it to finish.",
    responsibilities: ["Validate and authorize requests", "Start workflows and return immediately", "Serve state and event history"],
    tradeoff: "A thin API moves complexity into the workflow layer, where it can be retried and observed.",
  },
  {
    id: "websockets",
    label: "WebSockets",
    layer: "api",
    why: "Agent progress is pushed, not polled. A reconnecting client states where it stopped.",
    responsibilities: ["Push events to subscribed clients", "Accept a resume position on reconnect", "Hand off from replay to live delivery"],
    tradeoff: "Connections drop, so reconnecting has to be a normal path in the protocol rather than an exception.",
  },
  {
    id: "temporal",
    label: "Temporal",
    layer: "orchestration",
    why: "Long-running work cannot depend on one process staying alive. A lost worker must not lose a half-finished workflow.",
    responsibilities: ["Durable workflow coordination", "Retry semantics", "Resumption after worker loss"],
    tradeoff: "An extra service, and workflow code must be deterministic, so non-deterministic agent calls run as activities.",
  },
  {
    id: "workers",
    label: "Agent workers",
    layer: "workers",
    why: "Agent steps call models and tools. They are slow, can fail, and must be isolated from the deterministic workflow logic.",
    responsibilities: ["Execute plan steps as activities", "Report results back to the workflow"],
    tradeoff: "Workers can disappear at any time, so steps must be safe to retry.",
  },
  {
    id: "postgres",
    label: "PostgreSQL",
    layer: "state",
    why: "Durable state for tasks, ownership, sessions and human decisions, with transactions where correctness matters.",
    responsibilities: ["Persist durable task and decision state", "Arbitrate concurrent decisions to one outcome", "Hold ownership records"],
    tradeoff: "Writing decisions durably first costs latency in exchange for one source of truth.",
  },
  {
    id: "redis",
    label: "Redis",
    layer: "state",
    why: "Ordered event streams carry delivery state between the system and its clients.",
    responsibilities: ["Append events in order", "Serve a missed interval to a reconnecting client", "Make a history reset detectable"],
    tradeoff: "Delivery state is transient. When history cannot be proven complete, resume reports an explicit gap instead of a partial replay.",
  },
  {
    id: "tenancy",
    label: "Tenant boundary",
    layer: "crosscutting",
    why: "Several organisations share one system. An event claiming a tenant is not proof of ownership.",
    responsibilities: ["Resolve ownership from trusted stored state", "Withhold delivery when ownership is unknown"],
    tradeoff: "Failing closed can hide a legitimate event until ownership is resolved, which is preferable to delivering it to the wrong tenant.",
    boundary: "Enforcement mechanics are intentionally not published.",
  },
  {
    id: "auth",
    label: "Authentication",
    layer: "crosscutting",
    why: "Every request and every socket has to be tied to an identity before it can do anything.",
    responsibilities: ["Establish identity", "Bind identity to tenant scope"],
    tradeoff: "Sockets need the same guarantees as requests, which complicates reconnecting.",
    boundary: "Authentication internals are intentionally not published.",
  },
];

export const archLayers: { id: ArchComponent["layer"]; label: string }[] = [
  { id: "client", label: "Client" },
  { id: "api", label: "API and event gateway" },
  { id: "orchestration", label: "Workflow coordination" },
  { id: "workers", label: "Agent steps" },
  { id: "state", label: "Durable state and event delivery" },
];

/* ---- Decision records -------------------------------------------------- */

export const samsDecisions: DecisionRecord[] = [
  {
    key: "A",
    title: "Durable workflows for agent work",
    problem: "Agent plans run for minutes, wait for human decisions and call external services. A restart or a lost worker must not lose progress or leave state half-written.",
    options: [
      { key: "A", label: "Durable workflow engine (Temporal)", detail: "Workflow state is recorded by the engine; work resumes after a worker is lost." },
      { key: "B", label: "Task queue with workers", detail: "Light and familiar; multi-step progress, retries and waiting are hand-written." },
      { key: "C", label: "Background tasks in the API process", detail: "Simplest to start; any restart drops in-flight work." },
    ],
    selected: "A",
    reason: "The hard part is not running a step but surviving partial failure across many steps and long waits. A durable engine makes that the default.",
    tradeoff: "An extra service to operate. Workflow code must be deterministic, so agent calls live in activities.",
    evidence: "Historical test on a Temporal development server: a worker was stopped and replaced while a workflow waited for approval, and the workflow resumed.",
    evidenceSource: samsSources.verification,
  },
  {
    key: "B",
    title: "Resume from a position, or name the gap",
    problem: "A reconnecting client must receive every event it missed. If the history it needs no longer exists, it must be told, not given a partial replay that looks complete.",
    options: [
      { key: "A", label: "Resume from the last applied position; report an explicit gap", detail: "Replay the missed interval when history can be proven complete; otherwise return an incomplete-sync outcome." },
      { key: "B", label: "Full refetch on every reconnect", detail: "Always correct; expensive and noisy for brief disconnects." },
      { key: "C", label: "Best-effort replay", detail: "Cheap; can silently skip events when history was trimmed or reset." },
    ],
    selected: "A",
    reason: "Brief disconnects are the common case and replaying a short interval is cheap. Naming the gap keeps the protocol honest when history is incomplete.",
    tradeoff: "Every consumer must handle a gap outcome, and history resets must be detectable.",
    evidence: "Historical Redis 7 integration tests covering stream deletion, restart without persistence and trimmed history: resume reported an explicit gap when history could not be proven complete.",
    evidenceSource: samsSources.verification,
  },
  {
    key: "C",
    title: "No gap and no duplicate at the replay-to-live handoff",
    problem: "Events keep arriving while a client is catching up. The moment it switches from replayed to live events must not skip or repeat anything.",
    options: [
      { key: "A", label: "Ordered handoff with a shared position", detail: "Replay up to the live position, then continue live from exactly the next event." },
      { key: "B", label: "Replay, then subscribe", detail: "Simple; events appended between the two steps can be lost." },
      { key: "C", label: "Subscribe, then replay without de-duplication", detail: "Nothing is lost; events at the boundary can arrive twice." },
    ],
    selected: "A",
    reason: "A client's state is only trustworthy if every event is applied exactly once, in order.",
    tradeoff: "The handoff needs careful ordering and is the part of the protocol most worth testing under concurrency.",
    evidence: "Historical real-Redis race test with concurrent writes during replay found no missing or duplicated event at the boundary. A deliberately late live capture, run as a negative control, failed as expected.",
    evidenceSource: samsSources.verification,
  },
  {
    key: "D",
    title: "Durable state decides, not the message",
    problem: "A human decision, a deadline and a workflow wake-up signal can race. If the signal is lost, the decision must still take effect, exactly once.",
    options: [
      { key: "A", label: "Arbitrate against one durable decision record", detail: "The first durable decision wins; the workflow re-reads stored state." },
      { key: "B", label: "Trust the signal payload", detail: "Fast; a lost or duplicated signal changes the outcome." },
      { key: "C", label: "Read, then write", detail: "Simple; two concurrent decisions can both be accepted." },
    ],
    selected: "A",
    reason: "Messages can be lost or repeated. A stored decision cannot be both approved and rejected.",
    tradeoff: "Every path, including the deadline, has to go through the same record.",
    evidence: "Historical PostgreSQL race tests: exactly one durable outcome for concurrent decisions and decision-versus-deadline. Temporal test: a decision recorded without its signal was recovered from state.",
    evidenceSource: samsSources.verification,
  },
  {
    key: "E",
    title: "Ownership from trusted state, failing closed",
    problem: "Several tenants share the system. An event that names a tenant is a claim, not proof.",
    options: [
      { key: "A", label: "Resolve ownership from trusted stored state; withhold when unknown", detail: "Delivery requires a resolved owner." },
      { key: "B", label: "Trust the tenant named in the event", detail: "Simple; one wrong claim leaks data." },
      { key: "C", label: "Separate deployment per tenant", detail: "Strongest isolation; heavy to operate at this scale." },
    ],
    selected: "A",
    reason: "Isolation should hold even when an upstream component is wrong.",
    tradeoff: "Unresolved ownership delays delivery until it is resolved.",
    evidence: "Historical Redis/PostgreSQL and unit tests: delivery failed closed for unknown or conflicting tenant attribution in the tested cases.",
    evidenceSource: samsSources.verification,
  },
];

/* ---- Case study -------------------------------------------------------- */

export const samsCaseStudy: CaseStudy = {
  slug: "sams",
  name: "SAMS",
  fullName: "Spatial Agentic Management System",
  lab: "Agent Systems Lab",
  oneLiner:
    "An independent engineering project: a multi-tenant system for long-running LLM agent workflows, built so that clients can disconnect, reconnect and resume without silently missing events.",
  glance: {
    role: "Technical Lead / Maintainer",
    roleDetail: "Led backend architecture, event replay, real-time state and reliability validation.",
    project: "Independent project · private codebase",
    team: "2-person project",
    status: "In development · not deployed to production",
    problemLabel: "Core challenge",
    problem: "Agent workflows run for minutes, wait for human decisions and outlive worker processes, while clients whose connections drop must still see every event.",
    approach: ["Durable workflows", "Resumable, ordered event streams", "Durable state as the authority"],
    stack: ["FastAPI", "Temporal", "PostgreSQL", "Redis", "WebSockets"],
    evidence: [
      { text: "Public reliability evidence package", href: samsSources.evidence.href },
      { text: "Historical CI run, 4 Oct 2026: 543 unit tests and 25 integration checks passed on a prior private snapshot", href: samsSources.ci.href },
    ],
  },
  problem: {
    summary:
      "Calling an agent is easy. Keeping long-running agent work durable, observable and consistent is the hard part: work has to survive lost workers, human decisions have to settle to one outcome, and every client has to end up agreeing with the server after a dropped connection.",
    difficulty: [
      "Long-running plans are interrupted by restarts, lost workers and timeouts.",
      "A human decision, a deadline and a wake-up signal can race each other.",
      "Clients disconnect while events keep arriving, and must neither miss nor repeat any.",
      "Several tenants share infrastructure that must never leak between them.",
    ],
  },
  role: {
    summary: "Technical Lead / Maintainer of a 2-person independent project.",
    items: [
      "Led backend architecture: workflow coordination, event delivery and replay, real-time state",
      "Set the engineering decisions and the acceptance criteria for each reliability guarantee",
      "Led technical validation: failure scenarios, race tests and deliberately broken variants (negative controls)",
    ],
    context:
      "As stated in the public evidence package, the private system was built with AI coding agents in a specification, review and validation workflow, with architecture, engineering decisions, acceptance criteria and technical validation owned by Salih. Infrastructure, identifiers and security internals are intentionally omitted here.",
  },
  status: {
    summary: "In development. The reliability guarantees below were verified by historical tests on a prior private snapshot; they are not production measurements.",
    items: [
      "A reconnecting client receives the complete missed interval, or an explicit gap when history cannot be proven complete.",
      "The replay-to-live handoff showed no missing or duplicated event under concurrent writes.",
      "Concurrent human decisions and deadlines settled to exactly one durable outcome.",
      "A workflow resumed after its worker was stopped and replaced.",
      "Delivery failed closed for unknown or conflicting tenant attribution in the tested cases.",
    ],
    limits: [
      "No production traffic, load test or reconnect-storm measurement.",
      "Temporal was tested on a development server, not a production cluster.",
      "Agent, Git and Docker activities were stubbed in integration tests: they test control flow and failure handling, not agent output quality.",
    ],
    limitsSource: samsSources.limitations,
  },
  architectureSummary:
    "Requests start work and return. A durable Temporal workflow owns each task and runs agent steps as activities. Durable task, ownership and decision state lives in PostgreSQL; ordered event streams in Redis carry delivery state to WebSocket clients, which resume from the last event they applied — or are told explicitly that a gap exists.",
  hardProblems: [
    { title: "Partial failure across many steps", body: "A plan that loses its worker at step two of three must neither restart from zero nor re-run completed steps." },
    { title: "Consistency across reconnects", body: "A client that blinks offline must end up exactly where the server is, or be told precisely what it could not recover." },
    { title: "Multi-instance delivery", body: "Multi-instance delivery requires fan-out between application instances, without creating a second source of truth." },
    { title: "Determinism around non-deterministic agents", body: "Workflow logic must replay identically while agent calls cannot. Agent calls run as activities, outside the deterministic workflow." },
  ],
  decisions: samsDecisions,
  evidence: [
    {
      kind: "Historical verification",
      items: [
        "Historical result: 543 unit tests passed (3 deselected) and 25 integration checks passed in GitHub Actions on 4 Oct 2026, against Redis 7, PostgreSQL 16 and a Temporal development server.",
        "These results belong to a prior private implementation snapshot. They are not a current or live measurement.",
      ],
      source: samsSources.ci,
    },
    {
      kind: "Failure scenarios",
      items: [
        "Stream deletion, restart without persistence and trimmed history",
        "Concurrent event writes during replay",
        "Concurrent approve/reject and decision/deadline races",
        "Decision recorded without its workflow signal",
        "Worker stopped and replaced during an approval wait",
      ],
      source: samsSources.verification,
    },
  ],
  didntWork: {
    intro:
      "The test campaign deliberately broke each guarantee to show the tests could fail. These are historical negative controls on the original implementation, not incidents.",
    items: [
      { title: "Read-then-write approval", body: "Reading a decision and then writing it let two concurrent decisions both succeed.", lesson: "Arbitrate on one durable record." },
      { title: "Trusting the signal payload", body: "Acting on the wake-up message instead of stored state made the outcome depend on message delivery.", lesson: "Durable state is the authority; messages are hints." },
      { title: "Starting live delivery too late", body: "Capturing live events too late during a reconnect opened a window in which events could be missed.", lesson: "The replay-to-live boundary needs its own test under concurrency." },
      { title: "Ignoring history resets", body: "Without detecting that a stream had been reset, a resume could look complete when it was not.", lesson: "If completeness cannot be proven, name the gap." },
    ],
    source: samsSources.verification,
  },
  details: {
    constraints: [
      "Work must survive the loss of a worker process",
      "Clients must converge after reconnecting, or learn exactly what was lost",
      "Agent behaviour is non-deterministic and must stay outside deterministic workflow logic",
      "No visitor-facing material may expose infrastructure or security details",
    ],
    implementation: [
      { title: "Thin API, durable workflows", body: "Endpoints validate, authorize and start work. Anything that can fail slowly runs inside a workflow, where it can be retried and observed." },
      { title: "Ordered event streams", body: "Each stream is ordered. Consumers track the last event applied and resume from it." },
      { title: "Decisions as durable records", body: "Human decisions are stored first and acted on second, so a lost signal cannot lose a decision." },
      { title: "Fail-closed ownership", body: "Delivery requires an owner resolved from trusted stored state." },
    ],
  },
};
