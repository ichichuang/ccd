<script setup lang="ts">
import { ref } from 'vue'

const menuItems = ref([
  {
    label: 'Documents',
    items: [
      {
        label: 'New',
        icon: 'ri-add-line',
      },
      {
        label: 'Search',
        icon: 'ri-search-line',
      },
    ],
  },
  {
    label: 'Profile',
    items: [
      {
        label: 'Settings',
        icon: 'ri-settings-3-line',
      },
      {
        label: 'Logout',
        icon: 'ri-logout-box-line',
      },
    ],
  },
])

const menubarItems = ref([
  {
    label: 'Home',
    icon: 'ri-home-line',
  },
  {
    label: 'Features',
    icon: 'ri-star-line',
  },
  {
    label: 'Projects',
    icon: 'ri-search-line',
    items: [
      {
        label: 'Components',
        icon: 'ri-flashlight-line',
      },
      {
        label: 'Blocks',
        icon: 'ri-server-line',
      },
      {
        label: 'UI Kit',
        icon: 'ri-pencil-line',
      },
      {
        label: 'Templates',
        icon: 'ri-palette-line',
        items: [
          {
            label: 'Apollo',
            icon: 'ri-palette-line',
          },
          {
            label: 'Ultima',
            icon: 'ri-palette-line',
          },
        ],
      },
    ],
  },
  {
    label: 'Contact',
    icon: 'ri-mail-line',
  },
])

const megaMenuItems = ref([
  {
    label: 'Furniture',
    icon: 'ri-cactus-line',
    items: [
      [
        {
          label: 'Living Room',
          items: [
            { label: 'Accessories' },
            { label: 'Armchair' },
            { label: 'Coffee Table' },
            { label: 'Couch' },
            { label: 'TV Stand' },
          ],
        },
      ],
      [
        {
          label: 'Kitchen',
          items: [{ label: 'Bar stool' }, { label: 'Chair' }, { label: 'Table' }],
        },
        {
          label: 'Bathroom',
          items: [{ label: 'Accessories' }],
        },
      ],
      [
        {
          label: 'Bedroom',
          items: [
            { label: 'Bed' },
            { label: 'Chaise lounge' },
            { label: 'Cupboard' },
            { label: 'Dresser' },
            { label: 'Wardrobe' },
          ],
        },
      ],
      [
        {
          label: 'Office',
          items: [
            { label: 'Bookcase' },
            { label: 'Cabinet' },
            { label: 'Chair' },
            { label: 'Desk' },
            { label: 'Executive Chair' },
          ],
        },
      ],
    ],
  },
  {
    label: 'Electronics',
    icon: 'ri-smartphone-line',
    items: [
      [
        {
          label: 'Computer',
          items: [
            { label: 'Monitor' },
            { label: 'Mouse' },
            { label: 'Notebook' },
            { label: 'Keyboard' },
            { label: 'Printer' },
            { label: 'Storage' },
          ],
        },
      ],
      [
        {
          label: 'Home Theater',
          items: [{ label: 'Projector' }, { label: 'Speakers' }, { label: 'TVs' }],
        },
      ],
      [
        {
          label: 'Gaming',
          items: [
            { label: 'Accessories' },
            { label: 'Console' },
            { label: 'PC' },
            { label: 'Video Games' },
          ],
        },
      ],
      [
        {
          label: 'Appliances',
          items: [
            { label: 'Coffee Machine' },
            { label: 'Fridge' },
            { label: 'Oven' },
            { label: 'Vaccum Cleaner' },
            { label: 'Washing Machine' },
          ],
        },
      ],
    ],
  },
  {
    label: 'Sports',
    icon: 'ri-time-line',
    items: [
      [
        {
          label: 'Football',
          items: [
            { label: 'Kits' },
            { label: 'Shoes' },
            { label: 'Shorts' },
            { label: 'Training' },
          ],
        },
      ],
      [
        {
          label: 'Running',
          items: [
            { label: 'Accessories' },
            { label: 'Shoes' },
            { label: 'T-Shirts' },
            { label: 'Shorts' },
          ],
        },
      ],
      [
        {
          label: 'Swimming',
          items: [
            { label: 'Kickboard' },
            { label: 'Nose Clip' },
            { label: 'Swimsuits' },
            { label: 'Paddles' },
          ],
        },
      ],
      [
        {
          label: 'Tennis',
          items: [
            { label: 'Balls' },
            { label: 'Rackets' },
            { label: 'Shoes' },
            { label: 'Training' },
          ],
        },
      ],
    ],
  },
])

