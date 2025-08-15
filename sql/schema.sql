-- Database schema for Portfolio Manager
CREATE DATABASE IF NOT EXISTS portfolio_manager;
USE portfolio_manager;

-- Table: Portfolio holdings
CREATE TABLE IF NOT EXISTS portfolio (
  id INT AUTO_INCREMENT PRIMARY KEY,
  asset_type ENUM('stock','bond','cash') NOT NULL,
  asset_name VARCHAR(100) NOT NULL,
  symbol VARCHAR(20),
  quantity FLOAT NOT NULL,
  average_purchase_price FLOAT NOT NULL,
  current_price FLOAT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table: Transactions history
CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  asset_type ENUM('stock','bond','cash') NOT NULL,
  asset_name VARCHAR(100) NOT NULL,
  symbol VARCHAR(20),
  transaction_type ENUM('buy','sell') NOT NULL,
  quantity FLOAT NOT NULL,
  price FLOAT,
  total_value FLOAT NOT NULL,
  transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  notes TEXT
);

-- Unified price history table
CREATE TABLE IF NOT EXISTS price_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  symbol VARCHAR(20) NOT NULL,
  price FLOAT NOT NULL,
  date DATE NOT NULL
);

-- Initial data
INSERT INTO portfolio (asset_type, asset_name, symbol, quantity, average_purchase_price, current_price) VALUES
('stock', 'Apple Inc.', 'AAPL', 10, 150.00, 180.00),
('stock', 'NVIDIA Corporation', 'NVDA', 5, 400.00, 470.00),
('bond', 'US Treasury Bond 10Y', 'T-BOND10Y', 2, 1000.00, 995.00),
('cash', 'US Dollar', 'USD', 2000, 1.00, 1.00);

INSERT INTO transactions (asset_type, asset_name, symbol, transaction_type, quantity, price, total_value, transaction_date, notes) VALUES
('stock', 'Apple Inc.', 'AAPL', 'buy', 10, 150.00, 1500.00, '2025-07-01', 'Initial Apple purchase'),
('stock', 'NVIDIA Corporation', 'NVDA', 'buy', 5, 400.00, 2000.00, '2025-07-02', 'NVIDIA buy after earnings'),
('bond', 'US Treasury Bond 10Y', 'T-BOND10Y', 'buy', 2, 1000.00, 2000.00, '2025-07-03', 'Safe bond investment'),
('cash', 'US Dollar', 'USD', 'buy', 2000, 1.00, 2000.00, '2025-06-30', 'Initial cash balance');

INSERT INTO price_history (symbol, price, date) VALUES
('AAPL', 175.00, '2025-07-05'),
('AAPL', 180.00, '2025-07-10'),
('NVDA', 460.00, '2025-07-05'),
('NVDA', 470.00, '2025-07-10'),
('T-BOND10Y', 995.00, '2025-07-10');
