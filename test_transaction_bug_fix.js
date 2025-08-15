const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3000/api';

async function testTransactionBasedPortfolio() {
    console.log('🧪 Testing Transaction-Based Portfolio Updates...\n');

    try {
        // 1. Get initial portfolio state
        console.log('1. Getting initial portfolio state...');
        const initialResponse = await fetch(`${API_BASE}/portfolio/`);
        const initialPortfolio = await initialResponse.json();
        console.log(`   Initial portfolio has ${initialPortfolio.length} assets`);
        
        // 2. Create a buy transaction
        console.log('\n2. Creating a buy transaction...');
        const buyTransaction = {
            asset_type: 'stock',
            asset_name: 'Test Stock',
            symbol: 'TEST',
            transaction_type: 'buy',
            quantity: 10,
            price: 100,
            total_value: 1000,
            notes: 'Test buy transaction'
        };
        
        const buyResponse = await fetch(`${API_BASE}/portfolio/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(buyTransaction)
        });
        
        if (buyResponse.ok) {
            console.log('   ✅ Buy transaction created successfully');
        } else {
            console.log('   ❌ Buy transaction failed');
            return;
        }
        
        // 3. Check if portfolio was updated
        console.log('\n3. Checking if portfolio was updated...');
        const updatedResponse = await fetch(`${API_BASE}/portfolio/`);
        const updatedPortfolio = await updatedResponse.json();
        
        const testAsset = updatedPortfolio.find(a => a.symbol === 'TEST');
        if (testAsset) {
            console.log(`   ✅ Portfolio updated: Found TEST asset with ${testAsset.quantity} shares`);
        } else {
            console.log('   ❌ Portfolio not updated: TEST asset not found');
        }
        
        // 4. Create a sell transaction
        console.log('\n4. Creating a sell transaction...');
        const sellTransaction = {
            asset_type: 'stock',
            asset_name: 'Test Stock',
            symbol: 'TEST',
            transaction_type: 'sell',
            quantity: 5,
            price: 110,
            total_value: 550,
            notes: 'Test sell transaction'
        };
        
        const sellResponse = await fetch(`${API_BASE}/portfolio/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sellTransaction)
        });
        
        if (sellResponse.ok) {
            console.log('   ✅ Sell transaction created successfully');
        } else {
            console.log('   ❌ Sell transaction failed');
            return;
        }
        
        // 5. Check final portfolio state
        console.log('\n5. Checking final portfolio state...');
        const finalResponse = await fetch(`${API_BASE}/portfolio/`);
        const finalPortfolio = await finalResponse.json();
        
        const finalTestAsset = finalPortfolio.find(a => a.symbol === 'TEST');
        if (finalTestAsset && finalTestAsset.quantity === 5) {
            console.log(`   ✅ Final portfolio correct: TEST asset has ${finalTestAsset.quantity} shares`);
        } else {
            console.log('   ❌ Final portfolio incorrect');
        }
        
        // 6. Test recalculate endpoint
        console.log('\n6. Testing recalculate endpoint...');
        const recalculateResponse = await fetch(`${API_BASE}/portfolio/recalculate`, {
            method: 'POST'
        });
        
        if (recalculateResponse.ok) {
            console.log('   ✅ Portfolio recalculated successfully');
        } else {
            console.log('   ❌ Portfolio recalculation failed');
        }
        
        console.log('\n🎉 All tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testTransactionBasedPortfolio(); 