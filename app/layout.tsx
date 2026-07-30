import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { MockAuthProvider } from "@/components/auth/auth-provider";

export const metadata: Metadata = {
  title: {
    default: "ElevateIQ — The AI career platform for software engineers",
    template: "%s · ElevateIQ",
  },
  description:
    "ElevateIQ helps software engineers land the offer: a company question bank, AI STAR story generator, mock panel interviews, and more — with instant AI feedback.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased">
        <ThemeProvider>
          <MockAuthProvider>{children}</MockAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
