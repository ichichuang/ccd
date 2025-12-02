<script setup lang="ts">
import { env } from '@/utils'
const version = env.appVersion
</script>
<template lang="pug">
.full.between-end.px-padding.fs-appFontSizes.select-none 版本号：{{ version }}
</template>
