import type { LldEntry } from "./entry-types";

export const ENTRIES: LldEntry[] = [
  {
    slug: "design-snake-and-ladder",
    isNew: true,
    title: "Design Snake and Ladder",
    difficulty: "MEDIUM",
    tags: ["ood", "game-design", "simulation"],
    statementMD: `Model a playable Snake and Ladder game where players advance on a numbered board and jumps change their positions.
**Requirements**
- Support an N x N board, defaulting to a 100-cell layout.
- Store snakes and ladders as jumps from a start position to an end position.
- Roll a dice and move players in queue order.
- Apply at most one jump after a move and announce the destination.
- Detect the first player that reaches the final cell as the winner.
Focus on clear object boundaries, deterministic turn flow, and simple extension points for dice behavior.`,
    constraints: "Assume positions are one-based, jumps never start on the first or final cell, and a move beyond the final cell keeps the player in place.",
    hints: [
      "Represent snakes and ladders with one Jump class.",
      "Keep players in a queue for turn order.",
      "Inject Dice so tests can control rolls."
    ],
    referenceSolution: `**Core classes:** Jump stores start and end, Board owns the cell count and jump map, Dice rolls values, Player tracks name and position, and Game owns the queue plus winner loop. **Design notes:** the board validates jump placement, the game applies only the board rules after a dice roll, and dice behavior stays swappable through an interface.`,
    solution: {
      approachMD: `- Treat the board as a numbered track from 1 to size times size and keep jumps in a map keyed by start cell.
- The game loop polls the next player, rolls the dice, asks the board for the resolved position, and either declares a winner or pushes the player back.
- Dice is an interface so a random dice can be used in production while fixed dice can drive tests or demos.
- Player remains small and mutable because position is part of the game state, not board state.`,
      steps: [
        {
          title: "Model jumps and board rules",
          detailMD: `Create one Jump type for snakes and ladders, then let Board validate jump positions and resolve the destination after a dice roll. The board should not know whose turn it is.`,
          code: {
            filename: "BoardJumpRules.java",
            language: "java",
            content: `import java.util.Map;

public class BoardJumpRules {
    public int resolve(int current, int roll, int finalCell, Map<Integer, Jump> jumps) {
        int target = current + roll;
        if (target > finalCell) {
            return current;
        }
        Jump jump = jumps.get(target);
        return jump == null ? target : jump.getEnd();
    }
}`
          }
        },
        {
          title: "Add dice as a strategy",
          detailMD: `Keep dice behavior behind a Dice interface. Production can use random rolls, while examples and tests can provide predictable rolls without touching Game.`
        },
        {
          title: "Keep player state minimal",
          detailMD: `A Player only needs a display name and current position. This keeps movement rules in Game and Board instead of scattering them across player objects.`
        },
        {
          title: "Drive turns from a queue",
          detailMD: `Poll the next player, roll, move, check for a winner, and append the player back only if the game continues. This makes turn order explicit and fair.`,
          code: {
            filename: "TurnLoopSnippet.java",
            language: "java",
            content: `import java.util.Queue;

public class TurnLoopSnippet {
    public Player playOneTurn(Queue<Player> players, Board board, Dice dice) {
        Player player = players.poll();
        int roll = dice.roll();
        int nextPosition = board.move(player.getPosition(), roll);
        player.setPosition(nextPosition);
        if (nextPosition == board.getFinalCell()) {
            return player;
        }
        players.offer(player);
        return null;
    }
}`
          }
        },
        {
          title: "Validate setup and stop cleanly",
          detailMD: `Reject jumps outside the board, duplicate jump starts, and jumps that begin on terminal cells. The loop should stop immediately when one player reaches the final cell.`
        }
      ],
      patterns: [
        {
          name: "Strategy",
          why: "Dice is injected through an interface, making randomness replaceable for tests, demos, or special dice rules."
        },
        {
          name: "Encapsulation",
          why: "Board owns jump validation and movement boundaries, while Game owns turns and winner detection."
        },
        {
          name: "Queue-based simulation",
          why: "A queue mirrors real turn order and avoids manual index bookkeeping when players cycle."
        }
      ],
      code: [
        {
          filename: "Jump.java",
          language: "java",
          content: `public final class Jump {
    private final int start;
    private final int end;

    public Jump(int start, int end) {
        if (start <= 0 || end <= 0) {
            throw new IllegalArgumentException("Positions must be positive");
        }
        if (start == end) {
            throw new IllegalArgumentException("A jump must change the position");
        }
        this.start = start;
        this.end = end;
    }

    public int getStart() {
        return start;
    }

    public int getEnd() {
        return end;
    }

    public boolean isSnake() {
        return end < start;
    }

    public boolean isLadder() {
        return end > start;
    }

    public String describe() {
        String type = isSnake() ? "snake" : "ladder";
        return type + " from " + start + " to " + end;
    }
}`
        },
        {
          filename: "Board.java",
          language: "java",
          content: `import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

public class Board {
    private final int dimension;
    private final Map<Integer, Jump> jumps = new HashMap<Integer, Jump>();

    public Board() {
        this(10);
    }

    public Board(int dimension) {
        if (dimension < 2) {
            throw new IllegalArgumentException("Board dimension must be at least two");
        }
        this.dimension = dimension;
    }

    public int getFinalCell() {
        return dimension * dimension;
    }

    public void addJump(Jump jump) {
        int start = jump.getStart();
        int end = jump.getEnd();
        if (start <= 1 || start >= getFinalCell()) {
            throw new IllegalArgumentException("Jump cannot start on the first or final cell");
        }
        if (end < 1 || end > getFinalCell()) {
            throw new IllegalArgumentException("Jump end is outside the board");
        }
        if (jumps.containsKey(start)) {
            throw new IllegalArgumentException("Only one jump may start from a cell");
        }
        jumps.put(start, jump);
    }

    public Jump getJumpAt(int position) {
        return jumps.get(position);
    }

    public int targetAfterRoll(int currentPosition, int roll) {
        if (roll <= 0) {
            throw new IllegalArgumentException("Roll must be positive");
        }
        int target = currentPosition + roll;
        return target > getFinalCell() ? currentPosition : target;
    }

    public int move(int currentPosition, int roll) {
        int target = targetAfterRoll(currentPosition, roll);
        Jump jump = jumps.get(target);
        return jump == null ? target : jump.getEnd();
    }

    public Map<Integer, Jump> jumpsView() {
        return Collections.unmodifiableMap(jumps);
    }
}`
        },
        {
          filename: "Dice.java",
          language: "java",
          content: `public interface Dice {
    int roll();
}`
        },
        {
          filename: "RandomDice.java",
          language: "java",
          content: `import java.util.Random;

public class RandomDice implements Dice {
    private final int sides;
    private final Random random;

    public RandomDice() {
        this(6, new Random());
    }

    public RandomDice(int sides, Random random) {
        if (sides < 2) {
            throw new IllegalArgumentException("Dice must have at least two sides");
        }
        this.sides = sides;
        this.random = random;
    }

    public int roll() {
        return random.nextInt(sides) + 1;
    }
}`
        },
        {
          filename: "Player.java",
          language: "java",
          content: `public class Player {
    private final String name;
    private int position;

    public Player(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Player name is required");
        }
        this.name = name;
        this.position = 1;
    }

    public String getName() {
        return name;
    }

    public int getPosition() {
        return position;
    }

    public void setPosition(int position) {
        if (position <= 0) {
            throw new IllegalArgumentException("Position must be positive");
        }
        this.position = position;
    }
}`
        },
        {
          filename: "Game.java",
          language: "java",
          content: `import java.util.LinkedList;
import java.util.List;
import java.util.Queue;

public class Game {
    private final Board board;
    private final Dice dice;
    private final Queue<Player> players = new LinkedList<Player>();
    private Player winner;

    public Game(Board board, Dice dice, List<Player> players) {
        if (players == null || players.isEmpty()) {
            throw new IllegalArgumentException("At least one player is required");
        }
        this.board = board;
        this.dice = dice;
        this.players.addAll(players);
    }

    public Player start() {
        while (winner == null) {
            playTurn();
        }
        return winner;
    }

    public void playTurn() {
        Player player = players.poll();
        int before = player.getPosition();
        int roll = dice.roll();
        int target = board.targetAfterRoll(before, roll);
        Jump jump = board.getJumpAt(target);
        int after = jump == null ? target : jump.getEnd();

        player.setPosition(after);
        announce(player, roll, before, target, jump, after);

        if (after == board.getFinalCell()) {
            winner = player;
            System.out.println(player.getName() + " wins");
        } else {
            players.offer(player);
        }
    }

    public Player getWinner() {
        return winner;
    }

    private void announce(Player player, int roll, int before, int target, Jump jump, int after) {
        System.out.println(player.getName() + " rolled " + roll + " from " + before + " to " + target);
        if (jump != null) {
            System.out.println("Applied " + jump.describe() + ", final position " + after);
        }
    }
}`
        }
      ]
    }
  },
  {
    slug: "design-coffee-machine",
    isNew: true,
    title: "Design a Coffee Vending Machine",
    difficulty: "MEDIUM",
    tags: ["ood", "factory", "builder", "concurrency"],
    statementMD: `Design a coffee vending machine that can prepare recipe-based drinks while sharing ingredients across multiple outlets.
**Requirements**
- Support beverages such as espresso, latte, and cappuccino.
- Define every beverage through ingredient quantities.
- Check and decrement water, milk, coffee, and sugar from a shared inventory.
- Allow multiple outlets to prepare beverages concurrently up to machine capacity.
- Report insufficient ingredients and allow refilling inventory.
Focus on atomic inventory updates, simple beverage creation, and safe concurrent preparation.`,
    constraints: "Assume ingredient units are integer milliliters or grams, each preparation is atomic with respect to inventory, and outlet count only limits concurrent preparation.",
    hints: [
      "Use an enum for ingredient names.",
      "Synchronize inventory check and decrement together.",
      "Use a factory to centralize recipes."
    ],
    referenceSolution: `**Core classes:** Ingredient enumerates stock types, IngredientInventory synchronizes refill and consume, Recipe stores required quantities, Beverage names a recipe, BeverageFactory creates drinks, and CoffeeMachine coordinates outlets. **Design notes:** inventory consumption is a single critical section, a semaphore models outlet capacity, and recipes are built once through a small builder API.`,
    solution: {
      approachMD: `- Keep recipes immutable so every beverage request reads a stable list of required ingredients.
- Put all stock checks and deductions in one synchronized inventory method to prevent two outlets from spending the same ingredient units.
- Use a factory to translate a beverage name into a Beverage and a builder to make recipes readable.
- CoffeeMachine limits concurrent preparation with outlets but delegates correctness of stock mutation to IngredientInventory.`,
      steps: [
        {
          title: "Represent ingredients and recipes",
          detailMD: `Use Ingredient as the common vocabulary for recipes and inventory. A builder keeps recipe construction clear and prevents callers from mutating finished recipes.`,
          code: {
            filename: "RecipeBuilderExample.java",
            language: "java",
            content: `public class RecipeBuilderExample {
    public Recipe latte() {
        return Recipe.builder()
                .add(Ingredient.WATER, 120)
                .add(Ingredient.MILK, 80)
                .add(Ingredient.COFFEE, 18)
                .add(Ingredient.SUGAR, 5)
                .build();
    }
}`
          }
        },
        {
          title: "Centralize beverage creation",
          detailMD: `BeverageFactory should own supported drink names and recipe quantities. Adding a new drink then changes one place instead of the machine workflow.`
        },
        {
          title: "Make inventory operations atomic",
          detailMD: `Check every required ingredient before decrementing any of them, and keep that entire operation synchronized. This avoids partial consumption under concurrency.`,
          code: {
            filename: "InventoryConsumeSnippet.java",
            language: "java",
            content: `public class InventoryConsumeSnippet {
    public synchronized void consumeSafely(IngredientInventory inventory, Recipe recipe) {
        inventory.consume(recipe.getIngredients());
    }
}`
          }
        },
        {
          title: "Limit concurrent outlets",
          detailMD: `A semaphore represents available outlets. Preparing a drink acquires one permit, consumes ingredients, brews, and always releases the permit in a finally block.`,
          code: {
            filename: "ConcurrentPrepareSnippet.java",
            language: "java",
            content: `public class ConcurrentPrepareSnippet {
    public Beverage prepare(CoffeeMachine machine, String name) throws InterruptedException {
        return machine.prepare(name);
    }
}`
          }
        },
        {
          title: "Surface stock failures clearly",
          detailMD: `Throw an insufficient ingredient exception with the missing ingredient and required amount. Callers can catch it to show an outlet error without stopping the machine.`
        }
      ],
      patterns: [
        {
          name: "Factory",
          why: "BeverageFactory maps names to Beverage objects and keeps recipe selection away from outlet orchestration."
        },
        {
          name: "Builder",
          why: "Recipe.Builder creates readable immutable recipes without exposing internal maps to callers."
        },
        {
          name: "Monitor and semaphore",
          why: "Synchronized inventory methods protect stock, while a semaphore models limited outlet capacity."
        }
      ],
      code: [
        {
          filename: "Ingredient.java",
          language: "java",
          content: `public enum Ingredient {
    WATER,
    MILK,
    COFFEE,
    SUGAR
}`
        },
        {
          filename: "InsufficientIngredientException.java",
          language: "java",
          content: `public class InsufficientIngredientException extends RuntimeException {
    private final Ingredient ingredient;
    private final int required;
    private final int available;

    public InsufficientIngredientException(Ingredient ingredient, int required, int available) {
        super("Insufficient " + ingredient + ": required " + required + ", available " + available);
        this.ingredient = ingredient;
        this.required = required;
        this.available = available;
    }

    public Ingredient getIngredient() {
        return ingredient;
    }

    public int getRequired() {
        return required;
    }

    public int getAvailable() {
        return available;
    }
}`
        },
        {
          filename: "Recipe.java",
          language: "java",
          content: `import java.util.Collections;
import java.util.EnumMap;
import java.util.Map;

public final class Recipe {
    private final Map<Ingredient, Integer> ingredients;

    private Recipe(Map<Ingredient, Integer> ingredients) {
        this.ingredients = Collections.unmodifiableMap(new EnumMap<Ingredient, Integer>(ingredients));
    }

    public Map<Ingredient, Integer> getIngredients() {
        return ingredients;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private final Map<Ingredient, Integer> ingredients = new EnumMap<Ingredient, Integer>(Ingredient.class);

        public Builder add(Ingredient ingredient, int quantity) {
            if (quantity <= 0) {
                throw new IllegalArgumentException("Quantity must be positive");
            }
            Integer existing = ingredients.get(ingredient);
            int next = existing == null ? quantity : existing + quantity;
            ingredients.put(ingredient, next);
            return this;
        }

        public Recipe build() {
            if (ingredients.isEmpty()) {
                throw new IllegalStateException("Recipe must contain at least one ingredient");
            }
            return new Recipe(ingredients);
        }
    }
}`
        },
        {
          filename: "Beverage.java",
          language: "java",
          content: `public final class Beverage {
    private final String name;
    private final Recipe recipe;

    public Beverage(String name, Recipe recipe) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Beverage name is required");
        }
        this.name = name;
        this.recipe = recipe;
    }

    public String getName() {
        return name;
    }

    public Recipe getRecipe() {
        return recipe;
    }

    public String toString() {
        return name;
    }
}`
        },
        {
          filename: "BeverageFactory.java",
          language: "java",
          content: `import java.util.Locale;

public class BeverageFactory {
    public Beverage create(String beverageName) {
        if (beverageName == null) {
            throw new IllegalArgumentException("Beverage name is required");
        }
        String key = beverageName.trim().toLowerCase(Locale.ROOT);
        if ("espresso".equals(key)) {
            return new Beverage("Espresso", espressoRecipe());
        }
        if ("latte".equals(key)) {
            return new Beverage("Latte", latteRecipe());
        }
        if ("cappuccino".equals(key)) {
            return new Beverage("Cappuccino", cappuccinoRecipe());
        }
        throw new IllegalArgumentException("Unsupported beverage: " + beverageName);
    }

    private Recipe espressoRecipe() {
        return Recipe.builder()
                .add(Ingredient.WATER, 60)
                .add(Ingredient.COFFEE, 18)
                .build();
    }

    private Recipe latteRecipe() {
        return Recipe.builder()
                .add(Ingredient.WATER, 120)
                .add(Ingredient.MILK, 80)
                .add(Ingredient.COFFEE, 18)
                .add(Ingredient.SUGAR, 5)
                .build();
    }

    private Recipe cappuccinoRecipe() {
        return Recipe.builder()
                .add(Ingredient.WATER, 100)
                .add(Ingredient.MILK, 60)
                .add(Ingredient.COFFEE, 20)
                .add(Ingredient.SUGAR, 6)
                .build();
    }
}`
        },
        {
          filename: "IngredientInventory.java",
          language: "java",
          content: `import java.util.Collections;
import java.util.EnumMap;
import java.util.Map;

public class IngredientInventory {
    private final Map<Ingredient, Integer> stock = new EnumMap<Ingredient, Integer>(Ingredient.class);

    public IngredientInventory() {
        for (Ingredient ingredient : Ingredient.values()) {
            stock.put(ingredient, 0);
        }
    }

    public synchronized void refill(Ingredient ingredient, int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Refill quantity must be positive");
        }
        stock.put(ingredient, stock.get(ingredient) + quantity);
    }

    public synchronized void consume(Map<Ingredient, Integer> required) {
        for (Map.Entry<Ingredient, Integer> entry : required.entrySet()) {
            Ingredient ingredient = entry.getKey();
            int need = entry.getValue();
            int have = stock.get(ingredient);
            if (have < need) {
                throw new InsufficientIngredientException(ingredient, need, have);
            }
        }
        for (Map.Entry<Ingredient, Integer> entry : required.entrySet()) {
            Ingredient ingredient = entry.getKey();
            stock.put(ingredient, stock.get(ingredient) - entry.getValue());
        }
    }

    public synchronized int available(Ingredient ingredient) {
        return stock.get(ingredient);
    }

    public synchronized Map<Ingredient, Integer> snapshot() {
        return Collections.unmodifiableMap(new EnumMap<Ingredient, Integer>(stock));
    }
}`
        },
        {
          filename: "CoffeeMachine.java",
          language: "java",
          content: `import java.util.concurrent.Semaphore;

public class CoffeeMachine {
    private final IngredientInventory inventory;
    private final BeverageFactory beverageFactory;
    private final Semaphore outlets;

    public CoffeeMachine(int outletCount, IngredientInventory inventory, BeverageFactory beverageFactory) {
        if (outletCount <= 0) {
            throw new IllegalArgumentException("At least one outlet is required");
        }
        this.inventory = inventory;
        this.beverageFactory = beverageFactory;
        this.outlets = new Semaphore(outletCount);
    }

    public Beverage prepare(String beverageName) throws InterruptedException {
        outlets.acquire();
        try {
            Beverage beverage = beverageFactory.create(beverageName);
            inventory.consume(beverage.getRecipe().getIngredients());
            brew(beverage);
            return beverage;
        } finally {
            outlets.release();
        }
    }

    public void refill(Ingredient ingredient, int quantity) {
        inventory.refill(ingredient, quantity);
    }

    public int availableOutlets() {
        return outlets.availablePermits();
    }

    private void brew(Beverage beverage) {
        System.out.println("Prepared " + beverage.getName());
    }
}`
        }
      ]
    }
  },
  {
    slug: "design-atm",
    isNew: true,
    title: "Design an ATM",
    difficulty: "MEDIUM",
    tags: ["ood", "state-pattern", "chain-of-responsibility"],
    statementMD: `Design an ATM that manages a card session, authenticates the user, and performs cash and account operations.
**Requirements**
- Transition through idle, card inserted, authenticated, selected operation, and transaction execution states.
- Validate the card PIN through a bank or account service.
- Withdraw cash only when the account balance and ATM denominations can satisfy the amount.
- Deposit money into the selected account.
- Eject the card and return to idle from any active session.
Focus on state-specific behavior, safe account updates, and a clear cash dispensing chain.`,
    constraints: "Assume one card session at a time, positive whole-number amounts, and dispenser denominations of 2000, 500, and 100.",
    hints: [
      "Let each state reject invalid actions.",
      "Check dispenser capacity before debiting.",
      "Chain note handlers from high to low value."
    ],
    referenceSolution: `**Core classes:** ATMState defines allowed actions, IdleState, HasCardState, AuthenticatedState, and TransactionState model lifecycle, ATM holds context, Card and Account represent bank data, BankService checks balance and debit, and CashDispenser uses DispenseChain handlers. **Design notes:** State removes conditional action checks from ATM, and Chain of Responsibility lets each denomination decide how many notes to release.`,
    solution: {
      approachMD: `- Keep ATM as the context object and push action rules into ATMState implementations so invalid actions fail where they occur.
- Authenticate through BankService, then store the active account only for the current card session.
- Before withdrawal, ask the dispenser if its denomination chain can serve the amount, then debit the account and dispense notes.
- Model each denomination as a handler that takes as many notes as it can and passes the remainder to the next handler.`,
      steps: [
        {
          title: "Define state-driven actions",
          detailMD: `ATMState lists user actions such as insert card, enter PIN, select operation, withdraw, deposit, and eject. Concrete states override only the actions they allow.`,
          code: {
            filename: "StateTransitionSnippet.java",
            language: "java",
            content: `public class StateTransitionSnippet {
    public void authenticate(ATM atm, String pin) {
        atm.enterPin(pin);
        atm.selectOperation("WITHDRAW");
    }
}`
          }
        },
        {
          title: "Use the ATM as context",
          detailMD: `ATM stores the current state, card, account, bank service, and dispenser. Public methods simply delegate to the current state.`
        },
        {
          title: "Separate bank operations",
          detailMD: `BankService validates PINs and performs synchronized account debit or credit. This keeps account rules separate from kiosk flow.`
        },
        {
          title: "Build the cash dispenser chain",
          detailMD: `Link note dispensers from largest to smallest denomination. Each handler uses available note count, reduces the remaining amount, and passes the rest onward.`,
          code: {
            filename: "DispenseChainSnippet.java",
            language: "java",
            content: `public class DispenseChainSnippet {
    public CashDispenser createDispenser() {
        return new CashDispenser(10, 20, 50);
    }
}`
          }
        },
        {
          title: "Perform withdrawal safely",
          detailMD: `Check dispenser capacity first, then debit the bank account, and only then dispense notes. If any check fails, leave cash inventory and account balance unchanged.`,
          code: {
            filename: "WithdrawalFlowSnippet.java",
            language: "java",
            content: `public class WithdrawalFlowSnippet {
    public void withdraw(ATM atm, int amount) {
        atm.selectOperation("WITHDRAW");
        atm.withdraw(amount);
    }
}`
          }
        }
      ],
      patterns: [
        {
          name: "State",
          why: "ATM behavior changes by lifecycle stage without large conditional blocks in the context class."
        },
        {
          name: "Chain of Responsibility",
          why: "Each note dispenser handles its denomination and delegates the remaining amount to the next handler."
        },
        {
          name: "Service boundary",
          why: "BankService isolates account validation and mutation from ATM hardware flow."
        }
      ],
      code: [
        {
          filename: "ATMState.java",
          language: "java",
          content: `public interface ATMState {
    default void insertCard(ATM atm, Card card) {
        throw new IllegalStateException("Cannot insert a card now");
    }

    default void enterPin(ATM atm, String pin) {
        throw new IllegalStateException("Cannot enter PIN now");
    }

    default void selectOperation(ATM atm, String operation) {
        throw new IllegalStateException("Cannot select an operation now");
    }

    default void withdraw(ATM atm, int amount) {
        throw new IllegalStateException("Cannot withdraw now");
    }

    default void deposit(ATM atm, int amount) {
        throw new IllegalStateException("Cannot deposit now");
    }

    default void ejectCard(ATM atm) {
        atm.clearSession();
        atm.setState(new IdleState());
    }

    String name();
}`
        },
        {
          filename: "IdleState.java",
          language: "java",
          content: `public class IdleState implements ATMState {
    public void insertCard(ATM atm, Card card) {
        if (card == null) {
            throw new IllegalArgumentException("Card is required");
        }
        atm.setCurrentCard(card);
        atm.setState(new HasCardState());
        System.out.println("Card inserted");
    }

    public void ejectCard(ATM atm) {
        System.out.println("No card to eject");
    }

    public String name() {
        return "IDLE";
    }
}`
        },
        {
          filename: "HasCardState.java",
          language: "java",
          content: `public class HasCardState implements ATMState {
    public void enterPin(ATM atm, String pin) {
        Card card = atm.getCurrentCard();
        BankService bankService = atm.getBankService();
        if (!bankService.validatePin(card, pin)) {
            System.out.println("Invalid PIN");
            atm.clearSession();
            atm.setState(new IdleState());
            return;
        }
        Account account = bankService.getAccount(card.getAccountId());
        atm.setCurrentAccount(account);
        atm.setState(new AuthenticatedState());
        System.out.println("Authenticated");
    }

    public String name() {
        return "HAS_CARD";
    }
}`
        },
        {
          filename: "AuthenticatedState.java",
          language: "java",
          content: `public class AuthenticatedState implements ATMState {
    public void selectOperation(ATM atm, String operation) {
        atm.setState(new TransactionState(operation));
        System.out.println("Selected " + operation);
    }

    public void ejectCard(ATM atm) {
        atm.clearSession();
        atm.setState(new IdleState());
        System.out.println("Card ejected");
    }

    public String name() {
        return "AUTHENTICATED";
    }
}`
        },
        {
          filename: "TransactionState.java",
          language: "java",
          content: `public class TransactionState implements ATMState {
    private final String operation;

    public TransactionState(String operation) {
        if (operation == null || operation.trim().isEmpty()) {
            throw new IllegalArgumentException("Operation is required");
        }
        this.operation = operation.trim().toUpperCase();
    }

    public void withdraw(ATM atm, int amount) {
        if (!"WITHDRAW".equals(operation)) {
            throw new IllegalStateException("Selected operation is not withdraw");
        }
        atm.performWithdrawal(amount);
        atm.setState(new AuthenticatedState());
    }

    public void deposit(ATM atm, int amount) {
        if (!"DEPOSIT".equals(operation)) {
            throw new IllegalStateException("Selected operation is not deposit");
        }
        atm.performDeposit(amount);
        atm.setState(new AuthenticatedState());
    }

    public void selectOperation(ATM atm, String nextOperation) {
        atm.setState(new TransactionState(nextOperation));
    }

    public String name() {
        return "TRANSACTION_" + operation;
    }
}`
        },
        {
          filename: "ATM.java",
          language: "java",
          content: `public class ATM {
    private ATMState state = new IdleState();
    private final BankService bankService;
    private final CashDispenser cashDispenser;
    private Card currentCard;
    private Account currentAccount;

    public ATM(BankService bankService, CashDispenser cashDispenser) {
        this.bankService = bankService;
        this.cashDispenser = cashDispenser;
    }

    public void insertCard(Card card) {
        state.insertCard(this, card);
    }

    public void enterPin(String pin) {
        state.enterPin(this, pin);
    }

    public void selectOperation(String operation) {
        state.selectOperation(this, operation);
    }

    public void withdraw(int amount) {
        state.withdraw(this, amount);
    }

    public void deposit(int amount) {
        state.deposit(this, amount);
    }

    public void ejectCard() {
        state.ejectCard(this);
    }

    void performWithdrawal(int amount) {
        requirePositive(amount);
        if (!cashDispenser.canDispense(amount)) {
            throw new IllegalStateException("ATM cannot dispense requested amount");
        }
        bankService.debit(currentAccount.getId(), amount);
        cashDispenser.dispense(amount);
        System.out.println("Dispensed " + amount);
    }

    void performDeposit(int amount) {
        requirePositive(amount);
        bankService.credit(currentAccount.getId(), amount);
        System.out.println("Deposited " + amount);
    }

    void clearSession() {
        currentCard = null;
        currentAccount = null;
    }

    private void requirePositive(int amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }
    }

    public ATMState getState() {
        return state;
    }

    void setState(ATMState state) {
        this.state = state;
    }

    Card getCurrentCard() {
        return currentCard;
    }

    void setCurrentCard(Card currentCard) {
        this.currentCard = currentCard;
    }

    void setCurrentAccount(Account currentAccount) {
        this.currentAccount = currentAccount;
    }

    BankService getBankService() {
        return bankService;
    }
}`
        },
        {
          filename: "Card.java",
          language: "java",
          content: `public final class Card {
    private final String cardNumber;
    private final String accountId;

    public Card(String cardNumber, String accountId) {
        if (cardNumber == null || accountId == null) {
            throw new IllegalArgumentException("Card number and account id are required");
        }
        this.cardNumber = cardNumber;
        this.accountId = accountId;
    }

    public String getCardNumber() {
        return cardNumber;
    }

    public String getAccountId() {
        return accountId;
    }
}`
        },
        {
          filename: "Account.java",
          language: "java",
          content: `public class Account {
    private final String id;
    private final String pin;
    private int balance;

    public Account(String id, String pin, int openingBalance) {
        if (openingBalance < 0) {
            throw new IllegalArgumentException("Opening balance cannot be negative");
        }
        this.id = id;
        this.pin = pin;
        this.balance = openingBalance;
    }

    public String getId() {
        return id;
    }

    public synchronized boolean hasPin(String candidate) {
        return pin.equals(candidate);
    }

    public synchronized int getBalance() {
        return balance;
    }

    public synchronized void debit(int amount) {
        if (amount > balance) {
            throw new IllegalStateException("Insufficient account balance");
        }
        balance -= amount;
    }

    public synchronized void credit(int amount) {
        balance += amount;
    }
}`
        },
        {
          filename: "BankService.java",
          language: "java",
          content: `import java.util.HashMap;
import java.util.Map;

public class BankService {
    private final Map<String, Account> accounts = new HashMap<String, Account>();

    public synchronized void register(Account account) {
        accounts.put(account.getId(), account);
    }

    public synchronized Account getAccount(String accountId) {
        Account account = accounts.get(accountId);
        if (account == null) {
            throw new IllegalArgumentException("Account not found: " + accountId);
        }
        return account;
    }

    public boolean validatePin(Card card, String pin) {
        return getAccount(card.getAccountId()).hasPin(pin);
    }

    public void debit(String accountId, int amount) {
        getAccount(accountId).debit(amount);
    }

    public void credit(String accountId, int amount) {
        getAccount(accountId).credit(amount);
    }

    public int getBalance(String accountId) {
        return getAccount(accountId).getBalance();
    }
}`
        },
        {
          filename: "DispenseChain.java",
          language: "java",
          content: `public interface DispenseChain {
    void setNext(DispenseChain next);

    boolean canDispense(int amount);

    void dispense(int amount);
}`
        },
        {
          filename: "NoteDispenser.java",
          language: "java",
          content: `public class NoteDispenser implements DispenseChain {
    private final int denomination;
    private int noteCount;
    private DispenseChain next;

    public NoteDispenser(int denomination, int noteCount) {
        this.denomination = denomination;
        this.noteCount = noteCount;
    }

    public void setNext(DispenseChain next) {
        this.next = next;
    }

    public synchronized boolean canDispense(int amount) {
        int usableNotes = Math.min(amount / denomination, noteCount);
        int remaining = amount - usableNotes * denomination;
        if (remaining == 0) {
            return true;
        }
        return next != null && next.canDispense(remaining);
    }

    public synchronized void dispense(int amount) {
        int notes = Math.min(amount / denomination, noteCount);
        int value = notes * denomination;
        if (notes > 0) {
            noteCount -= notes;
            System.out.println("Dispense " + notes + " notes of " + denomination);
        }
        int remaining = amount - value;
        if (remaining == 0) {
            return;
        }
        if (next == null) {
            throw new IllegalStateException("Cannot dispense remaining amount " + remaining);
        }
        next.dispense(remaining);
    }
}`
        },
        {
          filename: "CashDispenser.java",
          language: "java",
          content: `public class CashDispenser {
    private final DispenseChain head;

    public CashDispenser(int notesOf2000, int notesOf500, int notesOf100) {
        NoteDispenser twoThousand = new NoteDispenser(2000, notesOf2000);
        NoteDispenser fiveHundred = new NoteDispenser(500, notesOf500);
        NoteDispenser oneHundred = new NoteDispenser(100, notesOf100);
        twoThousand.setNext(fiveHundred);
        fiveHundred.setNext(oneHundred);
        this.head = twoThousand;
    }

    public boolean canDispense(int amount) {
        if (amount <= 0 || amount % 100 != 0) {
            return false;
        }
        return head.canDispense(amount);
    }

    public void dispense(int amount) {
        if (!canDispense(amount)) {
            throw new IllegalStateException("Amount cannot be dispensed with available notes");
        }
        head.dispense(amount);
    }
}`
        }
      ]
    }
  }
];
