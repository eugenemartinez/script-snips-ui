<template>
  <button
    :type="type"
    :class="buttonClasses"
    :disabled="isDisabled"
  >
    <!-- Loading Spinner -->
    <i v-if="loading" class="pi pi-spin pi-spinner" :class="[iconClasses, { 'mr-2': !iconOnly }]"></i>
    <!-- Icon (shown only when not loading) -->
    <i v-else-if="icon" :class="[icon, iconClasses, { 'mr-2': !iconOnly }]"></i>
    <!-- Slot for text content -->
    <span> <!-- Removed conditional margin, handled by icon/spinner margin -->
      <slot></slot>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export type ButtonVariant =
  | 'primary' | 'secondary' | 'danger' | 'warning' | 'link' | 'success'
  | 'ghost-danger' | 'ghost-warning' | 'ghost-info' | 'ghost-success' | 'ghost-error'
  | 'ghost-secondary';
export type ButtonType = 'button' | 'submit' | 'reset';

const props = withDefaults(defineProps<{
  variant?: ButtonVariant;
  type?: ButtonType;
  disabled?: boolean;
  loading?: boolean; // Added loading prop
  icon?: string;
  iconOnly?: boolean;
  roundedFull?: boolean;
  iconSize?: string;
}>(), {
  variant: 'primary',
  type: 'button',
  disabled: false,
  loading: false, // Default loading to false
  icon: undefined,
  iconOnly: false,
  roundedFull: false,
  iconSize: undefined,
});

// Computed property for disabled state (considers both props.disabled and props.loading)
const isDisabled = computed(() => props.disabled || props.loading);

// Base classes - Added hover scale/translate and active scale
const baseClasses = 'inline-flex items-center justify-center text-sm font-medium rounded-md shadow-sm focus:outline-none transition duration-150 ease-in-out cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] hover:-translate-y-px active:scale-[.98]';

// Variant-specific classes
const variantClasses = computed(() => {
  let padding = props.iconOnly ? 'p-1.5' : 'px-4 py-2';
  const defaultFocus = 'focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500';

  switch (props.variant) {
    // Standard Variants (keep default focus)
    case 'secondary':
      return `${padding} ${defaultFocus} border border-gray-300 bg-white text-gray-700 hover:bg-gray-50`;
    case 'danger':
      return `${padding} ${defaultFocus} border border-transparent bg-red-500 text-white hover:bg-red-600 focus:ring-red-500`; // Keep specific focus ring
    case 'warning':
      return `${padding} ${defaultFocus} border border-transparent bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500`; // Keep specific focus ring
    case 'success':
      return `${padding} ${defaultFocus} border border-transparent bg-green-600 text-white hover:bg-green-700 focus:ring-green-500`; // Keep specific focus ring
    case 'primary':
    default:
      return `${padding} ${defaultFocus} border border-transparent bg-indigo-600 text-white hover:bg-indigo-700`; // Default focus applied

    // Link/Ghost Variants (custom/no focus or specific focus)
    case 'link':
      return `${props.iconOnly ? 'p-1' : ''} ${defaultFocus} text-indigo-600 hover:text-indigo-800 shadow-none border-none bg-transparent`;
    case 'ghost-danger':
      // Use specific focus from alert classes
      return `p-1.5 text-red-800 hover:bg-red-100 focus:ring-2 focus:ring-offset-2 focus:ring-red-600 focus:ring-offset-red-50 shadow-none border-none bg-transparent rounded`;
    case 'ghost-warning':
       // Use specific focus from alert classes
      return `p-1.5 text-yellow-800 hover:bg-yellow-100 focus:ring-2 focus:ring-offset-2 focus:ring-yellow-600 focus:ring-offset-yellow-50 shadow-none border-none bg-transparent rounded`;
    // New Alert Ghost Variants
    case 'ghost-info':
      return `p-1.5 text-blue-800 hover:bg-blue-100 focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 focus:ring-offset-blue-50 shadow-none border-none bg-transparent rounded`;
    case 'ghost-success':
      return `p-1.5 text-green-800 hover:bg-green-100 focus:ring-2 focus:ring-offset-2 focus:ring-green-600 focus:ring-offset-green-50 shadow-none border-none bg-transparent rounded`;
    case 'ghost-error': // Alias for ghost-danger for consistency
       return `p-1.5 text-red-800 hover:bg-red-100 focus:ring-2 focus:ring-offset-2 focus:ring-red-600 focus:ring-offset-red-50 shadow-none border-none bg-transparent rounded`;
    // New Ghost Secondary Variant (for modal close)
    case 'ghost-secondary':
       return `p-1.5 text-gray-500 hover:bg-gray-100 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-none border-none bg-transparent rounded`; // Using indigo focus ring for consistency

  }
});


// Combine base and variant classes, add loading styles
const buttonClasses = computed(() => {
  let combined = `${baseClasses} ${variantClasses.value}`;
  const ghostVariants: ButtonVariant[] = ['link', 'ghost-danger', 'ghost-warning', 'ghost-info', 'ghost-success', 'ghost-error', 'ghost-secondary']; // Added ghost-secondary

  if (ghostVariants.includes(props.variant ?? 'primary')) {
      combined = combined.replace('shadow-sm', '');
  }
  if (props.roundedFull) {
      combined = combined.replace('rounded-md', 'rounded-full');
  }
  if (ghostVariants.includes(props.variant ?? 'primary') && !props.roundedFull && !combined.includes('rounded')) {
      combined += ' rounded';
  }

  // Add loading specific class
  if (props.loading) {
      combined += ' cursor-wait';
  }

  return combined;
});

// Classes specifically for the icon/spinner element
const iconClasses = computed(() => {
    return props.iconSize ? `font-size: ${props.iconSize}` : '';
});

</script>