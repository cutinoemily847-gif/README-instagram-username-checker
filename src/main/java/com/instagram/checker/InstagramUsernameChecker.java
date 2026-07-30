package com.instagram.checker;

import com.instagram.checker.generator.UsernameGenerator;
import com.instagram.checker.checker.InstagramAvailabilityChecker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Scanner;

/**
 * Main entry point for Instagram username availability checker.
 * Generates random 3-character usernames and checks their availability on Instagram.
 */
public class InstagramUsernameChecker {
    private static final Logger logger = LoggerFactory.getLogger(InstagramUsernameChecker.class);

    public static void main(String[] args) {
        logger.info("Starting Instagram Username Checker...");

        UsernameGenerator generator = new UsernameGenerator();
        InstagramAvailabilityChecker checker = new InstagramAvailabilityChecker();

        Scanner scanner = new Scanner(System.in);
        boolean running = true;

        System.out.println("\n=== Instagram 3-Character Username Checker ===");
        System.out.println("Commands:");
        System.out.println("  'check' - Check a specific username");
        System.out.println("  'generate' - Generate and check random usernames");
        System.out.println("  'batch' - Batch check multiple random usernames");
        System.out.println("  'exit' - Exit the program");
        System.out.println("====================================");

        while (running) {
            System.out.print("> ");
            String command = scanner.nextLine().trim().toLowerCase();

            switch (command) {
                case "check":
                    handleCheckCommand(scanner, checker);
                    break;
                case "generate":
                    handleGenerateCommand(generator, checker);
                    break;
                case "batch":
                    handleBatchCommand(scanner, generator, checker);
                    break;
                case "exit":
                    running = false;
                    System.out.println("Goodbye!");
                    break;
                default:
                    System.out.println("Unknown command. Try 'check', 'generate', 'batch', or 'exit'.");
            }
        }

        scanner.close();
    }

    private static void handleCheckCommand(Scanner scanner, InstagramAvailabilityChecker checker) {
        System.out.print("Enter username to check: ");
        String username = scanner.nextLine().trim();

        if (username.length() != 3) {
            System.out.println("Username must be exactly 3 characters long.");
            return;
        }

        System.out.println("Checking availability for '@" + username + "'...");
        boolean available = checker.isAvailable(username);
        displayResult(username, available);
    }

    private static void handleGenerateCommand(UsernameGenerator generator, InstagramAvailabilityChecker checker) {
        String username = generator.generateRandomUsername();
        System.out.println("Generated username: @" + username);
        System.out.println("Checking availability...");
        boolean available = checker.isAvailable(username);
        displayResult(username, available);
    }

    private static void handleBatchCommand(Scanner scanner, UsernameGenerator generator, InstagramAvailabilityChecker checker) {
        System.out.print("How many usernames to check? ");
        try {
            int count = Integer.parseInt(scanner.nextLine().trim());
            if (count <= 0 || count > 1000) {
                System.out.println("Please enter a number between 1 and 1000.");
                return;
            }

            System.out.println("\nChecking " + count + " random usernames...");
            int available = 0;
            int taken = 0;

            for (int i = 0; i < count; i++) {
                String username = generator.generateRandomUsername();
                boolean isAvailable = checker.isAvailable(username);
                if (isAvailable) {
                    available++;
                    System.out.println("[AVAILABLE] @" + username);
                } else {
                    taken++;
                }

                // Add slight delay to avoid rate limiting
                if (i % 10 == 0 && i > 0) {
                    try {
                        Thread.sleep(500);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    }
                }
            }

            System.out.println("\n--- Results ---");
            System.out.println("Total checked: " + count);
            System.out.println("Available: " + available);
            System.out.println("Taken: " + taken);
            System.out.println("Availability rate: " + String.format("%.2f%%", (available * 100.0) / count));
        } catch (NumberFormatException e) {
            System.out.println("Invalid number. Please try again.");
        }
    }

    private static void displayResult(String username, boolean available) {
        if (available) {
            System.out.println("✓ @" + username + " is AVAILABLE!");
        } else {
            System.out.println("✗ @" + username + " is TAKEN.");
        }
        System.out.println();
    }
}