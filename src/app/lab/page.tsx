import type { Metadata } from "next";
import { FacilityDirectory, FacilityMap, type Room } from "@/components/lab/FacilityMap";
import { LabLink } from "@/components/shell/LabLink";
import { countLabel } from "@/lib/count";
import { notes } from "@/content/notes";
import { vault } from "@/content/vault";

export const metadata: Metadata = {
  title: "Control Room",
  description: "The S//LAB control room: navigation hub for SAMS, FinanceIQ, the Engineering Archive, the Experiment Vault and Lab Notes.",
};

// Statuses describe the interface, never production telemetry. Counts are
// derived from the content records, never typed in.
const rooms: Room[] = [
  { id: "sams", index: "02", area: "Agent Systems Lab", title: "SAMS", href: "/sams/", status: "Simulation ready", tone: "signal" },
  { id: "financeiq", index: "03", area: "Market Data Research Lab", title: "FinanceIQ", href: "/financeiq/", status: "In progress", tone: "research" },
  { id: "archive", index: "04", area: "Engineering Archive", title: "Archive", href: "/archive/", status: "Open", tone: "neutral" },
  { id: "vault", index: "05", area: "Experiment Vault", title: "Vault", href: "/vault/", status: countLabel(vault.length, "specimen"), tone: "neutral" },
  { id: "notes", index: "06", area: "Lab Notes", title: "Notes", href: "/notes/", status: countLabel(notes.filter((n) => n.status === "Draft").length, "draft"), tone: "neutral" },
];

const index = [
  { href: "/sams/case-study/", label: "SAMS", detail: "Agent workflows, event replay and reliability — case study." },
  { href: "/financeiq/case-study/", label: "FinanceIQ", detail: "Point-in-time market data and reproducible research — case study." },
  { href: "/archive/", label: "Engineering Archive", detail: "Professional engineering records." },
  { href: "/vault/", label: "Experiment Vault", detail: "Small technical experiments from building this site." },
  { href: "/notes/", label: "Lab Notes", detail: "Engineering and research writing (drafts)." },
  { href: "/about/", label: "About", detail: "Who runs this lab." },
];

export default function ControlRoomPage() {
  return (
    <div className="control">
      <header className="control__intro">
        <p className="eyebrow eyebrow--signal">01 — Control room</p>
        <h1 className="control__title">Choose a room.</h1>
        <p className="control__lead">
          I build software systems, agent workflows and research pipelines. Two of them are documented here as working instruments.
        </p>
        <ul className="control__routes">
          <li>
            <span>Short on time?</span> <LabLink href="/case-studies/">Read the case studies</LabLink>
          </li>
          <li>
            <span>Systems engineer?</span> <LabLink href="/sams/">Run the SAMS failure demo</LabLink>
          </li>
          <li>
            <span>Researcher?</span> <LabLink href="/financeiq/">Reconstruct history in FinanceIQ</LabLink>
          </li>
        </ul>
      </header>

      <section className="control__map" aria-label="Facility map">
        <FacilityMap rooms={rooms} />
        <FacilityDirectory rooms={rooms} />
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
