// Main Application Logic
import { getQueryKey } from './queryStore.js';
import { createQuerySection } from './domHelpers.js';
import { fetchAndAppend } from './fetchArticles.js';
import { ResponseManager } from './responseManager.js';
import { processArticles, updateToggleButtonText } from './articleRenderer.mjs';
import { calculateSummaryStats } from './fetchArticles.js';
import { initializeUIHandlers } from './uiHandlers.js';
import { initializePlayerLookup, checkHeadlineForPlayers } from './playerLookup.js';

const queryTables = {};
const responseManager = new ResponseManager();

// Toggle between showing 5 recent articles vs all articles
function toggleArticleView(queryKey, sectionMeta) {
  const paramsObj = JSON.parse(queryKey);
  const keyword = paramsObj.keyword || '';
  
  // Toggle the expanded state
  sectionMeta.isExpanded = !sectionMeta.isExpanded;
  
  let articlesToShow;
  if (sectionMeta.isFiltering) {
    // Apply filtering first
    const filteredArticles = sectionMeta.allArticles.filter(article => {
      const matchedPlayers = checkHeadlineForPlayers(article.title);
      const playerNames = matchedPlayers.map(p => `${p.name} (${p.team})`);
      return playerNames.some(playerName => sectionMeta.selectedPlayers.has(playerName));
    });
    
    if (sectionMeta.isExpanded) {
      articlesToShow = filteredArticles;
      console.log(`📖 Expanding to show all ${filteredArticles.length} filtered articles`);
    } else {
      articlesToShow = filteredArticles.slice(0, 5);
      console.log(`📑 Collapsing to show 5 most recent filtered articles`);
    }
  } else {
    // No filtering - show all or recent
    if (sectionMeta.isExpanded) {
      articlesToShow = sectionMeta.allArticles;
      console.log(`📖 Expanding to show all ${sectionMeta.allArticles.length} articles`);
    } else {
      articlesToShow = sectionMeta.allArticles.slice(0, 5);
      console.log(`📑 Collapsing to show 5 most recent articles`);
    }
  }
  
  // Calculate summary stats and re-render
  const summaryStats = calculateSummaryStats(sectionMeta.allArticles, keyword);
  processArticles(articlesToShow, sectionMeta, summaryStats);
  
  // Update button text to reflect current state
  updateToggleButtonText(sectionMeta, articlesToShow.length);
}

// Initialize player lookup system at startup
console.log('🏈 Initializing player lookup system...');
initializePlayerLookup()
  .then(() => {
    console.log('✅ Player lookup system ready');
  })
  .catch((error) => {
    console.error('❌ Failed to initialize player lookup:', error);
    // Continue without player lookup functionality
  });

// Initialize UI handlers
console.log('🔧 Initializing UI handlers...');
initializeUIHandlers();
console.log('✅ UI handlers initialized');

document.getElementById('send').onclick = () => {
  console.log('🚀 Send button clicked - starting query process');
  responseManager.showLoading();
  
  try {
    console.log('📋 Getting query parameters...');
    const {queryKey, value} = getQueryKey();
    console.log('📊 Query parameters:', { queryKey, value });

    if (!queryTables[queryKey]) {
      console.log('🆕 Creating new query section for:', queryKey);
      const sectionMeta = createQuerySection(queryKey, value);
      queryTables[queryKey] = sectionMeta;

      // Attach the "See more" handler once
      sectionMeta.btnMore.onclick = () => {
        console.log(`📄 "See more" clicked for query: ${queryKey}`);
        fetchAndAppend(queryKey, queryTables[queryKey], responseManager);
      };
      console.log('🔗 "See more" handler attached');
      
      // Attach the toggle expand/collapse handler
      sectionMeta.btnToggle.onclick = () => {
        console.log(`🔄 "Toggle view" clicked for query: ${queryKey}`);
        toggleArticleView(queryKey, queryTables[queryKey]);
      };
      console.log('🔗 "Toggle view" handler attached');
    } else {
      console.log('🔄 Using existing query section for:', queryKey);
    }

    // Always fetch initial or next page results on "Send"
    console.log('📡 Starting fetch for query:', queryKey);
    fetchAndAppend(queryKey, queryTables[queryKey], responseManager);
    
    // Show success message
    console.log('✅ Query process completed successfully');
    responseManager.showSuccess(`Request sent successfully for keyword: "${value}"`);
  } catch (error) {
    console.error('❌ Error in send button handler:', error);
    responseManager.showError(error.message);
  }
};
