// Visitor Service with Hardcoded Data
import QRCode from 'qrcode';

// Hardcoded Settings
let visitorSettings = {
  enableWalkIn: true,
  enablePreShared: true,
  enableApproval: true,
  allowMultipleEntry: false,
  qrValidityHours: 24,
  defaultAccessLevel: 1,
};

// Hardcoded Access Levels
const accessLevels = [
  { id: 1, accessLevelName: 'Visitor - Ground Floor', accessLevelNumber: 'AL-001' },
  { id: 2, accessLevelName: 'Visitor - All Floors', accessLevelNumber: 'AL-002' },
  { id: 3, accessLevelName: 'Visitor - Meeting Rooms', accessLevelNumber: 'AL-003' },
  { id: 4, accessLevelName: 'Visitor - VIP Access', accessLevelNumber: 'AL-004' },
];

// Hardcoded Visitors Data
let visitors = [
  {
    id: 1,
    personName: 'John Doe',
    email: 'john.doe@example.com',
    mobileNumber: '+1234567890',
    purpose: 'Meeting',
    hostName: 'Alice Smith',
    visitDate: '2026-01-03',
    startTime: '09:00',
    endTime: '17:00',
    status: 'approved',
    accessLevel: 1,
    qrCode: null,
    createdAt: '2026-01-03T08:30:00',
    approvedAt: '2026-01-03T08:35:00',
    approvedBy: 'Admin User',
    registrationType: 'walk-in',
    checkInTime: '2026-01-03T09:15:00',
    checkOutTime: null,
  },
  {
    id: 2,
    personName: 'Jane Wilson',
    email: 'jane.wilson@example.com',
    mobileNumber: '+1234567891',
    purpose: 'Interview',
    hostName: 'Bob Johnson',
    visitDate: '2026-01-03',
    startTime: '10:00',
    endTime: '12:00',
    status: 'pending',
    accessLevel: 2,
    qrCode: null,
    createdAt: '2026-01-03T09:00:00',
    approvedAt: null,
    approvedBy: null,
    registrationType: 'pre-shared',
    checkInTime: null,
    checkOutTime: null,
  },
  {
    id: 3,
    personName: 'Mike Brown',
    email: 'mike.brown@example.com',
    mobileNumber: '+1234567892',
    purpose: 'Delivery',
    hostName: 'Carol Davis',
    visitDate: '2026-01-03',
    startTime: '14:00',
    endTime: '15:00',
    status: 'checked-in',
    accessLevel: 1,
    qrCode: null,
    createdAt: '2026-01-03T13:30:00',
    approvedAt: '2026-01-03T13:35:00',
    approvedBy: 'Security Guard',
    registrationType: 'walk-in',
    checkInTime: '2026-01-03T14:05:00',
    checkOutTime: null,
  },
  {
    id: 4,
    personName: 'Sarah Lee',
    email: 'sarah.lee@example.com',
    mobileNumber: '+1234567893',
    purpose: 'Meeting',
    hostName: 'David Chen',
    visitDate: '2026-01-02',
    startTime: '11:00',
    endTime: '16:00',
    status: 'checked-out',
    accessLevel: 3,
    qrCode: null,
    createdAt: '2026-01-02T10:30:00',
    approvedAt: '2026-01-02T10:32:00',
    approvedBy: 'Admin User',
    registrationType: 'pre-shared',
    checkInTime: '2026-01-02T11:10:00',
    checkOutTime: '2026-01-02T15:45:00',
  },
  {
    id: 5,
    personName: 'Tom Anderson',
    email: 'tom.anderson@example.com',
    mobileNumber: '+1234567894',
    purpose: 'Other',
    hostName: 'Emma White',
    visitDate: '2026-01-03',
    startTime: '15:00',
    endTime: '18:00',
    status: 'rejected',
    accessLevel: null,
    qrCode: null,
    createdAt: '2026-01-03T14:00:00',
    approvedAt: null,
    approvedBy: null,
    registrationType: 'walk-in',
    checkInTime: null,
    checkOutTime: null,
  },
];

