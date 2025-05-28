<template>
    <div>
      <!-- Updated Heading -->
      <h1
        class="text-2xl font-bold mb-4 text-center text-indigo-700"
        v-motion
        :initial="{ opacity: 0, y: 50 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 100 } }"
      >
        <i class="pi pi-file-edit mr-2 align-middle" style="font-size: 1.3em;"></i>
        Welcome to Script Snips!
      </h1>
      <!-- Enhanced Introductory Text -->
      <p
        class="text-center text-gray-600 mb-8 max-w-xl mx-auto"
        v-motion
        :initial="{ opacity: 0, y: 50 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }"
      >
        Your personal space to capture, organize, and revisit those brilliant moments of dialogue and action from your fictional scripts. Never lose a great line again!
      </p>
  
      <!-- Action Buttons -->
      <div
        class="flex flex-col space-y-4 items-center mb-12 md:flex-row md:justify-center md:space-y-0 md:space-x-4"
        v-motion
        :initial="{ opacity: 0, y: 50 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 300 } }"
      >
        <!-- Add New Script Button -->
        <Button variant="primary" @click="openAddScriptModal" class="w-full md:w-auto">
          Add New Script
        </Button>
        <!-- View All Scripts Button -->
        <Button variant="secondary" @click="goToAllScripts" class="w-full md:w-auto">
          View All Scripts
        </Button>
        <!-- Random Script Button -->
        <Button variant="success" @click="fetchRandomScript" :loading="isLoadingRandom" :disabled="isLoadingRandom" class="w-full md:w-auto">
          Go to a Random Script
        </Button>
      </div>
  
      <!-- Random Script Fetch Error (No animation needed here usually) -->
      <alert-message
        :message="randomScriptFetchError"
        type="error"
        :show="!!randomScriptFetchError && !isLoadingRandom"
        @dismiss="randomScriptFetchError = null"
        dismissible
        class="mb-6"
      />
  
  
      <!-- Carousel Section -->
      <div class="mt-12">
          <!-- Updated Carousel Title -->
          <h2
            class="text-xl font-semibold mb-6 text-center text-gray-700"
            v-motion
            :initial="{ opacity: 0, y: 50 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 400 } }"
          >
            Recently Added & Random Snippets
          </h2>
  
          <!-- Carousel Loading State (No animation needed) -->
          <div v-if="isLoadingCarousel" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
             <script-card-skeleton v-for="n in CAROUSEL_COUNT" :key="`carousel-skel-${n}`" />
          </div>
  
          <!-- Carousel Error State (No animation needed) -->
          <alert-message
            v-else-if="carouselError"
            :message="carouselError"
            type="warning"
            :show="!!carouselError"
            @dismiss="carouselError = null"
            dismissible
            class="mb-6"
          />
  
          <!-- Carousel Display (Animate individual cards) -->
          <div
            v-else-if="!carouselError && carouselScripts.length > 0"
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
          >
              <!-- Apply motion to each card -->
              <script-card
                  v-for="(script, index) in carouselScripts"
                  :key="script.id"
                  :script="script"
                  v-motion
                  :initial="{ opacity: 0, y: 50 }"
                  :enter="{ opacity: 1, y: 0, transition: { delay: 500 + index * 100 } }"
              />
          </div>
  
          <!-- Carousel Empty State (Can add subtle fade) -->
          <div
            v-else-if="!carouselError && !isLoadingCarousel"
            class="text-center text-gray-500 py-6"
            v-motion
            :initial="{ opacity: 0 }"
            :enter="{ opacity: 1, transition: { delay: 500 } }"
          >
              No snippets to display currently. Add some!
          </div>
      </div>
      <!-- End Carousel Section -->
  
      <!-- Add Script Modal (ModalDialog handles its own transition) -->
      <modal-dialog :show="showAddScriptModal" @close="closeAddScriptModal">
        <template #header>
          Add New Script Snippet
        </template>
        <template #body>
          <add-script-form
            @submit="handleFormSubmit"
            @cancel="closeAddScriptModal"
            @dismiss-error="formSubmissionError = null"
            :is-submitting-external="isSubmittingForm"
            :error="formSubmissionError"
            submit-button-text="Create Script"
          />
        </template>
      </modal-dialog>
  
    </div>
  </template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'; // Make sure ref is imported
import { useRouter } from 'vue-router';
// API Service
import { getRandomScript, createScript, getRandomScripts } from '../services/apiService';
import type { ScriptSnip, ScriptFormData } from '../services/apiService';
// Components
import ModalDialog from '../components/ModalDialog.vue';
import AddScriptForm from '../components/AddScriptForm.vue';
import ScriptCard from '../components/ScriptCard.vue';
import AlertMessage from '../components/AlertMessage.vue';
import ScriptCardSkeleton from '../components/ScriptCardSkeleton.vue';
import Button from '../components/common/Button.vue'; // <-- Import Button
// Toast
import { useToast } from "vue-toastification";

const router = useRouter();
const toast = useToast();

