const db = require('../config/db');

const getTodayStr = () => new Date().toISOString().slice(0, 10);

exports.getAll = async () => {
  const [rows] = await db.query('SELECT * FROM portfolio');
  return rows;
};

exports.create = async (data) => {
  const {
    asset_type,
    asset_name,
    symbol,
    quantity,
    average_purchase_price,
    current_price,
    updated_at
  } = data;

  const [result] = await db.query(
    `INSERT INTO portfolio 
     (asset_type, asset_name, symbol, quantity, average_purchase_price, current_price, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      asset_type,
      asset_name,
      symbol,
      quantity,
      average_purchase_price,
      current_price,
      updated_at || getTodayStr()
    ]
  );

  return { id: result.insertId, ...data };
};

exports.update = async (id, data) => {
  const { quantity, average_purchase_price, current_price, updated_at } = data;

  await db.query(
    `UPDATE portfolio 
     SET quantity = ?, average_purchase_price = ?, current_price = ?, updated_at = ? 
     WHERE id = ?`,
    [quantity, average_purchase_price, current_price, updated_at || getTodayStr(), id]
  );

  return { id, ...data };
};

exports.remove = async (id) => {
  await db.query('DELETE FROM portfolio WHERE id = ?', [id]);
  return { success: true, id };
};

exports.getTotalValue = async () => {
  const todayStr = getTodayStr();
  const [rows] = await db.query(
    `SELECT IFNULL(SUM(p.quantity * p.current_price), 0) AS total_value 
     FROM portfolio p
     INNER JOIN (
       SELECT asset_type, symbol, MAX(updated_at) as max_updated_at
       FROM portfolio 
       WHERE DATE(updated_at) = ?
       GROUP BY asset_type, symbol
     ) latest ON p.asset_type = latest.asset_type 
                AND p.symbol = latest.symbol 
                AND p.updated_at = latest.max_updated_at`,
    [todayStr]
  );
  return rows[0].total_value;
};

exports.getPerformance = async () => {
  const [rows] = await db.query(
    `SELECT 
       id, 
       asset_name, 
       symbol, 
       (current_price - average_purchase_price) * quantity AS gain_loss 
     FROM portfolio`
  );
  return rows;
};

exports.getSummary = async () => {
  const todayStr = getTodayStr();
  const [rows] = await db.query(
    `SELECT p.*, 
            (p.quantity * p.current_price) AS value,
            (p.current_price - p.average_purchase_price) * p.quantity AS profit,
            ROUND(((p.current_price - p.average_purchase_price)/p.average_purchase_price)*100, 2) AS profit_percent
     FROM portfolio p
     INNER JOIN (
       SELECT asset_type, symbol, MAX(updated_at) as max_updated_at
       FROM portfolio 
       WHERE DATE(updated_at) = ?
       GROUP BY asset_type, symbol
     ) latest ON p.asset_type = latest.asset_type 
                AND p.symbol = latest.symbol 
                AND p.updated_at = latest.max_updated_at
     ORDER BY p.asset_type, p.symbol`,
    [todayStr]
  );
  return rows;
};

// Enhanced portfolio summary with analytics
exports.getDetailedSummary = async () => {
  const [rows] = await db.query(
    `SELECT 
       *,
       (quantity * current_price) AS value,
       (current_price - average_purchase_price) * quantity AS profit,
       ROUND(((current_price - average_purchase_price)/average_purchase_price)*100, 2) AS profit_percent,
       ROUND((quantity * current_price) / (SELECT IFNULL(SUM(quantity * current_price), 0) FROM portfolio) * 100, 2) AS allocation_percent
     FROM portfolio`
  );
  
  // Calculate additional metrics
  const totalValue = rows.reduce((sum, asset) => sum + asset.value, 0);
  const totalProfit = rows.reduce((sum, asset) => sum + asset.profit, 0);
  const totalReturn = totalValue > 0 ? (totalProfit / (totalValue - totalProfit)) * 100 : 0;
  
  // Asset type breakdown
  const assetTypes = {};
  rows.forEach(asset => {
    if (!assetTypes[asset.asset_type]) {
      assetTypes[asset.asset_type] = { count: 0, value: 0 };
    }
    assetTypes[asset.asset_type].count++;
    assetTypes[asset.asset_type].value += asset.value;
  });
  
  return {
    assets: rows,
    totalValue,
    totalProfit,
    totalReturn,
    assetTypes,
    assetCount: rows.length
  };
};

// Transaction history model methods
exports.getTransactions = async () => {
  const [rows] = await db.query(
    `SELECT * FROM transactions ORDER BY transaction_date DESC`
  );
  return rows;
};

exports.createTransaction = async (data) => {
  const {
    asset_type,
    asset_name,
    symbol,
    transaction_type,
    quantity,
    price,
    total_value,
    notes
  } = data;

  // Create the transaction record only (for history)
  const [result] = await db.query(
    `INSERT INTO transactions 
     (asset_type, asset_name, symbol, transaction_type, quantity, price, total_value, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      asset_type,
      asset_name,
      symbol,
      transaction_type,
      quantity,
      price,
      total_value,
      notes
    ]
  );

  return { id: result.insertId, ...data };
};

