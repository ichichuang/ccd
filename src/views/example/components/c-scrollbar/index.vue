<script setup lang="ts">
import type { ScrollbarInstance, ScrollbarVisibility } from '@/components/CScrollbar/utils/types'

defineOptions({ name: 'ScrollbarSystemPage' })

const COPY_TOAST_GROUP = 'tr' as const

const themeStore = useThemeStore()
const { isDark } = useThemeSwitch()

type LogLevel = 'info' | 'success' | 'warn' | 'error'
type MemberStatus = 'online' | 'busy' | 'away' | 'offline'

interface MockLogEntry {
  id: number
  timestamp: string
  level: LogLevel
  source: string
  message: string
}

interface MockMember {
  id: number
  name: string
  initials: string
  role: string
  department: string
  status: MemberStatus
}

interface MockNotification {
  id: number
  icon: string
  title: string
  body: string
  timeAgo: string
  unread: boolean
}

const visibility = ref<ScrollbarVisibility>('auto')
const deferInit = ref<boolean>(true)

const overlayScrollbarRef = ref<ScrollbarInstance | null>(null)
const overlayInitialized = ref<boolean>(false)
const overlayUpdatedCount = ref<number>(0)
const lastScrollTarget = ref<'top' | 'middle' | 'bottom' | null>(null)
const lastScrollTop = ref<number>(0)

const visibilityOptions = computed<Array<{ label: string; value: ScrollbarVisibility }>>(() => [
  { label: 'Auto (Overlay auto-hide)', value: 'auto' },
  { label: 'Visible (Always visible)', value: 'visible' },
  { label: 'Hidden (Never visible)', value: 'hidden' },
])

