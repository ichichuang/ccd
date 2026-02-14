<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Popover from 'primevue/popover'
import Avatar from 'primevue/avatar'
import Button from 'primevue/button'
import { AUTH_ENABLED } from '@/constants/router'
import { useUserStore } from '@/stores/modules/user'
import defaultAvatar from '@/assets/images/default-avatar.jpeg'

const { t } = useI18n()
const userStore = useUserStore()

const popoverRef = ref<InstanceType<typeof Popover> | null>(null)

const isLogin = computed(() => userStore.getIsLogin)
const userInfo = computed(() => userStore.getUserInfo)

// 是否渲染用户入口：仅在开启登录模式且已登录时展示
const shouldRender = computed(() => AUTH_ENABLED && isLogin.value)

// 头像地址：优先使用用户头像，缺省时使用默认头像
const avatarSrc = computed(() => userInfo.value.avatar || defaultAvatar)

const togglePanel = (event: MouseEvent) => {
  if (!shouldRender.value) return
  popoverRef.value?.toggle(event)
}

const onLogout = async () => {
  await userStore.logout()
}
</script>

<template>
  <div
    v-if="shouldRender"
    class="flex items-center"
  >
    <!-- 头像入口按钮 -->
    <Button
      variant="text"
      severity="secondary"
      class="center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      @click="togglePanel"
    >
      <Avatar
        :image="avatarSrc"
        shape="circle"
      />
    </Button>

    <!-- 用户信息下拉面板（PrimeVue Popover） -->
    <Popover
      ref="popoverRef"
      :dismissable="true"
      class="border border-border"
    >
      <div class="column gap-sm">
        <div class="flex items-center gap-sm">
          <Avatar
            :image="avatarSrc"
            shape="circle"
          />
          <div class="flex flex-col">
            <span class="fs-sm font-medium">
              {{ userInfo.username || t('user.unnamedUser') }}
            </span>
            <span class="fs-xs text-muted-foreground">
              {{ (userInfo.roles || []).join(' / ') || t('user.noRole') }}
            </span>
          </div>
        </div>

        <div class="fs-xs text-muted-foreground mt-margin-xs">
          <div v-if="userInfo.email">{{ t('user.email') }}：{{ userInfo.email }}</div>
          <div v-if="userInfo.phone">{{ t('user.phone') }}：{{ userInfo.phone }}</div>
        </div>

        <div class="mt-margin-sm">
          <Button
            class="w-full"
            :label="t('user.logout')"
            severity="danger"
            size="small"
            @click="onLogout"
          />
        </div>
      </div>
    </Popover>
  </div>
</template>
