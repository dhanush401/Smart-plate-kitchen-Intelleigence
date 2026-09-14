const express = require('express');
const cors = require('cors');
const path = require('path');
const storage = require('./storage');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// -------------------------------------------------------------
// Health check
// -------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'SmartPlate Restaurant Food Waste Management System',
    timestamp: new Date().toISOString()
  });
});

// -------------------------------------------------------------
// 1. Dashboard Stats
// -------------------------------------------------------------
app.get('/api/dashboard/stats', (req, res) => {
  try {
    const stats = storage.getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// 2. Food Entry Management
// -------------------------------------------------------------
app.get('/api/food-entries', (req, res) => {
  const { date, category, search } = req.query;
  let entries = storage.data.foodEntries;

  if (date) {
    entries = entries.filter(e => e.date === date);
  }
  if (category && category !== 'All') {
    entries = entries.filter(e => e.category === category);
  }
  if (search) {
    const term = search.toLowerCase();
    entries = entries.filter(e => 
      e.dishName.toLowerCase().includes(term) ||
      e.batchNumber.toLowerCase().includes(term) ||
      (e.chef && e.chef.toLowerCase().includes(term))
    );
  }

  res.json({ success: true, count: entries.length, data: entries });
});

app.post('/api/food-entries', (req, res) => {
  try {
    const { dishName, category, preparedQty, soldQty, unit, unitCost, chef, notes, date } = req.body;
    if (!dishName || !preparedQty) {
      return res.status(400).json({ success: false, message: "Dish name and prepared quantity are required." });
    }

    const prep = Number(preparedQty);
    const sold = Number(soldQty || 0);
    const leftover = Math.max(0, prep - sold);
    const cost = Number(unitCost || 0);

    const newEntry = {
      id: `FE-${Date.now().toString().slice(-5)}`,
      dishName: dishName.trim(),
      category: category || "Main Course",
      batchNumber: `BATCH-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      preparedQty: prep,
      soldQty: sold,
      leftoverQty: leftover,
      unit: unit || "kg",
      unitCost: cost,
      date: date || new Date().toISOString().split('T')[0],
      chef: chef || "Kitchen Chef",
      status: "In Service",
      notes: notes || ""
    };

    storage.data.foodEntries.unshift(newEntry);
    storage.logActivity('prep', `Prepared ${prep}${newEntry.unit} of ${dishName}`, newEntry.chef);
    storage.saveData();

    res.status(201).json({ success: true, message: "Food preparation record added successfully!", data: newEntry });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/food-entries/:id', (req, res) => {
  try {
    const { id } = req.params;
    const index = storage.data.foodEntries.findIndex(e => e.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: "Entry not found" });
    }

    const entry = storage.data.foodEntries[index];
    const { dishName, category, preparedQty, soldQty, unit, unitCost, chef, status, notes } = req.body;

    if (dishName !== undefined) entry.dishName = dishName;
    if (category !== undefined) entry.category = category;
    if (preparedQty !== undefined) entry.preparedQty = Number(preparedQty);
    if (soldQty !== undefined) entry.soldQty = Number(soldQty);
    entry.leftoverQty = Math.max(0, entry.preparedQty - entry.soldQty);
    if (unit !== undefined) entry.unit = unit;
    if (unitCost !== undefined) entry.unitCost = Number(unitCost);
    if (chef !== undefined) entry.chef = chef;
    if (status !== undefined) entry.status = status;
    if (notes !== undefined) entry.notes = notes;

    storage.data.foodEntries[index] = entry;
    storage.saveData();

    res.json({ success: true, message: "Food entry updated successfully", data: entry });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/food-entries/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = storage.data.foodEntries.length;
  storage.data.foodEntries = storage.data.foodEntries.filter(e => e.id !== id);

  if (storage.data.foodEntries.length === initialLength) {
    return res.status(404).json({ success: false, message: "Entry not found" });
  }

  storage.saveData();
  res.json({ success: true, message: "Food preparation entry removed" });
});

// -------------------------------------------------------------
// 3. Inventory Management
// -------------------------------------------------------------
app.get('/api/inventory', (req, res) => {
  const { category, search, filter } = req.query;
  let items = storage.data.inventory;

  if (category && category !== 'All') {
    items = items.filter(i => i.category === category);
  }
  if (search) {
    const term = search.toLowerCase();
    items = items.filter(i => i.name.toLowerCase().includes(term) || i.supplier.toLowerCase().includes(term));
  }
  if (filter === 'lowStock') {
    items = items.filter(i => i.stock <= i.reorderLevel);
  } else if (filter === 'expiring') {
    const today = new Date().toISOString().split('T')[0];
    items = items.filter(i => {
      const diff = (new Date(i.expiryDate) - new Date(today)) / (1000 * 60 * 60 * 24);
      return diff <= 3;
    });
  }

  res.json({ success: true, count: items.length, data: items });
});

app.post('/api/inventory', (req, res) => {
  try {
    const { name, category, stock, unit, reorderLevel, unitCost, expiryDate, supplier } = req.body;
    if (!name || stock === undefined || !expiryDate) {
      return res.status(400).json({ success: false, message: "Name, stock, and expiry date are required." });
    }

    const newItem = {
      id: `INV-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      category: category || "Produce",
      stock: Number(stock),
      unit: unit || "kg",
      reorderLevel: Number(reorderLevel || 5),
      unitCost: Number(unitCost || 0),
      expiryDate,
      supplier: supplier || "Direct Supplier",
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    storage.data.inventory.unshift(newItem);
    storage.logActivity('inventory', `Added ingredient ${newItem.name} (${newItem.stock}${newItem.unit}) to inventory`, "Inventory Manager");
    storage.saveData();

    res.status(201).json({ success: true, message: "Ingredient added to inventory", data: newItem });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/inventory/:id', (req, res) => {
  try {
    const { id } = req.params;
    const index = storage.data.inventory.findIndex(i => i.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: "Inventory item not found" });
    }

    const item = storage.data.inventory[index];
    const { name, category, stock, unit, reorderLevel, unitCost, expiryDate, supplier } = req.body;

    if (name !== undefined) item.name = name;
    if (category !== undefined) item.category = category;
    if (stock !== undefined) item.stock = Number(stock);
    if (unit !== undefined) item.unit = unit;
    if (reorderLevel !== undefined) item.reorderLevel = Number(reorderLevel);
    if (unitCost !== undefined) item.unitCost = Number(unitCost);
    if (expiryDate !== undefined) item.expiryDate = expiryDate;
    if (supplier !== undefined) item.supplier = supplier;
    item.lastUpdated = new Date().toISOString().split('T')[0];

    storage.data.inventory[index] = item;
    storage.saveData();

    res.json({ success: true, message: "Inventory item updated", data: item });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/inventory/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = storage.data.inventory.length;
  storage.data.inventory = storage.data.inventory.filter(i => i.id !== id);

  if (storage.data.inventory.length === initialLength) {
    return res.status(404).json({ success: false, message: "Item not found" });
  }

  storage.saveData();
  res.json({ success: true, message: "Inventory item deleted" });
});

// -------------------------------------------------------------
// 4. Waste Recording
// -------------------------------------------------------------
app.get('/api/waste', (req, res) => {
  const { reason, category, search, startDate, endDate } = req.query;
  let logs = storage.data.wasteLogs;

  if (reason && reason !== 'All') {
    logs = logs.filter(w => w.reason === reason);
  }
  if (category && category !== 'All') {
    logs = logs.filter(w => w.category === category);
  }
  if (startDate) {
    logs = logs.filter(w => w.date >= startDate);
  }
  if (endDate) {
    logs = logs.filter(w => w.date <= endDate);
  }
  if (search) {
    const term = search.toLowerCase();
    logs = logs.filter(w => 
      w.itemName.toLowerCase().includes(term) ||
      (w.loggedBy && w.loggedBy.toLowerCase().includes(term)) ||
      (w.notes && w.notes.toLowerCase().includes(term))
    );
  }

  res.json({ success: true, count: logs.length, data: logs });
});

app.post('/api/waste', (req, res) => {
  try {
    const { itemName, category, quantity, unit, unitCost, reason, disposalMethod, loggedBy, notes, date } = req.body;
    if (!itemName || !quantity || !reason) {
      return res.status(400).json({ success: false, message: "Item name, quantity, and reason are required." });
    }

    const qty = Number(quantity);
    const cost = Number(unitCost || 0);
    const totalCost = Number((qty * cost).toFixed(2));
    const entryDate = date || new Date().toISOString().split('T')[0];

    const newWaste = {
      id: `WST-${Date.now().toString().slice(-5)}`,
      itemName: itemName.trim(),
      category: category || "Prepared Food",
      quantity: qty,
      unit: unit || "kg",
      unitCost: cost,
      totalCost: totalCost,
      reason: reason || "Over-preparation",
      disposalMethod: disposalMethod || "Compost",
      loggedBy: loggedBy || "Kitchen Staff",
      date: entryDate,
      timestamp: new Date().toISOString(),
      notes: notes || ""
    };

    storage.data.wasteLogs.unshift(newWaste);
    storage.logActivity('waste', `Logged waste: ${qty}${newWaste.unit} of ${itemName} (${reason}) - Cost loss: ${storage.data.restaurant.currency}${totalCost}`, newWaste.loggedBy);
    storage.saveData();

    res.status(201).json({ success: true, message: "Food waste logged successfully!", data: newWaste });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/waste/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = storage.data.wasteLogs.length;
  storage.data.wasteLogs = storage.data.wasteLogs.filter(w => w.id !== id);

  if (storage.data.wasteLogs.length === initialLength) {
    return res.status(404).json({ success: false, message: "Waste log not found" });
  }

  storage.saveData();
  res.json({ success: true, message: "Waste record deleted" });
});

// -------------------------------------------------------------
// 5. Analytics
// -------------------------------------------------------------
app.get('/api/analytics', (req, res) => {
  const { timeframe } = req.query; // '7days' | '30days'
  try {
    const data = storage.getAnalyticsData(timeframe || '7days');
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// 6. Waste Alerts
// -------------------------------------------------------------
app.get('/api/alerts', (req, res) => {
  try {
    const alerts = storage.getAlerts();
    res.json({ success: true, count: alerts.length, data: alerts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// 7. Smart Suggestions
// -------------------------------------------------------------
app.get('/api/smart-suggestions', (req, res) => {
  res.json({ success: true, count: storage.data.smartSuggestions.length, data: storage.data.smartSuggestions });
});

app.post('/api/smart-suggestions/:id/apply', (req, res) => {
  const { id } = req.params;
  const suggestion = storage.data.smartSuggestions.find(s => s.id === id);
  if (!suggestion) {
    return res.status(404).json({ success: false, message: "Suggestion not found" });
  }

  suggestion.status = suggestion.status === "Applied" ? "Pending" : "Applied";
  storage.logActivity('suggestion', `Actioned smart suggestion: "${suggestion.title}"`, "Executive Chef");
  storage.saveData();

  res.json({ success: true, message: `Suggestion marked as ${suggestion.status}`, data: suggestion });
});

// -------------------------------------------------------------
// 8. Reports & CSV Export
// -------------------------------------------------------------
app.get('/api/reports', (req, res) => {
  try {
    const report = storage.generateReport(req.query);
    res.json({ success: true, data: report });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/reports/csv', (req, res) => {
  try {
    const report = storage.generateReport(req.query);
    let csv = "";

    if (report.type === 'waste') {
      csv = "ID,Item Name,Category,Quantity,Unit,Unit Cost,Total Cost,Reason,Disposal Method,Staff,Date,Notes\n";
      report.records.forEach(r => {
        csv += `"${r.id}","${r.itemName}","${r.category}",${r.quantity},"${r.unit}",${r.unitCost},${r.totalCost},"${r.reason}","${r.disposalMethod}","${r.loggedBy}","${r.date}","${(r.notes || '').replace(/"/g, '""')}"\n`;
      });
    } else if (report.type === 'prep') {
      csv = "ID,Dish Name,Category,Batch Number,Prepared Qty,Sold Qty,Leftover Qty,Unit,Unit Cost,Chef,Date,Status\n";
      report.records.forEach(r => {
        csv += `"${r.id}","${r.dishName}","${r.category}","${r.batchNumber}",${r.preparedQty},${r.soldQty},${r.leftoverQty},"${r.unit}",${r.unitCost},"${r.chef}","${r.date}","${r.status}"\n`;
      });
    } else if (report.type === 'inventory') {
      csv = "ID,Item Name,Category,Stock,Unit,Reorder Level,Unit Cost,Expiry Date,Supplier\n";
      report.records.forEach(r => {
        csv += `"${r.id}","${r.name}","${r.category}",${r.stock},"${r.unit}",${r.reorderLevel},${r.unitCost},"${r.expiryDate}","${r.supplier}"\n`;
      });
    } else {
      csv = "ID,Name,Role,Shift,Total Logs,Total Waste (kg),Total Loss Cost,Compliance Score\n";
      report.records.forEach(r => {
        csv += `"${r.id}","${r.name}","${r.role}","${r.shift}",${r.totalLogsRecorded},${r.totalWastedKg},${r.totalWasteCost},${r.complianceScore}\n`;
      });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=smartplate_${report.type}_report.csv`);
    res.send(csv);
  } catch (err) {
    res.status(500).send("Error generating CSV");
  }
});

// -------------------------------------------------------------
// 9. Staff Management
// -------------------------------------------------------------
app.get('/api/staff', (req, res) => {
  res.json({
    success: true,
    count: storage.data.staff.length,
    data: storage.data.staff,
    activities: storage.data.activities
  });
});

app.post('/api/staff', (req, res) => {
  try {
    const { name, role, shift, contact } = req.body;
    if (!name || !role) {
      return res.status(400).json({ success: false, message: "Name and role are required." });
    }

    const newStaff = {
      id: `STF-${Date.now().toString().slice(-3)}`,
      name: name.trim(),
      role: role.trim(),
      shift: shift || "Morning (06:00 - 15:00)",
      contact: contact || "",
      status: "Active",
      wasteScore: 95,
      avatar: role.toLowerCase().includes("chef") ? "👨‍🍳" : "👤"
    };

    storage.data.staff.push(newStaff);
    storage.logActivity('staff', `Added new team member: ${newStaff.name} (${newStaff.role})`, "Admin");
    storage.saveData();

    res.status(201).json({ success: true, message: "Staff member added", data: newStaff });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/staff/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = storage.data.staff.length;
  storage.data.staff = storage.data.staff.filter(s => s.id !== id);

  if (storage.data.staff.length === initialLength) {
    return res.status(404).json({ success: false, message: "Staff member not found" });
  }

  storage.saveData();
  res.json({ success: true, message: "Staff member removed" });
});

// Root fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🍽️ SmartPlate Restaurant Food Waste Management System`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 REST API endpoints active & persistent database loaded`);
  console.log(`===================================================`);
});
