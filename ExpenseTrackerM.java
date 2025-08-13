import java.util.*;

class Expense {
    private String date;
    private String category;
    private double amount;
    private String description;

    public Expense(String date, String category, double amount, String description) {
        this.date = date;
        this.category = category;
        this.amount = amount;
        this.description = description;
    }

    public double getAmount() {
        return amount;
    }

    public String getCategory() {
        return category;
    }

    public String getDescription() {
        return description;
    }

    @Override
    public String toString() {
        return String.format("Date: %s | Category: %s | Amount: %.2f | Note: %s",
                date, category, amount, description);
    }
}

public class ExpenseTrackerM {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        List<Expense> expenses = new ArrayList<>();

        while (true) {
            System.out.println("\n=== Expense Tracker ===");
            System.out.println("1. Add Expense");
            System.out.println("2. View Expenses");
            System.out.println("3. Delete Expense");
            System.out.println("4. Exit");
            System.out.println("5. Total Spending");
            System.out.println("6. Highest & Lowest Expense");
            System.out.println("7. Search Expenses");
            System.out.print("Choose option: ");
            int choice = sc.nextInt();
            sc.nextLine(); // consume newline

            switch (choice) {
                case 1:
                    System.out.print("Enter date (YYYY-MM-DD): ");
                    String date = sc.nextLine();
                    System.out.print("Enter category: ");
                    String category = sc.nextLine();

                    // Validate amount
                    double amount;
                    while (true) {
                        System.out.print("Enter amount: ");
                        if (sc.hasNextDouble()) {
                            amount = sc.nextDouble();
                            sc.nextLine(); // consume newline
                            if (amount > 0) {
                                break; // valid amount
                            } else {
                                System.out.println("Amount must be positive. Try again.");
                            }
                        } else {
                            System.out.println("Invalid input. Please enter a number.");
                            sc.nextLine(); // clear invalid input
                        }
                    }

                    System.out.print("Enter description: ");
                    String desc = sc.nextLine();

                    expenses.add(new Expense(date, category, amount, desc));
                    System.out.println("Expense added.");
                    break;

                case 2:
                    if (expenses.isEmpty()) {
                        System.out.println("No expenses found.");
                    } else {
                        System.out.println("\n--- Expenses ---");
                        for (int i = 0; i < expenses.size(); i++) {
                            System.out.println((i + 1) + ". " + expenses.get(i));
                        }
                    }
                    break;

                case 3:
                    if (expenses.isEmpty()) {
                        System.out.println("No expenses to delete.");
                    } else {
                        System.out.print("Enter expense number to delete: ");
                        int index = sc.nextInt() - 1;
                        sc.nextLine(); // consume newline
                        if (index >= 0 && index < expenses.size()) {
                            expenses.remove(index);
                            System.out.println("Expense deleted.");
                        } else {
                            System.out.println("Invalid number.");
                        }
                    }
                    break;

                case 4:
                    System.out.println("Exiting... Goodbye!");
                    sc.close();
                    return;

                case 5: // Total Spending
                    double total = 0;
                    for (Expense e : expenses) {
                        total += e.getAmount();
                    }
                    System.out.printf("Total Spending: %.2f%n", total);
                    break;

                case 6: // Highest & Lowest
                    if (expenses.isEmpty()) {
                        System.out.println("No expenses available.");
                    } else {
                        Expense max = Collections.max(expenses, Comparator.comparingDouble(Expense::getAmount));
                        Expense min = Collections.min(expenses, Comparator.comparingDouble(Expense::getAmount));
                        System.out.println("Highest Expense: " + max);
                        System.out.println("Lowest Expense: " + min);
                    }
                    break;

                case 7: // Search
                    if (expenses.isEmpty()) {
                        System.out.println("No expenses to search.");
                    } else {
                        System.out.print("Enter keyword to search: ");
                        String keyword = sc.nextLine().toLowerCase();
                        boolean found = false;
                        for (Expense e : expenses) {
                            if (e.getCategory().toLowerCase().contains(keyword) ||
                                e.getDescription().toLowerCase().contains(keyword)) {
                                System.out.println(e);
                                found = true;
                            }
                        }
                        if (!found) {
                            System.out.println("No matching expenses found.");
                        }
                    }
                    break;

                default:
                    System.out.println("Invalid option.");
            }
        }
    }
}
