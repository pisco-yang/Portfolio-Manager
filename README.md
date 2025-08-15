# 🚀 Portfolio Manager

_A modern, full-stack investment portfolio management platform with real-time analytics, trading, and a beautiful, professional UI._

---

## ✨ Features

### 📈 **Real Data-Driven Portfolio Trend**
- Interactive line chart with selectable time ranges (7 days, 30 days, 6 months, 1 year)
- Asset filtering: View "All", by asset type (Stock, Bond), or individual assets (AAPL, NVDA, TSLA, T-BOND10Y)
- **Portfolio Value Calculation:** Uses actual holdings progression based on transaction history with historical price movements
- **Comprehensive Price History:** 6 months of realistic price data for AAPL, NVDA, TSLA, and T-BOND10Y
- **Accurate Holdings Tracking:** Shows portfolio value changes based on actual buy/sell transactions over time
- Professional chart design with dynamic Y-axis scaling, smooth lines (no points), and interactive tooltips
- Distinct color coding for different asset types and symbols

### 💼 **Advanced Trading Interface**
- **Smart Buy Form:**
  - Asset Type dropdown filters Asset Name options automatically
  - Current Price auto-fetched from database and read-only for stocks/bonds
  - Symbol auto-filled when Asset Name is selected
  - Cash balance validation prevents over-spending
  - Real-time price updates from database

- **Protected Sell Form:**
  - Sell Price automatically fetched from database and read-only
  - Asset selection merges holdings of same symbol/type
  - Only shows assets with positive quantities
  - Robust validation prevents selling more than owned
  - Real-time price fetching with loading states

### 📅 **Smart Calendar Interface**
- Interactive calendar for browsing transaction history by date
- Visual indicators (dots) show dates with transactions
- Click any date to view transactions from that specific day
- **Fixed Date Comparison:** Resolved timezone issues for accurate date matching
- Calendar navigation with previous/next month buttons
- Responsive design with smooth animations

### ⏰ **Real-time Clock**
- Fancy animated clock displaying current time and date
- Consistent with website theme and responsive design
- Updates every second with smooth transitions

### 📋 **Transaction History**
- Complete, filterable record of all trades
- Individual transaction listing (not merged)
- Date-based filtering through calendar interface
- Proper unit display (shares for stocks, bonds for bonds, no unit for cash)
- Color-coded buy/sell indicators

### 📊 **Advanced Analytics**
- **Asset Allocation Chart:** Distinct colors for each asset type with black borders
- **Investment Performance Analysis:** Merged asset performance by symbol
- Risk metrics, performance, allocation, and actionable insights
- Clear color coding (red for losses, green for gains, no green borders on loss bars)
- Excludes cash from performance calculations

### 🎨 **Current Holdings Display**
- Merged assets by symbol and type for cleaner display
- Proper unit display (shares, bonds, or none for cash)
- Real-time portfolio value calculations
- Responsive grid layout with animations

### 🛡️ **Data Integrity & Validation**
- Backend validation for cash balance and quantity checks
- Frontend form validation and user feedback
- Read-only fields for critical data (prices, symbols)
- Error handling with user-friendly messages

### 🎯 **Responsive, Modern UI**
- Dark/green theme with professional styling
- Mobile-friendly responsive design
- Smooth animations and transitions
- Consistent color scheme throughout
- Interactive elements with hover effects

### 💾 **Persistent Storage**
- MySQL database with real price history tables for each asset
- Transaction history with full audit trail
- Portfolio state persistence across sessions

### 📚 **Interactive API Documentation**
- Swagger/OpenAPI 3.0 for live API testing
- Complete endpoint documentation
- Request/response examples

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript (ES6+), Chart.js
- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **API Docs:** Swagger (OpenAPI 3.0)
- **Styling:** Custom CSS (dark/green theme)

---

## 📋 Prerequisites

- Node.js (v14+)
- MySQL (v8.0+)
- npm (comes with Node.js)
- Windows (for batch files) or use npm scripts on other OS

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/pumpyyy/Portfolio-Manager.git
cd Portfolio-Manager
```

### 2. Install Dependencies

```bash
# Recommended (Windows):
setup.bat

# Or (any OS):
npm install
```

### 3. Set Up the Database

- Create a MySQL database named `portfolio_db`
- Import the schema and sample data:
  ```bash
  mysql -u root -p < tables.sql
  ```

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=portfolio_db
PORT=3000
```

