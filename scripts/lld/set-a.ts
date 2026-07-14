import type { LldEntry } from "./entry-types";

export const ENTRIES: LldEntry[] = [
  {
    slug: "design-parking-lot",
    solution: {
      approachMD: `Clarify ownership: ParkingLot owns Levels, each Level owns ParkingSpots, and a Vehicle receives a Ticket only after a concrete spot is reserved. Exiting uses the ticket to release the spot and calculate a fee.

Core entities are ParkingLot, Level, ParkingSpot, Vehicle, Ticket, and ParkingFeeStrategy. VehicleSize keeps fit rules explicit for motorcycles, cars, and buses.

Key choices: let each Level select free spots by size, make ParkingLot.park and ParkingLot.unpark synchronized so assignment is atomic, and hide pricing behind a Strategy. Factories keep demo and test object creation consistent.`,
      steps: [
        {
          title: "Model sizes and fit rules",
          detailMD: `Start with VehicleSize and keep compatibility checks inside ParkingSpot. This prevents controllers from knowing whether a motorcycle, car, or bus can use a given spot.`,
          code: {
            filename: "ParkingFitSnippet.java",
            language: "java",
            content: `enum VehicleSize {
    MOTORCYCLE,
    COMPACT,
    LARGE
}

class ParkingSpot {
    private final VehicleSize size;
    private Vehicle vehicle;

    boolean canFit(Vehicle candidate) {
        return vehicle == null && size.ordinal() >= candidate.getSize().ordinal();
    }
}`,
          },
        },
        {
          title: "Let levels own spot selection",
          detailMD: `A Level has the list of spots for one floor. It can scan for the first free spot that fits the vehicle and reserve it before returning to the lot.`,
          code: {
            filename: "LevelReserveSnippet.java",
            language: "java",
            content: `class Level {
    private final List<ParkingSpot> spots;

    Optional<ParkingSpot> reserve(Vehicle vehicle) {
        for (ParkingSpot spot : spots) {
            if (spot.canFit(vehicle)) {
                spot.park(vehicle);
                return Optional.of(spot);
            }
        }
        return Optional.empty();
    }
}`,
          },
        },
        {
          title: "Issue tickets at the lot boundary",
          detailMD: `ParkingLot tries levels in order and creates a Ticket only after a spot is assigned. Synchronizing park and unpark keeps the check and assignment from racing under concurrent requests.`,
        },
        {
          title: "Price exits with a strategy",
          detailMD: `The exit path should not encode hourly or daily pricing. ParkingFeeStrategy calculates the amount from the ticket and exit time, so a new pricing plan can be swapped in.`,
          code: {
            filename: "ParkingFeeSnippet.java",
            language: "java",
            content: `interface ParkingFeeStrategy {
    long calculateFee(Ticket ticket, Instant exitTime);
}

class HourlyFeeStrategy implements ParkingFeeStrategy {
    public long calculateFee(Ticket ticket, Instant exitTime) {
        long minutes = Duration.between(ticket.getEntryTime(), exitTime).toMinutes();
        long hours = Math.max(1, (minutes + 59) / 60);
        return hours * 500;
    }
}`,
          },
        },
        {
          title: "Release spots on exit",
          detailMD: `Unparking validates the ticket, removes it from active tickets, calculates the fee, and frees the associated ParkingSpot for the next vehicle.`,
        },
      ],
      patterns: [
        {
          name: "Strategy",
          why: "ParkingFeeStrategy isolates pricing from assignment and ticketing.",
        },
        {
          name: "Factory",
          why: "ParkingFactory centralizes creation of vehicles and spots for predictable setup.",
        },
      ],
      code: [
        {
          filename: "VehicleSize.java",
          language: "java",
          content: `public enum VehicleSize {
    MOTORCYCLE,
    COMPACT,
    LARGE;

    public boolean canHold(VehicleSize needed) {
        return ordinal() >= needed.ordinal();
    }
}`,
        },
        {
          filename: "Vehicle.java",
          language: "java",
          content: `public abstract class Vehicle {
    private final String plate;
    private final VehicleSize size;

    protected Vehicle(String plate, VehicleSize size) {
        if (plate == null || plate.trim().isEmpty()) {
            throw new IllegalArgumentException("plate is required");
        }
        this.plate = plate;
        this.size = size;
    }

    public String getPlate() {
        return plate;
    }

    public VehicleSize getSize() {
        return size;
    }

    public boolean fitsIn(VehicleSize spotSize) {
        return spotSize.canHold(size);
    }
}

class Motorcycle extends Vehicle {
    Motorcycle(String plate) {
        super(plate, VehicleSize.MOTORCYCLE);
    }
}

class Car extends Vehicle {
    Car(String plate) {
        super(plate, VehicleSize.COMPACT);
    }
}

class Bus extends Vehicle {
    Bus(String plate) {
        super(plate, VehicleSize.LARGE);
    }
}`,
        },
        {
          filename: "ParkingSpot.java",
          language: "java",
          content: `public class ParkingSpot {
    private final String id;
    private final int levelNumber;
    private final VehicleSize size;
    private Vehicle vehicle;

    public ParkingSpot(String id, int levelNumber, VehicleSize size) {
        this.id = id;
        this.levelNumber = levelNumber;
        this.size = size;
    }

    public boolean isFree() {
        return vehicle == null;
    }

    public boolean canFit(Vehicle candidate) {
        return isFree() && candidate.fitsIn(size);
    }

    public void park(Vehicle candidate) {
        if (!canFit(candidate)) {
            throw new IllegalStateException("spot unavailable " + id);
        }
        vehicle = candidate;
    }

    public Vehicle unpark() {
        if (vehicle == null) {
            throw new IllegalStateException("spot already empty");
        }
        Vehicle leaving = vehicle;
        vehicle = null;
        return leaving;
    }

    public String getId() {
        return id;
    }

    public int getLevelNumber() {
        return levelNumber;
    }

    public VehicleSize getSize() {
        return size;
    }
}`,
        },
        {
          filename: "Level.java",
          language: "java",
          content: `import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public class Level {
    private final int number;
    private final List<ParkingSpot> spots;

    public Level(int number, List<ParkingSpot> spots) {
        this.number = number;
        this.spots = new ArrayList<>(spots);
    }

    public Optional<ParkingSpot> reserveSpotFor(Vehicle vehicle) {
        for (ParkingSpot spot : spots) {
            if (spot.canFit(vehicle)) {
                spot.park(vehicle);
                return Optional.of(spot);
            }
        }
        return Optional.empty();
    }

    public Map<VehicleSize, Integer> freeSpotsBySize() {
        Map<VehicleSize, Integer> counts = new EnumMap<>(VehicleSize.class);
        for (VehicleSize size : VehicleSize.values()) {
            counts.put(size, 0);
        }
        for (ParkingSpot spot : spots) {
            if (spot.isFree()) {
                counts.put(spot.getSize(), counts.get(spot.getSize()) + 1);
            }
        }
        return counts;
    }

    public int getNumber() {
        return number;
    }
}`,
        },
        {
          filename: "Ticket.java",
          language: "java",
          content: `import java.time.Instant;
import java.util.UUID;

public class Ticket {
    private final String id;
    private final ParkingSpot spot;
    private final Vehicle vehicle;
    private final Instant entryTime;

    public Ticket(ParkingSpot spot, Vehicle vehicle, Instant entryTime) {
        this.id = UUID.randomUUID().toString();
        this.spot = spot;
        this.vehicle = vehicle;
        this.entryTime = entryTime;
    }

    public String getId() {
        return id;
    }

    public ParkingSpot getSpot() {
        return spot;
    }

    public Vehicle getVehicle() {
        return vehicle;
    }

    public Instant getEntryTime() {
        return entryTime;
    }
}`,
        },
        {
          filename: "ParkingFeeStrategy.java",
          language: "java",
          content: `import java.time.Duration;
import java.time.Instant;

public interface ParkingFeeStrategy {
    long calculateFee(Ticket ticket, Instant exitTime);
}

class HourlyFeeStrategy implements ParkingFeeStrategy {
    private final long centsPerHour;

    HourlyFeeStrategy(long centsPerHour) {
        this.centsPerHour = centsPerHour;
    }

    public long calculateFee(Ticket ticket, Instant exitTime) {
        long minutes = Duration.between(ticket.getEntryTime(), exitTime).toMinutes();
        long hours = Math.max(1, (minutes + 59) / 60);
        return hours * centsPerHour;
    }
}`,
        },
        {
          filename: "ParkingFactory.java",
          language: "java",
          content: `public final class ParkingFactory {
    private ParkingFactory() {
    }

    public static Vehicle vehicle(String type, String plate) {
        String normalized = type == null ? "" : type.trim().toLowerCase();
        if ("motorcycle".equals(normalized)) {
            return new Motorcycle(plate);
        }
        if ("car".equals(normalized)) {
            return new Car(plate);
        }
        if ("bus".equals(normalized)) {
            return new Bus(plate);
        }
        throw new IllegalArgumentException("unknown vehicle type " + type);
    }

    public static ParkingSpot spot(int level, int index, VehicleSize size) {
        return new ParkingSpot("L" + level + "-S" + index, level, size);
    }
}`,
        },
        {
          filename: "ParkingLot.java",
          language: "java",
          content: `import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public class ParkingLot {
    private final List<Level> levels;
    private final ParkingFeeStrategy feeStrategy;
    private final Map<String, Ticket> activeTickets = new HashMap<>();

    public ParkingLot(List<Level> levels, ParkingFeeStrategy feeStrategy) {
        this.levels = new ArrayList<>(levels);
        this.feeStrategy = feeStrategy;
    }

    public synchronized Ticket park(Vehicle vehicle) {
        for (Level level : levels) {
            Optional<ParkingSpot> spot = level.reserveSpotFor(vehicle);
            if (spot.isPresent()) {
                Ticket ticket = new Ticket(spot.get(), vehicle, Instant.now());
                activeTickets.put(ticket.getId(), ticket);
                return ticket;
            }
        }
        throw new IllegalStateException("no spot available for " + vehicle.getSize());
    }

    public synchronized long unpark(String ticketId) {
        Ticket ticket = activeTickets.remove(ticketId);
        if (ticket == null) {
            throw new IllegalArgumentException("unknown ticket " + ticketId);
        }
        long fee = feeStrategy.calculateFee(ticket, Instant.now());
        ticket.getSpot().unpark();
        return fee;
    }

    public synchronized Map<Integer, Map<VehicleSize, Integer>> availability() {
        Map<Integer, Map<VehicleSize, Integer>> result = new HashMap<>();
        for (Level level : levels) {
            result.put(level.getNumber(), level.freeSpotsBySize());
        }
        return result;
    }
}`,
        },
      ],
    },
  },
  {
    slug: "design-elevator-system",
    solution: {
      approachMD: `Clarify responsibilities: Building exposes buttons, ElevatorController receives hall and car calls, and each Elevator owns its stop queues and state transitions. The design models a bank of cars rather than a single elevator.

Core entities are Building, ElevatorController, Elevator, Request, HallRequest, CarRequest, Direction, ElevatorState, and DispatchStrategy. Requests are small values; elevators keep their own ordered stops.

Each car follows a SCAN idea: continue serving floors in the current direction, then reverse when no more stops remain that way. Dispatch is a Strategy so nearest-car can later become zoning, load-aware, or priority dispatch.`,
      steps: [
        {
          title: "Separate hall and car requests",
          detailMD: `HallRequest includes direction because a person outside the car chooses up or down. CarRequest only needs the elevator id and destination floor.`,
          code: {
            filename: "ElevatorRequestSnippet.java",
            language: "java",
            content: `abstract class Request {
    private final int floor;

    Request(int floor) {
        this.floor = floor;
    }

    int getFloor() {
        return floor;
    }
}

class HallRequest extends Request {
    private final Direction direction;

    HallRequest(int floor, Direction direction) {
        super(floor);
        this.direction = direction;
    }
}`,
          },
        },
        {
          title: "Store stops by travel direction",
          detailMD: `Use one ascending set for upward stops and one descending set for downward stops. This keeps the next stop easy to find and naturally supports the SCAN serving rule.`,
          code: {
            filename: "ElevatorStopSetSnippet.java",
            language: "java",
            content: `class Elevator {
    private final NavigableSet<Integer> upStops = new TreeSet<>();
    private final NavigableSet<Integer> downStops = new TreeSet<>(Collections.reverseOrder());
    private int currentFloor;

    void addStop(int floor) {
        if (floor > currentFloor) {
            upStops.add(floor);
        } else if (floor < currentFloor) {
            downStops.add(floor);
        } else {
            openDoors();
        }
    }
}`,
          },
        },
        {
          title: "Dispatch through a strategy",
          detailMD: `The controller delegates car selection to DispatchStrategy. NearestCarStrategy compares estimated distances and prefers cars already moving toward the hall call.`,
          code: {
            filename: "NearestCarSnippet.java",
            language: "java",
            content: `class NearestCarStrategy implements DispatchStrategy {
    public Elevator chooseElevator(List<Elevator> elevators, HallRequest request) {
        return elevators.stream()
                .min(Comparator.comparingInt(e -> e.estimatedDistanceTo(request)))
                .orElseThrow(() -> new IllegalStateException("no elevators configured"));
    }
}`,
          },
        },
        {
          title: "Drive a small state machine",
          detailMD: `ElevatorState moves among IDLE, MOVING_UP, MOVING_DOWN, and DOORS_OPEN. A door-open tick is temporary; after it, the elevator chooses the next direction from pending stops.`,
        },
        {
          title: "Keep Building as the public facade",
          detailMD: `Building validates floors and forwards button presses to ElevatorController. This keeps UI, simulation, and tests away from internal stop-set details.`,
        },
      ],
      patterns: [
        {
          name: "State machine",
          why: "ElevatorState makes car movement and door behavior explicit.",
        },
        {
          name: "Strategy",
          why: "DispatchStrategy separates scheduling policy from controller flow.",
        },
      ],
      code: [
        {
          filename: "Direction.java",
          language: "java",
          content: `public enum Direction {
    UP,
    DOWN,
    IDLE;

    public Direction opposite() {
        if (this == UP) {
            return DOWN;
        }
        if (this == DOWN) {
            return UP;
        }
        return IDLE;
    }
}`,
        },
        {
          filename: "ElevatorState.java",
          language: "java",
          content: `public enum ElevatorState {
    IDLE,
    MOVING_UP,
    MOVING_DOWN,
    DOORS_OPEN;

    public boolean isMoving() {
        return this == MOVING_UP || this == MOVING_DOWN;
    }
}`,
        },
        {
          filename: "Request.java",
          language: "java",
          content: `public abstract class Request {
    private final int floor;

    protected Request(int floor) {
        if (floor < 0) {
            throw new IllegalArgumentException("floor cannot be negative");
        }
        this.floor = floor;
    }

    public int getFloor() {
        return floor;
    }
}

class HallRequest extends Request {
    private final Direction direction;

    HallRequest(int floor, Direction direction) {
        super(floor);
        if (direction == Direction.IDLE) {
            throw new IllegalArgumentException("hall call needs up or down");
        }
        this.direction = direction;
    }

    public Direction getDirection() {
        return direction;
    }
}

class CarRequest extends Request {
    private final int elevatorId;

    CarRequest(int elevatorId, int floor) {
        super(floor);
        this.elevatorId = elevatorId;
    }

    public int getElevatorId() {
        return elevatorId;
    }
}`,
        },
        {
          filename: "Elevator.java",
          language: "java",
          content: `import java.util.Collections;
import java.util.NavigableSet;
import java.util.TreeSet;

public class Elevator {
    private final int id;
    private final int minFloor;
    private final int maxFloor;
    private final NavigableSet<Integer> upStops = new TreeSet<>();
    private final NavigableSet<Integer> downStops = new TreeSet<>(Collections.reverseOrder());
    private int currentFloor;
    private Direction direction = Direction.IDLE;
    private ElevatorState state = ElevatorState.IDLE;

    public Elevator(int id, int minFloor, int maxFloor, int startFloor) {
        this.id = id;
        this.minFloor = minFloor;
        this.maxFloor = maxFloor;
        this.currentFloor = startFloor;
    }

    public synchronized void addStop(int floor) {
        validateFloor(floor);
        if (floor > currentFloor) {
            upStops.add(floor);
        } else if (floor < currentFloor) {
            downStops.add(floor);
        } else {
            openDoors();
            return;
        }
        chooseDirection();
    }

    public synchronized void step() {
        if (state == ElevatorState.DOORS_OPEN || direction == Direction.IDLE) {
            chooseDirection();
            return;
        }
        currentFloor += direction == Direction.UP ? 1 : -1;
        state = direction == Direction.UP ? ElevatorState.MOVING_UP : ElevatorState.MOVING_DOWN;
        if (direction == Direction.UP && upStops.remove(currentFloor)) {
            openDoors();
        } else if (direction == Direction.DOWN && downStops.remove(currentFloor)) {
            openDoors();
        }
    }

    private void chooseDirection() {
        if (direction == Direction.UP && !upStops.isEmpty()) {
            state = ElevatorState.MOVING_UP;
        } else if (direction == Direction.DOWN && !downStops.isEmpty()) {
            state = ElevatorState.MOVING_DOWN;
        } else if (!upStops.isEmpty()) {
            direction = Direction.UP;
            state = ElevatorState.MOVING_UP;
        } else if (!downStops.isEmpty()) {
            direction = Direction.DOWN;
            state = ElevatorState.MOVING_DOWN;
        } else {
            direction = Direction.IDLE;
            state = ElevatorState.IDLE;
        }
    }

    private void openDoors() {
        state = ElevatorState.DOORS_OPEN;
    }

    private void validateFloor(int floor) {
        if (floor < minFloor || floor > maxFloor) {
            throw new IllegalArgumentException("floor out of range " + floor);
        }
    }

    public synchronized int estimatedDistanceTo(HallRequest request) {
        int distance = Math.abs(currentFloor - request.getFloor());
        if (direction == Direction.IDLE) {
            return distance;
        }
        boolean ahead = direction == Direction.UP ? request.getFloor() >= currentFloor : request.getFloor() <= currentFloor;
        return direction == request.getDirection() && ahead ? distance : 1000 + distance;
    }

    public int getId() {
        return id;
    }
}`,
        },
        {
          filename: "DispatchStrategy.java",
          language: "java",
          content: `import java.util.Comparator;
import java.util.List;

public interface DispatchStrategy {
    Elevator chooseElevator(List<Elevator> elevators, HallRequest request);
}

class NearestCarStrategy implements DispatchStrategy {
    public Elevator chooseElevator(List<Elevator> elevators, HallRequest request) {
        return elevators.stream()
                .min(Comparator.comparingInt(elevator -> elevator.estimatedDistanceTo(request)))
                .orElseThrow(() -> new IllegalStateException("no elevators available"));
    }
}`,
        },
        {
          filename: "ElevatorController.java",
          language: "java",
          content: `import java.util.ArrayList;
import java.util.List;

public class ElevatorController {
    private final List<Elevator> elevators;
    private final DispatchStrategy dispatchStrategy;

    public ElevatorController(List<Elevator> elevators, DispatchStrategy dispatchStrategy) {
        this.elevators = new ArrayList<>(elevators);
        this.dispatchStrategy = dispatchStrategy;
    }

    public synchronized int submitHallCall(int floor, Direction direction) {
        HallRequest request = new HallRequest(floor, direction);
        Elevator elevator = dispatchStrategy.chooseElevator(elevators, request);
        elevator.addStop(floor);
        return elevator.getId();
    }

    public synchronized void submitCarCall(int elevatorId, int floor) {
        findElevator(elevatorId).addStop(floor);
    }

    public synchronized void tick() {
        for (Elevator elevator : elevators) {
            elevator.step();
        }
    }

    private Elevator findElevator(int elevatorId) {
        for (Elevator elevator : elevators) {
            if (elevator.getId() == elevatorId) {
                return elevator;
            }
        }
        throw new IllegalArgumentException("unknown elevator " + elevatorId);
    }
}`,
        },
        {
          filename: "Building.java",
          language: "java",
          content: `import java.util.ArrayList;
import java.util.List;

public class Building {
    private final int minFloor;
    private final int maxFloor;
    private final ElevatorController controller;

    public Building(int minFloor, int maxFloor, int elevatorCount) {
        this.minFloor = minFloor;
        this.maxFloor = maxFloor;
        this.controller = new ElevatorController(createElevators(elevatorCount), new NearestCarStrategy());
    }

    public int pressHallButton(int floor, Direction direction) {
        validateFloor(floor);
        return controller.submitHallCall(floor, direction);
    }

    public void selectFloor(int elevatorId, int floor) {
        validateFloor(floor);
        controller.submitCarCall(elevatorId, floor);
    }

    public void runOneTick() {
        controller.tick();
    }

    private List<Elevator> createElevators(int count) {
        List<Elevator> elevators = new ArrayList<>();
        for (int id = 1; id <= count; id++) {
            elevators.add(new Elevator(id, minFloor, maxFloor, minFloor));
        }
        return elevators;
    }

    private void validateFloor(int floor) {
        if (floor < minFloor || floor > maxFloor) {
            throw new IllegalArgumentException("floor out of range " + floor);
        }
    }
}`,
        },
      ],
    },
  },
  {
    slug: "design-vending-machine",
    solution: {
      approachMD: `Clarify the purchase flow: insert coins, select a product, verify stock and funds, compute change, dispense, or refund. The design must also reject invalid actions such as dispensing before a selection.

Core entities are VendingMachine, State, IdleState, HasMoneyState, DispensingState, OutOfStockState, Inventory, Product, and Coin. The machine is the context holding current state, inserted amount, inventory, and change bank.

Use the State pattern because each action has different behavior depending on the phase. The change algorithm is isolated in the context so states can ask whether exact change is possible before releasing a product.`,
      steps: [
        {
          title: "Define products and inventory",
          detailMD: `Product stores id, display name, and price. Inventory maps product ids to both Product objects and counts, so stock checks and restocking are independent of state logic.`,
          code: {
            filename: "InventorySnippet.java",
            language: "java",
            content: `class Inventory {
    private final Map<String, Product> products = new HashMap<>();
    private final Map<String, Integer> counts = new HashMap<>();

    boolean hasStock(Product product) {
        return counts.getOrDefault(product.getId(), 0) > 0;
    }

    void decrement(Product product) {
        if (!hasStock(product)) {
            throw new IllegalStateException("out of stock");
        }
        counts.put(product.getId(), counts.get(product.getId()) - 1);
    }
}`,
          },
        },
        {
          title: "Make states share one interface",
          detailMD: `State lists the user actions. Concrete states either handle an action or reject it with a clear error, keeping VendingMachine free of a large conditional block.`,
          code: {
            filename: "VendingStateSnippet.java",
            language: "java",
            content: `interface State {
    void insertCoin(VendingMachine machine, Coin coin);

    void selectProduct(VendingMachine machine, String productId);

    void dispense(VendingMachine machine);

    List<Coin> cancel(VendingMachine machine);
}`,
          },
        },
        {
          title: "Transition after money arrives",
          detailMD: `IdleState accepts the first coin and moves to HasMoneyState. HasMoneyState accepts more coins, validates selection, and only moves to DispensingState when money, stock, and change are all valid.`,
          code: {
            filename: "HasMoneySnippet.java",
            language: "java",
            content: `class HasMoneyState implements State {
    public void selectProduct(VendingMachine machine, String productId) {
        Product product = machine.getInventory().find(productId);
        if (machine.getInsertedAmount() < product.getPrice()) {
            throw new IllegalStateException("insufficient funds");
        }
        machine.setSelectedProduct(product);
        machine.moveTo(machine.dispensingState());
    }
}`,
          },
        },
        {
          title: "Compute change before dispensing",
          detailMD: `The machine attempts exact change using available denominations before releasing inventory. If exact change cannot be made, it refunds the inserted coins and returns to IdleState.`,
        },
        {
          title: "Handle cancellation and stock failures",
          detailMD: `Cancel returns the inserted coins and clears the transaction. OutOfStockState lets the customer cancel or choose another in-stock product without losing money.`,
        },
      ],
      patterns: [
        {
          name: "State",
          why: "Each concrete state owns valid behavior for the current phase of the purchase.",
        },
        {
          name: "Encapsulated change policy",
          why: "The context hides denomination math so state classes stay focused on transitions.",
        },
      ],
      code: [
        {
          filename: "Coin.java",
          language: "java",
          content: `public enum Coin {
    ONE(1),
    FIVE(5),
    TEN(10),
    TWENTY_FIVE(25);

    private final int value;

    Coin(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }
}`,
        },
        {
          filename: "Product.java",
          language: "java",
          content: `public class Product {
    private final String id;
    private final String name;
    private final int price;

    public Product(String id, String name, int price) {
        if (id == null || id.trim().isEmpty()) {
            throw new IllegalArgumentException("id is required");
        }
        if (price <= 0) {
            throw new IllegalArgumentException("price must be positive");
        }
        this.id = id;
        this.name = name;
        this.price = price;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public int getPrice() {
        return price;
    }
}`,
        },
        {
          filename: "Inventory.java",
          language: "java",
          content: `import java.util.HashMap;
import java.util.Map;

public class Inventory {
    private final Map<String, Product> products = new HashMap<>();
    private final Map<String, Integer> counts = new HashMap<>();

    public void addProduct(Product product, int count) {
        if (count < 0) {
            throw new IllegalArgumentException("count cannot be negative");
        }
        products.put(product.getId(), product);
        counts.put(product.getId(), counts.getOrDefault(product.getId(), 0) + count);
    }

    public Product find(String productId) {
        Product product = products.get(productId);
        if (product == null) {
            throw new IllegalArgumentException("unknown product " + productId);
        }
        return product;
    }

    public boolean hasStock(Product product) {
        return counts.getOrDefault(product.getId(), 0) > 0;
    }

    public void decrement(Product product) {
        if (!hasStock(product)) {
            throw new IllegalStateException("product is out of stock");
        }
        counts.put(product.getId(), counts.get(product.getId()) - 1);
    }
}`,
        },
        {
          filename: "State.java",
          language: "java",
          content: `import java.util.List;

public interface State {
    void insertCoin(VendingMachine machine, Coin coin);

    void selectProduct(VendingMachine machine, String productId);

    void dispense(VendingMachine machine);

    List<Coin> cancel(VendingMachine machine);
}`,
        },
        {
          filename: "VendingMachine.java",
          language: "java",
          content: `import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

public class VendingMachine {
    private final Inventory inventory;
    private final Map<Coin, Integer> changeBank = new EnumMap<>(Coin.class);
    private final List<Coin> insertedCoins = new ArrayList<>();
    private final State idleState = new IdleState();
    private final State hasMoneyState = new HasMoneyState();
    private final State dispensingState = new DispensingState();
    private final State outOfStockState = new OutOfStockState();
    private State currentState = idleState;
    private int insertedAmount;
    private Product selectedProduct;
    private List<Coin> lastChange = new ArrayList<>();

    public VendingMachine(Inventory inventory) {
        this.inventory = inventory;
        for (Coin coin : Coin.values()) {
            changeBank.put(coin, 0);
        }
    }

    public void insertCoin(Coin coin) {
        currentState.insertCoin(this, coin);
    }

    public void selectProduct(String productId) {
        currentState.selectProduct(this, productId);
    }

    public void dispense() {
        currentState.dispense(this);
    }

    public List<Coin> cancel() {
        return currentState.cancel(this);
    }

    void acceptCoin(Coin coin) {
        insertedCoins.add(coin);
        insertedAmount += coin.getValue();
        changeBank.put(coin, changeBank.get(coin) + 1);
    }

    boolean prepareChange(int amount) {
        List<Coin> change = takeChange(amount);
        if (amount > 0 && change.isEmpty()) {
            return false;
        }
        lastChange = change;
        return true;
    }

    private List<Coin> takeChange(int amount) {
        List<Coin> result = new ArrayList<>();
        Map<Coin, Integer> trial = new EnumMap<>(changeBank);
        List<Coin> coins = new ArrayList<>();
        for (Coin coin : Coin.values()) {
            coins.add(coin);
        }
        coins.sort(Comparator.comparingInt(Coin::getValue).reversed());
        int remaining = amount;
        for (Coin coin : coins) {
            while (remaining >= coin.getValue() && trial.get(coin) > 0) {
                remaining -= coin.getValue();
                trial.put(coin, trial.get(coin) - 1);
                result.add(coin);
            }
        }
        if (remaining != 0) {
            return new ArrayList<>();
        }
        changeBank.clear();
        changeBank.putAll(trial);
        return result;
    }

    List<Coin> refundInsertedCoins() {
        List<Coin> refund = new ArrayList<>(insertedCoins);
        for (Coin coin : insertedCoins) {
            changeBank.put(coin, changeBank.get(coin) - 1);
        }
        clearTransaction();
        moveTo(idleState);
        return refund;
    }

    void clearTransaction() {
        insertedCoins.clear();
        insertedAmount = 0;
        selectedProduct = null;
    }

    public List<Coin> collectChange() {
        List<Coin> change = new ArrayList<>(lastChange);
        lastChange.clear();
        return change;
    }

    public Inventory getInventory() {
        return inventory;
    }

    int getInsertedAmount() {
        return insertedAmount;
    }

    Product getSelectedProduct() {
        return selectedProduct;
    }

    void setSelectedProduct(Product selectedProduct) {
        this.selectedProduct = selectedProduct;
    }

    void moveTo(State state) {
        currentState = state;
    }

    State idleState() {
        return idleState;
    }

    State hasMoneyState() {
        return hasMoneyState;
    }

    State dispensingState() {
        return dispensingState;
    }

    State outOfStockState() {
        return outOfStockState;
    }
}`,
        },
        {
          filename: "IdleState.java",
          language: "java",
          content: `import java.util.ArrayList;
import java.util.List;

public class IdleState implements State {
    public void insertCoin(VendingMachine machine, Coin coin) {
        machine.acceptCoin(coin);
        machine.moveTo(machine.hasMoneyState());
    }

    public void selectProduct(VendingMachine machine, String productId) {
        throw new IllegalStateException("insert money before selecting a product");
    }

    public void dispense(VendingMachine machine) {
        throw new IllegalStateException("nothing selected for dispensing");
    }

    public List<Coin> cancel(VendingMachine machine) {
        return new ArrayList<>();
    }
}`,
        },
        {
          filename: "HasMoneyState.java",
          language: "java",
          content: `import java.util.List;

public class HasMoneyState implements State {
    public void insertCoin(VendingMachine machine, Coin coin) {
        machine.acceptCoin(coin);
    }

    public void selectProduct(VendingMachine machine, String productId) {
        Product product = machine.getInventory().find(productId);
        if (!machine.getInventory().hasStock(product)) {
            machine.setSelectedProduct(product);
            machine.moveTo(machine.outOfStockState());
            throw new IllegalStateException("selected product is out of stock");
        }
        if (machine.getInsertedAmount() < product.getPrice()) {
            throw new IllegalStateException("insufficient funds");
        }
        int changeAmount = machine.getInsertedAmount() - product.getPrice();
        if (!machine.prepareChange(changeAmount)) {
            machine.refundInsertedCoins();
            throw new IllegalStateException("cannot make change, refunded payment");
        }
        machine.setSelectedProduct(product);
        machine.moveTo(machine.dispensingState());
    }

    public void dispense(VendingMachine machine) {
        throw new IllegalStateException("select a product first");
    }

    public List<Coin> cancel(VendingMachine machine) {
        return machine.refundInsertedCoins();
    }
}`,
        },
        {
          filename: "DispensingState.java",
          language: "java",
          content: `import java.util.ArrayList;
import java.util.List;

public class DispensingState implements State {
    public void insertCoin(VendingMachine machine, Coin coin) {
        throw new IllegalStateException("dispensing is in progress");
    }

    public void selectProduct(VendingMachine machine, String productId) {
        throw new IllegalStateException("dispensing is in progress");
    }

    public void dispense(VendingMachine machine) {
        Product product = machine.getSelectedProduct();
        if (product == null) {
            machine.moveTo(machine.idleState());
            throw new IllegalStateException("no selected product");
        }
        machine.getInventory().decrement(product);
        machine.clearTransaction();
        machine.moveTo(machine.idleState());
    }

    public List<Coin> cancel(VendingMachine machine) {
        return new ArrayList<>();
    }
}`,
        },
        {
          filename: "OutOfStockState.java",
          language: "java",
          content: `import java.util.List;

public class OutOfStockState implements State {
    public void insertCoin(VendingMachine machine, Coin coin) {
        machine.acceptCoin(coin);
    }

    public void selectProduct(VendingMachine machine, String productId) {
        Product product = machine.getInventory().find(productId);
        if (!machine.getInventory().hasStock(product)) {
            throw new IllegalStateException("selected product is out of stock");
        }
        machine.moveTo(machine.hasMoneyState());
        machine.selectProduct(productId);
    }

    public void dispense(VendingMachine machine) {
        throw new IllegalStateException("cannot dispense while out of stock");
    }

    public List<Coin> cancel(VendingMachine machine) {
        return machine.refundInsertedCoins();
    }
}`,
        },
      ],
    },
  },
];
