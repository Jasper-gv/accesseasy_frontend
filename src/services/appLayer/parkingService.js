/**
 * Mock service for Parking Management
 */

const STORAGE_KEY = 'accesseasy_parking_mock_db';

const getVehiclesFromStorage = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
};

const saveVehiclesToStorage = (vehicles) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));
};

// Seed
if (!localStorage.getItem(STORAGE_KEY)) {
    saveVehiclesToStorage([
        { id: '1', plateNumber: 'KA-01-AB-1234', type: 'Car', entryTime: new Date().toISOString(), status: 'Parked', slot: 'A-101' },
    ]);
}

export const parkingService = {
    async getParkedVehicles() {
        await new Promise(resolve => setTimeout(resolve, 500));
        return getVehiclesFromStorage().filter(v => v.status === 'Parked');
    },

    async vehicleEntry(vehicle) {
        await new Promise(resolve => setTimeout(resolve, 600));
        const vehicles = getVehiclesFromStorage();

        // Simple duplicate check
        const isParked = vehicles.find(v => v.plateNumber === vehicle.plateNumber && v.status === 'Parked');
        if (isParked) throw new Error('Vehicle already parked');

        const newVehicle = {
            ...vehicle,
            id: Date.now().toString(),
            entryTime: new Date().toISOString(),
            status: 'Parked'
        };
        vehicles.unshift(newVehicle);
        saveVehiclesToStorage(vehicles);
        return newVehicle;
    },

    async vehicleExit(id) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const vehicles = getVehiclesFromStorage();
        const index = vehicles.findIndex(v => v.id === id);
        if (index !== -1) {
            vehicles[index].status = 'Exited';
            vehicles[index].exitTime = new Date().toISOString();
            // Calculate dummy fee
            const durationHrs = (new Date() - new Date(vehicles[index].entryTime)) / 36e5;
            vehicles[index].fee = Math.max(10, Math.ceil(durationHrs) * 20); // 10 min, 20 per hour

            saveVehiclesToStorage(vehicles);
            return vehicles[index];
        }
        throw new Error('Vehicle not found');
    },

    async getStats() {
        const vehicles = getVehiclesFromStorage();
        const parked = vehicles.filter(v => v.status === 'Parked');
        return {
            occupied: parked.length,
            available: 50 - parked.length,
            totalSlots: 50
        };
    }
};
