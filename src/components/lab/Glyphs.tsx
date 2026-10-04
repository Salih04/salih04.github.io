import type { SVGProps } from "react";

type GlyphProps = Omit<SVGProps<SVGSVGElement>, "viewBox">;

/**
 * Tiny line-art previews of what is inside each room. Purely decorative
 * (aria-hidden); each one draws the signature structure of its lab. They
 * are used by the facility directory below desktop; the desktop floor plan
 * draws its own, larger floor instruments.
 */

export function SamsGlyph(props: GlyphProps) {
  return (
    <svg className="glyph glyph--sams" viewBox="0 0 120 60" aria-hidden="true" {...props}>
      <g className="glyph__edges">
        <path d="M14 30 H34 M34 30 L52 14 M34 30 L52 30 M34 30 L52 46" />
      </g>
      <circle cx="14" cy="30" r="3.5" className="glyph__node" />
      <circle cx="34" cy="30" r="4.5" className="glyph__node glyph__node--core" />
      <circle cx="52" cy="14" r="3" className="glyph__node" />
      <circle cx="52" cy="30" r="3" className="glyph__node" />
      <circle cx="52" cy="46" r="3" className="glyph__node" />
      <path d="M66 6 V54" className="glyph__rail" />
      {[10, 20, 30, 40, 50].map((y, i) => (
        <g key={y} className="glyph__event">
          <rect x="72" y={y - 3} width="10" height="6" />
          <rect x="86" y={y - 1.5} width={22 - (i % 3) * 5} height="3" className="glyph__text" />
        </g>
      ))}
      <path d="M62 30 h8" className="glyph__cursor" />
    </svg>
  );
}

export function FinanceGlyph(props: GlyphProps) {
  return (
    <svg className="glyph glyph--fiq" viewBox="0 0 120 60" aria-hidden="true" {...props}>
      <path d="M6 50 H114" className="glyph__axis" />
      {[16, 36, 56, 76, 96].map((x) => (
        <path key={x} d={`M${x} 48 v4`} className="glyph__axis" />
      ))}
      <rect x="78" y="6" width="36" height="40" className="glyph__future" />
      {[
        [10, 30, 14],
        [26, 54, 26],
        [42, 70, 38],
      ].map(([a, b, y]) => (
        <g key={y}>
          <path d={`M${a} ${y} H${b}`} className="glyph__lag" />
          <circle cx={a} cy={y} r="2.5" className="glyph__period" />
          <circle cx={b} cy={y} r="2.8" className="glyph__known" />
        </g>
      ))}
      <path d="M78 4 V52" className="glyph__asof" />
    </svg>
  );
}

export function ArchiveGlyph(props: GlyphProps) {
  return (
    <svg className="glyph glyph--archive" viewBox="0 0 120 60" aria-hidden="true" {...props}>
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${30 + i * 8} ${8 + i * 6})`}>
          <rect width="46" height="34" className="glyph__sheet" />
          <path d="M6 9 H34 M6 16 H40 M6 23 H28" className="glyph__text" />
        </g>
      ))}
    </svg>
  );
}

export function VaultGlyph(props: GlyphProps) {
  return (
    <svg className="glyph glyph--vault" viewBox="0 0 120 60" aria-hidden="true" {...props}>
      {[0, 1, 2, 3].map((i) => (
        <g key={i} transform={`translate(${14 + i * 24} 14)`}>
          <rect width="18" height="32" className="glyph__slot" />
          <circle cx="9" cy="20" r="4" className="glyph__specimen" />
        </g>
      ))}
    </svg>
  );
}

export function NotesGlyph(props: GlyphProps) {
  return (
    <svg className="glyph glyph--notes" viewBox="0 0 120 60" aria-hidden="true" {...props}>
      {[0, 1].map((i) => (
        <g key={i} transform={`translate(${32 + i * 20} ${6 + i * 4}) rotate(${i ? 4 : -3})`}>
          <rect width="38" height="46" className="glyph__sheet" />
          <path d="M6 10 H32 M6 17 H30 M6 24 H32 M6 31 H22" className="glyph__text" />
        </g>
      ))}
    </svg>
  );
}
