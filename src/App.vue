<script setup lang="ts">
import AppHeader from './components/AppHeader.vue'; // Import the header
</script>

<template>
  <div id="app" class="font-sans antialiased text-gray-900 bg-gray-100 min-h-screen flex flex-col">
    <app-header />

    <main class="container mx-auto px-4 py-8 flex-grow">
       <!-- Wrap router-view with transition -->
       <router-view v-slot="{ Component, route }">
         <transition name="route-fade" mode="out-in">
           <component :is="Component" :key="route.path" />
         </transition>
       </router-view>
    </main>
  </div>
</template>

<style>
/* Keep global styles minimal, rely on Tailwind utilities */
/* Ensure the @import "tailwindcss"; is in src/style.css */

/* Route Transition: Fade */
.route-fade-enter-active,
.route-fade-leave-active {
  transition: opacity 0.2s ease; /* Adjust duration/easing as needed */
}

.route-fade-enter-from,
.route-fade-leave-to {
  opacity: 0;
}
</style>
