const portfolioModel = require('../models/portfolioModel');

const getTodayStr = () => new Date().toISOString().slice(0, 10);
const getTodayWithTime = () => {
  const now = new Date();
  return now.getFullYear() + '-' + 
         String(now.getMonth() + 1).padStart(2, '0') + '-' + 
         String(now.getDate()).padStart(2, '0') + ' ' +
         String(now.getHours()).padStart(2, '0') + ':' + 
         String(now.getMinutes()).padStart(2, '0') + ':' + 
         String(now.getSeconds()).padStart(2, '0');
};

exports.getAllAssets = () => portfolioModel.getAll();
exports.createAsset = async (data) => {
  const { asset_type, asset_name, symbol, quantity, average_purchase_price, current_price } = data;
  const todayStr = getTodayStr();
  const todayWithTime = getTodayWithTime();

  // Ensure today's four rows exist
  let todaysRows = await portfolioModel.getByDate(todayStr);
  if (todaysRows.length < 4) {
    await portfolioModel.copyLatestRowsToToday(todayWithTime);
    todaysRows = await portfolioModel.getByDate(todayStr);
  }

  // Check if we have enough USD cash for non-cash purchases
  if (asset_type !== 'cash') {
    const usdCash = todaysRows.find(a => a.asset_type === 'cash' && a.symbol === 'USD');
    if (!usdCash) {
      throw new Error('No USD cash found in portfolio. Please add cash before buying assets.');
    }
    const totalCost = quantity * average_purchase_price;
    if (usdCash.quantity < totalCost) {
      throw new Error(`Insufficient USD cash. You have $${usdCash.quantity.toFixed(2)} but need $${totalCost.toFixed(2)}`);
    }
  }

  // Update the asset row for today
  const assetRow = todaysRows.find(a => a.asset_type === asset_type && a.asset_name === asset_name && a.symbol === symbol);
  let result;
  if (assetRow) {
    // Merge: update quantity and average price
    const newQuantity = assetRow.quantity + quantity;
    const newAvgPrice = ((assetRow.quantity * assetRow.average_purchase_price) + (quantity * average_purchase_price)) / newQuantity;
    result = await portfolioModel.update(assetRow.id, {
      quantity: newQuantity,
      average_purchase_price: newAvgPrice,
      current_price,
      updated_at: todayWithTime
    });
  } else {
    // Should not happen, but fallback: create new asset row for today
    result = await portfolioModel.create({
      asset_type,
      asset_name,
      symbol,
      quantity,
      average_purchase_price,
      current_price,
      updated_at: todayWithTime
    });
  }

  // If not cash, decrease USD cash balance for today
  if (asset_type !== 'cash') {
    const cashAsset = todaysRows.find(a => a.asset_type === 'cash' && a.symbol.toUpperCase() === 'USD');
    if (!cashAsset) {
      throw new Error('No USD cash asset found in portfolio. Please add cash before buying.');
    }
    const totalCost = quantity * average_purchase_price;
    if (cashAsset.quantity < totalCost) {
      throw new Error('Insufficient USD cash to complete purchase.');
    }
    const newCash = cashAsset.quantity - totalCost;
    await portfolioModel.update(cashAsset.id, {
      quantity: newCash,
      average_purchase_price: cashAsset.average_purchase_price,
      current_price: cashAsset.current_price,
      updated_at: todayWithTime
    });
  }

  // Record transaction after successful buy
  await portfolioModel.createTransaction({
    asset_type,
    asset_name,
    symbol,
    transaction_type: 'buy',
    quantity,
    price: average_purchase_price,
    total_value: quantity * average_purchase_price,
    notes: 'Auto-recorded buy transaction'
  });
  return result;
};
exports.updateAsset = (id, data) => portfolioModel.update(id, data);

