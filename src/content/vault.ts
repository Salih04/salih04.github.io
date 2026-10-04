/*
 * Experiment Vault — small projects, prototypes and technical experiments.
 *
 * The samples are experiments made while building this site; each one is
 * real and can be inspected in this repository.
 */

export type VaultOutcome = "Completed" | "Ongoing";

export interface VaultSample {
  id: string;
  name: string;
  status: "Prototype" | "Shipped";
  domain: string;
  outcome: VaultOutcome;
  note: string;
}

export const vault: VaultSample[] = [
  {
    id: "EXP-001",
    name: "Point-in-time reconstruction engine (toy)",
    status: "Shipped",
    domain: "Data",
    outcome: "Completed",
    note: "A tiny as-of resolver with leakage detection. Powers the Reconstruct History interaction and is covered by unit tests.",
  },
  {
    id: "EXP-002",
    name: "Deterministic experiment simulator",
    status: "Shipped",
    domain: "Research",
    outcome: "Completed",
    note: "Seeded synthetic results that show how leakage inflates performance. Same configuration, same fingerprint, same output.",
  },
  {
    id: "EXP-003",
    name: "Public boundary scanner",
    status: "Shipped",
    domain: "Systems",
    outcome: "Completed",
    note: "A build step that fails if content contains endpoints, credentials, private paths or internal identifiers.",
  },
  {
    id: "EXP-004",
    name: "Synthesized interface sound",
    status: "Prototype",
    domain: "UI",
    outcome: "Ongoing",
    note: "A few oscillator tones for state changes, generated at runtime with no audio files. Off by default.",
  },
];
