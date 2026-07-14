import type { LldEntry } from "./entry-types";

export const ENTRIES: LldEntry[] = [
  {
    slug: "design-splitwise",
    solution: {
      approachMD: `Treat each group as the scope for members, expenses, and a balance sheet. Every expense is an immutable fact: one payer funded an amount, and each participant owns a computed share. The balance sheet stores only net positions, so all balances should sum back to zero after each accepted expense.

Split calculation is polymorphic. Equal, exact, and percent splits validate their own inputs, then the expense validates that all computed shares add up to the original amount.

Settlement is a separate simplification step. It reads the current net map, places creditors and debtors into priority queues, and greedily pairs the largest opposite balances until the group is settled.`,
      steps: [
        {
          title: "Create the money and participant model",
          detailMD: `Use immutable User objects and BigDecimal for money. Keep identity stable by keying users with an id rather than name or email.

The balance sheet should never store per-expense history as its primary state. Expense history is useful for audit, while the net map is the query-optimized view.`
        },
        {
          title: "Make split computation polymorphic",
          detailMD: `Define Split as the abstraction and let EqualSplit, ExactSplit, and PercentSplit decide how they validate and compute a share.

This keeps ExpenseService closed to new split math. Adding a weighted split later does not require a switch statement in the service.`,
          code: {
            filename: "SplitValidationExample.java",
            language: "java",
            content: `abstract class SplitValidationExample {
    private final String userId;

    protected SplitValidationExample(String userId) {
        this.userId = userId;
    }

    public String userId() {
        return userId;
    }

    abstract java.math.BigDecimal shareOf(java.math.BigDecimal total);

    abstract void validate(java.math.BigDecimal total);
}

final class ExactSplitExample extends SplitValidationExample {
    private final java.math.BigDecimal amount;

    ExactSplitExample(String userId, java.math.BigDecimal amount) {
        super(userId);
        this.amount = amount;
    }

    java.math.BigDecimal shareOf(java.math.BigDecimal total) {
        return amount;
    }

    void validate(java.math.BigDecimal total) {
        if (amount.signum() < 0 || amount.compareTo(total) > 0) {
            throw new IllegalArgumentException("Invalid exact share for " + userId());
        }
    }
}`
          }
        },
        {
          title: "Accept an expense as one atomic update",
          detailMD: `Validate the expense first, then apply it to the balance sheet. Credit the payer by the full amount and debit each participant by the share they consumed.

After the update, assert that the total of all net balances is still zero. This catches rounding and validation defects early.`,
          code: {
            filename: "BalanceUpdateExample.java",
            language: "java",
            content: `final class BalanceUpdateExample {
    private final java.util.Map<String, java.math.BigDecimal> net = new java.util.HashMap<>();

    void record(String payerId, java.math.BigDecimal amount, java.util.Map<String, java.math.BigDecimal> shares) {
        add(payerId, amount);
        for (java.util.Map.Entry<String, java.math.BigDecimal> share : shares.entrySet()) {
            add(share.getKey(), share.getValue().negate());
        }
        if (total().compareTo(java.math.BigDecimal.ZERO) != 0) {
            throw new IllegalStateException("Balance sheet no longer nets to zero");
        }
    }

    private void add(String userId, java.math.BigDecimal delta) {
        net.put(userId, net.getOrDefault(userId, java.math.BigDecimal.ZERO).add(delta));
    }

    private java.math.BigDecimal total() {
        java.math.BigDecimal sum = java.math.BigDecimal.ZERO;
        for (java.math.BigDecimal value : net.values()) {
            sum = sum.add(value);
        }
        return sum;
    }
}`
          }
        },
        {
          title: "Separate settlement from expense recording",
          detailMD: `Do not mutate historical expenses while settling. A settlement proposal is only a set of payments that would reduce the current net balances to zero.

Use two priority queues: one for the biggest creditors and one for the biggest debtors. Each generated payment clears at least one side, so the loop is short.`,
          code: {
            filename: "SettlementGreedyExample.java",
            language: "java",
            content: `final class SettlementGreedyExample {
    java.util.List<String> settle(java.util.Map<String, java.math.BigDecimal> balances) {
        java.util.PriorityQueue<java.util.Map.Entry<String, java.math.BigDecimal>> creditors =
            new java.util.PriorityQueue<>((a, b) -> b.getValue().compareTo(a.getValue()));
        java.util.PriorityQueue<java.util.Map.Entry<String, java.math.BigDecimal>> debtors =
            new java.util.PriorityQueue<>((a, b) -> a.getValue().compareTo(b.getValue()));

        for (java.util.Map.Entry<String, java.math.BigDecimal> entry : balances.entrySet()) {
            if (entry.getValue().signum() > 0) creditors.add(entry);
            if (entry.getValue().signum() < 0) debtors.add(entry);
        }

        java.util.List<String> payments = new java.util.ArrayList<>();
        while (!creditors.isEmpty() && !debtors.isEmpty()) {
            java.util.Map.Entry<String, java.math.BigDecimal> creditor = creditors.poll();
            java.util.Map.Entry<String, java.math.BigDecimal> debtor = debtors.poll();
            java.math.BigDecimal amount = creditor.getValue().min(debtor.getValue().abs());
            payments.add(debtor.getKey() + " pays " + creditor.getKey() + " " + amount);
        }
        return payments;
    }
}`
          }
        },
        {
          title: "Add operational safeguards",
          detailMD: `Reject negative amounts, unknown users, empty split lists, and rounded shares that no longer equal the expense amount.

For a production system, wrap addExpense in a transaction and store the expense event before publishing notifications. The balance sheet can then be rebuilt from history if needed.`
        }
      ],
      patterns: [
        {
          name: "Strategy through polymorphism",
          why: "Each split type owns its validation and share calculation without service-level branching."
        },
        {
          name: "Service layer",
          why: "ExpenseService coordinates validation, persistence intent, and balance updates behind one use-case method."
        },
        {
          name: "Greedy algorithm",
          why: "Settlement pairs the largest debtor and creditor to reduce cash transfers quickly."
        }
      ],
      code: [
        {
          filename: "User.java",
          language: "java",
          content: `import java.util.Objects;

public final class User {
    private final String id;
    private final String displayName;
    private final String email;

    public User(String id, String displayName, String email) {
        if (id == null || id.trim().isEmpty()) {
            throw new IllegalArgumentException("User id is required");
        }
        this.id = id;
        this.displayName = Objects.requireNonNull(displayName, "displayName");
        this.email = Objects.requireNonNull(email, "email");
    }

    public String getId() {
        return id;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getEmail() {
        return email;
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) return true;
        if (!(other instanceof User)) return false;
        User that = (User) other;
        return id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return id.hashCode();
    }

    @Override
    public String toString() {
        return displayName + " <" + email + ">";
    }
}`
        },
        {
          filename: "Group.java",
          language: "java",
          content: `import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.Objects;
import java.util.Set;

public final class Group {
    private final String id;
    private final String name;
    private final Set<User> members = new LinkedHashSet<>();
    private final BalanceSheet balanceSheet = new BalanceSheet();

    public Group(String id, String name) {
        this.id = Objects.requireNonNull(id, "id");
        this.name = Objects.requireNonNull(name, "name");
    }

    public synchronized void addMember(User user) {
        members.add(Objects.requireNonNull(user, "user"));
    }

    public synchronized boolean contains(User user) {
        return members.contains(user);
    }

    public synchronized Set<User> getMembers() {
        return Collections.unmodifiableSet(new LinkedHashSet<>(members));
    }

    public BalanceSheet getBalanceSheet() {
        return balanceSheet;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }
}`
        },
        {
          filename: "Split.java",
          language: "java",
          content: `import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Objects;

public abstract class Split {
    private final User user;

    protected Split(User user) {
        this.user = Objects.requireNonNull(user, "user");
    }

    public User getUser() {
        return user;
    }

    public abstract BigDecimal shareOf(BigDecimal totalAmount, int splitCount);

    public abstract void validate(BigDecimal totalAmount);

    protected BigDecimal money(BigDecimal value) {
        return value.setScale(2, RoundingMode.HALF_UP);
    }
}

final class EqualSplit extends Split {
    public EqualSplit(User user) {
        super(user);
    }

    public BigDecimal shareOf(BigDecimal totalAmount, int splitCount) {
        return totalAmount.divide(BigDecimal.valueOf(splitCount), 2, RoundingMode.HALF_UP);
    }

    public void validate(BigDecimal totalAmount) {
        if (totalAmount.signum() <= 0) {
            throw new IllegalArgumentException("Expense amount must be positive");
        }
    }
}

final class ExactSplit extends Split {
    private final BigDecimal amount;

    public ExactSplit(User user, BigDecimal amount) {
        super(user);
        this.amount = money(Objects.requireNonNull(amount, "amount"));
    }

    public BigDecimal shareOf(BigDecimal totalAmount, int splitCount) {
        return amount;
    }

    public void validate(BigDecimal totalAmount) {
        if (amount.signum() < 0 || amount.compareTo(totalAmount) > 0) {
            throw new IllegalArgumentException("Invalid exact split for " + getUser().getId());
        }
    }
}

final class PercentSplit extends Split {
    private final BigDecimal percent;

    public PercentSplit(User user, BigDecimal percent) {
        super(user);
        this.percent = Objects.requireNonNull(percent, "percent");
    }

    public BigDecimal shareOf(BigDecimal totalAmount, int splitCount) {
        return money(totalAmount.multiply(percent).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP));
    }

    public void validate(BigDecimal totalAmount) {
        if (percent.signum() < 0 || percent.compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new IllegalArgumentException("Percent must be between 0 and 100");
        }
    }
}`
        },
        {
          filename: "Expense.java",
          language: "java",
          content: `import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

public final class Expense {
    private final String id;
    private final User payer;
    private final BigDecimal amount;
    private final List<Split> splits;
    private final Instant createdAt;

    public Expense(String id, User payer, BigDecimal amount, List<Split> splits) {
        this.id = Objects.requireNonNull(id, "id");
        this.payer = Objects.requireNonNull(payer, "payer");
        this.amount = Objects.requireNonNull(amount, "amount").setScale(2, RoundingMode.HALF_UP);
        this.splits = Collections.unmodifiableList(new ArrayList<>(Objects.requireNonNull(splits, "splits")));
        this.createdAt = Instant.now();
        validate();
    }

    private void validate() {
        if (amount.signum() <= 0 || splits.isEmpty()) {
            throw new IllegalArgumentException("Expense needs a positive amount and at least one split");
        }
        BigDecimal total = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        for (Split split : splits) {
            split.validate(amount);
            total = total.add(split.shareOf(amount, splits.size()));
        }
        if (total.compareTo(amount) != 0) {
            throw new IllegalArgumentException("Split total " + total + " does not match amount " + amount);
        }
    }

    public String getId() {
        return id;
    }

    public User getPayer() {
        return payer;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public List<Split> getSplits() {
        return splits;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}`
        },
        {
          filename: "BalanceSheet.java",
          language: "java",
          content: `import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

public final class BalanceSheet {
    private final Map<User, BigDecimal> netBalances = new HashMap<>();

    public synchronized void apply(Expense expense) {
        add(expense.getPayer(), expense.getAmount());
        for (Split split : expense.getSplits()) {
            BigDecimal share = split.shareOf(expense.getAmount(), expense.getSplits().size());
            add(split.getUser(), share.negate());
        }
        if (total().compareTo(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP)) != 0) {
            throw new IllegalStateException("Net balances must sum to zero");
        }
    }

    public synchronized Map<User, BigDecimal> snapshot() {
        return Collections.unmodifiableMap(new HashMap<>(netBalances));
    }

    public synchronized BigDecimal balanceOf(User user) {
        return netBalances.getOrDefault(user, BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP));
    }

    private void add(User user, BigDecimal delta) {
        BigDecimal current = netBalances.getOrDefault(user, BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP));
        BigDecimal next = current.add(delta).setScale(2, RoundingMode.HALF_UP);
        if (next.compareTo(BigDecimal.ZERO) == 0) {
            netBalances.remove(user);
        } else {
            netBalances.put(user, next);
        }
    }

    private BigDecimal total() {
        BigDecimal sum = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        for (BigDecimal balance : netBalances.values()) {
            sum = sum.add(balance);
        }
        return sum.setScale(2, RoundingMode.HALF_UP);
    }
}`
        },
        {
          filename: "ExpenseService.java",
          language: "java",
          content: `import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

public final class ExpenseService {
    private final Group group;
    private final List<Expense> expenses = new ArrayList<>();

    public ExpenseService(Group group) {
        this.group = Objects.requireNonNull(group, "group");
    }

    public synchronized Expense addExpense(User payer, BigDecimal amount, List<Split> splits) {
        ensureMember(payer);
        for (Split split : splits) {
            ensureMember(split.getUser());
        }
        Expense expense = new Expense(UUID.randomUUID().toString(), payer, amount, splits);
        group.getBalanceSheet().apply(expense);
        expenses.add(expense);
        return expense;
    }

    public synchronized List<Expense> history() {
        return Collections.unmodifiableList(new ArrayList<>(expenses));
    }

    public BigDecimal balanceOf(User user) {
        return group.getBalanceSheet().balanceOf(user);
    }

    public List<Payment> settleUp() {
        SettlementService settlementService = new SettlementService();
        return settlementService.simplify(group.getBalanceSheet().snapshot());
    }

    private void ensureMember(User user) {
        if (!group.contains(user)) {
            throw new IllegalArgumentException("User is not in group " + group.getId());
        }
    }
}`
        },
        {
          filename: "SettlementService.java",
          language: "java",
          content: `import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.PriorityQueue;

public final class SettlementService {
    public List<Payment> simplify(Map<User, BigDecimal> balances) {
        PriorityQueue<BalanceNode> creditors = new PriorityQueue<>((a, b) -> b.amount.compareTo(a.amount));
        PriorityQueue<BalanceNode> debtors = new PriorityQueue<>((a, b) -> b.amount.compareTo(a.amount));

        for (Map.Entry<User, BigDecimal> entry : balances.entrySet()) {
            int sign = entry.getValue().signum();
            if (sign > 0) creditors.add(new BalanceNode(entry.getKey(), entry.getValue()));
            if (sign < 0) debtors.add(new BalanceNode(entry.getKey(), entry.getValue().abs()));
        }

        List<Payment> payments = new ArrayList<>();
        while (!creditors.isEmpty() && !debtors.isEmpty()) {
            BalanceNode creditor = creditors.poll();
            BalanceNode debtor = debtors.poll();
            BigDecimal amount = creditor.amount.min(debtor.amount).setScale(2, RoundingMode.HALF_UP);
            payments.add(new Payment(debtor.user, creditor.user, amount));

            BigDecimal remainingCredit = creditor.amount.subtract(amount);
            BigDecimal remainingDebt = debtor.amount.subtract(amount);
            if (remainingCredit.signum() > 0) creditors.add(new BalanceNode(creditor.user, remainingCredit));
            if (remainingDebt.signum() > 0) debtors.add(new BalanceNode(debtor.user, remainingDebt));
        }
        return payments;
    }

    private static final class BalanceNode {
        private final User user;
        private final BigDecimal amount;

        private BalanceNode(User user, BigDecimal amount) {
            this.user = user;
            this.amount = amount;
        }
    }
}

final class Payment {
    private final User from;
    private final User to;
    private final BigDecimal amount;

    Payment(User from, User to, BigDecimal amount) {
        this.from = from;
        this.to = to;
        this.amount = amount;
    }

    public String describe() {
        return from.getDisplayName() + " pays " + to.getDisplayName() + " " + amount;
    }
}`
        }
      ]
    }
  },
  {
    slug: "design-library-management",
    solution: {
      approachMD: `Separate bibliographic data from inventory. Book represents the ISBN, title, authors, and subject, while BookCopy represents one physical or digital copy with a barcode and lifecycle status.

Borrowing is a service-level use case because it needs member limits, copy status, loan creation, reservation rules, and fine checks. The critical section is the selected copy, especially when two members attempt to borrow the last available copy.

Catalog search uses criteria strategies, so title, author, and subject searches share indexing and filtering infrastructure without creating one large search method.`,
      steps: [
        {
          title: "Separate title metadata from copy state",
          detailMD: `Keep Book immutable and allow many BookCopy objects to point to it. This avoids duplicating author and subject data for every barcode.

The copy owns mutable status. Available, Loaned, Reserved, and Lost are state values that drive which service actions are legal.`
        },
        {
          title: "Implement search criteria as strategies",
          detailMD: `Catalog accepts a SearchCriteria object and applies it to stored books. New filters such as publication year or language can be added without editing Catalog search branching.`,
          code: {
            filename: "CatalogSearchExample.java",
            language: "java",
            content: `interface CatalogSearchExample {
    boolean matches(Book book);
}

final class AuthorSearchExample implements CatalogSearchExample {
    private final String token;

    AuthorSearchExample(String token) {
        this.token = token.toLowerCase();
    }

    public boolean matches(Book book) {
        for (String author : book.getAuthors()) {
            if (author.toLowerCase().contains(token)) {
                return true;
            }
        }
        return false;
    }
}`
          }
        },
        {
          title: "Borrow inside a copy-level critical section",
          detailMD: `After finding an available copy, synchronize on that copy and check status again. The second check prevents two requests from borrowing the same last copy.

Create the Loan only after the copy status changes to Loaned. This keeps the inventory and circulation records consistent.`,
          code: {
            filename: "BorrowCriticalSectionExample.java",
            language: "java",
            content: `final class BorrowCriticalSectionExample {
    Loan borrow(BookCopy copy, Member member, java.time.LocalDate today) {
        synchronized (copy) {
            if (copy.getStatus() != CopyStatus.AVAILABLE) {
                throw new IllegalStateException("Copy is no longer available");
            }
            if (!member.canBorrowMore()) {
                throw new IllegalStateException("Member loan limit reached");
            }
            copy.markLoaned();
            return new Loan(copy, member, today, today.plusDays(14));
        }
    }
}`
          }
        },
        {
          title: "Return, fine, and reservation handling",
          detailMD: `Return closes the open loan, calculates overdue fines, and changes copy status based on waiting reservations.

If reservations exist, mark the copy Reserved and notify the next member. If nobody is waiting, mark it Available.`
        },
        {
          title: "Keep policies replaceable",
          detailMD: `Loan duration, maximum open loans, and daily fine amount should be constructor inputs or policy objects rather than constants hidden inside methods.

This keeps the core design ready for student memberships, premium memberships, or no-fine collections.`,
          code: {
            filename: "FinePolicyExample.java",
            language: "java",
            content: `final class FinePolicyExample {
    private final java.math.BigDecimal dailyFine;

    FinePolicyExample(java.math.BigDecimal dailyFine) {
        this.dailyFine = dailyFine;
    }

    java.math.BigDecimal calculate(Loan loan, java.time.LocalDate returnedOn) {
        long overdueDays = java.time.temporal.ChronoUnit.DAYS.between(loan.getDueDate(), returnedOn);
        if (overdueDays <= 0) {
            return java.math.BigDecimal.ZERO;
        }
        return dailyFine.multiply(java.math.BigDecimal.valueOf(overdueDays));
    }
}`
          }
        }
      ],
      patterns: [
        {
          name: "Strategy",
          why: "Search criteria and fine policies can vary independently from Catalog and LibraryService."
        },
        {
          name: "State",
          why: "BookCopy status controls legal transitions such as borrow, reserve, return, and mark lost."
        },
        {
          name: "Observer",
          why: "Reservation notifications can be sent by pluggable listeners when a copy becomes reservable."
        }
      ],
      code: [
        {
          filename: "Book.java",
          language: "java",
          content: `import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

public final class Book {
    private final String isbn;
    private final String title;
    private final List<String> authors;
    private final String subject;

    public Book(String isbn, String title, List<String> authors, String subject) {
        if (isbn == null || isbn.trim().isEmpty()) {
            throw new IllegalArgumentException("ISBN is required");
        }
        this.isbn = isbn;
        this.title = Objects.requireNonNull(title, "title");
        this.authors = Collections.unmodifiableList(new ArrayList<>(Objects.requireNonNull(authors, "authors")));
        this.subject = Objects.requireNonNull(subject, "subject");
    }

    public String getIsbn() {
        return isbn;
    }

    public String getTitle() {
        return title;
    }

    public List<String> getAuthors() {
        return authors;
    }

    public String getSubject() {
        return subject;
    }
}`
        },
        {
          filename: "BookCopy.java",
          language: "java",
          content: `import java.util.Objects;

public final class BookCopy {
    private final String barcode;
    private final Book book;
    private CopyStatus status;

    public BookCopy(String barcode, Book book) {
        this.barcode = Objects.requireNonNull(barcode, "barcode");
        this.book = Objects.requireNonNull(book, "book");
        this.status = CopyStatus.AVAILABLE;
    }

    public String getBarcode() {
        return barcode;
    }

    public Book getBook() {
        return book;
    }

    public synchronized CopyStatus getStatus() {
        return status;
    }

    public synchronized void markLoaned() {
        requireStatus(CopyStatus.AVAILABLE);
        status = CopyStatus.LOANED;
    }

    public synchronized void markReserved() {
        if (status != CopyStatus.AVAILABLE && status != CopyStatus.LOANED) {
            throw new IllegalStateException("Cannot reserve copy in status " + status);
        }
        status = CopyStatus.RESERVED;
    }

    public synchronized void markAvailable() {
        if (status == CopyStatus.LOST) {
            throw new IllegalStateException("Lost copies cannot become available directly");
        }
        status = CopyStatus.AVAILABLE;
    }

    public synchronized void markLost() {
        status = CopyStatus.LOST;
    }

    private void requireStatus(CopyStatus expected) {
        if (status != expected) {
            throw new IllegalStateException("Expected " + expected + " but was " + status);
        }
    }
}

enum CopyStatus {
    AVAILABLE,
    LOANED,
    RESERVED,
    LOST
}`
        },
        {
          filename: "Member.java",
          language: "java",
          content: `import java.util.Collections;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

public final class Member {
    private final String id;
    private final String name;
    private final int maxOpenLoans;
    private final Set<Loan> openLoans = new HashSet<>();

    public Member(String id, String name, int maxOpenLoans) {
        this.id = Objects.requireNonNull(id, "id");
        this.name = Objects.requireNonNull(name, "name");
        this.maxOpenLoans = maxOpenLoans;
    }

    public synchronized boolean canBorrowMore() {
        return openLoans.size() < maxOpenLoans;
    }

    public synchronized void addLoan(Loan loan) {
        if (!canBorrowMore()) {
            throw new IllegalStateException("Loan limit reached for " + id);
        }
        openLoans.add(loan);
    }

    public synchronized void closeLoan(Loan loan) {
        openLoans.remove(loan);
    }

    public synchronized Set<Loan> getOpenLoans() {
        return Collections.unmodifiableSet(new HashSet<>(openLoans));
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }
}`
        },
        {
          filename: "Catalog.java",
          language: "java",
          content: `import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

public final class Catalog {
    private final List<Book> books = new ArrayList<>();
    private final List<BookCopy> copies = new ArrayList<>();

    public synchronized void addBook(Book book) {
        books.add(book);
    }

    public synchronized void addCopy(BookCopy copy) {
        copies.add(copy);
    }

    public synchronized List<Book> search(SearchCriteria criteria) {
        List<Book> result = new ArrayList<>();
        for (Book book : books) {
            if (criteria.matches(book)) {
                result.add(book);
            }
        }
        return Collections.unmodifiableList(result);
    }

    public synchronized Optional<BookCopy> findAvailableCopy(String isbn) {
        for (BookCopy copy : copies) {
            if (copy.getBook().getIsbn().equals(isbn) && copy.getStatus() == CopyStatus.AVAILABLE) {
                return Optional.of(copy);
            }
        }
        return Optional.empty();
    }
}

interface SearchCriteria {
    boolean matches(Book book);
}

final class TitleCriteria implements SearchCriteria {
    private final String token;

    TitleCriteria(String token) {
        this.token = token.toLowerCase(Locale.ROOT);
    }

    public boolean matches(Book book) {
        return book.getTitle().toLowerCase(Locale.ROOT).contains(token);
    }
}

final class AuthorCriteria implements SearchCriteria {
    private final String token;

    AuthorCriteria(String token) {
        this.token = token.toLowerCase(Locale.ROOT);
    }

    public boolean matches(Book book) {
        for (String author : book.getAuthors()) {
            if (author.toLowerCase(Locale.ROOT).contains(token)) {
                return true;
            }
        }
        return false;
    }
}

final class SubjectCriteria implements SearchCriteria {
    private final String token;

    SubjectCriteria(String token) {
        this.token = token.toLowerCase(Locale.ROOT);
    }

    public boolean matches(Book book) {
        return book.getSubject().toLowerCase(Locale.ROOT).contains(token);
    }
}`
        },
        {
          filename: "Loan.java",
          language: "java",
          content: `import java.time.LocalDate;
import java.util.Objects;

public final class Loan {
    private final BookCopy copy;
    private final Member member;
    private final LocalDate issueDate;
    private final LocalDate dueDate;
    private LocalDate returnedDate;

    public Loan(BookCopy copy, Member member, LocalDate issueDate, LocalDate dueDate) {
        this.copy = Objects.requireNonNull(copy, "copy");
        this.member = Objects.requireNonNull(member, "member");
        this.issueDate = Objects.requireNonNull(issueDate, "issueDate");
        this.dueDate = Objects.requireNonNull(dueDate, "dueDate");
    }

    public boolean isOpen() {
        return returnedDate == null;
    }

    public boolean isOverdue(LocalDate today) {
        return isOpen() && today.isAfter(dueDate);
    }

    public void close(LocalDate returnedOn) {
        if (!isOpen()) {
            throw new IllegalStateException("Loan is already closed");
        }
        returnedDate = returnedOn;
    }

    public BookCopy getCopy() {
        return copy;
    }

    public Member getMember() {
        return member;
    }

    public LocalDate getIssueDate() {
        return issueDate;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }
}`
        },
        {
          filename: "Reservation.java",
          language: "java",
          content: `import java.time.Instant;
import java.util.Objects;

public final class Reservation {
    private final Book book;
    private final Member member;
    private final Instant createdAt;
    private boolean active = true;

    public Reservation(Book book, Member member) {
        this.book = Objects.requireNonNull(book, "book");
        this.member = Objects.requireNonNull(member, "member");
        this.createdAt = Instant.now();
    }

    public Book getBook() {
        return book;
    }

    public Member getMember() {
        return member;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public boolean isActive() {
        return active;
    }

    public void fulfill() {
        if (!active) {
            throw new IllegalStateException("Reservation is no longer active");
        }
        active = false;
    }
}

interface ReservationNotifier {
    void notifyReady(Member member, BookCopy copy);
}`
        },
        {
          filename: "FineService.java",
          language: "java",
          content: `import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Objects;

public final class FineService {
    private final BigDecimal dailyFine;

    public FineService(BigDecimal dailyFine) {
        if (dailyFine.signum() < 0) {
            throw new IllegalArgumentException("Daily fine cannot be negative");
        }
        this.dailyFine = Objects.requireNonNull(dailyFine, "dailyFine");
    }

    public BigDecimal calculateFine(Loan loan, LocalDate returnedOn) {
        long overdueDays = ChronoUnit.DAYS.between(loan.getDueDate(), returnedOn);
        if (overdueDays <= 0) {
            return BigDecimal.ZERO;
        }
        return dailyFine.multiply(BigDecimal.valueOf(overdueDays));
    }
}`
        },
        {
          filename: "LibraryService.java",
          language: "java",
          content: `import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayDeque;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Queue;

public final class LibraryService {
    private final Catalog catalog;
    private final FineService fineService;
    private final ReservationNotifier notifier;
    private final Map<String, Loan> openLoansByBarcode = new HashMap<>();
    private final Map<String, Queue<Reservation>> reservationsByIsbn = new HashMap<>();

    public LibraryService(Catalog catalog, FineService fineService, ReservationNotifier notifier) {
        this.catalog = Objects.requireNonNull(catalog, "catalog");
        this.fineService = Objects.requireNonNull(fineService, "fineService");
        this.notifier = Objects.requireNonNull(notifier, "notifier");
    }

    public Loan borrow(String isbn, Member member, LocalDate today) {
        Optional<BookCopy> candidate = catalog.findAvailableCopy(isbn);
        BookCopy copy = candidate.orElseThrow(() -> new IllegalStateException("No available copy for " + isbn));
        synchronized (copy) {
            if (copy.getStatus() != CopyStatus.AVAILABLE) {
                throw new IllegalStateException("Copy was borrowed by another request");
            }
            if (!member.canBorrowMore()) {
                throw new IllegalStateException("Member cannot borrow more books");
            }
            copy.markLoaned();
            Loan loan = new Loan(copy, member, today, today.plusDays(14));
            synchronized (this) {
                openLoansByBarcode.put(copy.getBarcode(), loan);
            }
            member.addLoan(loan);
            return loan;
        }
    }

    public BigDecimal returnCopy(String barcode, LocalDate returnedOn) {
        Loan loan;
        synchronized (this) {
            loan = openLoansByBarcode.remove(barcode);
        }
        if (loan == null) {
            throw new IllegalArgumentException("No open loan for barcode " + barcode);
        }
        loan.close(returnedOn);
        loan.getMember().closeLoan(loan);
        BigDecimal fine = fineService.calculateFine(loan, returnedOn);
        releaseOrReserveNext(loan.getCopy());
        return fine;
    }

    public synchronized Reservation reserve(Book book, Member member) {
        Reservation reservation = new Reservation(book, member);
        reservationsByIsbn.computeIfAbsent(book.getIsbn(), key -> new ArrayDeque<>()).add(reservation);
        return reservation;
    }

    private void releaseOrReserveNext(BookCopy copy) {
        Queue<Reservation> queue;
        synchronized (this) {
            queue = reservationsByIsbn.get(copy.getBook().getIsbn());
        }
        Reservation next = queue == null ? null : queue.poll();
        synchronized (copy) {
            if (next == null) {
                copy.markAvailable();
            } else {
                next.fulfill();
                copy.markReserved();
                notifier.notifyReady(next.getMember(), copy);
            }
        }
    }
}`
        }
      ]
    }
  },
  {
    slug: "design-tic-tac-toe",
    solution: {
      approachMD: `Model the game as a small state machine around a board. The board enforces coordinates and empty-cell rules, while Game owns turn order, move count, and transitions from IN_PROGRESS to WIN or DRAW.

Winning logic is behind a strategy interface. A counting strategy updates row, column, and diagonal counters after each move for constant-time checks when the target is the full board size, and can fall back to directional scanning for shorter target lengths.

This keeps the design extensible for N by N boards, different winning lengths, bots, replay, or alternate rule sets without changing the controller flow.`,
      steps: [
        {
          title: "Represent board cells explicitly",
          detailMD: `Use Mark.EMPTY for unclaimed cells and reject moves outside the board or on occupied cells.

Board should expose read operations and a place method, but it should not decide whether the game is over.`
        },
        {
          title: "Inject the winning strategy",
          detailMD: `Game receives a WinningStrategy, which lets the same controller work for classic three by three play or larger boards.

The counter-based strategy receives the last move and updates only the affected row, column, and diagonals.`,
          code: {
            filename: "CounterWinExample.java",
            language: "java",
            content: `final class CounterWinExample {
    private final int[] rows;
    private final int[] cols;
    private int diagonal;
    private int antiDiagonal;

    CounterWinExample(int size) {
        rows = new int[size];
        cols = new int[size];
    }

    boolean update(int row, int col, Mark mark) {
        int value = mark == Mark.X ? 1 : -1;
        rows[row] += value;
        cols[col] += value;
        if (row == col) diagonal += value;
        if (row + col == rows.length - 1) antiDiagonal += value;
        return Math.abs(rows[row]) == rows.length
            || Math.abs(cols[col]) == rows.length
            || Math.abs(diagonal) == rows.length
            || Math.abs(antiDiagonal) == rows.length;
    }
}`
          }
        },
        {
          title: "Keep turn management in Game",
          detailMD: `Game checks the current state before every move, places the mark, asks the strategy if the move won, then advances to the next player.

The next player should not rotate after a winning move, which makes result display easier.`,
          code: {
            filename: "MoveFlowExample.java",
            language: "java",
            content: `final class MoveFlowExample {
    private int currentPlayerIndex;
    private GameState state = GameState.IN_PROGRESS;

    void play(Player[] players, Board board, WinningStrategy strategy, int row, int col) {
        if (state != GameState.IN_PROGRESS) {
            throw new IllegalStateException("Game already finished");
        }
        Player player = players[currentPlayerIndex];
        board.place(row, col, player.getMark());
        if (strategy.isWinningMove(board, row, col, player.getMark())) {
            state = GameState.WIN;
            return;
        }
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    }
}`
          }
        },
        {
          title: "Detect draw from move count",
          detailMD: `Track successful moves and declare DRAW when the count reaches board size multiplied by board size without a win.

This avoids scanning the whole board after every non-winning move.`
        },
        {
          title: "Make rule changes local",
          detailMD: `If a product later adds five in a row, blocked cells, or misere rules, implement a new WinningStrategy.

The Game class should still process turns the same way: validate state, place mark, evaluate outcome, then rotate if needed.`,
          code: {
            filename: "StrategySwapExample.java",
            language: "java",
            content: `final class StrategySwapExample {
    Game newClassicGame(Player x, Player o) {
        Board board = new Board(3);
        WinningStrategy strategy = new CountingWinningStrategy(3, 3);
        return new Game(board, new Player[] { x, o }, strategy);
    }

    Game newLargeGame(Player x, Player o) {
        Board board = new Board(10);
        WinningStrategy strategy = new CountingWinningStrategy(10, 5);
        return new Game(board, new Player[] { x, o }, strategy);
    }
}`
          }
        }
      ],
      patterns: [
        {
          name: "Strategy",
          why: "WinningStrategy lets board size and winning length vary without rewriting Game."
        },
        {
          name: "State machine",
          why: "GameState prevents moves after a win or draw and makes transitions explicit."
        },
        {
          name: "Encapsulation",
          why: "Board owns cell mutation rules while Game owns turn and result rules."
        }
      ],
      code: [
        {
          filename: "Mark.java",
          language: "java",
          content: `public enum Mark {
    X(1),
    O(-1),
    EMPTY(0);

    private final int score;

    Mark(int score) {
        this.score = score;
    }

    public int score() {
        return score;
    }

    public boolean isPlayerMark() {
        return this == X || this == O;
    }
}`
        },
        {
          filename: "Cell.java",
          language: "java",
          content: `public final class Cell {
    private final int row;
    private final int col;
    private Mark mark = Mark.EMPTY;

    public Cell(int row, int col) {
        this.row = row;
        this.col = col;
    }

    public int getRow() {
        return row;
    }

    public int getCol() {
        return col;
    }

    public Mark getMark() {
        return mark;
    }

    public boolean isEmpty() {
        return mark == Mark.EMPTY;
    }

    public void place(Mark nextMark) {
        if (!isEmpty()) {
            throw new IllegalStateException("Cell is already occupied");
        }
        if (nextMark == Mark.EMPTY) {
            throw new IllegalArgumentException("Cannot place EMPTY");
        }
        mark = nextMark;
    }
}`
        },
        {
          filename: "Board.java",
          language: "java",
          content: `public final class Board {
    private final int size;
    private final Cell[][] cells;

    public Board(int size) {
        if (size < 3) {
            throw new IllegalArgumentException("Board size must be at least 3");
        }
        this.size = size;
        this.cells = new Cell[size][size];
        for (int row = 0; row < size; row++) {
            for (int col = 0; col < size; col++) {
                cells[row][col] = new Cell(row, col);
            }
        }
    }

    public int size() {
        return size;
    }

    public void place(int row, int col, Mark mark) {
        validate(row, col);
        cells[row][col].place(mark);
    }

    public Mark markAt(int row, int col) {
        validate(row, col);
        return cells[row][col].getMark();
    }

    public boolean isInside(int row, int col) {
        return row >= 0 && row < size && col >= 0 && col < size;
    }

    private void validate(int row, int col) {
        if (!isInside(row, col)) {
            throw new IndexOutOfBoundsException("Move outside board: " + row + "," + col);
        }
    }
}`
        },
        {
          filename: "Player.java",
          language: "java",
          content: `import java.util.Objects;

public final class Player {
    private final String id;
    private final String name;
    private final Mark mark;

    public Player(String id, String name, Mark mark) {
        if (mark == Mark.EMPTY) {
            throw new IllegalArgumentException("Player needs X or O");
        }
        this.id = Objects.requireNonNull(id, "id");
        this.name = Objects.requireNonNull(name, "name");
        this.mark = Objects.requireNonNull(mark, "mark");
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public Mark getMark() {
        return mark;
    }
}`
        },
        {
          filename: "GameState.java",
          language: "java",
          content: `public enum GameState {
    IN_PROGRESS,
    WIN,
    DRAW
}`
        },
        {
          filename: "WinningStrategy.java",
          language: "java",
          content: `public interface WinningStrategy {
    boolean isWinningMove(Board board, int row, int col, Mark mark);
}

final class CountingWinningStrategy implements WinningStrategy {
    private final int size;
    private final int target;
    private final int[] rows;
    private final int[] cols;
    private int diagonal;
    private int antiDiagonal;

    public CountingWinningStrategy(int size, int target) {
        if (target < 3 || target > size) {
            throw new IllegalArgumentException("Target must be between 3 and board size");
        }
        this.size = size;
        this.target = target;
        this.rows = new int[size];
        this.cols = new int[size];
    }

    public boolean isWinningMove(Board board, int row, int col, Mark mark) {
        int value = mark.score();
        rows[row] += value;
        cols[col] += value;
        if (row == col) diagonal += value;
        if (row + col == size - 1) antiDiagonal += value;

        if (target == size) {
            return Math.abs(rows[row]) == target
                || Math.abs(cols[col]) == target
                || Math.abs(diagonal) == target
                || Math.abs(antiDiagonal) == target;
        }
        return hasRun(board, row, col, mark, 1, 0)
            || hasRun(board, row, col, mark, 0, 1)
            || hasRun(board, row, col, mark, 1, 1)
            || hasRun(board, row, col, mark, 1, -1);
    }

    private boolean hasRun(Board board, int row, int col, Mark mark, int rowStep, int colStep) {
        int count = 1;
        count += countDirection(board, row, col, mark, rowStep, colStep);
        count += countDirection(board, row, col, mark, -rowStep, -colStep);
        return count >= target;
    }

    private int countDirection(Board board, int row, int col, Mark mark, int rowStep, int colStep) {
        int count = 0;
        int nextRow = row + rowStep;
        int nextCol = col + colStep;
        while (board.isInside(nextRow, nextCol) && board.markAt(nextRow, nextCol) == mark) {
            count++;
            nextRow += rowStep;
            nextCol += colStep;
        }
        return count;
    }
}`
        },
        {
          filename: "Game.java",
          language: "java",
          content: `import java.util.Arrays;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

public final class Game {
    private final Board board;
    private final Player[] players;
    private final WinningStrategy winningStrategy;
    private int currentPlayerIndex;
    private int moveCount;
    private GameState state = GameState.IN_PROGRESS;
    private Player winner;

    public Game(Board board, Player[] players, WinningStrategy winningStrategy) {
        if (players.length != 2) {
            throw new IllegalArgumentException("Tic tac toe needs two players");
        }
        ensureDistinctMarks(players);
        this.board = Objects.requireNonNull(board, "board");
        this.players = Arrays.copyOf(players, players.length);
        this.winningStrategy = Objects.requireNonNull(winningStrategy, "winningStrategy");
    }

    public synchronized GameState play(int row, int col) {
        if (state != GameState.IN_PROGRESS) {
            throw new IllegalStateException("Game is already complete");
        }
        Player current = players[currentPlayerIndex];
        board.place(row, col, current.getMark());
        moveCount++;

        if (winningStrategy.isWinningMove(board, row, col, current.getMark())) {
            winner = current;
            state = GameState.WIN;
        } else if (moveCount == board.size() * board.size()) {
            state = GameState.DRAW;
        } else {
            currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
        }
        return state;
    }

    public Player currentPlayer() {
        return players[currentPlayerIndex];
    }

    public GameState getState() {
        return state;
    }

    public Player getWinner() {
        return winner;
    }

    private void ensureDistinctMarks(Player[] players) {
        Set<Mark> marks = new HashSet<>();
        for (Player player : players) {
            if (!marks.add(player.getMark())) {
                throw new IllegalArgumentException("Players must use different marks");
            }
        }
    }
}`
        }
      ]
    }
  }
];
