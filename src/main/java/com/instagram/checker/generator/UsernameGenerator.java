package com.instagram.checker.generator;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Random;

/**
 * Generates random 3-character Instagram usernames.
 * Supports alphanumeric characters (a-z, 0-9) as per Instagram username rules.
 */
public class UsernameGenerator {
    private static final Logger logger = LoggerFactory.getLogger(UsernameGenerator.class);
    private static final String VALID_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";
    private static final int USERNAME_LENGTH = 3;
    private final Random random = new Random();

    /**
     * Generates a random 3-character username.
     * Instagram usernames can contain letters (a-z) and numbers (0-9).
     *
     * @return A randomly generated 3-character username
     */
    public String generateRandomUsername() {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < USERNAME_LENGTH; i++) {
            int randomIndex = random.nextInt(VALID_CHARS.length());
            sb.append(VALID_CHARS.charAt(randomIndex));
        }
        return sb.toString();
    }

    /**
     * Generates a random 3-character username starting with a letter.
     * This is often preferred as it's more likely to be memorable.
     *
     * @return A randomly generated 3-character username starting with a letter
     */
    public String generateUsernameStartingWithLetter() {
        StringBuilder sb = new StringBuilder();
        // First character is always a letter
        sb.append(VALID_CHARS.charAt(random.nextInt(26)));
        // Remaining characters can be letters or numbers
        for (int i = 1; i < USERNAME_LENGTH; i++) {
            sb.append(VALID_CHARS.charAt(random.nextInt(VALID_CHARS.length())));
        }
        return sb.toString();
    }

    /**
     * Generates a batch of random usernames.
     *
     * @param count Number of usernames to generate
     * @return Array of randomly generated usernames
     */
    public String[] generateBatch(int count) {
        String[] usernames = new String[count];
        for (int i = 0; i < count; i++) {
            usernames[i] = generateRandomUsername();
        }
        return usernames;
    }

    /**
     * Validates if a username follows Instagram's rules for 3-character names.
     *
     * @param username Username to validate
     * @return true if valid, false otherwise
     */
    public boolean isValidFormat(String username) {
        if (username == null || username.length() != USERNAME_LENGTH) {
            return false;
        }
        return username.matches("[a-z0-9]+");
    }
}