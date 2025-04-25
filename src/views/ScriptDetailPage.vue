<template>
  <div>
    <!-- Back Button -->
     <Button
        variant="link"
        @click="goBack"
        class="mb-6"
        v-motion
        :initial="{ opacity: 0, x: -20 }"
        :enter="{ opacity: 1, x: 0, transition: { delay: 100 } }"
     >
        &larr; Back to List
     </Button>

    <!-- Loading State - Use Skeleton (No animation needed) -->
    <script-detail-skeleton v-if="isLoading" />

    <!-- Error State (Fetch Error) - Use AlertMessage (Fade in) -->
    <alert-message
      v-else-if="error && !script"
      :message="error"
      type="error"
      :show="!!error && !script"
      @dismiss="error = null"
      dismissible
      class="mb-6"
      v-motion
      :initial="{ opacity: 0 }"
      :enter="{ opacity: 1, transition: { delay: 200 } }"
    />

    <!-- Script Display Area (Fade/slide in as a whole block) -->
    <div
      v-else-if="script"
      class="bg-white p-6 md:p-8 rounded-lg shadow-md border border-gray-200"
      v-motion
      :initial="{ opacity: 0, y: 30 }"
      :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }"
    >
      <!-- Title -->
      <div class="mb-4">
        <h1 class="text-2xl md:text-3xl font-bold text-indigo-700">
          {{ script.title || 'Untitled Script' }}
        </h1>
      </div>

      <!-- Characters -->
      <div class="mb-4">
         <p class="text-sm text-gray-500">
           Characters: {{ script.characters.join(', ') }}
         </p>
      </div>

      <!-- Lines (Script Format with Colors) -->
      <!-- Increased space-y from 4 to 6 -->
      <div class="mt-6 space-y-6 font-mono text-sm md:text-base">
         <div v-for="(line, index) in script.lines" :key="`disp-${index}`">
           <!-- Character Name: Centered, Uppercase, Colored -->
           <div
             :class="[
               'text-center uppercase font-semibold mb-2', // Increased mb from 1 to 2
               getCharacterColor(line.character)
             ]"
           >
             {{ line.character }}
           </div>
           <!-- Dialogue: Indented and Centered -->
           <div class="text-center ml-12 mr-12 text-gray-800">
             {{ line.dialogue }}
           </div>
         </div>
      </div>

       <!-- Delete Error Display - Use AlertMessage (Fade in if it appears later) -->
       <alert-message
         :message="deleteError"
         type="error"
         :show="!!deleteError"
         @dismiss="deleteError = null"
         dismissible
         class="mt-6"
         v-motion-fade
       />

       <!-- Action Buttons (Fade/slide up as a group) -->
       <div
         class="mt-8 pt-4 border-t border-gray-200 flex flex-col space-y-3 md:flex-row md:justify-end md:items-center md:space-y-0 md:space-x-3"
         v-motion
         :initial="{ opacity: 0, y: 20 }"
         :enter="{ opacity: 1, y: 0, transition: { delay: 300 } }"
       >

            <!-- Scene Stash Toggle Button with Text -->
            <Button
                :variant="isStashed(script.id) ? 'warning' : 'secondary'"
                :icon="isStashed(script.id) ? 'pi pi-star-fill' : 'pi pi-star'"
                :roundedFull="false"
                iconSize="1.1rem"
                @click="toggleStash"
                :disabled="isDeleting || isLoadingRandom"
                :aria-label="isStashed(script.id) ? 'Remove from Scene Stash' : 'Add to Scene Stash'"
                title="Toggle Scene Stash"
                class="w-full md:w-auto"
            >
              {{ isStashed(script.id) ? 'Stashed' : 'Stash' }}
            </Button>

            <!-- Edit Button -->
            <Button
                variant="primary"
                icon="pi pi-pencil"
                @click="openEditModal"
                :disabled="isDeleting || isLoadingRandom"
                class="w-full md:w-auto"
            >
                Edit
            </Button>

            <!-- Delete Button -->
            <Button
                variant="danger"
                icon="pi pi-trash"
                @click="handleDelete"
                :loading="isDeleting"
                :disabled="isDeleting || isLoadingRandom"
                class="w-full md:w-auto"
            >
                Delete
            </Button>

            <!-- Go to Random Script Button -->
            <Button
                variant="success"
                icon="pi pi-sync"
                @click="goToRandomScript"
                :loading="isLoadingRandom"
                :disabled="isLoadingRandom || isDeleting"
                class="w-full md:w-auto"
            >
                Random Script
            </Button>
       </div>
    </div>

     <!-- Fallback (Fade in) -->
     <div
       v-else
       class="text-center text-gray-500 py-10"
       v-motion
       :initial="{ opacity: 0 }"
       :enter="{ opacity: 1, transition: { delay: 200 } }"
     >
        Script not found or could not be loaded.
     </div>

     <!-- Edit Script Modal (ModalDialog handles its own transition) -->
     <modal-dialog :show="showEditScriptModal" @close="closeEditScriptModal">
        <template #header>
            Edit Script Snippet
        </template>
        <template #body>
            <!-- Embed AddScriptForm, passing initial data and handling events -->
            <add-script-form
                v-if="initialEditData"
                :initial-data="initialEditData"
                :is-submitting-external="isSaving"
                :error="editError"
                @submit="handleUpdateSubmit"
                @cancel="closeEditScriptModal"
                @dismiss-error="editError = null"
                submit-button-text="Save Changes"
            />
            <!-- Optional: Show loading indicator if initialEditData is preparing -->
            <div v-else class="text-center p-4">Loading form...</div>
        </template>
     </modal-dialog>

     <!-- Delete Confirmation Modal (ModalDialog handles its own transition) -->
     <modal-dialog :show="showDeleteConfirmModal" @close="showDeleteConfirmModal = false">
        <template #header>
            Confirm Deletion
        </template>
        <template #body>
            <p class="text-gray-700">
                Are you sure you want to delete
                <strong class="font-medium">{{ script?.title || 'this script' }}</strong>?
                This action cannot be undone.
            </p>
             <!-- Display delete error within the confirmation modal if desired -->
             <div v-if="deleteError" class="mt-3 text-red-600 text-sm">
                Error: {{ deleteError }}
             </div>
        </template>
        <template #footer>
             <!-- Cancel Button -->
             <Button
                variant="secondary"
                @click="showDeleteConfirmModal = false"
                :disabled="isDeleting"
             >
                Cancel
             </Button>
             <!-- Confirm Delete Button -->
             <Button
                variant="danger"
                @click="confirmDelete"
                :loading="isDeleting"
                :disabled="isDeleting"
             >
                Confirm Delete <!-- Remove conditional text -->
             </Button>
        </template>
     </modal-dialog>

  </div>
