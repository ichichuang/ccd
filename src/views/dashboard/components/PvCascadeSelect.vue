<script setup>
import { ref } from 'vue'

const value1 = ref(null)
const value2 = ref(null)
const value3 = ref(null)
const countries = ref([
  {
    name: 'Australia',
    code: 'AU',
    states: [
      {
        name: 'New South Wales',
        cities: [
          { cname: 'Sydney', code: 'A-SY' },
          { cname: 'Newcastle', code: 'A-NE' },
          { cname: 'Wollongong', code: 'A-WO' },
        ],
      },
      {
        name: 'Queensland',
        cities: [
          { cname: 'Brisbane', code: 'A-BR' },
          { cname: 'Townsville', code: 'A-TO' },
        ],
      },
    ],
  },
  {
    name: 'Canada',
    code: 'CA',
    states: [
      {
        name: 'Quebec',
        cities: [
          { cname: 'Montreal', code: 'C-MO' },
          { cname: 'Quebec City', code: 'C-QU' },
        ],
      },
      {
        name: 'Ontario',
        cities: [
          { cname: 'Ottawa', code: 'C-OT' },
          { cname: 'Toronto', code: 'C-TO' },
        ],
      },
    ],
  },
  {
    name: 'United States',
    code: 'US',
    states: [
      {
        name: 'California',
        cities: [
          { cname: 'Los Angeles', code: 'US-LA' },
          { cname: 'San Diego', code: 'US-SD' },
          { cname: 'San Francisco', code: 'US-SF' },
        ],
      },
      {
        name: 'Florida',
        cities: [
          { cname: 'Jacksonville', code: 'US-JA' },
          { cname: 'Miami', code: 'US-MI' },
          { cname: 'Tampa', code: 'US-TA' },
          { cname: 'Orlando', code: 'US-OR' },
        ],
      },
      {
        name: 'Texas',
        cities: [
          { cname: 'Austin', code: 'US-AU' },
          { cname: 'Dallas', code: 'US-DA' },
          { cname: 'Houston', code: 'US-HO' },
        ],
      },
    ],
  },
])
</script>
<template lang="pug">
.grid.grid-cols-4.center
  b.full.c-border.fs-appFontSizex.color-primary100.center CascadeSelect
  .full.c-border.center
    CascadeSelect(
      v-model='value1',
      :options='countries',
      option-label='cname',
      option-group-label='name',
      :option-group-children='["states", "cities"]',
      size='small',
      placeholder='Small'
    )
  .full.c-border.center
    CascadeSelect(
      v-model='value2',
      :options='countries',
      option-label='cname',
      option-group-label='name',
      :option-group-children='["states", "cities"]',
      size='default',
      placeholder='Default'
    )
  .full.c-border.center
    CascadeSelect(
      v-model='value3',
      :options='countries',
      option-label='cname',
      option-group-label='name',
      :option-group-children='["states", "cities"]',
      size='large',
      placeholder='Large'
    )
</template>
<style lang="scss" scope></style>
