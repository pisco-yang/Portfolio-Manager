// ===== ANALYTICS FUNCTIONS =====

// Load analytics data
async function loadAnalytics() {
    try {
        const [performanceResponse, riskMetricsResponse, historicalDataResponse, allocationDataResponse] = await Promise.all([
            fetch(`${API_BASE}/api/portfolio/performance`),
            fetch(`${API_BASE}/api/portfolio/analytics/risk`),
            fetch(`${API_BASE}/api/portfolio/analytics/history`),
            fetch(`${API_BASE}/api/portfolio/analytics/allocation`)
        ]);
        
        const performance = await performanceResponse.json();
        const riskMetrics = await riskMetricsResponse.json();
        const historicalData = await historicalDataResponse.json();
        const allocationData = await allocationDataResponse.json();
        
        // Filter out USD/cash assets
        const filteredPerformance = performance.filter(asset => asset.asset_type !== 'cash' && asset.symbol !== 'USD');
        
        // Merge assets with the same symbol for consistent analytics
        const mergedPerformance = mergePerformanceData(filteredPerformance);
        
        updatePerformanceChart(mergedPerformance);
        updateRiskMetrics(riskMetrics);
        updatePortfolioInsights(mergedPerformance);
        updateHistoricalChart(historicalData);
        updateAllocationChart(allocationData);
        
    } catch (error) {
        console.error('Error loading analytics:', error);
        showNotification('Failed to load analytics: ' + error.message, 'error');
    }
}

// Merge performance data by symbol
function mergePerformanceData(performance) {
    const mergedMap = {};
    performance.forEach(asset => {
        const symbol = asset.symbol;
        if (!mergedMap[symbol]) {
            mergedMap[symbol] = {
                symbol: symbol,
                asset_name: asset.asset_name,
                gain_loss: 0,
                asset_type: asset.asset_type
            };
        }
        mergedMap[symbol].gain_loss += Number(asset.gain_loss || 0);
    });
    
    return Object.values(mergedMap);
}

// Update performance chart
function updatePerformanceChart(performance) {
    if (!performanceChart) return;

    const labels = performance.map(asset => asset.symbol);
    const data = performance.map(asset => asset.gain_loss);
    const colors = data.map(value => value >= 0 ? chartColors.success : chartColors.danger);

    performanceChart.data = {
        labels: labels,
        datasets: [{
            label: 'Gain / Loss',
            data: data,
            backgroundColor: colors,
            borderColor: colors,
            borderWidth: 0,
            hoverBorderColor: colors,
            hoverBorderWidth: 0,
            borderRadius: 0,
            borderSkipped: false
        }]
    };

    performanceChart.update('active');
}


