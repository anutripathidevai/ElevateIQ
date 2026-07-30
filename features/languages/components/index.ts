/** Public component surface for the Programming Languages feature. Routes import
 * from here so the internal file layout can change without touching pages. */

export { TOPIC_SECTIONS, presentSectionIds, type TopicSectionDef } from "./sections";
export {
  LANGUAGE_ICONS,
  moduleAccent,
  formatMinutes,
  topicDifficultyClass,
  exerciseDifficultyClass,
} from "./ui";

// Topic page + building blocks
export { TopicPage } from "./topic-page";
export { TopicSection } from "./topic-section";
export { TopicMeta, TopicDifficultyBadge } from "./topic-meta";
export { TopicNav } from "./topic-nav";
export { MarkComplete } from "./mark-complete";
export { CodeBlock } from "./code-block";
export { CodeExamples } from "./code-example";
export { Diagrams } from "./diagram";
export { Playground } from "./playground";
export { OutputPredictions } from "./output-prediction";
export { CodingExercises } from "./coding-exercise";
export { InterviewQuestions } from "./interview-questions";
export { Quiz } from "./quiz";
export { CheatSheet } from "./cheat-sheet";

// Hub + course landing
export { LanguageCard } from "./language-card";
export { ComingSoon } from "./coming-soon";
export { Breadcrumb, type Crumb } from "./breadcrumb";
export { CourseProgress } from "./course-progress";
export { Roadmap } from "./roadmap";
export {
  ModuleCard,
  type ModuleView,
  type TopicLink,
} from "./module-card";
export { TopicIndex, type TopicIndexItem } from "./topic-index";
export { InterviewHubView } from "./interview-hub-view";
