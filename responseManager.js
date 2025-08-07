// Response Manager - handles API response display and status messages
export class ResponseManager {
  constructor() {
    this.responseArea = document.getElementById('raw');
  }

  showLoading() {
    this.responseArea.textContent = '⏳ Initializing...';
  }

  showFetching() {
    this.responseArea.textContent = '📡 Fetching articles...';
  }

  showFetchResults(newCount, totalCount, page) {
    this.responseArea.textContent = `✅ Added ${newCount} new articles\n` +
      `📊 Total articles: ${totalCount}\n` +
      `📄 Page ${page}`;
  }

  showFetchError(error) {
    this.responseArea.textContent = `❌ Error fetching articles: ${error}`;
  }

  showError(error) {
    this.responseArea.textContent = `❌ Error: ${error}`;
  }

  showSuccess(message) {
    this.responseArea.textContent = `✅ ${message}`;
  }
}