// Entry Logs
let entryLogs = [
  {
    id: 1,
    visitorId: 1,
    visitorName: 'John Doe',
    action: 'check-in',
    timestamp: '2026-01-03T09:15:00',
    securityGuard: 'Guard A',
    door: 'Main Entrance',
    qrValid: true,
  },
  {
    id: 2,
    visitorId: 3,
    visitorName: 'Mike Brown',
    action: 'check-in',
    timestamp: '2026-01-03T14:05:00',
    securityGuard: 'Guard B',
    door: 'Main Entrance',
    qrValid: true,
  },
  {
    id: 3,
    visitorId: 4,
    visitorName: 'Sarah Lee',
    action: 'check-in',
    timestamp: '2026-01-02T11:10:00',
    securityGuard: 'Guard A',
    door: 'Main Entrance',
    qrValid: true,
  },
  {
    id: 4,
    visitorId: 4,
    visitorName: 'Sarah Lee',
    action: 'check-out',
    timestamp: '2026-01-02T15:45:00',
    securityGuard: 'Guard C',
    door: 'Main Entrance',
    qrValid: true,
  },
];

// Pre-shared Links
let preSharedLinks = [
  {
    id: 1,
    token: 'PSL-2026-001',
    generatedBy: 'Admin User',
    generatedAt: '2026-01-02T10:00:00',
    expiresAt: '2026-01-04T10:00:00',
    used: true,
    usedAt: '2026-01-02T10:30:00',
    visitorId: 4,
    preFilledData: {
      hostName: 'David Chen',
      purpose: 'Meeting',
    },
  },
  {
    id: 2,
    token: 'PSL-2026-002',
    generatedBy: 'Manager User',
    generatedAt: '2026-01-03T08:00:00',
    expiresAt: '2026-01-05T08:00:00',
    used: true,
    usedAt: '2026-01-03T09:00:00',
    visitorId: 2,
    preFilledData: {
      hostName: 'Bob Johnson',
      purpose: 'Interview',
    },
  },
  {
    id: 3,
    token: 'PSL-2026-003',
    generatedBy: 'Admin User',
    generatedAt: '2026-01-03T12:00:00',
    expiresAt: '2026-01-10T12:00:00',
    used: false,
    usedAt: null,
    visitorId: null,
    preFilledData: {
      hostName: 'Frank Miller',
      purpose: 'Meeting',
    },
  },
];

// Helper function to generate unique ID
const generateId = (array) => {
  return array.length > 0 ? Math.max(...array.map(item => item.id)) + 1 : 1;
};

// Helper function to generate unique token
const generateToken = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `PSL-${timestamp}-${random}`;
};

