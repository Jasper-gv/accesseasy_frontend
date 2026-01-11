// Visitor Service with Mock Data for Configurator
import QRCode from 'qrcode';

// Helper function to generate unique token
const generateToken = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `PSL-${timestamp}-${random}`;
};

// Helper to generate 8-char unique code (1-9, A-Z)
const generateUniqueCode = () => {
  const chars = '123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Mock Data Storage
let mockSettings = {
  id: 1,
  enable_qr: false,
  qr_codes: [], 
  enable_link: false,
  public_links: [
    { 
      id: 1, 
      name: 'Tenant Alpha', 
      code: 'ALPHA01', 
      url: 'https://visitor.demo.com/tenant-alpha', 
      status: 'active',
      qrCode: 'mock-qr-data-alpha'
    },
    { 
      id: 2, 
      name: 'Tenant Beta', 
      code: 'BETA02', 
      url: 'https://visitor.demo.com/tenant-beta', 
      status: 'active',
      qrCode: 'mock-qr-data-beta'
    }
  ], 
  enable_approval: false,
  approvers: [], 
  tenant: 'mock-tenant-id'
};

// Mock Data Definitions
const mockApprovers = [
  { id: 1, assignedUser: { id: 101, first_name: 'John Security' } },
  { id: 2, assignedUser: { id: 102, first_name: 'Jane Admin' } },
];

const mockSites = [
  { id: 1, name: 'Main HQ' },
  { id: 2, name: 'Branch Office A' },
];

let mockTemplates = [
  {
    id: 1,
    name: 'Standard Visitor',
    description: 'Regular visitors for meetings',
    status: 'active',
    processType: 'Standard', // Standard, Event, Facility, Gate
    validityStart: null,
    validityEnd: null,
    timeRestrictions: null, // { startTime: '06:00', endTime: '10:00', days: ['Mon', 'Wed'] }
    gates: [],
    logo: null,
    form_id: 1,
    badge_layout_id: 1,
    access_level_id: 1,
    qr_enabled: true,
    qr_code_id: null,
    link_enabled: true,
    public_link: 'http://localhost:3000/visitor/register/token1',
    approval_required: false,
    approver_id: null,
    is_default: true,
    branchScope: 'all',
    selectedBranches: [],
    customFormFields: [],
    badgeFields: [],
    publicLinkCode: 'token1',
  },
  {
    id: 2,
    name: 'Contractor',
    description: 'Long-term contractors',
    status: 'active',
    processType: 'Standard',
    validityStart: null,
    validityEnd: null,
    timeRestrictions: null,
    gates: [],
    logo: null,
    form_id: 2,
    badge_layout_id: 2,
    access_level_id: 2,
    qr_enabled: true,
    qr_code_id: null,
    link_enabled: false,
    public_link: null,
    approval_required: true,
    approver_id: 1,
    is_default: false,
    branchScope: 'specific',
    selectedBranches: [8818],
    customFormFields: [{ label: 'Company Name', type: 'text', required: true }],
    badgeFields: [{ label: 'Company', type: 'text' }],
  },
  {
    id: 3,
    name: 'Tech Conf 2025',
    description: 'Annual Tech Conference',
    status: 'active',
    processType: 'Event',
    validityStart: '2025-06-01',
    validityEnd: '2025-06-03',
    timeRestrictions: null,
    gates: [],
    logo: null,
    form_id: 1,
    badge_layout_id: 1,
    access_level_id: 1,
    qr_enabled: true,
    qr_code_id: null,
    link_enabled: true,
    public_link: 'http://localhost:3000/visitor/register/token3',
    approval_required: false,
    approver_id: null,
    is_default: false,
    branchScope: 'specific',
    selectedBranches: [8819],
    customFormFields: [],
    badgeFields: [],
    publicLinkCode: 'token3',
  },
  {
    id: 4,
    name: 'Morning Gym Access',
    description: 'Gym access for members',
    status: 'active',
    processType: 'Facility',
    validityStart: null,
    validityEnd: null,
    timeRestrictions: { startTime: '06:00', endTime: '10:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
    gates: [],
    logo: null,
    form_id: 1,
    badge_layout_id: 1,
    access_level_id: 3,
    qr_enabled: true,
    qr_code_id: null,
    link_enabled: false,
    public_link: null,
    approval_required: false,
    approver_id: null,
    is_default: false,
    branchScope: 'all',
    selectedBranches: [],
    customFormFields: [{ label: 'Membership ID', type: 'text', required: true }],
    badgeFields: [],
    publicLinkCode: null,
  }
];

let mockForms = [
  { id: 1, name: 'Standard Form', default_fields: ['Full Name', 'Email', 'Phone'], custom_fields: [] },
  { id: 2, name: 'Contractor Form', default_fields: ['Full Name', 'Email', 'Phone'], custom_fields: [] },
];

let mockBadges = [
  { id: 1, name: 'Standard Badge', fields: ['Name', 'Date'] },
  { id: 2, name: 'Contractor Badge', fields: ['Name', 'Company', 'Date'] },
];

const mockAccessLevels = [
  { id: 1, accessLevelName: 'General Access' },
  { id: 2, accessLevelName: 'Restricted Access' },
  { id: 3, accessLevelName: 'VIP Access' },
];

const mockQRPages = [
  { id: 1, name: 'Main Entrance QR' },
  { id: 2, name: 'Rear Entrance QR' },
];

let mockVisitors = [
  {
    id: 1,
    personName: 'Alice Smith',
    mobileNumber: '555-0101',
    email: 'alice@example.com',
    visitDate: '2023-10-27',
    startTime: '09:00',
    endTime: '17:00',
    accessLevel: 'General Access',
    status: 'approved',
    approvedBy: 'John Security',
    approvedAt: '2023-10-26T10:00:00Z',
  },
  {
    id: 2,
    personName: 'Bob Jones',
    mobileNumber: '555-0102',
    email: 'bob@example.com',
    visitDate: '2023-10-28',
    startTime: '10:00',
    endTime: '12:00',
    accessLevel: 'Restricted Access',
    status: 'pending',
  },
];

let mockEntryLogs = [
  { id: 1, visitorId: 1, visitorName: 'Alice Smith', entryTime: '2023-10-27T09:05:00Z', exitTime: null, gate: 'Main Entrance' },
];

// Service Methods
export const visitorService = {
  // Settings
  async getVisitorSettings() {
    console.log('Mock: getVisitorSettings');
    return Promise.resolve(mockSettings);
  },

  async updateVisitorSettings(settings) {
    console.log('Mock: updateVisitorSettings', settings);
    
    const newSettings = { ...mockSettings, ...settings };

    // Ensure arrays
    if (!newSettings.public_links) newSettings.public_links = [];
    if (!newSettings.qr_codes) newSettings.qr_codes = [];

    mockSettings = newSettings;
    return Promise.resolve({ success: true, data: mockSettings });
  },

  async getApprovers() {
    console.log('Mock: getApprovers');
    return Promise.resolve(mockApprovers);
  },

  // Sites
  async getSites() {
    console.log('Mock: getSites');
    return Promise.resolve(mockSites);
  },

  async getBranches() {
    console.log('Mock: getBranches');
    return Promise.resolve([
      { title: 'branch srivai', value: 8818 },
      { title: 'branch chennai', value: 8819 },
      { title: 'branch madurai', value: 8820 },
    ]);
  },

  // Visitor Templates
  async getVisitorTemplates() {
    console.log('Mock: getVisitorTemplates');
    return Promise.resolve(mockTemplates.map(t => ({
      ...t,
      formId: t.form_id,
      badgeLayoutId: t.badge_layout_id,
      accessLevelId: t.access_level_id,
      qrEnabled: t.qr_enabled,
      qrCodeId: t.qr_code_id,
      linkEnabled: t.link_enabled,
      publicLink: t.public_link,
      approvalRequired: t.approval_required,
      approverId: t.approver_id,
      isDefault: t.is_default,
      branchScope: t.branchScope || 'all',
      selectedBranches: t.selectedBranches || [],
      customFormFields: t.customFormFields || [],
      badgeFields: t.badgeFields || [],
      publicLinkCode: t.publicLinkCode,
      // New fields
      processType: t.processType || 'Standard',
      validityStart: t.validityStart,
      validityEnd: t.validityEnd,
      gates: t.gates || [],
    })));
  },

  async getVisitorTemplateById(id) {
    console.log('Mock: getVisitorTemplateById', id);
    const t = mockTemplates.find(t => t.id == id);
    if (!t) return Promise.resolve(null);
    
    return Promise.resolve({
      ...t,
      formId: t.form_id,
      badgeLayoutId: t.badge_layout_id,
      accessLevelId: t.access_level_id,
      qrEnabled: t.qr_enabled,
      qrCodeId: t.qr_code_id,
      linkEnabled: t.link_enabled,
      publicLink: t.public_link,
      approvalRequired: t.approval_required,
      approverId: t.approver_id,
      isDefault: t.is_default,
      branchScope: t.branchScope || 'all',
      selectedBranches: t.selectedBranches || [],
      customFormFields: t.customFormFields || [],
      badgeFields: t.badgeFields || [],
      publicLinkCode: t.publicLinkCode,
      processType: t.processType || 'Standard',
      validityStart: t.validityStart,
      validityEnd: t.validityEnd,
      gates: t.gates || [],
    });
  },

  async getVisitorTemplateByQrId(qrId) {
    console.log('Mock: getVisitorTemplateByQrId', qrId);
    // Find the QR code object first to get its internal ID if needed, 
    // but here we assume qrId passed is the one stored in template.qr_code_id
    // OR we might be passing the 'code' string. 
    // Let's assume we pass the 'code' string from the URL.
    
    // 1. Find the QR code object in settings to get its ID
    const qrCodeObj = mockSettings.qr_codes.find(q => q.code === qrId);
    
    if (!qrCodeObj) {
        console.warn('QR Code not found in settings:', qrId);
        return Promise.resolve(null);
    }

    // 2. Find the template linked to this QR ID
    const t = mockTemplates.find(t => t.qr_code_id === qrCodeObj.id && t.status === 'active');
    
    if (!t) return Promise.resolve(null);

    return Promise.resolve({
      ...t,
      formId: t.form_id,
      badgeLayoutId: t.badge_layout_id,
      accessLevelId: t.access_level_id,
      qrEnabled: t.qr_enabled,
      qrCodeId: t.qr_code_id,
      linkEnabled: t.link_enabled,
      publicLink: t.public_link,
      approvalRequired: t.approval_required,
      approverId: t.approver_id,
      isDefault: t.is_default,
      branchScope: t.branchScope || 'all',
      selectedBranches: t.selectedBranches || [],
      customFormFields: t.customFormFields || [],
      badgeFields: t.badgeFields || [],
      publicLinkCode: t.publicLinkCode,
      processType: t.processType || 'Standard',
      validityStart: t.validityStart,
      validityEnd: t.validityEnd,
      gates: t.gates || [],
    });
  },

  async createVisitorTemplate(templateData) {
    console.log('Mock: createVisitorTemplate', templateData);
    const newId = mockTemplates.length > 0 ? Math.max(...mockTemplates.map(t => t.id)) + 1 : 1;
    const newTemplate = {
      id: newId,
      name: templateData.name,
      description: templateData.description,
      status: templateData.status,
      logo: templateData.logo,
      form_id: templateData.formId,
      badge_layout_id: templateData.badgeLayoutId,
      access_level_id: templateData.accessLevelId,
      qr_enabled: templateData.qrEnabled,
      qr_code_id: templateData.qrCodeId,
      link_enabled: templateData.linkEnabled,
      public_link: templateData.publicLink,
      approval_required: templateData.approvalRequired,
      approver_id: templateData.approverId,
      is_default: templateData.isDefault,
      tenant: 'mock-tenant-id',
      branchScope: templateData.branchScope || 'all',
      selectedBranches: templateData.selectedBranches || [],
      customFormFields: templateData.customFormFields || [],
      badgeFields: templateData.badgeFields || [],
      publicLinkCode: templateData.publicLinkCode,
      processType: templateData.processType || 'Standard',
      validityStart: templateData.validityStart,
      validityEnd: templateData.validityEnd,
      gates: templateData.gates || [],
    };
    mockTemplates.push(newTemplate);
    return Promise.resolve({ success: true, data: newTemplate });
  },

  async updateVisitorTemplate(id, templateData) {
    console.log('Mock: updateVisitorTemplate', id, templateData);
    const index = mockTemplates.findIndex(t => t.id == id);
    if (index === -1) throw new Error('Template not found');

    const current = mockTemplates[index];
    const updated = { ...current };

    if (templateData.name !== undefined) updated.name = templateData.name;
    if (templateData.description !== undefined) updated.description = templateData.description;
    if (templateData.status !== undefined) updated.status = templateData.status;
    if (templateData.logo !== undefined) updated.logo = templateData.logo;
    if (templateData.formId !== undefined) updated.form_id = templateData.formId;
    if (templateData.badgeLayoutId !== undefined) updated.badge_layout_id = templateData.badgeLayoutId;
    if (templateData.accessLevelId !== undefined) updated.access_level_id = templateData.accessLevelId;
    if (templateData.qrEnabled !== undefined) updated.qr_enabled = templateData.qrEnabled;
    if (templateData.qrCodeId !== undefined) updated.qr_code_id = templateData.qrCodeId;
    if (templateData.linkEnabled !== undefined) updated.link_enabled = templateData.linkEnabled;
    if (templateData.publicLink !== undefined) updated.public_link = templateData.publicLink;
    if (templateData.approvalRequired !== undefined) updated.approval_required = templateData.approvalRequired;
    if (templateData.approverId !== undefined) updated.approver_id = templateData.approverId;
    if (templateData.isDefault !== undefined) updated.is_default = templateData.isDefault;
    if (templateData.branchScope !== undefined) updated.branchScope = templateData.branchScope;
    if (templateData.selectedBranches !== undefined) updated.selectedBranches = templateData.selectedBranches;
    if (templateData.customFormFields !== undefined) updated.customFormFields = templateData.customFormFields;
    if (templateData.badgeFields !== undefined) updated.badgeFields = templateData.badgeFields;
    if (templateData.publicLinkCode !== undefined) updated.publicLinkCode = templateData.publicLinkCode;
    
    // New fields
    if (templateData.processType !== undefined) updated.processType = templateData.processType;
    if (templateData.validityStart !== undefined) updated.validityStart = templateData.validityStart;
    if (templateData.validityEnd !== undefined) updated.validityEnd = templateData.validityEnd;
    if (templateData.gates !== undefined) updated.gates = templateData.gates;

    mockTemplates[index] = updated;
    return Promise.resolve({ success: true, data: updated });
  },

  async deleteVisitorTemplate(id) {
    console.log('Mock: deleteVisitorTemplate', id);
    mockTemplates = mockTemplates.filter(t => t.id != id);
    return Promise.resolve({ success: true });
  },

  // Generate Public Link for Template
  async generatePublicLink(templateId) {
    console.log('Mock: generatePublicLink', templateId);
    const token = generateToken();
    const publicLink = `${window.location.origin}/visitor/landing?templateId=${templateId}`;
    
    await this.updateVisitorTemplate(templateId, { publicLink: publicLink });
    
    return Promise.resolve({ success: true, link: publicLink, token });
  },

  // Visitor Forms
  async getVisitorForms() {
    console.log('Mock: getVisitorForms');
    return Promise.resolve(mockForms);
  },

  async getVisitorFormById(id) {
    console.log('Mock: getVisitorFormById', id);
    const form = mockForms.find(f => f.id == id);
    if (!form) return Promise.resolve(null);

    // Transform fields for VisitorRequest.vue
    const fields = [];
    
    // Map default fields (strings) to objects
    if (form.default_fields) {
      form.default_fields.forEach((fieldName, index) => {
        const fieldId = `default_${index}`;
        let type = 'text';
        if (fieldName.toLowerCase().includes('email')) type = 'email';
        if (fieldName.toLowerCase().includes('phone') || fieldName.toLowerCase().includes('mobile')) type = 'phone';
        
        fields.push({
          id: fieldId,
          label: fieldName,
          type: type,
          placeholder: `Enter ${fieldName}`,
          required: true, // Default fields usually required
          isDefault: true
        });
      });
    }

    // Map custom fields
    if (form.custom_fields) {
      form.custom_fields.forEach((field, index) => {
        fields.push({
          id: `custom_${index}`,
          label: field.label,
          type: field.type || 'text',
          placeholder: `Enter ${field.label}`,
          required: field.required || false,
          options: field.options || [], // For dropdowns
          isCustom: true
        });
      });
    }

    return Promise.resolve({ ...form, fields });
  },

  async createVisitorForm(formData) {
    console.log('Mock: createVisitorForm', formData);
    const newId = mockForms.length > 0 ? Math.max(...mockForms.map(f => f.id)) + 1 : 1;
    const newForm = {
      id: newId,
      name: formData.name,
      default_fields: formData.default_fields,
      custom_fields: formData.custom_fields,
      tenant: 'mock-tenant-id',
    };
    mockForms.push(newForm);
    return Promise.resolve({ success: true, data: newForm });
  },

  async updateVisitorForm(id, formData) {
    console.log('Mock: updateVisitorForm', id, formData);
    const index = mockForms.findIndex(f => f.id == id);
    if (index === -1) throw new Error('Form not found');

    const current = mockForms[index];
    const updated = { ...current };

    if (formData.name !== undefined) updated.name = formData.name;
    if (formData.default_fields !== undefined) updated.default_fields = formData.default_fields;
    if (formData.custom_fields !== undefined) updated.custom_fields = formData.custom_fields;

    mockForms[index] = updated;
    return Promise.resolve({ success: true, data: updated });
  },

  async deleteVisitorForm(id) {
    console.log('Mock: deleteVisitorForm', id);
    mockForms = mockForms.filter(f => f.id != id);
    return Promise.resolve({ success: true });
  },

  // QR Pages
  async getQRPages() {
    console.log('Mock: getQRPages');
    return Promise.resolve(mockSettings.qr_codes);
  },

  async getQRPageById(id) {
    console.log('Mock: getQRPageById', id);
    const page = mockSettings.qr_codes.find(p => p.id == id);
    return Promise.resolve(page);
  },

  // Badge Layouts
  async getBadgeLayouts() {
    console.log('Mock: getBadgeLayouts');
    return Promise.resolve(mockBadges);
  },

  async getBadgeLayoutById(id) {
    console.log('Mock: getBadgeLayoutById', id);
    const badge = mockBadges.find(b => b.id == id);
    return Promise.resolve(badge);
  },

  async createVisitorBadge(badgeData) {
    console.log('Mock: createVisitorBadge', badgeData);
    const newId = mockBadges.length > 0 ? Math.max(...mockBadges.map(b => b.id)) + 1 : 1;
    const newBadge = {
      id: newId,
      ...badgeData,
      tenant: 'mock-tenant-id',
    };
    mockBadges.push(newBadge);
    return Promise.resolve({ success: true, data: newBadge });
  },

  async updateVisitorBadge(id, badgeData) {
    console.log('Mock: updateVisitorBadge', id, badgeData);
    const index = mockBadges.findIndex(b => b.id == id);
    if (index === -1) throw new Error('Badge not found');
    
    mockBadges[index] = { ...mockBadges[index], ...badgeData };
    return Promise.resolve({ success: true, data: mockBadges[index] });
  },

  // Access Levels
  async getAccessLevels() {
    console.log('Mock: getAccessLevels');
    return Promise.resolve(mockAccessLevels);
  },

  // Visitors
  async getVisitors(filters = {}) {
    console.log('Mock: getVisitors', filters);
    let filtered = [...mockVisitors];
    if (filters.status) {
      filtered = filtered.filter(v => v.status === filters.status);
    }
    return Promise.resolve(filtered);
  },

  async getVisitorById(id) {
    console.log('Mock: getVisitorById', id);
    const visitor = mockVisitors.find(v => v.id == id);
    return Promise.resolve(visitor);
  },

  async registerVisitor(visitorData) {
    console.log('Mock: registerVisitor', visitorData);
    const newId = mockVisitors.length > 0 ? Math.max(...mockVisitors.map(v => v.id)) + 1 : 1;
    const newVisitor = {
      id: newId,
      ...visitorData,
      status: 'pending',
      tenant: 'mock-tenant-id',
    };
    mockVisitors.push(newVisitor);
    return Promise.resolve({ success: true, data: newVisitor });
  },

  async updateVisitorStatus(visitorId, status, approvedBy = null, reason = null) {
    console.log('Mock: updateVisitorStatus', visitorId, status);
    const index = mockVisitors.findIndex(v => v.id == visitorId);
    if (index === -1) throw new Error('Visitor not found');

    const updated = { ...mockVisitors[index], status };
    if (approvedBy) updated.approvedBy = approvedBy;
    if (reason) updated.rejectionReason = reason;
    if (status === 'approved') updated.approvedAt = new Date().toISOString();

    mockVisitors[index] = updated;
    return Promise.resolve({ success: true, data: updated });
  },

  // QR Code Generation
  async generateQR(visitorData) {
    console.log('Mock: generateQR', visitorData);
    const qrData = {
      visitorId: visitorData.id,
      name: visitorData.personName,
      phone: visitorData.mobileNumber,
      validFrom: `${visitorData.visitDate}T${visitorData.startTime}`,
      validUntil: `${visitorData.visitDate}T${visitorData.endTime}`,
      accessLevel: visitorData.accessLevel,
      timestamp: Date.now(),
    };

    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData));
    return Promise.resolve(qrCodeDataUrl);
  },

  // Entry Logs
  async createEntryLog(logData) {
    console.log('Mock: createEntryLog', logData);
    const newId = mockEntryLogs.length > 0 ? Math.max(...mockEntryLogs.map(l => l.id)) + 1 : 1;
    const newLog = {
      id: newId,
      ...logData,
      tenant: 'mock-tenant-id',
    };
    mockEntryLogs.push(newLog);
    return Promise.resolve({ success: true, data: newLog });
  },

  async getEntryLogs(filters = {}) {
    console.log('Mock: getEntryLogs', filters);
    return Promise.resolve(mockEntryLogs);
  },
};

