<template>
  <div>
    <h1
      class="text-2xl font-bold mb-6"
      v-motion
      :initial="{ opacity: 0, y: 20 }"
      :enter="{ opacity: 1, y: 0, transition: { delay: 100 } }"
    >
      All Scripts
    </h1>

    <!-- Mobile Filter Toggle Button -->
    <div
      class="mb-4 md:hidden"
      v-motion
      :initial="{ opacity: 0, y: 20 }"
      :enter="{ opacity: 1, y: 0, transition: { delay: 150 } }"
    > <!-- Only show on mobile, margin bottom -->
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
    <!-- Conditionally hidden on mobile, always visible on md+ -->
    <div
      id="filter-controls"
      :class="{ 'hidden': !isFilterVisible }"
      class="mb-8 md:block"
      v-motion
      :initial="{ opacity: 0, y: 20 }"
      :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }"
    >
      <div class="p-4 bg-gray-50 rounded border border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
         <!-- Search Input -->
         <div class="md:col-span-1">
           <BaseInput
              id="searchQuery"
              label="Search"
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
              @change="handleSortChange"
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
              @change="handleSortChange"
              :error="null"
            />
         </div>
      </div>
    </div>

    <!-- Error State - Use AlertMessage (Fade in) -->
    <alert-message
      v-if="error"
      :message="error"
      type="error"
      :show="!!error"
      @dismiss="error = null"
      dismissible
      class="mb-6"
      v-motion
      :initial="{ opacity: 0 }"
      :enter="{ opacity: 1, transition: { delay: 250 } }"
    />

    <!-- Initial Loading State - Use Skeleton Loaders (No animation needed) -->
    <div v-if="isLoading && scripts.length === 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <!-- Render multiple skeleton cards -->
      <script-card-skeleton v-for="n in 6" :key="`skel-${n}`" />
    </div>

    <!-- Scripts List (Staggered card entrance) -->
    <!-- Note: v-motion applied to individual cards, not the container -->
    <div v-else-if="!error && scripts.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <script-card
        v-for="(script, index) in scripts"
        :key="script.id"
        :script="script"
        v-motion
        :initial="{ opacity: 0, y: 50 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 300 + index * 75 } }"
      />
    </div>

    <!-- No Scripts Found State (Fade in) -->
    <div
      v-else-if="!error && !isLoading"
      class="text-center text-gray-500 py-10"
      v-motion
      :initial="{ opacity: 0 }"
      :enter="{ opacity: 1, transition: { delay: 250 } }"
    >
      No scripts found. Why not add one?
    </div>

    <!-- Infinite Scroll Trigger / Loading More Indicator (No animation needed) -->
     <div ref="scrollSentinel" class="h-10">
        <!-- Use a spinner icon when loading more -->
        <div v-if="isLoadingMore" class="text-center text-gray-500 py-4">
            <i class="pi pi-spinner pi-spin" style="font-size: 1.5rem"></i>
        </div>
        <!-- Show 'End of results' message -->
        <div v-else-if="!isLoading && currentPage >= totalPages && scripts.length > 0" class="text-center text-gray-400 py-4 text-sm">
            End of results.
        </div>
     </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { getAllScripts } from '../services/apiService';
import type { ScriptSnip } from '../services/apiService';
import ScriptCard from '../components/ScriptCard.vue';
import AlertMessage from '../components/AlertMessage.vue';
import ScriptCardSkeleton from '../components/ScriptCardSkeleton.vue';
import BaseInput from '../components/common/BaseInput.vue';
import BaseSelect from '../components/common/BaseSelect.vue'; // <-- Import BaseSelect
import Button from '../components/common/Button.vue'; // <-- Import Button
import { debounce } from 'lodash-es';

// --- State ---
const scripts = ref<ScriptSnip[]>([]);
const isLoading = ref(false);
const isLoadingMore = ref(false);
const error = ref<string | null>(null); // State for fetch errors
const currentPage = ref(1);
const totalPages = ref(1);
const limit = ref(10);
const searchQuery = ref('');
const sortBy = ref<'title' | 'createdAt'>('createdAt');
const sortOrder = ref<'asc' | 'desc'>('desc');
const scrollSentinel = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;
const isFilterVisible = ref(false); // State for mobile filter visibility

// --- Options for Selects ---
const sortByOptions = [
  { value: 'createdAt', text: 'Date Added' },
  { value: 'title', text: 'Title' },
];

