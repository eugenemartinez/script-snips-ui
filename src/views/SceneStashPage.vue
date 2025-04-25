<template>
  <div>
    <!-- Title and Clear Button Container -->
    <div
      class="flex justify-between items-center mb-6"
      v-motion
      :initial="{ opacity: 0, y: 20 }"
      :enter="{ opacity: 1, y: 0, transition: { delay: 100 } }"
    >
      <h1 class="text-2xl font-bold">My Scene Stash</h1>
      <!-- Clear Stash Button (v-motion applied to the button itself) -->
      <Button
        v-if="!isLoading && stashedScripts.length > 0"
        variant="ghost-danger"
        size="sm"
        icon="pi pi-trash"
        @click="showClearConfirmModal = true"
        :disabled="isClearing"
        v-motion
        :initial="{ opacity: 0 }"
        :enter="{ opacity: 1, transition: { delay: 150 } }"
      >
        Clear Stash
      </Button>
    </div>

    <!-- Mobile Filter Toggle Button -->
    <div
      class="mb-4 md:hidden"
      v-motion
      :initial="{ opacity: 0, y: 20 }"
      :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }"
    >
      <Button
        variant="secondary"
        @click="toggleFilterVisibility"
        :icon="isFilterVisible ? 'pi pi-times' : 'pi pi-filter'"
        class="w-full"
        :aria-expanded="isFilterVisible"
        aria-controls="filter-controls"
      >
        {{ isFilterVisible ? 'Hide Filters' : 'Show Filters & Sort' }}
      </Button>
    </div>

    <!-- Search and Sort Controls Container -->
    <div
      id="filter-controls"
      :class="{ 'hidden': !isFilterVisible }"
      class="mb-8 md:block"
      v-motion
      :initial="{ opacity: 0, y: 20 }"
      :enter="{ opacity: 1, y: 0, transition: { delay: 250 } }"
    >
      <div class="p-4 bg-gray-50 rounded border border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
         <!-- Search Input -->
         <div class="md:col-span-1">
           <BaseInput
              id="searchQuery"
              label="Search Stash"
              v-model="searchQuery"
              placeholder="Title, character, dialogue..."
              :error="null"
            />
         </div>
         <!-- Sort By Dropdown -->
         <div class="md:col-span-1">
           <BaseSelect
              id="sortBy"
              label="Sort By"
              v-model="sortBy"
              :options="sortByOptions"
              :error="null"
            />
         </div>
         <!-- Sort Order Dropdown -->
         <div class="md:col-span-1">
           <BaseSelect
              id="sortOrder"
              label="Order"
              v-model="sortOrder"
              :options="sortOrderOptions"
              :error="null"
            />
         </div>
      </div>
    </div>

    <!-- Loading State (No animation needed) -->
    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <script-card-skeleton v-for="n in 3" :key="`stash-skel-${n}`" />
    </div>

    <!-- Error State (Fade in) -->
    <alert-message
      v-else-if="error"
      :message="error"
      type="error"
      :show="!!error"
      @dismiss="error = null"
      dismissible
      class="mb-6"
      v-motion
      :initial="{ opacity: 0 }"
      :enter="{ opacity: 1, transition: { delay: 300 } }"
    />

    <!-- Empty Stash State - Improved Text (Fade/slide in) -->
    <div
      v-else-if="!isLoading && !error && stashedIds.length === 0"
      class="text-center text-gray-500 py-10 px-4"
      v-motion
      :initial="{ opacity: 0, y: 20 }"
      :enter="{ opacity: 1, y: 0, transition: { delay: 300 } }"
    >
       <i class="pi pi-star text-4xl text-yellow-400 mb-4"></i>
       <h3 class="text-lg font-semibold mb-2 text-gray-700">Your Stash is Empty</h3>
       <p>Add your favorite script snippets here using the <i class="pi pi-star-fill text-yellow-500"></i> icon on any script card or detail page.</p>
    </div>

    <!-- No Matching Results State (After Filtering) (Fade/slide in) -->
     <div
       v-else-if="!isLoading && !error && stashedIds.length > 0 && filteredAndSortedScripts.length === 0"
       class="text-center text-gray-500 py-10"
       v-motion
       :initial="{ opacity: 0, y: 20 }"
       :enter="{ opacity: 1, y: 0, transition: { delay: 300 } }"
     >
       No stashed scripts match your search criteria.
     </div>

    <!-- Display Stashed Scripts (Staggered card entrance) -->
    <div
      v-else-if="!isLoading && !error && filteredAndSortedScripts.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <script-card
        v-for="(script, index) in filteredAndSortedScripts"
        :key="script.id"
        :script="script"
        v-motion
        :initial="{ opacity: 0, y: 50 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 350 + index * 100 } }"
      />
    </div>

    <!-- Clear Confirmation Modal (ModalDialog handles its own transition) -->
     <modal-dialog :show="showClearConfirmModal" @close="showClearConfirmModal = false">
        <template #header>
            Confirm Clear Stash
        </template>
        <template #body>
            <p class="text-gray-700">
                Are you sure you want to remove <strong class="font-medium">all {{ stashedIds.length }} items</strong> from your Scene Stash?
                This action cannot be undone.
            </p>
             <!-- Optional: Display clearing error if needed -->
        </template>
        <template #footer>
             <Button
                variant="secondary"
                @click="showClearConfirmModal = false"
                :disabled="isClearing"
             >
                Cancel
             </Button>
             <Button
                variant="danger"
                @click="confirmClearStash"
                :loading="isClearing"
                :disabled="isClearing"
             >
                Clear All
             </Button>
        </template>
     </modal-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'; // Added computed
