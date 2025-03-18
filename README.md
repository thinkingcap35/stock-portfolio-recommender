# Stock Portfolio Recommender

This application provides personalized stock portfolio recommendations based on user risk profiles and selected stocks. It now includes two modes: manual stock selection and index-based recommendations.

## Features

- Risk profile questionnaire
- Manual stock selection interface
- Index-based stock recommendations
- Portfolio allocation recommendations
- Visual representation of allocation using charts
- Real-time stock data from Alpha Vantage API

## Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/thinkingcap35/stock-portfolio-recommender.git
   cd stock-portfolio-recommender
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add your Alpha Vantage API key:
   ```
   ALPHA_VANTAGE_API_KEY=your_api_key_here
   ```

## Running the Application

1. Start the server:
   ```
   npm start
   ```

2. Open a web browser and navigate to `http://localhost:3000`

## Usage

### Manual Stock Selection
1. Open `index.html` in your browser
2. Complete the risk profile questionnaire
3. Enter your available funding and select stocks
4. Click "Get Recommendations" to receive your personalized portfolio allocation

### Index-Based Recommendations
1. Open `index_based.html` in your browser
2. Enter your funding amount and risk profile
3. Select an index (S&P 500, NASDAQ, or Dow Jones)
4. Specify market capitalization range
5. Click "Get Recommendations" to receive index-based stock recommendations

## Development

To run the application in development mode with auto-reloading:

```
npm run dev
```

## Project Evolution

See [app_evolution.md](app_evolution.md) for a detailed history of the project's development and architecture changes.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)
