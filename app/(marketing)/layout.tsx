import { MarketingFooter, MarketingNav } from "@/components/marketing";

/**
 * Public marketing shell (home, pricing, contact). Provides the sticky nav and
 * footer; individual pages render only their content. Sits outside the
 * authenticated `(app)` shell so these routes are reachable without signing in.
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
