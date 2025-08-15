// ===== GLOBAL VARIABLES =====
const API_BASE = 'http://localhost:3000';
let portfolioChart, allocationChart, performanceChart;
let currentAssets = [];
let isLoading = false;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Portfolio Manager Initializing...');
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    initializeCharts();
    loadPortfolioData();
    startAutoRefresh();
    addDynamicEffects();
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Form submissions
    document.getElementById('buyForm').addEventListener('submit', handleBuy);
    document.getElementById('sellForm').addEventListener('submit', handleSell);
    
    // Real-time form validation
    setupFormValidation();
    
    // Keyboard shortcuts
    setupKeyboardShortcuts();
    
    // Mouse effects
    setupMouseEffects();
}

function showLoading(show) {
    isLoading = show;
    const overlay = document.getElementById('loadingOverlay');
    
    if (show) {
        overlay.classList.add('show');
    } else {
        overlay.classList.remove('show');
    }
}

function setupFormValidation() {
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            validateField(this);
        });
        
        input.addEventListener('blur', function() {
            validateField(this);
        });
    });
}

function validateField(field) {
    const value = field.value.trim();
    const isValid = value.length > 0;
    
    if (isValid) {
        field.style.borderColor = 'var(--success-green)';
        field.style.boxShadow = '0 0 0 3px rgba(0, 255, 136, 0.1)';
    } else {
        field.style.borderColor = 'var(--danger-red)';
        field.style.boxShadow = '0 0 0 3px rgba(255, 68, 68, 0.1)';
    }
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + 1-4 for tab switching
        if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '4') {
            e.preventDefault();
            const tabs = ['overview', 'trading', 'history', 'analytics'];
            showTab(tabs[parseInt(e.key) - 1]);
        }
        
        // Escape to close notifications
        if (e.key === 'Escape') {
            hideNotification();
        }
    });
}

