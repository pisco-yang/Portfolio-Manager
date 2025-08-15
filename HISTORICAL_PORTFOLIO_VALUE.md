# Historical Portfolio Value Calculation

This feature allows you to calculate portfolio values based on historical data progression, summing up `quantity * current_price` for all assets from previous dates up to the current date.

## How It Works

The system calculates portfolio values by:

1. **Historical Data Progression**: Looking at all portfolio entries up to a specific date
2. **Cumulative Holdings**: For each asset symbol, it uses the most recent quantity and current price up to that date
3. **Value Calculation**: Sums up `quantity * current_price` for all assets

## Example Calculation

Based on your example data:

### July 29, 2025
- AAPL: 0 × $180 = $0 (no holdings yet)
- NVDA: 0 × $470 = $0 (no holdings yet)  
- T-BOND10Y: 0 × $995 = $0 (no holdings yet)
- USD: 1780 × $1 = $1780
- **Total: $1780**

### July 30, 2025
- AAPL: 20 × $180 = $3600 (10 + 10 from July 29)
- NVDA: 4 × $470 = $1880
- T-BOND10Y: 12 × $995 = $11940 (2 + 10)
- USD: 1780 × $1 = $1780
- **Total: $19200**

## API Endpoints

### Historical Portfolio Value
```
GET /api/portfolio/value/historical?date=2025-07-30
```

**Response:**
```json
{
  "totalValue": 19200,
  "date": "2025-07-30",
  "assets": [
    {
      "symbol": "AAPL",
      "asset_type": "stock",
      "asset_name": "Apple Inc.",
      "quantity": 20,
      "current_price": 180,
      "value": 3600,
      "last_updated": "2025-07-30"
    }
  ],
  "assetCount": 4
}
```

## Backend Implementation
The historical portfolio value calculation is available as a backend API endpoint for programmatic access. The frontend UI for this feature has been removed as requested.



## Database Structure

The system uses the existing `portfolio` table with the `updated_at` timestamp to track when each entry was last modified:

```sql
CREATE TABLE portfolio (
  id INT AUTO_INCREMENT PRIMARY KEY,
  asset_type ENUM('stock', 'bond', 'cash') NOT NULL,
  asset_name VARCHAR(100) NOT NULL,
  symbol VARCHAR(20),
  quantity FLOAT NOT NULL,
  average_purchase_price FLOAT NOT NULL,
  current_price FLOAT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Key Features

- **Date-based Calculation**: Calculate portfolio value for any specific date
- **Asset Breakdown**: Detailed breakdown of each asset's contribution
- **Real-time Updates**: Uses current prices from the database
- **API Access**: Available as a REST API endpoint

## Testing

Run the test script to see the functionality in action:

```bash
node test_historical_value.js
```

This will demonstrate the API calls and show expected calculations based on your example data.

## Notes

- The system assumes that portfolio entries represent the state of holdings at the time of the `updated_at` timestamp
- For dates before any portfolio entries exist, the value will be $0
- The calculation uses the most recent entry for each asset symbol up to the target date
- Cash (USD) is included in the calculations 