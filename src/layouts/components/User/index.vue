<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Popover from 'primevue/popover'
import Button from 'primevue/button'
import { AUTH_ENABLED } from '@/constants/router'
import { useUserStore } from '@/stores/modules/user'
import defaultAvatar from '@/assets/images/default-avatar.jpeg'
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
  await router.push('/login')
}
</script>

<template>
  <div
    v-if="shouldRender"
    class="h-full size-1-1 rounded-full center"
  >
    <!-- 头像入口按钮 -->
    <img
      class="layout-full! cursor-pointer rounded-full"
      :src="avatarSrc"
      @click="togglePanel"
    />
    <!-- 用户信息下拉面板（PrimeVue Popover） -->
    <Popover
      ref="popoverRef"
      :dismissable="true"
    >
      <div class="column gap-md">
        <div class="grid grid-cols-2 gap-md">
          <img
            :src="avatarSrc"
            class="w-[var(--spacing-3xl)]! h-[var(--spacing-3xl)]! rounded-full"
          />
          <div class="h-full flex flex-col justify-between py-xs">
            <span class="fs-2xl font-black text-foreground">
              {{ userInfo.username || t('user.unnamedUser') }}
            </span>
            <span class="fs-xs text-muted-foreground">
              {{ (userInfo.roles || []).join(' / ') || t('user.noRole') }}
            </span>
          </div>
        </div>
        <div v-if="userInfo.email">{{ t('user.email') }}：{{ userInfo.email }}</div>
        <div v-if="userInfo.phone">{{ t('user.phone') }}：{{ userInfo.phone }}</div>
        <GlobalSetting>
          <Button
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
