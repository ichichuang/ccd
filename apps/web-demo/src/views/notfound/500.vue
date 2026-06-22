<script setup lang="ts">
import ErrorStatePage from './ErrorStatePage.vue'

defineOptions({ name: 'Error500' })
</script>

<template>
  <ErrorStatePage :code="500" />
</template>
