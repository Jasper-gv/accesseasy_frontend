/**
 * Mock service for Canteen Management
 */

const MENU_STORAGE_KEY = 'accesseasy_canteen_menu_db';
const ORDERS_STORAGE_KEY = 'accesseasy_canteen_orders_db';

const getFromStorage = (key, defaultData) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultData;
};

const saveToStorage = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
};

// Seed Menu
const defaultMenu = [
    { id: '1', name: 'Veggie Burger', category: 'Lunch', price: 120, image: 'https://via.placeholder.com/150', available: true },
    { id: '2', name: 'Chicken Wrap', category: 'Lunch', price: 180, image: 'https://via.placeholder.com/150', available: true },
    { id: '3', name: 'Coffee', category: 'Beverages', price: 40, image: 'https://via.placeholder.com/150', available: true },
    { id: '4', name: 'Sandwich', category: 'Breakfast', price: 80, image: 'https://via.placeholder.com/150', available: true },
];

if (!localStorage.getItem(MENU_STORAGE_KEY)) {
    saveToStorage(MENU_STORAGE_KEY, defaultMenu);
}

export const canteenService = {
    async getMenu() {
        await new Promise(resolve => setTimeout(resolve, 300));
        return getFromStorage(MENU_STORAGE_KEY, defaultMenu);
    },

    async updateMenuItem(item) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const menu = getFromStorage(MENU_STORAGE_KEY, defaultMenu);
        const index = menu.findIndex(i => i.id === item.id);
        if (index !== -1) {
            menu[index] = { ...menu[index], ...item };
        } else {
            menu.push({ ...item, id: Date.now().toString() });
        }
        saveToStorage(MENU_STORAGE_KEY, menu);
        return item;
    },

    async toggleAvailability(id) {
        await new Promise(resolve => setTimeout(resolve, 200));
        const menu = getFromStorage(MENU_STORAGE_KEY, defaultMenu);
        const item = menu.find(i => i.id === id);
        if (item) {
            item.available = !item.available;
            saveToStorage(MENU_STORAGE_KEY, menu);
        }
    },

    async getOrders() {
        await new Promise(resolve => setTimeout(resolve, 400));
        return getFromStorage(ORDERS_STORAGE_KEY, []);
    },

    async placeOrder(orderItems) {
        await new Promise(resolve => setTimeout(resolve, 800));
        const orders = getFromStorage(ORDERS_STORAGE_KEY, []);
        const total = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const newOrder = {
            id: Date.now().toString().slice(-6),
            items: orderItems,
            total,
            status: 'Pending',
            createdAt: new Date().toISOString()
        };

        orders.unshift(newOrder); // Newest first
        saveToStorage(ORDERS_STORAGE_KEY, orders);
        return newOrder;
    },

    async updateOrderStatus(id, status) {
        await new Promise(resolve => setTimeout(resolve, 400));
        const orders = getFromStorage(ORDERS_STORAGE_KEY, []);
        const order = orders.find(o => o.id === id);
        if (order) {
            order.status = status;
            saveToStorage(ORDERS_STORAGE_KEY, orders);
            return order;
        }
        throw new Error('Order not found');
    }
};
