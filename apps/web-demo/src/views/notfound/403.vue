<script setup lang="ts">
import ErrorStatePage from './ErrorStatePage.vue'

defineOptions({ name: 'Error403' })
</script>

<template>
  <ErrorStatePage :code="403" />
</template>
