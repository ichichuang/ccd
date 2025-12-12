<script setup lang="ts">
import { login } from '@/api'
import { useThemeSwitch } from '@/hooks'
import { t } from '@/locales'
import { useUserStoreWithOut } from '@/stores'
import { env } from '@/utils'
import { ref } from 'vue'
const title = env.appTitle
const { toggleThemeWithAnimation, isDark } = useThemeSwitch()
const userStore = useUserStoreWithOut()
const loading = ref(false)

const handleLogin = async () => {
  loading.value = true

  try {
    // 响应拦截器已经返回了 data 字段，所以返回的就是 { token: string }
    const { token } = await login({ username: 'admin', password: '123456' })

    if (!token) {
      throw new Error(t('common.messages.loginFailed'))
    }

    // setToken 会异步获取用户信息并设置，如果失败会抛出错误
    await userStore.setToken(token)

    // 登录成功提示
    if (window.$toast) {
      window.$toast.success(t('common.messages.loginSuccess'), t('common.messages.welcomeMessage'))
    }
  } catch (error) {
    console.error(`❌ ${t('common.messages.loginFailed')}:`, error)

    // 显示错误提示
    const errorMessage = error instanceof Error ? error.message : t('common.messages.loginFailed')
    if (window.$toast) {
      window.$toast.error(t('common.messages.loginFailed'), errorMessage)
    }

    // 登录失败时，清除用户信息（但不刷新页面，让用户看到错误信息）
    userStore.clearUserInfo()
  } finally {
    loading.value = false
  }
}
</script>

<template lang="pug">
.login-page.select-none
  //- 工具
  .fixed.z-999.t-gapl.r-gapl
    .c-card-primary.p-padding.c-transitions.size-1-1(
      @click='toggleThemeWithAnimation($event)',
      @touch='toggleThemeWithAnimation($event)'
    )
      template(v-if='isDark')
        Icons(name='ri-moon-clear-line', size='m')
      template(v-else)
        Icons(name='ri-sun-line', size='m')

  // 动态背景色块
  .bg-blob.bg-1
  .bg-blob.bg-2
  .login-hero
    .hero-grid
    .hero-glow

  // 登录卡片 (已优化布局和样式)
  AnimateWrapper(:show='true', enter='zoomIn', duration='800ms')
    .login-card.rounded-xl(
      class='w-96% sm:w-80% md:w-46% lg:w-30% xl:w-28% xxl:w-26% py-8% sm:py-6% md:py-4% lg:py-2%'
    )
      AnimateWrapper(:show='true', enter='fadeInDown', duration='800ms', enter-delay='800ms')
        .login-badge
          span {{ title }}
      .login-subtitle {{ t('common.actions.welcome') }}

      // 增强的插画/头像区域
      AnimateWrapper(:show='true', enter='zoomIn', duration='800ms', enter-delay='400ms')
        .login-illustration.bg-red
          // 使用您原有的 Image 组件和本地资源
          Image.size-1-1(src='./face.png')
          .floating-pulse

      // 动作按钮
      AnimateWrapper(:show='true', enter='fadeInUp', duration='800ms', enter-delay='800ms')
        .login-actions
          // 使用您原有的 Button 组件
          Button.full(size='large', :disabled='loading', @click='handleLogin') {{ loading ? t('common.actions.loginInProgress') : t('common.actions.enterSystem') }}
</template>