const panelMenuItems = ref([
  {
    label: 'Files',
    icon: 'ri-file-line',
    items: [
      {
        label: 'Documents',
        icon: 'ri-file-line',
        items: [
          {
            label: 'Invoices',
            icon: 'ri-file-pdf-line',
            items: [
              {
                label: 'Pending',
                icon: 'ri-stop-circle-line',
              },
              {
                label: 'Paid',
                icon: 'ri-checkbox-circle-line',
              },
            ],
          },
          {
            label: 'Clients',
            icon: 'ri-group-line',
          },
        ],
      },
      {
        label: 'Images',
        icon: 'ri-image-line',
        items: [
          {
            label: 'Logos',
            icon: 'ri-image-line',
          },
        ],
      },
    ],
  },
  {
    label: 'Cloud',
    icon: 'ri-cloud-line',
    items: [
      {
        label: 'Upload',
        icon: 'ri-upload-cloud-line',
      },
      {
        label: 'Download',
        icon: 'ri-download-cloud-line',
      },
      {
        label: 'Sync',
        icon: 'ri-refresh-line',
      },
    ],
  },
  {
    label: 'Devices',
    icon: 'ri-computer-line',
    items: [
      {
        label: 'Phone',
        icon: 'ri-smartphone-line',
      },
      {
        label: 'Desktop',
        icon: 'ri-computer-line',
      },
      {
        label: 'Tablet',
        icon: 'ri-tablet-line',
      },
    ],
  },
])

const tieredMenuItems = ref([
  {
    label: 'File',
    icon: 'ri-file-line',
    items: [
      {
        label: 'New',
        icon: 'ri-add-line',
        items: [
          {
            label: 'Document',
            icon: 'ri-file-line',
          },
          {
            label: 'Image',
            icon: 'ri-image-line',
          },
          {
            label: 'Video',
            icon: 'ri-video-line',
          },
        ],
      },
      {
        label: 'Open',
        icon: 'ri-folder-open-line',
      },
      {
        label: 'Print',
        icon: 'ri-printer-line',
      },
    ],
  },
  {
    label: 'Edit',
    icon: 'ri-edit-line',
    items: [
      {
        label: 'Copy',
        icon: 'ri-file-copy-line',
      },
      {
        label: 'Delete',
        icon: 'ri-delete-bin-line',
      },
    ],
  },
  {
    label: 'Search',
    icon: 'ri-search-line',
  },
  {
    separator: true,
  },
  {
    label: 'Share',
    icon: 'ri-share-line',
    items: [
      {
        label: 'Slack',
        icon: 'ri-slack-line',
      },
      {
        label: 'Whatsapp',
        icon: 'ri-whatsapp-line',
      },
    ],
  },
])
</script>
<template lang="pug">
.full.grid.gap-gap.grid-cols-1(class='sm:grid-cols-2 lg:grid-cols-3 xxl:grid-cols-4 lg:h-140%')
  //- Mune
  .c-card-primary.between-col
    b.fs-appFontSizex.h-40 Menu
    .full(class='h-[calc(100%-40px)]')
      PrimeMenu(:items='menuItems')

  //-Menubar
  .c-card-primary.between-col
    b.fs-appFontSizex.h-40 Menubar
    .full(class='h-[calc(100%-40px)]')
      PrimeMenu(:items='menubarItems', type='bar')

  //- MegaMenu
  .c-card-primary.between-col
    b.fs-appFontSizex.h-40 MegaMenu
    .full(class='h-[calc(100%-40px)]')
      PrimeMenu(:items='megaMenuItems', type='mega')

  //- PanelMenu
  .c-card-primary.between-col
    b.fs-appFontSizex.h-40 PanelMenu
    .full(class='h-[calc(100%-40px)]')
      PrimeMenu(:items='panelMenuItems', type='panel')

  //- TieredMenu
  .c-card-primary.between-col
    b.fs-appFontSizex.h-40 TieredMenu
    .full(class='h-[calc(100%-40px)]')
      PrimeMenu(:items='tieredMenuItems', type='tier')
</template>