const mockLogs = computed<MockLogEntry[]>(() => [
  {
    id: 1,
    timestamp: '14:23:01',
    level: 'info',
    source: 'Auth',
    message: 'User session refreshed for user@company.com',
  },
  {
    id: 2,
    timestamp: '14:23:05',
    level: 'success',
    source: 'API',
    message: 'Batch import completed — 1,234 records processed',
  },
  {
    id: 3,
    timestamp: '14:23:12',
    level: 'warn',
    source: 'Storage',
    message: 'Cache miss ratio above 15% threshold',
  },
  {
    id: 4,
    timestamp: '14:23:18',
    level: 'error',
    source: 'WebSocket',
    message: 'Connection lost — retrying in 5s',
  },
  {
    id: 5,
    timestamp: '14:23:24',
    level: 'info',
    source: 'Router',
    message: 'Dynamic route registered: /dashboard/analytics',
  },
  {
    id: 6,
    timestamp: '14:23:31',
    level: 'success',
    source: 'Database',
    message: 'Migration v3.4.1 applied successfully in 42s',
  },
  {
    id: 7,
    timestamp: '14:23:38',
    level: 'warn',
    source: 'Security',
    message: '3 failed login attempts from 192.168.1.42',
  },
  {
    id: 8,
    timestamp: '14:23:45',
    level: 'info',
    source: 'Scheduler',
    message: 'Nightly backup task dispatched to worker pool',
  },
  {
    id: 9,
    timestamp: '14:23:52',
    level: 'error',
    source: 'CDN',
    message: 'Edge node sg-01 returned 503 — failover activated',
  },
  {
    id: 10,
    timestamp: '14:24:01',
    level: 'success',
    source: 'Cache',
    message: 'Warm-up completed — 8,921 keys loaded from snapshot',
  },
  {
    id: 11,
    timestamp: '14:24:08',
    level: 'info',
    source: 'Auth',
    message: 'OAuth token issued for integration: github-app',
  },
  {
    id: 12,
    timestamp: '14:24:14',
    level: 'warn',
    source: 'API',
    message: 'Rate limit at 82% for endpoint /api/v2/export',
  },
  {
    id: 13,
    timestamp: '14:24:21',
    level: 'info',
    source: 'Database',
    message: 'Read replica re-synced — replication lag: 12ms',
  },
  {
    id: 14,
    timestamp: '14:24:29',
    level: 'success',
    source: 'Scheduler',
    message: 'Analytics aggregation job finished in 3.2s',
  },
  {
    id: 15,
    timestamp: '14:24:36',
    level: 'error',
    source: 'Storage',
    message: 'Disk usage at 94% on vol-prod-03 — action required',
  },
  {
    id: 16,
    timestamp: '14:24:43',
    level: 'info',
    source: 'CDN',
    message: 'Cache purge for /assets/v8.3.0/* completed',
  },
  {
    id: 17,
    timestamp: '14:24:51',
    level: 'warn',
    source: 'WebSocket',
    message: 'Message queue depth: 1,024 — consumer lagging',
  },
  {
    id: 18,
    timestamp: '14:25:02',
    level: 'success',
    source: 'Security',
    message: '2FA verification passed for admin account',
  },
  {
    id: 19,
    timestamp: '14:25:10',
    level: 'info',
    source: 'Router',
    message: 'Permission guard recalculated for 12 routes',
  },
  {
    id: 20,
    timestamp: '14:25:18',
    level: 'error',
    source: 'API',
    message: 'Unhandled exception in /api/v2/reports — NullPointerException',
  },
  {
    id: 21,
    timestamp: '14:25:26',
    level: 'info',
    source: 'Cache',
    message: 'Eviction policy: LRU — freed 240 MB of expired entries',
  },
  {
    id: 22,
    timestamp: '14:25:33',
    level: 'success',
    source: 'CDN',
    message: 'SSL certificate renewed for *.company.com (365 days)',
  },
  {
    id: 23,
    timestamp: '14:25:41',
    level: 'warn',
    source: 'Database',
    message: 'Slow query detected: 3.8s on table user_events',
  },
  {
    id: 24,
    timestamp: '14:25:49',
    level: 'info',
    source: 'Auth',
    message: 'LDAP sync completed — 342 users updated',
  },
  {
    id: 25,
    timestamp: '14:25:57',
    level: 'success',
    source: 'Storage',
    message: 'Automated backup uploaded to S3 (2.1 GB in 38s)',
  },
  {
    id: 26,
    timestamp: '14:26:05',
    level: 'error',
    source: 'Scheduler',
    message: 'Email digest job timed out after 30s — task requeued',
  },
  {
    id: 27,
    timestamp: '14:26:13',
    level: 'info',
    source: 'WebSocket',
    message: 'Reconnected — 41 clients re-subscribed to channels',
  },
  {
    id: 28,
    timestamp: '14:26:21',
    level: 'warn',
    source: 'Security',
    message: 'Unusual access pattern detected from IP 10.0.4.17',
  },
  {
    id: 29,
    timestamp: '14:26:29',
    level: 'info',
    source: 'API',
    message: 'GraphQL schema reloaded — 0 breaking changes detected',
  },
  {
    id: 30,
    timestamp: '14:26:37',
    level: 'success',
    source: 'Database',
    message: 'Index rebuild complete — avg query time improved by 42ms',
  },
  {
    id: 31,
    timestamp: '14:26:45',
    level: 'info',
    source: 'Cache',
    message: 'Hit ratio restored to 94.2% after deployment warm-up',
  },
  {
    id: 32,
    timestamp: '14:26:52',
    level: 'error',
    source: 'CDN',
    message: 'Origin pull failed for /uploads/reports/ — upstream 502',
  },
  {
    id: 33,
    timestamp: '14:27:01',
    level: 'warn',
    source: 'Auth',
    message: 'Session tokens nearing expiry for 17 active users',
  },
  {
    id: 34,
    timestamp: '14:27:09',
    level: 'success',
    source: 'Scheduler',
    message: 'Data export dispatched to worker pool (3 partitions)',
  },
  {
    id: 35,
    timestamp: '14:27:17',
    level: 'info',
    source: 'Router',
    message: 'Breadcrumb tree rebuilt — 68 active routes mapped',
  },
  {
    id: 36,
    timestamp: '14:27:25',
    level: 'warn',
    source: 'Storage',
    message: 'Large object detected: file_preview_9001 (812 MB)',
  },
  {
    id: 37,
    timestamp: '14:27:33',
    level: 'success',
    source: 'Security',
    message: 'Threat signature DB updated — version 2026.03.22',
  },
  {
    id: 38,
    timestamp: '14:27:41',
    level: 'info',
    source: 'API',
    message: 'Webhook delivery confirmed: github-push #7841',
  },
  {
    id: 39,
    timestamp: '14:27:49',
    level: 'error',
    source: 'Database',
    message: 'Replication slot lag critical — 8.4 GB WAL pending sync',
  },
  {
    id: 40,
    timestamp: '14:27:57',
    level: 'info',
    source: 'WebSocket',
    message: 'Heartbeat sent to 128 active persistent connections',
  },
  {
    id: 41,
    timestamp: '14:28:05',
    level: 'success',
    source: 'Cache',
    message: 'Pipeline flush completed — 0 errors, 3,241 keys evicted',
  },
  {
    id: 42,
    timestamp: '14:28:13',
    level: 'warn',
    source: 'Scheduler',
    message: 'Retry queue growing: 182 deferred tasks awaiting slots',
  },
  {
    id: 43,
    timestamp: '14:28:21',
    level: 'info',
    source: 'Auth',
    message: 'API key rotated for service account: deploy-bot',
  },
  {
    id: 44,
    timestamp: '14:28:29',
    level: 'success',
    source: 'CDN',
    message: 'A/B test rollout at 50% — latency nominal across regions',
  },
  {
    id: 45,
    timestamp: '14:28:37',
    level: 'info',
    source: 'Security',
    message: 'Audit log flushed to cold storage (3,841 events archived)',
  },
])