</template>

<script setup lang="ts">
// Make sure 'watch' is imported from 'vue'
import { ref, onMounted, watch } from 'vue'; // Make sure computed is imported if not already
import { useRouter } from 'vue-router';
// API Service
import { getScriptById, updateScript, deleteScript, getRandomScript } from '../services/apiService';
import type { ScriptSnip, ScriptFormData } from '../services/apiService';
// Components
import ModalDialog from '../components/ModalDialog.vue';
import AddScriptForm from '../components/AddScriptForm.vue';
import AlertMessage from '../components/AlertMessage.vue';
import ScriptDetailSkeleton from '../components/ScriptDetailSkeleton.vue';
import Button from '../components/common/Button.vue'; // <-- Import Button
// Composables
import { useSceneStash } from '../composables/useSceneStash';
// Toast
import { useToast } from "vue-toastification";

// Define props
const props = defineProps<{
  id: string;
}>();

const router = useRouter();
const toast = useToast();

// --- State ---
const script = ref<ScriptSnip | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null); // For fetch errors
const showEditScriptModal = ref(false);
const isSaving = ref(false);
const editError = ref<string | null>(null); // This state will be cleared by the event
const isDeleting = ref(false);
const deleteError = ref<string | null>(null); // For delete action errors
const showDeleteConfirmModal = ref(false);
const initialEditData = ref<ScriptFormData | null>(null);
const { isStashed, addToStash, removeFromStash } = useSceneStash();
const isLoadingRandom = ref(false); // <-- Add state for random button loading

// --- Color Palette for Characters ---
const characterColors = [
  'text-blue-600',
  'text-green-600',
  'text-purple-600',
  'text-red-600',
  'text-teal-600',
  'text-pink-600',
  'text-orange-600',
];

// --- Function to get color based on character name ---
const getCharacterColor = (characterName: string): string => {
  if (!script.value || !script.value.characters) {
    return 'text-gray-700'; // Default color if script/characters not loaded
  }
  const index = script.value.characters.findIndex(char => char === characterName);
  if (index === -1) {
    return 'text-gray-700'; // Default for characters not explicitly listed (shouldn't happen ideally)
  }
  // Use modulo operator to cycle through colors if more characters than colors
  return characterColors[index % characterColors.length];
};


// --- Methods ---

