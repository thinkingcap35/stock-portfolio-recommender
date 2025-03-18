// Stock Portfolio Recommender v3.0
(function() {
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

    // Function to update progress bar
    function updateProgress() {
        const totalQuestions = 5;
        const answeredQuestions = document.querySelectorAll('input[type="radio"]:checked').length;
        const progress = (answeredQuestions / totalQuestions) * 100;
        document.getElementById('questionProgress').style.width = `${progress}%`;
    }

    // Function to calculate risk profile from questionnaire
    function calculateRiskProfile() {
        const questions = ['q1', 'q2', 'q3', 'q4', 'q5'];
        let totalScore = 0;
        let unansweredQuestions = [];

        questions.forEach(q => {
            const answer = document.querySelector(`input[name="${q}"]:checked`);
            if (answer) {
                totalScore += parseInt(answer.value);
            } else {
                unansweredQuestions.push(q.charAt(1));
            }
        });

        if (unansweredQuestions.length > 0) {
            alert(`Please answer question${unansweredQuestions.length > 1 ? 's' : ''} ${unansweredQuestions.join(', ')}`);
            return;
        }

        // Calculate risk profile based on total score
        // Possible range: 5-20 points
        let riskProfile;
        const riskScore = totalScore;

        if (riskScore <= 10) {
            riskProfile = 'conservative';
        } else if (riskScore <= 15) {
            riskProfile = 'moderate';
        } else {
            riskProfile = 'aggressive';
        }

        // Store the calculated risk profile
        window.currentRiskProfile = riskProfile;

        // Show results and portfolio form
        displayRiskProfile(riskProfile, riskScore);
        document.getElementById('riskQuestionnaire').style.display = 'none';
        document.getElementById('portfolioForm').style.display = 'block';
    }

    // Function to display risk profile results
    function displayRiskProfile(profile, score) {
        const profileDescriptions = {
            conservative: 'You prefer stability and are more comfortable with lower-risk investments. Your portfolio will focus on more stable stocks with lower volatility.',
            moderate: 'You seek a balance between growth and stability. Your portfolio will include a mix of stocks with varying levels of volatility.',
            aggressive: 'You are comfortable with higher risk for potentially higher returns. Your portfolio will include more volatile stocks with higher growth potential.'
        };

        const infoBox = document.createElement('div');
        infoBox.className = 'risk-profile-result';
        infoBox.innerHTML = `
            <h3>Your Risk Profile: ${profile.charAt(0).toUpperCase() + profile.slice(1)}</h3>
            <p>${profileDescriptions[profile]}</p>
            <p>Based on your answers, your risk tolerance score is ${score} out of 20.</p>
        `;

        const container = document.querySelector('.container');
        container.insertBefore(infoBox, document.getElementById('portfolioForm'));
    }

    // Function to fetch stock data from Alpha Vantage API
    async function fetchStockData(ticker) {
        console.log(`Fetching data for ${ticker}`);
        const apiKey = 'YOUR_ALPHA_VANTAGE_API_KEY'; // Replace with your actual API key
        try {
            const response = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${apiKey}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            if (!data['Global Quote'] || Object.keys(data['Global Quote']).length === 0) {
                throw new Error(`No data available for ${ticker}. Please ensure the ticker symbol is correct.`);
            }

            const quote = data['Global Quote'];
            return {
                price: parseFloat(quote['05. price']),
                high: parseFloat(quote['03. high']),
                low: parseFloat(quote['04. low'])
            };
        } catch (error) {
            console.error('Error fetching stock data:', error);
            throw new Error(`Failed to fetch data for ${ticker}. Please try again later. (${error.message})`);
        }
    }

    // Calculate volatility (using high-low range as a simple proxy)
    function calculateVolatility(high, low, price) {
        return (high - low) / price;
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
    async function generateRecommendations(tickers, funding) {
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
                const { price, high, low } = await fetchStockData(ticker);
                const volatility = calculateVolatility(high, low, price);
                stockData.push({
                    ticker,
                    volatility,
                    currentPrice: price,
                    yearHigh: high,
                    yearLow: low
                });
            }

            // Calculate allocations based on volatilities and risk profile
            const volatilities = stockData.map(stock => stock.volatility);
            const allocations = calculateRiskAdjustedAllocation(volatilities, window.currentRiskProfile);

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

    // Handle portfolio form submission
    document.getElementById('portfolioForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        // Get form values
        const funding = parseFloat(document.getElementById('funding').value);
        const stockInputs = document.getElementsByClassName('stock-ticker');
        const tickers = Array.from(stockInputs).map(input => input.value.toUpperCase());

        try {
            // Generate recommendations
            const recommendations = await generateRecommendations(tickers, funding);

            // Display results
            const resultsDiv = document.getElementById('results');
            const outputDiv = document.getElementById('recommendationOutput');

            let html = '<table style="width:100%; border-collapse: collapse; margin-top: 20px;">';
            html += `
                <tr style="background-color: #f2f2f2;">
                    <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Stock</th>
                    <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Allocation %</th>
                    <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Amount ($)</th>
                    <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Current Price ($)</th>
                    <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">52W High ($)</th>
                    <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">52W Low ($)</th>
                </tr>
            `;

            recommendations.forEach((rec) => {
                html += `
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd;">${rec.ticker}</td>
                        <td style="padding: 10px; border: 1px solid #ddd;">${rec.percentage}%</td>
                        <td style="padding: 10px; border: 1px solid #ddd;">$${rec.amount}</td>
                        <td style="padding: 10px; border: 1px solid #ddd;">$${rec.currentPrice.toFixed(2)}</td>
                        <td style="padding: 10px; border: 1px solid #ddd;">$${rec.yearHigh.toFixed(2)}</td>
                        <td style="padding: 10px; border: 1px solid #ddd;">$${rec.yearLow.toFixed(2)}</td>
                    </tr>
                `;
            });

            html += '</table>';

            outputDiv.innerHTML = html;
            resultsDiv.style.display = 'block';

            // Render allocation pie chart
            renderAllocationPieChart(recommendations);

        } catch (error) {
            console.error('Error in form submission:', error);
            document.getElementById('recommendationOutput').innerHTML = 
                `Error generating recommendations: ${error.message}<br>Please check your inputs and try again.`;
        }
    });

    // Add event listeners for radio buttons to update progress
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', updateProgress);
    });

    // Expose necessary functions to global scope
    window.addStock = addStock;
    window.removeStock = removeStock;
    window.calculateRiskProfile = calculateRiskProfile;
})();