const mockMembers = computed<MockMember[]>(() => [
  {
    id: 1,
    name: 'Zhang Wei',
    initials: 'ZW',
    role: 'Tech Lead',
    department: 'Platform',
    status: 'online',
  },
  { id: 2, name: 'Li Mei', initials: 'LM', role: 'Sr. Designer', department: 'UX', status: 'busy' },
  {
    id: 3,
    name: 'Wang Fang',
    initials: 'WF',
    role: 'Backend Engineer',
    department: 'API',
    status: 'online',
  },
  {
    id: 4,
    name: 'Chen Hao',
    initials: 'CH',
    role: 'QA Lead',
    department: 'Quality',
    status: 'away',
  },
  {
    id: 5,
    name: 'Liu Yang',
    initials: 'LY',
    role: 'DevOps Engineer',
    department: 'Infra',
    status: 'online',
  },
  {
    id: 6,
    name: 'Huang Jing',
    initials: 'HJ',
    role: 'Product Manager',
    department: 'PMO',
    status: 'busy',
  },
  {
    id: 7,
    name: 'Zhao Lei',
    initials: 'ZL',
    role: 'Data Scientist',
    department: 'Data',
    status: 'online',
  },
  {
    id: 8,
    name: 'Sun Xin',
    initials: 'SX',
    role: 'Mobile Engineer',
    department: 'Mobile',
    status: 'offline',
  },
  {
    id: 9,
    name: 'Zhou Min',
    initials: 'ZM',
    role: 'Security Engineer',
    department: 'Security',
    status: 'online',
  },
  {
    id: 10,
    name: 'Wu Qiang',
    initials: 'WQ',
    role: 'Frontend Engineer',
    department: 'UI',
    status: 'busy',
  },
  { id: 11, name: 'Xu Ling', initials: 'XL', role: 'DBA', department: 'Data', status: 'online' },
  {
    id: 12,
    name: 'Ma Tao',
    initials: 'MT',
    role: 'Architect',
    department: 'Platform',
    status: 'away',
  },
  {
    id: 13,
    name: 'He Rui',
    initials: 'HR',
    role: 'Test Engineer',
    department: 'Quality',
    status: 'online',
  },
  {
    id: 14,
    name: 'Gao Yan',
    initials: 'GY',
    role: 'UI Designer',
    department: 'UX',
    status: 'offline',
  },
  { id: 15, name: 'Lin Bo', initials: 'LB', role: 'SRE', department: 'Infra', status: 'online' },
  { id: 16, name: 'Ye Ke', initials: 'YK', role: 'PM', department: 'PMO', status: 'busy' },
  {
    id: 17,
    name: 'Xie Na',
    initials: 'XN',
    role: 'ML Engineer',
    department: 'Data',
    status: 'online',
  },
  {
    id: 18,
    name: 'Song Wei',
    initials: 'SW',
    role: 'iOS Developer',
    department: 'Mobile',
    status: 'online',
  },
  {
    id: 19,
    name: 'Tang Hui',
    initials: 'TH',
    role: 'Pen Tester',
    department: 'Security',
    status: 'away',
  },
  {
    id: 20,
    name: 'Luo Peng',
    initials: 'LP',
    role: 'Vue Specialist',
    department: 'UI',
    status: 'online',
  },
  {
    id: 21,
    name: 'Pan Xia',
    initials: 'PX',
    role: 'Data Analyst',
    department: 'Data',
    status: 'offline',
  },
  {
    id: 22,
    name: 'Jiang Feng',
    initials: 'JF',
    role: 'System Admin',
    department: 'Infra',
    status: 'busy',
  },
  {
    id: 23,
    name: 'Deng Liang',
    initials: 'DL',
    role: 'Vue Specialist',
    department: 'UI',
    status: 'online',
  },
  {
    id: 24,
    name: 'Cao Jian',
    initials: 'CJ',
    role: 'Test Automation',
    department: 'Quality',
    status: 'online',
  },
  {
    id: 25,
    name: 'Feng Yue',
    initials: 'FY',
    role: 'Product Designer',
    department: 'UX',
    status: 'online',
  },
  {
    id: 26,
    name: 'Ren Shuo',
    initials: 'RS',
    role: 'API Engineer',
    department: 'API',
    status: 'busy',
  },
  {
    id: 27,
    name: 'Han Zhen',
    initials: 'HZ',
    role: 'Platform Engineer',
    department: 'Platform',
    status: 'away',
  },
  {
    id: 28,
    name: 'Lu Wei',
    initials: 'LW',
    role: 'Android Dev',
    department: 'Mobile',
    status: 'online',
  },
  {
    id: 29,
    name: 'Cai Qiu',
    initials: 'CQ',
    role: 'Data Engineer',
    department: 'Data',
    status: 'online',
  },
  {
    id: 30,
    name: 'Du Xin',
    initials: 'DX',
    role: 'Compliance',
    department: 'Security',
    status: 'offline',
  },
  {
    id: 31,
    name: 'Tian Rong',
    initials: 'TR',
    role: 'Vue Engineer',
    department: 'UI',
    status: 'online',
  },
  {
    id: 32,
    name: 'Mo Yan',
    initials: 'MY',
    role: 'Cloud Architect',
    department: 'Infra',
    status: 'busy',
  },
  {
    id: 33,
    name: 'Shi Jun',
    initials: 'SJ',
    role: 'PM Associate',
    department: 'PMO',
    status: 'online',
  },
  {
    id: 34,
    name: 'Zou Min',
    initials: 'ZMi',
    role: 'QA Engineer',
    department: 'Quality',
    status: 'online',
  },
  {
    id: 35,
    name: 'Yin Hao',
    initials: 'YH',
    role: 'MLOps Engineer',
    department: 'Data',
    status: 'away',
  },
  {
    id: 36,
    name: 'Gu Li',
    initials: 'GL',
    role: 'Sr. Backend',
    department: 'API',
    status: 'online',
  },
  {
    id: 37,
    name: 'Bi Cheng',
    initials: 'BC',
    role: 'Brand Designer',
    department: 'UX',
    status: 'offline',
  },
  {
    id: 38,
    name: 'Ji Fei',
    initials: 'JFi',
    role: 'K8s Engineer',
    department: 'Infra',
    status: 'online',
  },
  {
    id: 39,
    name: 'Mao Lin',
    initials: 'ML',
    role: 'React Native Dev',
    department: 'Mobile',
    status: 'busy',
  },
  {
    id: 40,
    name: 'Pang Bo',
    initials: 'PB',
    role: 'Security Analyst',
    department: 'Security',
    status: 'online',
  },
  {
    id: 41,
    name: 'Hou Jun',
    initials: 'HJn',
    role: 'Node.js Dev',
    department: 'API',
    status: 'online',
  },
  {
    id: 42,
    name: 'Xiong Wei',
    initials: 'XW',
    role: 'Rust Engineer',
    department: 'Platform',
    status: 'away',
  },
  {
    id: 43,
    name: 'Kong Xin',
    initials: 'KX',
    role: 'UX Researcher',
    department: 'UX',
    status: 'online',
  },
  {
    id: 44,
    name: 'Bai Shuai',
    initials: 'BS',
    role: 'Growth PM',
    department: 'PMO',
    status: 'busy',
  },
  {
    id: 45,
    name: 'Dong Yu',
    initials: 'DY',
    role: 'Data Platform',
    department: 'Data',
    status: 'online',
  },
])

