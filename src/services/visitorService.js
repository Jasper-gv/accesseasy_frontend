
import { reactive } from 'vue';

// Mock Data
const mockData = reactive({
  tenants: [
    { id: 'tenant-1', name: 'Acme Corp' },
    { id: 'tenant-2', name: 'Globex' }
  ],
  branches: [
    { id: 'branch-1', tenantId: 'tenant-1', name: 'Headquarters', type: 'Office' },
    { id: 'branch-2', tenantId: 'tenant-1', name: 'Downtown Gym', type: 'Gym' },
    { id: 'branch-3', tenantId: 'tenant-2', name: 'Main Office', type: 'Office' }
  ],
  events: [
    { id: 'event-1', branchId: 'branch-1', name: 'Annual Tech Summit', status: 'Active' },
    { id: 'event-2', branchId: 'branch-1', name: 'Weekly Yoga', status: 'Active' },
    { id: 'event-3', branchId: 'branch-2', name: 'Open House', status: 'Inactive' }
  ],
  templates: [
    {
      id: 'template-1',
      branchId: 'branch-1',
      eventId: null,
      name: 'General Visitor',
      status: 'Active',
      approvalRequired: false,
      fields: [
        { id: 'f1', label: 'Visitor Name', type: 'text', mandatory: true, isDefault: true },
        { id: 'f2', label: 'Phone Number', type: 'tel', mandatory: true, isDefault: true },
        { id: 'f3', label: 'Purpose of Visit', type: 'text', mandatory: true, isDefault: true },
        { id: 'f4', label: 'Company Name', type: 'text', mandatory: false, isDefault: false }
      ],
      badgeFields: ['Visitor Name', 'QR Code']
    },
    {
      id: 'template-2',
      branchId: 'branch-1',
      eventId: 'event-1',
      name: 'Tech Summit VIP',
      status: 'Active',
      approvalRequired: true,
      approverId: 'user-1',
      fields: [
        { id: 'f1', label: 'Visitor Name', type: 'text', mandatory: true, isDefault: true },
        { id: 'f2', label: 'Phone Number', type: 'tel', mandatory: true, isDefault: true },
        { id: 'f3', label: 'Purpose of Visit', type: 'text', mandatory: true, isDefault: true },
        { id: 'f5', label: 'Dietary Restrictions', type: 'text', mandatory: false, isDefault: false }
      ],
      badgeFields: ['Visitor Name', 'Event Name', 'QR Code']
    }
  ],
  links: [
    {
      id: 'link-1',
      templateId: 'template-1',
      code: 'VISIT-GEN-001',
      url: 'http://localhost:5173/visitor/register/link-1',
      active: true
    },
    {
      id: 'link-2',
      templateId: 'template-2',
      code: 'VISIT-VIP-001',
      url: 'http://localhost:5173/visitor/register/link-2',
      active: true
    }
  ],
  visitors: [
    {
      id: 'v-1',
      templateId: 'template-1',
      data: { 'Visitor Name': 'John Doe', 'Phone Number': '1234567890', 'Purpose of Visit': 'Meeting' },
      status: 'Approved',
      checkInTime: null,
      checkOutTime: null
    },
    {
      id: 'v-2',
      templateId: 'template-1',
      data: { 'Visitor Name': 'Jane Smith', 'Phone Number': '9876543210', 'Purpose of Visit': 'Interview' },
      status: 'Pending',
      checkInTime: null,
      checkOutTime: null
    },
    {
      id: 'v-3',
      templateId: 'template-2',
      data: { 'Visitor Name': 'Alice Johnson', 'Phone Number': '5551234567', 'Purpose of Visit': 'VIP Guest' },
      status: 'Checked In',
      checkInTime: '2023-10-27T10:00:00',
      checkOutTime: null
    },
    {
      id: 'v-4',
      templateId: 'template-2',
      data: { 'Visitor Name': 'Bob Brown', 'Phone Number': '5559876543', 'Purpose of Visit': 'Speaker' },
      status: 'Checked Out',
      checkInTime: '2023-10-27T09:00:00',
      checkOutTime: '2023-10-27T11:00:00'
    },
    {
      id: 'v-5',
      templateId: 'template-1',
      data: { 'Visitor Name': 'Charlie Davis', 'Phone Number': '1112223333', 'Purpose of Visit': 'Delivery' },
      status: 'Approved',
      checkInTime: null,
      checkOutTime: null
    }
  ],
  users: [
    { id: 'user-1', name: 'Alice Admin', role: 'Admin' },
    { id: 'user-2', name: 'Bob Security', role: 'Security' }
  ]
});

export const visitorService = {
  // Tenants
  getTenants() {
    return Promise.resolve(mockData.tenants);
  },

  // Branches
  getBranches(tenantId) {
    return Promise.resolve(mockData.branches.filter(b => b.tenantId === tenantId));
  },

  // Events
  getEvents(branchId) {
    return Promise.resolve(mockData.events.filter(e => e.branchId === branchId));
  },

  // Templates
  getTemplates(branchId, eventId = null) {
    return Promise.resolve(mockData.templates.filter(t => 
      t.branchId === branchId && (eventId ? t.eventId === eventId : t.eventId === null)
    ));
  },
  
  getTemplateById(templateId) {
    return Promise.resolve(mockData.templates.find(t => t.id === templateId));
  },

  createTemplate(template) {
    const newTemplate = { ...template, id: `template-${Date.now()}` };
    mockData.templates.push(newTemplate);
    return Promise.resolve(newTemplate);
  },

  updateTemplate(template) {
    const index = mockData.templates.findIndex(t => t.id === template.id);
    if (index !== -1) {
      mockData.templates[index] = template;
    }
    return Promise.resolve(template);
  },

  deleteTemplate(templateId) {
    const index = mockData.templates.findIndex(t => t.id === templateId);
    if (index !== -1) {
      mockData.templates.splice(index, 1);
    }
    return Promise.resolve();
  },

  // Links
  getLinks(templateId) {
    return Promise.resolve(mockData.links.filter(l => l.templateId === templateId));
  },

  getLinkByCode(code) { // or ID
     return Promise.resolve(mockData.links.find(l => l.id === code));
  },

  createLink(templateId) {
    const newLink = {
      id: `link-${Date.now()}`,
      templateId,
      code: `VISIT-${Date.now()}`,
      url: `http://localhost:5173/visitor/register/link-${Date.now()}`,
      active: true
    };
    mockData.links.push(newLink);
    return Promise.resolve(newLink);
  },

  // Visitors / Registrations
  submitVisitorForm(linkId, formData) {
    const link = mockData.links.find(l => l.id === linkId);
    if (!link) return Promise.reject('Invalid Link');

    const template = mockData.templates.find(t => t.id === link.templateId);
    
    const newVisitor = {
      id: `v-${Date.now()}`,
      templateId: template.id,
      data: formData,
      status: template.approvalRequired ? 'Pending' : 'Approved',
      checkInTime: null,
      checkOutTime: null
    };
    
    mockData.visitors.push(newVisitor);
    return Promise.resolve(newVisitor);
  },

  getVisitors(branchId) {
     if (!branchId) {
       return Promise.resolve(mockData.visitors);
     }
     // Simplified: get all visitors for templates belonging to this branch
     const branchTemplateIds = mockData.templates
        .filter(t => t.branchId === branchId)
        .map(t => t.id);
     
     return Promise.resolve(mockData.visitors.filter(v => branchTemplateIds.includes(v.templateId)));
  }
};
