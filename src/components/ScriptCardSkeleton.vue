<template>
  <div class="border border-gray-200 bg-white rounded-lg shadow p-4 pb-10 animate-pulse"> <!-- Adjusted padding and shadow -->
    <!-- Skeleton for Title -->
    <div class="h-5 bg-gray-300 rounded w-3/4 mb-1"></div> <!-- Adjusted height and margin -->

    <!-- Skeleton for Characters -->
    <div class="h-3 bg-gray-200 rounded w-1/2 mb-1"></div> <!-- Adjusted margin -->

    <!-- Skeleton for Lines -->
    <div class="space-y-1 mt-1"> <!-- Adjusted spacing and added top margin -->
      <div class="h-4 bg-gray-200 rounded w-full"></div> <!-- Adjusted height -->
      <div class="h-4 bg-gray-200 rounded w-5/6"></div> <!-- Adjusted height -->
    </div>

    <!-- Removed incorrect footer skeleton -->
  </div>
</template>

<script setup lang="ts">
// No script logic needed for a simple skeleton
</script>