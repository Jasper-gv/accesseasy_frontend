// Access Service - The Anti-Gravity Schema Implementation
// Implements Global, Place, and Flow layers

// --- 1. The Global Layer (The "Who") ---

// Identities: Unique people (Phone/Email)
let mockIdentities = [
  { id: 1, name: 'Alice Smith', email: 'alice@example.com', phone: '555-0101', avatar: null },
  { id: 2, name: 'Bob Jones', email: 'bob@example.com', phone: '555-0102', avatar: null },
  { id: 3, name: 'Charlie VIP', email: 'charlie@vip.com', phone: '555-0103', avatar: null },
  { id: 4, name: 'Dave Staff', email: 'dave@staff.com', phone: '555-0104', avatar: null },
];

// Global Access Levels: "Passports"
let mockGlobalAccessLevels = [
  { id: 1, name: 'Standard Guest', description: 'Basic access for visitors' },
  { id: 2, name: 'VIP Member', description: 'All-access pass for clubs and events' },
  { id: 3, name: 'Staff', description: 'Employee access' },
  { id: 4, name: 'Vendor/Delivery', description: 'Limited access for deliveries' },
];

// Vehicles: Linked to Identity
let mockVehicles = [
  { id: 1, identityId: 1, plate: 'ABC-1234', model: 'Toyota Camry' },
  { id: 2, identityId: 3, plate: 'VIP-9999', model: 'Tesla Model S' },
];

// --- 2. The Place Layer (The "Where") ---

// Places: The Container (Building, Event, Apartment)
let mockPlaces = [
  { 
    id: 1, 
    name: 'Downtown Gym', 
    type: 'Facility', 
    address: '123 Fitness Blvd',
    image: 'https://cdn.vuetifyjs.com/images/cards/cooking.png', // Placeholder
    stats: { activeEntries: 12, totalCapacity: 100 }
  },
  { 
    id: 2, 
    name: 'Tech Expo 2026', 
    type: 'Event', 
    address: 'Convention Center',
    image: 'https://cdn.vuetifyjs.com/images/cards/sunshine.jpg', // Placeholder
    stats: { activeEntries: 345, totalCapacity: 5000 }
  },
  { 
    id: 3, 
    name: 'Sunset Apartments', 
    type: 'Residential', 
    address: '456 Sunset Dr',
    image: 'https://cdn.vuetifyjs.com/images/cards/house.jpg', // Placeholder
    stats: { activeEntries: 5, totalCapacity: 200 }
  },
  {
    id: 4,
    name: 'Public Parking Lot A',
    type: 'Parking',
    address: '789 Main St',
    image: 'https://cdn.vuetifyjs.com/images/cards/road.jpg', // Placeholder
    stats: { activeEntries: 45, totalCapacity: 50 }
  }
];

// Resources: Gates and Parking Zones scoped to a Place
let mockResources = [
  // Downtown Gym
  { id: 1, placeId: 1, type: 'Gate', name: 'Main Entrance' },
  { id: 2, placeId: 1, type: 'ParkingZone', name: 'Member Lot', capacity: 20, occupied: 12 },
  
  // Tech Expo
  { id: 3, placeId: 2, type: 'Gate', name: 'North Hall Entry' },
  { id: 4, placeId: 2, type: 'Gate', name: 'South Hall Entry' },
  { id: 5, placeId: 2, type: 'ParkingZone', name: 'Exhibitor Parking', capacity: 100, occupied: 80 },
  
  // Sunset Apartments
  { id: 6, placeId: 3, type: 'Gate', name: 'Lobby Door' },
  { id: 7, placeId: 3, type: 'ParkingZone', name: 'Visitor Zone A', capacity: 5, occupied: 1 },
  
  // Public Parking
  { id: 8, placeId: 4, type: 'Gate', name: 'Entry Barrier' },
  { id: 9, placeId: 4, type: 'ParkingZone', name: 'Main Zone', capacity: 50, occupied: 45 },
];

// --- 3. The Flow Layer (The "How") ---

