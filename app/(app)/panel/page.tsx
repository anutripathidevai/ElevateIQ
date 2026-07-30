import { Users } from "lucide-react";
import { getUserId } from "@/lib/current-user";
import { isAzureConfigured } from "@/lib/env";
import { PageHeader } from "@/features/shared/components/page-header";
import { SignInPrompt } from "@/components/layout/sign-in-prompt";
import { listInterviews } from "@/features/panel-interview/services/interviews";
import { PersonaPanel } from "@/features/panel-interview/components/persona-panel";
import { PanelSetup } from "@/features/panel-interview/components/panel-setup";
import { PanelHistory } from "@/features/panel-interview/components/panel-history";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mock Panel Interview" };

export default async function PanelPage() {
  const userId = await getUserId();

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Users className="h-6 w-6 text-primary" />}
        title="Mock Panel Interview"
        description="Face a full interview panel — a Hiring Manager, a Senior Engineer, and a Principal Engineer, each with their own goals and follow-up style. Finish to get a scorecard by competency, per-interviewer feedback, an overall recommendation, and a personalized improvement plan."
      />

      <PersonaPanel />

      {userId ? (
        <>
          <PanelSetup aiEnabled={isAzureConfigured} />
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Your interviews</h2>
            <PanelHistory interviews={await listInterviews(userId)} />
          </section>
        </>
      ) : (
        <SignInPrompt message="Sign in to start a panel interview and track your scorecards over time." />
      )}
    </div>
  );
}
