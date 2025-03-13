// Function to fetch stock data from Yahoo Finance API through a CORS proxy
async function fetchStockData(ticker) {
    try {
        const response = await fetch(`https://cors-anywhere.herokuapp.com/https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?range=1y&interval=1wk`, {
            headers: {
                'Origin': window.location.origin
            }
        });
        const data = await response.json();
        const prices = data.chart.result[0].indicators.quote[0].close;
        const timestamps = data.chart.result[0].timestamp;
        return { prices, timestamps };
    } catch (error) {
        console.error(`Error fetching data for ${ticker}:`, error);
        throw error;
    }
}

// Calculate volatility (standard deviation of returns)
function calculateVolatility(prices) {
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
        returns.push((prices[i] - prices[i-1]) / prices[i-1]);
    }
    
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
    return Math.sqrt(variance);
}

// Function to calculate risk-adjusted allocation
function calculateRiskAdjustedAllocation(volatilities, riskProfile) {
    let weights = [];
    const totalVolatility = volatilities.reduce((a, b) => a + b, 0);
    const avgVolatility = totalVolatility / volatilities.length;
    
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
    
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    return weights.map(w => (w / totalWeight) * 100);
}

// Function to fetch stock data from Yahoo Finance API through a CORS proxy
async function fetchStockData(ticker) {
    try {
        const response = await fetch(`https://cors-anywhere.herokuapp.com/https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?range=1y&interval=1wk`, {
            headers: {
                'Origin': window.location.origin
            }
        });
        const data = await response.json();
        const prices = data.chart.result[0].indicators.quote[0].close;
        const timestamps = data.chart.result[0].timestamp;
        return { prices, timestamps };
    } catch (error) {
        console.error(`Error fetching data for ${ticker}:`, error);
        throw error;
    }
}

// Calculate volatility (standard deviation of returns)
function calculateVolatility(prices) {
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
        returns.push((prices[i] - prices[i-1]) / prices[i-1]);
    }
    
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
    return Math.sqrt(variance);
}

// Function to calculate risk-adjusted allocation
function calculateRiskAdjustedAllocation(volatilities, riskProfile) {
    let weights = [];
    const totalVolatility = volatilities.reduce((a, b) => a + b, 0);
    const avgVolatility = totalVolatility / volatilities.length;
    
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
    
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    return weights.map(w => (w / totalWeight) * 100);
}

// Function to fetch stocks based on index and market cap range
async function fetchStocksByIndexAndMarketCap(index, minMarketCap, maxMarketCap) {
    // This is a placeholder function. In a real-world scenario, you would need to use a financial API or database to fetch this data.
    // For demonstration purposes, we'll return a hardcoded list of stocks for each index.
    const stocks = {
        'S&P500': ['AAPL', 'MSFT', 'AMZN', 'GOOGL', 'FB'],
        'NASDAQ': ['TSLA', 'NVDA', 'PYPL', 'ADBE', 'CMCSA'],
        'DJIA': ['UNH', 'GS', 'HD', 'AMGN', 'MCD']
    };
    
    return stocks[index] || [];
}

// Function to generate recommendations
async function generateRecommendations(index, minMarketCap, maxMarketCap, funding, riskProfile) {
    try {
        const stocks = await fetchStocksByIndexAndMarketCap(index, minMarketCap, maxMarketCap);
        
        const volatilities = [];
        const stockData = {};
        
        for (const ticker of stocks) {
            const { prices, timestamps } = await fetchStockData(ticker);
            const filteredPrices = prices.filter(p => p !== null);
            if (filteredPrices.length < 2) {
                throw new Error(`Insufficient price data for ${ticker}`);
            }
            const volatility = calculateVolatility(filteredPrices);
            volatilities.push(volatility);
            
            stockData[ticker] = {
                volatility,
                currentPrice: filteredPrices[filteredPrices.length - 1],
                yearHigh: Math.max(...filteredPrices),
                yearLow: Math.min(...filteredPrices),
                prices: filteredPrices,
                timestamps: timestamps
            };
        }
        
        const allocations = calculateRiskAdjustedAllocation(volatilities, riskProfile);
        
        let recommendations = [];
        for(let i = 0; i < stocks.length; i++) {
            const ticker = stocks[i];
            const allocation = allocations[i];
            const amount = (funding * allocation) / 100;
            
            recommendations.push({
                ticker,
                percentage: allocation.toFixed(2),
                amount: amount.toFixed(2),
                volatility: (stockData[ticker].volatility * 100).toFixed(2),
                yearHigh: stockData[ticker].yearHigh.toFixed(2),
                yearLow: stockData[ticker].yearLow.toFixed(2),
                prices: stockData[ticker].prices,
                timestamps: stockData[ticker].timestamps
            });
        }
        
        return recommendations;
        
    } catch (error) {
        console.error('Error generating recommendations:', error);
        throw error;
    }
}

function renderStockGraph(rec, canvas) {
    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
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
                    text: `${rec.ticker} - Current: $${rec.prices[rec.prices.length - 1].toFixed(2)}, 52W High: $${rec.yearHigh}, 52W Low: $${rec.yearLow}`,
                    font: {
                        size: 14
                    }
                },
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            scales: {
                x: {
                    display: true,
                    ticks: {
                        maxTicksLimit: 6,
                        maxRotation: 0,
                        autoSkip: true
                    }
                },
                y: {
                    beginAtZero: false,
                    ticks: {
                        maxTicksLimit: 5
                    }
                }
            }
        }
    });
}

// Handle form submission
document.getElementById('indexBasedRecommendationForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const funding = parseFloat(document.getElementById('funding').value);
    const riskProfile = document.getElementById('riskProfile').value;
    const index = document.getElementById('index').value;
    const marketCap = document.getElementById('marketCap').value;
    const numStocks = parseInt(document.getElementById('numStocks').value);
    
    try {
        const recommendations = await generateRecommendations(index, marketCap, numStocks, funding, riskProfile);
        
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
                    <td style="padding: 10px; border: 1px solid #ddd;">${rec.volatility}%</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">$${rec.yearHigh}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">$${rec.yearLow}</td>
                    <td class="graph-cell" style="border: 1px solid #ddd;">
                        <canvas id="graph-${index}" class="graph-canvas"></canvas>
                    </td>
                </tr>
            `;
        });
        
        html += '</table>';
        
        outputDiv.innerHTML = html;
        resultsDiv.style.display = 'block';
        
        recommendations.forEach((rec, index) => {
            const canvas = document.getElementById(`graph-${index}`);
            renderStockGraph(rec, canvas);
        });
        
    } catch (error) {
        document.getElementById('recommendationOutput').innerHTML = 
            'Error generating recommendations. Please check your inputs and try again.<br>' +
            'Note: You may need to visit https://cors-anywhere.herokuapp.com/corsdemo first to enable the demo CORS proxy.';
    }
});