// Risk metrics calculation
exports.getRiskMetrics = async () => {
  const [rows] = await db.query(
    `SELECT 
       *,
       (current_price - average_purchase_price) * quantity AS gain_loss,
       (current_price - average_purchase_price) / average_purchase_price AS return_rate
     FROM portfolio`
  );
  
  if (rows.length === 0) {
    return {
      volatility: 0,
      sharpeRatio: 0,
      beta: 0,
      maxDrawdown: 0,
      diversification: 0
    };
  }
  
  // Calculate volatility (standard deviation of returns)
  const returns = rows.map(asset => asset.return_rate);
  const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
  const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length;
  const volatility = Math.sqrt(variance);
  
  // Calculate Sharpe ratio (simplified)
  const riskFreeRate = 0.02; // 2% risk-free rate
  const sharpeRatio = volatility > 0 ? (avgReturn - riskFreeRate) / volatility : 0;
  
  // Calculate Beta (simplified - assuming market correlation)
  const beta = volatility / 0.15; // Assuming market volatility of 15%
  
  // Calculate max drawdown (simplified)
  const maxDrawdown = Math.min(...returns);
  
  // Calculate diversification score
  const assetTypes = new Set(rows.map(asset => asset.asset_type));
  const diversification = Math.min(assetTypes.size / 3, 1); // Normalize to 0-1
  
  return {
    volatility: volatility * 100, // Convert to percentage
    sharpeRatio,
    beta,
    maxDrawdown: Math.abs(maxDrawdown) * 100, // Convert to percentage
    diversification: diversification * 100, // Convert to percentage
    assetCount: rows.length,
    assetTypes: assetTypes.size
  };
};

// Historical data for charts
exports.getHistoricalData = async () => {
  // Get portfolio value over time (simulated for now)
  const [currentAssets] = await db.query('SELECT * FROM portfolio');
  const totalValue = currentAssets.reduce((sum, asset) => sum + (asset.quantity * asset.current_price), 0);
  
  // Generate simulated historical data (6 months)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const historicalData = [];
  let value = totalValue * 0.8; // Start at 80% of current value
  
  for (let i = 0; i < 6; i++) {
    const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
    value = value * (1 + variation);
    historicalData.push({
      month: months[i],
      value: Math.max(value, totalValue * 0.7) // Ensure minimum value
    });
  }
  
  // Ensure the last value is close to current value
  historicalData[historicalData.length - 1].value = totalValue;
  
  return historicalData;
};

// Asset allocation data
exports.getAllocationData = async () => {
  const [rows] = await db.query(
    `SELECT 
       asset_type,
       SUM(quantity * current_price) AS total_value,
       COUNT(*) AS asset_count
     FROM portfolio 
     GROUP BY asset_type`
  );
  
  return rows.map(row => ({
    type: row.asset_type === 'stock' ? 'Stocks' : row.asset_type === 'bond' ? 'Bonds' : 'Cash',
    value: row.total_value,
    count: row.asset_count
  }));
};

