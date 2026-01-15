/**
 * Mock Service for Pass Templates
 * Defines types of access (Member, Visitor, Parking, etc.)
 */

const STORAGE_KEY = 'accesseasy_pass_templates_db';

const getTemplatesFromStorage = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
};

const saveTemplatesToStorage = (templates) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
};

// Seed initial templates if empty
if (!localStorage.getItem(STORAGE_KEY)) {
    saveTemplatesToStorage([
        {
            id: '1',
            name: 'Standard Visitor',
            type: 'Visitor',
            accessMode: 'Security Check',
            duration: 24,
            cost: 0,
            isMembership: false,
            membershipPlanId: 'standard-visitor',
            placeId: 'all'
        },
        {
            id: '2',
            name: 'VIP Guest',
            type: 'Visitor',
            accessMode: 'Auto Entry',
            duration: 24,
            cost: 0,
            isMembership: false,
            membershipPlanId: 'vip-visitor',
            placeId: 'all'
        },
        {
            id: '3',
            name: 'Gold Member Pass',
            type: 'Membership',
            accessMode: 'Auto Entry',
            duration: 720,
            cost: 2999,
            isMembership: true,
            membershipPlanId: 'gold-member',
            placeId: 'all'
        },
        {
            id: '4',
            name: 'Daily Parking',
            type: 'Parking',
            accessMode: 'Auto Entry',
            duration: 24,
            cost: 100,
            isMembership: false,
            membershipPlanId: 'daily-parking',
            placeId: 'all'
        }
    ]);
}

export const passTemplateService = {
    async getAll() {
        await new Promise(resolve => setTimeout(resolve, 300));
        return getTemplatesFromStorage();
    },

    async create(template) {
        await new Promise(resolve => setTimeout(resolve, 400));
        const templates = getTemplatesFromStorage();
        const newTemplate = { ...template, id: Date.now().toString() };
        templates.push(newTemplate);
        saveTemplatesToStorage(templates);
        return newTemplate;
    },

    async update(id, updates) {
        await new Promise(resolve => setTimeout(resolve, 400));
        const templates = getTemplatesFromStorage();
        const index = templates.findIndex(t => t.id === id);
        if (index !== -1) {
            templates[index] = { ...templates[index], ...updates };
            saveTemplatesToStorage(templates);
            return templates[index];
        }
        throw new Error('Template not found');
    },

    async delete(id) {
        await new Promise(resolve => setTimeout(resolve, 300));
        let templates = getTemplatesFromStorage();
        templates = templates.filter(t => t.id !== id);
        saveTemplatesToStorage(templates);
    }
};
