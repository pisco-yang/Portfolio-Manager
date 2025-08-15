const API_BASE = 'http://localhost:3000/api';

async function debugPortfolioCalculation() {
    console.log('🔍 Debugging Portfolio Calculation...\n');

    try {
        // 1. Get current portfolio state
        console.log('1. Current Portfolio State:');
        const portfolioResponse = await fetch(`${API_BASE}/portfolio/`);
        const portfolio = await portfolioResponse.json();
        
        portfolio.forEach(asset => {
            console.log(`   ${asset.symbol}: ${asset.quantity} shares @ $${asset.current_price} = $${(asset.quantity * asset.current_price).toFixed(2)}`);
        });
        
        // 2. Get all transactions
        console.log('\n2. All Transactions:');
        const transactionsResponse = await fetch(`${API_BASE}/portfolio/transactions`);
        const transactions = await transactionsResponse.json();
        
        transactions.forEach(tx => {
            console.log(`   ${tx.transaction_type.toUpperCase()}: ${tx.quantity} ${tx.symbol} @ $${tx.price} = $${tx.total_value} (${tx.notes})`);
        });
        
        // 3. Calculate what should happen when buying 0.5 NVDA at $2435.62
        console.log('\n3. Expected Calculation for Buying 0.5 NVDA at $2435.62:');
        
        const currentUsd = portfolio.find(a => a.symbol === 'USD');
        const currentNvda = portfolio.find(a => a.symbol === 'NVDA');
        
        if (currentUsd && currentNvda) {
            console.log(`   Current USD: $${currentUsd.quantity.toFixed(2)}`);
            console.log(`   Current NVDA: ${currentNvda.quantity} shares @ $${currentNvda.current_price}`);
            
            const buyQuantity = 0.5;
            const buyPrice = 2435.62;
            const totalCost = buyQuantity * buyPrice;
            
            console.log(`   Buying: ${buyQuantity} NVDA @ $${buyPrice} = $${totalCost.toFixed(2)}`);
            console.log(`   Expected USD after: $${(currentUsd.quantity - totalCost).toFixed(2)}`);
            console.log(`   Expected NVDA after: ${(currentNvda.quantity + buyQuantity).toFixed(2)} shares`);
        }
        
        // 4. Test the actual transaction
        console.log('\n4. Creating Test Transaction...');
        const testTransaction = {
            asset_type: 'stock',
            asset_name: 'NVIDIA Corporation',
            symbol: 'NVDA',
            transaction_type: 'buy',
            quantity: 0.5,
            price: 2435.62,
            total_value: 0.5 * 2435.62,
            notes: 'Test buy transaction'
        };
        
        const testResponse = await fetch(`${API_BASE}/portfolio/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testTransaction)
        });
        
        if (testResponse.ok) {
            console.log('   ✅ Test transaction created');
            
            // 5. Check result
            console.log('\n5. Result After Transaction:');
            const afterResponse = await fetch(`${API_BASE}/portfolio/`);
            const afterPortfolio = await afterResponse.json();
            
            afterPortfolio.forEach(asset => {
                console.log(`   ${asset.symbol}: ${asset.quantity} shares @ $${asset.current_price} = $${(asset.quantity * asset.current_price).toFixed(2)}`);
            });
        } else {
            const error = await testResponse.json();
            console.log('   ❌ Test transaction failed:', error);
        }
        
    } catch (error) {
        console.error('❌ Debug failed:', error.message);
    }
}

// Run the debug
debugPortfolioCalculation(); 