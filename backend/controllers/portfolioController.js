const portfolioService = require('../services/portfolioService');

exports.getAllAssets = async (req, res) => {
  try {
    const assets = await portfolioService.getAllAssets();
    res.json(assets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createAsset = async (req, res) => {
  try {
    const newAsset = await portfolioService.createAsset(req.body);
    res.status(201).json(newAsset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.buyAsset = async (req, res) => {
  try {
    const newAsset = await portfolioService.createAsset(req.body);
    res.status(201).json(newAsset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await portfolioService.updateAsset(id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.sellAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const sold = await portfolioService.sellAsset(id, req.body);
    res.json(sold);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await portfolioService.deleteAsset(id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTotalValue = async (req, res) => {
  try {
    const totalValue = await portfolioService.getTotalValue();
    res.json({ totalValue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPortfolioPerformance = async (req, res) => {
  try {
    const performance = await portfolioService.getPortfolioPerformance();
    res.json(performance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPortfolioSummary = async (req, res) => {
  try {
    const summary = await portfolioService.getPortfolioSummary();
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Transaction history controllers
exports.getTransactionHistory = async (req, res) => {
  try {
    const transactions = await portfolioService.getTransactionHistory();
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createTransaction = async (req, res) => {
  try {
    const newTransaction = await portfolioService.createTransaction(req.body);
    res.status(201).json(newTransaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Enhanced analytics controllers
exports.getDetailedSummary = async (req, res) => {
  try {
    const summary = await portfolioService.getDetailedSummary();
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRiskMetrics = async (req, res) => {
  try {
    const riskMetrics = await portfolioService.getRiskMetrics();
    res.json(riskMetrics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getHistoricalData = async (req, res) => {
  try {
    const historicalData = await portfolioService.getHistoricalData();
    res.json(historicalData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllocationData = async (req, res) => {
  try {
    const allocationData = await portfolioService.getAllocationData();
    res.json(allocationData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get current price by symbol
exports.getCurrentPrice = async (req, res) => {
  try {
    const { symbol, asset_type } = req.query;
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }
    const assets = await portfolioService.getAllAssets();
    let asset = assets.find(a => a.symbol === symbol);
    if (asset_type) {
      asset = assets.find(a => a.symbol === symbol && a.asset_type === asset_type);
    }
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    res.json({ current_price: asset.current_price });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPortfolioValueHistory = async (req, res) => {
  try {
    const range = req.query.range || '30d';
    const type = req.query.type;
    const symbol = req.query.symbol;
    const history = await portfolioService.getPortfolioValueHistory(range, type, symbol);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get historical portfolio value based on data progression
exports.getHistoricalPortfolioValue = async (req, res) => {
  try {
    const { date } = req.query;
    const historicalValue = await portfolioService.getHistoricalPortfolioValue(date);
    res.json(historicalValue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Recalculate portfolio from transactions
exports.recalculatePortfolio = async (req, res) => {
  try {
    await portfolioService.recalculatePortfolioFromTransactions();
    res.json({ success: true, message: 'Portfolio recalculated from transactions' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


