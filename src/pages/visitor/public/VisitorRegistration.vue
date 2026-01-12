<template>
  <div class="visitor-registration">
    <div v-if="loading" class="loading-screen">
      <div class="spinner"></div>
      <p>Loading...</p>
    </div>

    <div v-else-if="error" class="error-screen">
      <h1>⚠️</h1>
      <p>{{ error }}</p>
    </div>

    <div v-else-if="submitted" class="success-screen">
      <div class="success-card">
        <div class="icon">✅</div>
        <h1>Registration Successful</h1>
        <p v-if="visitor.status === 'Approved'">Your visit has been approved.</p>
        <p v-else>Your request has been sent for approval.</p>
        
        <div class="badge-display" v-if="visitor.status === 'Approved'">
          <div class="badge-header">VISITOR PASS</div>
          <div class="badge-content">
            <div v-for="field in badgeFields" :key="field" class="badge-row">
              <span v-if="field === 'QR Code'" class="qr-code">
                 <img :src="`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${visitor.id}`" alt="QR" />
              </span>
              <span v-else-if="field === 'Event Name'">{{ eventName }}</span>
              <span v-else>{{ getFieldValue(field) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="form-container">
      <div class="form-header">
        <h1>Welcome to {{ branchName }}</h1>
        <p v-if="eventName">{{ eventName }}</p>
        <p class="subtitle">Please fill in your details to register.</p>
      </div>

      <form @submit.prevent="submitForm">
        <div v-for="field in template.fields" :key="field.id" class="form-group">
          <label>
            {{ field.label }}
            <span v-if="field.mandatory" class="required">*</span>
          </label>
          
          <input 
            v-if="field.type === 'text' || field.type === 'email' || field.type === 'tel' || field.type === 'number'"
            :type="field.type" 
            v-model="formData[field.label]" 
            :required="field.mandatory"
          />
          
          <input 
            v-else-if="field.type === 'date'"
            type="date" 
            v-model="formData[field.label]" 
            :required="field.mandatory"
          />
          
          <div v-else-if="field.type === 'image'" class="file-upload">
            <input type="file" @change="handleFileUpload($event, field.label)" :required="field.mandatory" />
          </div>
        </div>

        <button type="submit" class="btn-submit" :disabled="submitting">
          {{ submitting ? 'Submitting...' : 'Check In' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { visitorService } from '@/services/visitorService';

export default {
  name: 'VisitorRegistration',
  data() {
    return {
      loading: true,
      error: null,
      linkId: null,
      template: null,
      branchName: '',
      eventName: '',
      formData: {},
      submitting: false,
      submitted: false,
      visitor: null
    };
  },
  computed: {
    badgeFields() {
      return this.template ? this.template.badgeFields : [];
    }
  },
  async created() {
    this.linkId = this.$route.params.linkId;
    if (!this.linkId) {
      this.error = 'Invalid Link';
      this.loading = false;
      return;
    }

    try {
      // 1. Get Link
      // In real app, we might need a specific endpoint to get public info by code/linkId
      // Here we simulate finding the link first
      // Note: visitorService.getLinkByCode is what we implemented
      // But wait, the route param is linkId (e.g. link-1). Let's use that.
      // I implemented getLinkByCode but it searches by ID in my mock implementation (oops, let's check).
      // "getLinkByCode(code) { return Promise.resolve(mockData.links.find(l => l.id === code)); }"
      // Yes, it searches by ID actually. So passing 'link-1' works.
      
      const link = await visitorService.getLinkByCode(this.linkId);
      if (!link || !link.active) {
        this.error = 'This link is invalid or expired.';
        return;
      }

      // 2. Get Template
      this.template = await visitorService.getTemplateById(link.templateId);
      if (!this.template) {
        this.error = 'Configuration error: Template not found.';
        return;
      }

      // 3. Get Branch/Event Info for display
      // We need to find the branch. visitorService doesn't have getBranchById exposed directly in my mock
      // but I can fetch all branches for the tenant... wait, I don't know the tenant ID easily without traversing.
      // Let's cheat and iterate tenants/branches or just add a helper.
      // For now, I'll just set a generic name or try to find it.
      // Actually, let's just use "Our Office" if we can't find it easily, or fetch all.
      const tenants = await visitorService.getTenants();
      let foundBranch = null;
      for (const tenant of tenants) {
        const branches = await visitorService.getBranches(tenant.id);
        foundBranch = branches.find(b => b.id === this.template.branchId);
        if (foundBranch) break;
      }
      this.branchName = foundBranch ? foundBranch.name : 'Our Office';

      if (this.template.eventId) {
        const events = await visitorService.getEvents(this.template.branchId);
        const event = events.find(e => e.id === this.template.eventId);
        this.eventName = event ? event.name : '';
      }

    } catch (err) {
      console.error(err);
      this.error = 'Failed to load registration form.';
    } finally {
      this.loading = false;
    }
  },
  methods: {
    handleFileUpload(event, fieldLabel) {
      // Mock file upload
      this.formData[fieldLabel] = 'uploaded-file.jpg';
    },
    async submitForm() {
      this.submitting = true;
      try {
        this.visitor = await visitorService.submitVisitorForm(this.linkId, this.formData);
        this.submitted = true;
      } catch (err) {
        alert('Submission failed: ' + err);
      } finally {
        this.submitting = false;
      }
    },
    getFieldValue(fieldLabel) {
      return this.formData[fieldLabel] || '';
    }
  }
};
</script>

<style scoped>
.visitor-registration {
  min-height: 100vh;
  background-color: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.loading-screen, .error-screen {
  text-align: center;
  color: #2c3e50;
}

.form-container {
  background: white;
  width: 100%;
  max-width: 500px;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.form-header {
  text-align: center;
  margin-bottom: 30px;
}

.form-header h1 {
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 24px;
}

.subtitle {
  color: #7f8c8d;
  margin: 0;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #34495e;
  font-weight: 500;
}

.required {
  color: #e74c3c;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.form-group input:focus {
  border-color: #3498db;
  outline: none;
}

.btn-submit {
  width: 100%;
  padding: 14px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-submit:hover {
  background-color: #2980b9;
}

.btn-submit:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.success-screen {
  text-align: center;
}

.success-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  max-width: 400px;
  width: 100%;
}

.icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.badge-display {
  margin-top: 30px;
  border: 2px solid #34495e;
  border-radius: 8px;
  overflow: hidden;
}

.badge-header {
  background: #34495e;
  color: white;
  padding: 10px;
  font-weight: bold;
  letter-spacing: 2px;
}

.badge-content {
  padding: 20px;
  background: #fff;
}

.badge-row {
  margin-bottom: 10px;
  font-size: 18px;
  color: #2c3e50;
}

.qr-code img {
  width: 120px;
  height: 120px;
  margin-top: 10px;
}
</style>
