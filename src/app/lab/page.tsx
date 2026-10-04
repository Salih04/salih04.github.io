import type { Metadata } from "next";
import { FacilityMap, type Room } from "@/components/lab/FacilityMap";
import { LabLink } from "@/components/shell/LabLink";
import { engineeringRecords } from "@/content/archive";
import { notes } from "@/content/notes";
import { site } from "@/content/site";
import { vault } from "@/content/vault";

export const metadata: Metadata = {
  title: "Control Room",
  description: "The S//LAB control room: navigation hub for SAMS, FinanceIQ, the Engineering Archive, the Experiment Vault and Lab Notes.",
};

// Statuses describe the interface, never production telemetry.
const rooms: Room[] = [
  { id: "sams", index: "02", area: "Agent Systems Lab", title: "SAMS", href: "/sams/", status: ["6 agent nodes · demo", "Scripted workflow ready"], tone: "signal", cell: [1, 2] },
  { id: "financeiq", index: "03", area: "Market Data Lab", title: "FinanceIQ", href: "/financeiq/", status: ["Experiment #038", "PIT reconstruction ready"], tone: "research", cell: [2, 3] },
  { id: "archive", index: "04", area: "Engineering Archive", title: "Archive", href: "/archive/", status: ["Engineering records", `${engineeringRecords.length} record on file`], tone: "neutral", cell: [2, 1] },
  { id: "vault", index: "05", area: "Experiment Vault", title: "Vault", href: "/vault/", status: [`${vault.length} samples catalogued`], tone: "neutral", cell: [3, 2] },
  { id: "notes", index: "06", area: "Lab Notes", title: "Notes", href: "/notes/", status: [`${notes.length} records published`], tone: "neutral", cell: [3, 3] },
];

const index = [
  { href: "/sams/case-study/", label: "SAMS", detail: "Agent orchestration, real-time state and durable workflows — case study." },
  { href: "/financeiq/case-study/", label: "FinanceIQ", detail: "Point-in-time market data and leakage-free research — case study." },
  { href: "/archive/", label: "Engineering Archive", detail: "Professional engineering records, including Crytek." },
  { href: "/vault/", label: "Experiment Vault", detail: "Smaller projects, prototypes and failed experiments." },
  { href: "/notes/", label: "Lab Notes", detail: "Engineering and research writing." },
  { href: "/about/", label: "About", detail: "The researcher, and how the work connects." },
];

export default function ControlRoomPage() {
  return (
    <div className="control">
      <header className="control__intro">
        <p className="eyebrow eyebrow--signal">01 — Control Room</p>
        <h1 className="control__title">Welcome to the lab.</h1>
        <p className="control__lead">
          I&apos;m {site.name} — a software engineer with an MSc in Data Science. I build systems whose correctness has to be
          proven: agent workflows that survive failure, real-time state that survives reconnects, and research pipelines that
          cannot use the future.
        </p>
        <ul className="control__routes">
          <li>
            <span className="mono">Short on time?</span> <LabLink href="/case-studies/">Read the case studies</LabLink>
          </li>
          <li>
            <span className="mono">Systems engineer?</span> <LabLink href="/sams/#architecture">Inspect the SAMS architecture</LabLink>
          </li>
          <li>
            <span className="mono">Researcher?</span> <LabLink href="/financeiq/#pit">Reconstruct history in FinanceIQ</LabLink>
          </li>
        </ul>
        <p className="control__hint mono">
          Toggle <strong>Case study</strong> at any time for a plain reading view. Press <kbd>~</kbd> for the terminal.
        </p>
      </header>

      <section className="control__map" aria-label="Facility map">
        <FacilityMap rooms={rooms} />
      </section>

      <section className="control__index" aria-labelledby="index-title">
        <h2 id="index-title" className="eyebrow">
          Research index
        </h2>
        <ul className="index-list">
          {index.map((item) => (
            <li key={item.href}>
              <LabLink href={item.href}>
                <span className="index-list__label">{item.label}</span>
                <span className="index-list__detail">{item.detail}</span>
                <span className="index-list__arrow" aria-hidden="true">
                  →
                </span>
              </LabLink>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