function setupMouseEffects() {
    // Add hover effects to cards
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// ===== TAB NAVIGATION =====
function showTab(tabName) {
    // Hide all tab contents with animation
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.opacity = '0';
        tab.style.transform = 'translateY(20px)';
        setTimeout(() => {
            tab.style.display = 'none';
        }, 300);
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab with animation
    setTimeout(() => {
        const selectedTab = document.getElementById(tabName);
        selectedTab.style.display = 'block';
        setTimeout(() => {
            selectedTab.style.opacity = '1';
            selectedTab.style.transform = 'translateY(0)';
        }, 50);
    }, 300);
    
    // Add active class to clicked tab
    event.target.classList.add('active');
    
    // Load specific data for each tab
    loadTabData(tabName);
}

function loadTabData(tabName) {
    switch(tabName) {
        case 'overview':
            loadPortfolioData();
            break;
        case 'trading':
            loadAssetsForTrading();
            break;
        case 'history':
            // Calendar is initialized automatically, just refresh transaction dates
            if (window.CalendarManager) {
                window.CalendarManager.loadTransactionDates();
            }
            break;
        case 'analytics':
            loadAnalytics();
            break;
    }
}

// ===== DATA LOADING =====
async function loadPortfolioData() {
    if (isLoading) return;
    
    showLoading(true);
    
    try {
        const [assetsResponse, totalValueResponse, performanceResponse, detailedSummaryResponse] = await Promise.all([
            fetch(`${API_BASE}/api/portfolio/summary`),
            fetch(`${API_BASE}/api/portfolio/value/total`),
            fetch(`${API_BASE}/api/portfolio/performance`),
            fetch(`${API_BASE}/api/portfolio/summary/detailed`)
        ]);

        const assets = await assetsResponse.json();
        const totalValue = await totalValueResponse.json();
        const performance = await performanceResponse.json();
        const detailedSummary = await detailedSummaryResponse.json();

        currentAssets = assets;
        updatePortfolioStats(totalValue, performance);
        updateAssetsList(assets);
        updateCharts(assets, totalValue, detailedSummary);
        updateSellForm(assets);
        await loadAllocationDataAndUpdateChart();
        
        // Ensure Total Portfolio Value is set to the last trend value
        // If chart hasn't updated it yet, use the API value as fallback
        // const totalValueEl = document.getElementById('totalValue');
        // if (totalValueEl && totalValueEl.textContent === '$0') {
        //     animateNumber(totalValueEl, totalValue.totalValue, '$');
        // }
        
        // showNotification('Data refreshed successfully!', 'success');
    } catch (error) {
        console.error('Error loading portfolio data:', error);
        showNotification('Failed to load data: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// ===== PORTFOLIO STATS =====
let initialInvestment = 10000;
let statsLocked = false;
let lockedStats = { gain: 0, ret: 0 };

function updatePortfolioStats(totalValue, performance) {
    const totalValueEl = document.getElementById('totalValue');
    const totalGainEl = document.getElementById('totalGain');
    const totalReturnEl = document.getElementById('totalReturn');
    
    // 只在第一次加载时计算并锁定
    if (!statsLocked) {
        lockedStats.value = totalValue.totalValue;
        lockedStats.gain = totalValue.totalValue - initialInvestment;
        lockedStats.ret = (lockedStats.gain / initialInvestment) * 100;
        statsLocked = true;
    }
    // 之后只显示第一次的结果
    animateNumber(totalValueEl, lockedStats.value, '$');
    animateNumber(totalGainEl, lockedStats.gain, '$');
    animateNumber(totalReturnEl, lockedStats.ret, '', '%');
    totalGainEl.className = `stat-value ${lockedStats.gain >= 0 ? 'positive' : 'negative'}`;
    totalReturnEl.className = `stat-value ${lockedStats.ret >= 0 ? 'positive' : 'negative'}`;
}

function animateNumber(element, targetValue, prefix = '', suffix = '') {
    const startValue = parseFloat(element.textContent.replace(/[^0-9.-]/g, '')) || 0;
    const duration = 1000;
    const startTime = performance.now();
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const currentValue = startValue + (targetValue - startValue) * easeOutCubic(progress);
        
        if (prefix === '$') {
            // Round to 2 decimal places for currency values
            element.textContent = `${prefix}${currentValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
        } else {
            element.textContent = `${prefix}${currentValue.toFixed(2)}${suffix}`;
        }
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }
    
    requestAnimationFrame(updateNumber);
}

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

// ===== ASSETS LIST =====
function updateAssetsList(assets) {
    const assetsList = document.getElementById('assetsList');
    assetsList.innerHTML = '';
    if (assets.length === 0) {
        assetsList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-gray);">
                <i class="fas fa-briefcase" style="font-size: 48px; margin-bottom: 20px; opacity: 0.5;"></i>
                <p>No assets found</p>
                <p style="font-size: 14px; margin-top: 10px;">Start by adding your first asset in the Trading tab</p>
            </div>
        `;
        return;
    }
    
    // Get only the latest holdings for each asset (don't sum across dates)
    const latestAssetsMap = {};
    assets.forEach(asset => {
        const key = `${asset.symbol}_${asset.asset_type}`;
        const assetDate = new Date(asset.updated_at);
        
        // Keep only the most recent entry for each asset
        if (!latestAssetsMap[key] || new Date(latestAssetsMap[key].updated_at) < assetDate) {
            latestAssetsMap[key] = asset;
        }
    });
    
    const latestAssets = Object.values(latestAssetsMap);
    
    latestAssets.forEach((asset, index) => {
        const quantity = Number(asset.quantity);
        const currentPrice = Number(asset.current_price);
        const avgPurchasePrice = Number(asset.average_purchase_price);
        const assetValue = quantity * currentPrice;
        const gainLoss = (currentPrice - avgPurchasePrice) * quantity;
        const gainLossPercent = avgPurchasePrice > 0 ? ((currentPrice - avgPurchasePrice) / avgPurchasePrice * 100) : 0;
        
        const assetItem = document.createElement('div');
        assetItem.className = 'asset-item';
        assetItem.style.animationDelay = `${index * 0.1}s`;
        assetItem.style.animation = 'slideInFromLeft 0.5s ease-out forwards';
        assetItem.innerHTML = `
            <div class="asset-info">
                <div class="asset-icon ${asset.asset_type}">
                    ${asset.asset_type === 'stock' ? '📈' : asset.asset_type === 'bond' ? '📊' : '💰'}
                </div>
                <div class="asset-details">
                    <h4>${asset.asset_name}</h4>
                    <p>${asset.symbol} ${quantity.toFixed(2)} ${(asset.asset_type === 'stock') ? 'shares' : (asset.asset_type === 'bond') ? 'bonds' : ''}</p>
                </div>
            </div>
            <div class="asset-value">
                <h4>$${assetValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</h4>
                <p class="${gainLoss >= 0 ? 'positive' : 'negative'}">
                    ${gainLoss >= 0 ? '+' : ''}$${gainLoss.toFixed(2)} (${gainLossPercent >= 0 ? '+' : ''}${gainLossPercent.toFixed(2)}%)
                </p>
            </div>
        `;
        assetsList.appendChild(assetItem);
        setTimeout(() => {
            assetItem.style.opacity = '1';
        }, index * 100);
    });
}

// Fetch allocation data from backend and update chart
async function loadAllocationDataAndUpdateChart() {
    try {
        const response = await fetch(`${API_BASE}/api/portfolio/analytics/allocation`);
        const allocationData = await response.json();
        updateAllocationChartFromBackend(allocationData);
    } catch (error) {
        showNotification('Failed to load allocation data: ' + error.message, 'error');
    }
}

function updateAllocationChartFromBackend(allocationData) {
    if (!allocationChart) return;
    const labels = allocationData.map(item => item.type);
    const data = allocationData.map(item => item.value);
    allocationChart.data.labels = labels;
    allocationChart.data.datasets[0].data = data;
    allocationChart.update('active');
}

// ===== LOADING STATES =====
function showLoading(show) {
    isLoading = show;
    const overlay = document.getElementById('loadingOverlay');
    
    if (show) {
        overlay.classList.add('show');
    } else {
        overlay.classList.remove('show');
    }
}

// ===== NOTIFICATIONS =====
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    // Auto-hide after 4 seconds
    setTimeout(() => {
        hideNotification();
    }, 4000);
}

function hideNotification() {
    const notification = document.getElementById('notification');
    notification.classList.remove('show');
}

// ===== AUTO REFRESH =====
function startAutoRefresh() {
    // Refresh data every 30 seconds
    setInterval(() => {
        if (!isLoading) {
            loadPortfolioData();
        }
    }, 30000);
}

// ===== DYNAMIC EFFECTS =====
function addDynamicEffects() {
    // Add particle effects to header
    addParticleEffects();
    
    // Add typing effect to logo
    addTypingEffect();
}



function addParticleEffects() {
    const header = document.querySelector('.header');
    
    // Create floating particles
    for (let i = 0; i < 5; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            background: var(--primary-green);
            border-radius: 50%;
            opacity: 0.6;
            animation: float ${3 + i}s ease-in-out infinite;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
        `;
        header.appendChild(particle);
    }
}

function addTypingEffect() {
    const logo = document.querySelector('.logo');
    const text = logo.textContent;
    logo.textContent = '';
    
    let i = 0;
    const typeWriter = () => {
        if (i < text.length) {
            logo.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, 100);
        }
    };
    
    setTimeout(typeWriter, 1000);
}

// ===== UTILITY FUNCTIONS =====
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatPercentage(value) {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

// Export functions for other modules
window.PortfolioManager = {
    showTab,
    loadPortfolioData,
    showNotification,
    formatCurrency,
    formatPercentage
}; 