import { useSceneStash } from '../composables/useSceneStash';
import { getScriptsByIds } from '../services/apiService';
import type { ScriptSnip } from '../services/apiService';
import ScriptCard from '../components/ScriptCard.vue';
import AlertMessage from '../components/AlertMessage.vue';
import ScriptCardSkeleton from '../components/ScriptCardSkeleton.vue';
// --- Add Imports ---
import BaseInput from '../components/common/BaseInput.vue';
import BaseSelect from '../components/common/BaseSelect.vue';
import Button from '../components/common/Button.vue';
import ModalDialog from '../components/ModalDialog.vue'; // For confirmation
// --- End Imports ---

// Use clearAllStash from the composable
const { stashedIds, clearAllStash } = useSceneStash();

const stashedScripts = ref<ScriptSnip[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);

// --- Add State for Filters/Sort ---
const searchQuery = ref('');
const sortBy = ref<'title' | 'createdAt'>('createdAt');
const sortOrder = ref<'asc' | 'desc'>('desc');
const isFilterVisible = ref(false); // State for mobile filter visibility
// --- End Filter/Sort State ---

// --- Add State for Clear Confirmation ---
const showClearConfirmModal = ref(false);
const isClearing = ref(false); // To show loading state on confirm button
// --- End Clear Confirmation State ---


// --- Options for Selects (Same as ScriptsListPage) ---
const sortByOptions = [
  { value: 'createdAt', text: 'Date Added' },
  { value: 'title', text: 'Title' },
];
const sortOrderOptions = [
  { value: 'desc', text: 'Descending' },
  { value: 'asc', text: 'Ascending' },
];
// --- End Options ---

// --- Computed Property for Display ---
const filteredAndSortedScripts = computed(() => {
  let scriptsToDisplay = [...stashedScripts.value];

  // 1. Filter by Search Query (Client-side)
  if (searchQuery.value) {
    const lowerQuery = searchQuery.value.toLowerCase();
    scriptsToDisplay = scriptsToDisplay.filter(script =>
      script.title?.toLowerCase().includes(lowerQuery) ||
      script.characters.some(char => char.toLowerCase().includes(lowerQuery)) ||
      script.lines.some(line =>
        line.character.toLowerCase().includes(lowerQuery) ||
        line.dialogue.toLowerCase().includes(lowerQuery)
      )
    );
  }

  // 2. Sort (Client-side)
  scriptsToDisplay.sort((a, b) => {
    let valA: string | number = '';
    let valB: string | number = '';

    if (sortBy.value === 'title') {
      valA = a.title?.toLowerCase() || '';
      valB = b.title?.toLowerCase() || '';
    } else { // createdAt
      // Assuming createdAt is a string like an ISO date, direct comparison might work
      // Or convert to Date objects if needed: new Date(a.createdAt || 0).getTime()
      valA = a.createdAt || '';
      valB = b.createdAt || '';
    }

    if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1;
    return 0;
  });

  return scriptsToDisplay;
});
// --- End Computed Property ---


// --- Methods ---
const fetchStashedScripts = async () => {
  isLoading.value = true;
  error.value = null;
  stashedScripts.value = []; // Clear previous results

  const idsToFetch = stashedIds.value; // Get current IDs from the composable

  if (idsToFetch.length === 0) {
    isLoading.value = false;
    return; // Nothing to fetch
  }

  try {
    // Call the new batch fetch function with the array of IDs
    const results = await getScriptsByIds(idsToFetch);

    // The backend handles filtering, so the result is already the list of found scripts.
    // Assign the results directly.
    stashedScripts.value = results;

    // Optional: If you want the order to match the stashedIds order (localStorage)
    // you might need to re-order the results here based on idsToFetch.
    // Example re-ordering:
    // const scriptMap = new Map(results.map(script => [script.id, script]));
    // stashedScripts.value = idsToFetch.map(id => scriptMap.get(id)).filter((s): s is ScriptSnip => !!s);


  } catch (err: any) {
    // Use the error message thrown by apiService's formatError
    console.error("Error fetching stashed scripts:", err);
    error.value = err.message || 'An unexpected error occurred while loading stashed scripts.';
  } finally {
    isLoading.value = false;
  }
};

// Toggle filter visibility on mobile
const toggleFilterVisibility = () => {
  isFilterVisible.value = !isFilterVisible.value;
};

// Handle Confirming Clear Stash
const confirmClearStash = async () => {
  isClearing.value = true;
  try {
    await clearAllStash(); // Call the composable function
    // stashedScripts will update automatically via the watcher
    showClearConfirmModal.value = false; // Close modal on success
  } catch (e) {
    // Handle potential errors if clearAllStash could fail (unlikely here)
    console.error("Failed to clear stash:", e);
    // Optionally show an error message to the user
  } finally {
    isClearing.value = false;
  }
};

// --- End Methods ---


// --- Lifecycle and Watchers ---
onMounted(() => {
  fetchStashedScripts();
});

// Watch for changes in stashedIds (e.g., removing from card) and refetch
watch(stashedIds, () => {
  // Refetching might seem redundant if filtering is client-side,
  // but it ensures data consistency if the script details could change.
  // If script details are static once created, you could potentially just
  // filter the existing stashedScripts.value based on the new stashedIds.
  // For simplicity and guaranteed freshness, refetching is safer.
  fetchStashedScripts();
}, { deep: true });

// Note: No need to watch search/sort refs to trigger API calls like in ScriptsListPage
// because filtering/sorting is done client-side in the computed property.

</script>