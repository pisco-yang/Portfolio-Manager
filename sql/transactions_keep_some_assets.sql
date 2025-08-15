TRUNCATE TABLE transactions;

INSERT INTO transactions (asset_type, asset_name, symbol, transaction_type, quantity, price, total_value, transaction_date, notes)
VALUES
('cash', 'US Dollar', 'USD', 'buy', 10000, 1.0, 10000.0, '2025-07-01', 'Auto-generated transaction'),
('stock', 'Apple Inc.', 'AAPL', 'buy', 0.027778, 108000, 3000.02, '2025-07-03', 'Auto-generated transaction'),
('stock', 'Apple Inc.', 'AAPL', 'buy', 0.009009, 111000, 1000.0, '2025-07-20', 'Auto-generated transaction'),
('stock', 'Apple Inc.', 'AAPL', 'sell', 0.018018, 115000, 2072.07, '2025-07-28', 'Auto-generated transaction'),
('stock', 'NVIDIA Corporation', 'NVDA', 'buy', 1.15385, 2600, 3000.01, '2025-07-05', 'Auto-generated transaction'),
('stock', 'NVIDIA Corporation', 'NVDA', 'sell', 0.5, 2700, 1350.0, '2025-07-27', 'Auto-generated transaction'),
('bond', 'US Treasury Bond 10Y', 'T-BOND10Y', 'buy', 18.75, 160, 3000.0, '2025-07-10', 'Auto-generated transaction');