const mockNotifications = computed<MockNotification[]>(() => [
  {
    id: 1,
    icon: 'i-lucide-git-pull-request',
    title: 'PR #1142 merged',
    body: 'feat: refactor design-engine token resolver',
    timeAgo: '2m ago',
    unread: true,
  },
  {
    id: 2,
    icon: 'i-lucide-rocket',
    title: 'Deploy succeeded',
    body: 'v3.4.1 released to production successfully',
    timeAgo: '5m ago',
    unread: true,
  },
  {
    id: 3,
    icon: 'i-lucide-message-square',
    title: 'Li Mei commented',
    body: 'The color tokens look great on dark mode!',
    timeAgo: '12m ago',
    unread: true,
  },
  {
    id: 4,
    icon: 'i-lucide-shield-alert',
    title: 'Security scan done',
    body: '0 critical, 2 medium vulnerabilities found',
    timeAgo: '18m ago',
    unread: false,
  },
  {
    id: 5,
    icon: 'i-lucide-user-plus',
    title: 'New member joined',
    body: 'Kong Xin joined the UX Research team',
    timeAgo: '34m ago',
    unread: false,
  },
  {
    id: 6,
    icon: 'i-lucide-database',
    title: 'Backup complete',
    body: '2.1 GB snapshot archived to cold storage',
    timeAgo: '45m ago',
    unread: false,
  },
  {
    id: 7,
    icon: 'i-lucide-zap',
    title: 'Performance alert',
    body: 'p99 latency spiked to 1.4s on /api/v2/list',
    timeAgo: '1h ago',
    unread: true,
  },
  {
    id: 8,
    icon: 'i-lucide-file-check',
    title: 'Report ready',
    body: 'Q1 2026 analytics export is available for download',
    timeAgo: '1h ago',
    unread: false,
  },
  {
    id: 9,
    icon: 'i-lucide-refresh-cw',
    title: 'Sync completed',
    body: 'LDAP directory synced — 342 accounts updated',
    timeAgo: '2h ago',
    unread: false,
  },
  {
    id: 10,
    icon: 'i-lucide-cpu',
    title: 'High CPU detected',
    body: 'Worker node w-04 at 92% for 10 minutes',
    timeAgo: '2h ago',
    unread: true,
  },
  {
    id: 11,
    icon: 'i-lucide-git-commit',
    title: '24 commits pushed',
    body: 'Phase 501 · Design Engine merge to main branch',
    timeAgo: '3h ago',
    unread: false,
  },
  {
    id: 12,
    icon: 'i-lucide-mail',
    title: 'Weekly digest',
    body: '38 tasks closed · 12 opened this sprint week',
    timeAgo: '4h ago',
    unread: false,
  },
  {
    id: 13,
    icon: 'i-lucide-cloud-upload',
    title: 'CDN deployed',
    body: 'Assets v8.3.0 propagated to 12 edge nodes',
    timeAgo: '5h ago',
    unread: false,
  },
  {
    id: 14,
    icon: 'i-lucide-lock',
    title: 'API key rotated',
    body: 'deploy-bot service account key refreshed',
    timeAgo: '6h ago',
    unread: false,
  },
  {
    id: 15,
    icon: 'i-lucide-trending-up',
    title: 'DAU record',
    body: '12,841 daily active users — new peak reached',
    timeAgo: '8h ago',
    unread: false,
  },
  {
    id: 16,
    icon: 'i-lucide-alert-triangle',
    title: 'Disk warning',
    body: 'vol-prod-03 at 94% capacity — expand soon',
    timeAgo: '9h ago',
    unread: true,
  },
  {
    id: 17,
    icon: 'i-lucide-star',
    title: 'Milestone reached',
    body: 'Design system v2.0.0 tagged and released',
    timeAgo: '10h ago',
    unread: false,
  },
  {
    id: 18,
    icon: 'i-lucide-users',
    title: 'Team meeting',
    body: 'Architecture review session in 30 minutes',
    timeAgo: '11h ago',
    unread: false,
  },
  {
    id: 19,
    icon: 'i-lucide-package',
    title: 'Dependency updated',
    body: 'pnpm catalog: vite 7.3.1 → 7.3.2 security patch',
    timeAgo: '12h ago',
    unread: false,
  },
  {
    id: 20,
    icon: 'i-lucide-check-circle',
    title: 'All checks passed',
    body: 'CI pipeline green on branch main — deploy ready',
    timeAgo: '14h ago',
    unread: false,
  },
  {
    id: 21,
    icon: 'i-lucide-git-pull-request',
    title: 'PR #1143 opened',
    body: 'chore: update dependencies to latest stable',
    timeAgo: 'Yesterday',
    unread: false,
  },
  {
    id: 22,
    icon: 'i-lucide-server',
    title: 'Pod restarted',
    body: 'api-server-7d6b9 restarted — OOMKilled event',
    timeAgo: 'Yesterday',
    unread: false,
  },
  {
    id: 23,
    icon: 'i-lucide-message-square',
    title: 'Zhang Wei replied',
    body: 'Review comments addressed — ready for re-review',
    timeAgo: 'Yesterday',
    unread: false,
  },
  {
    id: 24,
    icon: 'i-lucide-calendar',
    title: 'Sprint 42 started',
    body: '18 story points planned for the current sprint',
    timeAgo: '2d ago',
    unread: false,
  },
  {
    id: 25,
    icon: 'i-lucide-award',
    title: 'Certification renewed',
    body: 'SOC2 Type II audit completed successfully',
    timeAgo: '2d ago',
    unread: false,
  },
  {
    id: 26,
    icon: 'i-lucide-bar-chart',
    title: 'Monthly report',
    body: 'February KPIs exported and shared with stakeholders',
    timeAgo: '3d ago',
    unread: false,
  },
  {
    id: 27,
    icon: 'i-lucide-upload-cloud',
    title: 'Schema migration',
    body: 'v3.4.0 migration ran in 42s with no downtime',
    timeAgo: '3d ago',
    unread: false,
  },
  {
    id: 28,
    icon: 'i-lucide-code-2',
    title: 'Code review needed',
    body: '4 pull requests are awaiting your review',
    timeAgo: '4d ago',
    unread: false,
  },
  {
    id: 29,
    icon: 'i-lucide-refresh-cw',
    title: 'Cache cleared',
    body: 'Redis flush completed — all keys evicted cleanly',
    timeAgo: '4d ago',
    unread: false,
  },
  {
    id: 30,
    icon: 'i-lucide-terminal',
    title: 'CLI v2.1 released',
    body: 'New commands: audit, validate, sync available',
    timeAgo: '5d ago',
    unread: false,
  },
  {
    id: 31,
    icon: 'i-lucide-link',
    title: 'Integration active',
    body: 'Jira ↔ Linear sync enabled for Project X',
    timeAgo: '5d ago',
    unread: false,
  },
  {
    id: 32,
    icon: 'i-lucide-eye',
    title: 'Monitoring alert',
    body: 'Error rate crossed 0.5% threshold for 5 minutes',
    timeAgo: '6d ago',
    unread: false,
  },
  {
    id: 33,
    icon: 'i-lucide-user-check',
    title: 'Access granted',
    body: 'Contractor account activated for 30-day period',
    timeAgo: '6d ago',
    unread: false,
  },
  {
    id: 34,
    icon: 'i-lucide-git-merge',
    title: 'Branch merged',
    body: 'release/3.4.0 → main merged with no conflicts',
    timeAgo: '1w ago',
    unread: false,
  },
  {
    id: 35,
    icon: 'i-lucide-volume-2',
    title: 'Announcement',
    body: 'Platform maintenance window: Sunday 02:00 UTC',
    timeAgo: '1w ago',
    unread: false,
  },
  {
    id: 36,
    icon: 'i-lucide-file-text',
    title: 'Docs updated',
    body: 'API reference v3 published to developer portal',
    timeAgo: '1w ago',
    unread: false,
  },
  {
    id: 37,
    icon: 'i-lucide-wifi-off',
    title: 'Region degraded',
    body: 'ap-east-1 experiencing elevated latency',
    timeAgo: '1w ago',
    unread: false,
  },
  {
    id: 38,
    icon: 'i-lucide-sparkles',
    title: 'Feature shipped',
    body: 'Dark mode v2 rolled out to all users globally',
    timeAgo: '2w ago',
    unread: false,
  },
  {
    id: 39,
    icon: 'i-lucide-archive',
    title: 'Old data archived',
    body: '2023 audit logs moved to cold storage tier',
    timeAgo: '2w ago',
    unread: false,
  },
  {
    id: 40,
    icon: 'i-lucide-check-square',
    title: 'Checklist complete',
    body: 'Q1 OKR review completed and signed off by leads',
    timeAgo: '2w ago',
    unread: false,
  },
])

