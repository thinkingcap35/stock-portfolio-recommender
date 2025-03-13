# Stock Portfolio Recommender

A web-based tool that helps users create diversified stock portfolios based on risk profiles and historical volatility data.

## Features

- Real-time stock data from Alpha Vantage API
- Risk-based portfolio allocation (Conservative, Moderate, Aggressive)
- Interactive charts showing portfolio allocation

## Prerequisites

- An Alpha Vantage API key (get one for free at https://www.alphavantage.co/)
- GitHub account

## Deployment with GitHub Pages

1. Fork this repository to your GitHub account.

2. In the `client.js` file, replace `'YOUR_ALPHA_VANTAGE_API_KEY'` with your actual Alpha Vantage API key.

3. Enable GitHub Pages for your repository:
   - Go to your repository's Settings > Pages
   - Under "Source", select the branch you want to deploy (usually `main` or `master`)
   - Click "Save"

4. Your application will be available at `https://your-username.github.io/stock-portfolio-recommender/`

## Local Setup (Optional)

If you want to run the application locally:

1. Clone your forked repository.

2. Navigate to the project directory:
   ```
   cd stock-portfolio-recommender
   ```

3. Open the `index.html` file in a web browser.

## Using the Application

1. Input your investment amount, risk profile, and desired stocks.

2. Click "Get Recommendations" to receive portfolio allocation suggestions.

## How It Works

This application uses the Alpha Vantage API to fetch real-time stock data. It then calculates volatility and provides portfolio allocation recommendations based on the user's risk profile (conservative, moderate, or aggressive).

## Notes

- The free tier of the Alpha Vantage API has rate limits. If you encounter errors, you may need to wait before making additional requests.
- This tool is for educational purposes only and should not be considered as financial advice.
- Be cautious about sharing your API key. In a production environment, you would typically use a backend server to make API calls and keep your API key private.

## License

This project is open source and available under the [MIT License](LICENSE).
