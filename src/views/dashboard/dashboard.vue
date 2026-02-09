<script setup lang="ts"></script>
<template>
  <div>
    <Icons name="i-lucide-user" />
    <Icons name="i-lucide-settings" />
    <Icons name="i-lucide-home" />

    <Icons name="i-mdi-database-export" />
    <Icons name="i-mdi-card-account-details" />

    <Icons name="i-logos-vue" />
    <Icons name="i-logos-google-icon" />
    <Icons name="i-logos-typescript-icon" />

    <Icons name="i-custom:custom-juejin" />
    <Icons name="i-custom:language-cn" />
    <Icons name="i-custom:language-en" />

    <Button size="small">小按钮</Button>
    <Button>中按钮</Button>
    <Button size="large">大按钮</Button>

    <div
      v-for="i in 100"
      :key="i"
    >
      {{ i }}：这是一段文字，一段普通文本
    </div>
  </div>
</template>
<style lang="scss" scoped></style>
