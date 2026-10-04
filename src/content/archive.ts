/*
 * Engineering Archive — professional work.
 *
 * Public boundary: describe the role and the kind of work. Never internal
 * systems, code, names of internal tools, data or anything an employer would
 * consider confidential. Only facts Salih has published are stated.
 */

export interface EngineeringRecord {
  id: string;
  organisation: string;
  role: string;
  period: string;
  summary: string;
  focus: string[];
  boundary: string;
}

export const engineeringRecords: EngineeringRecord[] = [
  {
    id: "ER-01",
    organisation: "Crytek",
    role: "Backend Engineering Intern",
    period: "May–Jul 2026",
    summary: "Backend engineering internship: Go services for the live game backend of Hunt: Showdown.",
    focus: ["Go", "Backend services", "Live game backend"],
    boundary: "Internal systems, code and data are confidential and intentionally not described.",
  },
];
