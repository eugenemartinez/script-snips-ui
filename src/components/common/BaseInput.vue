<template>
  <div>
    <label v-if="label" :for="inputId" class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
    </label>
    <input
      :id="inputId"
      :type="type"
      :value="modelValue"
      @input="onInput"
      :placeholder="placeholder"
      :required="required"
      :class="inputClasses"
      v-bind="$attrs"
    />
    <p v-if="error" class="mt-1 text-xs text-red-500">
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// Define props using withDefaults for default values
const props = withDefaults(defineProps<{
  modelValue: string | number | null; // Value for v-model
  label?: string;                     // Optional label text
  id?: string;                        // Input ID
  type?: string;                      // Input type (text, password, email, etc.)
  placeholder?: string;               // Placeholder text
  required?: boolean;                 // Is the field required?
  error?: string | null;              // Error message to display
}>(), {
  type: 'text',                       // Default type to 'text'
  required: false,
  error: null,
});

// Define the emit for v-model updates
const emit = defineEmits(['update:modelValue']);

// Generate a unique ID if none is provided (useful for label association)
const inputId = computed(() => props.id || `base-input-${Math.random().toString(36).substring(7)}`);

// Compute input classes based on error state
const inputClasses = computed(() => [
  'mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm',
  props.error
    ? 'border-red-500 focus:ring-red-500 focus:border-red-500' // Error state
    : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500', // Normal state
]);

// Handle input event and emit update
const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.value);
};
</script>

<style scoped>
/* Add any component-specific styles if needed */
</style>