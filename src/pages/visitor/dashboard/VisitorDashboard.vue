<template>
  <div class="visitor-dashboard">
    <div class="header-section">
      <h1>Visitor Management</h1>
      <div class="controls">
        <div class="control-group">
          <label>Tenant</label>
          <select v-model="selectedTenantId" @change="handleTenantChange">
            <option v-for="tenant in tenants" :key="tenant.id" :value="tenant.id">
              {{ tenant.name }}
            </option>
          </select>
        </div>
        <div class="control-group">
          <label>Branch</label>
          <select v-model="selectedBranchId" @change="handleBranchChange" :disabled="!selectedTenantId">
            <option value="">All Branches</option>
            <option v-for="branch in branches" :key="branch.id" :value="branch.id">
              {{ branch.name }}
            </option>
          </select>
        </div>
        <div class="control-group">
          <label>Event</label>
          <select v-model="selectedEventId" @change="handleEventChange" :disabled="!selectedBranchId">
            <option value="">General (No Event)</option>
            <option v-for="event in events" :key="event.id" :value="event.id">
              {{ event.name }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div class="dashboard-content">
      <div class="stats-grid">
        <div class="stat-card">
          <h3>Total Visitors</h3>
          <div class="value">{{ stats.total }}</div>
        </div>
        <div class="stat-card">
          <h3>Active Now</h3>
          <div class="value">{{ stats.active }}</div>
        </div>
        <div class="stat-card">
          <h3>Pending Approval</h3>
          <div class="value">{{ stats.pending }}</div>
        </div>
      </div>

      <div class="action-grid">
        <div class="action-card" @click="$router.push({ name: 'VisitorTemplates' })">
          <div class="icon">📋</div>
          <h3>Templates</h3>
          <p>Configure visitor forms and badges</p>
        </div>
        <div class="action-card" @click="$router.push({ name: 'VisitorLinks' })">
          <div class="icon">🔗</div>
          <h3>Links & QRs</h3>
          <p>Manage access links and QR codes</p>
        </div>
        <div class="action-card">
          <div class="icon">✅</div>
          <h3>Approvals</h3>
          <p>Review pending visitor requests</p>
        </div>
      </div>
    </div>
    

  </div>
</template>

<script>
import { visitorService } from '@/services/visitorService';

export default {
  name: 'VisitorDashboard',
  data() {
    return {
      tenants: [],
      branches: [],
      events: [],
      selectedTenantId: '',
      selectedBranchId: '',
      selectedEventId: '',
      stats: {
        total: 0,
        active: 0,
        pending: 0
      }
    };
  },
  async created() {
    this.tenants = await visitorService.getTenants();
    if (this.tenants.length > 0) {
      this.selectedTenantId = this.tenants[0].id;
      await this.handleTenantChange();
    }
  },
  methods: {
    async handleTenantChange() {
      this.branches = await visitorService.getBranches(this.selectedTenantId);
      this.selectedBranchId = '';
      this.events = [];
      this.selectedEventId = '';
    },
    async handleBranchChange() {
      // Fetch events only if a branch is selected, otherwise clear events
      if (this.selectedBranchId) {
        this.events = await visitorService.getEvents(this.selectedBranchId);
      } else {
        this.events = [];
      }
      this.selectedEventId = '';
      // Always fetch stats, whether for a specific branch or all branches
      await this.fetchStats();
    },
    async handleEventChange() {
      await this.fetchStats();
    },
    async fetchStats() {
      // Mock stats logic
      const visitors = await visitorService.getVisitors(this.selectedBranchId);
      this.stats.total = visitors.length;
      this.stats.active = visitors.filter(v => v.status === 'Approved' || v.status === 'Checked In').length;
      this.stats.pending = visitors.filter(v => v.status === 'Pending').length;
    }
  }
};
</script>

<style scoped>
.visitor-dashboard {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.header-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  margin-bottom: 20px;
}

.header-section h1 {
  margin: 0 0 20px 0;
  color: #2c3e50;
}

.controls {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.control-group {
  display: flex;
  flex-direction: column;
  min-width: 200px;
}

.control-group label {
  font-size: 12px;
  color: #7f8c8d;
  margin-bottom: 4px;
}

.control-group select {
  padding: 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: white;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.stat-card h3 {
  margin: 0;
  font-size: 14px;
  color: #7f8c8d;
}

.stat-card .value {
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
  margin-top: 10px;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.action-card {
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.action-card .icon {
  font-size: 32px;
  margin-bottom: 15px;
}

.action-card h3 {
  margin: 0 0 10px 0;
  color: #2c3e50;
}

.action-card p {
  margin: 0;
  color: #7f8c8d;
  font-size: 14px;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #7f8c8d;
}
</style>