// Flow Templates: Rules for entering a Place
let mockFlows = [
  // Downtown Gym Flows
  { 
    id: 1, 
    placeId: 1, 
    name: 'Member Entry', 
    requiredData: ['Identity'], 
    accessLevelId: 2, // VIP Member (or just Member)
    parkingRule: 'Auto-assign Member Lot',
    approvalRequired: false
  },
  { 
    id: 2, 
    placeId: 1, 
    name: 'Guest Pass', 
    requiredData: ['Identity', 'Waiver'], 
    accessLevelId: 1, // Standard Guest
    parkingRule: 'No Parking',
    approvalRequired: true
  },

  // Tech Expo Flows
  { 
    id: 3, 
    placeId: 2, 
    name: 'Attendee Entry', 
    requiredData: ['Identity', 'Ticket'], 
    accessLevelId: 1, 
    parkingRule: 'No Parking',
    approvalRequired: false
  },
  { 
    id: 4, 
    placeId: 2, 
    name: 'Exhibitor Entry', 
    requiredData: ['Identity', 'Vehicle'], 
    accessLevelId: 3, // Staff/Exhibitor
    parkingRule: 'Auto-assign Exhibitor Parking',
    approvalRequired: true
  },

  // Sunset Apartments Flows
  { 
    id: 5, 
    placeId: 3, 
    name: 'VIP Guest', 
    requiredData: ['Identity', 'Vehicle'], 
    accessLevelId: 1, 
    parkingRule: 'Reserve Visitor Zone A',
    approvalRequired: true
  },
  { 
    id: 6, 
    placeId: 3, 
    name: 'Delivery', 
    requiredData: ['Identity'], 
    accessLevelId: 4, 
    parkingRule: 'No Parking',
    approvalRequired: false
  },

  // Public Parking Flows
  { 
    id: 7, 
    placeId: 4, 
    name: 'Monthly Subscription', 
    requiredData: ['Vehicle'], 
    accessLevelId: 1, 
    parkingRule: 'Main Zone',
    approvalRequired: false
  }
];

// Entries: The live instances of access
let mockEntries = [
  { 
    id: 1, 
    placeId: 1, 
    flowId: 1, 
    identityId: 3, // Charlie VIP
    vehicleId: 2, 
    status: 'Active', 
    entryTime: '2026-01-10T08:00:00', 
    resourceUsage: ['Member Lot'] 
  },
  { 
    id: 2, 
    placeId: 2, 
    flowId: 3, 
    identityId: 1, // Alice
    vehicleId: null, 
    status: 'Checked In', 
    entryTime: '2026-01-10T09:30:00', 
    resourceUsage: [] 
  }
];

export const accessService = {
  // --- Global Layer Methods ---
  
  async getIdentities() {
    return Promise.resolve(mockIdentities);
  },

  async getGlobalAccessLevels() {
    return Promise.resolve(mockGlobalAccessLevels);
  },

  async getVehicles() {
    return Promise.resolve(mockVehicles);
  },

  // --- Place Layer Methods ---

  async getPlaces() {
    return Promise.resolve(mockPlaces);
  },

  async getPlaceById(id) {
    const place = mockPlaces.find(p => p.id == id);
    return Promise.resolve(place);
  },

  async getPlaceResources(placeId) {
    const resources = mockResources.filter(r => r.placeId == placeId);
    return Promise.resolve(resources);
  },

  // --- Flow Layer Methods ---

  async getPlaceFlows(placeId) {
    const flows = mockFlows.filter(f => f.placeId == placeId);
    return Promise.resolve(flows);
  },

  async getFlowById(id) {
    const flow = mockFlows.find(f => f.id == id);
    return Promise.resolve(flow);
  },

  // --- Entry/Request Methods ---

  async getPlaceEntries(placeId) {
    const entries = mockEntries.filter(e => e.placeId == placeId);
    // Enrich with Identity and Flow data for UI
    const enriched = entries.map(e => {
      const identity = mockIdentities.find(i => i.id === e.identityId);
      const flow = mockFlows.find(f => f.id === e.flowId);
      const vehicle = mockVehicles.find(v => v.id === e.vehicleId);
      return { ...e, identity, flow, vehicle };
    });
    return Promise.resolve(enriched);
  },

  async createEntryRequest(requestData) {
    // requestData: { placeId, flowId, identityData, vehicleData }
    console.log('Creating Entry Request:', requestData);
    
    // 1. Find or Create Identity
    let identity = mockIdentities.find(i => i.phone === requestData.identityData?.phone);
    if (!identity && requestData.identityData) {
      identity = {
        id: mockIdentities.length + 1,
        ...requestData.identityData
      };
      mockIdentities.push(identity);
    }

    // 2. Find or Create Vehicle
    let vehicle = null;
    if (requestData.vehicleData?.plate) {
      vehicle = mockVehicles.find(v => v.plate === requestData.vehicleData.plate);
      if (!vehicle) {
        vehicle = {
          id: mockVehicles.length + 1,
          identityId: identity?.id,
          ...requestData.vehicleData
        };
        mockVehicles.push(vehicle);
      }
    }

    // 3. Create Entry
    const newEntry = {
      id: mockEntries.length + 1,
      placeId: requestData.placeId,
      flowId: requestData.flowId,
      identityId: identity?.id,
      vehicleId: vehicle?.id,
      status: 'Pending',
      entryTime: new Date().toISOString(),
      resourceUsage: [] // Logic to assign parking would go here
    };
    mockEntries.push(newEntry);

    return Promise.resolve({ success: true, data: newEntry });
  }
};
