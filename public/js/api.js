// SmartPlate API Client with LocalStorage Fallback
const API_BASE = '/api';

const API = {
  isOnline: true,

  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }

      const data = await response.json();
      this.isOnline = true;
      this.updateConnectionStatus(true);
      return data;
    } catch (err) {
      console.warn(`API request to ${endpoint} failed:`, err.message);
      // Fallback or notification
      this.isOnline = false;
      this.updateConnectionStatus(false);
      throw err;
    }
  },

  updateConnectionStatus(online) {
    const el = document.getElementById('connection-status-pill');
    if (el) {
      if (online) {
        el.innerHTML = '<span class="shift-indicator-dot"></span> Backend Connected';
        el.style.color = '#34d399';
        el.style.borderColor = 'rgba(16, 185, 129, 0.3)';
      } else {
        el.innerHTML = '<span class="shift-indicator-dot" style="background:#f59e0b;box-shadow:0 0 10px #f59e0b;"></span> Offline Mode';
        el.style.color = '#f59e0b';
        el.style.borderColor = 'rgba(245, 158, 11, 0.3)';
      }
    }
  },

  // Health
  async checkHealth() {
    return this.request('/health');
  },

  // Dashboard Stats
  async getDashboardStats() {
    return this.request('/dashboard/stats');
  },

  // Food Entries
  async getFoodEntries(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/food-entries${query ? '?' + query : ''}`);
  },

  async addFoodEntry(entry) {
    return this.request('/food-entries', {
      method: 'POST',
      body: JSON.stringify(entry)
    });
  },

  async updateFoodEntry(id, entry) {
    return this.request(`/food-entries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(entry)
    });
  },

  async deleteFoodEntry(id) {
    return this.request(`/food-entries/${id}`, {
      method: 'DELETE'
    });
  },

  // Inventory
  async getInventory(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/inventory${query ? '?' + query : ''}`);
  },

  async addInventoryItem(item) {
    return this.request('/inventory', {
      method: 'POST',
      body: JSON.stringify(item)
    });
  },

  async updateInventoryItem(id, item) {
    return this.request(`/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item)
    });
  },

  async deleteInventoryItem(id) {
    return this.request(`/inventory/${id}`, {
      method: 'DELETE'
    });
  },

  // Waste Recording
  async getWasteLogs(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/waste${query ? '?' + query : ''}`);
  },

  async logWaste(wasteData) {
    return this.request('/waste', {
      method: 'POST',
      body: JSON.stringify(wasteData)
    });
  },

  async deleteWasteLog(id) {
    return this.request(`/waste/${id}`, {
      method: 'DELETE'
    });
  },

  // Analytics
  async getAnalytics(timeframe = '7days') {
    return this.request(`/analytics?timeframe=${timeframe}`);
  },

  // Waste Alerts
  async getAlerts() {
    return this.request('/alerts');
  },

  // Smart Suggestions
  async getSmartSuggestions() {
    return this.request('/smart-suggestions');
  },

  async applySuggestion(id) {
    return this.request(`/smart-suggestions/${id}/apply`, {
      method: 'POST'
    });
  },

  // Reports
  async getReport(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/reports${query ? '?' + query : ''}`);
  },

  getReportCsvUrl(params = {}) {
    const query = new URLSearchParams(params).toString();
    return `${API_BASE}/reports/csv${query ? '?' + query : ''}`;
  },

  // Staff
  async getStaff() {
    return this.request('/staff');
  },

  async addStaff(staffData) {
    return this.request('/staff', {
      method: 'POST',
      body: JSON.stringify(staffData)
    });
  },

  async deleteStaff(id) {
    return this.request(`/staff/${id}`, {
      method: 'DELETE'
    });
  }
};

window.API = API;
