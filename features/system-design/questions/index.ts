import type { SDQuestionContent } from "../types";
import { urlShortenerContent } from "./url-shortener";
import { rateLimiterContent } from "./rate-limiter";
import { distributedCacheContent } from "./distributed-cache";

/**
 * Registry of authored question content, keyed by slug. A question is
 * "published" only if its slug appears here AND in the catalog. Authoring a new
 * question = add a `<slug>.ts` content file, import it, and add it to this map.
 */
export const SD_CONTENT: Record<string, SDQuestionContent> = {
  [urlShortenerContent.slug]: urlShortenerContent,
  [rateLimiterContent.slug]: rateLimiterContent,
  [distributedCacheContent.slug]: distributedCacheContent,
};
