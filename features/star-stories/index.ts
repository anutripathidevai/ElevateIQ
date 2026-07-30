/**
 * AI STAR Story Generator — public module API.
 */
export * from "./types";
export {
  normalizeTags,
  emptyStoryInput,
  inputFromGenerated,
  searchStories,
  storyToPlainText,
  storyToInput,
  duplicateTitle,
} from "./utils";
export {
  listStories,
  getStory,
  createStory,
  updateStory,
  deleteStory,
  duplicateStory,
} from "./services/stories";
export { generateStarStories } from "./ai/generator";
export { buildStarPrompt } from "./ai/prompts";
export {
  starGenerationInputSchema,
  type StarGenerationInput,
} from "./ai/schemas";
export { StarStoriesClient } from "./components/star-stories-client";
export { StarStoryCard } from "./components/star-story-card";
