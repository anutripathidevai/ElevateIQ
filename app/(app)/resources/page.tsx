import { Library } from "lucide-react";
import { RESOURCE_GROUPS, RESOURCE_AI_ACTIONS } from "@/lib/dashboard-data";
import { ResourceCard } from "@/components/blocks/resource-card";
import { PageHeader } from "@/components/blocks/page-header";

export const metadata = { title: "Resources" };

export default function ResourcesPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Resources"
        title="Knowledge hub"
        description="Blogs, real interview experiences, system design notes, architecture guides, cheat sheets, and roadmaps — with AI tools to turn any of them into study material."
        accent="cyan"
        icon={Library}
        aiActions={["Summarize a topic", "Make flashcards", "Generate practice questions"]}
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {RESOURCE_GROUPS.map((group) => (
          <ResourceCard
            key={group.id}
            group={group}
            aiActions={RESOURCE_AI_ACTIONS}
          />
        ))}
      </div>
    </div>
  );
}
