<template>
  <transition name="fade">
    <div
      v-if="show && message"
      :class="[
        'p-4 rounded-md border flex items-start space-x-3',
        alertClasses.bg,
        alertClasses.border,
        alertClasses.text, // Keep text color on parent for inheritance
      ]"
      role="alert"
    >
      <!-- Icon -->
      <span class="flex-shrink-0 mt-0.5">
        <i :class="['pi', alertClasses.icon]" style="font-size: 1.1rem;"></i>
      </span>
      <!-- Message -->
      <div class="flex-grow">
        <p class="text-sm font-medium">{{ message }}</p>
        <slot name="description"></slot>
      </div>
      <!-- Optional: Close Button using Button component -->
      <Button
        v-if="dismissible"
        :variant="closeButtonVariant"
        icon="pi pi-times"
        iconOnly
        iconSize="0.9rem"
        @click="dismiss"
        aria-label="Dismiss"
        class="ml-auto"
      />
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed} from 'vue';
import Button from './common/Button.vue'; // <-- Import Button
import type { ButtonVariant } from './common/Button.vue'; // <-- Import type if needed elsewhere

type AlertType = 'info' | 'success' | 'warning' | 'error';

const props = defineProps<{
  message: string | null;
  type?: AlertType;
  show?: boolean;
  dismissible?: boolean;
}>();

const emit = defineEmits(['dismiss']);

const alertType = computed<AlertType>(() => props.type || 'info');
const show = computed(() => props.show ?? true);

// Map alert type to the corresponding ghost button variant
const closeButtonVariant = computed<ButtonVariant>(() => {
  switch (alertType.value) {
    case 'success': return 'ghost-success';
    case 'warning': return 'ghost-warning';
    case 'error': return 'ghost-error'; // Use ghost-error alias
    case 'info':
    default: return 'ghost-info';
  }
});

// Keep alertClasses for the main div styling
const alertClasses = computed(() => {
  switch (alertType.value) {
    case 'success':
      return {
        bg: 'bg-green-50', border: 'border-green-400', text: 'text-green-800', icon: 'pi-check-circle',
        // closeHoverBg and closeFocusRing are now handled by Button variant
      };
    case 'warning':
      return {
        bg: 'bg-yellow-50', border: 'border-yellow-400', text: 'text-yellow-800', icon: 'pi-exclamation-triangle',
      };
    case 'error':
      return {
        bg: 'bg-red-50', border: 'border-red-400', text: 'text-red-800', icon: 'pi-times-circle',
      };
    case 'info':
    default:
      return {
        bg: 'bg-blue-50', border: 'border-blue-400', text: 'text-blue-800', icon: 'pi-info-circle',
      };
  }
});


const dismiss = () => {
  emit('dismiss');
};

</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>