// Get portfolio value history based on portfolio table data progression
exports.getPortfolioValueHistory = async (range, type, symbol) => {
  try {
    console.log('getPortfolioValueHistory called with:', { range, type, symbol });

  // Determine date range
  const now = new Date();
  let days = 7;
  if (range === '30d') days = 30;
  
  // Build date array (oldest to newest)
  const dates = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }

    // Get portfolio data for the date range
    const [portfolioData] = await db.query(
      `SELECT * FROM portfolio 
       WHERE DATE(updated_at) >= ? AND DATE(updated_at) <= ?
       ORDER BY updated_at ASC`,
      [dates[0], dates[dates.length - 1]]
    );
    
    console.log(`Found ${portfolioData.length} portfolio records for date range`);

    // Calculate portfolio value for each date
  const result = [];
  for (const date of dates) {
      let total = 0;
      
      // Get the latest portfolio state for each asset on or before this date
      const assetStates = {};
      
      for (const record of portfolioData) {
        const recordDate = new Date(record.updated_at).toISOString().slice(0, 10);
        if (recordDate <= date) {
          // Update or set the latest state for this asset
          assetStates[record.symbol] = {
            quantity: record.quantity,
            current_price: record.current_price,
            asset_type: record.asset_type
          };
        }
      }

    // Calculate total portfolio value for this date
      for (const [symbol, state] of Object.entries(assetStates)) {
        if (state.asset_type === 'cash') {
          total += state.quantity * state.current_price;
        } else {
          // For non-cash assets, only include if we have holdings
          if (state.quantity > 0) {
            total += state.quantity * state.current_price;
          }
        }
      }
      
      result.push({ date, value: total });
    }
    
    console.log('Returning result with', result.length, 'data points');
    return result;
  } catch (error) {
    console.error('Error in getPortfolioValueHistory:', error);
    throw error;
  }
};

// Calculate portfolio value based on historical data progression
// This function sums up quantity * current_price for all assets from previous dates till now
exports.getHistoricalPortfolioValue = async (targetDate = null) => {
  try {
    // If no target date specified, use current date
    const dateToCalculate = targetDate || new Date().toISOString().slice(0, 10);
    
    // Get all portfolio entries up to the target date
    const [portfolioEntries] = await db.query(
      `SELECT * FROM portfolio 
       WHERE DATE(updated_at) <= ? 
       ORDER BY updated_at ASC`,
      [dateToCalculate]
    );
    
    // Group entries by symbol and calculate cumulative holdings
    const holdingsBySymbol = {};
    
    portfolioEntries.forEach(entry => {
      const symbol = entry.symbol;
      const entryDate = new Date(entry.updated_at).toISOString().slice(0, 10);
      
      if (!holdingsBySymbol[symbol]) {
        holdingsBySymbol[symbol] = {
          asset_type: entry.asset_type,
          asset_name: entry.asset_name,
          symbol: symbol,
          quantity: 0,
          current_price: entry.current_price,
          last_updated: entryDate
        };
      }
      
      // Update quantity and current price
      holdingsBySymbol[symbol].quantity = entry.quantity;
      holdingsBySymbol[symbol].current_price = entry.current_price;
      holdingsBySymbol[symbol].last_updated = entryDate;
    });
    
    // Calculate total portfolio value
    let totalValue = 0;
    const assetBreakdown = [];
    
    for (const [symbol, holding] of Object.entries(holdingsBySymbol)) {
      const assetValue = holding.quantity * holding.current_price;
      totalValue += assetValue;
      
      assetBreakdown.push({
        symbol: symbol,
        asset_type: holding.asset_type,
        asset_name: holding.asset_name,
        quantity: holding.quantity,
        current_price: holding.current_price,
        value: assetValue,
        last_updated: holding.last_updated
      });
    }
    
    return {
      totalValue: totalValue,
      date: dateToCalculate,
      assets: assetBreakdown,
      assetCount: assetBreakdown.length
    };
    
  } catch (error) {
    console.error('Error calculating historical portfolio value:', error);
    throw error;
  }
};

