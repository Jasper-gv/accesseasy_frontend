<template>
  <div class="template-editor">
    <div class="header-section">
      <div class="title-row">
        <h1>{{ isEditMode ? 'Edit Template' : 'Create Template' }}</h1>
        <div class="actions">
          <button class="btn-secondary" @click="$router.back()">Cancel</button>
          <button class="btn-primary" @click="saveTemplate">Save Template</button>
        </div>
      </div>
    </div>

    <div class="editor-content">
      <!-- Basic Info -->
      <div class="section">
        <h2>Basic Information</h2>
        <div class="form-grid">
          <div class="form-group">
            <label>Template Name</label>
            <input v-model="template.name" type="text" placeholder="e.g. General Visitor" />
          </div>
          <div class="form-group">
            <label>Branch</label>
            <select v-model="template.branchId" disabled>
              <option v-for="branch in branches" :key="branch.id" :value="branch.id">
                {{ branch.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Event (Optional)</label>
            <select v-model="template.eventId">
              <option :value="null">None (General)</option>
              <option v-for="event in events" :key="event.id" :value="event.id">
                {{ event.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Status</label>
            <select v-model="template.status">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Form Configuration -->
      <div class="section">
        <div class="section-header">
          <h2>Visitor Form Configuration</h2>
          <button class="btn-small" @click="addField">+ Add Custom Field</button>
        </div>
        <div class="fields-list">
          <div v-for="(field, index) in template.fields" :key="index" class="field-item">
            <div class="field-row">
              <div class="col">
                <label>Label</label>
                <input v-model="field.label" type="text" :disabled="field.isDefault" />
              </div>
              <div class="col">
                <label>Type</label>
                <select v-model="field.type" :disabled="field.isDefault">
                  <option value="text">Text</option>
                  <option value="tel">Phone</option>
                  <option value="email">Email</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="image">Image Upload</option>
                </select>
              </div>
              <div class="col checkbox">
                <label>
                  <input type="checkbox" v-model="field.mandatory" :disabled="field.isDefault" />
                  Mandatory
                </label>
              </div>
              <div class="col action">
                <button v-if="!field.isDefault" @click="removeField(index)" class="btn-icon">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Badge Configuration -->
      <div class="section">
        <h2>Badge Configuration</h2>
        <p class="hint">Select fields to display on the visitor badge.</p>
        <div class="badge-options">
          <label v-for="field in template.fields" :key="field.id" class="badge-checkbox">
            <input type="checkbox" :value="field.label" v-model="template.badgeFields" />
            {{ field.label }}
          </label>
          <label class="badge-checkbox">
            <input type="checkbox" value="QR Code" v-model="template.badgeFields" disabled />
            QR Code (Always On)
          </label>
          <label class="badge-checkbox">
             <input type="checkbox" value="Event Name" v-model="template.badgeFields" />
             Event Name
          </label>
        </div>
        
        <div class="badge-preview">
          <h3>Badge Preview</h3>
          <div class="badge-card">
            <div class="badge-header">VISITOR</div>
            <div class="badge-body">
              <div v-for="fieldLabel in template.badgeFields" :key="fieldLabel" class="badge-line">
                <span v-if="fieldLabel !== 'QR Code'">{{ fieldLabel }}: [Value]</span>
                <div v-else class="badge-qr">[QR CODE]</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Approval Flow -->
      <div class="section">
        <h2>Approval Flow</h2>
        <div class="form-group checkbox-group">
          <label>
            <input type="checkbox" v-model="template.approvalRequired" />
            Require Approval for Entry
          </label>
        </div>
        
        <div v-if="template.approvalRequired" class="approval-settings">
          <div class="form-group">
            <label>Approver</label>
            <select v-model="template.approverId">
              <option value="">Select Approver</option>
              <option v-for="user in users" :key="user.id" :value="user.id">
                {{ user.name }} ({{ user.role }})
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { visitorService } from '@/services/visitorService';

export default {
  name: 'VisitorTemplateEditor',
  props: ['id'],
  data() {
    return {
      template: {
        name: '',
        branchId: '',
        eventId: null,
        status: 'Active',
        approvalRequired: false,
        approverId: '',
        fields: [
          { id: 'f1', label: 'Visitor Name', type: 'text', mandatory: true, isDefault: true },
          { id: 'f2', label: 'Phone Number', type: 'tel', mandatory: true, isDefault: true },
          { id: 'f3', label: 'Purpose of Visit', type: 'text', mandatory: true, isDefault: true }
        ],
        badgeFields: ['Visitor Name', 'QR Code']
      },
      branches: [],
      events: [],
      users: [], // Mock users for approver selection
      isEditMode: false
    };
  },
  async created() {
    // Load dependencies
    const tenants = await visitorService.getTenants();
    // Assuming first tenant for now or passed via query, but let's just load all branches for simplicity in this mock
    // In real app, we'd know the context.
    // Let's grab the branchId from query if creating
    const queryBranchId = this.$route.query.branchId;
    const queryEventId = this.$route.query.eventId;

    if (this.id) {
      this.isEditMode = true;
      const existing = await visitorService.getTemplateById(this.id);
      if (existing) {
        this.template = JSON.parse(JSON.stringify(existing)); // Deep copy
      }
    } else {
      if (queryBranchId) this.template.branchId = queryBranchId;
      if (queryEventId) this.template.eventId = queryEventId;
    }

    // Load branches/events for dropdowns (mocked context)
    // We need to know tenant to get branches. If editing, we have branchId -> tenantId.
    // If creating, we have branchId.
    // For this mock, I'll just load all branches from the service if possible, or just the one relevant.
    // visitorService.getBranches requires tenantId. I'll cheat and get tenant-1 for now or iterate.
    this.branches = await visitorService.getBranches('tenant-1'); 
    this.events = await visitorService.getEvents(this.template.branchId || 'branch-1');
    
    // Mock users
    this.users = [
        { id: 'user-1', name: 'Alice Admin', role: 'Admin' },
        { id: 'user-2', name: 'Bob Security', role: 'Security' }
    ];
  },
  methods: {
    addField() {
      this.template.fields.push({
        id: `f-${Date.now()}`,
        label: 'New Field',
        type: 'text',
        mandatory: false,
        isDefault: false
      });
    },
    removeField(index) {
      this.template.fields.splice(index, 1);
    },
    async saveTemplate() {
      if (!this.template.name) {
        alert('Please enter a template name');
        return;
      }
      
      if (this.isEditMode) {
        await visitorService.updateTemplate(this.template);
      } else {
        await visitorService.createTemplate(this.template);
      }
      
      this.$router.push({ name: 'VisitorTemplates' });
    }
  }
};
</script>

<style scoped>
.template-editor {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
  padding-bottom: 80px;
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
}

.title-row h1 {
  margin: 0;
  color: #2c3e50;
}

.actions {
  display: flex;
  gap: 10px;
}

.btn-primary {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-secondary {
  background-color: #ecf0f1;
  color: #2c3e50;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.editor-content {
  max-width: 800px;
  margin: 0 auto;
}

.section {
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  margin-bottom: 20px;
}

.section h2 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 18px;
  color: #2c3e50;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.section-header h2 {
  margin: 0;
  border: none;
  padding: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
}

.form-group label {
  font-size: 14px;
  color: #7f8c8d;
  margin-bottom: 5px;
}

.form-group input, .form-group select {
  padding: 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.btn-small {
  background-color: #2ecc71;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.fields-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.field-item {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  border: 1px solid #eee;
}

.field-row {
  display: flex;
  gap: 15px;
  align-items: flex-end;
}

.col {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.col.checkbox {
  flex: 0 0 100px;
  align-items: center;
  justify-content: center;
  padding-bottom: 10px;
}

.col.action {
  flex: 0 0 40px;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
}

.badge-options {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
}

.badge-checkbox {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}

.badge-preview {
  background: #f0f2f5;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.badge-card {
  background: white;
  width: 250px;
  height: 350px;
  border: 1px solid #ddd;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.badge-header {
  background: #e74c3c;
  color: white;
  text-align: center;
  padding: 15px;
  font-weight: bold;
  font-size: 20px;
}

.badge-body {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  justify-content: center;
}

.badge-line {
  font-size: 16px;
  text-align: center;
}

.badge-qr {
  width: 100px;
  height: 100px;
  background: #333;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
}

.hint {
  color: #95a5a6;
  font-size: 14px;
  margin-bottom: 15px;
}
</style>
