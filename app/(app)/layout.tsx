import { auth } from "@/lib/auth";
import { isGithubConfigured, isGoogleConfigured } from "@/lib/env";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  const providers: string[] = [];
  if (isGithubConfigured) providers.push("github");
  if (isGoogleConfigured) providers.push("google");

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar user={session?.user ?? null} providers={providers} />
      <div className="mx-auto flex w-full max-w-7xl flex-1">
        <Sidebar />
        <main className="min-w-0 flex-1 px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
