// ===== TRADING FUNCTIONS =====

// Handle buy form submission
async function handleBuy(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    
    // Show loading state
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    submitButton.disabled = true;
    
    try {
        const currentPrice = parseFloat(document.getElementById('buyCurrentPrice').value);
        const formData = {
            asset_type: document.getElementById('buyAssetType').value,
            asset_name: document.getElementById('buyAssetName').value,
            symbol: document.getElementById('buySymbol').value,
            quantity: parseFloat(document.getElementById('buyQuantity').value),
            average_purchase_price: currentPrice, // Use current price as purchase price
            current_price: currentPrice
        };

        // Validate form data
        if (!validateBuyForm(formData)) {
            throw new Error('Please fill in all required fields correctly');
        }

        // Buy operation (handles cash flow)
        const response = await fetch(`${API_BASE}/api/portfolio/buy`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            // Create transaction record for history
            const transactionData = {
                asset_type: formData.asset_type,
                asset_name: formData.asset_name,
                symbol: formData.symbol,
                transaction_type: 'buy',
                quantity: formData.quantity,
                price: formData.average_purchase_price,
                total_value: formData.quantity * formData.average_purchase_price,
                notes: `Purchased ${formData.quantity} ${formData.asset_type === 'stock' ? 'shares' : formData.asset_type === 'bond' ? 'bonds' : ''} of ${formData.asset_name}`
            };
            
            try {
                await fetch(`${API_BASE}/api/portfolio/transactions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(transactionData)
                });
            } catch (transactionError) {
                console.warn('Failed to create transaction record:', transactionError);
            }
            
            showNotification('Asset purchased successfully! 🎉', 'success');
            form.reset();
            resetFormValidation(form);
            
            // Add success animation
            addSuccessAnimation(form);
            
            // Reload portfolio data
            await loadPortfolioData();
            
            // Refresh calendar transaction dates
            if (window.CalendarManager) {
                window.CalendarManager.loadTransactionDates();
            }
        } else {
            const error = await response.json();
            throw new Error(error.error || 'Purchase failed');
        }
    } catch (error) {
        console.error('Buy error:', error);
        showNotification('Purchase failed: ' + error.message, 'error');
        
        // Add error animation
        addErrorAnimation(form);
    } finally {
        // Reset button state
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }
}

// Handle sell form submission
async function handleSell(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    
    // Show loading state
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    submitButton.disabled = true;
    
    try {
        const selectedValue = document.getElementById('sellAssetId').value;
        const quantity = parseFloat(document.getElementById('sellQuantity').value);
        const price = parseFloat(document.getElementById('sellPrice').value);

        if (!validateSellForm(selectedValue, quantity, price)) {
            throw new Error('Please fill in all required fields correctly');
        }

        // Parse the selected value to get symbol and asset type
        const [symbol, assetType] = selectedValue.split('|');
        
        // Find the asset to sell by symbol and type
        const asset = currentAssets.find(a => a.symbol === symbol && a.asset_type === assetType);
        if (!asset) {
            throw new Error('Asset not found');
        }

        if (quantity > asset.quantity) {
            throw new Error(`Sell quantity (${quantity}) cannot exceed current holdings (${asset.quantity})`);
        }
        
        // Additional validation: ensure we're not selling more than we own
        if (asset.quantity <= 0) {
            throw new Error('Cannot sell assets with zero or negative quantity');
        }

        const newQuantity = asset.quantity - quantity;
        const response = await fetch(`${API_BASE}/api/portfolio/${asset.id}/sell`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                quantity: quantity,
                price: price
            })
        });

        if (response.ok) {
            // Create transaction record for history
            const transactionData = {
                asset_type: asset.asset_type,
                asset_name: asset.asset_name,
                symbol: asset.symbol,
                transaction_type: 'sell',
                quantity: quantity,
                price: price,
                total_value: quantity * price,
                notes: `Sold ${quantity} ${asset.asset_type === 'stock' ? 'shares' : asset.asset_type === 'bond' ? 'bonds' : ''} of ${asset.asset_name}`
            };
            
            try {
                await fetch(`${API_BASE}/api/portfolio/transactions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(transactionData)
                });
            } catch (transactionError) {
                console.warn('Failed to create transaction record:', transactionError);
            }
            
            showNotification('Asset sold successfully! 💰', 'success');
            form.reset();
            resetFormValidation(form);
            
            // Add success animation
            addSuccessAnimation(form);
            
            // Reload portfolio data
            await loadPortfolioData();
            
            // Refresh calendar transaction dates
            if (window.CalendarManager) {
                window.CalendarManager.loadTransactionDates();
            }
        } else {
            const error = await response.json();
            throw new Error(error.error || 'Sale failed');
        }
    } catch (error) {
        console.error('Sell error:', error);
        showNotification('Sale failed: ' + error.message, 'error');
        
        // Add error animation
        addErrorAnimation(form);
    } finally {
        // Reset button state
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }
}

