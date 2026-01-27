<script setup lang="ts">
import { useUserStore } from '@/stores/modules/user'
const userStore = useUserStore()
const login = () => {
  userStore.setToken('123')
}
</script>
<template>
  <div class="full center">
    <div
      class="bg-red p-20 c-cp"
      @click="login"
    >
      Login
    </div>
  </div>
</template>
<style lang="scss" scoped></style>
