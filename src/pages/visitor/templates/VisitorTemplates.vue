<template>
  <div class="visitor-templates">
    <div class="header-section">
      <div class="title-row">
        <h1>Visitor Templates</h1>
        <button class="btn-primary" @click="createTemplate" :disabled="!selectedBranchId">
          + New Template
        </button>
      </div>
      
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
            <option value="">Select Branch</option>
            <option v-for="branch in branches" :key="branch.id" :value="branch.id">
              {{ branch.name }}
            </option>
          </select>
        </div>
        <div class="control-group">
          <label>Event</label>
          <select v-model="selectedEventId" @change="handleEventChange" :disabled="!selectedBranchId">
            <option value="">All Events</option>
            <option v-for="event in events" :key="event.id" :value="event.id">
              {{ event.name }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div class="content-section" v-if="selectedBranchId">
      <div v-if="loading" class="loading">Loading templates...</div>
      
      <div v-else-if="filteredTemplates.length === 0" class="empty-state">
        <p>No templates found. Create one to get started.</p>
      </div>

      <div v-else class="templates-grid">
        <div v-for="template in filteredTemplates" :key="template.id" class="template-card">
          <div class="card-header">
            <h3>{{ template.name }}</h3>
            <span :class="['status-badge', template.status.toLowerCase()]">{{ template.status }}</span>
          </div>
          <div class="card-body">
            <p><strong>Event:</strong> {{ getEventName(template.eventId) }}</p>
            <p><strong>Approval:</strong> {{ template.approvalRequired ? 'Required' : 'Auto-Approve' }}</p>
            <p><strong>Fields:</strong> {{ template.fields.length }} configured</p>
          </div>
          <div class="card-actions">
            <button class="btn-text" @click="editTemplate(template)">Edit</button>
            <button class="btn-text delete" @click="deleteTemplate(template.id)">Delete</button>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="empty-state">
      <p>Please select a Branch to view templates.</p>
    </div>
  </div>
</template>

<script>
import { visitorService } from '@/services/visitorService';

export default {
  name: 'VisitorTemplates',
  data() {
    return {
      tenants: [],
      branches: [],
      events: [],
      templates: [],
      selectedTenantId: '',
      selectedBranchId: '',
      selectedEventId: '',
      loading: false
    };
  },
  computed: {
    filteredTemplates() {
      if (!this.selectedEventId) return this.templates;
      return this.templates.filter(t => t.eventId === this.selectedEventId || t.eventId === null);
    }
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
      this.templates = [];
    },
    async handleBranchChange() {
      if (this.selectedBranchId) {
        this.events = await visitorService.getEvents(this.selectedBranchId);
        await this.fetchTemplates();
      } else {
        this.events = [];
        this.templates = [];
      }
      this.selectedEventId = '';
    },
    async handleEventChange() {
      // Just filtering locally for now, or re-fetch if API required it
    },
    async fetchTemplates() {
      this.loading = true;
      try {
        this.templates = await visitorService.getTemplates(this.selectedBranchId);
      } finally {
        this.loading = false;
      }
    },
    getEventName(eventId) {
      if (!eventId) return 'General';
      const event = this.events.find(e => e.id === eventId);
      return event ? event.name : 'Unknown Event';
    },
    createTemplate() {
      this.$router.push({ 
        name: 'VisitorTemplateEditor', 
        query: { 
          branchId: this.selectedBranchId,
          eventId: this.selectedEventId 
        } 
      });
    },
    editTemplate(template) {
      this.$router.push({ 
        name: 'VisitorTemplateEditor', 
        params: { id: template.id } 
      });
    },
    async deleteTemplate(id) {
      if (confirm('Are you sure you want to delete this template?')) {
        await visitorService.deleteTemplate(id);
        await this.fetchTemplates();
      }
    }
  }
};
</script>

<style scoped>
.visitor-templates {
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

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title-row h1 {
  margin: 0;
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

.btn-primary {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn-primary:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.template-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  overflow: hidden;
}

.card-header {
  padding: 15px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  color: #2c3e50;
}

.status-badge {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
}

.status-badge.active {
  background-color: #e8f8f5;
  color: #27ae60;
}

.status-badge.inactive {
  background-color: #fdf2e9;
  color: #d35400;
}

.card-body {
  padding: 15px;
}

.card-body p {
  margin: 5px 0;
  color: #7f8c8d;
  font-size: 14px;
}

.card-actions {
  padding: 10px 15px;
  background-color: #f8f9fa;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-text {
  background: none;
  border: none;
  color: #3498db;
  cursor: pointer;
  font-size: 14px;
}

.btn-text.delete {
  color: #e74c3c;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #7f8c8d;
}
</style>
