import { Golos_Text, JetBrains_Mono, Tektur } from "next/font/google";

// Font definitions live in one module so the server layout and the client-side
// code editor share a single hosted instance of each face.

/** Body and UI text. */
export const golos = Golos_Text({
  subsets: ["latin"],
  variable: "--font-golos",
});

/** Display face: wordmark and page titles only. */
export const tektur = Tektur({
  subsets: ["latin"],
  variable: "--font-tektur",
});

/** Code, test data and numeric labels. */
export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});
