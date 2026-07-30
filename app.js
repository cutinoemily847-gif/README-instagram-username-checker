// Instagram Username Checker - Frontend Application
// All functionality with client-side processing and local storage

// Data Storage
const storage = {
    favorites: JSON.parse(localStorage.getItem('ig_favorites')) || [],
    cache: JSON.parse(localStorage.getItem('ig_cache')) || {},
};

// UI Elements
const elements = {
    // Search Tab
    keyword: document.getElementById('keyword'),
    lengthMin: document.getElementById('lengthMin'),
    lengthMax: document.getElementById('lengthMax'),
    includeNumbers: document.getElementById('includeNumbers'),
    includeLetters: document.getElementById('includeLetters'),
    exotic: document.getElementById('exotic'),
    searchBtn: document.getElementById('searchBtn'),
    searchResults: document.getElementById('searchResults'),
    resultsList: document.getElementById('resultsList'),
    resultCount: document.getElementById('resultCount'),
    searchLoading: document.getElementById('searchLoading'),
    noResults: document.getElementById('noResults'),

    // Browse Tab
    browseLength: document.getElementById('browseLength'),
    browseType: document.getElementById('browseType'),
    browseBtn: document.getElementById('browseBtn'),
    browseResults: document.getElementById('browseResults'),
    browseList: document.getElementById('browseList'),
    browseCount: document.getElementById('browseCount'),
    browseLoading: document.getElementById('browseLoading'),

    // Advanced Tab
    singleUsername: document.getElementById('singleUsername'),
    checkSingleBtn: document.getElementById('checkSingleBtn'),
    singleResult: document.getElementById('singleResult'),
    bulkInput: document.getElementById('bulkInput'),
    checkBulkBtn: document.getElementById('checkBulkBtn'),
    bulkResults: document.getElementById('bulkResults'),
    bulkList: document.getElementById('bulkList'),
    similarBase: document.getElementById('similarBase'),
    generateSimilarBtn: document.getElementById('generateSimilarBtn'),
    similarResults: document.getElementById('similarResults'),
    similarList: document.getElementById('similarList'),

    // Favorites
    favoritesList: document.getElementById('favoritesList'),
    exportBtn: document.getElementById('exportBtn'),

    // Tabs
    tabBtns: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    updateFavoritesDisplay();
    loadPresets();
});

// Event Listeners
function setupEventListeners() {
    // Tab switching
    elements.tabBtns.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn));
    });

    // Search Tab
    elements.searchBtn.addEventListener('click', performSearch);

    // Browse Tab
    elements.browseBtn.addEventListener('click', browseShorties);

    // Advanced Tab
    elements.checkSingleBtn.addEventListener('click', checkSingleUsername);
    elements.checkBulkBtn.addEventListener('click', checkBulkUsernames);
    elements.generateSimilarBtn.addEventListener('click', generateSimilarUsernames);

    // Favorites
    elements.exportBtn.addEventListener('click', exportFavorites);
}

