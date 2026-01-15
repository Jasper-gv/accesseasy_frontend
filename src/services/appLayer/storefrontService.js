/**
 * Mock Service for Storefront Configurations
 * Stores branding, enabled modules, and wallet rules per Place.
 */

const STORAGE_KEY = 'accesseasy_storefront_configs_db';

const getConfigs = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
};

const saveConfigs = (configs) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
};

export const storefrontService = {
    async getConfig(placeId) {
        await new Promise(resolve => setTimeout(resolve, 300));
        const configs = getConfigs();
        return configs[placeId] || {
            placeId,
            appName: 'My App',
            theme: {
                primary: '#1976D2',
                secondary: '#424242',
                accent: '#82B1FF',
                background: '#FFFFFF',
                surface: '#FFFFFF'
            },
            logoUrl: 'https://cdn.vuetifyjs.com/images/logos/vuetify-logo-light.png',
            modules: {
                visitor: true,
                parking: true,
                canteen: true,
                security: true,
                membership: true,
                wallet: true
            },
            walletRules: {
                autoRenewal: false,
                monthlyPoints: 0,
                resetUnused: false
            },
            visitorSettings: {
                requirePreApproval: false,
                enableSelfCheckIn: true,
                enablePhotoCapture: false,
                entryGates: 'Main Gate',
                notificationMethod: 'Email',
                maxVisitDuration: 480,
                welcomeMessage: 'Welcome to our facility!',
                enablePaidEntry: false,
                entryFee: 0,
                paymentGateway: 'Stripe',
                badgeTitle: 'VISITOR'
            },
            parkingSettings: {
                totalSlots: 50,
                premiumSlots: 10,
                slotNumbering: 'P001-P100',
                regularRate: 20,
                premiumRate: 50,
                maxParkingDuration: 24,
                automatedBarrier: false,
                enableReservations: true
            },
            canteenSettings: {
                canteenName: 'Main Canteen',
                allowPreOrder: true,
                enableWalletPayments: true,
                categories: ['Main Course', 'Snacks', 'Beverages', 'Desserts'],
                operationalHours: '08:00 AM - 08:00 PM'
            }
        };
    },

    async saveConfig(placeId, config) {
        await new Promise(resolve => setTimeout(resolve, 400));
        const configs = getConfigs();
        configs[placeId] = { ...config, placeId };
        saveConfigs(configs);
        return configs[placeId];
    }
};
