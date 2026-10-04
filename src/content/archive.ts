/*
 * Engineering Archive — professional work.
 *
 * Public boundary: describe the problem space, responsibility and practice.
 * Never internal systems, code, names of internal tools, data or anything an
 * employer would consider confidential.
 */

export interface EngineeringRecord {
  id: string;
  organisation: string;
  discipline: string;
  summary: string;
  focus: string[];
  problem: string;
  responsibility: string[];
  practice: string[];
  environment: string;
  boundary: string;
}

export const engineeringRecords: EngineeringRecord[] = [
  {
    id: "ER-01",
    organisation: "Crytek",
    discipline: "Backend Engineering",
    summary: "Production backend work for a game technology company.",
    focus: ["Production backend work", "Telemetry", "Testing", "API development"],
    problem:
      "Backend services for games and tools have to stay correct under real player traffic, and the people who build on them need APIs and data they can trust.",
    responsibility: [
      "Developing and maintaining backend APIs used by other teams",
      "Telemetry: getting reliable, well-structured data out of running systems",
      "Writing and extending automated tests around backend behaviour",
    ],
    practice: [
      "Tests as the definition of done, not a follow-up task",
      "Treating telemetry as a product with consumers, schemas and expectations",
      "Small, reviewable changes to services that are already in production",
    ],
    environment: "Production services, shared with other engineering teams.",
    boundary: "Internal systems, code and data are confidential and intentionally not described.",
  },
];
