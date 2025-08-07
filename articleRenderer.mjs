// Article Renderer - handles article processing and rendering logic
import { checkHeadlineForPlayers } from './playerLookup.js';
import { calculateSummaryStats } from './fetchArticles.js';

export function createArticleRow(article) {
  const tr = document.createElement('tr');
  
  // Check if headline mentions any players
  const matchedPlayers = checkHeadlineForPlayers(article.title);
  
  // Create player info display
  let playerInfo = '';
  if (matchedPlayers.length > 0) {
    const playerNames = matchedPlayers.map(p => `${p.forename} ${p.surname}`).join(', ');
    playerInfo = `<div class="player-match" title="Mentioned players: ${playerNames}">
      ⚽ ${matchedPlayers.length} player${matchedPlayers.length > 1 ? 's' : ''}
    </div>`;
  }
  
  tr.innerHTML = `
    <td>
      ${article.title}
      ${playerInfo}
    </td>
    <td>${article.source.title}</td>
    <td>${new Date(article.dateTime).toLocaleString()}</td>
    <td><a href="${article.url}" target="_blank" rel="noopener noreferrer">Link</a></td>
  `;
  
  // Add highlighting to the title if players are mentioned
  if (matchedPlayers.length > 0) {
    tr.classList.add('has-player-mention');
    console.log(`⚽ Article "${article.title}" mentions: ${matchedPlayers.map(p => p.surname).join(', ')}`);
  }
  
  return tr;
}

export function processArticles(articles, sectionMeta, summaryStats = null) {
  console.log('🔄 Processing articles...');
  let newArticlesCount = 0;
  let articlesWithPlayers = 0;

  // Clear display table to show only the 5 most recent
  sectionMeta.tableBody.innerHTML = '';

  articles.forEach((article, index) => {
    console.log(`📝 Adding article ${index + 1}: ${article.title}`);
    const tr = createArticleRow(article);
    
    // Track articles with player mentions
    if (tr.classList.contains('has-player-mention')) {
      articlesWithPlayers++;
    }
    
    sectionMeta.tableBody.appendChild(tr);
    newArticlesCount++;
  });

  // Create or update summary section if stats provided
  if (summaryStats) {
    createOrUpdateSummarySection(sectionMeta, summaryStats);
  }

  console.log(`📊 Displaying ${newArticlesCount} articles`);
  if (summaryStats) {
    console.log(`⚽ ${summaryStats.articlesWithPlayers} total articles mention players`);
  }
  
  return newArticlesCount;
}

function createOrUpdateSummarySection(sectionMeta, summaryStats) {
  // Update header stats
  const totalCountEl = sectionMeta.headerStats.querySelector('.total-count');
  const dateRangeEl = sectionMeta.headerStats.querySelector('.date-range');
  
  if (totalCountEl) totalCountEl.textContent = summaryStats.totalCount;
  if (dateRangeEl) dateRangeEl.textContent = summaryStats.dateRange;
  
  // Update player mentions table
  sectionMeta.playersTableBody.innerHTML = '';
  
  if (summaryStats.playerMentions && summaryStats.playerMentions.length > 0) {
    summaryStats.playerMentions.forEach(playerMention => {
      const tr = document.createElement('tr');
      const isSelected = sectionMeta.selectedPlayers.has(playerMention.playerInfo);
      
      tr.innerHTML = `
        <td class="player-name clickable-player ${isSelected ? 'selected' : ''}" 
            data-player="${playerMention.playerInfo}">
          ${playerMention.playerInfo}
        </td>
        <td class="mention-count">${playerMention.count}</td>
      `;
      
      // Add click event listener for player selection
      const playerCell = tr.querySelector('.clickable-player');
      playerCell.addEventListener('click', () => {
        togglePlayerFilter(sectionMeta, playerMention.playerInfo);
      });
      
      sectionMeta.playersTableBody.appendChild(tr);
    });
  } else {
    // Show "No players mentioned" when there are no player mentions
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td colspan="2" class="no-players">No players mentioned</td>
    `;
    sectionMeta.playersTableBody.appendChild(tr);
  }
}

export function updatePageInfo(sectionMeta) {
  sectionMeta.pageInfo.textContent = `Page ${sectionMeta.currentPage}`;
}

// Toggle player selection for filtering
function togglePlayerFilter(sectionMeta, playerInfo) {
  if (sectionMeta.selectedPlayers.has(playerInfo)) {
    // Remove player from selection
    sectionMeta.selectedPlayers.delete(playerInfo);
  } else {
    // Add player to selection
    sectionMeta.selectedPlayers.add(playerInfo);
  }
  
  // Update filtering state
  sectionMeta.isFiltering = sectionMeta.selectedPlayers.size > 0;
  
  // Re-render articles with filtering applied
  applyPlayerFilter(sectionMeta);
}

// Apply player filtering to articles
function applyPlayerFilter(sectionMeta) {
  let articlesToShow;
  
  if (sectionMeta.isFiltering) {
    // Filter articles to only those mentioning selected players
    const filteredArticles = sectionMeta.allArticles.filter(article => {
      const matchedPlayers = checkHeadlineForPlayers(article.title);
      const playerNames = matchedPlayers.map(p => `${p.name} (${p.team})`);
      
      // Check if any of the matched players are in the selected players set
      return playerNames.some(playerName => sectionMeta.selectedPlayers.has(playerName));
    });
    
    // Apply expanded/collapsed state to filtered articles
    if (sectionMeta.isExpanded) {
      articlesToShow = filteredArticles;
    } else {
      articlesToShow = filteredArticles.slice(0, 5);
    }
  } else {
    // No filtering - show articles based on expanded state
    if (sectionMeta.isExpanded) {
      articlesToShow = sectionMeta.allArticles;
    } else {
      articlesToShow = sectionMeta.allArticles.slice(0, 5);
    }
  }
  
  // Calculate summary stats and re-render
  const summaryStats = calculateSummaryStats(sectionMeta.allArticles, ''); // Keep all player stats
  processArticles(articlesToShow, sectionMeta, summaryStats);
  
  // Update toggle button text based on filtering state
  updateToggleButtonText(sectionMeta, articlesToShow.length);
}

// Update toggle button text to reflect filtering state
export function updateToggleButtonText(sectionMeta, visibleCount) {
  if (sectionMeta.isFiltering) {
    const totalFiltered = sectionMeta.allArticles.filter(article => {
      const matchedPlayers = checkHeadlineForPlayers(article.title);
      const playerNames = matchedPlayers.map(p => `${p.name} (${p.team})`);
      return playerNames.some(playerName => sectionMeta.selectedPlayers.has(playerName));
    }).length;
    
    if (sectionMeta.isExpanded) {
      sectionMeta.btnToggle.textContent = `Show recent only (${totalFiltered} filtered)`;
    } else {
      sectionMeta.btnToggle.textContent = `Show all filtered (${totalFiltered} total)`;
    }
  } else {
    if (sectionMeta.isExpanded) {
      sectionMeta.btnToggle.textContent = 'Show recent only';
    } else {
      sectionMeta.btnToggle.textContent = 'Show all articles';
    }
  }
}