// Tab Switching
function switchTab(btn) {
    const tabName = btn.getAttribute('data-tab');

    elements.tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    elements.tabContents.forEach(content => content.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
}

// ============================================
// SEARCH FUNCTIONALITY
// ============================================

async function performSearch() {
    const keyword = elements.keyword.value.trim().toLowerCase();
    const minLength = parseInt(elements.lengthMin.value);
    const maxLength = parseInt(elements.lengthMax.value);
    const includeNumbers = elements.includeNumbers.checked;
    const includeLetters = elements.includeLetters.checked;
    const exoticOnly = elements.exotic.checked;

    if (minLength > maxLength) {
        alert('Minimum length cannot be greater than maximum length');
        return;
    }

    showElement(elements.searchLoading);
    hideElement(elements.searchResults);
    hideElement(elements.noResults);

    try {
        const results = generateUsernamesByKeyword(
            keyword,
            minLength,
            maxLength,
            includeLetters,
            includeNumbers,
            exoticOnly
        );

        hideElement(elements.searchLoading);

        if (results.length === 0) {
            showElement(elements.noResults);
        } else {
            displaySearchResults(results);
        }
    } catch (error) {
        console.error('Search error:', error);
        hideElement(elements.searchLoading);
        alert('Error during search. Please try again.');
    }
}

function generateUsernamesByKeyword(keyword, minLen, maxLen, letters, numbers, exotic) {
    const results = [];

    // If keyword provided, generate variations
    if (keyword.length > 0) {
        // Direct keyword
        if (keyword.length >= minLen && keyword.length <= maxLen) {
            results.push(keyword);
        }

        // Keyword + numbers
        if (numbers) {
            for (let i = 0; i <= 99; i++) {
                const username = keyword + i;
                if (username.length >= minLen && username.length <= maxLen) {
                    results.push(username);
                }
            }

            // Number + keyword
            for (let i = 0; i <= 9; i++) {
                const username = i + keyword;
                if (username.length >= minLen && username.length <= maxLen) {
                    results.push(username);
                }
            }
        }

        // Keyword with vowel removals (exotic variations)
        if (exotic && keyword.length > 2) {
            const noVowels = keyword.replace(/[aeiou]/g, '');
            if (noVowels.length >= minLen && noVowels.length <= maxLen) {
                results.push(noVowels);
            }

            // Add underscores
            const withUnderscore = keyword.replace(/(.)/g, '$1_').slice(0, -1);
            if (withUnderscore.length >= minLen && withUnderscore.length <= maxLen) {
                results.push(withUnderscore.replace(/_/g, ''));
            }
        }
    } else {
        // No keyword - generate from scratch
        results.push(...generateShortUsernames(minLen, maxLen, letters, numbers, exotic));
    }

    // Remove duplicates and sort
    return [...new Set(results)].sort();
}

function displaySearchResults(usernames) {
    elements.resultsList.innerHTML = '';
    elements.resultCount.textContent = usernames.length;

    usernames.slice(0, 100).forEach(username => {
        const card = createUsernameCard(username);
        elements.resultsList.appendChild(card);
    });

    showElement(elements.searchResults);
}

// ============================================
// BROWSE FUNCTIONALITY
// ============================================

function browseShorties() {
    const length = elements.browseLength.value;
    const type = elements.browseType.value;

    showElement(elements.browseLoading);
    hideElement(elements.browseResults);

    setTimeout(() => {
        const usernames = generateShortUsernames(
            length === 'all' ? 1 : parseInt(length),
            length === 'all' ? 5 : parseInt(length),
            type !== 'numbers',
            type !== 'letters',
            true
        );

        hideElement(elements.browseLoading);
        displayBrowseResults(usernames.slice(0, 50));
    }, 500);
}

function displayBrowseResults(usernames) {
    elements.browseList.innerHTML = '';
    elements.browseCount.textContent = usernames.length;

    usernames.forEach(username => {
        const card = createUsernameCard(username);
        elements.browseList.appendChild(card);
    });

    showElement(elements.browseResults);
}

function generateShortUsernames(minLen, maxLen, letters = true, numbers = true, exotic = true) {
    const results = [];

    // Generate based on length and type
    for (let len = minLen; len <= maxLen; len++) {
        if (letters && !numbers) {
            // Only letters
            results.push(...generateLetterCombos(len));
        } else if (numbers && !letters) {
            // Only numbers
            results.push(...generateNumberCombos(len));
        } else if (letters && numbers) {
            // Mixed
            results.push(...generateMixedCombos(len));
        }
    }

    // Filter to exotics if needed
    if (exotic) {
        return results.filter(u => isExotic(u)).slice(0, 500);
    }

    return results.slice(0, 500);
}

function generateLetterCombos(length) {
    const results = [];
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    const exotic = ['x', 'z', 'q', 'k', 'v', 'w', 'y'];

    if (length === 1) {
        return exotic;
    }

    if (length === 2) {
        for (let i = 0; i < exotic.length; i++) {
            for (let j = 0; j < exotic.length; j++) {
                results.push(exotic[i] + exotic[j]);
            }
        }
    } else if (length === 3) {
        const combinations = ['xyz', 'zyx', 'qwe', 'asx', 'qaz', 'wsx', 'xyw', 'zyx', 'xyza', 'zxq'];
        results.push(...combinations);
    }

    return results;
}

function generateNumberCombos(length) {
    const results = [];
    const rarNumbers = ['1', '3', '7', '8', '9'];

    if (length === 1) {
        return rarNumbers;
    }

    if (length === 2) {
        for (let i = 0; i < rarNumbers.length; i++) {
            for (let j = 0; j < rarNumbers.length; j++) {
                results.push(rarNumbers[i] + rarNumbers[j]);
            }
        }
    } else if (length === 3) {
        results.push('123', '321', '777', '888', '999', '111', '133', '177', '188', '199');
    }

    return results;
}

function generateMixedCombos(length) {
    const results = [];
    const seeds = ['x1', 'z9', 'q7', 'w1', 'k1', 'v8', 'x9z', 'z1x', 'q1w', 'k9v'];

    seeds.forEach(seed => {
        if (seed.length === length) {
            results.push(seed);
        }
    });

    return results;
}

function isExotic(username) {
    const exoticChars = /[xzqkvwyjb123789]/i;
    const vowelHeavy = /[aeiou]{2,}/i;

    return exoticChars.test(username) && !vowelHeavy.test(username);
}

// ============================================
// ADVANCED TOOLS
// ============================================

async function checkSingleUsername() {
    const username = elements.singleUsername.value.trim();

    if (!username) {
        alert('Please enter a username');
        return;
    }

    const result = await checkInstagramUsername(username);
    displaySingleResult(username, result);
}

async function checkBulkUsernames() {
    const input = elements.bulkInput.value.trim();

    if (!input) {
        alert('Please enter usernames');
        return;
    }

    const usernames = input.split('\n').map(u => u.trim()).filter(u => u.length > 0);
    showElement(elements.bulkResults);
    elements.bulkList.innerHTML = '<div class="loading"><div class="spinner"></div><p>Checking usernames...</p></div>';

    const results = [];
    for (const username of usernames) {
        const available = await checkInstagramUsername(username);
        results.push({ username, available });
        await delay(200); // Rate limiting
    }

    displayBulkResults(results);
}

async function generateSimilarUsernames() {
    const base = elements.similarBase.value.trim();

    if (!base) {
        alert('Please enter a base username');
        return;
    }

    const similar = generateSimilarVariations(base);
    elements.similarList.innerHTML = '';

    similar.forEach(username => {
        const card = createUsernameCard(username);
        elements.similarList.appendChild(card);
    });

    showElement(elements.similarResults);
}

function generateSimilarVariations(base) {
    const results = [base];

    // Add numbers
    for (let i = 1; i <= 9; i++) {
        results.push(base + i);
        results.push(i + base);
    }

    // Add underscores
    results.push('_' + base);
    results.push(base + '_');
    results.push('_' + base + '_');

    // Add dots
    results.push('.' + base);
    results.push(base + '.');

    // Abbreviations
    if (base.length > 3) {
        results.push(base.substring(0, 3));
        results.push(base.substring(0, 4));
    }

    // Reverse
    results.push(base.split('').reverse().join(''));

    return [...new Set(results)].filter(u => u.length >= 1 && u.length <= 30);
}

// ============================================
// USERNAME CARD CREATION
// ============================================

function createUsernameCard(username) {
    const card = document.createElement('div');
    card.className = 'username-card';

    const isFavorited = storage.favorites.includes(username);

    card.innerHTML = `
        <button class="favorite-btn ${isFavorited ? 'favorited' : ''}">♡</button>
        <div class="username">@${username}</div>
        <div class="status available">Available*</div>
        <div class="actions">
            <button class="copy-btn">Copy</button>
            <button class="insta-btn">Visit IG</button>
        </div>
    `;

    // Copy button
    card.querySelector('.copy-btn').addEventListener('click', () => {
        copyToClipboard(username);
    });

    // Instagram button
    card.querySelector('.insta-btn').addEventListener('click', () => {
        window.open(`https://instagram.com/${username}/`, '_blank');
    });

    // Favorite button
    card.querySelector('.favorite-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(username);
        card.querySelector('.favorite-btn').classList.toggle('favorited');
        updateFavoritesDisplay();
    });

    return card;
}

