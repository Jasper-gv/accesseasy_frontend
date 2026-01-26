import { ref, computed } from 'vue';

const STORAGE_KEY = 'access_easy_selected_modules';

const availableModules = [
  {
    id: 'visitor',
    title: 'Visitor Management',
    description: 'Manage visitor entries, exits, and passes.',
    icon: 'mdi-account-clock',
    color: 'blue',
    route: '/apps/visitor',
    image: 'https://cdn.vuetifyjs.com/images/cards/house.jpg',
    status: 'Active',
    summary: 'Manage visitor logs and access passes efficiently.'
  },
  {
    id: 'parking',
    title: 'Parking Management',
    description: 'Monitor parking slots and vehicle entries.',
    icon: 'mdi-car',
    color: 'green',
    route: '/apps/parking',
    image: 'https://cdn.vuetifyjs.com/images/cards/road.jpg',
    status: 'Active',
    summary: 'Track vehicle entries and parking slot availability.'
  },
  {
    id: 'canteen',
    title: 'Canteen Management',
    description: 'Handle food ordering and canteen operations.',
    icon: 'mdi-food',
    color: 'orange',
    route: '/apps/canteen',
    image: 'https://cdn.vuetifyjs.com/images/cards/cooking.png',
    status: 'Active',
    summary: 'Manage menu items, orders, and canteen flow.'
  },
  {
    id: 'membership',
    title: 'Membership Management',
    description: 'Manage memberships, plans, and renewals.',
    icon: 'mdi-card-account-details',
    color: 'purple',
    route: '/apps/places/membership',
    image: 'https://cdn.vuetifyjs.com/images/cards/sunshine.jpg',
    status: 'Active',
    summary: 'Oversee member details and subscription plans.'
  }
];

const selectedModules = ref([]);
const hasSelectedModules = ref(false);

// Initialize state from local storage
const initModules = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      selectedModules.value = JSON.parse(saved);
      if (selectedModules.value.length > 0) {
        hasSelectedModules.value = true;
      }
    } catch (e) {
      console.error('Failed to parse saved modules', e);
    }
  }
};

// Call init immediately
initModules();

export function useModules() {
  const toggleModule = (id) => {
    const index = selectedModules.value.indexOf(id);
    if (index === -1) {
      selectedModules.value.push(id);
    } else {
      selectedModules.value.splice(index, 1);
    }
  };

  const saveSelection = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedModules.value));
    hasSelectedModules.value = true;
  };

  const editModules = () => {
    hasSelectedModules.value = false;
  };
  
  const hasModule = (id) => {
      return selectedModules.value.includes(id);
  };

  return {
    availableModules,
    selectedModules,
    hasSelectedModules,
    toggleModule,
    saveSelection,
    editModules,
    hasModule
  };
}
