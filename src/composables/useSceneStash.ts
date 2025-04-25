import { ref, watch } from 'vue';

const STASH_KEY = 'sceneStash';

// Initialize stashedIds from localStorage
const stashedIds = ref<string[]>(JSON.parse(localStorage.getItem(STASH_KEY) || '[]'));

// Watch for changes and update localStorage
watch(stashedIds, (newIds) => {
  localStorage.setItem(STASH_KEY, JSON.stringify(newIds));
}, { deep: true });

export function useSceneStash() {
  const isStashed = (id: string): boolean => {
    return stashedIds.value.includes(id);
  };

  const addToStash = (id: string) => {
    if (!isStashed(id)) {
      stashedIds.value.push(id);
    }
  };

  const removeFromStash = (id: string) => {
    stashedIds.value = stashedIds.value.filter(stashId => stashId !== id);
  };

  // --- ADD THIS FUNCTION ---
  const clearAllStash = () => {
    stashedIds.value = []; // Clear the reactive array
    // localStorage will be updated by the watcher
  };
  // --- END OF FUNCTION TO ADD ---

  return {
    stashedIds, // Expose the reactive IDs
    isStashed,
    addToStash,
    removeFromStash,
    clearAllStash // Expose the new function
  };
}