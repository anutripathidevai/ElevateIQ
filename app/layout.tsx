import type { Metadata, Viewport } from "next";
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
    default: "Compile Ready | AI-Powered Interview Prep for Software Engineers",
    template: "%s · Compile Ready",
  },
  description:
    "AI-powered interview preparation for software engineers. Learn and practice DSA, System Design, LLD, and Generative AI, then get interview-ready with AI mock interviews.",
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
    title: "Compile Ready | AI-Powered Interview Prep for Software Engineers",
    description:
      "AI-powered interview preparation for software engineers. Learn and practice DSA, System Design, LLD, and Generative AI, then get interview-ready with AI mock interviews.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Compile Ready | AI-Powered Interview Prep for Software Engineers",
    description:
      "Build. Test. Deploy Your Career. AI-powered interview preparation for software engineers.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0e1a" },
  ],
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
