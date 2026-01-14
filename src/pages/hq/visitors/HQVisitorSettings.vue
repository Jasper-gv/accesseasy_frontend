<template>
  <div class="h-100 d-flex flex-column">
    <div class="px-6 pt-6 pb-2">
      <h1 class="text-h4 font-weight-bold">Global Visitor Settings</h1>
      <div class="text-subtitle-1 text-grey">Configure organization-wide visitor policies</div>
    </div>
    
    <div class="flex-grow-1 pa-6">
      <!-- Reuse existing component with global scope -->
      <VisitorSettings scope="global" />
    </div>
  </div>
</template>

<script setup>
import VisitorSettings from '@/pages/visitor/admin/VisitorSettings.vue';
</script>
