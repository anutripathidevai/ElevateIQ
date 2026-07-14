import { LogIn } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function SignInPrompt({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
        <LogIn className="h-8 w-8 text-muted-foreground" />
        <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
        <p className="text-xs text-muted-foreground">
          Use the &ldquo;Sign in&rdquo; button in the top-right corner.
        </p>
      </CardContent>
    </Card>
  );
}