// Add method to handle sell operations with cash flow
exports.sellAsset = async (id, data) => {
  const { quantity, price } = data;
  const todayStr = getTodayStr();
  const todayWithTime = getTodayWithTime();

  // Ensure today's four rows exist
  let todaysRows = await portfolioModel.getByDate(todayStr);
  if (todaysRows.length < 4) {
    await portfolioModel.copyLatestRowsToToday(todayWithTime);
    todaysRows = await portfolioModel.getByDate(todayStr);
  }

  // Find the asset row for today by asset_type, asset_name, symbol (not just id)
  // First, get the asset info by id (from any date)
  const allAssets = await portfolioModel.getAll();
  const assetInfo = allAssets.find(a => a.id == id);
  if (!assetInfo) {
    throw new Error('Asset not found');
  }
  // Now, get today's row for this asset
  const asset = todaysRows.find(a => a.asset_type === assetInfo.asset_type && a.asset_name === assetInfo.asset_name && a.symbol === assetInfo.symbol);
  if (!asset) {
    throw new Error('Asset not found for today');
  }
  if (quantity > asset.quantity) {
    throw new Error(`Sell quantity (${quantity}) cannot exceed current holdings (${asset.quantity})`);
  }
  const newQuantity = asset.quantity - quantity;
  const totalValue = quantity * price;

  // Update the asset row for today
  let result;
  if (newQuantity > 0) {
    result = await portfolioModel.update(asset.id, {
      quantity: newQuantity,
      average_purchase_price: asset.average_purchase_price,
      current_price: asset.current_price,  // Keep the market price, don't change it
      updated_at: todayWithTime
    });
  } else {
    // Set quantity to 0 (do not remove row, just set to 0 for today)
    result = await portfolioModel.update(asset.id, {
      quantity: 0,
      average_purchase_price: asset.average_purchase_price,
      current_price: asset.current_price,  // Keep the market price, don't change it
      updated_at: todayWithTime
    });
  }

  // If selling non-cash asset, increase USD cash for today
  if (asset.asset_type !== 'cash') {
    const usdAsset = todaysRows.find(a => a.asset_type === 'cash' && a.symbol === 'USD');
    if (usdAsset) {
      const newCash = usdAsset.quantity + totalValue;
      await portfolioModel.update(usdAsset.id, {
        quantity: newCash,
        average_purchase_price: usdAsset.average_purchase_price,
        current_price: usdAsset.current_price,
        updated_at: todayWithTime
      });
    }
  }

  // Record transaction after successful sell
  await portfolioModel.createTransaction({
    asset_type: asset.asset_type,
    asset_name: asset.asset_name,
    symbol: asset.symbol,
    transaction_type: 'sell',
    quantity,
    price,
    total_value: totalValue,
    notes: 'Auto-recorded sell transaction'
  });
  return result;
};

exports.deleteAsset = (id) => portfolioModel.remove(id);
exports.getTotalValue = () => portfolioModel.getTotalValue();
exports.getPortfolioPerformance = () => portfolioModel.getPerformance();
exports.getPortfolioSummary = () => portfolioModel.getSummary();
exports.getPortfolioValueHistory = (range, type, symbol) => portfolioModel.getPortfolioValueHistory(range, type, symbol);

// Transaction history services
exports.getTransactionHistory = () => portfolioModel.getTransactions();
exports.createTransaction = (data) => portfolioModel.createTransaction(data);

// Enhanced analytics services
exports.getDetailedSummary = () => portfolioModel.getDetailedSummary();
exports.getRiskMetrics = () => portfolioModel.getRiskMetrics();
exports.getHistoricalData = () => portfolioModel.getHistoricalData();
exports.getAllocationData = () => portfolioModel.getAllocationData();

// Historical portfolio value calculation
exports.getHistoricalPortfolioValue = (targetDate) => portfolioModel.getHistoricalPortfolioValue(targetDate);

// Add method to recalculate portfolio from transactions
exports.recalculatePortfolioFromTransactions = () => portfolioModel.recalculatePortfolioFromTransactions();