const sortOrderOptions = [
  { value: 'desc', text: 'Descending' },
  { value: 'asc', text: 'Ascending' },
];

// --- Methods ---
const fetchScripts = async (page = 1, append = false) => {
  if (append) {
    isLoadingMore.value = true;
  } else {
    isLoading.value = true;
    scripts.value = []; // Clear scripts on new search/sort
    currentPage.value = 1; // Reset page on new search/sort
  }
  error.value = null;

  try {
    // Pass search and sort parameters to the API call
    const response = await getAllScripts(
        page,
        limit.value,
        searchQuery.value || undefined,
        sortBy.value, // Pass current sortBy value
        sortOrder.value // Pass current sortOrder value
    );

    if (append) {
      scripts.value = [...scripts.value, ...response.data];
    } else {
      scripts.value = response.data;
    }
    currentPage.value = response.pagination.currentPage;
    totalPages.value = response.pagination.totalPages;
    // Optional: Update sort state from response if backend overrides/defaults
    // This ensures UI matches the actual sorting applied by the backend
    // sortBy.value = response.pagination.sortBy as 'title' | 'createdAt' || 'createdAt';
    // sortOrder.value = response.pagination.sortOrder as 'asc' | 'desc' || 'desc';

  } catch (err: any) {
    console.error("Failed to fetch scripts:", err);
    error.value = err.message || 'An unknown error occurred.';
  } finally {
     // Update loading flags first
     if (append) {
        isLoadingMore.value = false;
     } else {
        isLoading.value = false;
     }

     // --- Check if more loading is needed AFTER ANY fetch completes ---
     // Wait for the DOM to update with the new/appended scripts
     await nextTick();

     // Only proceed if not currently loading anything
     // This prevents race conditions if fetches complete very quickly
     if (!isLoading.value && !isLoadingMore.value) {
         const isScrollable = document.documentElement.scrollHeight > document.documentElement.clientHeight;
         const canLoadMore = currentPage.value < totalPages.value;

         // If the content still doesn't fill the screen AND there are more pages, load more.
         if (!isScrollable && canLoadMore) {
             // Use setTimeout to ensure this runs after the current execution context
             // and prevents potential stack overflow if checks happen too rapidly.
             setTimeout(() => {
                 // Double-check loading state before actually calling
                 if (!isLoading.value && !isLoadingMore.value) {
                    loadMoreScripts();
                 }
             }, 0);
         }
         // Otherwise, ensure the observer is correctly observing the sentinel.
         // This should happen if the page IS scrollable or if there are no more pages.
         // Re-observing handles edge cases where the sentinel might have moved.
         else if (scrollSentinel.value && observer) {
              observer.unobserve(scrollSentinel.value);
              observer.observe(scrollSentinel.value);
         }
     }
     // --- End check ---
  }
};

// Debounced fetch for search input
const debouncedFetch = debounce(() => {
    fetchScripts(1, false); // Reset to page 1, don't append
}, 500);

// Watch searchQuery and call debouncedFetch when it changes
watch(searchQuery, () => {
  debouncedFetch();
});

// Handler for sort dropdown changes
const handleSortChange = () => {
    fetchScripts(1, false); // Reset to page 1, don't append
};

// Updated loadMoreScripts to pass sort parameters
const loadMoreScripts = () => {
  // Prevent multiple concurrent loads or loading beyond the last page
  if (isLoadingMore.value || isLoading.value || currentPage.value >= totalPages.value) {
    return;
  }
  // Pass current search and sort state when loading more
  fetchScripts(currentPage.value + 1, true);
};

const setupObserver = () => {
  if (observer) observer.disconnect();
  const options = { root: null, rootMargin: '0px', threshold: 0.5 };
  observer = new IntersectionObserver((entries) => {
    const entry = entries[0];
    if (entry.isIntersecting && !isLoading.value && !isLoadingMore.value) {
      loadMoreScripts();
    }
  }, options);
  if (scrollSentinel.value) {
    observer.observe(scrollSentinel.value);
  }
};

// --- Lifecycle Hooks ---
onMounted(() => {
  fetchScripts(1);
  setupObserver();
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
  debouncedFetch.cancel();
});

// <-- ADD THIS FUNCTION DEFINITION -->
const toggleFilterVisibility = () => {
  isFilterVisible.value = !isFilterVisible.value;
};
// <-- END OF FUNCTION TO ADD -->

</script>