const fetchScriptDetails = async () => {
  isLoading.value = true;
  error.value = null;
  script.value = null;
  try {
    script.value = await getScriptById(props.id);
  } catch (err: any) {
    console.error(`Failed to fetch script with ID ${props.id}:`, err);
    error.value = err.message || 'An unknown error occurred.';
    if (err.message.toLowerCase().includes('not found')) {
        error.value = `Script with ID "${props.id}" was not found.`;
    }
    // Optionally show fetch error as toast too
    // toast.error(`Error loading script: ${error.value}`);
  } finally {
    isLoading.value = false;
  }
};

const goBack = () => {
  if (window.history.length > 1) {
      router.go(-1);
  } else {
      router.push('/scripts');
  }
};

// --- Edit Modal Methods ---

const openEditModal = () => {
  if (!script.value) return;
  // Prepare data matching ScriptFormData structure
  initialEditData.value = {
    title: script.value.title || '', // Handle null title from DB if needed
    characters: [...script.value.characters],
    lines: script.value.lines.map(line => ({ ...line })) // Deep copy lines
  };
  editError.value = null;
  showEditScriptModal.value = true;
};

const closeEditScriptModal = () => {
  showEditScriptModal.value = false;
  initialEditData.value = null; // Clear initial data when closing
};

const handleUpdateSubmit = async (formData: ScriptFormData) => {
  if (!script.value) return;
  isSaving.value = true;
  editError.value = null;
  try {
    // updateScript now expects the imported ScriptFormData type
    const updatedScript = await updateScript(props.id, formData);
    script.value = updatedScript; // Update local script data
    closeEditScriptModal();
    toast.success('Script updated successfully.');
  } catch (err: any) {
    console.error(`Failed to update script ${props.id}:`, err);
    editError.value = err.message || 'Failed to save changes.';
    toast.error(`Error updating script: ${editError.value}`);
  } finally {
    isSaving.value = false;
  }
};

// --- Delete Methods ---

const handleDelete = () => {
  if (!script.value) return;
  // Instead of window.confirm, open the modal
  deleteError.value = null; // Clear previous errors
  showDeleteConfirmModal.value = true;
};

// --- Add New Method for Actual Deletion ---

const confirmDelete = async () => {
  if (!script.value) return;

  showDeleteConfirmModal.value = false; // Close the modal first
  isDeleting.value = true;
  deleteError.value = null;

  try {
    await deleteScript(props.id);
    toast.success('Script deleted successfully.');
    router.push('/scripts'); // Navigate after success

  } catch (err: any) {
    console.error(`Failed to delete script with ID ${props.id}:`, err);
    deleteError.value = err.message || 'Failed to delete script.';
    toast.error(`Error deleting script: ${deleteError.value}`);
    // Keep the deleteError ref so it can optionally be displayed near the button if needed
  } finally {
    isDeleting.value = false;
  }
};

// --- Add New Method for Random Navigation ---

const goToRandomScript = async () => {
  isLoadingRandom.value = true;
  try {
    const randomScript = await getRandomScript();
    if (randomScript && randomScript.id) {
      // Navigate to the detail page of the random script
      // Use router.push to add to history, allowing 'back'
      router.push({ name: 'ScriptDetail', params: { id: randomScript.id } });
      // Note: The page will automatically refetch details in onMounted
      // If navigating to the *same* ID, Vue Router might not trigger a full remount by default.
      // Consider adding a watch on props.id to explicitly call fetchScriptDetails if needed,
      // but for random navigation, it's less likely to hit the same ID immediately.
    } else {
      toast.warning("Could not find a random script to navigate to.");
    }
  } catch (err: any) {
    console.error("Failed to fetch random script:", err);
    toast.error(err.message || "Error fetching a random script.");
  } finally {
    isLoadingRandom.value = false;
  }
};

// --- Scene Stash Method ---

const toggleStash = () => {
  if (!script.value) return;

  const currentlyStashed = isStashed(script.value.id);
  if (currentlyStashed) {
    removeFromStash(script.value.id);
    toast.info(`"${script.value.title || 'Script'}" removed from stash.`); // <-- Add stash feedback
  } else {
    addToStash(script.value.id);
    toast.success(`"${script.value.title || 'Script'}" added to stash!`); // <-- Add stash feedback
  }
};

// --- Lifecycle Hooks & Watchers ---

onMounted(() => {
  fetchScriptDetails();
});

// Watch for changes in the route parameter 'id'
watch(() => props.id, (newId, oldId) => {
  // Refetch script details when the ID prop changes
  // Avoid refetching if the ID hasn't actually changed (e.g., initial load handled by onMounted)
  if (newId && newId !== oldId) {
    console.log(`Route ID changed from ${oldId} to ${newId}, refetching...`); // Optional logging
    fetchScriptDetails();
  }
});

</script>