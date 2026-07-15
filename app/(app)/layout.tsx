import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";
import { AuthGuard } from "@/components/auth/guards";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col">
        <TopBar />
        <div className="mx-auto flex w-full max-w-7xl flex-1">
          <Sidebar />
          <main className="min-w-0 flex-1 px-4 py-6 md:px-8">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
