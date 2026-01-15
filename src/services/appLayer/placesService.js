/**
 * Mock service for Places Management
 * Replaces backend API calls with local storage simulation
 */

const STORAGE_KEY = 'accesseasy_places_mock_db';

const getPlacesFromStorage = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
};

const savePlacesToStorage = (places) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(places));
};

// Seed initial data if empty
if (!localStorage.getItem(STORAGE_KEY)) {
    savePlacesToStorage([
        { id: '1', name: 'Main HQ', type: 'Office', address: '123 Tech Park', status: 'Active' },
        { id: '2', name: 'Downtown Gym', type: 'Gym', address: '45 Fitness Ave', status: 'Active' },
    ]);
}

export const placesService = {
    async getAll() {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        return getPlacesFromStorage();
    },

    async getById(id) {
        await new Promise(resolve => setTimeout(resolve, 300));
        const places = getPlacesFromStorage();
        return places.find(p => p.id === id);
    },

    async create(place) {
        await new Promise(resolve => setTimeout(resolve, 600));
        const places = getPlacesFromStorage();
        const newPlace = { ...place, id: Date.now().toString(), status: 'Active' };
        places.push(newPlace);
        savePlacesToStorage(places);
        return newPlace;
    },

    async update(id, updates) {
        await new Promise(resolve => setTimeout(resolve, 600));
        const places = getPlacesFromStorage();
        const index = places.findIndex(p => p.id === id);
        if (index !== -1) {
            places[index] = { ...places[index], ...updates };
            savePlacesToStorage(places);
            return places[index];
        }
        throw new Error('Place not found');
    },

    async delete(id) {
        await new Promise(resolve => setTimeout(resolve, 400));
        let places = getPlacesFromStorage();
        places = places.filter(p => p.id !== id);
        savePlacesToStorage(places);
    }
};