// ===== FORM VALIDATION =====
function validateBuyForm(data) {
    const required = ['asset_type', 'asset_name', 'symbol', 'quantity', 'current_price'];
    
    for (const field of required) {
        if (!data[field] || data[field] <= 0) {
            return false;
        }
    }
    
    // Additional validation
    if (data.quantity <= 0) return false;
    if (data.current_price <= 0) return false;
    
    return true;
}

function validateSellForm(assetId, quantity, price) {
    if (!assetId) return false;
    if (quantity <= 0) return false;
    if (price <= 0) return false;
    
    return true;
}

function resetFormValidation(form) {
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.style.borderColor = 'rgba(0, 255, 136, 0.2)';
        input.style.boxShadow = 'none';
    });
}

// ===== LOAD ASSETS FOR TRADING =====
function loadAssetsForTrading() {
    updateSellForm(currentAssets);
    setupAssetTypeChange();
}

function updateSellForm(assets) {
    const sellAssetSelect = document.getElementById('sellAssetId');
    sellAssetSelect.innerHTML = '<option value="">Select Asset to Sell</option>';
    if (assets.length === 0) {
        sellAssetSelect.innerHTML = '<option value="" disabled>No assets available</option>';
        return;
    }
    // Merge assets by symbol and type
    const mergedMap = {};
    assets.forEach(asset => {
        const key = `${asset.symbol}_${asset.asset_type}`;
        if (!mergedMap[key]) {
            mergedMap[key] = {
                ...asset,
                totalQuantity: 0,
                weightedPriceSum: 0
            };
        }
        mergedMap[key].totalQuantity += Number(asset.quantity);
        mergedMap[key].weightedPriceSum += Number(asset.average_purchase_price) * Number(asset.quantity);
    });
    const mergedAssets = Object.values(mergedMap).map(asset => {
        const avgPurchasePrice = asset.totalQuantity > 0 ? (asset.weightedPriceSum / asset.totalQuantity) : 0;
        return {
            ...asset,
            quantity: asset.totalQuantity,
            average_purchase_price: avgPurchasePrice
        };
    });
    mergedAssets.forEach(asset => {
        // Only show assets with positive quantity
        if (asset.quantity > 0) {
        const option = document.createElement('option');
            option.value = asset.symbol + '|' + asset.asset_type; // Use symbol+type as value
            option.textContent = `${asset.asset_name} (${asset.symbol}) - ${asset.quantity} ${(asset.asset_type === 'stock') ? 'shares' : (asset.asset_type === 'bond') ? 'bonds' : ''} @ $${asset.current_price}`;
            option.dataset.symbol = asset.symbol;
            option.dataset.assetType = asset.asset_type;
            option.dataset.price = asset.current_price;
            option.dataset.quantity = asset.quantity;
        sellAssetSelect.appendChild(option);
        }
    });
    // Add change event to auto-fill current price with real-time data
    sellAssetSelect.addEventListener('change', async function() {
        const selected = sellAssetSelect.options[sellAssetSelect.selectedIndex];
        const sellPriceInput = document.getElementById('sellPrice');
        
        if (selected && selected.value) {
            const symbol = selected.dataset.symbol;
            const assetType = selected.dataset.assetType;
            
            // Show loading state
            sellPriceInput.value = 'Loading...';
            sellPriceInput.style.color = '#ffaa00';
            
            // Fetch latest real-time price from database
            try {
                const response = await fetch(`${API_BASE}/api/portfolio/current-price?symbol=${encodeURIComponent(symbol)}&asset_type=${encodeURIComponent(assetType)}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.current_price !== undefined) {
                        sellPriceInput.value = data.current_price;
                        sellPriceInput.style.color = '#00ff88';
                    } else {
                        // Fallback to stored price if API doesn't return current price
                        sellPriceInput.value = selected.dataset.price;
                        sellPriceInput.style.color = '#00ff88';
                    }
                } else {
                    // Fallback to stored price if API fails
                    sellPriceInput.value = selected.dataset.price;
                    sellPriceInput.style.color = '#00ff88';
                }
            } catch (error) {
                console.warn('Failed to fetch latest price for sell form:', error);
                // Fallback to stored price if API fails
                sellPriceInput.value = selected.dataset.price;
                sellPriceInput.style.color = '#00ff88';
            }
        } else {
            sellPriceInput.value = '';
            sellPriceInput.style.color = '#00ff88';
        }
    });
}

// ===== ASSET TYPE CHANGE HANDLER =====
function setupAssetTypeChange() {
    const assetTypeSelect = document.getElementById('buyAssetType');
    const assetNameInput = document.getElementById('buyAssetName');
    const symbolInput = document.getElementById('buySymbol');
    
    assetTypeSelect.addEventListener('change', function() {
        const assetType = this.value;
        
        // Clear previous values
        assetNameInput.value = '';
        symbolInput.value = '';
        
        // Set placeholder based on asset type
        switch(assetType) {
            case 'stock':
                assetNameInput.placeholder = 'e.g., Apple Inc.';
                symbolInput.placeholder = 'e.g., AAPL';
                break;
            case 'bond':
                assetNameInput.placeholder = 'e.g., US Treasury Bond';
                symbolInput.placeholder = 'e.g., US10Y';
                break;
            case 'cash':
                assetNameInput.placeholder = 'e.g., USD Cash';
                symbolInput.placeholder = 'e.g., USD';
                break;
            default:
                assetNameInput.placeholder = 'Enter asset name';
                symbolInput.placeholder = 'Enter symbol';
        }
    });
}

// ===== AUTO-FETCH CURRENT PRICE FOR BUY FORM =====
function setupCurrentPriceAutoFetch() {
    const assetTypeInput = document.getElementById('buyAssetType');
    const symbolInput = document.getElementById('buySymbol');
    const currentPriceInput = document.getElementById('buyCurrentPrice');
    const purchasePriceInput = document.getElementById('buyPrice');

    async function fetchAndSetCurrentPrice() {
        const assetType = assetTypeInput.value;
        const symbol = symbolInput.value.trim();
        if (!assetType || !symbol) return;
        if (assetType === 'cash') {
            currentPriceInput.readOnly = false;
            currentPriceInput.value = '';
            purchasePriceInput.value = '';
            return;
        }
        try {
            const res = await fetch(`${API_BASE}/api/portfolio/current-price?symbol=${encodeURIComponent(symbol)}&asset_type=${encodeURIComponent(assetType)}`);
            if (res.ok) {
                const data = await res.json();
                if (data.current_price !== undefined) {
                    currentPriceInput.value = data.current_price;
                    purchasePriceInput.value = data.current_price; // Auto-fill purchase price with current price
                }
            }
        } catch (e) {}
        currentPriceInput.readOnly = true;
        purchasePriceInput.readOnly = true;
    }
    assetTypeInput.addEventListener('change', fetchAndSetCurrentPrice);
    symbolInput.addEventListener('blur', fetchAndSetCurrentPrice);
    // Also fetch when form is shown
    fetchAndSetCurrentPrice();
}

// ===== ANIMATIONS =====
function addSuccessAnimation(form) {
    form.style.animation = 'successPulse 0.6s ease-in-out';
    setTimeout(() => {
        form.style.animation = '';
    }, 600);
}

function addErrorAnimation(form) {
    form.style.animation = 'errorShake 0.6s ease-in-out';
    setTimeout(() => {
        form.style.animation = '';
    }, 600);
}

// ===== REAL-TIME CALCULATIONS =====
function setupRealTimeCalculations() {
    const buyQuantity = document.getElementById('buyQuantity');
    const buyPrice = document.getElementById('buyPrice');
    const totalCost = document.createElement('div');
    totalCost.className = 'total-cost';
    totalCost.style.cssText = `
        margin-top: 10px;
        padding: 10px;
        background: rgba(0, 255, 136, 0.1);
        border-radius: 8px;
        color: var(--primary-green);
        font-weight: 600;
        text-align: center;
    `;
    
    buyQuantity.parentNode.appendChild(totalCost);
    
    function updateTotalCost() {
        const quantity = parseFloat(buyQuantity.value) || 0;
        const price = parseFloat(buyPrice.value) || 0;
        const total = quantity * price;
        
        if (total > 0) {
            totalCost.textContent = `Total Cost: $${total.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
            totalCost.style.display = 'block';
        } else {
            totalCost.style.display = 'none';
        }
    }
    
    buyQuantity.addEventListener('input', updateTotalCost);
    buyPrice.addEventListener('input', updateTotalCost);
}

// ===== QUICK ACTIONS =====
function setupQuickActions() {
    // Add quick action buttons
    const tradingContainer = document.getElementById('trading');
    const quickActions = document.createElement('div');
    quickActions.className = 'quick-actions';
    quickActions.style.cssText = `
        display: flex;
        gap: 15px;
        margin-bottom: 20px;
        flex-wrap: wrap;
    `;
    
    const actions = [
        { label: 'Quick Buy AAPL', action: () => quickFillForm('stock', 'Apple Inc.', 'AAPL', 10, 150, 180) },
        { label: 'Quick Buy TSLA', action: () => quickFillForm('stock', 'Tesla Inc.', 'TSLA', 5, 200, 250) },
        { label: 'Quick Buy Bond', action: () => quickFillForm('bond', 'US Treasury Bond', 'US10Y', 1000, 100, 100) },
        { label: 'Add Cash', action: () => quickFillForm('cash', 'USD Cash', 'USD', 10000, 1, 1) }
    ];
    
    actions.forEach(({ label, action }) => {
        const button = document.createElement('button');
        button.textContent = label;
        button.className = 'btn btn-secondary';
        button.style.cssText = `
            background: rgba(0, 255, 136, 0.1);
            color: var(--primary-green);
            border: 1px solid var(--primary-green);
            padding: 8px 16px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
        `;
        
        button.addEventListener('mouseenter', function() {
            this.style.background = 'rgba(0, 255, 136, 0.2)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.background = 'rgba(0, 255, 136, 0.1)';
        });
        
        button.addEventListener('click', action);
        quickActions.appendChild(button);
    });
    
    tradingContainer.insertBefore(quickActions, tradingContainer.firstChild);
}

function quickFillForm(type, name, symbol, quantity, price, currentPrice) {
    document.getElementById('buyAssetType').value = type;
    document.getElementById('buyAssetName').value = name;
    document.getElementById('buySymbol').value = symbol;
    document.getElementById('buyQuantity').value = quantity;
    document.getElementById('buyPrice').value = price;
    document.getElementById('buyCurrentPrice').value = currentPrice;
    
    // Trigger validation
    const inputs = document.querySelectorAll('#buyForm input, #buyForm select');
    inputs.forEach(input => validateField(input));
    
    showNotification('Form filled with sample data!', 'success');
}

// ===== TRANSACTION HISTORY =====
async function loadTransactionHistory() {
    const historyContainer = document.getElementById('transactionHistory');
    
    // Show loading state
    historyContainer.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--text-gray);">
            <i class="fas fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 10px;"></i>
            <p>Loading transaction history...</p>
        </div>
    `;
    
    try {
        const response = await fetch(`${API_BASE}/api/portfolio/transactions`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch transaction history');
        }
        
        const transactions = await response.json();
        
        // Transform the data to match the expected format
        const transformedTransactions = transactions.map(transaction => ({
            id: transaction.id,
            type: transaction.transaction_type,
            asset: transaction.asset_name,
            symbol: transaction.symbol,
            quantity: transaction.quantity,
            price: transaction.price,
            date: transaction.transaction_date,
            total: transaction.total_value
        }));
        
        displayTransactionHistory(transformedTransactions);
        
    } catch (error) {
        console.error('Error loading transaction history:', error);
        historyContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-gray);">
                <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 20px; opacity: 0.5;"></i>
                <p>Failed to load transaction history</p>
                <p style="font-size: 14px; margin-top: 10px;">${error.message}</p>
            </div>
        `;
    }
}

function displayTransactionHistory(transactions) {
    const historyContainer = document.getElementById('transactionHistory');
    if (transactions.length === 0) {
        historyContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-gray);">
                <i class="fas fa-history" style="font-size: 48px; margin-bottom: 20px; opacity: 0.5;"></i>
                <p>No transaction history found</p>
                <p style="font-size: 14px; margin-top: 10px;">Start trading to see your transaction history</p>
            </div>
        `;
        return;
    }
    const transactionList = document.createElement('div');
    transactionList.className = 'transaction-list';
    transactions.forEach((transaction, index) => {
        const transactionItem = document.createElement('div');
        transactionItem.className = 'transaction-item';
        transactionItem.style.animationDelay = `${index * 0.1}s`;
        transactionItem.style.animation = 'slideInFromLeft 0.5s ease-out forwards';
        transactionItem.style.opacity = '0';
        const isBuy = transaction.type === 'buy';
        const typeClass = isBuy ? 'buy' : 'sell';
        const typeIcon = isBuy ? 'fas fa-plus' : 'fas fa-minus';
        const typeColor = isBuy ? 'var(--success-green)' : 'var(--danger-red)';
        transactionItem.innerHTML = `
            <div class="transaction-info">
                <div class="transaction-icon ${typeClass}" style="background: ${typeColor};">
                    <i class="${typeIcon}"></i>
                </div>
                <div class="transaction-details">
                    <h4>${transaction.asset} (${transaction.symbol})</h4>
                    <p>${transaction.quantity} ${(transaction.asset_type === 'stock') ? 'shares' : (transaction.asset_type === 'bond') ? 'bonds' : ''} @ $${transaction.price}</p>
                    <small>${new Date(transaction.date).toLocaleDateString()}</small>
                </div>
            </div>
            <div class="transaction-value">
                                    <h4>$${transaction.total.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</h4>
                <p class="${typeClass}">${isBuy ? 'BUY' : 'SELL'}</p>
            </div>
        `;
        transactionList.appendChild(transactionItem);
        setTimeout(() => {
            transactionItem.style.opacity = '1';
        }, index * 100);
    });
    historyContainer.innerHTML = '';
    historyContainer.appendChild(transactionList);
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    setupRealTimeCalculations();
    setupQuickActions();
    setupCurrentPriceAutoFetch();
    populateBuyAssetNameDropdown();
});

async function populateBuyAssetNameDropdown() {
    const assetNameSelect = document.getElementById('buyAssetName');
    const symbolInput = document.getElementById('buySymbol');
    const currentPriceInput = document.getElementById('buyCurrentPrice');
    const purchasePriceInput = document.getElementById('buyPrice');
    const assetTypeInput = document.getElementById('buyAssetType');
    
    // Store all assets globally for filtering
    let allAssets = [];
    
    try {
        const res = await fetch(`${API_BASE}/api/portfolio/`);
        if (!res.ok) return;
        allAssets = await res.json();
    } catch (e) {
        console.error('Failed to fetch assets:', e);
        return;
    }
    
    // Function to filter and populate dropdown based on selected asset type
    function updateAssetNameDropdown() {
        const selectedAssetType = assetTypeInput.value;
        
        // Clear current options
        assetNameSelect.innerHTML = '<option value="">Select Asset Name</option>';
        
        if (!selectedAssetType) {
            return; // Don't populate if no asset type is selected
        }
        
        // Filter assets by the selected type
        console.log('Filtering for asset type:', selectedAssetType);
        console.log('Available assets:', allAssets.map(a => `${a.asset_name} (${a.asset_type})`));
        const filteredAssets = allAssets.filter(asset => {
            const matches = asset.asset_type === selectedAssetType;
            console.log(`${asset.asset_name}: ${asset.asset_type} === ${selectedAssetType} = ${matches}`);
            return matches;
        });
        console.log('Filtered result:', filteredAssets.map(a => a.asset_name));
        
        // Remove duplicates by asset_name + symbol
        const uniqueAssets = [];
        const seen = new Set();
        for (const asset of filteredAssets) {
            const key = asset.asset_name + '|' + asset.symbol;
            if (!seen.has(key)) {
                uniqueAssets.push(asset);
                seen.add(key);
            }
        }
        
        // Populate dropdown with filtered assets
        uniqueAssets.forEach(asset => {
            const option = document.createElement('option');
            option.value = asset.asset_name;
            option.textContent = `${asset.asset_name} (${asset.symbol})`;
            option.dataset.symbol = asset.symbol;
            option.dataset.assetType = asset.asset_type;
            assetNameSelect.appendChild(option);
        });
        
        // Clear symbol and current price when asset type changes
        symbolInput.value = '';
        symbolInput.readOnly = true;
        currentPriceInput.value = '';
        currentPriceInput.readOnly = true;
        purchasePriceInput.value = '';
        purchasePriceInput.readOnly = true;
    }
    
    function updateSymbolAndCurrentPrice() {
        const selected = assetNameSelect.options[assetNameSelect.selectedIndex];
        if (selected && selected.value) {
            symbolInput.value = selected.dataset.symbol || '';
            symbolInput.readOnly = true;
            // Set current price field readOnly for stocks/bonds, editable for cash
            const assetType = selected.dataset.assetType;
            if (assetType === 'cash') {
                currentPriceInput.readOnly = false;
                currentPriceInput.value = '';
                purchasePriceInput.readOnly = false;
                purchasePriceInput.value = '';
            } else {
                currentPriceInput.readOnly = true;
                purchasePriceInput.readOnly = true;
                // Fetch current price from backend
                fetch(`${API_BASE}/api/portfolio/current-price?symbol=${encodeURIComponent(selected.dataset.symbol)}&asset_type=${encodeURIComponent(assetType)}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.current_price !== undefined) {
                            currentPriceInput.value = data.current_price;
                            purchasePriceInput.value = data.current_price; // Auto-fill purchase price
                        }
                    });
            }
        } else {
            symbolInput.value = '';
            symbolInput.readOnly = true;
            currentPriceInput.value = '';
            currentPriceInput.readOnly = true;
            purchasePriceInput.value = '';
            purchasePriceInput.readOnly = true;
        }
    }
    
    // Add event listeners
    assetNameSelect.addEventListener('change', updateSymbolAndCurrentPrice);
    assetTypeInput.addEventListener('change', () => {
        updateAssetNameDropdown();
        updateSymbolAndCurrentPrice();
    });
    
    // Initial state
    updateAssetNameDropdown();
    updateSymbolAndCurrentPrice();
}

// Export functions for other modules
window.TradingManager = {
    handleBuy,
    handleSell,
    loadAssetsForTrading,
    loadTransactionHistory,
    setupQuickActions
}; 