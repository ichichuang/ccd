<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Popover from 'primevue/popover'
import Button from 'primevue/button'
import { AUTH_ENABLED } from '@/constants/router'
import { useUserStore } from '@/stores/modules/session'
import defaultAvatar from '@/assets/images/default-avatar.png'
import GlobalSetting from '@/layouts/components/GlobalSetting/index.vue'

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore()

const popoverRef = ref<InstanceType<typeof Popover> | null>(null)

const isLogin = computed(() => userStore.getIsLogin)
const userInfo = computed(() => userStore.getUserInfo)

// 是否渲染用户入口：仅在开启登录模式且已登录时展示
const shouldRender = computed(() => AUTH_ENABLED && isLogin.value)

// 头像地址：优先使用用户头像，缺省时使用默认头像
// 生产构建后 /src/ 不存在，过滤 persisted 或后端返回的无效本地路径，避免 404
const avatarSrc = computed(() => {
  const av = userInfo.value.avatar
  if (!av || typeof av !== 'string') return defaultAvatar
  if (av.startsWith('/src/')) return defaultAvatar
  return av
})

const togglePanel = (event: MouseEvent) => {
  if (!shouldRender.value) return
  popoverRef.value?.toggle(event)
}

const onLogout = async () => {
  await userStore.logout()
  popoverRef.value?.hide()
  // Smooth reset via Vue Router
  const currentPath = router.currentRoute.value.fullPath
  await router.replace({
    path: '/login',
    query: currentPath !== '/login' ? { redirect: currentPath } : {},
  })
}
</script>

<template>
  <div
    v-if="shouldRender"
    class="layout-full center"
  >
    <!-- 头像入口按钮 -->
    <div
      id="user-entry-trigger"
      class="h-full size-1-1 rounded-full bg-transparent border-none p-0 outline-none cursor-pointer"
      @click="togglePanel"
    >
      <img
        class="layout-full rounded-full"
        :src="avatarSrc"
      />
    </div>
    <!-- 用户信息下拉面板（PrimeVue Popover） -->
    <Popover
      ref="popoverRef"
      :dismissable="true"
    >
      <div
        class="col-center gap-md"
        @dragstart.prevent
      >
        <div class="grid grid-cols-2 gap-md">
          <img
            :src="avatarSrc"
            class="w-[var(--spacing-3xl)]! h-[var(--spacing-3xl)]! rounded-full"
          />
          <div class="h-full flex flex-col justify-between py-xs">
            <span class="text-2xl font-black text-foreground">
              {{ userInfo.username || t('user.unnamedUser') }}
            </span>
            <span class="text-xs text-muted-foreground">
              {{ (userInfo.roles || []).join(' / ') || t('user.noRole') }}
            </span>
          </div>
        </div>
        <div v-if="userInfo.email">{{ t('user.email') }}：{{ userInfo.email }}</div>
        <div v-if="userInfo.phone">{{ t('user.phone') }}：{{ userInfo.phone }}</div>
        <GlobalSetting>
          <Button
            id="user-open-global-settings"
            class="w-full"
            :label="t('layout.openGlobalSettings')"
          />
        </GlobalSetting>
        <Button
          class="w-full"
          :label="t('user.logout')"
          severity="danger"
          @click="onLogout"
        />
      </div>
    </Popover>
  </div>
</template>
