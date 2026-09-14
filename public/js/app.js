// SmartPlate Core Application Controller
const App = {
  currentView: 'dashboard',
  analyticsTimeframe: '7days',
  activeAlertFilter: 'all',
  cache: {
    dashboard: null,
    foodEntries: [],
    inventory: [],
    wasteLogs: [],
    alerts: [],
    suggestions: [],
    staff: [],
    activities: []
  },

  init() {
    this.setupEventListeners();
    this.setupLiveClock();
    this.setupDates();
    this.loadAllData();
  },

  // Setup UI event listeners
  setupEventListeners() {
    // Sidebar Navigation
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const view = item.getAttribute('data-view');
        this.navigate(view);

        // Close mobile drawer if opened
        document.getElementById('sidebar').classList.remove('open');
      });
    });

    // Mobile Hamburger
    const mobileBtn = document.getElementById('mobileMenuToggle');
    if (mobileBtn) {
      mobileBtn.addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
      });
    }

    // Quick Waste Log Button in Header
    document.getElementById('btnOpenWasteModal')?.addEventListener('click', () => {
      this.openModal('modalWaste');
    });

    // Food Entry Modal Openers
    document.getElementById('btnOpenAddFoodEntryModal')?.addEventListener('click', () => {
      document.getElementById('foodEntryForm').reset();
      document.getElementById('foodEntryEditId').value = '';
      document.getElementById('foodEntryModalTitle').innerText = 'Add Prepared Food Batch';
      this.openModal('modalFoodEntry');
    });

    // Inventory Modal Openers
    document.getElementById('btnOpenAddInventoryModal')?.addEventListener('click', () => {
      document.getElementById('inventoryForm').reset();
      document.getElementById('inventoryEditId').value = '';
      document.getElementById('inventoryModalTitle').innerText = 'Add Inventory Ingredient';
      // Set default expiry date to 3 days from now
      const d = new Date();
      d.setDate(d.getDate() + 3);
      document.getElementById('invExpiryDate').value = d.toISOString().split('T')[0];
      this.openModal('modalInventory');
    });

    // Waste Modal Opener
    document.getElementById('btnOpenAddWasteRecordModal')?.addEventListener('click', () => {
      document.getElementById('wasteForm').reset();
      document.getElementById('wstDate').value = new Date().toISOString().split('T')[0];
      this.openModal('modalWaste');
    });

    // Staff Modal Opener
    document.getElementById('btnOpenAddStaffModal')?.addEventListener('click', () => {
      document.getElementById('staffForm').reset();
      this.openModal('modalStaff');
    });

    // Form Submissions
    document.getElementById('foodEntryForm')?.addEventListener('submit', (e) => this.handleFoodEntrySubmit(e));
    document.getElementById('inventoryForm')?.addEventListener('submit', (e) => this.handleInventorySubmit(e));
    document.getElementById('wasteForm')?.addEventListener('submit', (e) => this.handleWasteSubmit(e));
    document.getElementById('staffForm')?.addEventListener('submit', (e) => this.handleStaffSubmit(e));

    // Search and Filter Listeners
    document.getElementById('foodEntrySearch')?.addEventListener('input', () => this.filterFoodEntries());
    document.getElementById('foodEntryCategoryFilter')?.addEventListener('change', () => this.filterFoodEntries());

    document.getElementById('inventorySearch')?.addEventListener('input', () => this.filterInventory());
    document.getElementById('inventoryCategoryFilter')?.addEventListener('change', () => this.filterInventory());
    document.getElementById('inventoryStatusFilter')?.addEventListener('change', () => this.filterInventory());

    document.getElementById('wasteSearch')?.addEventListener('input', () => this.filterWasteLogs());
    document.getElementById('wasteReasonFilter')?.addEventListener('change', () => this.filterWasteLogs());
    document.getElementById('wasteCategoryFilter')?.addEventListener('change', () => this.filterWasteLogs());

    // Reports controls
    document.getElementById('btnGenerateReport')?.addEventListener('click', () => this.generateCurrentReport());
    document.getElementById('btnExportCsv')?.addEventListener('click', () => this.downloadReportCsv());
  },

  // Setup default date inputs
  setupDates() {
    const today = new Date().toISOString().split('T')[0];
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);

    const startInput = document.getElementById('reportStartDate');
    const endInput = document.getElementById('reportEndDate');
    const wstDate = document.getElementById('wstDate');

    if (startInput) startInput.value = monthAgo.toISOString().split('T')[0];
    if (endInput) endInput.value = today;
    if (wstDate) wstDate.value = today;
  },

  // Live Digital Clock & Shift Status
  setupLiveClock() {
    const clockEl = document.getElementById('liveClock');
    const shiftLabel = document.getElementById('shift-label');

    const updateClock = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      if (clockEl) clockEl.innerHTML = `🕒 ${timeStr}`;

      const hour = now.getHours();
      let shiftText = "Morning Prep Shift (06:00 - 15:00)";
      if (hour >= 15 && hour < 23) {
        shiftText = "Dinner Service Shift (15:00 - 23:00)";
      } else if (hour >= 23 || hour < 6) {
        shiftText = "Night Sanitization Shift";
      }
      if (shiftLabel) shiftLabel.innerText = shiftText;
    };

    updateClock();
    setInterval(updateClock, 1000);
  },

  // Navigation Controller
  navigate(viewName) {
    this.currentView = viewName;

    // Update sidebar UI
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-view') === viewName);
    });

    // Update visible view section
    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.remove('active-view');
    });
    const target = document.getElementById(`view-${viewName}`);
    if (target) {
      target.classList.add('active-view');
    }

    // Update Header Titles
    const titles = {
      'dashboard': { title: 'Kitchen Overview & Waste Analytics', desc: 'Live metrics from current prep & service cycles' },
      'food-entry': { title: 'Food Preparation & Batch Management', desc: 'Log daily cooked food batches and track remaining portions' },
      'inventory': { title: 'Ingredient Inventory & Expiry Tracker', desc: 'Monitor stock levels, supplier batches, and critical shelf lives' },
      'waste-recording': { title: 'Food Waste Recording & Audit', desc: 'Document discarded food, reasons, disposal path, and financial loss' },
      'analytics': { title: 'Waste Trends & Financial Impact Analytics', desc: 'Visual charts attributing food waste volume and financial costs' },
      'waste-alerts': { title: 'Kitchen Waste Alerts & Early Warnings', desc: 'Action items for expiring produce, high-waste dishes, and over-prep' },
      'smart-suggestions': { title: 'Smart AI Kitchen Waste Reduction', desc: 'Actionable recommendations generated from historical kitchen patterns' },
      'reports': { title: 'Comprehensive Reports & Export', desc: 'Download CSV and generate executive audit summaries' },
      'staff': { title: 'Staff Accountability & Activity Stream', desc: 'Track kitchen team shifts and waste reduction scores' }
    };

    const header = titles[viewName] || { title: 'SmartPlate System', desc: 'Food Waste Management' };
    document.getElementById('current-view-title').innerText = header.title;
    document.getElementById('current-view-desc').innerText = header.desc;

    // Trigger chart refreshes or specific view updates
    if (viewName === 'analytics') {
      this.loadAnalytics();
    } else if (viewName === 'dashboard') {
      this.loadDashboard();
    } else if (viewName === 'reports') {
      this.generateCurrentReport();
    }
  },

  // Toast Notification System
  showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(50px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  // Modals Controller
  openModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.add('active');
  },

  closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.remove('active');
  },

  // Load All System Data
  async loadAllData() {
    try {
      await Promise.all([
        this.loadDashboard(),
        this.loadFoodEntries(),
        this.loadInventory(),
        this.loadWasteLogs(),
        this.loadAlerts(),
        this.loadSuggestions(),
        this.loadStaff()
      ]);
    } catch (err) {
      console.error("Initial data load error:", err);
    }
  },

  // -------------------------------------------------------------
  // 1. Dashboard View
  // -------------------------------------------------------------
  async loadDashboard() {
    try {
      const res = await API.getDashboardStats();
      if (!res.success) return;
      const stats = res.data;
      this.cache.dashboard = stats;

      // Update KPI Cards
      document.getElementById('kpi-prepared').innerHTML = `${stats.today.prepared.toFixed(1)} <span style="font-size:16px; font-weight:500;">kg</span>`;
      document.getElementById('kpi-sold').innerHTML = `${stats.today.sold.toFixed(1)} <span style="font-size:16px; font-weight:500;">kg</span>`;
      document.getElementById('kpi-leftover').innerHTML = `${stats.today.leftover.toFixed(1)} <span style="font-size:16px; font-weight:500;">kg</span>`;
      document.getElementById('kpi-wasted').innerHTML = `${stats.weekly.wastedKg.toFixed(1)} <span style="font-size:16px; font-weight:500;">kg</span>`;
      document.getElementById('kpi-cost').innerHTML = `${stats.currency}${stats.weekly.wasteCost.toLocaleString()}`;
      document.getElementById('kpi-waste-count').innerText = `${stats.weekly.wasteCount} waste logs recorded`;

      // Top Wasted Items Table
      const topTable = document.getElementById('dashboardTopWastedTable').querySelector('tbody');
      topTable.innerHTML = stats.topWasted.map(item => `
        <tr>
          <td><strong>${item.name}</strong></td>
          <td><span style="color:var(--accent-rose); font-weight:700;">${item.qty} kg</span></td>
          <td><span class="badge ${item.qty > 5 ? 'badge-rose' : 'badge-amber'}">${item.qty > 5 ? 'High Loss' : 'Moderate'}</span></td>
        </tr>
      `).join('') || '<tr><td colspan="3" style="text-align:center;color:var(--text-muted);">No waste recorded yet</td></tr>';

      // Activities List
      const actContainer = document.getElementById('dashboardActivityList');
      actContainer.innerHTML = stats.recentActivities.map(act => {
        const icon = act.type === 'waste' ? '🗑️' : act.type === 'prep' ? '🍛' : act.type === 'inventory' ? '📦' : '💡';
        const timeAgo = this.formatRelativeTime(act.timestamp);
        return `
          <div style="display:flex; align-items:flex-start; gap:10px; font-size:12.5px;">
            <span style="font-size:16px;">${icon}</span>
            <div style="flex:1;">
              <p style="margin-bottom:2px;">${act.description}</p>
              <span style="color:var(--text-muted); font-size:11px;">By ${act.staff} • ${timeAgo}</span>
            </div>
          </div>
        `;
      }).join('') || '<p style="color:var(--text-muted); font-size:12px;">No recent activities.</p>';

      // Quick Chart Render
      const analyticsRes = await API.getAnalytics('7days');
      if (analyticsRes.success) {
        ChartsManager.renderDashboardQuickChart('dashboardTrendChart', analyticsRes.data);
      }
    } catch (err) {
      console.error("Dashboard error:", err);
    }
  },

  // -------------------------------------------------------------
  // 2. Food Entry View
  // -------------------------------------------------------------
  async loadFoodEntries() {
    try {
      const res = await API.getFoodEntries();
      if (res.success) {
        this.cache.foodEntries = res.data;
        this.renderFoodEntriesTable(res.data);
      }
    } catch (err) {
      console.error("Load food entries error:", err);
    }
  },

  renderFoodEntriesTable(entries) {
    const tbody = document.getElementById('foodEntryTable').querySelector('tbody');
    if (!entries.length) {
      tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:30px; color:var(--text-muted);">No food preparation entries found. Click "+ Add Prepared Batch" to start!</td></tr>`;
      return;
    }

    tbody.innerHTML = entries.map(e => `
      <tr>
        <td><code>${e.batchNumber}</code></td>
        <td><strong>${e.dishName}</strong></td>
        <td><span class="badge badge-blue">${e.category}</span></td>
        <td>${e.preparedQty} ${e.unit}</td>
        <td>${e.soldQty} ${e.unit}</td>
        <td><strong style="color:${e.leftoverQty > (e.preparedQty * 0.3) ? 'var(--accent-amber)' : 'inherit'}">${e.leftoverQty} ${e.unit}</strong></td>
        <td>₹${e.unitCost}</td>
        <td>${e.chef}</td>
        <td><span class="badge ${e.status === 'In Service' ? 'badge-emerald' : 'badge-amber'}">${e.status}</span></td>
        <td>
          <div class="btn-action-group">
            <button class="btn-icon-sm edit" title="Quick Update Sold Qty" onclick="App.quickUpdateSold('${e.id}', ${e.soldQty}, ${e.preparedQty})">✏️</button>
            <button class="btn-icon-sm delete" title="Delete Entry" onclick="App.deleteFoodEntry('${e.id}')">🗑️</button>
          </div>
        </td>
      </tr>
    `).join('');
  },

  filterFoodEntries() {
    const search = document.getElementById('foodEntrySearch').value.toLowerCase();
    const cat = document.getElementById('foodEntryCategoryFilter').value;

    const filtered = this.cache.foodEntries.filter(e => {
      const matchSearch = e.dishName.toLowerCase().includes(search) || e.batchNumber.toLowerCase().includes(search) || e.chef.toLowerCase().includes(search);
      const matchCat = cat === 'All' || e.category === cat;
      return matchSearch && matchCat;
    });
    this.renderFoodEntriesTable(filtered);
  },

  async handleFoodEntrySubmit(e) {
    e.preventDefault();
    const id = document.getElementById('foodEntryEditId').value;
    const dishName = document.getElementById('feDishName').value;
    const category = document.getElementById('feCategory').value;
    const chef = document.getElementById('feChefSelect').value;
    const preparedQty = parseFloat(document.getElementById('fePreparedQty').value);
    const unit = document.getElementById('feUnit').value;
    const soldQty = parseFloat(document.getElementById('feSoldQty').value || 0);
    const unitCost = parseFloat(document.getElementById('feUnitCost').value || 0);
    const notes = document.getElementById('feNotes').value;

    const payload = { dishName, category, chef, preparedQty, unit, soldQty, unitCost, notes };

    try {
      if (id) {
        await API.updateFoodEntry(id, payload);
        this.showToast("Batch record updated successfully!");
      } else {
        await API.addFoodEntry(payload);
        this.showToast(`Batch for ${dishName} added!`);
      }
      this.closeModal('modalFoodEntry');
      await this.loadFoodEntries();
      await this.loadDashboard();
      await this.loadAlerts();
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  },

  async quickUpdateSold(id, currentSold, preparedQty) {
    const newSoldStr = prompt(`Update Sold Quantity for this batch (Max prepared: ${preparedQty}):`, currentSold);
    if (newSoldStr === null) return;
    const newSold = parseFloat(newSoldStr);
    if (isNaN(newSold) || newSold < 0) {
      alert("Please enter a valid positive number.");
      return;
    }
    try {
      await API.updateFoodEntry(id, { soldQty: newSold });
      this.showToast("Sold quantity updated!");
      await this.loadFoodEntries();
      await this.loadDashboard();
      await this.loadAlerts();
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  },

  async deleteFoodEntry(id) {
    if (!confirm("Are you sure you want to delete this food preparation batch?")) return;
    try {
      await API.deleteFoodEntry(id);
      this.showToast("Batch record removed.");
      await this.loadFoodEntries();
      await this.loadDashboard();
      await this.loadAlerts();
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  },

  // -------------------------------------------------------------
  // 3. Inventory View
  // -------------------------------------------------------------
  async loadInventory() {
    try {
      const res = await API.getInventory();
      if (res.success) {
        this.cache.inventory = res.data;
        this.renderInventoryTable(res.data);
      }
    } catch (err) {
      console.error("Load inventory error:", err);
    }
  },

  renderInventoryTable(items) {
    const tbody = document.getElementById('inventoryTable').querySelector('tbody');
    const today = new Date().toISOString().split('T')[0];

    if (!items.length) {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:30px; color:var(--text-muted);">No inventory ingredients found.</td></tr>`;
      return;
    }

    tbody.innerHTML = items.map(i => {
      const expDate = new Date(i.expiryDate);
      const diffDays = Math.ceil((expDate - new Date(today)) / (1000 * 60 * 60 * 24));
      
      let statusBadge = '';
      if (diffDays < 0) {
        statusBadge = `<span class="badge badge-rose">Expired (${Math.abs(diffDays)}d ago)</span>`;
      } else if (diffDays === 0) {
        statusBadge = `<span class="badge badge-rose">Expires Today!</span>`;
      } else if (diffDays <= 2) {
        statusBadge = `<span class="badge badge-amber">Expires in ${diffDays}d</span>`;
      } else {
        statusBadge = `<span class="badge badge-emerald">Fresh (${diffDays}d left)</span>`;
      }

      const isLowStock = i.stock <= i.reorderLevel;

      return `
        <tr>
          <td><strong>${i.name}</strong></td>
          <td><span class="badge badge-blue">${i.category}</span></td>
          <td>
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-weight:700; color:${isLowStock ? 'var(--accent-rose)' : 'inherit'};">${i.stock} ${i.unit}</span>
              ${isLowStock ? '<span style="font-size:11px; color:var(--accent-rose); font-weight:700;">(Low!)</span>' : ''}
            </div>
          </td>
          <td>${i.reorderLevel} ${i.unit}</td>
          <td>₹${i.unitCost}</td>
          <td>${i.expiryDate}</td>
          <td>${statusBadge}</td>
          <td>${i.supplier}</td>
          <td>
            <div class="btn-action-group">
              <button class="btn-icon-sm edit" title="Edit Item" onclick="App.editInventoryItem('${i.id}')">✏️</button>
              <button class="btn-icon-sm delete" title="Delete Item" onclick="App.deleteInventoryItem('${i.id}')">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  filterInventory() {
    const search = document.getElementById('inventorySearch').value.toLowerCase();
    const cat = document.getElementById('inventoryCategoryFilter').value;
    const filter = document.getElementById('inventoryStatusFilter').value;
    const today = new Date().toISOString().split('T')[0];

    const filtered = this.cache.inventory.filter(i => {
      const matchSearch = i.name.toLowerCase().includes(search) || i.supplier.toLowerCase().includes(search);
      const matchCat = cat === 'All' || i.category === cat;
      
      let matchStatus = true;
      if (filter === 'lowStock') {
        matchStatus = i.stock <= i.reorderLevel;
      } else if (filter === 'expiring') {
        const diff = (new Date(i.expiryDate) - new Date(today)) / (1000 * 60 * 60 * 24);
        matchStatus = diff <= 3;
      }

      return matchSearch && matchCat && matchStatus;
    });

    this.renderInventoryTable(filtered);
  },

  editInventoryItem(id) {
    const item = this.cache.inventory.find(i => i.id === id);
    if (!item) return;

    document.getElementById('inventoryEditId').value = item.id;
    document.getElementById('invName').value = item.name;
    document.getElementById('invCategory').value = item.category;
    document.getElementById('invUnit').value = item.unit;
    document.getElementById('invStock').value = item.stock;
    document.getElementById('invReorderLevel').value = item.reorderLevel;
    document.getElementById('invUnitCost').value = item.unitCost;
    document.getElementById('invExpiryDate').value = item.expiryDate;
    document.getElementById('invSupplier').value = item.supplier;

    document.getElementById('inventoryModalTitle').innerText = 'Edit Ingredient';
    this.openModal('modalInventory');
  },

  async handleInventorySubmit(e) {
    e.preventDefault();
    const id = document.getElementById('inventoryEditId').value;
    const name = document.getElementById('invName').value;
    const category = document.getElementById('invCategory').value;
    const unit = document.getElementById('invUnit').value;
    const stock = parseFloat(document.getElementById('invStock').value);
    const reorderLevel = parseFloat(document.getElementById('invReorderLevel').value);
    const unitCost = parseFloat(document.getElementById('invUnitCost').value || 0);
    const expiryDate = document.getElementById('invExpiryDate').value;
    const supplier = document.getElementById('invSupplier').value;

    const payload = { name, category, unit, stock, reorderLevel, unitCost, expiryDate, supplier };

    try {
      if (id) {
        await API.updateInventoryItem(id, payload);
        this.showToast("Inventory item updated!");
      } else {
        await API.addInventoryItem(payload);
        this.showToast(`Added ${name} to inventory.`);
      }
      this.closeModal('modalInventory');
      await this.loadInventory();
      await this.loadAlerts();
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  },

  async deleteInventoryItem(id) {
    if (!confirm("Are you sure you want to remove this ingredient from inventory?")) return;
    try {
      await API.deleteInventoryItem(id);
      this.showToast("Item deleted from inventory.");
      await this.loadInventory();
      await this.loadAlerts();
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  },

  // -------------------------------------------------------------
  // 4. Waste Recording View
  // -------------------------------------------------------------
  async loadWasteLogs() {
    try {
      const res = await API.getWasteLogs();
      if (res.success) {
        this.cache.wasteLogs = res.data;
        this.renderWasteLogsTable(res.data);
      }
    } catch (err) {
      console.error("Load waste logs error:", err);
    }
  },

  renderWasteLogsTable(logs) {
    const tbody = document.getElementById('wasteLogsTable').querySelector('tbody');
    if (!logs.length) {
      tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:30px; color:var(--text-muted);">No food waste logs recorded. Click "+ Log Food Waste" to document incidents.</td></tr>`;
      return;
    }

    tbody.innerHTML = logs.map(w => `
      <tr>
        <td><strong>${w.itemName}</strong></td>
        <td><span class="badge badge-blue">${w.category}</span></td>
        <td><span style="font-weight:700;">${w.quantity} ${w.unit}</span></td>
        <td><strong style="color:var(--accent-rose);">₹${w.totalCost.toLocaleString()}</strong></td>
        <td><span class="badge badge-amber">${w.reason}</span></td>
        <td><span class="badge badge-emerald">${w.disposalMethod}</span></td>
        <td>${w.loggedBy}</td>
        <td>${w.date}</td>
        <td style="max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${w.notes || ''}">${w.notes || '-'}</td>
        <td>
          <button class="btn-icon-sm delete" title="Delete Log" onclick="App.deleteWasteLog('${w.id}')">🗑️</button>
        </td>
      </tr>
    `).join('');
  },

  filterWasteLogs() {
    const search = document.getElementById('wasteSearch').value.toLowerCase();
    const reason = document.getElementById('wasteReasonFilter').value;
    const cat = document.getElementById('wasteCategoryFilter').value;

    const filtered = this.cache.wasteLogs.filter(w => {
      const matchSearch = w.itemName.toLowerCase().includes(search) || w.loggedBy.toLowerCase().includes(search) || (w.notes && w.notes.toLowerCase().includes(search));
      const matchReason = reason === 'All' || w.reason === reason;
      const matchCat = cat === 'All' || w.category === cat;
      return matchSearch && matchReason && matchCat;
    });

    this.renderWasteLogsTable(filtered);
  },

  async handleWasteSubmit(e) {
    e.preventDefault();
    const itemName = document.getElementById('wstItemName').value;
    const category = document.getElementById('wstCategory').value;
    const reason = document.getElementById('wstReason').value;
    const quantity = parseFloat(document.getElementById('wstQty').value);
    const unit = document.getElementById('wstUnit').value;
    const unitCost = parseFloat(document.getElementById('wstUnitCost').value || 0);
    const disposalMethod = document.getElementById('wstDisposal').value;
    const loggedBy = document.getElementById('wstLoggedBy').value;
    const date = document.getElementById('wstDate').value;
    const notes = document.getElementById('wstNotes').value;

    const payload = { itemName, category, reason, quantity, unit, unitCost, disposalMethod, loggedBy, date, notes };

    try {
      await API.logWaste(payload);
      this.showToast(`Waste logged: ${quantity} ${unit} of ${itemName}`);
      this.closeModal('modalWaste');
      await this.loadWasteLogs();
      await this.loadDashboard();
      await this.loadAlerts();
      if (this.currentView === 'analytics') {
        await this.loadAnalytics();
      }
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  },

  async deleteWasteLog(id) {
    if (!confirm("Delete this waste log?")) return;
    try {
      await API.deleteWasteLog(id);
      this.showToast("Waste log deleted.");
      await this.loadWasteLogs();
      await this.loadDashboard();
      await this.loadAlerts();
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  },

  // -------------------------------------------------------------
  // 5. Analytics View
  // -------------------------------------------------------------
  async loadAnalytics() {
    try {
      const res = await API.getAnalytics(this.analyticsTimeframe);
      if (res.success) {
        ChartsManager.renderAnalyticsCharts(res.data);
      }
    } catch (err) {
      console.error("Load analytics error:", err);
    }
  },

  setAnalyticsTimeframe(tf) {
    this.analyticsTimeframe = tf;
    document.getElementById('timeframe7')?.classList.toggle('active-timeframe', tf === '7days');
    document.getElementById('timeframe30')?.classList.toggle('active-timeframe', tf === '30days');
    this.loadAnalytics();
  },

  // -------------------------------------------------------------
  // 6. Waste Alerts View
  // -------------------------------------------------------------
  async loadAlerts() {
    try {
      const res = await API.getAlerts();
      if (res.success) {
        this.cache.alerts = res.data;
        
        // Update sidebar badge
        const badge = document.getElementById('nav-alerts-badge');
        if (badge) {
          badge.innerText = res.count;
          badge.style.display = res.count > 0 ? 'inline-block' : 'none';
        }

        this.renderAlertsList(res.data);
        this.renderDashboardAlerts(res.data);
      }
    } catch (err) {
      console.error("Load alerts error:", err);
    }
  },

  renderDashboardAlerts(alerts) {
    const container = document.getElementById('dashboardAlertsList');
    if (!container) return;

    if (!alerts.length) {
      container.innerHTML = '<p style="color:var(--text-muted); font-size:12px; padding:10px;">✅ Kitchen running smoothly. No active alerts!</p>';
      return;
    }

    container.innerHTML = alerts.slice(0, 4).map(a => `
      <div style="background:var(--bg-main); border-left:3px solid ${a.severity === 'critical' ? 'var(--accent-rose)' : a.severity === 'warning' ? 'var(--accent-amber)' : 'var(--accent-blue)'}; border-radius:var(--radius-sm); padding:10px 12px; font-size:12px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
          <strong style="color:var(--text-primary);">${a.title}</strong>
          <span style="font-size:10.5px; color:var(--text-muted);">${a.type.toUpperCase()}</span>
        </div>
        <p style="color:var(--text-secondary); margin-bottom:6px;">${a.message}</p>
        <button class="btn-secondary" style="padding:3px 8px; font-size:11px;" onclick="App.handleAlertAction('${a.suggestedAction}', '${a.item}')">⚡ ${a.suggestedAction}</button>
      </div>
    `).join('');
  },

  renderAlertsList(alerts) {
    const container = document.getElementById('alertsContainer');
    if (!container) return;

    const filtered = alerts.filter(a => {
      if (this.activeAlertFilter === 'all') return true;
      return a.type === this.activeAlertFilter;
    });

    if (!filtered.length) {
      container.innerHTML = '<div class="card-box" style="text-align:center; padding:40px; color:var(--text-muted);">🎉 No alerts matching this category.</div>';
      return;
    }

    container.innerHTML = filtered.map(a => `
      <div class="alert-card ${a.severity}">
        <div class="alert-main-content">
          <div class="alert-icon-box" style="background:${a.severity === 'critical' ? 'var(--accent-rose-dim)' : a.severity === 'warning' ? 'var(--accent-amber-dim)' : 'var(--accent-blue-dim)'}; color:${a.severity === 'critical' ? 'var(--accent-rose)' : a.severity === 'warning' ? 'var(--accent-amber)' : 'var(--accent-blue)'};">
            ${a.type === 'expiry' ? '⌛' : a.type === 'pattern' ? '🔁' : a.type === 'overprep' ? '🍲' : '📦'}
          </div>
          <div class="alert-text">
            <h4>${a.title}</h4>
            <p>${a.message}</p>
          </div>
        </div>

        <div style="display:flex; align-items:center; gap:10px;">
          <button class="btn-primary" style="font-size:12px; padding:7px 14px;" onclick="App.handleAlertAction('${a.suggestedAction}', '${a.item}')">
            <span>⚡</span>
            <span>${a.suggestedAction}</span>
          </button>
        </div>
      </div>
    `).join('');
  },

  filterAlerts(filterType) {
    this.activeAlertFilter = filterType;
    this.renderAlertsList(this.cache.alerts);
  },

  handleAlertAction(action, item) {
    if (action.includes("Quarantine")) {
      if (confirm(`Quarantine expired ingredient "${item}" and record immediate disposal?`)) {
        document.getElementById('wstItemName').value = item;
        document.getElementById('wstReason').value = 'Expired';
        this.openModal('modalWaste');
      }
    } else if (action.includes("Chef Special") || action.includes("Recipe")) {
      alert(`Recommendation: Highlighted item "${item}" prioritized for Chef's Special Batch today.`);
      this.navigate('food-entry');
    } else if (action.includes("Reduce Next Batch")) {
      alert(`Batch Guidance: Head Chef informed to reduce prep batch size for "${item}" by 20%.`);
    } else {
      this.showToast(`Action dispatched: ${action} for ${item}`);
    }
  },

  // -------------------------------------------------------------
  // 7. Smart Suggestions View
  // -------------------------------------------------------------
  async loadSuggestions() {
    try {
      const res = await API.getSmartSuggestions();
      if (res.success) {
        this.cache.suggestions = res.data;
        this.renderSuggestions(res.data);
      }
    } catch (err) {
      console.error("Load suggestions error:", err);
    }
  },

  renderSuggestions(suggestions) {
    const container = document.getElementById('suggestionsContainer');
    if (!container) return;

    container.innerHTML = suggestions.map(s => {
      const isApplied = s.status === 'Applied';
      return `
        <div class="suggestion-card">
          <div>
            <div class="suggestion-badge-row">
              <span class="badge ${s.priority === 'Urgent' ? 'badge-rose' : s.priority === 'High' ? 'badge-amber' : 'badge-blue'}">${s.priority} Priority</span>
              <span style="font-size:11.5px; color:var(--text-muted); font-weight:600;">${s.category}</span>
            </div>

            <h4><span style="font-size:18px; margin-right:6px;">${s.icon}</span>${s.title}</h4>
            <p>${s.description}</p>
          </div>

          <div>
            <div class="suggestion-metrics">
              <div class="metric-item">
                <span>PROJECTED SAVINGS</span>
                <strong>${s.impactSavings}</strong>
              </div>
              <div class="metric-item" style="text-align:right;">
                <span>WASTE ELIMINATED</span>
                <strong>${s.wasteReduction}</strong>
              </div>
            </div>

            <button class="btn-apply-suggestion ${isApplied ? 'applied' : ''}" onclick="App.applySuggestion('${s.id}')">
              <span>${isApplied ? '✓' : '⚡'}</span>
              <span>${isApplied ? 'Recommendation Active / Applied' : s.actionText}</span>
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  async applySuggestion(id) {
    try {
      const res = await API.applySuggestion(id);
      if (res.success) {
        this.showToast(res.message);
        await this.loadSuggestions();
        await this.loadDashboard();
      }
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  },

  // -------------------------------------------------------------
  // 8. Reports View
  // -------------------------------------------------------------
  async generateCurrentReport() {
    const type = document.getElementById('reportTypeSelect').value;
    const startDate = document.getElementById('reportStartDate').value;
    const endDate = document.getElementById('reportEndDate').value;

    try {
      const res = await API.getReport({ type, startDate, endDate });
      if (!res.success) return;
      const report = res.data;

      // Update Report Header
      const titles = {
        'waste': 'Food Waste Audit Report',
        'prep': 'Food Preparation & Consumption Report',
        'inventory': 'Inventory Valuation & Expiry Report',
        'staff': 'Staff Waste Compliance Scorecard'
      };
      document.getElementById('reportTitle').innerText = titles[type] || 'Kitchen Report';
      document.getElementById('reportMeta').innerText = `Period: ${report.startDate} to ${report.endDate} • ${report.totalRecords} Records Found`;

      // Render Table
      const thead = document.getElementById('reportTable').querySelector('thead');
      const tbody = document.getElementById('reportTable').querySelector('tbody');

      if (type === 'waste') {
        thead.innerHTML = `
          <tr>
            <th>Item Name</th>
            <th>Category</th>
            <th>Wasted Qty</th>
            <th>Cost Loss</th>
            <th>Reason</th>
            <th>Disposal</th>
            <th>Staff</th>
            <th>Date</th>
          </tr>
        `;
        tbody.innerHTML = report.records.map(r => `
          <tr>
            <td><strong>${r.itemName}</strong></td>
            <td><span class="badge badge-blue">${r.category}</span></td>
            <td>${r.quantity} ${r.unit}</td>
            <td><strong style="color:var(--accent-rose);">₹${r.totalCost.toLocaleString()}</strong></td>
            <td><span class="badge badge-amber">${r.reason}</span></td>
            <td>${r.disposalMethod}</td>
            <td>${r.loggedBy}</td>
            <td>${r.date}</td>
          </tr>
        `).join('') || '<tr><td colspan="8" style="text-align:center; padding:20px;">No records match the selected date range.</td></tr>';
      } else if (type === 'prep') {
        thead.innerHTML = `
          <tr>
            <th>Batch Number</th>
            <th>Dish Name</th>
            <th>Category</th>
            <th>Prepared</th>
            <th>Sold</th>
            <th>Leftover</th>
            <th>Chef</th>
            <th>Date</th>
          </tr>
        `;
        tbody.innerHTML = report.records.map(r => `
          <tr>
            <td><code>${r.batchNumber}</code></td>
            <td><strong>${r.dishName}</strong></td>
            <td>${r.category}</td>
            <td>${r.preparedQty} ${r.unit}</td>
            <td>${r.soldQty} ${r.unit}</td>
            <td><strong>${r.leftoverQty} ${r.unit}</strong></td>
            <td>${r.chef}</td>
            <td>${r.date}</td>
          </tr>
        `).join('') || '<tr><td colspan="8" style="text-align:center; padding:20px;">No preparation records.</td></tr>';
      } else if (type === 'inventory') {
        thead.innerHTML = `
          <tr>
            <th>Item Name</th>
            <th>Category</th>
            <th>Stock</th>
            <th>Reorder Level</th>
            <th>Cost/Unit</th>
            <th>Expiry Date</th>
            <th>Supplier</th>
          </tr>
        `;
        tbody.innerHTML = report.records.map(r => `
          <tr>
            <td><strong>${r.name}</strong></td>
            <td>${r.category}</td>
            <td>${r.stock} ${r.unit}</td>
            <td>${r.reorderLevel} ${r.unit}</td>
            <td>₹${r.unitCost}</td>
            <td>${r.expiryDate}</td>
            <td>${r.supplier}</td>
          </tr>
        `).join('');
      } else {
        thead.innerHTML = `
          <tr>
            <th>Staff Name</th>
            <th>Role</th>
            <th>Shift</th>
            <th>Total Waste Logs</th>
            <th>Wasted Volume</th>
            <th>Loss Cost Attributed</th>
            <th>Compliance Score</th>
          </tr>
        `;
        tbody.innerHTML = report.records.map(r => `
          <tr>
            <td><strong>${r.name}</strong></td>
            <td>${r.role}</td>
            <td>${r.shift}</td>
            <td>${r.totalLogsRecorded} logs</td>
            <td>${r.totalWastedKg} kg</td>
            <td>₹${r.totalWasteCost.toLocaleString()}</td>
            <td><span class="badge badge-emerald">${r.complianceScore}%</span></td>
          </tr>
        `).join('');
      }
    } catch (err) {
      console.error("Report error:", err);
    }
  },

  downloadReportCsv() {
    const type = document.getElementById('reportTypeSelect').value;
    const startDate = document.getElementById('reportStartDate').value;
    const endDate = document.getElementById('reportEndDate').value;

    const url = API.getReportCsvUrl({ type, startDate, endDate });
    window.open(url, '_blank');
  },

  // -------------------------------------------------------------
  // 9. Staff Management View
  // -------------------------------------------------------------
  async loadStaff() {
    try {
      const res = await API.getStaff();
      if (!res.success) return;
      this.cache.staff = res.data;
      this.cache.activities = res.activities || [];

      // Render Staff Cards
      const container = document.getElementById('staffGridContainer');
      container.innerHTML = res.data.map(s => `
        <div class="staff-card">
          <div class="staff-avatar-box">${s.avatar || '👨‍🍳'}</div>
          <div class="staff-meta" style="flex:1;">
            <h4>${s.name}</h4>
            <p>${s.role}</p>
            <div style="font-size:11.5px; color:var(--text-secondary); margin-bottom:6px;">🕒 ${s.shift}</div>
            <span class="staff-score-pill">★ ${s.wasteScore}% Waste Score</span>
          </div>
          <button class="btn-icon-sm delete" title="Remove Staff" onclick="App.deleteStaff('${s.id}')">🗑️</button>
        </div>
      `).join('');

      // Populate Activity Audit Trail
      const actTable = document.getElementById('staffActivityTable').querySelector('tbody');
      actTable.innerHTML = this.cache.activities.map(a => `
        <tr>
          <td><span style="font-variant-numeric:tabular-nums; font-size:12px; color:var(--text-muted);">${new Date(a.timestamp).toLocaleString()}</span></td>
          <td><span class="badge ${a.type === 'waste' ? 'badge-rose' : a.type === 'prep' ? 'badge-blue' : 'badge-emerald'}">${a.type.toUpperCase()}</span></td>
          <td>${a.description}</td>
          <td><strong>${a.staff}</strong></td>
        </tr>
      `).join('');
    } catch (err) {
      console.error("Load staff error:", err);
    }
  },

  async handleStaffSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('staffName').value;
    const role = document.getElementById('staffRole').value;
    const shift = document.getElementById('staffShift').value;
    const contact = document.getElementById('staffContact').value;

    try {
      await API.addStaff({ name, role, shift, contact });
      this.showToast(`Team member ${name} added!`);
      this.closeModal('modalStaff');
      await this.loadStaff();
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  },

  async deleteStaff(id) {
    if (!confirm("Are you sure you want to remove this staff member?")) return;
    try {
      await API.deleteStaff(id);
      this.showToast("Staff member removed.");
      await this.loadStaff();
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  },

  // Format relative timestamp
  formatRelativeTime(isoString) {
    if (!isoString) return '';
    const diff = Math.floor((new Date() - new Date(isoString)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }
};

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

window.App = App;
