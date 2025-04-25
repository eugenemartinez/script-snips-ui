<template>
  <div class="bg-white p-6 md:p-8 rounded-lg shadow-md border border-gray-200 animate-pulse">
    <!-- Skeleton for Title -->
    <div class="mb-4">
      <div class="h-6 bg-gray-300 rounded w-3/4"></div>
    </div>

    <!-- Skeleton for Characters -->
    <div class="mb-4">
      <div class="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>

    <!-- Skeleton for Lines -->
    <div class="space-y-4">
      <!-- Example: 3 lines -->
      <div v-for="n in 3" :key="`line-skel-${n}`" class="space-y-2">
        <div class="h-4 bg-gray-300 rounded w-1/4"></div> <!-- Character Name -->
        <div class="h-4 bg-gray-200 rounded w-full"></div> <!-- Dialogue -->
      </div>
    </div>

    <!-- Skeleton for Action Buttons Area -->
    <div class="mt-8 pt-4 border-t border-gray-100 flex justify-end space-x-3">
      <div class="h-8 w-8 bg-gray-200 rounded-full"></div> <!-- Stash Button -->
      <div class="h-8 w-20 bg-gray-300 rounded"></div> <!-- Edit Button -->
      <div class="h-8 w-20 bg-gray-300 rounded"></div> <!-- Delete Button -->
    </div>
  </div>
</template>

<script setup lang="ts">
// No script logic needed for a simple skeleton
</script>