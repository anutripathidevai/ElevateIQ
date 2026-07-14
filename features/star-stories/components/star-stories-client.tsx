"use client";

import { useMemo, useState } from "react";
import {
  Copy,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs } from "@/components/ui/tabs";
import { EmptyState } from "@/features/shared/components/states";
import { useDebouncedValue } from "@/features/shared/hooks/use-debounced-value";
import { pluralize, timeAgo } from "@/features/shared/utils";
import type { StarGenerationInput } from "../ai/schemas";
import type {
  GeneratedStarStory,
  StarStory,
  StarStoryInput,
} from "../types";
import {
  emptyStoryInput,
  inputFromGenerated,
  searchStories,
  storyToInput,
} from "../utils";
import {
  deleteStoryAction,
  duplicateStoryAction,
  generateStoriesAction,
  saveStoryAction,
  updateStoryAction,
} from "../actions";
import { StarStoryCard } from "./star-story-card";
import { StarStoryEditor } from "./star-story-editor";
import { StarStoryForm } from "./star-story-form";

type Tab = "library" | "generate";
type Notice = { type: "error" | "info"; text: string } | null;
type EditorState =
  | { mode: "new"; initial: StarStoryInput }
  | { mode: "edit"; id: string; initial: StarStoryInput }
  | null;

export interface StarStoriesClientProps {
  initialStories: StarStory[];
  aiEnabled: boolean;
}