function displaySingleResult(username, available) {
    const resultCard = elements.singleResult;
    resultCard.className = 'result-card ' + (available ? 'available' : 'taken');
    resultCard.innerHTML = `
        <div class="username">@${username}</div>
        <div style="margin-top: 10px; font-size: 1.1em;">
            ${available ? '✅ This username is likely available!' : '❌ This username is likely taken'}
        </div>
        <div style="margin-top: 15px; font-size: 0.9em;">
            *Check Instagram directly to confirm availability
        </div>
    `;
    showElement(resultCard);
}

function displayBulkResults(results) {
    elements.bulkList.innerHTML = '';

    results.forEach(({ username, available }) => {
        const card = document.createElement('div');
        card.className = 'result-card ' + (available ? 'available' : 'taken');
        card.innerHTML = `
            <div style="font-weight: 600;">@${username}</div>
            <div style="font-size: 0.9em; margin-top: 5px;">
                ${available ? '✅ Available' : '❌ Taken'}
            </div>
        `;
        elements.bulkList.appendChild(card);
    });
}

// ============================================
// FAVORITES MANAGEMENT
// ============================================

function toggleFavorite(username) {
    const index = storage.favorites.indexOf(username);
    if (index > -1) {
        storage.favorites.splice(index, 1);
    } else {
        storage.favorites.push(username);
    }
    saveFavorites();
}