const visibilityToken = computed<string>(() => `visibility='${visibility.value}'`)
const deferToken = computed<string>(() => `defer=${deferInit.value ? 'true' : 'false'}`)

function levelToSeverity(level: LogLevel): 'info' | 'success' | 'warn' | 'danger' {
  const map: Record<LogLevel, 'info' | 'success' | 'warn' | 'danger'> = {
    info: 'info',
    success: 'success',
    warn: 'warn',
    error: 'danger',
  }
  return map[level]
}

function logRowBg(level: LogLevel): string {
  const map: Record<LogLevel, string> = {
    info: '',
    success: 'bg-success/5',
    warn: 'bg-warn/5',
    error: 'bg-danger/5',
  }
  return map[level]
}

function statusDotClass(status: MemberStatus): string {
  const map: Record<MemberStatus, string> = {
    online: 'bg-success',
    busy: 'bg-danger',
    away: 'bg-warn',
    offline: 'bg-muted-foreground/40',
  }
  return map[status]
}

async function copyText(text: string, label: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)
    window.$toast?.add({
      severity: 'success',
      summary: '已复制',
      detail: `类名: ${text} (${label})`,
      life: 2000,
      group: COPY_TOAST_GROUP,
    })
  } catch {
    window.$toast?.add({
      severity: 'error',
      summary: '复制失败',
      detail: '请检查剪贴板权限',
      life: 2000,
      group: COPY_TOAST_GROUP,
    })
  }
}

