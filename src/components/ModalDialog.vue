<template>
  <transition name="modal-fade">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
      @click.self="closeModal"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 overflow-hidden">
        <!-- Modal Header -->
        <div class="flex justify-between items-center border-b border-gray-200 px-6 py-4">
          <h3 class="text-lg font-semibold text-gray-800">
            <slot name="header">Default Header</slot>
          </h3>
          <!-- Use Button component for close -->
          <Button
            variant="ghost-secondary"
            icon="pi pi-times"
            iconOnly
            iconSize="1.1rem"
            @click="closeModal"
            aria-label="Close modal"
          />
        </div>

        <!-- Modal Body -->
        <div class="px-6 py-5">
          <slot name="body">Default Body</slot>
        </div>

        <!-- Modal Footer (Optional) -->
        <div v-if="$slots.footer" class="flex justify-end space-x-3 bg-gray-50 px-6 py-4 border-t border-gray-200">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import Button from './common/Button.vue'; // <-- Import Button

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits(['close']);

const closeModal = () => {
  emit('close');
};

// Optional: Handle Escape key press to close modal
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.show) {
    closeModal();
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleEscape);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape);
});
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Optional: Add transition for the modal content itself */
.modal-fade-enter-active .bg-white,
.modal-fade-leave-active .bg-white {
    transition: transform 0.3s ease;
}
.modal-fade-enter-from .bg-white,
.modal-fade-leave-to .bg-white {
    transform: scale(0.95);
}
</style>