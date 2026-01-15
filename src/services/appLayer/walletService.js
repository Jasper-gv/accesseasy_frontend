/**
 * Mock Service for Employee Wallets/Points
 */

const STORAGE_KEY = 'accesseasy_wallets_db';

const getWallets = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
};

const saveWallets = (wallets) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wallets));
};

export const walletService = {
    async getBalance(employeeId) {
        await new Promise(resolve => setTimeout(resolve, 300));
        const wallets = getWallets();
        if (!wallets[employeeId]) {
            // Initialize new wallet with default points for demo
            wallets[employeeId] = { points: 500, transactions: [] };
            saveWallets(wallets);
        }
        return wallets[employeeId];
    },

    async deductPoints(employeeId, amount, description) {
        await new Promise(resolve => setTimeout(resolve, 400));
        const wallets = getWallets();
        const wallet = wallets[employeeId];

        if (!wallet || wallet.points < amount) {
            throw new Error('Insufficient Balance');
        }

        wallet.points -= amount;
        wallet.transactions.push({
            id: Date.now(),
            type: 'DEBIT',
            amount,
            description,
            date: new Date().toISOString()
        });

        saveWallets(wallets);
        return wallet.points;
    }
};