<style scoped lang="scss">
// 确保按钮的样式能够被识别（针对您的 Button 组件）
.login-actions {
  // ... (其他样式)
  :deep(.p-button),
  .p-button {
    /* 确保您的 Button 组件样式能覆盖 */
    // 增强按钮阴影和提升感
    box-shadow:
      0 14px 35px color-mix(in srgb, var(--primary100) 35%, transparent),
      0 4px 12px color-mix(in srgb, var(--bg300) 40%, transparent);
    transition:
      transform 0.2s cubic-bezier(0.3, 0.7, 0.4, 1.5),
      /* 使用更有弹性的缓动函数 */ box-shadow 0.25s ease;

    &:hover {
      transform: translateY(-4px) scale(1.01); /* 增加抬升幅度 */
      box-shadow:
        0 20px 45px color-mix(in srgb, var(--primary100) 45%, transparent),
        0 8px 18px color-mix(in srgb, var(--bg300) 50%, transparent);
    }

    // 确保高光动画也应用于您的 Button
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: linear-gradient(
        120deg,
        transparent 20%,
        rgba(255, 255, 255, 0.25) 40%,
        transparent 60%
      );
      transform: translateX(-100%);
      transition: transform 0.8s ease;
      pointer-events: none;
    }

    &:hover::after {
      transform: translateX(100%);
    }

    &[disabled] {
      cursor: not-allowed;
      opacity: 0.7;
      transform: none;
      box-shadow: none;
      &::after {
        display: none;
      }
    }
  }
}

.login-page {
  position: relative;
  // FIX 1: 使用 Flexbox 确保卡片在任何屏幕尺寸下都完美居中
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;

  // 增强背景渐变
  background:
    radial-gradient(
      circle at 10% 80%,
      color-mix(in srgb, var(--primary200) 18%, transparent),
      transparent 40%
    ),
    radial-gradient(
      circle at 90% 20%,
      color-mix(in srgb, var(--accent100) 25%, transparent),
      transparent 50%
    ),
    linear-gradient(135deg, var(--bg100) 0%, var(--bg200) 50%, var(--bg300) 100%);
  overflow: hidden;
  padding: 2rem;
  background-size: 150% 150%; // 增大背景尺寸，让动画更明显
  animation: bg-shift 16s ease-in-out infinite alternate; // 延长并调整动画
  will-change: background-position;

  &::after {
    // 柔和的暗角效果
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(circle at 50% 50%, transparent 60%, rgba(0, 0, 0, 0.25) 100%);
    mix-blend-mode: multiply;
  }
}

.login-hero {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

// 动态网格背景
.hero-grid {
  position: absolute;
  inset: -10%; // 扩大网格，避免动画时边缘穿帮
  background-image:
    linear-gradient(color-mix(in srgb, var(--primary200) 12%, transparent) 1px, transparent 1px),
    linear-gradient(
      90deg,
      color-mix(in srgb, var(--primary200) 12%, transparent) 1px,
      transparent 1px
    );
  background-size: 100px 100px; // 调整网格大小
  opacity: 0.2;
  animation:
    grid-move 18s linear infinite,
    grid-rotate 30s linear infinite;
}

// 柔和发光效果
.hero-glow {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(
      circle at 35% 65%,
      color-mix(in srgb, var(--primary100) 25%, transparent) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 65% 35%,
      color-mix(in srgb, var(--accent100) 28%, transparent) 0%,
      transparent 55%
    );
  filter: blur(50px);
  opacity: 0.7;
  animation: glow-shift 16s ease-in-out infinite alternate;
}

// 登录卡片
.login-card {
  position: relative;

  // 现代玻璃质感 (Glassmorphism-lite)
  background: color-mix(in srgb, var(--bg100) 90%, transparent); // 更透明
  border: 1px solid color-mix(in srgb, var(--primary200) 30%, var(--bg300) 70%);
  backdrop-filter: blur(20px); // 更强的模糊

  // 增强阴影，使卡片悬浮感更强
  box-shadow:
    0 40px 100px -20px color-mix(in srgb, var(--bg300) 50%, transparent),
    0 0 0 1px color-mix(in srgb, var(--primary200) 15%, transparent);

  display: grid;
  gap: 1.75rem;
  z-index: 10;
  // FIX 2: 增大卡片呼吸动画幅度
  animation: card-breathe 8s ease-in-out infinite;
}

.login-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  font-weight: 700;
  border-radius: 999px;
  color: var(--text100);
  background: color-mix(in srgb, var(--primary200) 30%, transparent);
  border: 1px solid color-mix(in srgb, var(--primary200) 50%, transparent);
  width: fit-content;
  margin: 0 auto; // 居中徽章
  animation: float-y 5s ease-in-out infinite alternate;
}

