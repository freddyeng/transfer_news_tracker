# Event Registry News Tracker

A web application for tracking football/soccer news articles with intelligent player recognition and filtering capabilities.

## Features

- 🔍 **Keyword-based article search** using Event Registry API
- ⚽ **Smart player detection** in headlines with name normalization
- 📊 **Player mention statistics** with top 10 most mentioned players
- 🎯 **Interactive filtering** by clicking player names
- 📄 **Pagination** with "See more" functionality
- 🔄 **Expand/collapse** views (5 recent vs all articles)
- 📈 **Real-time statistics** showing total articles and date ranges

## Setup

### Prerequisites
- Node.js (v16 or higher)
- Event Registry API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd event_registry
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Event Registry API key:
   ```
   VITE_EVENTREGISTRY_API_KEY=your_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## Usage

1. **Search for articles**: Enter a keyword (e.g., "arsenal") and click "Send query"
2. **View results**: See the 5 most recent articles and top 10 mentioned players
3. **Filter by players**: Click on player names to filter articles mentioning them
4. **Load more articles**: Click "See more" to load additional pages
5. **Expand view**: Click "Show all articles" to see all collected articles

## API Key

Get your free API key from [Event Registry](https://eventregistry.org/):
1. Create an account
2. Go to your profile settings
3. Generate an API key
4. Add it to your `.env` file

## Technology Stack

- **Frontend**: Vanilla JavaScript (ES6 modules)
- **Build Tool**: Vite
- **API**: Event Registry
- **Styling**: Custom CSS with CSS variables
- **Data**: Football player database (9000+ players)

## Project Structure

```
├── index.html              # Main HTML file
├── main.js                 # Application entry point
├── style.css               # Main stylesheet
├── fetchArticles.js        # API communication
├── articleRenderer.mjs     # Article display logic
├── playerLookup.js         # Player detection system
├── domHelpers.js           # DOM manipulation utilities
├── queryStore.js           # Query parameter management
├── responseManager.js      # Response status handling
├── uiHandlers.js          # UI event handlers
└── players-by-team.json   # Player database
```

## Features in Detail

### Player Detection
- Recognizes 9000+ football players from major leagues
- Handles name variations and accents
- Prevents false matches (e.g., won't match "Rico Lewis" when "Myles Lewis-Skelly" is found)

### Smart Filtering
- Click multiple player names to combine filters
- Visual feedback shows selected players
- Maintains filter state across pagination
- Works with both collapsed and expanded views

### Statistics
- Real-time article counts and date ranges
- Player mention frequency tracking
- Summary stats update as you load more articles

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.
