import type { SDQuestionContent } from "../types";
import { urlShortenerContent } from "./url-shortener";
import { rateLimiterContent } from "./rate-limiter";
import { distributedCacheContent } from "./distributed-cache";
// Foundations
import { keyValueStoreContent } from "./key-value-store";
import { loggingSystemContent } from "./logging-system";
import { metricsCollectionContent } from "./metrics-collection";
import { monitoringSystemContent } from "./monitoring-system";
import { apiGatewayContent } from "./api-gateway";
import { notificationServiceContent } from "./notification-service";
import { pastebinContent } from "./pastebin";
// Common Interview Questions
import { twitterContent } from "./twitter";
import { instagramContent } from "./instagram";
import { facebookFeedContent } from "./facebook-feed";
import { linkedinFeedContent } from "./linkedin-feed";
import { redditContent } from "./reddit";
import { tiktokContent } from "./tiktok";
import { whatsappContent } from "./whatsapp";
import { slackContent } from "./slack";
import { discordContent } from "./discord";
import { dropboxContent } from "./dropbox";
import { googleDriveContent } from "./google-drive";
import { youtubeContent } from "./youtube";
import { netflixContent } from "./netflix";
import { uberContent } from "./uber";
import { amazonContent } from "./amazon";
import { paymentGatewayContent } from "./payment-gateway";
import { shoppingCartContent } from "./shopping-cart";
import { googleCalendarContent } from "./google-calendar";
import { autocompleteContent } from "./autocomplete";
import { googleSearchContent } from "./google-search";

/**
 * Registry of authored question content, keyed by slug. A question is
 * "published" only if its slug appears here AND in the catalog. Authoring a new
 * question = add a `<slug>.ts` content file, import it, and add it to this map.
 */
export const SD_CONTENT: Record<string, SDQuestionContent> = {
  [urlShortenerContent.slug]: urlShortenerContent,
  [rateLimiterContent.slug]: rateLimiterContent,
  [distributedCacheContent.slug]: distributedCacheContent,
  // Foundations
  [keyValueStoreContent.slug]: keyValueStoreContent,
  [loggingSystemContent.slug]: loggingSystemContent,
  [metricsCollectionContent.slug]: metricsCollectionContent,
  [monitoringSystemContent.slug]: monitoringSystemContent,
  [apiGatewayContent.slug]: apiGatewayContent,
  [notificationServiceContent.slug]: notificationServiceContent,
  [pastebinContent.slug]: pastebinContent,
  // Common Interview Questions
  [twitterContent.slug]: twitterContent,
  [instagramContent.slug]: instagramContent,
  [facebookFeedContent.slug]: facebookFeedContent,
  [linkedinFeedContent.slug]: linkedinFeedContent,
  [redditContent.slug]: redditContent,
  [tiktokContent.slug]: tiktokContent,
  [whatsappContent.slug]: whatsappContent,
  [slackContent.slug]: slackContent,
  [discordContent.slug]: discordContent,
  [dropboxContent.slug]: dropboxContent,
  [googleDriveContent.slug]: googleDriveContent,
  [youtubeContent.slug]: youtubeContent,
  [netflixContent.slug]: netflixContent,
  [uberContent.slug]: uberContent,
  [amazonContent.slug]: amazonContent,
  [paymentGatewayContent.slug]: paymentGatewayContent,
  [shoppingCartContent.slug]: shoppingCartContent,
  [googleCalendarContent.slug]: googleCalendarContent,
  [autocompleteContent.slug]: autocompleteContent,
  [googleSearchContent.slug]: googleSearchContent,
};
