const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'smartplate_db.json');

// Helper to get formatted dates relative to today
function getDateStr(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

// Initial realistic seed dataset for high-end restaurant
function getDefaultData() {
  const today = getDateStr(0);
  const yesterday = getDateStr(-1);
  const twoDaysAgo = getDateStr(-2);
  const threeDaysAgo = getDateStr(-3);
  const fourDaysAgo = getDateStr(-4);
  const fiveDaysAgo = getDateStr(-5);
  const sixDaysAgo = getDateStr(-6);

  return {
    restaurant: {
      name: "SmartPlate Bistro & Grand Kitchen",
      branch: "Downtown Flagship",
      currency: "₹",
      currencyCode: "INR",
      timezone: "Asia/Kolkata"
    },
    staff: [
      {
        id: "STF-001",
        name: "Chef Marcus Vance",
        role: "Executive Head Chef",
        shift: "Morning (06:00 - 15:00)",
        contact: "+91 98450 12345",
        status: "Active",
        wasteScore: 96,
        avatar: "👨‍🍳"
      },
      {
        id: "STF-002",
        name: "Priya Sharma",
        role: "Sous Chef",
        shift: "Evening (14:00 - 23:00)",
        contact: "+91 98450 67890",
        status: "Active",
        wasteScore: 92,
        avatar: "👩‍🍳"
      },
      {
        id: "STF-003",
        name: "Arun Kumar",
        role: "Senior Line Cook",
        shift: "Morning (06:00 - 15:00)",
        contact: "+91 98450 33445",
        status: "Active",
        wasteScore: 88,
        avatar: "👨‍🍳"
      },
      {
        id: "STF-004",
        name: "Elena Rostova",
        role: "Pastry & Dessert Chef",
        shift: "Morning (07:00 - 16:00)",
        contact: "+91 98450 77889",
        status: "Active",
        wasteScore: 95,
        avatar: "👩‍🍳"
      },
      {
        id: "STF-005",
        name: "Karthik Raj",
        role: "Inventory & Storage Manager",
        shift: "Full Day (09:00 - 18:00)",
        contact: "+91 98450 99881",
        status: "Active",
        wasteScore: 90,
        avatar: "📦"
      }
    ],
    foodEntries: [
      {
        id: "FE-101",
        dishName: "Hyderabadi Dum Biryani",
        category: "Main Course",
        batchNumber: "BATCH-2026-081",
        preparedQty: 45,
        soldQty: 34,
        leftoverQty: 11,
        unit: "kg",
        unitCost: 180, // cost per kg
        date: today,
        chef: "Chef Marcus Vance",
        status: "In Service",
        notes: "Lunch rush prep. High demand anticipated."
      },
      {
        id: "FE-102",
        dishName: "Wild Mushroom Truffle Risotto",
        category: "Main Course",
        batchNumber: "BATCH-2026-082",
        preparedQty: 25,
        soldQty: 22,
        leftoverQty: 3,
        unit: "kg",
        unitCost: 280,
        date: today,
        chef: "Priya Sharma",
        status: "In Service",
        notes: "Cooked to order base."
      },
      {
        id: "FE-103",
        dishName: "Pan-Seared Atlantic Salmon",
        category: "Main Course",
        batchNumber: "BATCH-2026-083",
        preparedQty: 30,
        soldQty: 26,
        leftoverQty: 4,
        unit: "portions",
        unitCost: 350,
        date: today,
        chef: "Arun Kumar",
        status: "In Service",
        notes: "Prepped fresh morning catch."
      },
      {
        id: "FE-104",
        dishName: "Cream of Roasted Tomato Soup",
        category: "Soup",
        batchNumber: "BATCH-2026-084",
        preparedQty: 20,
        soldQty: 18,
        leftoverQty: 2,
        unit: "liters",
        unitCost: 75,
        date: today,
        chef: "Chef Marcus Vance",
        status: "In Service",
        notes: "Soup of the day."
      },
      {
        id: "FE-105",
        dishName: "Classic Tiramisu & Berry Tart",
        category: "Dessert",
        batchNumber: "BATCH-2026-085",
        preparedQty: 35,
        soldQty: 28,
        leftoverQty: 7,
        unit: "portions",
        unitCost: 120,
        date: today,
        chef: "Elena Rostova",
        status: "In Service",
        notes: "Chilled dessert display."
      },
      // Yesterday's records
      {
        id: "FE-096",
        dishName: "Hyderabadi Dum Biryani",
        category: "Main Course",
        batchNumber: "BATCH-2026-077",
        preparedQty: 50,
        soldQty: 35,
        leftoverQty: 15,
        unit: "kg",
        unitCost: 180,
        date: yesterday,
        chef: "Chef Marcus Vance",
        status: "Completed",
        notes: "Slight over-preparation for Monday dinner."
      },
      {
        id: "FE-097",
        dishName: "Spinach Ricotta Ravioli",
        category: "Main Course",
        batchNumber: "BATCH-2026-078",
        preparedQty: 22,
        soldQty: 20,
        leftoverQty: 2,
        unit: "kg",
        unitCost: 220,
        date: yesterday,
        chef: "Priya Sharma",
        status: "Completed",
        notes: "Handmade pasta batch."
      },
      {
        id: "FE-098",
        dishName: "BBQ Pulled Chicken Sliders",
        category: "Appetizer",
        batchNumber: "BATCH-2026-079",
        preparedQty: 40,
        soldQty: 38,
        leftoverQty: 2,
        unit: "portions",
        unitCost: 95,
        date: yesterday,
        chef: "Arun Kumar",
        status: "Completed",
        notes: "Popular lounge item."
      }
    ],
    inventory: [
      {
        id: "INV-201",
        name: "Fresh Heavy Cream (36% Fat)",
        category: "Dairy",
        stock: 4.5,
        unit: "liters",
        reorderLevel: 8.0,
        unitCost: 210,
        expiryDate: getDateStr(1), // Expires tomorrow!
        supplier: "Heritage Dairy Farms",
        lastUpdated: today
      },
      {
        id: "INV-202",
        name: "Atlantic Salmon Fillets",
        category: "Seafood",
        stock: 8.0,
        unit: "kg",
        reorderLevel: 10.0,
        unitCost: 850,
        expiryDate: getDateStr(2), // Expires in 2 days!
        supplier: "OceanCatch Coldchain",
        lastUpdated: today
      },
      {
        id: "INV-203",
        name: "Organic Baby Spinach & Arugula",
        category: "Produce",
        stock: 3.2,
        unit: "kg",
        reorderLevel: 5.0,
        unitCost: 140,
        expiryDate: getDateStr(1), // Expires tomorrow!
        supplier: "Green Valley Farms",
        lastUpdated: today
      },
      {
        id: "INV-204",
        name: "Basmati Rice (Aged Royal)",
        category: "Dry Goods",
        stock: 120.0,
        unit: "kg",
        reorderLevel: 50.0,
        unitCost: 110,
        expiryDate: getDateStr(180),
        supplier: "Punjab Agro Corp",
        lastUpdated: yesterday
      },
      {
        id: "INV-205",
        name: "Farm Fresh Eggs (Grade A)",
        category: "Dairy",
        stock: 45,
        unit: "units",
        reorderLevel: 60,
        unitCost: 7.5,
        expiryDate: getDateStr(6),
        supplier: "Sunrise Poultry",
        lastUpdated: today
      },
      {
        id: "INV-206",
        name: "Boneless Chicken Breast",
        category: "Meat & Poultry",
        stock: 18.0,
        unit: "kg",
        reorderLevel: 15.0,
        unitCost: 240,
        expiryDate: getDateStr(3),
        supplier: "Golden Poultry Co.",
        lastUpdated: today
      },
      {
        id: "INV-207",
        name: "French Butter Unsalted",
        category: "Dairy",
        stock: 12.0,
        unit: "kg",
        reorderLevel: 10.0,
        unitCost: 480,
        expiryDate: getDateStr(25),
        supplier: "Lactalis Imports",
        lastUpdated: yesterday
      },
      {
        id: "INV-208",
        name: "Bell Peppers (Tricolor)",
        category: "Produce",
        stock: 6.5,
        unit: "kg",
        reorderLevel: 8.0,
        unitCost: 95,
        expiryDate: getDateStr(2),
        supplier: "Green Valley Farms",
        lastUpdated: today
      },
      {
        id: "INV-209",
        name: "Artisan Sourdough Loaves",
        category: "Bakery",
        stock: 5,
        unit: "units",
        reorderLevel: 10,
        unitCost: 130,
        expiryDate: getDateStr(0), // Today!
        supplier: "Crust & Crumb Bakery",
        lastUpdated: today
      }
    ],
    wasteLogs: [
      {
        id: "WST-501",
        itemName: "Hyderabadi Dum Biryani",
        category: "Prepared Food",
        quantity: 8.5,
        unit: "kg",
        unitCost: 180,
        totalCost: 1530,
        reason: "Over-preparation",
        disposalMethod: "Compost",
        loggedBy: "Chef Marcus Vance",
        date: yesterday,
        timestamp: `${yesterday}T23:15:00Z`,
        notes: "Unsold portion at end of dinner buffet. No cold storage space."
      },
      {
        id: "WST-502",
        itemName: "Atlantic Salmon Fillets",
        category: "Raw Ingredient",
        quantity: 1.8,
        unit: "kg",
        unitCost: 850,
        totalCost: 1530,
        reason: "Burnt / Cooking Error",
        disposalMethod: "Landfill",
        loggedBy: "Arun Kumar",
        date: yesterday,
        timestamp: `${yesterday}T20:45:00Z`,
        notes: "Grill flared up during dinner rush; fillets over-charred."
      },
      {
        id: "WST-503",
        itemName: "Fresh Heavy Cream",
        category: "Dairy",
        quantity: 2.0,
        unit: "liters",
        unitCost: 210,
        totalCost: 420,
        reason: "Expired",
        disposalMethod: "Bio-gas Digester",
        loggedBy: "Karthik Raj",
        date: twoDaysAgo,
        timestamp: `${twoDaysAgo}T09:30:00Z`,
        notes: "Found past expiration in walk-in chiller back rack."
      },
      {
        id: "WST-504",
        itemName: "Baby Spinach & Arugula",
        category: "Produce",
        quantity: 2.5,
        unit: "kg",
        unitCost: 140,
        totalCost: 350,
        reason: "Spoilage / Storage Issue",
        disposalMethod: "Compost",
        loggedBy: "Priya Sharma",
        date: threeDaysAgo,
        timestamp: `${threeDaysAgo}T11:00:00Z`,
        notes: "Moisture build-up in crisper drawer caused wilting."
      },
      {
        id: "WST-505",
        itemName: "Pasta Primavera & Risotto",
        category: "Prepared Food",
        quantity: 4.0,
        unit: "kg",
        unitCost: 190,
        totalCost: 760,
        reason: "Plate Waste",
        disposalMethod: "Compost",
        loggedBy: "Arun Kumar",
        date: fourDaysAgo,
        timestamp: `${fourDaysAgo}T22:30:00Z`,
        notes: "Customer leftover plates cleared by waitstaff from banquet."
      },
      {
        id: "WST-506",
        itemName: "Artisan Sourdough Loaves",
        category: "Bakery",
        quantity: 4,
        unit: "units",
        unitCost: 130,
        totalCost: 520,
        reason: "Expired",
        disposalMethod: "Food Bank Donation",
        loggedBy: "Elena Rostova",
        date: fiveDaysAgo,
        timestamp: `${fiveDaysAgo}T18:00:00Z`,
        notes: "Donated to St. Jude local shelter before hardening."
      },
      {
        id: "WST-507",
        itemName: "Chicken Tikka Prep",
        category: "Prepared Food",
        quantity: 3.5,
        unit: "kg",
        unitCost: 220,
        totalCost: 770,
        reason: "Over-preparation",
        disposalMethod: "Compost",
        loggedBy: "Chef Marcus Vance",
        date: sixDaysAgo,
        timestamp: `${sixDaysAgo}T23:00:00Z`,
        notes: "Rainy Tuesday; customer footfall lower than forecasted."
      }
    ],
    activities: [
      {
        id: "ACT-001",
        type: "waste",
        description: "Recorded 8.5kg Hyderabadi Dum Biryani waste (Over-preparation)",
        staff: "Chef Marcus Vance",
        timestamp: `${yesterday}T23:15:00Z`
      },
      {
        id: "ACT-002",
        type: "prep",
        description: "Prepared 45kg batch of Hyderabadi Dum Biryani",
        staff: "Chef Marcus Vance",
        timestamp: `${today}T10:30:00Z`
      },
      {
        id: "ACT-003",
        type: "prep",
        description: "Prepared 30 portions Pan-Seared Atlantic Salmon",
        staff: "Arun Kumar",
        timestamp: `${today}T11:15:00Z`
      },
      {
        id: "ACT-004",
        type: "inventory",
        description: "Stock check alert: Fresh Heavy Cream expiring in 24 hours",
        staff: "Karthik Raj",
        timestamp: `${today}T08:00:00Z`
      },
      {
        id: "ACT-005",
        type: "waste",
        description: "Recorded 1.8kg Atlantic Salmon waste (Burnt / Cooking Error)",
        staff: "Arun Kumar",
        timestamp: `${yesterday}T20:45:00Z`
      }
    ],
    smartSuggestions: [
      {
        id: "SUG-001",
        title: "Reduce Monday Biryani Preparation by 18%",
        category: "Prep Optimization",
        priority: "High",
        impactSavings: "₹3,200 / week",
        wasteReduction: "15 kg / week",
        icon: "📉",
        description: "Data shows an average of 12kg (26%) Biryani leftover every Monday & Tuesday over the last 3 weeks. Trimming daily prep from 50kg to 40kg will match customer demand accurately.",
        status: "Pending",
        actionText: "Apply 18% Prep Reduction",
        targetItem: "Hyderabadi Dum Biryani"
      },
      {
        id: "SUG-002",
        title: "Repurpose 4.5L Heavy Cream into Chef's Panna Cotta",
        category: "Near-Expiry Action",
        priority: "Urgent",
        impactSavings: "₹945 immediate loss prevention",
        wasteReduction: "4.5 Liters",
        icon: "🍮",
        description: "Fresh Heavy Cream expires tomorrow. Chef Elena can whip up 30 portions of Vanilla Bean Panna Cotta or Tiramisu filling today, extending shelf life by 4 days in frozen storage.",
        status: "Pending",
        actionText: "Create Dessert Prep Task",
        targetItem: "Fresh Heavy Cream (36% Fat)"
      },
      {
        id: "SUG-003",
        title: "Recalibrate Char-Grill Station & Conduct Briefing",
        category: "Kitchen Quality",
        priority: "Medium",
        impactSavings: "₹2,550 / week",
        wasteReduction: "3.6 kg Seafood",
        icon: "🔥",
        description: "2 cooking error incidents recorded for Atlantic Salmon during evening peak hours. Calibrate probe thermometers and review sear timing with line cooks Arun & Priya.",
        status: "Pending",
        actionText: "Schedule Equipment Calibration",
        targetItem: "Atlantic Salmon Fillets"
      },
      {
        id: "SUG-004",
        title: "Adjust Pasta Primavera Portion Size from 350g to 290g",
        category: "Portion Control",
        priority: "Medium",
        impactSavings: "₹1,800 / week",
        wasteReduction: "8 kg Plate Waste",
        icon: "🍝",
        description: "Table service audit indicates 24% plate return on pasta dishes. Reducing standard carb portion slightly while offering complimentary bread baskets cuts waste without affecting guest satisfaction.",
        status: "Pending",
        actionText: "Update Standard Recipe Serving",
        targetItem: "Pasta Primavera & Risotto"
      },
      {
        id: "SUG-005",
        title: "Activate 'Zero-Waste Happy Hour' Special at 21:00",
        category: "Dynamic Clearance",
        priority: "High",
        impactSavings: "₹2,100 / evening",
        wasteReduction: "90% unsold clearance",
        icon: "🏷️",
        description: "Trigger a 25% discount on remaining hot mains between 21:00 and 22:30 on delivery apps and takeout bar to eliminate closing waste.",
        status: "Pending",
        actionText: "Enable Late-Hour Special",
        targetItem: "All Active Prep"
      }
    ]
  };
}

// Database helper functions
class Storage {
  constructor() {
    this.ensureDataDir();
    this.data = this.loadData();
  }

  ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  loadData() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error("Error reading database file, loading default seed:", err);
    }
    const defaults = getDefaultData();
    this.saveData(defaults);
    return defaults;
  }

  saveData(data = this.data) {
    try {
      this.ensureDataDir();
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
      return true;
    } catch (err) {
      console.error("Failed to write to database file:", err);
      return false;
    }
  }

  // Dashboard Aggregates
  getDashboardStats() {
    const today = getDateStr(0);
    const todayEntries = this.data.foodEntries.filter(e => e.date === today);
    
    // Aggregates for today
    const totalPreparedToday = todayEntries.reduce((sum, e) => sum + Number(e.preparedQty || 0), 0);
    const totalSoldToday = todayEntries.reduce((sum, e) => sum + Number(e.soldQty || 0), 0);
    const totalLeftoverToday = todayEntries.reduce((sum, e) => sum + Number(e.leftoverQty || 0), 0);

    // Waste total (all time & past 7 days)
    const sevenDaysAgo = getDateStr(-7);
    const recentWasteLogs = this.data.wasteLogs.filter(w => w.date >= sevenDaysAgo);
    const totalWastedKg = recentWasteLogs.reduce((sum, w) => sum + Number(w.quantity || 0), 0);
    const totalWasteCost = recentWasteLogs.reduce((sum, w) => sum + Number(w.totalCost || 0), 0);

    // Alerts count
    const alerts = this.getAlerts();
    const urgentAlertCount = alerts.filter(a => a.severity === 'critical' || a.severity === 'warning').length;

    // Top wasted items
    const wasteByItem = {};
    recentWasteLogs.forEach(w => {
      wasteByItem[w.itemName] = (wasteByItem[w.itemName] || 0) + Number(w.quantity || 0);
    });
    const topWasted = Object.entries(wasteByItem)
      .map(([name, qty]) => ({ name, qty: Number(qty.toFixed(1)) }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    return {
      currency: this.data.restaurant.currency || "₹",
      today: {
        prepared: Number(totalPreparedToday.toFixed(1)),
        sold: Number(totalSoldToday.toFixed(1)),
        leftover: Number(totalLeftoverToday.toFixed(1))
      },
      weekly: {
        wastedKg: Number(totalWastedKg.toFixed(1)),
        wasteCost: Number(totalWasteCost.toFixed(2)),
        wasteCount: recentWasteLogs.length
      },
      urgentAlertCount,
      topWasted,
      recentActivities: this.data.activities.slice(0, 8)
    };
  }

  // Alerts logic
  getAlerts() {
    const today = new Date().toISOString().split('T')[0];
    const alerts = [];

    // 1. Expiry alerts from Inventory
    this.data.inventory.forEach(item => {
      const exp = new Date(item.expiryDate);
      const now = new Date(today);
      const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        alerts.push({
          id: `ALT-EXP-${item.id}`,
          type: "expiry",
          severity: "critical",
          title: `Expired: ${item.name}`,
          message: `${item.stock} ${item.unit} passed expiry date on ${item.expiryDate}. Quarantine immediately!`,
          item: item.name,
          diffDays,
          suggestedAction: "Quarantine & Safe Disposal",
          date: today
        });
      } else if (diffDays <= 3) {
        alerts.push({
          id: `ALT-EXP-${item.id}`,
          type: "expiry",
          severity: diffDays <= 1 ? "critical" : "warning",
          title: `Expiring Soon: ${item.name}`,
          message: `${item.stock} ${item.unit} expires in ${diffDays === 0 ? 'today' : diffDays + ' day(s)'} (${item.expiryDate}). Prioritize in prep!`,
          item: item.name,
          diffDays,
          suggestedAction: "Use in Chef Special Today",
          date: today
        });
      }

      // Stock level alerts
      if (item.stock <= item.reorderLevel) {
        alerts.push({
          id: `ALT-STK-${item.id}`,
          type: "stock",
          severity: "info",
          title: `Low Stock: ${item.name}`,
          message: `Stock level (${item.stock} ${item.unit}) has dropped below reorder threshold (${item.reorderLevel} ${item.unit}).`,
          item: item.name,
          suggestedAction: "Reorder from Supplier",
          date: today
        });
      }
    });

    // 2. High Waste Pattern alerts
    const itemWasteCounts = {};
    this.data.wasteLogs.forEach(w => {
      itemWasteCounts[w.itemName] = (itemWasteCounts[w.itemName] || 0) + 1;
    });

    Object.entries(itemWasteCounts).forEach(([name, count]) => {
      if (count >= 2) {
        alerts.push({
          id: `ALT-PAT-${name.replace(/[^a-zA-Z0-9]/g, '')}`,
          type: "pattern",
          severity: "warning",
          title: `Repeated Waste: ${name}`,
          message: `Logged ${count} times in the last 7 days. Review batch sizing and portion control.`,
          item: name,
          suggestedAction: "Review Preparation Batch",
          date: today
        });
      }
    });

    // 3. High Leftover in Food Entries
    this.data.foodEntries.forEach(entry => {
      if (entry.preparedQty > 0) {
        const leftoverPercent = (entry.leftoverQty / entry.preparedQty) * 100;
        if (leftoverPercent >= 30) {
          alerts.push({
            id: `ALT-LEFT-${entry.id}`,
            type: "overprep",
            severity: "warning",
            title: `Excess Leftover: ${entry.dishName}`,
            message: `${entry.leftoverQty} ${entry.unit} (${leftoverPercent.toFixed(0)}%) leftover recorded for batch ${entry.batchNumber}.`,
            item: entry.dishName,
            suggestedAction: "Reduce Next Batch Size",
            date: entry.date
          });
        }
      }
    });

    return alerts;
  }

  // Analytics logic
  getAnalyticsData(timeframe = '7days') {
    const days = timeframe === '30days' ? 30 : 7;
    const dateLabels = [];
    for (let i = days - 1; i >= 0; i--) {
      dateLabels.push(getDateStr(-i));
    }

    // Daily waste by date
    const dailyWasteMap = {};
    const dailyPrepMap = {};
    const dailyCostMap = {};

    dateLabels.forEach(d => {
      dailyWasteMap[d] = 0;
      dailyPrepMap[d] = 0;
      dailyCostMap[d] = 0;
    });

    this.data.wasteLogs.forEach(w => {
      if (dailyWasteMap[w.date] !== undefined) {
        dailyWasteMap[w.date] += Number(w.quantity || 0);
        dailyCostMap[w.date] += Number(w.totalCost || 0);
      }
    });

    this.data.foodEntries.forEach(e => {
      if (dailyPrepMap[e.date] !== undefined) {
        dailyPrepMap[e.date] += Number(e.preparedQty || 0);
      }
    });

    // Waste by reason
    const reasonMap = {};
    this.data.wasteLogs.forEach(w => {
      const r = w.reason || "Other";
      reasonMap[r] = (reasonMap[r] || 0) + Number(w.quantity || 0);
    });

    // Waste by category
    const categoryMap = {};
    this.data.wasteLogs.forEach(w => {
      const c = w.category || "General";
      categoryMap[c] = (categoryMap[c] || 0) + Number(w.totalCost || 0);
    });

    // Top wasted items
    const itemMap = {};
    this.data.wasteLogs.forEach(w => {
      itemMap[w.itemName] = (itemMap[w.itemName] || 0) + Number(w.quantity || 0);
    });
    const topWasted = Object.entries(itemMap)
      .map(([name, qty]) => ({ name, qty: Number(qty.toFixed(1)) }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 6);

    return {
      labels: dateLabels.map(d => d.slice(5)), // MM-DD
      wasteTrend: dateLabels.map(d => Number(dailyWasteMap[d].toFixed(1))),
      prepTrend: dateLabels.map(d => Number(dailyPrepMap[d].toFixed(1))),
      costTrend: dateLabels.map(d => Number(dailyCostMap[d].toFixed(0))),
      reasons: {
        labels: Object.keys(reasonMap),
        data: Object.values(reasonMap).map(v => Number(v.toFixed(1)))
      },
      categories: {
        labels: Object.keys(categoryMap),
        data: Object.values(categoryMap).map(v => Number(v.toFixed(0)))
      },
      topWasted
    };
  }

  // Reports Generator
  generateReport({ type = 'waste', startDate, endDate, category }) {
    let result = [];
    const from = startDate || getDateStr(-30);
    const to = endDate || getDateStr(0);

    if (type === 'waste') {
      result = this.data.wasteLogs.filter(w => {
        const matchesDate = w.date >= from && w.date <= to;
        const matchesCat = !category || category === 'All' || w.category === category;
        return matchesDate && matchesCat;
      });
    } else if (type === 'prep') {
      result = this.data.foodEntries.filter(e => {
        const matchesDate = e.date >= from && e.date <= to;
        const matchesCat = !category || category === 'All' || e.category === category;
        return matchesDate && matchesCat;
      });
    } else if (type === 'inventory') {
      result = this.data.inventory.filter(i => {
        return !category || category === 'All' || i.category === category;
      });
    } else if (type === 'staff') {
      result = this.data.staff.map(s => {
        const logs = this.data.wasteLogs.filter(w => w.loggedBy === s.name);
        const totalWasted = logs.reduce((sum, w) => sum + Number(w.quantity || 0), 0);
        const totalCost = logs.reduce((sum, w) => sum + Number(w.totalCost || 0), 0);
        return {
          id: s.id,
          name: s.name,
          role: s.role,
          shift: s.shift,
          totalLogsRecorded: logs.length,
          totalWastedKg: Number(totalWasted.toFixed(1)),
          totalWasteCost: Number(totalCost.toFixed(2)),
          complianceScore: s.wasteScore
        };
      });
    }

    return {
      type,
      startDate: from,
      endDate: to,
      totalRecords: result.length,
      currency: this.data.restaurant.currency,
      records: result
    };
  }

  // Activity logger helper
  logActivity(type, description, staff = "Kitchen Staff") {
    const activity = {
      id: `ACT-${Date.now()}`,
      type,
      description,
      staff,
      timestamp: new Date().toISOString()
    };
    this.data.activities.unshift(activity);
    if (this.data.activities.length > 50) {
      this.data.activities.pop();
    }
    this.saveData();
    return activity;
  }
}

module.exports = new Storage();
