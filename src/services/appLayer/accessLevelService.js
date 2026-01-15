/**
 * Access Level Service
 * Manages access level definitions (memberships, passes, credentials)
 * Supports global (all locations) and location-specific scopes
 */

const STORAGE_KEY = 'accesseasy_access_levels_db';

const getAccessLevels = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
};

const saveAccessLevels = (levels) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(levels));
};

// Seed initial access level templates
if (!localStorage.getItem(STORAGE_KEY)) {
    saveAccessLevels([
        {
            id: 'access-gold-gym',
            name: 'Gold Gym Membership',
            type: 'membership',
            module: 'multi',
            scope: 'global',
            locationIds: [],
            permissions: {
                visitor: { allowEntry: true, vipAccess: true },
                parking: { allowParking: true, premiumSlots: true },
                canteen: { creditLimit: 5000, discount: 10 }
            },
            validityDays: 365,
            price: 5000,
            recurringBilling: 'monthly',
            status: 'active',
            createdAt: new Date().toISOString()
        },
        {
            id: 'access-silver-gym',
            name: 'Silver Gym Membership',
            type: 'membership',
            module: 'visitor',
            scope: 'global',
            locationIds: [],
            permissions: {
                visitor: { allowEntry: true, vipAccess: false },
                parking: { allowParking: false, premiumSlots: false },
                canteen: { creditLimit: 2000, discount: 5 }
            },
            validityDays: 365,
            price: 3000,
            recurringBilling: 'monthly',
            status: 'active',
            createdAt: new Date().toISOString()
        },
        {
            id: 'access-platinum-gym',
            name: 'Platinum Annual Plan',
            type: 'membership',
            module: 'multi',
            scope: 'global',
            locationIds: [],
            permissions: {
                visitor: { allowEntry: true, vipAccess: true },
                parking: { allowParking: true, premiumSlots: true },
                canteen: { creditLimit: 10000, discount: 15 }
            },
            validityDays: 365,
            price: 50000,
            recurringBilling: 'yearly',
            status: 'active',
            createdAt: new Date().toISOString()
        },
        {
            id: 'access-day-pass',
            name: '1-Day Guest Pass',
            type: 'day_pass',
            module: 'visitor',
            scope: 'global',
            locationIds: [],
            permissions: {
                visitor: { allowEntry: true, vipAccess: false },
                parking: { allowParking: false, premiumSlots: false },
                canteen: { creditLimit: 0, discount: 0 }
            },
            validityDays: 1,
            price: 300,
            recurringBilling: 'daily',
            status: 'active',
            createdAt: new Date().toISOString()
        },
        {
            id: 'access-parking-premium',
            name: 'Premium Parking Pass',
            type: 'parking_pass',
            module: 'parking',
            scope: 'global',
            locationIds: [],
            permissions: {
                visitor: { allowEntry: false, vipAccess: false },
                parking: { allowParking: true, premiumSlots: true },
                canteen: { creditLimit: 0, discount: 0 }
            },
            validityDays: 365,
            price: 2000,
            recurringBilling: 'monthly',
            status: 'active',
            createdAt: new Date().toISOString()
        }
    ]);
}

export const accessLevelService = {
    async getAll() {
        await new Promise(resolve => setTimeout(resolve, 300));
        return getAccessLevels();
    },

    async getById(id) {
        await new Promise(resolve => setTimeout(resolve, 200));
        const levels = getAccessLevels();
        return levels.find(l => l.id === id);
    },

    async getByScope(scope) {
        await new Promise(resolve => setTimeout(resolve, 300));
        const levels = getAccessLevels();
        return levels.filter(l => l.scope === scope);
    },

    async getByModule(module) {
        await new Promise(resolve => setTimeout(resolve, 300));
        const levels = getAccessLevels();
        return levels.filter(l => l.module === module || l.module === 'multi');
    },

    async getByLocation(locationId) {
        await new Promise(resolve => setTimeout(resolve, 300));
        const levels = getAccessLevels();
        return levels.filter(l =>
            l.scope === 'global' || l.locationIds.includes(locationId)
        );
    },

    async create(levelData) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const levels = getAccessLevels();

        const newLevel = {
            ...levelData,
            id: `access-${Date.now()}`,
            createdAt: new Date().toISOString(),
            status: 'active'
        };

        levels.push(newLevel);
        saveAccessLevels(levels);
        return newLevel;
    },

    async update(id, updates) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const levels = getAccessLevels();
        const index = levels.findIndex(l => l.id === id);

        if (index !== -1) {
            levels[index] = {
                ...levels[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            saveAccessLevels(levels);
            return levels[index];
        }
        throw new Error('Access level not found');
    },

    async delete(id) {
        await new Promise(resolve => setTimeout(resolve, 400));
        let levels = getAccessLevels();
        levels = levels.filter(l => l.id !== id);
        saveAccessLevels(levels);
    },

    async toggleStatus(id) {
        await new Promise(resolve => setTimeout(resolve, 300));
        const levels = getAccessLevels();
        const index = levels.findIndex(l => l.id === id);

        if (index !== -1) {
            levels[index].status = levels[index].status === 'active' ? 'inactive' : 'active';
            levels[index].updatedAt = new Date().toISOString();
            saveAccessLevels(levels);
            return levels[index];
        }
        throw new Error('Access level not found');
    },

    // Get template access levels for quick creation
    getTemplates() {
        return [
            {
                name: 'Gold Membership',
                type: 'membership',
                module: 'multi',
                scope: 'global',
                permissions: {
                    visitor: { allowEntry: true, vipAccess: true },
                    parking: { allowParking: true, premiumSlots: true },
                    canteen: { creditLimit: 5000, discount: 10 }
                },
                price: 5000,
                recurringBilling: 'monthly'
            },
            {
                name: 'Visitor Day Pass',
                type: 'day_pass',
                module: 'visitor',
                scope: 'locations',
                permissions: {
                    visitor: { allowEntry: true, vipAccess: false },
                    parking: { allowParking: false, premiumSlots: false },
                    canteen: { creditLimit: 500, discount: 0 }
                },
                price: 200,
                recurringBilling: 'daily'
            },
            {
                name: 'Annual VIP Membership',
                type: 'membership',
                module: 'multi',
                scope: 'global',
                permissions: {
                    visitor: { allowEntry: true, vipAccess: true },
                    parking: { allowParking: true, premiumSlots: true },
                    canteen: { creditLimit: 10000, discount: 15 }
                },
                price: 45000,
                recurringBilling: 'yearly'
            },
            {
                name: 'Corporate Parking Pass',
                type: 'parking_pass',
                module: 'parking',
                scope: 'locations',
                permissions: {
                    visitor: { allowEntry: true, vipAccess: false },
                    parking: { allowParking: true, premiumSlots: false },
                    canteen: { creditLimit: 0, discount: 0 }
                },
                price: 1500,
                recurringBilling: 'monthly'
            }
        ];
    }
};
