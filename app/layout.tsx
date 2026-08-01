import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { MockAuthProvider } from "@/components/auth/auth-provider";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://compileready.com"),
  title: {
    default: "Compile Ready | Software Engineering Interview Prep",
    template: "%s · Compile Ready",
  },
  description:
    "Learn, practice, and get interview-ready with DSA, System Design, LLD, coding practice, AI mock interviews, and structured learning paths.",
  applicationName: "Compile Ready",
  keywords: [
    "software engineering interview preparation",
    "coding interview preparation",
    "DSA",
    "System Design",
    "Low-Level Design",
    "AI mock interviews",
    "coding practice",
  ],
  openGraph: {
    type: "website",
    siteName: "Compile Ready",
    title: "Compile Ready | Software Engineering Interview Prep",
    description:
      "Learn, practice, and get interview-ready with DSA, System Design, LLD, coding practice, AI mock interviews, and structured learning paths.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Compile Ready | Software Engineering Interview Prep",
    description:
      "Build. Test. Deploy Your Career. Learn, practice, and get interview-ready.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(inter.variable, jetBrainsMono.variable)}
    >
      <body className="min-h-screen font-sans antialiased">
        <ThemeProvider>
          <MockAuthProvider>{children}</MockAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
