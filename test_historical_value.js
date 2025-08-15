const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/portfolio';

async function testHistoricalPortfolioValue() {
  try {
    console.log('Testing Historical Portfolio Value Calculation...\n');
    
    // Test 1: Get current historical portfolio value
    console.log('1. Getting current historical portfolio value:');
    const currentValue = await axios.get(`${BASE_URL}/value/historical`);
    console.log('Current Portfolio Value:', currentValue.data.totalValue);
    console.log('Date:', currentValue.data.date);
    console.log('Asset Count:', currentValue.data.assetCount);
    console.log('Assets:', currentValue.data.assets.map(a => 
      `${a.symbol}: ${a.quantity} × $${a.current_price} = $${a.value}`
    ));
    console.log('\n');
    
    // Test 2: Get historical value for a specific date (July 29, 2025)
    console.log('2. Getting historical portfolio value for July 29, 2025:');
    const historicalValue = await axios.get(`${BASE_URL}/value/historical?date=2025-07-29`);
    console.log('Historical Portfolio Value (July 29):', historicalValue.data.totalValue);
    console.log('Date:', historicalValue.data.date);
    console.log('Asset Count:', historicalValue.data.assetCount);
    console.log('Assets:', historicalValue.data.assets.map(a => 
      `${a.symbol}: ${a.quantity} × $${a.current_price} = $${a.value}`
    ));
    console.log('\n');
    

    
    // Test 3: Calculate expected values based on your example data
    console.log('3. Expected calculations based on your example data:');
    console.log('July 29, 2025:');
    console.log('  AAPL: 0 × $180 = $0 (no holdings yet)');
    console.log('  NVDA: 0 × $470 = $0 (no holdings yet)');
    console.log('  T-BOND10Y: 0 × $995 = $0 (no holdings yet)');
    console.log('  USD: 1780 × $1 = $1780');
    console.log('  Total: $1780');
    console.log('\n');
    
    console.log('July 30, 2025:');
    console.log('  AAPL: 20 × $180 = $3600 (10 + 10 from July 29)');
    console.log('  NVDA: 4 × $470 = $1880');
    console.log('  T-BOND10Y: 12 × $995 = $11940 (2 + 10)');
    console.log('  USD: 1780 × $1 = $1780');
    console.log('  Total: $19200');
    
  } catch (error) {
    console.error('Error testing historical portfolio value:', error.response?.data || error.message);
  }
}

// Run the test
testHistoricalPortfolioValue(); 