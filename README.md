# Stock Portfolio Recommender

This application provides personalized stock portfolio recommendations based on user risk profiles and selected stocks.

## Features

- Risk profile questionnaire
- Stock selection interface
- Portfolio allocation recommendations
- Visual representation of allocation using charts

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

1. Complete the risk profile questionnaire.
2. Enter your available funding and select stocks.
3. Click "Get Recommendations" to receive your personalized portfolio allocation.

## Development

To run the application in development mode with auto-reloading:

```
npm run dev
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)
