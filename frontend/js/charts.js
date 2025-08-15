// ===== CHART CONFIGURATION =====
const chartColors = {
    primary: '#00ff88',
    secondary: '#00cc6a',
    accent: '#00ffaa',
    dark: '#008f4d',
    success: '#00ff88',
    danger: '#ff4444',
    warning: '#ffaa00',
    info: '#00aaff'
};

// Distinct colors for asset allocation chart
const allocationColors = [
    '#00ff88', // Bright green for stocks
    '#ff6b35', // Orange for bonds
    '#4ecdc4', // Teal for cash
    '#45b7d1', // Blue for other assets
    '#96ceb4', // Mint green
    '#feca57', // Yellow
    '#ff9ff3', // Pink
    '#54a0ff', // Light blue
    '#5f27cd', // Purple
    '#00d2d3'  // Cyan
];

const chartGradients = {
    primary: 'linear-gradient(135deg, #00ff88, #00cc6a)',
    secondary: 'linear-gradient(135deg, #00cc6a, #008f4d)',
    accent: 'linear-gradient(135deg, #00ffaa, #00ff88)'
};

// ===== CHART INITIALIZATION =====
function initializeCharts() {
    console.log('📊 Initializing charts...');
    
    // Portfolio value chart
    initializePortfolioChart();
    
    // Asset allocation chart
    initializeAllocationChart();
    
    // Performance chart
    initializePerformanceChart();
    
    // Add chart animations
    addChartAnimations();
}

function initializePortfolioChart() {
    const ctx = document.getElementById('portfolioChart');
    if (!ctx) return;
    
    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(0, 255, 136, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 255, 136, 0.0)');
    
    portfolioChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Portfolio Value',
                data: [],
                borderColor: chartColors.primary,
                backgroundColor: gradient,
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: chartColors.primary,
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointHoverBackgroundColor: chartColors.accent,
                pointHoverBorderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(26, 26, 26, 0.95)',
                    titleColor: '#ffffff',
                    bodyColor: '#cccccc',
                    borderColor: chartColors.primary,
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return `Value: $${context.parsed.y.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(0, 255, 136, 0.1)',
                        borderColor: 'rgba(0, 255, 136, 0.2)'
                    },
                    ticks: {
                        color: '#cccccc',
                        font: {
                            size: 12
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 255, 136, 0.1)',
                        borderColor: 'rgba(0, 255, 136, 0.2)'
                    },
                    ticks: {
                        color: '#cccccc',
                        font: {
                            size: 12
                        },
                        callback: function(value) {
                            return '$' + value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                        }
                    }
                }
            },
            animation: {
                duration: 2000,
                easing: 'easeOutQuart'
            }
        }
    });
}

function initializeAllocationChart() {
    const ctx = document.getElementById('allocationChart');
    if (!ctx) return;
    
    allocationChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: allocationColors,
                borderColor: '#000000',
                borderWidth: 2,
                hoverBorderColor: '#000000',
                hoverBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#cccccc',
                        font: {
                            size: 12,
                            weight: '600'
                        },
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(26, 26, 26, 0.95)',
                    titleColor: '#ffffff',
                    bodyColor: '#cccccc',
                    borderColor: chartColors.primary,
                    borderWidth: 1,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: $${context.parsed.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} (${percentage}%)`;
                        }
                    }
                }
            },
            animation: {
                animateRotate: true,
                animateScale: true,
                duration: 2000,
                easing: 'easeOutQuart'
            }
        }
    });
}

