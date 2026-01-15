/**
 * Simple global state for App Layer
 */
import { reactive, watch } from 'vue';

const STATE_KEY = 'accesseasy_app_layer_state';

const storedState = localStorage.getItem(STATE_KEY);
const initialState = storedState ? JSON.parse(storedState) : {
    selectedPlaceId: null,
    selectedPlaceName: 'All Places'
};

export const appState = reactive(initialState);

watch(
    () => appState,
    (newState) => {
        localStorage.setItem(STATE_KEY, JSON.stringify(newState));
    },
    { deep: true }
);

export const setPlace = (id, name) => {
    appState.selectedPlaceId = id;
    appState.selectedPlaceName = name || 'All Places';
};
