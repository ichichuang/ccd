import type { ProTableColumn } from '@/components/ProTable'

export interface ColumnSizingRow extends Record<string, unknown> {
  id: number
  title: string
  description: string
  createdAt: string
  category: string
  status: string
}

export const columnSizingColumns: ProTableColumn<ColumnSizingRow>[] = [
  {
    id: 'id',
    title: 'ID',
    field: 'id',
    width: '80px',
    align: 'right',
    sortable: true,
    pinned: 'left',
  },
  {
    id: 'title',
    title: '标题',
    field: 'title',
    minWidth: '200px',
    sortable: true,
  },
  {
    id: 'description',
    title: '描述（填充剩余空间）',
    field: 'description',
    minWidth: '800px',
  },
  {
    id: 'category',
    title: '分类',
    field: 'category',
    width: '120px',
    minWidth: '100px',
  },
  {
    id: 'createdAt',
    title: '创建日期',
    field: 'createdAt',
    width: '200px',
    minWidth: '140px',
  },
  {
    id: 'actions',
    title: '操作',
    width: '100px',
    minWidth: '100px',
    pinned: 'right',
    headerRender: () => <span class="w-full center">操作</span>,
    render: () => (
      <div class="center w-full ">
        <span class="text-xs text-primary text-xs code-inline bg-muted/30 px-xs py-xs rounded-xs cursor-pointer select-none transition-all duration-lg ease-in-out hover:bg-primary/20 hover:text-primary active:scale-95 text-muted-foreground">
          操作
        </span>
      </div>
    ),
  },
]

export function makeMockData(): ColumnSizingRow[] {
  const titles: string[] = [
    '系统架构升级',
    '用户管理模块',
    'API 网关重构',
    '数据迁移工具',
    '监控告警平台',
    '权限中心 2.0',
    '日志分析引擎',
    '配置中心服务',
    '灰度发布平台',
    '自动化测试框架',
  ]
  const descriptions: string[] = [
    '对现有微服务架构进行全面升级，引入 Service Mesh 和 Istio 进行流量管理，提升系统的可观测性和弹性。',
    '重构用户管理模块以支持多租户场景，包含 RBAC 权限模型、SSO 集成和用户行为审计。',
    '将现有 Nginx 网关替换为基于 Go 的高性能 API 网关，支持动态路由、限流、熔断和灰度策略。',
    '开发跨数据库的数据迁移工具，支持 MySQL、PostgreSQL 和 MongoDB 之间的双向同步与增量迁移。',
    '构建统一的监控告警平台，整合 Prometheus、Grafana 和自定义告警规则引擎。',
    '升级权限中心至 2.0 版本，支持基于属性的访问控制（ABAC），并增加细粒度的数据权限管理。',
    '基于 Elasticsearch 和 Flink 构建实时日志分析引擎，支持全文搜索和异常检测。',
    '开发配置中心服务，支持多环境配置管理、实时推送和版本回滚。',
    '实现灰度发布平台，支持按用户、地域、流量比例进行精细化的版本发布控制。',
    '设计自动化测试框架，集成单元测试、集成测试和端到端测试，并接入 CI/CD 流水线。',
  ]
  const categories: string[] = ['架构', '业务', '基础设施', '工具', '平台']
  const statuses: string[] = ['进行中', '已完成', '待启动']

  return titles.map((title, i) => ({
    id: i + 1,
    title,
    description: descriptions[i] ?? '',
    createdAt: `2025-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
    category: categories[i % categories.length] ?? '',
    status: statuses[i % statuses.length] ?? '',
  }))
}
