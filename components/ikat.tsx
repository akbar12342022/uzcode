import { cn } from "@/lib/utils";

// The UzCode signature: an ikat (atlas silk) lattice drawn on a pixel grid.
// One character is one cell; the tile repeats in both directions, with the
// corner diamonds completing across tile edges.
const MOTIF = [
  "FZAW...WW...WAZF",
  "ZAW...WFFW...WAZ",
  "AW...WFZZFW...WA",
  "W...WFZAAZFW...W",
  "W...WFZAAZFW...W",
  "AW...WFZZFW...WA",
  "ZAW...WFFW...WAZ",
  "FZAW...WW...WAZF",
];

// Hex values rather than CSS variables: the pattern is rendered as an SVG
// background image, which cannot read the page's custom properties.
const GROUND = "#1b2470";
const THREADS: Record<string, string> = {
  W: "#ffffff",
  F: "#19b5ac", // feruza (turquoise)
  Z: "#f0a81e", // za'faron (saffron)
  A: "#d63b55", // anor (pomegranate)
};

function tileImage(rows: string[]) {
  const width = rows[0].length;
  const height = rows.length;

  let cells = "";
  rows.forEach((row, y) => {
    for (let x = 0; x < width; ) {
      const thread = row[x];
      let run = 1;
      while (x + run < width && row[x + run] === thread) run++;
      if (thread in THREADS) {
        cells += `<rect x="${x}" y="${y}" width="${run}" height="1" fill="${THREADS[thread]}"/>`;
      }
      x += run;
    }
  });

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" shape-rendering="crispEdges">` +
    `<rect width="${width}" height="${height}" fill="${GROUND}"/>${cells}</svg>`;

  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

type IkatProps = {
  /** Size of one cell in CSS pixels. */
  cell: number;
  /** Half-open range of motif rows to weave; defaults to the whole tile. */
  rows?: [from: number, to: number];
  className?: string;
};

/** Decorative ikat fabric; size it with `className`. */
export function Ikat({ cell, rows = [0, MOTIF.length], className }: IkatProps) {
  const slice = MOTIF.slice(rows[0], rows[1]);

  return (
    <div
      aria-hidden
      className={cn("bg-center", className)}
      style={{
        backgroundImage: tileImage(slice),
        backgroundSize: `${slice[0].length * cell}px ${slice.length * cell}px`,
      }}
    />
  );
}
