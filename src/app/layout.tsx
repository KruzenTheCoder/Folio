import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Folio — World-Class Resume Builder",
  description: "Folio helps you craft stunning, ATS-optimized resumes with AI in minutes. Visual editor, smart templates, instant PDF export.",
  keywords: ["folio", "resume builder", "AI resume", "ATS resume", "professional resume"],
  applicationName: "Folio",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
  },
  openGraph: {
    title: "Folio — AI-Powered Resume Builder",
    description: "Build ATS-optimized, beautiful resumes with AI, live editor, and one-click PDF export.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Folio — AI-Powered Resume Builder",
    description: "Build ATS-optimized, beautiful resumes with AI, live editor, and one-click PDF export.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakarta.variable} dark h-full antialiased`}>
      <body suppressHydrationWarning className="min-h-full flex flex-col overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
