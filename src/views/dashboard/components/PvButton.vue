<script setup lang="ts"></script>
<template lang="pug">
.grid.grid-cols-4.center
  b.full.c-border.fs-appFontSizex.color-primary100.center Button
  .full.c-border.center
    Button(label='small', size='small')
  .full.c-border.center
    Button(label='default')
  .full.c-border.center
    Button(label='large', size='large')
</template>
<style lang="scss" scope></style>