.login-subtitle {
  font-size: 1.1rem;
  color: var(--text200);
  text-align: center;
  font-weight: 500;
}

.login-illustration {
  position: relative;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  border-radius: 20px;
  background: color-mix(in srgb, var(--bg200) 75%, transparent);
  border: 2px solid color-mix(in srgb, var(--primary200) 35%, transparent);
  overflow: hidden;
  animation: float-y-slow 9s ease-in-out infinite alternate; // 独立慢速浮动

  :deep(img) {
    width: 180px;
    height: 180px;
    object-fit: contain;
    // 增强光影效果
    filter: drop-shadow(0 15px 30px color-mix(in srgb, var(--primary200) 50%, transparent));
    transition: transform 0.3s ease;
  }
}

// 增强脉冲效果
.floating-pulse {
  position: absolute;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--accent100) 35%, transparent) 0%,
    transparent 70%
  );
  filter: blur(25px);
  animation: pulse 3s ease-in-out infinite alternate; // 加快脉冲速度
}

.login-actions {
  display: grid;
  gap: 0.75rem;

  // 确保您的 Button 组件的样式
  :deep(.p-button),
  .p-button {
    cursor: pointer;
    border: none;
    position: relative;
    overflow: hidden;
    padding: 1rem 1.5rem;
    font-size: 1.05rem;
    font-weight: 700;
    border-radius: 16px;
  }
}

// 动态色块 (Blobs)
.bg-blob {
  position: absolute;
  width: 600px;
  height: 600px; // 增大尺寸
  border-radius: 50%;
  filter: blur(150px); // 增大模糊
  opacity: 0.6; // 增大不透明度
  pointer-events: none;
  mix-blend-mode: screen;
  animation: blob-move 18s ease-in-out infinite alternate; // 调整动画时间
  will-change: transform;

  &.bg-1 {
    background: color-mix(in srgb, var(--primary200) 50%, transparent);
    top: 5%;
    left: 8%;
    animation-delay: 0s;
  }

  &.bg-2 {
    background: color-mix(in srgb, var(--accent100) 60%, transparent);
    bottom: 8%;
    right: 10%;
    animation-duration: 20s;
    animation-delay: 2s;
  }
}

// --- 增强 Keyframes 动画幅度 ---

@keyframes bg-shift {
  0%,
  100% {
    background-position: 0% 0%;
  }
  50% {
    background-position: 50% 50%; // 增大位移
  }
}

@keyframes blob-move {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 0.6;
  }
  25% {
    transform: translate(-180px, 120px) scale(1.2); // 增大位移和缩放
    opacity: 0.8;
  }
  50% {
    transform: translate(160px, -110px) scale(0.95);
    opacity: 0.7;
  }
  75% {
    transform: translate(-140px, -100px) scale(1.25);
    opacity: 0.9;
  }
  100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.6;
  }
}

@keyframes card-breathe {
  0%,
  100% {
    transform: translateY(0);
    box-shadow:
      0 40px 100px -20px color-mix(in srgb, var(--bg300) 45%, transparent),
      0 0 0 1px color-mix(in srgb, var(--primary200) 15%, transparent);
  }
  50% {
    transform: translateY(-8px); // 增加呼吸位移到 8px
    box-shadow:
      0 50px 120px -15px color-mix(in srgb, var(--bg300) 55%, transparent),
      0 0 0 2px color-mix(in srgb, var(--primary200) 20%, transparent);
  }
}

@keyframes float-y {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-12px); // 增加浮动位移到 12px
  }
}

@keyframes float-y-slow {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-8px) rotate(-1deg);
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(0.9);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.15); // 增加脉冲缩放
    opacity: 1;
  }
}

@keyframes grid-rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(1turn);
  }
}

@keyframes glow-shift {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translate3d(20px, -20px, 0) scale(1.1); // 增大光晕位移和缩放
    opacity: 0.85;
  }
}
</style>