function initializePerformanceChart() {
    const ctx = document.getElementById('performanceChart');
    if (!ctx) return;
    
    performanceChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Gain/Loss',
                data: [],
                backgroundColor: [],
                borderColor: chartColors.primary,
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(26, 26, 26, 0.95)',
                    titleColor: '#ffffff',
                    bodyColor: '#cccccc',
                    borderColor: chartColors.primary,
                    borderWidth: 1,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed.y;
                            return `${value >= 0 ? '+' : ''}$${value.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(0, 255, 136, 0.1)',
                        borderColor: 'rgba(0, 255, 136, 0.2)'
                    },
                    ticks: {
                        color: '#cccccc',
                        font: {
                            size: 12
                        }
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(0, 255, 136, 0.1)',
                        borderColor: 'rgba(0, 255, 136, 0.2)'
                    },
                    ticks: {
                        color: '#cccccc',
                        font: {
                            size: 12
                        },
                        callback: function(value) {
                            return '$' + value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                        }
                    }
                }
            },
            animation: {
                duration: 1500,
                easing: 'easeOutQuart'
            }
        }
    });
}

// ===== CHART UPDATES =====
function updateCharts(assets, totalValue, detailedSummary) {
    updatePortfolioChart(assets, totalValue);
    updateAllocationChart(assets, detailedSummary);
}

// ===== PORTFOLIO RANGE BUTTONS =====
let currentPortfolioRange = '7d';
// Asset filtering removed - always show all portfolio data

document.addEventListener('DOMContentLoaded', function() {
    const btnGroup = document.getElementById('portfolioRangeBtnGroup');
    if (btnGroup) {
        btnGroup.addEventListener('click', function(e) {
            if (e.target.classList.contains('range-btn')) {
                document.querySelectorAll('.range-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                updatePortfolioChartRange(e.target.dataset.range);
            }
        });
    }
    // Asset select dropdown removed - always show all portfolio data
});

async function updatePortfolioChartRange(range) {
    currentPortfolioRange = range;
    await updatePortfolioChartWithRange(null, range);
}

function updatePortfolioChart(assets, totalValue) {
    window.lastPortfolioTotalValue = totalValue.totalValue;
    updatePortfolioChartWithRange(null, currentPortfolioRange);
}

async function updatePortfolioChartWithRange(currentValue, range) {
    if (!portfolioChart) return;
    // Fetch real data from backend - always show all portfolio data
    let url = `/api/portfolio/history?range=${range}`;
    if (window.API_BASE) url = window.API_BASE + url;
    
    console.log('Fetching portfolio history from:', url);
    
    try {
        const res = await fetch(url);
        const data = await res.json();
        console.log('Received portfolio history data:', data);
        
        const labels = data.map(d => d.date);
        const values = data.map(d => d.value);
        
        console.log('Portfolio history labels:', labels);
        console.log('Portfolio history values:', values);
        portfolioChart.data.labels = labels;
        portfolioChart.data.datasets[0].data = values;
        
        // Update Total Portfolio Value to match the last value in the trend
        if (values.length > 0) {
            const lastValue = values[values.length - 1];
            const totalValueElement = document.getElementById('totalValue');
            if (totalValueElement) {
                // Update with proper currency formatting
                totalValueElement.textContent = `$${lastValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
            }
        }
        
        // Always use primary color for portfolio trend
        portfolioChart.data.datasets[0].borderColor = chartColors.primary;
        portfolioChart.data.datasets[0].pointBackgroundColor = chartColors.primary;
        portfolioChart.data.datasets[0].backgroundColor = 'rgba(0,255,136,0.08)';
        portfolioChart.options.scales.x.grid.color = 'rgba(0,255,136,0.08)';
        portfolioChart.options.scales.y.grid.color = 'rgba(0,255,136,0.08)';
        portfolioChart.options.scales.x.ticks.color = '#00ff88';
        portfolioChart.options.scales.y.ticks.color = '#00ff88';
        portfolioChart.options.plugins.legend.display = false;
        portfolioChart.options.plugins.tooltip.enabled = true;
        portfolioChart.options.plugins.tooltip.backgroundColor = 'rgba(26,26,26,0.95)';
        portfolioChart.options.plugins.tooltip.titleColor = '#00ff88';
        portfolioChart.options.plugins.tooltip.bodyColor = '#cccccc';
        portfolioChart.options.plugins.tooltip.borderColor = '#00ff88';
        portfolioChart.options.plugins.tooltip.callbacks = {
            label: function(context) {
                return `Value: $${context.parsed.y.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}\nDate: ${context.label}`;
            }
        };
        portfolioChart.data.datasets[0].pointRadius = 0;
        portfolioChart.data.datasets[0].pointHoverRadius = 0;
        portfolioChart.data.datasets[0].borderWidth = 3;
        // Dynamically set y-axis min, max, and stepSize
        if (values.length > 0) {
            const min = Math.min(...values);
            const max = Math.max(...values);
            const range = max - min;
            const niceMin = Math.floor((min - range * 0.1) / 100) * 100;
            const niceMax = Math.ceil((max + range * 0.1) / 100) * 100;
            // Aim for 8–14 steps
            let step = Math.pow(10, Math.floor(Math.log10(range / 10)));
            if (range / step > 14) step *= 2;
            if (range / step < 8) step /= 2;
            if (step < 1) step = 1;
            portfolioChart.options.scales.y.min = niceMin;
            portfolioChart.options.scales.y.max = niceMax;
            portfolioChart.options.scales.y.ticks.stepSize = step;
        }
        portfolioChart.update('active');
    } catch (e) {
        // fallback to simulated data if error
        let labels = [], values = [];
        if (range === '7d') {
            // Generate actual dates for the last 7 days
            labels = [];
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                labels.push(date.toISOString().slice(0, 10));
            }
            values = generateHistoricalData(currentValue || 10000, 7);
        } else if (range === '30d') {
            // Generate actual dates for the last 30 days
            labels = [];
            for (let i = 29; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                labels.push(date.toISOString().slice(0, 10));
            }
            values = generateHistoricalData(currentValue || 10000, 30);
        }
        portfolioChart.data.labels = labels;
        portfolioChart.data.datasets[0].data = values;
        portfolioChart.update('active');
    }
}

