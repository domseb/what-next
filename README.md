# What Next? 🎬

A beautiful React app that helps you discover your next binge-worthy content using the Watchmode API. Get personalized movie and TV show recommendations based on your streaming providers, preferred genres, and content types.

## Features

- 🎯 **Multi-select filters**: Choose from Australian streaming providers, content types (movies/TV), and genres
- 🎰 **Roulette system**: Get 3 random recommendations with a single click
- 🎨 **Beautiful UI**: Modern, responsive design with glassmorphism effects
- 📱 **Mobile-friendly**: Works perfectly on all devices
- ⚡ **Fast & efficient**: Only calls the API when you spin the roulette

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- Watchmode API key (free at [api.watchmode.com](https://api.watchmode.com))

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd what-next
```

2. Install dependencies:
```bash
npm install
```

3. Get your Watchmode API key:
   - Visit [api.watchmode.com](https://api.watchmode.com)
   - Sign up for a free account
   - Copy your API key from the dashboard

4. Update the API key in the app:
   - Open `src/App.jsx`
   - Replace `'X7qaTQtdajZuOnkoShL30ZtY0wbQ1CHCHOPBF8d4'` with your actual API key (lines 47 and 89)

5. Start the development server:
```bash
npm run dev
```

6. Open your browser and navigate to `http://localhost:5173`

## How to Use

1. **Select Streaming Providers**: Choose from popular Australian streaming services like Netflix, Disney+, Stan, Binge, and more
2. **Choose Content Type**: Select whether you want movies, TV series, or both
3. **Pick Genres**: Select your preferred genres (Action, Comedy, Drama, etc.)
4. **Spin the Roulette**: Click the "🎰 Spin the Roulette!" button to get 3 random recommendations
5. **Explore**: Click on any recommendation card to see more details

## API Integration

This app uses the Watchmode API to fetch:
- **Genres**: Available movie and TV show genres
- **Titles**: Filtered recommendations based on your selections
- **Poster images**: Movie/show posters when available
- **Ratings**: User ratings and reviews
- **Overview**: Brief descriptions of content

## Available Streaming Providers

The app includes major Australian streaming services:
- Netflix
- Amazon Prime Video
- Apple TV+
- Disney+
- Stan
- Binge
- Foxtel Now
- Paramount+
- BritBox
- Acorn TV
- Shudder
- Hayu
- Crunchyroll
- Funimation
- Kanopy
- Beamafilm
- DocPlay
- Mubi
- Curiosity Stream

## Technologies Used

- **React 18**: Modern React with hooks
- **Vite**: Fast build tool and dev server
- **React Select**: Beautiful multi-select dropdowns
- **Axios**: HTTP client for API calls
- **CSS3**: Modern styling with gradients and animations

## Customization

### Adding More Streaming Providers

To add more streaming providers, update the `australianProviders` array in `src/App.jsx`:

```javascript
const australianProviders = [
  // ... existing providers
  { value: NEW_ID, label: 'New Provider' }
]
```

### Styling

The app uses a modern glassmorphism design. You can customize the colors and effects by modifying:
- `src/App.css` - Main component styles
- `src/index.css` - Global styles and fonts

### API Configuration

The app is configured to work with the Watchmode API. You can modify the API endpoints and parameters in the `handleRoulette` function in `src/App.jsx`.

## Troubleshooting

### API Key Issues
- Make sure your API key is correctly inserted in `src/App.jsx`
- Verify your API key is active on the Watchmode dashboard
- Check the browser console for any API error messages

### No Results
- Try selecting fewer filters to get more results
- Some combinations of filters might return no results
- The API has rate limits - wait a moment and try again

### Styling Issues
- Ensure all CSS files are properly imported
- Check that the Inter font is loading correctly
- Verify browser compatibility for CSS features like `backdrop-filter`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

If you encounter any issues or have questions:
1. Check the troubleshooting section above
2. Review the Watchmode API documentation
3. Open an issue on GitHub

---

Happy watching! 🍿
