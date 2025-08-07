import { processArticles, updatePageInfo } from './articleRenderer.mjs';
import { checkHeadlineForPlayers } from './playerLookup.js';

const API_URL = 'https://eventregistry.org/api/v1/article/getArticles';
const API_KEY = import.meta.env.VITE_EVENTREGISTRY_API_KEY;

export function calculateSummaryStats(articles, keyword) {
  if (!articles || articles.length === 0) {
    return {
      totalCount: 0,
      dateRange: 'No articles found',
      keyword: keyword,
      articlesWithPlayers: 0
    };
  }

  // Sort articles by date to get oldest and newest
  const sortedByDate = [...articles].sort((a, b) => new Date(a.date) - new Date(b.date));
  const oldestDate = sortedByDate[0]?.date;
  const newestDate = sortedByDate[sortedByDate.length - 1]?.date;

  let dateRange = 'Unknown date range';
  if (oldestDate && newestDate) {
    const oldest = new Date(oldestDate).toLocaleDateString();
    const newest = new Date(newestDate).toLocaleDateString();
    if (oldest === newest) {
      dateRange = newest;
    } else {
      dateRange = `${oldest} - ${newest}`;
    }
  }

  // Calculate articles with player mentions and track individual player counts
  const playerMentionCounts = new Map();
  const articlesWithPlayers = articles.filter(article => {
    const matchedPlayers = checkHeadlineForPlayers(article.title);
    
    // Count mentions for each player
    matchedPlayers.forEach(player => {
      const playerKey = `${player.name} (${player.team})`;
      playerMentionCounts.set(playerKey, (playerMentionCounts.get(playerKey) || 0) + 1);
    });
    
    return matchedPlayers.length > 0;
  }).length;

  // Convert to sorted array for display (top 10 only)
  const playerMentions = Array.from(playerMentionCounts.entries())
    .map(([playerInfo, count]) => ({ playerInfo, count }))
    .sort((a, b) => b.count - a.count) // Sort by mention count (highest first)
    .slice(0, 10); // Limit to top 10 players

  return {
    totalCount: articles.length,
    dateRange: dateRange,
    keyword: keyword,
    articlesWithPlayers: articlesWithPlayers,
    playerMentions: playerMentions
  };
}

export async function fetchAndAppend(queryKey, sectionMeta, responseManager) {
  console.log('📡 Starting fetchAndAppend...');
  console.log('🔑 Query key:', queryKey);
  console.log('📊 Section meta:', sectionMeta);
  
  const paramsObj = JSON.parse(queryKey);
  console.log('📋 Parsed parameters:', paramsObj);

  // Restore pagination functionality
  const params = new URLSearchParams({
    action: 'getArticles',
    apiKey: API_KEY,
    articlesCount: '30',  // Get more articles since we'll filter client-side
    articlesPage: sectionMeta.currentPage,
    lang: paramsObj.lang || 'eng',
    keywords: paramsObj.keyword || '',
    sortBy: 'date',        // Sort by date to get most recent first
    // Removed keywordsLoc since it's not working as expected
  });

  try {
    console.log('⏳ Showing fetching message...');
    responseManager.showFetching();
    
    console.log('🌐 Making API request to:', `${API_URL}?${params.toString()}`);
    console.log('📋 Full API URL:', `${API_URL}?${params.toString()}`);
    const response = await fetch(`${API_URL}?${params.toString()}`);
    console.log('📡 Response received:', response.status, response.statusText);
    
    if (!response.ok) {
      console.error('❌ HTTP error:', response.status, response.statusText);
      throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
    }
    
    console.log('📄 Parsing JSON response...');
    const data = await response.json();
    console.log('📊 Response data structure:', Object.keys(data));

    if (!data.articles || !Array.isArray(data.articles.results)) {
      console.error('❌ Unexpected response structure:', data);
      throw new Error('Unexpected response structure');
    }

    const articles = data.articles.results;
    console.log(`📰 Found ${articles.length} articles in response`);
    
    // Client-side filtering: only keep articles where keyword appears in title
    const keyword = paramsObj.keyword || '';
    const filteredArticles = articles.filter(article => {
      if (!keyword) return true; // If no keyword, don't filter
      const titleLower = article.title.toLowerCase();
      const keywordLower = keyword.toLowerCase();
      const containsKeyword = titleLower.includes(keywordLower);
      if (!containsKeyword) {
        console.log(`🚫 Filtering out article: "${article.title}" (doesn't contain "${keyword}")`);
      }
      return containsKeyword;
    });
    
    console.log(`📝 After filtering: ${filteredArticles.length} articles contain "${keyword}" in title`);
    
    // Add new articles to the collection (building up over time)
    filteredArticles.forEach(article => {
      if (!sectionMeta.allArticles.some(existing => existing.title === article.title)) {
        sectionMeta.allArticles.push(article);
      }
    });
    
    // Sort all articles by date (newest first)
    sectionMeta.allArticles.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
    
    // Determine what to show based on current expanded state
    let articlesToShow;
    if (sectionMeta.isExpanded) {
      articlesToShow = sectionMeta.allArticles;
      console.log(`📅 Total collected: ${sectionMeta.allArticles.length} articles, showing all (expanded view)`);
    } else {
      articlesToShow = sectionMeta.allArticles.slice(0, 5);
      console.log(`📅 Total collected: ${sectionMeta.allArticles.length} articles, showing ${articlesToShow.length} most recent`);
    }
    
    // Calculate summary statistics from all collected articles
    const summaryStats = calculateSummaryStats(sectionMeta.allArticles, keyword);
    
    const newArticlesCount = processArticles(articlesToShow, sectionMeta, summaryStats);
    
    console.log('✅ Fetch completed successfully');
    console.log(`📊 API returned ${articles.length} articles, ${filteredArticles.length} passed filter, showing ${articlesToShow.length} most recent`);
    responseManager.showFetchResults(newArticlesCount, sectionMeta.allArticles.length, sectionMeta.currentPage);
    
    // Update page info to show the current page we just loaded
    updatePageInfo(sectionMeta);
    
    // Increment page number for next fetch (after showing current page info)
    sectionMeta.currentPage++;

  } catch (err) {
    console.error('❌ Fetch error:', err);
    console.error('❌ Error details:', {
      message: err.message,
      stack: err.stack
    });
    responseManager.showFetchError(err.message);
  }
}
