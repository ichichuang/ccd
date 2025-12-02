// 导入所有类型声明模块
import '@/types/modules/device'
import '@/types/modules/layout'
import '@/types/modules/router'
import '@/types/modules/theme'
import '@/types/modules/user'
import '@/types/modules/utils'
import '@/types/modules/vue'

// 注意：window.$toast 的类型定义在 PrimeVueToast.vue 中，这里不需要重复定义
// 如果需要在其他文件中使用类型，可以从 PrimeVueToast.vue 导入
