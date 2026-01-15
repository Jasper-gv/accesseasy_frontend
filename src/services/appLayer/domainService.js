/**
 * Mock Service for Domain Management
 * Simulates DNS verification for custom domains (GoDaddy, Cloudflare, etc.)
 */

// Format: { placeId: { domain: 'app.corp.com', status: 'verified', provider: 'GoDaddy', cname: 'alias.freshbytes.app' } }
const STORAGE_KEY = 'accesseasy_domains_db';

const getDomains = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
};

const saveDomains = (domains) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(domains));
};

export const domainService = {
    async getDomain(placeId) {
        await new Promise(resolve => setTimeout(resolve, 300));
        const domains = getDomains();
        return domains[placeId] || null;
    },

    async registerDomain(placeId, domain) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const domains = getDomains();

        domains[placeId] = {
            domain,
            status: 'pending_verification',
            provider: 'Unknown',
            cname: `alias.${placeId}.access.app`,
            verificationRecord: `verify-${Math.random().toString(36).substring(7)}`
        };

        saveDomains(domains);
        return domains[placeId];
    },

    async verifyDns(placeId) {
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network check
        const domains = getDomains();
        const entry = domains[placeId];

        if (!entry) throw new Error("No domain registered");

        // Simulate 80% success rate
        if (Math.random() > 0.2) {
            entry.status = 'active';
            entry.provider = ['GoDaddy', 'Cloudflare', 'Hostinger', 'AWS Route53'][Math.floor(Math.random() * 4)];
            saveDomains(domains);
            return entry;
        } else {
            throw new Error("DNS record not found. Please propagate CNAME.");
        }
    }
};
