/**
 * Global 404 page. Catches unmatched routes and `notFound()` calls that don't
 * have a closer boundary. Provides branded chrome and clear ways back into the
 * product (home + learning).
 */
import Link from "next/link";
import { Compass, Home } from "lucide-react";
import { Logo } from "@/components/marketing/brand";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <Logo className="mb-8" />
      <p className="font-mono text-sm font-semibold uppercase tracking-[0.2em] text-primary">
        404
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        The page you are looking for doesn&apos;t exist or may have moved.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/" className={cn(buttonVariants({ size: "lg" }))}>
          <Home className="h-4 w-4" />
          Back to home
        </Link>
        <Link
          href="/learning"
          className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
        >
          <Compass className="h-4 w-4" />
          Explore learning
        </Link>
      </div>
    </div>
  );
}