function readOverlayMaxTop(instanceElements: unknown): number {
  if (!instanceElements || typeof instanceElements !== 'object') return 0
  const elementsRecord = instanceElements as Record<string, unknown>
  const viewport = elementsRecord.viewport
  if (!viewport || typeof viewport !== 'object') return 0
  const viewportRecord = viewport as Record<string, unknown>
  const scrollHeight =
    typeof viewportRecord.scrollHeight === 'number' ? viewportRecord.scrollHeight : 0
  const clientHeight =
    typeof viewportRecord.clientHeight === 'number' ? viewportRecord.clientHeight : 0
  return Math.max(0, scrollHeight - clientHeight)
}

function computeTargetTop(target: 'top' | 'middle' | 'bottom', maxTop: number): number {
  if (target === 'top') return 0
  if (target === 'middle') return maxTop / 2
  return maxTop
}

function scrollOverlayTo(target: 'top' | 'middle' | 'bottom'): void {
  const instance = overlayScrollbarRef.value?.getInstance()
  if (!instance) return
  const elementsUnknown: unknown = instance.elements()
  const maxTop = readOverlayMaxTop(elementsUnknown)
  const top = computeTargetTop(target, maxTop)
  overlayScrollbarRef.value?.scrollTo({ top })
  lastScrollTarget.value = target
  lastScrollTop.value = top
}

function toggleDark(next: boolean): void {
  themeStore.setMode(next ? 'dark' : 'light')
}
</script>

