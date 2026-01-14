<template>
  <div class="h-100 d-flex flex-column">
    <div class="px-6 pt-6 pb-2">
      <h1 class="text-h4 font-weight-bold">Global Visitor Templates</h1>
      <div class="text-subtitle-1 text-grey">Manage standard templates for all locations</div>
    </div>
    
    <div class="flex-grow-1 pa-6">
      <!-- Reuse existing component with global scope -->
      <VisitorTemplates scope="global" />
    </div>
  </div>
</template>

<script setup>
import VisitorTemplates from '@/pages/visitor/admin/VisitorTemplates.vue';
</script>
