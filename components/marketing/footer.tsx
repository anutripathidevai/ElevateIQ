import Link from "next/link";
import { Coffee } from "lucide-react";
import { Logo } from "./brand";
import { FOOTER_GROUPS } from "./marketing-data";

/** Marketing footer: brand, link columns, support, and legal line. */
export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-screen-2xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Build. Test. Deploy Your Career. A modern platform to learn,
              practice, and get interview-ready.
            </p>
            <Link
              href="/contact#support"
              className="mt-5 inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Coffee className="h-4 w-4" />
              Support the Builder
            </Link>
          </div>

          {FOOTER_GROUPS.map((group) => (
            <div key={group.title}>
              <h2 className="text-sm font-semibold text-foreground">
                {group.title}
              </h2>
              <ul className="mt-4 space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label + link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-sm font-medium text-foreground">
            Compile Ready ·{" "}
            <span className="text-muted-foreground">
              Build. Test. Deploy Your Career.
            </span>
          </p>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Compile Ready. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
