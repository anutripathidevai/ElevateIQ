/**
 * Assembles the authored LLD content into the two lookup maps the content-api
 * consumes. Adding a published problem/concept = author a content file and add
 * one line here; the registry entry flips to `status: "published"` and the
 * dynamic route picks it up automatically.
 *
 * Prose fields are Markdown; `code` / `implementation[].content` / mermaid
 * strings hold Java or diagram source and are exempt from the content test's
 * template-literal-safe prose checks.
 */
import type { LLDConceptContent, LLDProblemContent } from "../types";

// ── Problems ────────────────────────────────────────────────────────────────
import { parkingLot } from "./parking-lot";
import { vendingMachine } from "./vending-machine";
import { coffeeMachine } from "./coffee-machine";
import { atm } from "./atm";
import { ticTacToe } from "./tic-tac-toe";
import { snakeAndLadder } from "./snake-and-ladder";
import { elevatorSystem } from "./elevator-system";
import { lruCache } from "./lru-cache";
import { libraryManagement } from "./library-management";
import { splitwise } from "./splitwise";
import { loggingFramework } from "./logging-framework";
import { rateLimiter } from "./rate-limiter";
import { chess } from "./chess";
import { urlShortener } from "./url-shortener";
import { movieBooking } from "./movie-booking";
import { hotelManagement } from "./hotel-management";
import { shoppingCart } from "./shopping-cart";
import { digitalWallet } from "./digital-wallet";
import { inventoryManagement } from "./inventory-management";
import { minesweeper } from "./minesweeper";
import { ludo } from "./ludo";
import { notificationSystem } from "./notification-system";
import { lfuCache } from "./lfu-cache";
import { taskScheduler } from "./task-scheduler";
import { messageQueue } from "./message-queue";
import { fileSystem } from "./file-system";
import { linuxFind } from "./linux-find";
import { textEditor } from "./text-editor";
import { airlineReservation } from "./airline-reservation";
import { foodDelivery } from "./food-delivery";
import { cabBooking } from "./cab-booking";
import { featureFlagService } from "./feature-flag-service";
import { authenticationService } from "./authentication-service";
import { rbacSystem } from "./rbac-system";
import { paymentGateway } from "./payment-gateway";
import { bankingSystem } from "./banking-system";
import { whatsapp } from "./whatsapp";
import { slack } from "./slack";
import { googleDocs } from "./google-docs";
import { trello } from "./trello";
import { jira } from "./jira";
import { dropbox } from "./dropbox";
import { googleDrive } from "./google-drive";
import { apiGateway } from "./api-gateway";
import { aiChatPlatform } from "./ai-chat-platform";
import { ragPipeline } from "./rag-pipeline";

// ── Concepts ────────────────────────────────────────────────────────────────
import { oopFundamentals } from "./oop-fundamentals";
import { solidPrinciples } from "./solid-principles";
import { designPrinciples } from "./design-principles";
import { umlDiagrams } from "./uml-diagrams";
import { creationalPatterns } from "./creational-patterns";
import { structuralPatterns } from "./structural-patterns";
import { behavioralPatterns } from "./behavioral-patterns";
import { concurrencyAndMultithreading } from "./concurrency-and-multithreading";
import { javaCollectionsForLld } from "./java-collections-for-lld";
import { lldBestPractices } from "./lld-best-practices";

/** Full design-problem content, keyed by catalog slug. */
export const LLD_PROBLEM_CONTENT: Record<string, LLDProblemContent> = {
  [parkingLot.slug]: parkingLot,
  [vendingMachine.slug]: vendingMachine,
  [coffeeMachine.slug]: coffeeMachine,
  [atm.slug]: atm,
  [ticTacToe.slug]: ticTacToe,
  [snakeAndLadder.slug]: snakeAndLadder,
  [elevatorSystem.slug]: elevatorSystem,
  [lruCache.slug]: lruCache,
  [libraryManagement.slug]: libraryManagement,
  [splitwise.slug]: splitwise,
  [loggingFramework.slug]: loggingFramework,
  [rateLimiter.slug]: rateLimiter,
  [chess.slug]: chess,
  [urlShortener.slug]: urlShortener,
  [movieBooking.slug]: movieBooking,
  [hotelManagement.slug]: hotelManagement,
  [shoppingCart.slug]: shoppingCart,
  [digitalWallet.slug]: digitalWallet,
  [inventoryManagement.slug]: inventoryManagement,
  [minesweeper.slug]: minesweeper,
  [ludo.slug]: ludo,
  [notificationSystem.slug]: notificationSystem,
  [lfuCache.slug]: lfuCache,
  [taskScheduler.slug]: taskScheduler,
  [messageQueue.slug]: messageQueue,
  [fileSystem.slug]: fileSystem,
  [linuxFind.slug]: linuxFind,
  [textEditor.slug]: textEditor,
  [airlineReservation.slug]: airlineReservation,
  [foodDelivery.slug]: foodDelivery,
  [cabBooking.slug]: cabBooking,
  [featureFlagService.slug]: featureFlagService,
  [authenticationService.slug]: authenticationService,
  [rbacSystem.slug]: rbacSystem,
  [paymentGateway.slug]: paymentGateway,
  [bankingSystem.slug]: bankingSystem,
  [whatsapp.slug]: whatsapp,
  [slack.slug]: slack,
  [googleDocs.slug]: googleDocs,
  [trello.slug]: trello,
  [jira.slug]: jira,
  [dropbox.slug]: dropbox,
  [googleDrive.slug]: googleDrive,
  [apiGateway.slug]: apiGateway,
  [aiChatPlatform.slug]: aiChatPlatform,
  [ragPipeline.slug]: ragPipeline,
};

/** Theory-concept content, keyed by catalog slug. */
export const LLD_CONCEPT_CONTENT: Record<string, LLDConceptContent> = {
  [oopFundamentals.slug]: oopFundamentals,
  [solidPrinciples.slug]: solidPrinciples,
  [designPrinciples.slug]: designPrinciples,
  [umlDiagrams.slug]: umlDiagrams,
  [creationalPatterns.slug]: creationalPatterns,
  [structuralPatterns.slug]: structuralPatterns,
  [behavioralPatterns.slug]: behavioralPatterns,
  [concurrencyAndMultithreading.slug]: concurrencyAndMultithreading,
  [javaCollectionsForLld.slug]: javaCollectionsForLld,
  [lldBestPractices.slug]: lldBestPractices,
};