<template>
  <div data-archetype="A1-toolbar-content">
    <CScrollbar>
      <div class="layout-narrow">
        <header class="col-stretch gap-xs md:gap-sm">
          <h1 class="text-2xl font-bold text-foreground m-0 tracking-tight">
            CScrollbar · Scroll Lab
          </h1>
          <p class="text-sm text-muted-foreground m-0">
            Native 与 OverlayScrollbars 的统一展陈页：可视化对比、程序化滚动、Nested 独立性。
          </p>
          <div class="text-xs text-muted-foreground row-start gap-xs flex-wrap">
            <span>快捷参数：</span>
            <Button
              label="visibility"
              text
              size="small"
              class="p-0 h-auto underline decoration-primary/40 underline-offset-2"
              @click="copyText(visibilityToken, 'CScrollbar visibility prop')"
            />
            <span class="font-mono text-foreground">{{ visibilityToken }}</span>
            <span class="text-muted-foreground/40">·</span>
            <Button
              label="defer"
              text
              size="small"
              class="p-0 h-auto underline decoration-primary/40 underline-offset-2"
              @click="copyText(deferToken, 'CScrollbar defer prop')"
            />
            <span class="font-mono text-foreground">{{ deferToken }}</span>
          </div>
        </header>

        <section class="material-elevated col-stretch gap-lg">
          <div class="col-stretch gap-xs">
            <h2 class="text-lg font-semibold text-foreground m-0">
              Section 1 · Controls + Comparator
            </h2>
            <p class="text-xs text-muted-foreground m-0">
              先配置 Overlay 行为，再观察 Native 与 Overlay 的滚动和视觉差异。
            </p>
          </div>

          <div class="demo-well col-stretch gap-md">
            <div class="row-between items-end gap-md flex-wrap">
              <div class="col-stretch gap-xs">
                <span class="text-sm font-semibold text-foreground">Comparator Controls</span>
                <span class="text-xs text-muted-foreground">
                  Visibility / Defer 仅影响 Overlay，Native 仍由浏览器和系统控制。
                </span>
              </div>
              <div class="row-end gap-lg flex-wrap">
                <div class="col-stretch gap-xs">
                  <label class="text-xs text-muted-foreground">Visibility</label>
                  <Select
                    v-model="visibility"
                    :options="visibilityOptions"
                    option-label="label"
                    option-value="value"
                    class="w-full"
                  />
                </div>
                <div class="col-stretch gap-xs">
                  <label class="text-xs text-muted-foreground">Defer init</label>
                  <ToggleSwitch
                    :model-value="deferInit"
                    @update:model-value="(v: boolean) => (deferInit = v)"
                  />
                </div>
                <div class="col-stretch gap-xs">
                  <label class="text-xs text-muted-foreground">Dark mode</label>
                  <ToggleSwitch
                    :model-value="isDark"
                    @update:model-value="(v: boolean) => toggleDark(v)"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div class="demo-well col-stretch">
              <div class="row-between items-center border-b border-border/30 px-sm py-xs">
                <div class="row-start gap-xs items-center">
                  <Icons
                    name="i-lucide-terminal"
                    size="sm"
                    class="text-muted-foreground"
                  />
                  <span class="text-sm font-semibold text-foreground">Native Scrollbar</span>
                </div>
                <div class="row-end gap-sm">
                  <Tag
                    value="System Logs"
                    severity="secondary"
                  />
                  <Button
                    text
                    size="small"
                    label="copy"
                    class="p-0 h-auto text-muted-foreground/40 hover:text-primary"
                    @click="copyText('native=true', 'CScrollbar native prop')"
                  />
                </div>
              </div>
              <div class="demo-stage p-sm h-40vh">
                <CScrollbar
                  :native="true"
                  :visibility="visibility"
                  :defer="deferInit"
                >
                  <div class="col-stretch gap-xs p-xs">
                    <div
                      v-for="entry in mockLogs"
                      :key="`native-log-${entry.id}`"
                      class="interactive-item row-start gap-sm items-start rounded-md px-xs py-xs"
                      :class="logRowBg(entry.level)"
                    >
                      <span
                        class="text-xs font-mono text-muted-foreground shrink-0 w-[var(--spacing-4xl)] pt-xs"
                      >
                        {{ entry.timestamp }}
                      </span>
                      <Tag
                        :value="entry.level.toUpperCase()"
                        :severity="levelToSeverity(entry.level)"
                        class="shrink-0 text-xs"
                      />
                      <div class="col-stretch gap-xs min-w-0">
                        <span class="text-xs font-semibold text-foreground">
                          {{ entry.source }}
                        </span>
                        <span class="text-xs text-muted-foreground text-ellipsis-1">
                          {{ entry.message }}
                        </span>
                      </div>
                    </div>
                  </div>
                </CScrollbar>
              </div>
            </div>

            <div class="demo-well col-stretch">
              <div class="row-between items-center border-b border-border/30 px-sm py-xs">
                <div class="row-start gap-xs items-center">
                  <Icons
                    name="i-lucide-users"
                    size="sm"
                    class="text-muted-foreground"
                  />
                  <span class="text-sm font-semibold text-foreground">Overlay Scrollbar</span>
                </div>
                <div class="row-end gap-sm">
                  <Tag
                    value="Team Members"
                    severity="info"
                  />
                  <Button
                    text
                    size="small"
                    label="copy"
                    class="p-0 h-auto text-muted-foreground/40 hover:text-primary"
                    @click="copyText('native=false', 'CScrollbar native prop')"
                  />
                </div>
              </div>
              <div class="demo-stage p-sm h-40vh">
                <CScrollbar
                  ref="overlayScrollbarRef"
                  :native="false"
                  :visibility="visibility"
                  :defer="deferInit"
                  @initialized="() => (overlayInitialized = true)"
                  @updated="() => (overlayUpdatedCount += 1)"
                >
                  <div class="col-stretch gap-xs p-xs">
                    <div
                      v-for="member in mockMembers"
                      :key="`member-${member.id}`"
                      class="interactive-item rounded-md px-sm py-xs row-between items-center gap-sm"
                    >
                      <div class="row-start gap-sm items-center min-w-0">
                        <div class="relative shrink-0">
                          <Avatar
                            :label="member.initials"
                            shape="circle"
                          />
                          <span
                            class="absolute bottom-0 right-0 w-[var(--spacing-sm)] h-[var(--spacing-sm)] rounded-full border-2 border-card"
                            :class="statusDotClass(member.status)"
                          />
                        </div>
                        <div class="col-stretch gap-xs min-w-0">
                          <span class="text-sm font-semibold text-foreground text-ellipsis-1">
                            {{ member.name }}
                          </span>
                          <span class="text-xs text-muted-foreground">{{ member.role }}</span>
                        </div>
                      </div>
                      <Tag
                        :value="member.department"
                        severity="secondary"
                        rounded
                        class="shrink-0"
                      />
                    </div>
                  </div>
                </CScrollbar>
              </div>
            </div>
          </div>
        </section>

        <section class="material-elevated col-stretch gap-lg">
          <div class="col-stretch gap-xs">
            <h2 class="text-lg font-semibold text-foreground m-0">
              Section 2 · Programmatic Scroll + Status
            </h2>
            <p class="text-xs text-muted-foreground m-0">
              使用统一按钮控制 Overlay 滚动位置，并实时观察实例状态与目标偏移。
            </p>
          </div>
          <div class="demo-well col-stretch gap-sm">
            <div class="row-between gap-md items-center flex-wrap">
              <div class="col-stretch gap-xs">
                <span class="text-sm font-semibold text-foreground">Scroll To · Overlay</span>
                <span class="text-xs text-muted-foreground">
                  Top / Middle / End 程序化滚动控制。
                </span>
              </div>
              <div class="row-end gap-xs">
                <Button
                  label="↑ Top"
                  size="small"
                  :outlined="lastScrollTarget !== 'top'"
                  :severity="lastScrollTarget === 'top' ? 'primary' : 'secondary'"
                  @click="scrollOverlayTo('top')"
                />
                <Button
                  label="↕ Mid"
                  size="small"
                  :outlined="lastScrollTarget !== 'middle'"
                  :severity="lastScrollTarget === 'middle' ? 'primary' : 'secondary'"
                  @click="scrollOverlayTo('middle')"
                />
                <Button
                  label="↓ End"
                  size="small"
                  :outlined="lastScrollTarget !== 'bottom'"
                  :severity="lastScrollTarget === 'bottom' ? 'primary' : 'secondary'"
                  @click="scrollOverlayTo('bottom')"
                />
              </div>
            </div>
            <div class="demo-stage p-sm col-stretch gap-xs">
              <div class="row-between gap-md flex-wrap">
                <span class="text-xs text-muted-foreground">
                  Overlay status:
                  <span class="font-mono text-foreground">
                    {{ overlayInitialized ? 'ready' : 'initializing' }}
                  </span>
                  <span class="text-muted-foreground/40 mx-xs">·</span>
                  updates:
                  <span class="font-mono text-foreground">{{ overlayUpdatedCount }}</span>
                </span>
                <span class="text-xs text-muted-foreground">
                  target:
                  <span class="font-mono text-foreground">{{ lastScrollTarget ?? '—' }}</span>
                  <span class="text-muted-foreground/40 mx-xs">·</span>
                  scrollTop:
                  <span class="font-mono text-foreground">{{ Math.round(lastScrollTop) }}</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        <section class="material-elevated col-stretch gap-lg">
          <div class="col-stretch gap-xs">
            <h2 class="text-lg font-semibold text-foreground m-0">
              Section 3 · Nested Scrollbars + Behavior Notes
            </h2>
            <p class="text-xs text-muted-foreground m-0">
              父子容器均使用 Overlay，验证 thumb 独立性、自动隐藏与主题响应行为。
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div class="col-stretch gap-sm">
              <div class="row-between items-center">
                <span class="text-sm font-semibold text-foreground">Parent CScrollbar</span>
                <Button
                  text
                  size="small"
                  label="copy"
                  class="p-0 h-auto text-muted-foreground/40 hover:text-primary"
                  @click="copyText('CScrollbar', 'component name')"
                />
              </div>
              <div class="demo-well col-stretch">
                <div class="demo-stage p-sm h-40vh">
                  <CScrollbar
                    :native="false"
                    visibility="visible"
                    :defer="deferInit"
                  >
                    <div class="col-stretch gap-xs p-xs">
                      <div
                        v-for="notif in mockNotifications"
                        :key="`notif-${notif.id}`"
                        class="interactive-item rounded-md px-sm py-xs row-start gap-sm items-start"
                      >
                        <div class="relative shrink-0 mt-xs">
                          <Icons
                            :name="notif.icon"
                            size="sm"
                            :class="notif.unread ? 'text-primary' : 'text-muted-foreground'"
                          />
                          <span
                            v-if="notif.unread"
                            class="absolute -top-1 -right-1 w-[var(--spacing-xs)] h-[var(--spacing-xs)] rounded-full bg-primary"
                          />
                        </div>
                        <div class="col-stretch gap-xs min-w-0">
                          <div class="row-between items-start gap-sm">
                            <span
                              class="text-xs font-semibold"
                              :class="notif.unread ? 'text-primary' : 'text-foreground'"
                            >
                              {{ notif.title }}
                            </span>
                            <span class="text-xs text-muted-foreground text-no-wrap shrink-0">
                              {{ notif.timeAgo }}
                            </span>
                          </div>
                          <span class="text-xs text-muted-foreground text-ellipsis-1">
                            {{ notif.body }}
                          </span>
                        </div>
                      </div>

                      <div class="demo-well col-stretch gap-xs mt-xs">
                        <div class="row-between items-center">
                          <span class="text-xs font-semibold text-muted-foreground">
                            Child container
                          </span>
                          <Tag
                            value="Inner handle"
                            severity="secondary"
                          />
                        </div>
                        <div class="demo-stage p-xs h-40vh">
                          <CScrollbar
                            :native="false"
                            visibility="auto"
                            :defer="deferInit"
                          >
                            <div class="col-stretch gap-xs p-xs">
                              <div
                                v-for="member in mockMembers.slice(0, 20)"
                                :key="`child-member-${member.id}`"
                                class="interactive-item rounded-md px-xs py-xs row-start gap-xs items-center border border-border/20 bg-background/30"
                              >
                                <span class="text-xs font-mono text-muted-foreground shrink-0">
                                  {{ member.initials }}
                                </span>
                                <span class="text-xs text-foreground text-ellipsis-1">
                                  {{ member.name }}
                                </span>
                                <span
                                  class="w-[var(--spacing-xs)] h-[var(--spacing-xs)] rounded-full shrink-0 ml-auto"
                                  :class="statusDotClass(member.status)"
                                />
                              </div>
                            </div>
                          </CScrollbar>
                        </div>
                      </div>
                    </div>
                  </CScrollbar>
                </div>
              </div>
            </div>

            <div class="col-stretch gap-sm">
              <div class="row-between items-center">
                <span class="text-sm font-semibold text-foreground">Behavior Notes</span>
                <Button
                  text
                  size="small"
                  label="autoHide='leave'"
                  class="p-0 h-auto text-xs text-muted-foreground/40 hover:text-primary"
                  @click="copyText('autoHide: leave', 'OverlayScrollbars autoHide mode')"
                />
              </div>
              <div class="demo-well col-stretch gap-sm">
                <div class="demo-stage p-md col-stretch gap-sm">
                  <div class="row-start gap-sm items-start">
                    <span class="text-xs font-mono text-primary shrink-0 mt-xs">01</span>
                    <span class="text-xs text-muted-foreground">
                      <span class="font-semibold text-foreground">Overlay auto-hide：</span>
                      `visibility=auto` 时，thumb 在鼠标移开后自动淡出。
                    </span>
                  </div>
                  <div class="row-start gap-sm items-start">
                    <span class="text-xs font-mono text-primary shrink-0 mt-xs">02</span>
                    <span class="text-xs text-muted-foreground">
                      <span class="font-semibold text-foreground">Native 对比基准：</span>
                      Native 行为由浏览器与系统实现决定，不受该参数控制。
                    </span>
                  </div>
                  <div class="row-start gap-sm items-start">
                    <span class="text-xs font-mono text-primary shrink-0 mt-xs">03</span>
                    <span class="text-xs text-muted-foreground">
                      <span class="font-semibold text-foreground">主题响应：</span>
                      Overlay 使用语义 token，深浅模式切换后 thumb 自动匹配。
                    </span>
                  </div>
                  <div class="row-start gap-sm items-start">
                    <span class="text-xs font-mono text-primary shrink-0 mt-xs">04</span>
                    <span class="text-xs text-muted-foreground">
                      <span class="font-semibold text-foreground">Nested 独立性：</span>
                      父子容器持有独立实例，滚动与 thumb 渲染互不干扰。
                    </span>
                  </div>
                  <div class="row-start gap-sm items-start">
                    <span class="text-xs font-mono text-primary shrink-0 mt-xs">05</span>
                    <span class="text-xs text-muted-foreground">
                      <span class="font-semibold text-foreground">Scroll To API：</span>
                      使用 `scrollTo({ top })` 可精确控制 Overlay 滚动位置。
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </CScrollbar>
  </div>
</template>

<style lang="scss" scoped></style>
