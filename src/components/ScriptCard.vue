<template>
  <!-- Add basic Tailwind hover transitions -->
  <div
    class="relative bg-white p-4 pb-10 rounded-lg shadow border border-gray-200 hover:shadow-lg flex flex-col justify-between cursor-pointer
           transition-all duration-200 ease-out hover:scale-[1.03] hover:-translate-y-1"
    @click="goToDetails"
  >
    <!-- Top Section: Stash Button and Content -->
    <div>
      <!-- Stash Button (Top Right) - Keep @click.stop -->
      <Button
        variant="ghost-warning"
        :icon="isStashed(script.id) ? 'pi pi-star-fill' : 'pi pi-star'"
        iconOnly
        roundedFull
        iconSize="1.1rem"
        @click.stop="toggleStash"
        class="absolute top-2 right-2 z-10"
        :aria-label="isStashed(script.id) ? 'Remove from Scene Stash' : 'Add to Scene Stash'"
        title="Toggle Scene Stash"
      />

      <!-- Text Content Wrapper with spacing -->
      <div class="space-y-1 pr-8">
        <h3 class="text-lg font-semibold text-indigo-700 truncate"> <!-- Changed from text-md to text-lg -->
          {{ script.title || 'Untitled' }}
        </h3>
        <p class="text-xs text-gray-500 truncate">
          Characters: {{ script.characters.join(', ') }}
        </p>
        <p v-if="script.lines && script.lines.length > 0" class="text-sm text-gray-700 italic truncate">
          "{{ script.lines[0].dialogue }}" - {{ script.lines[0].character }}
        </p>
        <p v-else class="text-sm text-gray-500 italic">
          (No lines added yet)
        </p>
      </div>
    </div>

    <!-- Bottom Section: Replace router-link with styled span -->
    <div class="absolute bottom-3 right-4 text-right">
       <!-- Use a span styled like the link, it's not clickable itself -->
       <span class="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
          View Details &rarr;
       </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import type { ScriptSnip } from '../services/apiService';
import { useSceneStash } from '../composables/useSceneStash';
import Button from './common/Button.vue';
import { useToast } from "vue-toastification";

const props = defineProps<{
  script: ScriptSnip;
}>();

const router = useRouter();
const { isStashed, addToStash, removeFromStash } = useSceneStash();
const toast = useToast();

const toggleStash = () => {
  // Use script title for better context in toast message
  const title = props.script.title || 'Script';

  if (isStashed(props.script.id)) {
    removeFromStash(props.script.id);
    // Use toast.info for removal, consistent with ScriptDetailPage
    toast.info(`"${title}" removed from stash.`);
  } else {
    addToStash(props.script.id);
    // Keep toast.success for adding
    toast.success(`"${title}" added to stash!`);
  }
};

// Function to navigate to the detail page when the card is clicked
const goToDetails = () => {
  router.push({ name: 'ScriptDetail', params: { id: props.script.id } });
};
</script>

<style scoped>
/* No style changes needed */
</style>