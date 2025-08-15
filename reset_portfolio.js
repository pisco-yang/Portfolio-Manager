const mysql = require('mysql2/promise');

async function resetPortfolio() {
    console.log('🔄 Resetting Portfolio to Clean State...\n');

    try {
        // Database connection
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'your_password',
            database: 'portfolio_db'
        });

        // Clear all data
        console.log('1. Clearing existing data...');
        await connection.execute('DELETE FROM transactions');
        await connection.execute('DELETE FROM portfolio');

        // Insert clean initial portfolio
        console.log('2. Setting up clean initial portfolio...');
        const initialPortfolio = [
            ['stock', 'Apple Inc.', 'AAPL', 10, 150.00, 180.00],
            ['stock', 'NVIDIA Corporation', 'NVDA', 5, 400.00, 470.00],
            ['bond', 'US Treasury Bond 10Y', 'T-BOND10Y', 2, 1000.00, 995.00],
            ['cash', 'US Dollar', 'USD', 5000, 1.00, 1.00]
        ];

        for (const asset of initialPortfolio) {
            await connection.execute(
                'INSERT INTO portfolio (asset_type, asset_name, symbol, quantity, average_purchase_price, current_price) VALUES (?, ?, ?, ?, ?, ?)',
                asset
            );
        }

        // Insert initial transactions
        console.log('3. Setting up initial transactions...');
        const initialTransactions = [
            ['stock', 'Apple Inc.', 'AAPL', 'buy', 10, 150.00, 1500.00, 'Initial Apple purchase'],
            ['stock', 'NVIDIA Corporation', 'NVDA', 'buy', 5, 400.00, 2000.00, 'Initial NVIDIA purchase'],
            ['bond', 'US Treasury Bond 10Y', 'T-BOND10Y', 'buy', 2, 1000.00, 2000.00, 'Initial bond purchase'],
            ['cash', 'US Dollar', 'USD', 'buy', 5000, 1.00, 5000.00, 'Initial cash deposit']
        ];

        for (const tx of initialTransactions) {
            await connection.execute(
                'INSERT INTO transactions (asset_type, asset_name, symbol, transaction_type, quantity, price, total_value, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                tx
            );
        }

        console.log('✅ Portfolio reset successfully!');
        console.log('\nInitial Portfolio State:');
        console.log('- USD Cash: $5,000.00');
        console.log('- AAPL: 10 shares @ $180.00 = $1,800.00');
        console.log('- NVDA: 5 shares @ $470.00 = $2,350.00');
        console.log('- T-BOND10Y: 2 bonds @ $995.00 = $1,990.00');
        console.log('- Total Portfolio Value: $11,140.00');

        await connection.end();

    } catch (error) {
        console.error('❌ Reset failed:', error.message);
    }
}

// Run the reset
resetPortfolio(); 