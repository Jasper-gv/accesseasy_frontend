/**
 * Analytics Service
 * Provides data aggregation and analytics across all modules
 */

const generateMockVisitorData = (days = 30) => {
    const data = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        data.push({
            date: date.toISOString().split('T')[0],
            visits: Math.floor(Math.random() * 50) + 20,
            vipVisits: Math.floor(Math.random() * 15) + 5,
            averageDuration: Math.floor(Math.random() * 180) + 60 // minutes
        });
    }

    return data;
};

const generateMockParkingData = (days = 30) => {
    const data = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        data.push({
            date: date.toISOString().split('T')[0],
            occupancyRate: Math.floor(Math.random() * 40) + 50, // 50-90%
            revenue: Math.floor(Math.random() * 3000) + 2000,
            premiumUsage: Math.floor(Math.random() * 10) + 5
        });
    }

    return data;
};

const generateMockCanteenData = (days = 30) => {
    const data = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        data.push({
            date: date.toISOString().split('T')[0],
            orders: Math.floor(Math.random() * 30) + 10,
            revenue: Math.floor(Math.random() * 4000) + 2000,
            walletUsage: Math.floor(Math.random() * 60) + 30 // percentage
        });
    }

    return data;
};

export const analyticsService = {
    async getLocationStats(locationId, period = 'today') {
        await new Promise(resolve => setTimeout(resolve, 300));

        // Summary stats for the period
        return {
            visitors: {
                total: 45,
                change: +12, // percentage
                vip: 18
            },
            parking: {
                occupied: 67,
                capacity: 100,
                revenue: 3450,
                change: +8
            },
            canteen: {
                orders: 24,
                revenue: 5600,
                change: +15,
                walletUsage: 65 // percentage
            },
            revenue: {
                total: 15400,
                byModule: {
                    parking: 3450,
                    canteen: 5600,
                    memberships: 6350
                }
            }
        };
    },

    async getVisitorAnalytics(locationId, dateRange = { days: 30 }) {
        await new Promise(resolve => setTimeout(resolve, 400));

        const trendData = generateMockVisitorData(dateRange.days);

        return {
            summary: {
                totalVisits: trendData.reduce((sum, d) => sum + d.visits, 0),
                averageDaily: Math.floor(trendData.reduce((sum, d) => sum + d.visits, 0) / dateRange.days),
                peakDay: trendData.reduce((max, d) => d.visits > max.visits ? d : max, trendData[0]),
                vipPercentage: 35
            },

            trendData,

            peakHours: [
                { hour: '09:00', count: 12 },
                { hour: '10:00', count: 18 },
                { hour: '11:00', count: 8 },
                { hour: '14:00', count: 15 },
                { hour: '15:00', count: 22 },
                { hour: '16:00', count: 14 },
                { hour: '17:00', count: 10 }
            ],

            accessLevelBreakdown: [
                { level: 'Gold Membership', count: 145, percentage: 42 },
                { level: 'Silver Membership', count: 98, percentage: 28 },
                { level: 'Day Pass', count: 72, percentage: 21 },
                { level: 'Corporate Pass', count: 31, percentage: 9 }
            ],

            entryGates: [
                { gate: 'Main Gate', count: 245, percentage: 71 },
                { gate: 'Side Entrance', count: 101, percentage: 29 }
            ],

            recentCheckIns: [
                { id: 1, name: 'John Doe', level: 'Gold Membership', gate: 'Main Gate', time: '2026-01-15T16:45:00', duration: 120 },
                { id: 2, name: 'Jane Smith', level: 'Silver Membership', gate: 'Side Entrance', time: '2026-01-15T16:30:00', duration: 90 },
                { id: 3, name: 'Mike Johnson', level: 'Day Pass', gate: 'Main Gate', time: '2026-01-15T16:15:00', duration: 60 }
            ]
        };
    },

    async getParkingAnalytics(locationId, dateRange = { days: 30 }) {
        await new Promise(resolve => setTimeout(resolve, 400));

        const trendData = generateMockParkingData(dateRange.days);

        return {
            summary: {
                totalRevenue: trendData.reduce((sum, d) => sum + d.revenue, 0),
                averageOccupancy: Math.floor(trendData.reduce((sum, d) => sum + d.occupancyRate, 0) / dateRange.days),
                peakOccupancy: Math.max(...trendData.map(d => d.occupancyRate)),
                totalSlots: 100,
                premiumSlots: 20
            },

            trendData,

            slotTypeUsage: [
                { type: 'Regular', used: 52, total: 80, percentage: 65 },
                { type: 'Premium', used: 15, total: 20, percentage: 75 }
            ],

            revenueByType: [
                { type: 'Regular', revenue: 41600, percentage: 62 },
                { type: 'Premium', revenue: 25400, percentage: 38 }
            ],

            averageDuration: {
                overall: 185, // minutes
                regular: 165,
                premium: 245
            },

            currentlyParked: [
                { slot: 'A12', vehicle: 'MH-12-AB-1234', type: 'Premium', entryTime: '2026-01-15T14:30:00', duration: 135 },
                { slot: 'A15', vehicle: 'MH-12-CD-5678', type: 'Regular', entryTime: '2026-01-15T15:00:00', duration: 105 },
                { slot: 'P05', vehicle: 'MH-12-EF-9012', type: 'Premium', entryTime: '2026-01-15T16:00:00', duration: 45 }
            ]
        };
    },

    async getCanteenAnalytics(locationId, dateRange = { days: 30 }) {
        await new Promise(resolve => setTimeout(resolve, 400));

        const trendData = generateMockCanteenData(dateRange.days);

        return {
            summary: {
                totalOrders: trendData.reduce((sum, d) => sum + d.orders, 0),
                totalRevenue: trendData.reduce((sum, d) => sum + d.revenue, 0),
                averageOrderValue: 235,
                walletUsagePercentage: 58
            },

            trendData,

            popularItems: [
                { item: 'Vegetable Sandwich', orders: 145, revenue: 21750 },
                { item: 'Coffee', orders: 234, revenue: 11700 },
                { item: 'Pasta', orders: 98, revenue: 24500 },
                { item: 'Fruit Salad', orders: 87, revenue: 13050 },
                { item: 'Burger', orders: 76, revenue: 15200 }
            ],

            paymentMethods: [
                { method: 'Wallet', count: 412, revenue: 96760, percentage: 58 },
                { method: 'Cash', count: 234, revenue: 54990, percentage: 33 },
                { method: 'Card', count: 67, revenue: 15750, percentage: 9 }
            ],

            discountUsage: {
                totalRedeemed: 145,
                totalSaved: 8970,
                byAccessLevel: [
                    { level: 'Gold Membership', count: 89, saved: 6230 },
                    { level: 'Silver Membership', count: 56, saved: 2740 }
                ]
            },

            recentOrders: [
                { id: '4829', customer: 'John Doe', items: 3, total: 450, payment: 'Wallet', time: '2026-01-15T16:40:00' },
                { id: '4828', customer: 'Jane Smith', items: 2, total: 280, payment: 'Cash', time: '2026-01-15T16:25:00' },
                { id: '4827', customer: 'Mike Johnson', items: 1, total: 150, payment: 'Card', time: '2026-01-15T16:10:00' }
            ]
        };
    },

    async getAccessLevelAnalytics(locationId, accessLevelId = null) {
        await new Promise(resolve => setTimeout(resolve, 400));

        if (accessLevelId) {
            // Analytics for specific access level
            return {
                levelInfo: {
                    name: 'Gold Gym Membership',
                    scope: 'global'
                },

                summary: {
                    totalSold: 245,
                    currentlyActive: 198,
                    expired: 37,
                    suspended: 10,
                    retentionRate: 81,
                    churnRate: 5.2
                },

                revenue: {
                    monthly: 990000,
                    annual: 11880000,
                    averageLifetimeValue: 48000
                },

                salesTrend: generateMockVisitorData(90).map(d => ({
                    date: d.date,
                    sold: Math.floor(Math.random() * 8) + 2
                })),

                usageByLocation: [
                    { location: 'Downtown Gym', members: 145, usage: 2340 },
                    { location: 'Uptown Gym', members: 98, usage: 1567 },
                    { location: 'Suburb Gym', members: 53, usage: 845 }
                ],

                averageUsage: {
                    checkInsPerMonth: 12,
                    parkingUsage: 8,
                    canteenSpend: 2400
                }
            };
        }

        // Overall access level distribution at this location
        return {
            distribution: [
                { level: 'Gold Membership', count: 145, percentage: 42, revenue: 725000 },
                { level: 'Silver Membership', count: 98, percentage: 28, revenue: 294000 },
                { level: 'Day Pass', count: 72, percentage: 21, revenue: 14400 },
                { level: 'Corporate Pass', count: 31, percentage: 9, revenue: 155000 }
            ],

            totalActiveMembers: 346,
            totalMonthlyRevenue: 1188400
        };
    },

    async getRecentActivity(locationId, limit = 20) {
        await new Promise(resolve => setTimeout(resolve, 200));

        const activities = [
            {
                id: 1,
                type: 'visitor_checkin',
                icon: 'mdi-account-check',
                color: 'blue',
                user: 'John Doe',
                level: 'Gold Membership',
                gate: 'Main Gate',
                timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
                description: 'checked in at Main Gate'
            },
            {
                id: 2,
                type: 'parking_occupied',
                icon: 'mdi-car',
                color: 'indigo',
                slot: 'A12',
                vehicle: 'MH-12-AB-1234',
                timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
                description: 'parked at slot A12'
            },
            {
                id: 3,
                type: 'canteen_order',
                icon: 'mdi-food',
                color: 'orange',
                orderId: '4829',
                total: 450,
                customer: 'Jane Smith',
                timestamp: new Date(Date.now() - 18 * 60000).toISOString(),
                description: 'placed canteen order #4829'
            },
            {
                id: 4,
                type: 'membership_sold',
                icon: 'mdi-card-account-details',
                color: 'success',
                customer: 'Mike Johnson',
                level: 'Silver Membership',
                timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
                description: 'purchased Silver Membership'
            },
            {
                id: 5,
                type: 'visitor_checkout',
                icon: 'mdi-logout',
                color: 'grey',
                user: 'Sarah Wilson',
                duration: 120,
                timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
                description: 'checked out (2h visit)'
            }
        ];

        return activities.slice(0, limit);
    }
};
