"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "./auth-provider";

/** Logs the mock user out and returns them to the login screen. */
export function LogoutButton() {
  const { logout } = useAuth();
  const router = useRouter();

  return (
    <Button
      type="button"
      variant="outline"
      className="gap-2 text-danger hover:text-danger"
      onClick={() => {
        logout();
        router.replace("/login");
      }}
    >
      <LogOut className="h-4 w-4" />
      Log out
    </Button>
  );
}