// --- State ---

// Random Script Feature State (Simplified)
const isLoadingRandom = ref(false);
const randomScriptFetchError = ref<string | null>(null); // New state for fetch errors

// Add Script Modal Feature
const showAddScriptModal = ref(false);
const isSubmittingForm = ref(false);
const formSubmissionError = ref<string | null>(null);

// --- Carousel State ---
const carouselScripts = ref<ScriptSnip[]>([]);
const isLoadingCarousel = ref(false);
const carouselError = ref<string | null>(null);
const carouselInterval = ref<ReturnType<typeof setInterval> | null>(null);
const CAROUSEL_REFRESH_INTERVAL = 30000; // Refresh every 30 seconds
const CAROUSEL_COUNT = 3; // Number of scripts to fetch

// --- Methods ---

// Modal Control
const openAddScriptModal = () => {
  formSubmissionError.value = null;
  showAddScriptModal.value = true;
};

const closeAddScriptModal = () => {
  showAddScriptModal.value = false;
};

// Navigation
const goToAllScripts = () => {
  router.push('/scripts');
};

// Random Script Fetching and Navigation
const fetchRandomScript = async () => {
  isLoadingRandom.value = true;
  randomScriptFetchError.value = null; // Clear previous fetch error
  try {
    const script = await getRandomScript();
    if (script && script.id) {
        router.push({ name: 'ScriptDetail', params: { id: script.id } });
    } else {
        // This case might indicate an unexpected API response format
        throw new Error("Received invalid script data from server.");
    }
  } catch (error: any) {
    console.error("Failed to fetch or navigate to random script:", error);
     // Check for specific error message from backend (via apiService)
     if (error.message && error.message.includes('No scripts available')) {
         randomScriptFetchError.value = "No scripts found in the database yet.";
         // alert("No scripts found in the database yet."); // <-- Remove alert
         toast.info("No scripts found in the database yet."); // <-- Use toast.info
    } else {
        randomScriptFetchError.value = error.message || 'Could not load a random script.';
        // alert(`Error: ${randomScriptFetchError.value}`); // <-- Remove alert
        toast.error(`Error: ${randomScriptFetchError.value}`); // <-- Use toast.error
    }
  } finally {
    isLoadingRandom.value = false;
  }
};

// --- Carousel Methods ---
const fetchCarouselScripts = async () => {
    // Don't show loading indicator on subsequent interval refreshes, only initial load
    if (carouselScripts.value.length === 0) {
        isLoadingCarousel.value = true;
    }
    carouselError.value = null; // Clear previous error on fetch attempt
    try {
        // Call the API function from apiService
        const scripts = await getRandomScripts(CAROUSEL_COUNT);
        carouselScripts.value = scripts;
    } catch (err: any) {
        console.error("Failed to fetch carousel scripts:", err);
        // Handle 404 specifically if backend sends it for "no scripts available"
        if (err.message && err.message.toLowerCase().includes('no scripts available')) {
             carouselError.value = null; // Don't show error, just empty state
             carouselScripts.value = []; // Ensure it's empty
        } else {
            carouselError.value = err.message || 'Could not load featured snippets.';
            // Optionally clear scripts on error, or keep stale data? Clearing is safer.
            // carouselScripts.value = [];
        }
        // Optionally show a toast for carousel errors too
        // if (carouselError.value) {
        //     toast.warning(`Could not refresh featured snippets: ${carouselError.value}`);
        // }
    } finally {
        isLoadingCarousel.value = false; // Ensure loading is false after fetch attempt
    }
};

// --- Form Submission Handling ---

// Use the imported ScriptFormData for the formData parameter type hint
const handleFormSubmit = async (formData: ScriptFormData) => {
  isSubmittingForm.value = true;
  formSubmissionError.value = null;
  try {
    const newScript = await createScript(formData);
    showAddScriptModal.value = false;
    toast.success('Script added successfully!');
    router.push(`/scripts/${newScript.id}`);
  } catch (error: any) {
    console.error("Failed to submit script:", error);
    let displayMessage = error.message || 'Failed to add script. Please try again.';

    // Check for the specific backend message to customize it
    if (error.message && error.message.includes("Database limit reached")) {
      displayMessage = "We're unable to add new scripts at this time as our system is at full capacity. Please try again later.";
    }

    formSubmissionError.value = displayMessage;
    toast.error(displayMessage); // Use the (potentially customized) displayMessage directly for the toast
  } finally {
    isSubmittingForm.value = false;
  }
};

// --- Lifecycle Hooks ---
onMounted(() => {
    fetchCarouselScripts(); // Fetch initial set of carousel scripts

    // Set up interval to refresh the carousel scripts periodically
    carouselInterval.value = setInterval(() => {
        fetchCarouselScripts();
    }, CAROUSEL_REFRESH_INTERVAL);
});

onUnmounted(() => {
    // Clear interval when component is unmounted to prevent memory leaks
    if (carouselInterval.value) {
        clearInterval(carouselInterval.value);
    }
});

</script>