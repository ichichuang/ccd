const chartsRoute: RouteConfig = {
  path: '/example/charts',
  name: 'ExampleCharts',
  component: () => import('@/views/example/components/use-echarts/index.vue'),
  meta: {
    titleKey: 'router.example.components.useEcharts',
    rank: 4,
    icon: 'i-lucide-chart-bar',
  },
}

export { chartsRoute }

export default [chartsRoute] satisfies RouteConfig[]
