// src/types/index.d.ts

// [Systems] 核心架构系统 (按依赖顺序优先加载)
import '@/types/systems/theme'
import '@/types/systems/size'
import '@/types/systems/layout'
import '@/types/systems/device'

// [Modules] 业务/库扩展
import '@/types/modules/router'
import '@/types/modules/utils'
import '@/types/modules/vue'

// [Env] 环境变量 (可能依赖上述类型)
import '@/types/env'