// Service Methods
export const visitorService = {
  // Settings
  getVisitorSettings() {
    return Promise.resolve({ ...visitorSettings });
  },

  updateVisitorSettings(newSettings) {
    visitorSettings = { ...visitorSettings, ...newSettings };
    return Promise.resolve({ success: true, data: visitorSettings });
  },

  // Access Levels
  getAccessLevels() {
    return Promise.resolve(accessLevels);
  },

  // Visitors
  getVisitors(filters = {}) {
    let filtered = [...visitors];

    if (filters.status) {
      filtered = filtered.filter(v => v.status === filters.status);
    }

    if (filters.date) {
      filtered = filtered.filter(v => v.visitDate === filters.date);
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(v => 
        v.personName.toLowerCase().includes(search) ||
        v.email.toLowerCase().includes(search) ||
        v.mobileNumber.includes(search)
      );
    }

    if (filters.registrationType) {
      filtered = filtered.filter(v => v.registrationType === filters.registrationType);
    }

    return Promise.resolve(filtered);
  },

  getVisitorById(id) {
    const visitor = visitors.find(v => v.id === id);
    return Promise.resolve(visitor || null);
  },

  async registerVisitor(visitorData) {
    const newVisitor = {
      id: generateId(visitors),
      ...visitorData,
      status: visitorSettings.enableApproval ? 'pending' : 'approved',
      createdAt: new Date().toISOString(),
      approvedAt: visitorSettings.enableApproval ? null : new Date().toISOString(),
      approvedBy: visitorSettings.enableApproval ? null : 'Auto-Approved',
      checkInTime: null,
      checkOutTime: null,
    };

    // Generate QR code if auto-approved
    if (!visitorSettings.enableApproval) {
      const qrData = {
        visitorId: newVisitor.id,
        name: newVisitor.personName,
        phone: newVisitor.mobileNumber,
        validFrom: `${newVisitor.visitDate}T${newVisitor.startTime}`,
        validUntil: `${newVisitor.visitDate}T${newVisitor.endTime}`,
        accessLevel: newVisitor.accessLevel,
      };
      newVisitor.qrCode = await QRCode.toDataURL(JSON.stringify(qrData));
    }

    visitors.push(newVisitor);
    return Promise.resolve({ success: true, data: newVisitor });
  },

  async updateVisitorStatus(visitorId, status, approvedBy = null, reason = null) {
    const visitor = visitors.find(v => v.id === visitorId);
    if (!visitor) {
      return Promise.reject({ error: 'Visitor not found' });
    }

    visitor.status = status;
    
    if (status === 'approved') {
      visitor.approvedAt = new Date().toISOString();
      visitor.approvedBy = approvedBy || 'Admin';
      
      // Generate QR code
      const qrData = {
        visitorId: visitor.id,
        name: visitor.personName,
        phone: visitor.mobileNumber,
        validFrom: `${visitor.visitDate}T${visitor.startTime}`,
        validUntil: `${visitor.visitDate}T${visitor.endTime}`,
        accessLevel: visitor.accessLevel,
      };
      visitor.qrCode = await QRCode.toDataURL(JSON.stringify(qrData));
    } else if (status === 'rejected') {
      visitor.rejectionReason = reason;
    }

    return Promise.resolve({ success: true, data: visitor });
  },

  async bulkUpdateStatus(visitorIds, status, approvedBy = null) {
    const results = await Promise.all(
      visitorIds.map(id => this.updateVisitorStatus(id, status, approvedBy))
    );
    return Promise.resolve({ success: true, data: results });
  },

  // QR Code Generation
  async generateQR(visitorData) {
    const qrData = {
      visitorId: visitorData.id || Date.now(),
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

  // QR Validation
  validateQR(qrData) {
    try {
      const data = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
      const now = new Date();
      const validFrom = new Date(data.validFrom);
      const validUntil = new Date(data.validUntil);

      if (now < validFrom) {
        return Promise.resolve({
          valid: false,
          reason: 'QR code not yet valid',
          status: 'not-started',
          data,
        });
      }

      if (now > validUntil) {
        return Promise.resolve({
          valid: false,
          reason: 'QR code expired',
          status: 'expired',
          data,
        });
      }

      // Check if visitor exists and is approved
      const visitor = visitors.find(v => v.id === data.visitorId);
      if (!visitor) {
        return Promise.resolve({
          valid: false,
          reason: 'Visitor not found',
          status: 'invalid',
          data,
        });
      }

      if (visitor.status !== 'approved' && visitor.status !== 'checked-in') {
        return Promise.resolve({
          valid: false,
          reason: `Visitor status: ${visitor.status}`,
          status: 'invalid',
          data,
        });
      }

      // Check multiple entry setting
      if (!visitorSettings.allowMultipleEntry && visitor.checkInTime && !visitor.checkOutTime) {
        return Promise.resolve({
          valid: false,
          reason: 'Already checked in',
          status: 'duplicate',
          data,
        });
      }

      return Promise.resolve({
        valid: true,
        reason: 'Valid QR code',
        status: 'valid',
        data,
        visitor,
      });
    } catch (error) {
      return Promise.resolve({
        valid: false,
        reason: 'Invalid QR code format',
        status: 'invalid',
        data: null,
      });
    }
  },

  // Entry Logs
  async createEntryLog(logData) {
    const newLog = {
      id: generateId(entryLogs),
      timestamp: new Date().toISOString(),
      ...logData,
    };

    entryLogs.push(newLog);

    // Update visitor status
    const visitor = visitors.find(v => v.id === logData.visitorId);
    if (visitor) {
      if (logData.action === 'check-in') {
        visitor.status = 'checked-in';
        visitor.checkInTime = newLog.timestamp;
      } else if (logData.action === 'check-out') {
        visitor.status = 'checked-out';
        visitor.checkOutTime = newLog.timestamp;
      }
    }

    return Promise.resolve({ success: true, data: newLog });
  },

  getEntryLogs(filters = {}) {
    let filtered = [...entryLogs];

    if (filters.date) {
      filtered = filtered.filter(log => log.timestamp.startsWith(filters.date));
    }

    if (filters.action) {
      filtered = filtered.filter(log => log.action === filters.action);
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(log => 
        log.visitorName.toLowerCase().includes(search) ||
        log.securityGuard.toLowerCase().includes(search)
      );
    }

    return Promise.resolve(filtered.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    ));
  },

  // Pre-shared Links
  generatePreSharedLink(linkData) {
    const newLink = {
      id: generateId(preSharedLinks),
      token: generateToken(),
      generatedBy: linkData.generatedBy || 'Admin',
      generatedAt: new Date().toISOString(),
      expiresAt: linkData.expiresAt || new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      used: false,
      usedAt: null,
      visitorId: null,
      preFilledData: linkData.preFilledData || {},
    };

    preSharedLinks.push(newLink);
    return Promise.resolve({ success: true, data: newLink });
  },

  getPreSharedLinks() {
    return Promise.resolve([...preSharedLinks].sort((a, b) => 
      new Date(b.generatedAt) - new Date(a.generatedAt)
    ));
  },

  getPreSharedLinkByToken(token) {
    const link = preSharedLinks.find(l => l.token === token);
    if (!link) {
      return Promise.reject({ error: 'Link not found' });
    }

    const now = new Date();
    const expiresAt = new Date(link.expiresAt);

    if (now > expiresAt) {
      return Promise.reject({ error: 'Link expired' });
    }

    if (link.used) {
      return Promise.reject({ error: 'Link already used' });
    }

    return Promise.resolve(link);
  },

  markLinkAsUsed(token, visitorId) {
    const link = preSharedLinks.find(l => l.token === token);
    if (link) {
      link.used = true;
      link.usedAt = new Date().toISOString();
      link.visitorId = visitorId;
    }
    return Promise.resolve({ success: true });
  },

  // Statistics
  getVisitorStats() {
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = new Date().toISOString().substring(0, 7);

    const todayVisitors = visitors.filter(v => v.visitDate === today);
    const monthVisitors = visitors.filter(v => v.visitDate.startsWith(thisMonth));
    const pendingApprovals = visitors.filter(v => v.status === 'pending');
    const activeVisitors = visitors.filter(v => v.status === 'checked-in');

    // Purpose breakdown
    const purposeBreakdown = visitors.reduce((acc, v) => {
      acc[v.purpose] = (acc[v.purpose] || 0) + 1;
      return acc;
    }, {});

    // Daily trend (last 7 days)
    const dailyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const count = visitors.filter(v => v.visitDate === dateStr).length;
      dailyTrend.push({ date: dateStr, count });
    }

    return Promise.resolve({
      todayCount: todayVisitors.length,
      monthCount: monthVisitors.length,
      pendingCount: pendingApprovals.length,
      activeCount: activeVisitors.length,
      purposeBreakdown,
      dailyTrend,
      recentVisitors: visitors.slice(-10).reverse(),
    });
  },
};

export default visitorService;
