import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "FitFlow | AI-Powered Outfit Suggestions",
  description:
    "Stop staring at your closet. Get AI-powered outfit suggestions based on what you already own. Smart styling, simplified.",
  keywords: [
    "fashion AI",
    "outfit generator",
    "wardrobe organizer",
    "style assistant",
    "clothing app",
  ],
  openGraph: {
    title: "FitFlow | AI-Powered Outfit Suggestions",
    description:
      "Stop staring at your closet. Get AI-powered outfit suggestions based on what you already own.",
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
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