function updateFavoritesDisplay() {
    elements.favoritesList.innerHTML = '';

    if (storage.favorites.length === 0) {
        elements.favoritesList.innerHTML = '<p class="empty-message">No favorites yet. Click the heart icon to save usernames!</p>';
        elements.exportBtn.style.display = 'none';
        return;
    }

    storage.favorites.forEach(username => {
        const card = createUsernameCard(username);
        elements.favoritesList.appendChild(card);
    });

    elements.exportBtn.style.display = 'inline-block';
}

function saveFavorites() {
    localStorage.setItem('ig_favorites', JSON.stringify(storage.favorites));
}

function exportFavorites() {
    if (storage.favorites.length === 0) {
        alert('No favorites to export');
        return;
    }

    const content = storage.favorites.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ig-usernames-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

// ============================================
// INSTAGRAM API CHECK (Simulated)
// ============================================

async function checkInstagramUsername(username) {
    // Simulated check - in production, this would call a backend API
    // For now, we simulate a 70% availability rate for demo purposes

    if (storage.cache[username] !== undefined) {
        return storage.cache[username];
    }

    const available = Math.random() > 0.3; // 70% available, 30% taken
    storage.cache[username] = available;
    localStorage.setItem('ig_cache', JSON.stringify(storage.cache));

    return available;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Copied: @' + text);
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

function showElement(el) {
    if (el) el.style.display = '';
}

function hideElement(el) {
    if (el) el.style.display = 'none';
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function loadPresets() {
    // Load some default short usernames for demo
    console.log('Instagram Username Checker loaded!');
    console.log('Favorites:', storage.favorites);
}

// Console helpers
console.log('Instagram Username Checker - Ready!');
console.log('Type help() for available commands');

function help() {
    console.log(`
    Available Commands:
    - storage.favorites: View all saved favorites
    - storage.cache: View checked usernames cache
    - exportFavorites(): Download favorites as .txt
    `);
}

window.help = help;
