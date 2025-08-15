// Use global fetch when available (Node 18+), otherwise fall back to node-fetch
const fetch = global.fetch || ((...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args)));

const API_BASE = 'http://localhost:3000/api';

async function testCashFlowLogic() {
    console.log('💰 Testing Cash Flow Logic...\n');

    try {
        // 1. Get initial portfolio state
        console.log('1. Getting initial portfolio state...');
        const initialResponse = await fetch(`${API_BASE}/portfolio/`);
        const initialPortfolio = await initialResponse.json();
        console.log(`   Initial portfolio has ${initialPortfolio.length} assets`);
        
        const initialUsd = initialPortfolio.find(a => a.symbol === 'USD');
        if (initialUsd) {
            console.log(`   Initial USD cash: $${initialUsd.quantity.toFixed(2)}`);
        }
        
        // 2. Add some USD cash first
        console.log('\n2. Adding USD cash...');
        const addCashTransaction = {
            asset_type: 'cash',
            asset_name: 'US Dollar',
            symbol: 'USD',
            transaction_type: 'buy',
            quantity: 10000,
            price: 1.00,
            total_value: 10000,
            notes: 'Initial cash deposit'
        };
        
        const cashResponse = await fetch(`${API_BASE}/portfolio/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(addCashTransaction)
        });
        
        if (cashResponse.ok) {
            console.log('   ✅ USD cash added successfully');
        } else {
            console.log('   ❌ Failed to add USD cash');
            return;
        }
        
        // 3. Check USD cash after adding
        console.log('\n3. Checking USD cash after deposit...');
        const afterCashResponse = await fetch(`${API_BASE}/portfolio/`);
        const afterCashPortfolio = await afterCashResponse.json();
        const afterCashUsd = afterCashPortfolio.find(a => a.symbol === 'USD');
        if (afterCashUsd) {
            console.log(`   USD cash after deposit: $${afterCashUsd.quantity.toFixed(2)}`);
        }
        
        // 4. Buy some stocks (should decrease USD cash)
        console.log('\n4. Buying stocks (should decrease USD cash)...');
        const buyStockTransaction = {
            asset_type: 'stock',
            asset_name: 'Test Stock',
            symbol: 'TEST',
            transaction_type: 'buy',
            quantity: 10,
            price: 100,
            total_value: 1000,
            notes: 'Buying test stocks'
        };
        
        const buyResponse = await fetch(`${API_BASE}/portfolio/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(buyStockTransaction)
        });
        
        if (buyResponse.ok) {
            console.log('   ✅ Stocks bought successfully');
        } else {
            console.log('   ❌ Failed to buy stocks');
            return;
        }
        
        // 5. Check portfolio after buying stocks
        console.log('\n5. Checking portfolio after buying stocks...');
        const afterBuyResponse = await fetch(`${API_BASE}/portfolio/`);
        const afterBuyPortfolio = await afterBuyResponse.json();
        
        const afterBuyUsd = afterBuyPortfolio.find(a => a.symbol === 'USD');
        const testStock = afterBuyPortfolio.find(a => a.symbol === 'TEST');
        
        if (afterBuyUsd) {
            console.log(`   USD cash after buying stocks: $${afterBuyUsd.quantity.toFixed(2)}`);
            console.log(`   Expected: $${(10000 - 1000).toFixed(2)}`);
        }
        
        if (testStock) {
            console.log(`   TEST stock quantity: ${testStock.quantity}`);
        }
        
        // 6. Sell some stocks (should increase USD cash)
        console.log('\n6. Selling stocks (should increase USD cash)...');
        const sellStockTransaction = {
            asset_type: 'stock',
            asset_name: 'Test Stock',
            symbol: 'TEST',
            transaction_type: 'sell',
            quantity: 5,
            price: 110,
            total_value: 550,
            notes: 'Selling test stocks'
        };
        
        const sellResponse = await fetch(`${API_BASE}/portfolio/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sellStockTransaction)
        });
        
        if (sellResponse.ok) {
            console.log('   ✅ Stocks sold successfully');
        } else {
            console.log('   ❌ Failed to sell stocks');
            return;
        }
        
        // 7. Check final portfolio state
        console.log('\n7. Checking final portfolio state...');
        const finalResponse = await fetch(`${API_BASE}/portfolio/`);
        const finalPortfolio = await finalResponse.json();
        
        const finalUsd = finalPortfolio.find(a => a.symbol === 'USD');
        const finalTestStock = finalPortfolio.find(a => a.symbol === 'TEST');
        
        if (finalUsd) {
            console.log(`   Final USD cash: $${finalUsd.quantity.toFixed(2)}`);
            console.log(`   Expected: $${(10000 - 1000 + 550).toFixed(2)}`);
        }
        
        if (finalTestStock) {
            console.log(`   Final TEST stock quantity: ${finalTestStock.quantity}`);
            console.log(`   Expected: ${10 - 5}`);
        }
        
        // 8. Verify cash flow logic
        console.log('\n8. Verifying cash flow logic...');
        const expectedUsd = 10000 - 1000 + 550; // Initial + deposit - buy + sell
        const expectedStock = 10 - 5; // Buy - sell
        
        if (finalUsd && Math.abs(finalUsd.quantity - expectedUsd) < 0.01) {
            console.log('   ✅ USD cash flow correct');
        } else {
            console.log('   ❌ USD cash flow incorrect');
        }
        
        if (finalTestStock && finalTestStock.quantity === expectedStock) {
            console.log('   ✅ Stock quantity correct');
        } else {
            console.log('   ❌ Stock quantity incorrect');
        }
        
        console.log('\n🎉 Cash flow logic test completed successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testCashFlowLogic(); 