// Update risk metrics
function updateRiskMetrics(riskMetrics) {
    const riskMetricsContainer = document.getElementById('riskMetrics');
    
    if (!riskMetrics || Object.keys(riskMetrics).length === 0) {
        riskMetricsContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-gray);">
                <i class="fas fa-chart-line" style="font-size: 48px; margin-bottom: 20px; opacity: 0.5;"></i>
                <p>No risk metrics available</p>
                <p style="font-size: 14px; margin-top: 10px;">Add assets to see risk metrics</p>
            </div>
        `;
        return;
    }
    
    riskMetricsContainer.innerHTML = `
        <div class="risk-metrics-grid">
            <div class="metric-card">
                <div class="metric-icon volatility">
                    <i class="fas fa-chart-line"></i>
                </div>
                <div class="metric-content">
                    <div class="metric-value">${riskMetrics.volatility.toFixed(2)}%</div>
                    <div class="metric-label">Volatility</div>
                    <div class="metric-description">Portfolio risk level</div>
                </div>
            </div>
            
            <div class="metric-card">
                <div class="metric-icon sharpe">
                    <i class="fas fa-chart-area"></i>
                </div>
                <div class="metric-content">
                    <div class="metric-value">${riskMetrics.sharpeRatio.toFixed(2)}</div>
                    <div class="metric-label">Sharpe Ratio</div>
                    <div class="metric-description">Risk-adjusted returns</div>
                </div>
            </div>
            
            <div class="metric-card">
                <div class="metric-icon beta">
                    <i class="fas fa-balance-scale"></i>
                </div>
                <div class="metric-content">
                    <div class="metric-value">${riskMetrics.beta.toFixed(2)}</div>
                    <div class="metric-label">Beta</div>
                    <div class="metric-description">Market correlation</div>
                </div>
            </div>
            
            <div class="metric-card">
                <div class="metric-icon maxDrawdown">
                    <i class="fas fa-arrow-down"></i>
                </div>
                <div class="metric-content">
                    <div class="metric-value">${riskMetrics.maxDrawdown.toFixed(2)}%</div>
                    <div class="metric-label">Max Drawdown</div>
                    <div class="metric-description">Largest decline</div>
                </div>
            </div>
        </div>
        
        <div class="risk-analysis">
            <h3>Risk Analysis</h3>
            <div class="analysis-grid">
                <div class="analysis-item">
                    <span class="analysis-label">Risk Level:</span>
                    <span class="analysis-value ${getRiskLevelClass(riskMetrics.volatility)}">${getRiskLevel(riskMetrics.volatility)}</span>
                </div>
                <div class="analysis-item">
                    <span class="analysis-label">Diversification:</span>
                    <span class="analysis-value ${getDiversificationClass(riskMetrics.assetTypes)}">${getDiversificationScore(riskMetrics.assetTypes)}</span>
                </div>
                <div class="analysis-item">
                    <span class="analysis-label">Asset Count:</span>
                    <span class="analysis-value">${riskMetrics.assetCount}</span>
                </div>
            </div>
        </div>
    `;
    
    // Add animations to metric cards
    addMetricAnimations();
}

// Calculate risk metrics
function calculateRiskMetrics(performance) {
    const returns = performance.map(asset => asset.gain_loss);
    const totalValue = performance.reduce((sum, asset) => sum + (asset.quantity * asset.current_price), 0);
    const totalReturn = performance.reduce((sum, asset) => sum + asset.gain_loss, 0);
    
    // Calculate average return
    const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    
    // Calculate volatility (standard deviation)
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length;
    const volatility = Math.sqrt(variance);
    
    // Calculate Sharpe ratio (simplified)
    const riskFreeRate = 0.02; // 2% risk-free rate
    const sharpeRatio = (avgReturn - riskFreeRate) / volatility;
    
    // Calculate Beta (simplified - assuming market correlation)
    const beta = volatility / 15; // Assuming market volatility of 15%
    
    // Calculate max drawdown (simplified)
    const maxDrawdown = Math.min(...returns) / totalValue * 100;
    
    return {
        volatility: volatility / totalValue * 100,
        sharpeRatio: sharpeRatio || 0,
        beta: beta,
        maxDrawdown: Math.abs(maxDrawdown),
        totalReturn: totalReturn,
        avgReturn: avgReturn
    };
}

// Get risk level classification
function getRiskLevel(volatility) {
    if (volatility < 5) return 'Low';
    if (volatility < 10) return 'Medium';
    if (volatility < 15) return 'High';
    return 'Very High';
}

function getRiskLevelClass(volatility) {
    if (volatility < 5) return 'low-risk';
    if (volatility < 10) return 'medium-risk';
    if (volatility < 15) return 'high-risk';
    return 'very-high-risk';
}

// Get diversification score
function getDiversificationScore(assetCount) {
    if (assetCount >= 10) return 'Excellent';
    if (assetCount >= 5) return 'Good';
    if (assetCount >= 3) return 'Fair';
    return 'Poor';
}

function getDiversificationClass(assetCount) {
    if (assetCount >= 10) return 'excellent';
    if (assetCount >= 5) return 'good';
    if (assetCount >= 3) return 'fair';
    return 'poor';
}

// Add animations to metric cards
function addMetricAnimations() {
    const metricCards = document.querySelectorAll('.metric-card');
    metricCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.style.animation = 'slideInFromBottom 0.5s ease-out forwards';
        card.style.opacity = '0';
        
        setTimeout(() => {
            card.style.opacity = '1';
        }, index * 100);
    });
}

// Update portfolio insights
function updatePortfolioInsights(performance) {
    const insights = generatePortfolioInsights(performance);
    displayInsights(insights);
}

// Generate portfolio insights
function generatePortfolioInsights(performance) {
    const insights = [];
    
    if (performance.length === 0) {
        insights.push({
            type: 'info',
            icon: 'fas fa-info-circle',
            title: 'No Data Available',
            message: 'Add assets to your portfolio to see insights and recommendations.'
        });
        return insights;
    }
    
    const totalGain = performance.reduce((sum, asset) => sum + asset.gain_loss, 0);
    const bestPerformer = performance.reduce((best, asset) => 
        asset.gain_loss > best.gain_loss ? asset : best
    );
    const worstPerformer = performance.reduce((worst, asset) => 
        asset.gain_loss < worst.gain_loss ? asset : worst
    );
    
    // Overall performance insight
    if (totalGain > 0) {
        insights.push({
            type: 'success',
            icon: 'fas fa-arrow-up',
            title: 'Positive Performance',
            message: `Your portfolio is up $${totalGain.toFixed(2)}. Great job!`
        });
    } else {
        insights.push({
            type: 'warning',
            icon: 'fas fa-arrow-down',
            title: 'Negative Performance',
            message: `Your portfolio is down $${Math.abs(totalGain).toFixed(2)}. Consider reviewing your strategy.`
        });
    }
    
    // Best performer insight
    if (bestPerformer.gain_loss > 0) {
        insights.push({
            type: 'success',
            icon: 'fas fa-star',
            title: 'Top Performer',
            message: `${bestPerformer.symbol} is your best performing asset with $${bestPerformer.gain_loss.toFixed(2)} gain.`
        });
    }
    
    // Worst performer insight
    if (worstPerformer.gain_loss < 0) {
        insights.push({
            type: 'warning',
            icon: 'fas fa-exclamation-triangle',
            title: 'Underperforming Asset',
            message: `${worstPerformer.symbol} is down $${Math.abs(worstPerformer.gain_loss).toFixed(2)}. Consider reviewing this position.`
        });
    }
    
    // Diversification insight
    if (performance.length < 5) {
        insights.push({
            type: 'info',
            icon: 'fas fa-lightbulb',
            title: 'Diversification Opportunity',
            message: 'Consider adding more assets to diversify your portfolio and reduce risk.'
        });
    }
    
    return insights;
}

// Display insights
function displayInsights(insights) {
    const analyticsContainer = document.getElementById('analytics');
    let insightsSection = analyticsContainer.querySelector('.insights-section');
    
    if (!insightsSection) {
        insightsSection = document.createElement('div');
        insightsSection.className = 'insights-section';
        insightsSection.style.cssText = `
            margin-top: 30px;
            padding: 20px;
            background: rgba(26, 26, 26, 0.9);
            border-radius: 15px;
            border: 1px solid rgba(0, 255, 136, 0.2);
        `;
        analyticsContainer.appendChild(insightsSection);
    }
    
    insightsSection.innerHTML = `
        <h3 style="margin-bottom: 20px; color: var(--text-white);">
            <i class="fas fa-lightbulb" style="color: var(--primary-green); margin-right: 10px;"></i>
            Portfolio Insights
        </h3>
        <div class="insights-grid">
            ${insights.map((insight, index) => `
                <div class="insight-card ${insight.type}" style="animation-delay: ${index * 0.1}s;">
                    <div class="insight-icon">
                        <i class="${insight.icon}"></i>
                    </div>
                    <div class="insight-content">
                        <h4>${insight.title}</h4>
                        <p>${insight.message}</p>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Update historical chart
function updateHistoricalChart(historicalData) {
    if (!portfolioChart) return;
    
    const labels = historicalData.map(item => item.month);
    const data = historicalData.map(item => item.value);
    
    portfolioChart.data.labels = labels;
    portfolioChart.data.datasets[0].data = data;
    portfolioChart.update('active');
}

// Update allocation chart
function updateAllocationChart(allocationData) {
    if (!allocationChart) return;
    
    const labels = allocationData.map(item => item.type);
    const data = allocationData.map(item => item.value);
    
    allocationChart.data.labels = labels;
    allocationChart.data.datasets[0].data = data;
    allocationChart.update('active');
}

// ===== ADVANCED ANALYTICS =====

// Calculate correlation matrix
function calculateCorrelationMatrix(assets) {
    // This would typically use historical price data
    // For now, we'll return a simplified correlation matrix
    const correlationMatrix = {};
    
    assets.forEach(asset1 => {
        correlationMatrix[asset1.symbol] = {};
        assets.forEach(asset2 => {
            if (asset1.symbol === asset2.symbol) {
                correlationMatrix[asset1.symbol][asset2.symbol] = 1;
            } else {
                // Simplified correlation calculation
                correlationMatrix[asset1.symbol][asset2.symbol] = Math.random() * 0.8 + 0.1;
            }
        });
    });
    
    return correlationMatrix;
}

// Generate portfolio recommendations
function generateRecommendations(performance, riskMetrics) {
    const recommendations = [];
    
    // Risk-based recommendations
    if (riskMetrics.volatility > 15) {
        recommendations.push({
            type: 'warning',
            title: 'High Volatility',
            message: 'Consider adding more stable assets like bonds to reduce portfolio volatility.',
            action: 'Add bonds to portfolio'
        });
    }
    
    // Performance-based recommendations
    const negativeAssets = performance.filter(asset => asset.gain_loss < 0);
    if (negativeAssets.length > performance.length * 0.5) {
        recommendations.push({
            type: 'warning',
            title: 'Multiple Underperformers',
            message: 'More than half of your assets are underperforming. Consider rebalancing.',
            action: 'Review and rebalance'
        });
    }
    
    // Diversification recommendations
    if (performance.length < 3) {
        recommendations.push({
            type: 'info',
            title: 'Low Diversification',
            message: 'Your portfolio has few assets. Consider adding more to spread risk.',
            action: 'Add more assets'
        });
    }
    
    return recommendations;
}

// ===== HISTORICAL PORTFOLIO VALUE FUNCTIONS =====

// ===== EXPORT FUNCTIONS =====
window.AnalyticsManager = {
    loadAnalytics,
    updatePerformanceChart,
    updateRiskMetrics,
    calculateRiskMetrics,
    generatePortfolioInsights,
    generateRecommendations
}; 