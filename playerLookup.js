// Player Lookup Module - manages player data and provides efficient surname matching
class PlayerLookup {
  constructor() {
    this.surnameMap = new Map(); // O(1) lookups
    this.isLoaded = false;
    this.loadingPromise = null;
  }

  async initialize() {
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = this._loadPlayerData();
    return this.loadingPromise;
  }

  async _loadPlayerData() {
    try {
      const response = await fetch('/players-by-team.json');
      if (!response.ok) {
        throw new Error(`Failed to load players-by-team.json: ${response.status} ${response.statusText}`);
      }
      
      const playersByTeam = await response.json();
      
      // Convert players-by-team format to flat array of players
      const allPlayers = [];
      for (const [team, players] of Object.entries(playersByTeam)) {
        players.forEach(player => {
          const [firstName, ...lastNameParts] = player.name.split(' ');
          allPlayers.push({
            name: player.name,
            forename: firstName,
            surname: lastNameParts.join(' '),
            team: player.team,
            position: player.position,
            league: player.league
          });
        });
      }

      this._buildSurnameMap(allPlayers);
      this.isLoaded = true;
      console.log(`✅ Loaded ${allPlayers.length} players into lookup map`);
    } catch (error) {
      console.error('❌ Failed to load player data:', error);
      throw error;
    }
  }

  _buildSurnameMap(players) {
    this.surnameMap.clear();
    
    players.forEach(player => {
      if (player.surname && typeof player.surname === 'string') {
        const surname = player.surname.toLowerCase().trim();
        if (surname) {
          const playerData = {
            name: player.name,
            forename: player.forename || '',
            surname: player.surname,
            team: player.team,
            position: player.position,
            league: player.league
          };

          // Store under original surname
          if (!this.surnameMap.has(surname)) {
            this.surnameMap.set(surname, []);
          }
          this.surnameMap.get(surname).push(playerData);

          // Also store under normalized surname if different
          const normalizedSurname = this._normalizeText(surname);
          if (normalizedSurname !== surname) {
            if (!this.surnameMap.has(normalizedSurname)) {
              this.surnameMap.set(normalizedSurname, []);
            }
            this.surnameMap.get(normalizedSurname).push(playerData);
          }
        }
      }
    });

    console.log(`📊 Built surname map with ${this.surnameMap.size} unique surnames (including normalized variants)`);
  }

  checkHeadlineForPlayers(headline) {
    if (!this.isLoaded || !headline || typeof headline !== 'string') {
      return [];
    }

    const matchedPlayers = [];
    const seenPlayers = new Set(); // Prevent duplicates
    const fullNameMatches = new Set(); // Track surnames with full name matches

    // First pass: Check for full name matches (first name + surname)
    for (const [surname, players] of this.surnameMap) {
      players.forEach(player => {
        if (player.forename) {
          // Check for full name match (first + last)
          const fullName = `${player.forename} ${player.surname}`;
          const fullNameNormalized = this._normalizeText(fullName);
          const headlineNormalized = this._normalizeText(headline);
          
          const fullNameRegex = new RegExp(`\\b${this._escapeRegex(fullName)}\\b`, 'i');
          const fullNameNormalizedRegex = new RegExp(`\\b${this._escapeRegex(fullNameNormalized)}\\b`, 'i');
          
          if (fullNameRegex.test(headline) || fullNameNormalizedRegex.test(headlineNormalized)) {
            const playerKey = `${player.name}-${player.team}`;
            if (!seenPlayers.has(playerKey)) {
              seenPlayers.add(playerKey);
              matchedPlayers.push(player);
              // Mark this surname as having a full name match
              fullNameMatches.add(surname.toLowerCase());
              fullNameMatches.add(this._normalizeText(surname));
              
              // Also mark any words within hyphenated surnames to prevent partial matches
              // e.g., if "Lewis-Skelly" matches, also block "Lewis" and "Skelly"
              const surnameWords = surname.split(/[-\s]+/);
              surnameWords.forEach(word => {
                if (word.trim()) {
                  fullNameMatches.add(word.toLowerCase().trim());
                  fullNameMatches.add(this._normalizeText(word.trim()));
                }
              });
            }
          }
        }
      });
    }

    // Second pass: Check for surname-only matches, but skip if we found a full name match for this surname
    for (const [surname, players] of this.surnameMap) {
      const surnameKey = surname.toLowerCase();
      const surnameNormalizedKey = this._normalizeText(surname);
      
      // Skip if we already found a full name match for this surname
      if (fullNameMatches.has(surnameKey) || fullNameMatches.has(surnameNormalizedKey)) {
        continue;
      }

      const regex = new RegExp(`\\b${this._escapeRegex(surname)}\\b`, 'i');
      if (regex.test(headline)) {
        players.forEach(player => {
          const playerKey = `${player.name}-${player.team}`;
          if (!seenPlayers.has(playerKey)) {
            seenPlayers.add(playerKey);
            matchedPlayers.push(player);
          }
        });
      }
    }

    return matchedPlayers;
  }

  _escapeRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  _normalizeText(text) {
    // Normalize text by removing accents, umlauts, and other diacritics
    return text
      .normalize('NFD') // Decompose characters with accents
      .replace(/[\u0300-\u036f]/g, '') // Remove combining diacritical marks
      .toLowerCase()
      .trim();
  }

  getStats() {
    return {
      isLoaded: this.isLoaded,
      uniqueSurnames: this.surnameMap.size,
      totalPlayers: Array.from(this.surnameMap.values()).reduce((sum, players) => sum + players.length, 0)
    };
  }
}

// Create singleton instance
const playerLookup = new PlayerLookup();

// Export functions for use by other modules
export async function initializePlayerLookup() {
  return playerLookup.initialize();
}

export function checkHeadlineForPlayers(headline) {
  return playerLookup.checkHeadlineForPlayers(headline);
}

export function getPlayerLookupStats() {
  return playerLookup.getStats();
}
