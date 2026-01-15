/**
 * Mock service for Visitor Management
 */

const STORAGE_KEY = 'accesseasy_visitors_mock_db';

const getVisitorsFromStorage = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
};

const saveVisitorsToStorage = (visitors) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(visitors));
};

// Seed initial data
if (!localStorage.getItem(STORAGE_KEY)) {
    saveVisitorsToStorage([
        { id: '1', name: 'John Doe', mobile: '9876543210', purpose: 'Meeting', host: 'Alice Smith', checkInTime: new Date().toISOString(), status: 'Active' },
        { id: '2', name: 'Jane Roe', mobile: '1234567890', purpose: 'Interview', host: 'Bob Jones', checkInTime: new Date(Date.now() - 3600000).toISOString(), status: 'Checked Out' },
    ]);
}

export const visitorService = {
    async getAll() {
        await new Promise(resolve => setTimeout(resolve, 500));
        return getVisitorsFromStorage();
    },

    async create(visitor) {
        await new Promise(resolve => setTimeout(resolve, 600));
        const visitors = getVisitorsFromStorage();
        const newVisitor = {
            ...visitor,
            id: Date.now().toString(),
            checkInTime: new Date().toISOString(),
            status: 'Active'
        };
        visitors.unshift(newVisitor); // Add to top
        saveVisitorsToStorage(visitors);
        return newVisitor;
    },

    async checkOut(id) {
        await new Promise(resolve => setTimeout(resolve, 400));
        const visitors = getVisitorsFromStorage();
        const index = visitors.findIndex(v => v.id === id);
        if (index !== -1) {
            visitors[index].status = 'Checked Out';
            visitors[index].checkOutTime = new Date().toISOString();
            saveVisitorsToStorage(visitors);
            return visitors[index];
        }
        throw new Error('Visitor not found');
    },

    async getStats() {
        await new Promise(resolve => setTimeout(resolve, 300));
        const visitors = getVisitorsFromStorage();
        const active = visitors.filter(v => v.status === 'Active').length;
        const today = new Date().toDateString();
        const todayVisits = visitors.filter(v => new Date(v.checkInTime).toDateString() === today).length;

        return {
            active,
            expected: 5, // Mock value
            totalToday: todayVisits
        };
    }
};