export function StarStoriesClient({
  initialStories,
  aiEnabled,
}: StarStoriesClientProps) {
  const [tab, setTab] = useState<Tab>(
    initialStories.length === 0 ? "generate" : "library",
  );
  const [stories, setStories] = useState<StarStory[]>(initialStories);
  const [generated, setGenerated] = useState<GeneratedStarStory[]>([]);
  const [lastProject, setLastProject] = useState("");
  const [reuseProject, setReuseProject] = useState("");
  const [search, setSearch] = useState("");
  const [editor, setEditor] = useState<EditorState>(null);
  const [generating, setGenerating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice>(null);

  const debouncedSearch = useDebouncedValue(search, 200);
  const filtered = useMemo(
    () => searchStories(stories, debouncedSearch),
    [stories, debouncedSearch],
  );

  async function handleGenerate(input: StarGenerationInput) {
    setGenerating(true);
    setNotice(null);
    const res = await generateStoriesAction(input);
    setGenerating(false);
    if (res.ok && res.stories) {
      setGenerated(res.stories);
      setLastProject(input.project);
      setNotice({
        type: "info",
        text: `Generated ${pluralize(res.stories.length, "story", "stories")}. Review and save the ones you like.`,
      });
    } else {
      setNotice({ type: "error", text: res.error ?? "Generation failed." });
    }
  }

  async function handleSaveGenerated(story: GeneratedStarStory) {
    const res = await saveStoryAction(inputFromGenerated(story, lastProject));
    if (res.ok && res.story) {
      const saved = res.story;
      setStories((prev) => [saved, ...prev]);
      setGenerated((prev) => prev.filter((g) => g !== story));
      setNotice({ type: "info", text: "Story saved to your library." });
    } else {
      setNotice({ type: "error", text: res.error ?? "Could not save story." });
    }
  }

  async function handleEditorSubmit(input: StarStoryInput) {
    if (editor?.mode === "edit") {
      const res = await updateStoryAction(editor.id, input);
      if (res.ok && res.story) {
        const updated = res.story;
        setStories((prev) =>
          prev.map((s) => (s.id === updated.id ? updated : s)),
        );
        setEditor(null);
        setNotice({ type: "info", text: "Story updated." });
      }
      return res;
    }
    const res = await saveStoryAction(input);
    if (res.ok && res.story) {
      const saved = res.story;
      setStories((prev) => [saved, ...prev]);
      setEditor(null);
      setTab("library");
      setNotice({ type: "info", text: "Story saved to your library." });
    }
    return res;
  }

  async function handleDuplicate(story: StarStory) {
    setBusyId(story.id);
    const res = await duplicateStoryAction(story.id);
    setBusyId(null);
    if (res.ok && res.story) {
      const dup = res.story;
      setStories((prev) => [dup, ...prev]);
    } else {
      setNotice({ type: "error", text: res.error ?? "Could not duplicate." });
    }
  }

  async function handleDelete(story: StarStory) {
    if (!window.confirm(`Delete "${story.title}"? This can't be undone.`)) return;
    setBusyId(story.id);
    const res = await deleteStoryAction(story.id);
    setBusyId(null);
    if (res.ok) {
      setStories((prev) => prev.filter((s) => s.id !== story.id));
    } else {
      setNotice({ type: "error", text: res.error ?? "Could not delete." });
    }
  }

  function handleReuse(story: StarStory) {
    const seed =
      story.sourceProject ??
      [story.situation, story.task, story.action, story.result].join("\n\n");
    setReuseProject(seed);
    setGenerated([]);
    setTab("generate");
    setNotice({
      type: "info",
      text: "Loaded this story's project into the generator. Tweak and regenerate.",
    });
  }

  const iconBtn = "h-8 w-8";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs<Tab>
          value={tab}
          onValueChange={setTab}
          aria-label="STAR stories view"
          options={[
            { value: "library", label: `Library (${stories.length})` },
            { value: "generate", label: "Generate" },
          ]}
        />
        {tab === "library" && !editor && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditor({ mode: "new", initial: emptyStoryInput() })}
          >
            <Plus className="h-4 w-4" />
            New story
          </Button>
        )}
      </div>

      {notice && (
        <div
          role={notice.type === "error" ? "alert" : "status"}
          className={
            notice.type === "error"
              ? "rounded-md border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger"
              : "rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground"
          }
        >
          {notice.text}
        </div>
      )}

      {editor ? (
        <StarStoryEditor
          initial={editor.initial}
          heading={editor.mode === "edit" ? "Edit story" : "New story"}
          submitLabel={editor.mode === "edit" ? "Save changes" : "Save story"}
          onSubmit={handleEditorSubmit}
          onCancel={() => setEditor(null)}
        />
      ) : tab === "generate" ? (
        <div className="space-y-5">
          <StarStoryForm
            onGenerate={handleGenerate}
            generating={generating}
            aiEnabled={aiEnabled}
            defaultProject={reuseProject}
          />

          {generated.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-sm font-semibold">
                Generated stories
                <span className="ml-2 font-normal text-muted-foreground">
                  save the ones worth keeping
                </span>
              </h3>
              {generated.map((story, i) => (
                <StarStoryCard
                  key={i}
                  story={story}
                  defaultOpen
                  actions={
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleSaveGenerated(story)}
                      >
                        <Save className="h-4 w-4" />
                        Save
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setEditor({
                            mode: "new",
                            initial: inputFromGenerated(story, lastProject),
                          })
                        }
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                    </>
                  }
                />
              ))}
            </section>
          )}
        </div>
      ) : stories.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="h-8 w-8" />}
          title="No stories yet"
          description="Generate STAR stories from a project description, or add one manually."
          action={
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setTab("generate")}>
                <Sparkles className="h-4 w-4" />
                Generate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setEditor({ mode: "new", initial: emptyStoryInput() })
                }
              >
                <Plus className="h-4 w-4" />
                New story
              </Button>
            </div>
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search stories…"
              aria-label="Search stories"
              className="pl-9"
            />
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              title="No stories match"
              description="Try a different search."
            />
          ) : (
            <div className="space-y-3">
              {filtered.map((story) => (
                <StarStoryCard
                  key={story.id}
                  story={story}
                  meta={`Updated ${timeAgo(story.updatedAt)}`}
                  actions={
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={iconBtn}
                        aria-label="Edit story"
                        title="Edit"
                        onClick={() =>
                          setEditor({
                            mode: "edit",
                            id: story.id,
                            initial: storyToInput(story),
                          })
                        }
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={iconBtn}
                        aria-label="Duplicate story"
                        title="Duplicate"
                        disabled={busyId === story.id}
                        onClick={() => handleDuplicate(story)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={iconBtn}
                        aria-label="Reuse project in generator"
                        title="Reuse in generator"
                        onClick={() => handleReuse(story)}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={iconBtn}
                        aria-label="Delete story"
                        title="Delete"
                        disabled={busyId === story.id}
                        onClick={() => handleDelete(story)}
                      >
                        <Trash2 className="h-4 w-4 text-danger" />
                      </Button>
                    </>
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
