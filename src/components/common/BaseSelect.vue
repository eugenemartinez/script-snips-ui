<template>
  <div>
    <label v-if="label" :for="selectId" class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
    </label>
    <select
      :id="selectId"
      :value="modelValue"
      @change="onChange"
      :required="required"
      :class="selectClasses"
      v-bind="$attrs"
    >
      <!-- Optional: Placeholder/Disabled Option -->
      <option v-if="placeholder" disabled value="">{{ placeholder }}</option>
      <!-- Dynamic Options -->
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.text }}
      </option>
    </select>
    <p v-if="error" class="mt-1 text-xs text-red-500">
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// Define the structure for an option
interface SelectOption {
  value: string | number;
  text: string;
}

// Define props
const props = withDefaults(defineProps<{
  modelValue: string | number | null; // Value for v-model
  options: SelectOption[];            // Array of options { value: '', text: '' }
  label?: string;                     // Optional label text
  id?: string;                        // Select ID
  placeholder?: string;               // Optional placeholder text (for disabled option)
  required?: boolean;                 // Is the field required?
  error?: string | null;              // Error message to display
}>(), {
  required: false,
  error: null,
  options: () => [], // Default options to an empty array
});

// Define the emit for v-model updates
const emit = defineEmits(['update:modelValue']);

// Generate a unique ID if none is provided
const selectId = computed(() => props.id || `base-select-${Math.random().toString(36).substring(7)}`);

// Compute select classes based on error state
const selectClasses = computed(() => [
  'mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm bg-white cursor-pointer', // Added bg-white and cursor-pointer
  props.error
    ? 'border-red-500 focus:ring-red-500 focus:border-red-500' // Error state
    : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500', // Normal state
]);

// Handle change event and emit update
const onChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  emit('update:modelValue', target.value);
};
</script>

<style scoped>
/* Add any component-specific styles if needed */
</style>