// Recalculate portfolio holdings based on transaction history
exports.recalculatePortfolioFromTransactions = async () => {
  try {
    // Get all transactions ordered by date
    const [transactions] = await db.query(
      `SELECT * FROM transactions ORDER BY transaction_date ASC`
    );
    
    // Calculate current holdings from transactions
    const holdings = {};
    
    for (const transaction of transactions) {
      const key = `${transaction.symbol}_${transaction.asset_type}`;
      
      if (!holdings[key]) {
        holdings[key] = {
          asset_type: transaction.asset_type,
          asset_name: transaction.asset_name,
          symbol: transaction.symbol,
          quantity: 0,
          total_cost: 0,
          current_price: transaction.price // Use transaction price as current price
        };
      }
      
      if (transaction.transaction_type === 'buy') {
        holdings[key].quantity += transaction.quantity;
        holdings[key].total_cost += transaction.total_value;
        holdings[key].current_price = transaction.price; // Update current price
        
        // If buying non-cash asset, decrease USD cash
        if (transaction.asset_type !== 'cash') {
          const usdKey = 'USD_cash';
          if (!holdings[usdKey]) {
            holdings[usdKey] = {
              asset_type: 'cash',
              asset_name: 'US Dollar',
              symbol: 'USD',
              quantity: 0,
              total_cost: 0,
              current_price: 1.00
            };
          }
          holdings[usdKey].quantity -= transaction.total_value; // Decrease USD cash
        }
      } else if (transaction.transaction_type === 'sell') {
        holdings[key].quantity -= transaction.quantity;
        // For sells, we don't change total_cost (FIFO assumption)
        holdings[key].current_price = transaction.price; // Update current price
        
        // If selling non-cash asset, increase USD cash
        if (transaction.asset_type !== 'cash') {
          const usdKey = 'USD_cash';
          if (!holdings[usdKey]) {
            holdings[usdKey] = {
              asset_type: 'cash',
              asset_name: 'US Dollar',
              symbol: 'USD',
              quantity: 0,
              total_cost: 0,
              current_price: 1.00
            };
          }
          holdings[usdKey].quantity += transaction.total_value; // Increase USD cash
        }
      }
    }
    
    // Clear existing portfolio
    await db.query('DELETE FROM portfolio');
    
    // Insert recalculated holdings
    for (const [key, holding] of Object.entries(holdings)) {
      if (holding.quantity > 0) { // Only keep positive holdings
        const average_purchase_price = holding.total_cost / holding.quantity;
        
        await db.query(
          `INSERT INTO portfolio 
           (asset_type, asset_name, symbol, quantity, average_purchase_price, current_price)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            holding.asset_type,
            holding.asset_name,
            holding.symbol,
            holding.quantity,
            average_purchase_price,
            holding.current_price
          ]
        );
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error recalculating portfolio from transactions:', error);
    throw error;
  }
};

// Helper: Get all portfolio rows for a specific date (YYYY-MM-DD)
exports.getByDate = async (dateStr) => {
  const [rows] = await db.query(
    'SELECT * FROM portfolio WHERE DATE(updated_at) = ? ORDER BY asset_type, symbol',
    [dateStr]
  );
  return rows;
};

// Helper: Get the latest date in the portfolio table
exports.getLatestDate = async () => {
  const [rows] = await db.query(
    'SELECT MAX(DATE(updated_at)) as latest FROM portfolio'
  );
  return rows[0].latest;
};

// Helper: Copy the latest day's four rows to today
exports.copyLatestRowsToToday = async (todayStr) => {
  const latestDate = await exports.getLatestDate();
  if (!latestDate) return;
  
  // Check if today's rows already exist
  const todaysRows = await exports.getByDate(todayStr);
  if (todaysRows.length >= 4) {
    // Today's rows already exist, don't create duplicates
    return;
  }
  
  const latestRows = await exports.getByDate(latestDate);
  for (const row of latestRows) {
    await db.query(
      `INSERT INTO portfolio (asset_type, asset_name, symbol, quantity, average_purchase_price, current_price, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        row.asset_type,
        row.asset_name,
        row.symbol,
        row.quantity,
        row.average_purchase_price,
        row.current_price,
        todayStr
      ]
    );
  }
};