### 5. Start the Application

#### Windows (Batch Files)

```bash
# Production
start-server.bat

# Development (auto-restart)
start-dev.bat
```

#### Any OS (npm)

```bash
npm start         # Production
npm run dev       # Development
```

---

## 🌐 Access the App

- **Main App:** [http://localhost:3000](http://localhost:3000)
- **API Docs:** [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---

## 📊 API Documentation

- **Interactive Swagger UI:** Test all endpoints, view schemas, and see live responses.
- **Open in browser:** [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---

## 🗂️ Project Structure

```
Portfolio-Manager/
├── app.js                # Main server file
├── swagger.js            # Swagger API docs config
├── start-server.bat      # Quick start (Windows)
├── start-dev.bat         # Dev mode (Windows)
├── setup.bat             # First-time setup (Windows)
├── backend/
│   ├── config/
│   │   └── db.js         # Database configuration
│   ├── controllers/
│   │   └── portfolioController.js  # API controllers
│   ├── models/
│   │   └── portfolioModel.js       # Database models
│   ├── routers/
│   │   └── portfolioRouter.js      # API routes
│   └── services/
│       └── portfolioService.js     # Business logic
├── frontend/
│   ├── css/
│   │   └── style.css     # Main stylesheet
│   ├── js/
│   │   ├── main.js       # Core application logic
│   │   ├── charts.js     # Chart.js configurations
│   │   ├── trading.js    # Trading interface logic
│   │   ├── analytics.js  # Analytics calculations
│   │   └── calendar.js   # Calendar and clock functionality
│   └── index.html        # Main application page
├── tables.sql            # Database schema & sample data
└── README.md
```

---

## 🧑‍💻 Usage

### 📈 **Portfolio Overview**
- View current portfolio value and allocation
- See asset allocation chart with distinct colors
- Check current holdings (merged by symbol/type)

### 💼 **Trading**
- **Buy Assets:** Select asset type, name, quantity, and price (auto-fetched)
- **Sell Assets:** Choose from owned assets, enter quantity (price auto-fetched)
- Real-time validation and cash balance updates

### 📊 **Analytics**
- **Performance Analysis:** View gains/losses by asset (merged by symbol)
- **Risk Metrics:** Portfolio risk assessment
- **Insights:** Actionable investment recommendations

### 📅 **Transaction History**
- **Calendar Interface:** Click dates to view transactions
- **Filter by Date:** Use calendar navigation
- **Complete Records:** All buy/sell transactions with details

### 📈 **Portfolio Trends**
- **Time Range Selection:** 7 days, 30 days, 6 months, 1 year
- **Asset Filtering:** View all, by type, or individual assets
- **Real Data:** Historical portfolio values from database

---

## 🐛 Recent Bug Fixes

### ✅ **Calendar Date Comparison**
- Fixed timezone issues causing incorrect date matching
- Now uses local date components instead of UTC conversion
- Accurate transaction filtering by selected date

### ✅ **Trading Interface**
- Fixed cash balance not decreasing after purchases
- Resolved "Asset not found" errors in sell form
- Improved asset filtering in dropdowns
- Added validation for insufficient funds

### ✅ **Data Display**
- Fixed unit display (shares, bonds, no unit for cash)
- Resolved asset merging issues in Current Holdings
- Improved chart colors and styling

### ✅ **Chart Improvements**
- Removed circle points from line charts
- Fixed Y-axis label spacing
- Improved color coding for different asset types
- Enhanced tooltip interactions

---

## 📝 Development

- **Production:** `start-server.bat` or `npm start`
- **Development:** `start-dev.bat` or `npm run dev`
- **First-time setup:** `setup.bat` or `npm install`

---

## 🐛 Troubleshooting

- **Database Issues:** Ensure MySQL is running and credentials are correct
- **Port in Use:** Change `PORT` in `.env` or stop the conflicting process
- **CORS Issues:** The app uses CORS middleware by default
- **Calendar Issues:** Clear browser cache if date filtering seems incorrect

---

## 📝 License

This project is licensed under the ISC License.

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch
3. Make changes and test
4. Submit a pull request

---

## 📞 Support

For issues or questions, open an issue on GitHub.

---

**Happy Trading! 📈**
