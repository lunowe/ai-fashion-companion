import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { Instrument_Serif, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-instrument-serif",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "FitFlow | Your Wardrobe, Decoded",
  description:
    "150 pieces. Infinite outfits. AI-powered styling that abstracts your wardrobe into a formula for effortless style.",
  keywords: [
    "fashion AI",
    "outfit generator",
    "wardrobe organizer",
    "style assistant",
    "clothing app",
    "AI styling",
    "personal stylist",
  ],
  openGraph: {
    title: "FitFlow | Your Wardrobe, Decoded",
    description:
      "150 pieces. Infinite outfits. AI-powered styling that abstracts your wardrobe into a formula for effortless style.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${instrumentSerif.variable} ${dmSans.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
