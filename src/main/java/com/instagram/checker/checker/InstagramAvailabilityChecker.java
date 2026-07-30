package com.instagram.checker.checker;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

/**
 * Checks Instagram username availability using Instagram's public API.
 * Makes requests to Instagram's GraphQL endpoint to determine if usernames are taken.
 */
public class InstagramAvailabilityChecker {
    private static final Logger logger = LoggerFactory.getLogger(InstagramAvailabilityChecker.class);
    private static final String INSTAGRAM_API_URL = "https://www.instagram.com/api/v1/users/search/";
    private static final String USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
    private static final int TIMEOUT_SECONDS = 10;
    private final OkHttpClient httpClient;

    public InstagramAvailabilityChecker() {
        this.httpClient = new OkHttpClient.Builder()
                .connectTimeout(TIMEOUT_SECONDS, TimeUnit.SECONDS)
                .readTimeout(TIMEOUT_SECONDS, TimeUnit.SECONDS)
                .writeTimeout(TIMEOUT_SECONDS, TimeUnit.SECONDS)
                .build();
    }

    /**
     * Checks if a username is available on Instagram.
     *
     * @param username The username to check
     * @return true if the username is available, false if it's taken
     */
    public boolean isAvailable(String username) {
        try {
            return checkUsernameAvailability(username);
        } catch (IOException e) {
            logger.warn("Error checking username '{}': {}", username, e.getMessage());
            return false;
        } catch (Exception e) {
            logger.error("Unexpected error checking username '{}'", username, e);
            return false;
        }
    }

    /**
     * Internal method to check username availability.
     *
     * @param username The username to check
     * @return true if available, false if taken
     * @throws IOException If the request fails
     */
    private boolean checkUsernameAvailability(String username) throws IOException {
        String url = INSTAGRAM_API_URL + "?ig_sig_key_version=4&" +
                "qs_by_static_inline=&count=30&search_surface=user_search_typeahead" +
                "&logged_in_uid=0&rank_token=&query=" + username;

        Request request = new Request.Builder()
                .url(url)
                .header("User-Agent", USER_AGENT)
                .header("X-Requested-With", "XMLHttpRequest")
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                logger.debug("Instagram returned status code: {} for username: {}", response.code(), username);
                return false;
            }

            String responseBody = response.body() != null ? response.body().string() : "";
            return isUsernameAvailableFromResponse(responseBody, username);
        }
    }

    /**
     * Parses Instagram's response to determine if username is available.
     *
     * @param responseBody The JSON response from Instagram
     * @param username The username that was checked
     * @return true if the username doesn't appear in results (available), false otherwise
     */
    private boolean isUsernameAvailableFromResponse(String responseBody, String username) {
        try {
            JsonObject jsonObject = JsonParser.parseString(responseBody).getAsJsonObject();

            // Check if the response indicates the user doesn't exist
            if (jsonObject.has("users")) {
                int usersCount = jsonObject.getAsJsonArray("users").size();
                if (usersCount == 0) {
                    return true; // No users found - username is available
                }

                // Check if any of the found users exactly match the searched username
                return !jsonObject.getAsJsonArray("users")
                        .getAsJsonArray()
                        .stream()
                        .anyMatch(user -> {
                            try {
                                return user.getAsJsonObject()
                                        .get("username")
                                        .getAsString()
                                        .equalsIgnoreCase(username);
                            } catch (Exception e) {
                                return false;
                            }
                        });
            }
        } catch (Exception e) {
            logger.debug("Error parsing Instagram response for username: {}", username, e);
        }

        // If we can't parse the response, assume unavailable
        return false;
    }
}