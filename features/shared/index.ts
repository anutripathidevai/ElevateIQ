/**
 * Public surface of the shared feature toolkit. Import from `@/features/shared`
 * for cross-feature primitives (async-state UI, hooks, the memory store, and
 * pure utilities).
 */
export {
  Spinner,
  LoadingState,
  EmptyState,
  ErrorState,
} from "./components/states";
export { PageHeader } from "./components/page-header";

export { useLocalStorage } from "./hooks/use-local-storage";
export { useDebouncedValue } from "./hooks/use-debounced-value";
export { useAsyncAction } from "./hooks/use-async-action";
export type { AsyncStatus, AsyncActionState } from "./hooks/use-async-action";
export { useCopyToClipboard } from "./hooks/use-copy-to-clipboard";

export { createMemoryStore } from "./store/memory-store";
export type {
  StoredEntity,
  MemoryStore,
  CreateInput,
  UpdatePatch,
} from "./store/memory-store";

export {
  generateId,
  pluralize,
  truncate,
  matchesQuery,
  uniqueSorted,
  timeAgo,
} from "./utils";
