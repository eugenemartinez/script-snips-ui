<template>
  <header class="bg-white shadow-md relative"> <!-- Added relative positioning -->
    <nav class="container mx-auto px-4 py-3 flex justify-between items-center">
      <!-- Logo -->
      <router-link to="/" class="text-xl font-bold text-indigo-600 hover:text-indigo-800" @click="closeMobileMenu">
        Script Snips
      </router-link>

      <!-- Desktop Links (Hidden on Mobile) -->
      <div class="hidden md:flex space-x-4">
        <router-link
          to="/"
          class="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
          active-class="text-indigo-700 bg-indigo-100"
        >
          Home
        </router-link>
        <router-link
          to="/scripts"
          class="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
          active-class="text-indigo-700 bg-indigo-100"
        >
          All Scripts
        </router-link>
        <router-link
          to="/scene-stash"
          class="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
          active-class="text-indigo-700 bg-indigo-100"
        >
          Scene Stash
        </router-link>
      </div>

      <!-- Hamburger Button (Visible on Mobile) -->
      <div class="md:hidden">
        <button
          @click="toggleMobileMenu"
          type="button"
          class="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
          aria-controls="mobile-menu"
          :aria-expanded="isMobileMenuOpen"
        >
          <span class="sr-only">Open main menu</span>
          <!-- Icon when menu is closed (Hamburger) -->
          <i v-if="!isMobileMenuOpen" class="pi pi-bars" style="font-size: 1.5rem;"></i>
          <!-- Icon when menu is open (X) -->
          <i v-else class="pi pi-times" style="font-size: 1.5rem;"></i>
        </button>
      </div>
    </nav>

    <!-- Mobile Menu (Absolute Positioned) -->
    <div
      v-show="isMobileMenuOpen"
      id="mobile-menu"
      class="md:hidden absolute top-full left-0 w-full bg-white shadow-lg border-t border-gray-200 z-40"
    >
      <div class="px-2 pt-2 pb-3 space-y-1">
        <router-link
          to="/"
          class="text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 block px-3 py-2 rounded-md text-base font-medium"
          active-class="text-indigo-700 bg-indigo-100"
          @click="closeMobileMenu"
        >
          Home
        </router-link>
        <router-link
          to="/scripts"
          class="text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 block px-3 py-2 rounded-md text-base font-medium"
          active-class="text-indigo-700 bg-indigo-100"
          @click="closeMobileMenu"
        >
          All Scripts
        </router-link>
        <router-link
          to="/scene-stash"
          class="text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 block px-3 py-2 rounded-md text-base font-medium"
          active-class="text-indigo-700 bg-indigo-100"
          @click="closeMobileMenu"
        >
          Scene Stash
        </router-link>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'; // Import ref

// State to control mobile menu visibility
const isMobileMenuOpen = ref(false);

// Function to toggle the mobile menu
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

// Function to close the mobile menu (e.g., when a link is clicked)
const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};
</script>

<style scoped>
/* Add specific styles for the header if needed, beyond Tailwind classes */
/* active-class applies when the link's route is active */
</style>