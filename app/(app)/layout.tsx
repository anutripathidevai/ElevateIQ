import { AppShell } from "@/components/focus-mode";
import { AuthGuard } from "@/components/auth/guards";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
}
