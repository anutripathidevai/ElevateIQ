/**
 * Cloud, DevOps & Production Engineering — component barrel.
 *
 * The landing page composes CourseModules; the `[module]` route renders
 * ModuleView (published) or ComingSoon; the `/questions` route renders
 * QuestionBank. All are data-driven from the registry / content-api.
 */
export { ModuleCard } from "./module-card";
export { CourseModules } from "./course-modules";
export { ModuleView } from "./module-view";
export { QuestionBank } from "./question-bank";
export { ComingSoon } from "./coming-soon";
