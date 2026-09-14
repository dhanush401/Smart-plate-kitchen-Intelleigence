# 🍽️ SmartPlate – Restaurant Food Waste Management System

A modern, responsive web application designed for commercial kitchens and restaurants to monitor, record, analyze, and minimize food waste across 9 integrated modules with a Node.js REST API backend, Chart.js analytics, and automated smart recommendations.

---

## ✨ Features

- **📊 Dashboard**: 5 KPI metrics (Food Prepared, Sold, Leftover, Wasted, Waste Cost), Quick Trend Chart, Expiry Alert Ticker, and Recent Kitchen Activity Stream.
- **🍛 Food Entry**: Daily batch preparation tracking with auto-calculation of leftovers (`Prepared - Sold`), quick inline sold updates, category filtering, and search.
- **📦 Inventory**: Real-time ingredient tracking with stock levels vs reorder thresholds, categories (Dairy, Seafood, Produce, Meat, Dry Goods, Bakery), and dynamic expiry countdown tags.
- **🗑️ Waste Recording**: Log discarded food items with categories, waste reasons (*Over-preparation, Expired, Burnt / Cooking error, Plate waste, Spoilage*), disposal methods, and staff attribution with auto-calculated cost losses.
- **📈 Analytics**: 4 Chart.js visualizations (Waste vs Prep Trend, Waste Breakdown by Reason, Financial Loss Timeline, and Top 5 Wasted Items Ranking) with 7-day and 30-day filters.
- **⚠️ Waste Alerts**: Priority alert center detecting near-expiry ingredients (≤3 days), expired items, repeated high-waste dish patterns, and over-preparation spikes with 1-click action triggers.
- **🤖 Smart Suggestions**: AI-driven actionable kitchen insights with estimated ₹ savings, waste reduction in kg, and interactive "Apply Recommendation" state tracking.
- **📋 Reports**: Filterable audit reports with date range pickers, 1-click **Export to CSV**, and **Print / PDF** support.
- **👨‍🍳 Staff Management**: Kitchen team directory with role, shift schedule, waste compliance scores, and full timestamped activity audit feed.

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, Modern Vanilla CSS (Dark Culinary Bistro Theme, Glassmorphism, CSS Grid/Flexbox), Vanilla JavaScript (ES6+ SPA architecture).
- **Visualizations**: Chart.js.
- **Backend**: Node.js + Express.js REST API.
- **Storage**: Persistent JSON-based database with automatic seed data.

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/dhanush401/smartplate.git
cd smartplate
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the server
```bash
npm start
```

### 4. Open in browser
Navigate to `http://localhost:3000` to launch the application.

---

## 📁 Project Structure

```
├── data/
│   └── smartplate_db.json     # Persistent database
├── public/
│   ├── css/
│   │   └── styles.css         # Modern restaurant design system
│   ├── js/
│   │   ├── api.js             # REST API client
│   │   ├── app.js             # SPA routing & UI controller
│   │   └── charts.js          # Chart.js visualization manager
│   └── index.html             # Single-page application shell
├── package.json
├── server.js                  # Express.js REST API server
├── storage.js                 # Database engine & seed data
└── README.md
```

---

## 📄 License
ISC
