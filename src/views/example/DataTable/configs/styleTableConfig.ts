import type { DataTableColumn } from '@/components/DataTable'

export interface StyleProduct {
  id: string
  name: string
  category: string
  price: number
  status: 'INSTOCK' | 'LOWSTOCK' | 'OUTOFSTOCK'
  quantity: number
}

export const styleData: StyleProduct[] = [
  {
    id: '1000',
    name: 'Bamboo Watch',
    category: 'Accessories',
    price: 65,
    status: 'INSTOCK',
    quantity: 24,
  },
  {
    id: '1001',
    name: 'Black Watch',
    category: 'Accessories',
    price: 72,
    status: 'INSTOCK',
    quantity: 61,
  },
  {
    id: '1002',
    name: 'Blue Band',
    category: 'Fitness',
    price: 79,
    status: 'LOWSTOCK',
    quantity: 2,
  },
  {
    id: '1003',
    name: 'Blue T-Shirt',
    category: 'Clothing',
    price: 29,
    status: 'INSTOCK',
    quantity: 25,
  },
  {
    id: '1004',
    name: 'Bracelet',
    category: 'Accessories',
    price: 15,
    status: 'INSTOCK',
    quantity: 73,
  },
  {
    id: '1005',
    name: 'Brown Purse',
    category: 'Accessories',
    price: 120,
    status: 'OUTOFSTOCK',
    quantity: 0,
  },
  {
    id: '1006',
    name: 'Chakra Bracelet',
    category: 'Accessories',
    price: 32,
    status: 'LOWSTOCK',
    quantity: 5,
  },
  {
    id: '1007',
    name: 'Galaxy Earrings',
    category: 'Accessories',
    price: 34,
    status: 'INSTOCK',
    quantity: 23,
  },
  {
    id: '1008',
    name: 'Game Controller',
    category: 'Electronics',
    price: 99,
    status: 'INSTOCK',
    quantity: 2,
  },
  {
    id: '1009',
    name: 'Gaming Set',
    category: 'Electronics',
    price: 299,
    status: 'INSTOCK',
    quantity: 63,
  },
]

export const styleColumns: DataTableColumn<StyleProduct>[] = [
  {
    field: 'id',
    header: 'Code',
    width: 100,
  },
  {
    field: 'name',
    header: 'Name',
    width: 200,
    bodyClass: 'font-bold',
  },
  {
    field: 'category',
    header: 'Category',
    width: 150,
  },
  {
    field: 'price',
    header: 'Price',
    width: 120,
    bodyClass: (data: StyleProduct) => (data.price > 100 ? 'text-danger font-bold' : ''),
    body: (data: StyleProduct) => `$${data.price}`,
  },
  {
    field: 'status',
    header: 'Status',
    width: 150,
    bodyClass: (data: StyleProduct) => {
      switch (data.status) {
        case 'INSTOCK':
          return 'text-success font-medium'
        case 'LOWSTOCK':
          return 'text-warn font-medium'
        case 'OUTOFSTOCK':
          return 'text-danger font-medium'
        default:
          return ''
      }
    },
  },
  {
    field: 'quantity',
    header: 'Quantity',
    width: 120,
    align: 'center',
  },
]
