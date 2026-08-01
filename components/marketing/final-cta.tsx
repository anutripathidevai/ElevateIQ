import { Reveal } from "./reveal";
import { AuthCtas } from "./cta-buttons";

/** Closing, high-contrast branded call to action. */
export function FinalCta() {
  return (
    <section className="border-t border-border py-24">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <Reveal className="relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-16 text-center sm:px-12">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_50%_0%,hsl(var(--primary)/0.16),transparent_70%)]"
          />
          <div className="relative">
            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              Your Next Interview Starts Here.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
              Build. Test. Deploy Your Career. Learn. Practice. Get
              interview-ready.
            </p>
            <AuthCtas className="mt-8 justify-center" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
