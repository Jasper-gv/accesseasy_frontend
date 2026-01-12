<template>
  <div class="visitor-links">
    <div class="header-section">
      <div class="title-row">
        <h1>Visitor Links & QRs</h1>
        <button class="btn-primary" @click="showCreateModal = true" :disabled="!selectedBranchId">
          + Create New Link
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
      </div>
    </div>

    <div class="content-section" v-if="selectedBranchId">
      <div class="links-grid">
        <div v-for="link in links" :key="link.id" class="link-card">
          <div class="qr-preview">
            <!-- Placeholder for QR Code -->
            <img :src="`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(link.url)}`" alt="QR Code" />
          </div>
          <div class="link-details">
            <h3>{{ getTemplateName(link.templateId) }}</h3>
            <p class="code">Code: {{ link.code }}</p>
            <div class="url-box">
              <input type="text" :value="link.url" readonly />
              <button @click="copyToClipboard(link.url)">Copy</button>
            </div>
            <div class="share-actions">
              <button class="btn-share whatsapp" @click="share('whatsapp', link)">
                <i class="fab fa-whatsapp"></i> WhatsApp
              </button>
              <button class="btn-share email" @click="share('email', link)">
                <i class="fas fa-envelope"></i> Email
              </button>
              <button class="btn-share sms" @click="share('sms', link)">
                <i class="fas fa-sms"></i> SMS
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="links.length === 0" class="empty-state">
        <p>No links created yet.</p>
      </div>
    </div>
    
    <div v-else class="empty-state">
      <p>Please select a Branch to view links.</p>
    </div>

    <!-- Create Link Modal -->
    <div v-if="showCreateModal" class="modal-overlay">
      <div class="modal">
        <h2>Create New Link</h2>
        <div class="form-group">
          <label>Select Template</label>
          <select v-model="newLinkTemplateId">
            <option value="">Select Template</option>
            <option v-for="template in templates" :key="template.id" :value="template.id">
              {{ template.name }}
            </option>
          </select>
        </div>
        <div class="modal-actions">
          <button class="btn-secondary" @click="showCreateModal = false">Cancel</button>
          <button class="btn-primary" @click="createLink" :disabled="!newLinkTemplateId">Generate Link</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { visitorService } from '@/services/visitorService';

export default {
  name: 'VisitorLinks',
  data() {
    return {
      tenants: [],
      branches: [],
      templates: [],
      links: [],
      selectedTenantId: '',
      selectedBranchId: '',
      showCreateModal: false,
      newLinkTemplateId: ''
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
      this.links = [];
    },
    async handleBranchChange() {
      if (this.selectedBranchId) {
        // Fetch templates for this branch to allow creating links
        this.templates = await visitorService.getTemplates(this.selectedBranchId);
        
        // Fetch all links for these templates
        // In a real API, we'd have getLinksByBranch, but here we iterate
        this.links = [];
        for (const template of this.templates) {
          const templateLinks = await visitorService.getLinks(template.id);
          this.links.push(...templateLinks);
        }
      } else {
        this.links = [];
      }
    },
    getTemplateName(templateId) {
      const t = this.templates.find(t => t.id === templateId);
      return t ? t.name : 'Unknown Template';
    },
    async createLink() {
      await visitorService.createLink(this.newLinkTemplateId);
      this.showCreateModal = false;
      this.newLinkTemplateId = '';
      await this.handleBranchChange(); // Refresh list
    },
    copyToClipboard(text) {
      navigator.clipboard.writeText(text);
      alert('Link copied to clipboard!');
    },
    share(platform, link) {
      alert(`Sharing via ${platform}: ${link.url}`);
      // Implement actual sharing logic if needed (e.g. mailto:, wa.me links)
    }
  }
};
</script>

<style scoped>
.visitor-links {
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
}

.btn-secondary {
  background-color: #ecf0f1;
  color: #2c3e50;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.link-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  padding: 20px;
  display: flex;
  gap: 20px;
}

.qr-preview {
  width: 120px;
  height: 120px;
  background: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-preview img {
  width: 100%;
  height: 100%;
}

.link-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.link-details h3 {
  margin: 0;
  font-size: 16px;
  color: #2c3e50;
}

.code {
  margin: 0;
  font-size: 12px;
  color: #95a5a6;
}

.url-box {
  display: flex;
  gap: 5px;
}

.url-box input {
  flex: 1;
  padding: 5px;
  border: 1px solid #eee;
  border-radius: 4px;
  font-size: 12px;
  color: #7f8c8d;
}

.url-box button {
  padding: 5px 10px;
  background: #ecf0f1;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.share-actions {
  display: flex;
  gap: 5px;
  margin-top: 5px;
}

.btn-share {
  flex: 1;
  padding: 6px;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.btn-share.whatsapp { background-color: #25D366; }
.btn-share.email { background-color: #3498db; }
.btn-share.sms { background-color: #f39c12; }

.empty-state {
  text-align: center;
  padding: 40px;
  color: #7f8c8d;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 400px;
}

.modal h2 {
  margin-top: 0;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group select {
  padding: 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  margin-top: 5px;
}
</style>
