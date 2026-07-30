import { Sparkles } from "lucide-react";
import { getUserId } from "@/lib/current-user";
import { isAzureConfigured } from "@/lib/env";
import { PageHeader } from "@/features/shared/components/page-header";
import { SignInPrompt } from "@/components/layout/sign-in-prompt";
import { listStories } from "@/features/star-stories/services/stories";
import { StarStoriesClient } from "@/features/star-stories/components/star-stories-client";

export const dynamic = "force-dynamic";
export const metadata = { title: "AI STAR Story Generator" };

export default async function StarStoriesPage() {
  const userId = await getUserId();

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Sparkles className="h-6 w-6 text-amber-500" />}
        title="AI STAR Story Generator"
        description="Turn a project into polished STAR stories — Situation, Task, Action, Result — complete with the skills and leadership principles they demonstrate and the behavioral questions they answer. Save, edit, duplicate, and reuse them."
      />

      {userId ? (
        <StarStoriesClient
          initialStories={await listStories(userId)}
          aiEnabled={isAzureConfigured}
        />
      ) : (
        <SignInPrompt message="Sign in to generate, save, and reuse your STAR stories." />
      )}
    </div>
  );
}
