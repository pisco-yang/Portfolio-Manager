const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');

/**
 * @swagger
 * /api/portfolio:
 *   get:
 *     summary: Get all portfolio assets
 *     description: Retrieve all assets in the portfolio
 *     tags: [Portfolio]
 *     responses:
 *       200:
 *         description: List of all assets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Asset'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', portfolioController.getAllAssets);

/**
 * @swagger
 * /api/portfolio:
 *   post:
 *     summary: Create a new asset
 *     description: Add a new asset to the portfolio
 *     tags: [Portfolio]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Asset'
 *     responses:
 *       201:
 *         description: Asset created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Asset'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', portfolioController.createAsset);
router.post('/buy', portfolioController.buyAsset);

/**
 * @swagger
 * /api/portfolio/{id}:
 *   put:
 *     summary: Update an asset
 *     description: Update an existing asset in the portfolio
 *     tags: [Portfolio]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Asset ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: number
 *               average_purchase_price:
 *                 type: number
 *               current_price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Asset updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Asset'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', portfolioController.updateAsset);

/**
 * @swagger
 * /api/portfolio/{id}/sell:
 *   post:
 *     summary: Sell an asset
 *     description: Sell an existing asset and update cash flow
 *     tags: [Portfolio]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Asset ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: number
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Asset sold successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Asset'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:id/sell', portfolioController.sellAsset);

/**
 * @swagger
 * /api/portfolio/{id}:
 *   delete:
 *     summary: Delete an asset
 *     description: Remove an asset from the portfolio
 *     tags: [Portfolio]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Asset ID
 *     responses:
 *       200:
 *         description: Asset deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 id:
 *                   type: integer
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', portfolioController.deleteAsset);

/**
 * @swagger
 * /api/portfolio/value/total:
 *   get:
 *     summary: Get total portfolio value
 *     description: Calculate and return the total value of all assets
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Total portfolio value
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PortfolioValue'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/value/total', portfolioController.getTotalValue);

/**
 * @swagger
 * /api/portfolio/performance:
 *   get:
 *     summary: Get portfolio performance
 *     description: Get performance data for all assets including gain/loss
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Portfolio performance data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Performance'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/performance', portfolioController.getPortfolioPerformance);

/**
 * @swagger
 * /api/portfolio/summary:
 *   get:
 *     summary: Get portfolio summary
 *     description: Get basic portfolio summary information
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Portfolio summary
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Asset'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/summary', portfolioController.getPortfolioSummary);

/**
 * @swagger
 * /api/portfolio/transactions:
 *   get:
 *     summary: Get transaction history
 *     description: Retrieve all transaction records
 *     tags: [Transactions]
 *     responses:
 *       200:
 *         description: List of all transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Transaction'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/transactions', portfolioController.getTransactionHistory);

/**
 * @swagger
 * /api/portfolio/transactions:
 *   post:
 *     summary: Create a new transaction
 *     description: Record a new buy or sell transaction
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Transaction'
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/transactions', portfolioController.createTransaction);

/**
 * @swagger
 * /api/portfolio/summary/detailed:
 *   get:
 *     summary: Get detailed portfolio summary
 *     description: Get comprehensive portfolio summary with allocation percentages
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Detailed portfolio summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 assets:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Asset'
 *                 totalValue:
 *                   type: number
 *                 totalProfit:
 *                   type: number
 *                 totalReturn:
 *                   type: number
 *                 assetTypes:
 *                   type: object
 *                 assetCount:
 *                   type: integer
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/summary/detailed', portfolioController.getDetailedSummary);

/**
 * @swagger
 * /api/portfolio/analytics/risk:
 *   get:
 *     summary: Get risk metrics
 *     description: Calculate and return portfolio risk metrics
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Portfolio risk metrics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RiskMetrics'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/analytics/risk', portfolioController.getRiskMetrics);

/**
 * @swagger
 * /api/portfolio/analytics/history:
 *   get:
 *     summary: Get historical data
 *     description: Get historical portfolio value data for charts
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Historical portfolio data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   month:
 *                     type: string
 *                   value:
 *                     type: number
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/analytics/history', portfolioController.getHistoricalData);

/**
 * @swagger
 * /api/portfolio/analytics/allocation:
 *   get:
 *     summary: Get asset allocation data
 *     description: Get asset allocation breakdown by type
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Asset allocation data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                   value:
 *                     type: number
 *                   count:
 *                     type: integer
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/analytics/allocation', portfolioController.getAllocationData);

/**
 * @swagger
 * /api/portfolio/current-price:
 *   get:
 *     summary: Get current price by symbol and asset type
 *     description: Retrieve the current price for a specific asset
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *         description: Asset symbol (e.g., 'AAPL', 'TSLA')
 *       - in: query
 *         name: asset_type
 *         required: true
 *         schema:
 *           type: string
 *         description: Asset type (e.g., 'stock', 'crypto')
 *     responses:
 *       200:
 *         description: Current price for the asset
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 symbol:
 *                   type: string
 *                 asset_type:
 *                   type: string
 *                 current_price:
 *                   type: number
 *       404:
 *         description: Asset not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/current-price', portfolioController.getCurrentPrice);

/**
 * @swagger
 * /api/portfolio/history:
 *   get:
 *     summary: Get historical portfolio value data
 *     description: Retrieve historical portfolio value data for charts
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Historical portfolio value data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   date:
 *                     type: string
 *                   value:
 *                     type: number
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/history', portfolioController.getPortfolioValueHistory);

/**
 * @swagger
 * /api/portfolio/value/historical:
 *   get:
 *     summary: Get historical portfolio value based on data progression
 *     description: Calculate portfolio value by summing quantity * current_price for all assets from previous dates till now
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: date
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: Target date for calculation (defaults to current date)
 *     responses:
 *       200:
 *         description: Historical portfolio value calculation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalValue:
 *                   type: number
 *                 date:
 *                   type: string
 *                 assets:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       symbol:
 *                         type: string
 *                       asset_type:
 *                         type: string
 *                       asset_name:
 *                         type: string
 *                       quantity:
 *                         type: number
 *                       current_price:
 *                         type: number
 *                       value:
 *                         type: number
 *                       last_updated:
 *                         type: string
 *                 assetCount:
 *                   type: integer
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/value/historical', portfolioController.getHistoricalPortfolioValue);

/**
 * @swagger
 * /api/portfolio/recalculate:
 *   post:
 *     summary: Recalculate portfolio from transactions
 *     description: Recalculate current portfolio holdings based on transaction history
 *     tags: [Portfolio]
 *     responses:
 *       200:
 *         description: Portfolio recalculated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/recalculate', portfolioController.recalculatePortfolio);

module.exports = router;
