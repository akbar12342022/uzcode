import localFont from "next/font/local";

// Two faces from one family: the sans carries prose and UI, the mono carries
// headlines, code and every number. Sharing a family keeps the proportions
// consistent when the two sit side by side in a table row.
//
// The files live in the repository rather than coming from Google Fonts, so
// the site has no third-party request on first paint and keeps working when
// that service is blocked — which, for part of this audience, it is.
// IBM Plex is licensed under the SIL Open Font License.

/** Body, UI labels, problem statements. */
export const plexSans = localFont({
  variable: "--font-plex-sans",
  display: "swap",
  src: [
    { path: "../app/fonts/plex-sans-400.woff2", weight: "400", style: "normal" },
    { path: "../app/fonts/plex-sans-500.woff2", weight: "500", style: "normal" },
    { path: "../app/fonts/plex-sans-600.woff2", weight: "600", style: "normal" },
  ],
});

/** Headlines, code, test data, every numeric column. */
export const plexMono = localFont({
  variable: "--font-plex-mono",
  display: "swap",
  src: [
    { path: "../app/fonts/plex-mono-400.woff2", weight: "400", style: "normal" },
    { path: "../app/fonts/plex-mono-500.woff2", weight: "500", style: "normal" },
    { path: "../app/fonts/plex-mono-600.woff2", weight: "600", style: "normal" },
  ],
});
