<script setup lang="ts">
import ErrorStatePage from './ErrorStatePage.vue'

defineOptions({ name: 'Error404' })
</script>

<template>
  <ErrorStatePage :code="404" />
</template>
