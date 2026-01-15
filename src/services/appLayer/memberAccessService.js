/**
 * Member Access Service
 * Manages user access assignments and validation
 * Tracks usage across locations
 */

const STORAGE_KEY = 'accesseasy_member_access_db';
const LOGS_KEY = 'accesseasy_access_logs_db';

const getMemberAccess = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
};

const saveMemberAccess = (records) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};

const getAccessLogs = () => {
    const data = localStorage.getItem(LOGS_KEY);
    return data ? JSON.parse(data) : [];
};

const saveAccessLogs = (logs) => {
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
};

export const memberAccessService = {
    async assignAccess(userId, accessLevelId, assignedBy, assignedLocation) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const records = getMemberAccess();

        const newRecord = {
            id: `member-access-${Date.now()}`,
            userId,
            accessLevelId,
            assignedBy,
            assignedLocation,
            assignedAt: new Date().toISOString(),
            expiresAt: null, // Will be calculated based on access level validity
            status: 'active',
            usageCount: 0,
            lastUsedAt: null,
            lastUsedLocation: null
        };

        records.push(newRecord);
        saveMemberAccess(records);
        return newRecord;
    },

    async getActiveAccess(userId) {
        await new Promise(resolve => setTimeout(resolve, 300));
        const records = getMemberAccess();
        const now = new Date();

        return records.filter(r =>
            r.userId === userId &&
            r.status === 'active' &&
            (!r.expiresAt || new Date(r.expiresAt) > now)
        );
    },

    async getAllAccessByUser(userId) {
        await new Promise(resolve => setTimeout(resolve, 300));
        const records = getMemberAccess();
        return records.filter(r => r.userId === userId);
    },

    async validateAccess(userId, locationId, module) {
        await new Promise(resolve => setTimeout(resolve, 400));

        // Import access level service dynamically to avoid circular dependency
        const { accessLevelService } = await import('./accessLevelService.js');

        const activeAccess = await this.getActiveAccess(userId);

        for (const access of activeAccess) {
            const level = await accessLevelService.getById(access.accessLevelId);

            if (!level || level.status !== 'active') continue;

            // Check module permission
            const modulePermission = level.permissions[module];
            if (!modulePermission) continue;

            // For visitor module, check allowEntry
            // For parking module, check allowParking
            const hasModuleAccess = module === 'visitor'
                ? modulePermission.allowEntry
                : module === 'parking'
                    ? modulePermission.allowParking
                    : module === 'canteen'
                        ? modulePermission.creditLimit > 0
                        : false;

            if (!hasModuleAccess) continue;

            // Check scope
            if (level.scope === 'global') {
                return {
                    valid: true,
                    level,
                    access,
                    reason: 'Global access - Valid at all locations'
                };
            }

            if (level.locationIds.includes(locationId)) {
                return {
                    valid: true,
                    level,
                    access,
                    reason: `Location-specific access - Valid at this location`
                };
            }
        }

        return {
            valid: false,
            reason: 'No valid access level found for this location and module'
        };
    },

    async logAccess(userId, locationId, module, accessLevelId, status) {
        await new Promise(resolve => setTimeout(resolve, 200));
        const logs = getAccessLogs();

        const log = {
            id: `log-${Date.now()}`,
            userId,
            locationId,
            module,
            accessLevelId,
            status, // 'granted', 'denied'
            timestamp: new Date().toISOString()
        };

        logs.push(log);

        // Keep only last 1000 logs
        if (logs.length > 1000) {
            logs.splice(0, logs.length - 1000);
        }

        saveAccessLogs(logs);

        // Update member access usage stats if granted
        if (status === 'granted') {
            const records = getMemberAccess();
            const accessRecord = records.find(r =>
                r.userId === userId && r.accessLevelId === accessLevelId && r.status === 'active'
            );

            if (accessRecord) {
                accessRecord.lastUsedAt = new Date().toISOString();
                accessRecord.lastUsedLocation = locationId;
                accessRecord.usageCount = (accessRecord.usageCount || 0) + 1;
                saveMemberAccess(records);
            }
        }

        return log;
    },

    async getAccessLogs(filters = {}) {
        await new Promise(resolve => setTimeout(resolve, 300));
        let logs = getAccessLogs();

        if (filters.userId) {
            logs = logs.filter(l => l.userId === filters.userId);
        }

        if (filters.locationId) {
            logs = logs.filter(l => l.locationId === filters.locationId);
        }

        if (filters.module) {
            logs = logs.filter(l => l.module === filters.module);
        }

        if (filters.status) {
            logs = logs.filter(l => l.status === filters.status);
        }

        if (filters.startDate) {
            logs = logs.filter(l => new Date(l.timestamp) >= new Date(filters.startDate));
        }

        if (filters.endDate) {
            logs = logs.filter(l => new Date(l.timestamp) <= new Date(filters.endDate));
        }

        // Sort by timestamp descending
        return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    },

    async revokeAccess(memberAccessId) {
        await new Promise(resolve => setTimeout(resolve, 400));
        const records = getMemberAccess();
        const index = records.findIndex(r => r.id === memberAccessId);

        if (index !== -1) {
            records[index].status = 'revoked';
            records[index].revokedAt = new Date().toISOString();
            saveMemberAccess(records);
            return records[index];
        }
        throw new Error('Member access record not found');
    },

    async suspendAccess(memberAccessId, reason) {
        await new Promise(resolve => setTimeout(resolve, 400));
        const records = getMemberAccess();
        const index = records.findIndex(r => r.id === memberAccessId);

        if (index !== -1) {
            records[index].status = 'suspended';
            records[index].suspendedAt = new Date().toISOString();
            records[index].suspensionReason = reason;
            saveMemberAccess(records);
            return records[index];
        }
        throw new Error('Member access record not found');
    },

    async reactivateAccess(memberAccessId) {
        await new Promise(resolve => setTimeout(resolve, 400));
        const records = getMemberAccess();
        const index = records.findIndex(r => r.id === memberAccessId);

        if (index !== -1) {
            records[index].status = 'active';
            records[index].reactivatedAt = new Date().toISOString();
            delete records[index].suspensionReason;
            saveMemberAccess(records);
            return records[index];
        }
        throw new Error('Member access record not found');
    },

    async getUsageStats(userId) {
        await new Promise(resolve => setTimeout(resolve, 300));
        const logs = getAccessLogs().filter(l => l.userId === userId);
        const access = getMemberAccess().filter(r => r.userId === userId);

        const stats = {
            totalAccess: access.length,
            activeAccess: access.filter(a => a.status === 'active').length,
            totalVisits: logs.filter(l => l.status === 'granted').length,
            locationBreakdown: {},
            moduleBreakdown: {}
        };

        logs.forEach(log => {
            if (log.status === 'granted') {
                stats.locationBreakdown[log.locationId] = (stats.locationBreakdown[log.locationId] || 0) + 1;
                stats.moduleBreakdown[log.module] = (stats.moduleBreakdown[log.module] || 0) + 1;
            }
        });

        return stats;
    }
};