function updateAllocationChart(assets, detailedSummary) {
    if (!allocationChart) return;
    
    // Use detailed summary if available, otherwise calculate from assets
    let allocationData = {};
    
    if (detailedSummary && detailedSummary.assetTypes) {
        allocationData = detailedSummary.assetTypes;
    } else {
        // Calculate allocation data from assets
        assets.forEach(asset => {
            const value = asset.quantity * asset.current_price;
            allocationData[asset.asset_type] = (allocationData[asset.asset_type] || 0) + value;
        });
    }
    
    const labels = Object.keys(allocationData).map(type => 
        type === 'stock' ? 'Stocks' : type === 'bond' ? 'Bonds' : 'Cash'
    );
    const data = Object.values(allocationData);
    
    // Assign specific colors to each asset type
    const colors = labels.map((label, index) => {
        if (label === 'Stocks') return allocationColors[0]; // Bright green
        if (label === 'Bonds') return allocationColors[1];  // Orange
        if (label === 'Cash') return allocationColors[2];   // Teal
        return allocationColors[index % allocationColors.length]; // Fallback for other types
    });
    
    allocationChart.data.labels = labels;
    allocationChart.data.datasets[0].data = data;
    allocationChart.data.datasets[0].backgroundColor = colors;
    allocationChart.update('active');
}

function updatePerformanceChart(performance) {
    if (!performanceChart) return;
    
    const labels = performance.map(asset => asset.symbol);
    const data = performance.map(asset => asset.gain_loss);
    const colors = data.map(value => value >= 0 ? chartColors.success : chartColors.danger);
    const borderColors = data.map(value => value >= 0 ? chartColors.primary : chartColors.danger);
    performanceChart.data.labels = labels;
    performanceChart.data.datasets[0].data = data;
    performanceChart.data.datasets[0].backgroundColor = colors;
    performanceChart.data.datasets[0].borderColor = borderColors;
    performanceChart.update('active');
}

// ===== UTILITY FUNCTIONS =====
function generateHistoricalData(currentValue, len = 6) {
    const data = [];
    let value = currentValue * 0.8;
    for (let i = 0; i < len; i++) {
        const variation = (Math.random() - 0.5) * 0.1;
        value = value * (1 + variation);
        data.push(Math.max(value, currentValue * 0.7));
    }
    data[data.length - 1] = currentValue;
    return data;
}

function addChartAnimations() {
    // Add hover effects to chart containers
    const chartContainers = document.querySelectorAll('.chart-container');
    chartContainers.forEach(container => {
        container.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.02)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        container.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
}

// ===== CHART THEMES =====
function applyChartTheme(theme = 'dark') {
    const themes = {
        dark: {
            backgroundColor: 'rgba(26, 26, 26, 0.9)',
            textColor: '#cccccc',
            gridColor: 'rgba(0, 255, 136, 0.1)',
            borderColor: 'rgba(0, 255, 136, 0.2)'
        },
        light: {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            textColor: '#333333',
            gridColor: 'rgba(0, 0, 0, 0.1)',
            borderColor: 'rgba(0, 0, 0, 0.2)'
        }
    };
    
    const currentTheme = themes[theme];
    
    // Update all charts with new theme
    [portfolioChart, allocationChart, performanceChart].forEach(chart => {
        if (chart && chart.options) {
            // Update scales
            if (chart.options.scales) {
                Object.values(chart.options.scales).forEach(scale => {
                    if (scale.grid) {
                        scale.grid.color = currentTheme.gridColor;
                        scale.grid.borderColor = currentTheme.borderColor;
                    }
                    if (scale.ticks) {
                        scale.ticks.color = currentTheme.textColor;
                    }
                });
            }
            
            // Update plugins
            if (chart.options.plugins) {
                if (chart.options.plugins.legend && chart.options.plugins.legend.labels) {
                    chart.options.plugins.legend.labels.color = currentTheme.textColor;
                }
                if (chart.options.plugins.tooltip) {
                    chart.options.plugins.tooltip.backgroundColor = currentTheme.backgroundColor;
                }
            }
            
            chart.update('none');
        }
    });
}

// ===== CHART EXPORTS =====
window.ChartManager = {
    updateCharts,
    updatePerformanceChart,
    applyChartTheme,
    generateHistoricalData
}; 