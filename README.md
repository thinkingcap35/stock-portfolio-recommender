# Stock Portfolio Recommender

A web-based tool that helps users create diversified stock portfolios based on risk profiles and historical volatility data.

## Features

- Real-time stock data from Polygon.io API
- Risk-based portfolio allocation (Conservative, Moderate, Aggressive)
- Interactive charts showing 52-week performance
- Volatility-based weighting system
- Automatic fallback mechanism for API reliability
- Responsive design

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/stock-portfolio-recommender.git
cd stock-portfolio-recommender
```

2. Set up configuration:
   - Copy `config.sample.js` to `config.js`
   - Get your API key from [Polygon.io](https://polygon.io/)
   - Update `config.js` with your API key:
```javascript
const CONFIG = {
    POLYGON_API_KEY: 'your_polygon_api_key_here',
    CORS_PROXY_URL: 'https://cors-anywhere.herokuapp.com/' // Optional: Replace with your preferred CORS proxy
};
```

3. Serve the application:
   The app must be served from a local web server due to browser security restrictions when loading files directly from the filesystem.

   Using Python 3 (recommended):
   ```bash
   python -m http.server 8000
   ```
   Then open your browser and visit: http://localhost:8000

   Alternatively, you can use Node.js:
   ```bash
   npx http-server
   ```
   Then open your browser and visit the URL provided in the console output.

4. Open the application:
   - Navigate to the URL provided by your local server (e.g., http://localhost:8000)
   - If there are any configuration issues, the app will display clear instructions on how to resolve them

Note: Do not open index.html directly from the filesystem, as this will cause CORS issues and prevent the app from functioning correctly.

## Usage

1. Enter your available funding amount
2. Select your risk profile:
   - Conservative: Favors lower volatility stocks
   - Moderate: Balanced approach
   - Aggressive: Weights towards higher volatility stocks
3. Add stock tickers (e.g., AAPL, MSFT, GOOGL)
4. Click "Get Recommendations" to generate your portfolio allocation

## Project Evolution

See [app_evolution.md](app_evolution.md) for a detailed history of the project's development and architecture changes.

## Technical Details

- Pure JavaScript (no framework dependencies)
- Chart.js for data visualization
- Polygon.io API for real-time market data
- Fallback CORS proxy for improved reliability

## Error Handling

The application includes several error handling mechanisms:
- API failure detection and automatic retry with CORS proxy
- Input validation for stock tickers
- Clear error messages for users
- Console logging for debugging

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Polygon.io](https://polygon.io/) for providing market data API
- [Chart.js](https://www.chartjs.org/) for visualization capabilities
- [CORS Anywhere](https://github.com/Rob--W/cors-anywhere) for CORS proxy functionality
