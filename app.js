// Stock Portfolio Recommender v3.0
(function() {
    // Load configuration from global scope
    const POLYGON_API_KEY = window.CONFIG?.POLYGON_API_KEY;
    const CORS_PROXY_URL = window.CONFIG?.CORS_PROXY_URL || 'https://cors-anywhere.herokuapp.com/';

    // Function to add a new stock input field
    function addStock() {
        const stockList = document.getElementById('stockList');
        const newStockItem = document.createElement('div');
        newStockItem.className = 'stock-item';
        newStockItem.innerHTML = `
            <input type="text" class="stock-ticker" style="flex: 1;" placeholder="Enter US stock ticker (e.g., AAPL)" required>
            <button type="button" onclick="window.removeStock(this)">Remove</button>
        `;
        stockList.appendChild(newStockItem);
    }

    // Function to remove a stock input field
    function removeStock(button) {
        const stockList = document.getElementById('stockList');
        if (stockList.children.length > 1) {
            button.parentElement.remove();
        }
    }

    // Expose functions to global scope
    window.addStock = addStock;
    window.removeStock = removeStock;

    // Check configuration on startup
    function checkConfiguration() {
        const messages = [];
        
        if (!POLYGON_API_KEY) {
            messages.push(`
                <div class="error-box">
                    <h3>⚠️ Configuration Required</h3>
                    <p>The Polygon.io API key is missing. To set up the application:</p>
                    <ol>
                        <li>Copy config.sample.js to config.js</li>
                        <li>Get an API key from <a href="https://polygon.io/" target="_blank">Polygon.io</a></li>
                        <li>Update config.js with your API key</li>
                    </ol>
                    <p>Note: The application must be served from a local web server, not opened directly from the filesystem.</p>
                    <p>Quick start with Python:</p>
                    <pre>python -m http.server 8000</pre>
                    <p>Then visit: <a href="http://localhost:8000">http://localhost:8000</a></p>
                </div>
            `);
        }

        if (window.location.protocol === 'file:') {
            messages.push(`
                <div class="error-box">
                    <h3>⚠️ Server Required</h3>
                    <p>This application cannot run directly from the filesystem due to browser security restrictions.</p>
                    <p>Please serve it using a local web server:</p>
                    <pre>python -m http.server 8000</pre>
                    <p>Then visit: <a href="http://localhost:8000">http://localhost:8000</a></p>
                </div>
            `);
        }

        if (messages.length > 0) {
            document.getElementById('recommendationForm').style.display = 'none';
            const errorContainer = document.createElement('div');
            errorContainer.innerHTML = messages.join('');
            document.querySelector('.container').insertBefore(errorContainer, document.getElementById('recommendationForm'));
        }
    }

    // Add styles for error messages
    const style = document.createElement('style');
    style.textContent = `
        .error-box {
            background-color: #fff3cd;
            border: 1px solid #ffeeba;
            border-radius: 4px;
            padding: 15px;
            margin-bottom: 20px;
        }
        .error-box h3 {
            color: #856404;
            margin-top: 0;
        }
        .error-box pre {
            background-color: #f8f9fa;
            padding: 10px;
            border-radius: 4px;
            overflow-x: auto;
        }
        .error-box a {
            color: #0056b3;
            text-decoration: none;
        }
        .error-box a:hover {
            text-decoration: underline;
        }
    `;
    document.head.appendChild(style);

    // Check configuration when the page loads
    window.addEventListener('load', checkConfiguration);

    // Function to fetch stock data from Polygon.io API with CORS proxy fallback
    async function fetchStockData(ticker) {
        console.log(`Fetching data for ${ticker}`);
        const today = new Date();
        const oneYearAgo = new Date(today.setFullYear(today.getFullYear() - 1));
        const fromDate = oneYearAgo.toISOString().split('T')[0];
        const toDate = new Date().toISOString().split('T')[0];

        const polygonUrl = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/week/${fromDate}/${toDate}?adjusted=true&apiKey=${POLYGON_API_KEY}`;
        const corsProxyUrl = `${CORS_PROXY_URL}${polygonUrl}`;

        async function fetchWithRetry(url, useProxy = false, retries = 3, delay = 1000) {
            try {
                const response = await fetch(useProxy ? corsProxyUrl : url);
                if (!response.ok) {
                    if (response.status === 403 && !useProxy) {
                        console.log('CORS error detected, retrying with proxy...');
                        return fetchWithRetry(url, true, retries, delay);
                    }
                    if (response.status === 429) {
                        throw new Error('Rate limit exceeded');
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();

                if (data.resultsCount === 0 || !data.results) {
                    throw new Error(`No data available for ${ticker}. Please ensure the ticker symbol is correct.`);
                }

                return {
                    prices: data.results.map(result => result.c),
                    timestamps: data.results.map(result => result.t)
                };
            } catch (error) {
                if (retries > 0 && (error.message === 'Rate limit exceeded' || error.message.includes('Failed to fetch'))) {
                    const retryMessage = `Rate limit reached for ${ticker}. Retrying in ${delay / 1000} seconds... (${retries} attempts remaining)`;
                    console.log(retryMessage);
                    document.getElementById('recommendationOutput').innerHTML = retryMessage;
                    await new Promise(resolve => setTimeout(resolve, delay));
                    return fetchWithRetry(url, useProxy, retries - 1, delay * 2);
                }
                throw error;
            }
        }

        try {
            return await fetchWithRetry(polygonUrl);
        } catch (error) {
            console.error('All attempts failed:', error);
            throw new Error(`Failed to fetch data for ${ticker}. Please try again later. (${error.message})`);
        }
    }

    // Calculate volatility (standard deviation of returns)
    function calculateVolatility(prices) {
        const returns = prices.slice(1).map((price, i) => (price - prices[i]) / prices[i]);
        const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
        return Math.sqrt(variance);
    }

    // Function to calculate risk-adjusted allocation
    function calculateRiskAdjustedAllocation(volatilities, riskProfile) {
        let weights;
        const avgVolatility = volatilities.reduce((sum, vol) => sum + vol, 0) / volatilities.length;

        switch(riskProfile) {
            case 'conservative':
                weights = volatilities.map(vol => 1 / vol);
                break;
            case 'moderate':
                weights = volatilities.map(vol => 1 / Math.sqrt(vol));
                break;
            case 'aggressive':
                weights = volatilities.map(vol => vol / avgVolatility);
                break;
        }

        const totalWeight = weights.reduce((sum, w) => sum + w, 0);
        return weights.map(w => (w / totalWeight) * 100);
    }

    // Function to generate recommendations
    async function generateRecommendations(tickers, funding, riskProfile) {
        try {
            // Show loading state
            const resultsDiv = document.getElementById('results');
            resultsDiv.style.display = 'block';
            document.getElementById('recommendationOutput').innerHTML = 'Loading market data...';

            // Fetch data and calculate volatilities for all stocks
            const stockData = [];
            for (const ticker of tickers) {
                document.getElementById('recommendationOutput').innerHTML = `Loading market data for ${ticker}...`;
                // Add a delay between API calls
                if (stockData.length > 0) {
                    await new Promise(resolve => setTimeout(resolve, 1500));
                }
                const { prices, timestamps } = await fetchStockData(ticker);
                const volatility = calculateVolatility(prices);
                stockData.push({
                    ticker,
                    volatility,
                    currentPrice: prices[prices.length - 1],
                    yearHigh: Math.max(...prices),
                    yearLow: Math.min(...prices),
                    prices,
                    timestamps
                });
            }

            // Calculate allocations based on volatilities and risk profile
            const volatilities = stockData.map(stock => stock.volatility);
            const allocations = calculateRiskAdjustedAllocation(volatilities, riskProfile);

            // Generate recommendations
            return stockData.map((stock, i) => ({
                ...stock,
                percentage: allocations[i].toFixed(2),
                amount: ((funding * allocations[i]) / 100).toFixed(2)
            }));

        } catch (error) {
            console.error('Error generating recommendations:', error);
            throw error;
        }
    }

    const stockCharts = new Map();

    function renderStockGraph(rec, canvas) {
        const ctx = canvas.getContext('2d');
        
        // Destroy existing chart if it exists
        const existingChart = stockCharts.get(canvas.id);
        if (existingChart) {
            existingChart.destroy();
        }

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: rec.timestamps.map(ts => new Date(ts * 1000).toLocaleDateString()),
                datasets: [{
                    label: `${rec.ticker} 52-Week Performance`,
                    data: rec.prices,
                    borderColor: 'rgb(75, 192, 192)',
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: `${rec.ticker} - Current: $${rec.currentPrice.toFixed(2)}, 52W High: $${rec.yearHigh.toFixed(2)}, 52W Low: $${rec.yearLow.toFixed(2)}`,
                        font: { size: 14 }
                    },
                    legend: { display: false },
                    tooltip: { mode: 'index', intersect: false }
                },
                scales: {
                    x: {
                        display: true,
                        ticks: { maxTicksLimit: 6, maxRotation: 0, autoSkip: true }
                    },
                    y: {
                        beginAtZero: false,
                        ticks: { maxTicksLimit: 5 }
                    }
                }
            }
        });
        
        // Store the new chart reference
        stockCharts.set(canvas.id, chart);
    }

    let allocationPieChart = null;

    function renderAllocationPieChart(recommendations) {
        const ctx = document.getElementById('allocationPieChart').getContext('2d');
        
        // Destroy the existing chart if it exists
        if (allocationPieChart) {
            allocationPieChart.destroy();
        }

        allocationPieChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: recommendations.map(rec => `${rec.ticker} ${rec.percentage}%`),
                datasets: [{
                    data: recommendations.map(rec => parseFloat(rec.percentage)),
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
                        '#FF9F40', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Portfolio Allocation',
                        font: { size: 16 }
                    },
                    legend: {
                        position: 'right',
                        labels: { font: { size: 12 } }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.label}: ${context.parsed}%`
                        }
                    }
                }
            }
        });
    }

    // Handle form submission
    document.getElementById('recommendationForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        // Get form values
        const funding = parseFloat(document.getElementById('funding').value);
        const riskProfile = document.getElementById('riskProfile').value;
        const stockInputs = document.getElementsByClassName('stock-ticker');
        const tickers = Array.from(stockInputs).map(input => input.value.toUpperCase());

        try {
            // Generate recommendations
            const recommendations = await generateRecommendations(tickers, funding, riskProfile);

            // Display results
            const resultsDiv = document.getElementById('results');
            const outputDiv = document.getElementById('recommendationOutput');

            let html = '<table style="width:100%; border-collapse: collapse; margin-top: 20px;">';
            html += `
                <tr style="background-color: #f2f2f2;">
                    <th style="padding: 10px; text-align: left; border: 1px solid #ddd; width: 10%;">Stock</th>
                    <th style="padding: 10px; text-align: left; border: 1px solid #ddd; width: 10%;">Allocation %</th>
                    <th style="padding: 10px; text-align: left; border: 1px solid #ddd; width: 10%;">Amount ($)</th>
                    <th style="padding: 10px; text-align: left; border: 1px solid #ddd; width: 10%;">52W Volatility %</th>
                    <th style="padding: 10px; text-align: left; border: 1px solid #ddd; width: 10%;">52W High ($)</th>
                    <th style="padding: 10px; text-align: left; border: 1px solid #ddd; width: 10%;">52W Low ($)</th>
                    <th style="padding: 10px; text-align: left; border: 1px solid #ddd; width: 40%;">52-Week Performance</th>
                </tr>
            `;

            recommendations.forEach((rec, index) => {
                html += `
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd;">${rec.ticker}</td>
                        <td style="padding: 10px; border: 1px solid #ddd;">${rec.percentage}%</td>
                        <td style="padding: 10px; border: 1px solid #ddd;">$${rec.amount}</td>
                        <td style="padding: 10px; border: 1px solid #ddd;">${(rec.volatility * 100).toFixed(2)}%</td>
                        <td style="padding: 10px; border: 1px solid #ddd;">$${rec.yearHigh.toFixed(2)}</td>
                        <td style="padding: 10px; border: 1px solid #ddd;">$${rec.yearLow.toFixed(2)}</td>
                        <td class="graph-cell" style="border: 1px solid #ddd;">
                            <canvas id="graph-${index}" class="graph-canvas"></canvas>
                        </td>
                    </tr>
                `;
            });

            html += '</table>';

            outputDiv.innerHTML = html;
            resultsDiv.style.display = 'block';

            // Render graphs
            recommendations.forEach((rec, index) => {
                const canvas = document.getElementById(`graph-${index}`);
                renderStockGraph(rec, canvas);
            });

            // Render allocation pie chart
            renderAllocationPieChart(recommendations);

        } catch (error) {
            console.error('Error in form submission:', error);
            document.getElementById('recommendationOutput').innerHTML = 
                `Error generating recommendations: ${error.message}<br>Please check your inputs and try again.`;
        }
    });
})();
