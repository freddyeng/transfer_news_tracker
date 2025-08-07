// DOM Helpers - functions for creating and managing DOM elements
export function createQuerySection(queryKey, value) {
  const container = document.querySelector('.articles-grid');
  
  // Create section for this query
  const section = document.createElement('div');
  section.className = 'article-section';
  
  // Create header with query info and stats
  const headerContainer = document.createElement('div');
  headerContainer.className = 'section-header';
  
  const headerText = document.createElement('h3');
  headerText.textContent = `Results for: ${value}`;
  headerContainer.appendChild(headerText);
  
  const statsBox = document.createElement('div');
  statsBox.className = 'header-stats';
  statsBox.innerHTML = `
    <span class="stat-item"><strong>Total:</strong> <span class="total-count">0</span></span>
    <span class="stat-item"><strong>Date Range:</strong> <span class="date-range">Loading...</span></span>
  `;
  headerContainer.appendChild(statsBox);
  
  section.appendChild(headerContainer);
  
  // Create main content container (articles + players side by side)
  const contentContainer = document.createElement('div');
  contentContainer.className = 'content-container';
  
  // Create articles container (left side)
  const articlesContainer = document.createElement('div');
  articlesContainer.className = 'articles-container';
  
  // Create table for results
  const table = document.createElement('table');
  table.className = 'results-table';
  
  // Add table header
  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th>Title</th>
      <th>Source</th>
      <th>Date</th>
      <th>Link</th>
    </tr>
  `;
  table.appendChild(thead);
  
  // Add table body
  const tbody = document.createElement('tbody');
  table.appendChild(tbody);
  articlesContainer.appendChild(table);
  
  // Create players container (right side)
  const playersContainer = document.createElement('div');
  playersContainer.className = 'players-container';
  
  // Create players table (no header, styled like articles table)
  const playersTable = document.createElement('table');
  playersTable.className = 'results-table';
  
  // Add players table header
  const playersThead = document.createElement('thead');
  playersThead.innerHTML = `
    <tr>
      <th>Player</th>
      <th>Mentions</th>
    </tr>
  `;
  playersTable.appendChild(playersThead);
  
  // Add players table body
  const playersTbody = document.createElement('tbody');
  playersTable.appendChild(playersTbody);
  playersContainer.appendChild(playersTable);
  
  // Add both containers to content container
  contentContainer.appendChild(articlesContainer);
  contentContainer.appendChild(playersContainer);
  
  // Add content container to section
  section.appendChild(contentContainer);
  
  // Add button container for better layout
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'button-container';
  
  // Add "See more" button
  const btnMore = document.createElement('button');
  btnMore.textContent = 'See more';
  btnMore.className = 'btn-more';
  buttonContainer.appendChild(btnMore);
  
  // Add expand/collapse button
  const btnToggle = document.createElement('button');
  btnToggle.textContent = 'Show all articles';
  btnToggle.className = 'btn-toggle';
  buttonContainer.appendChild(btnToggle);
  
  // Add page info
  const pageInfo = document.createElement('span');
  pageInfo.className = 'page-info';
  pageInfo.textContent = 'Page 1';
  buttonContainer.appendChild(pageInfo);
  
  articlesContainer.appendChild(buttonContainer);
  
  // Add section to container
  container.appendChild(section);
  
  // Return metadata for this section
  return {
    section: section,
    tableBody: tbody,
    playersTableBody: playersTbody,
    headerStats: statsBox,
    btnMore: btnMore,
    btnToggle: btnToggle,
    pageInfo: pageInfo,
    currentPage: 1,
    loadedTitles: new Set(),
    allArticles: [], // Store all articles, but only display 5 most recent
    isExpanded: false, // Track if showing all articles or just 5
    selectedPlayers: new Set(), // Track selected players for filtering
    isFiltering: false // Track if filtering is active
  };
}
