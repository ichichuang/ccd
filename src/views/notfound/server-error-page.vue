<script setup lang="ts">
import { t } from '@/locales'
import { env } from '@/utils'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const title = env.appTitle

const handleBackHome = () => {
  router.push('/')
}

// 创建漂浮粒子
interface Particle {
  x: number
  y: number
  size: number
  duration: number
  delay: number
  opacity: number
}

const particles = ref<Particle[]>([])

// 鼠标位置追踪（用于交互效果）
const mouseX = ref(0)
const mouseY = ref(0)
// 平滑插值的目标位置
const targetX = ref(0)
const targetY = ref(0)

const handleMouseMove = (event: MouseEvent) => {
  // 获取鼠标相对于页面的位置
  const pageElement = document.querySelector('.server-error-page') as HTMLElement
  if (pageElement) {
    const rect = pageElement.getBoundingClientRect()
    // 计算相对于容器的百分比位置
    targetX.value = ((event.clientX - rect.left) / rect.width) * 100
    targetY.value = ((event.clientY - rect.top) / rect.height) * 100
  } else {
    // 降级方案：使用窗口位置
    targetX.value = (event.clientX / window.innerWidth) * 100
    targetY.value = (event.clientY / window.innerHeight) * 100
  }

  // 如果动画未运行，启动它
  if (!isAnimating) {
    isAnimating = true
    animationFrameId = requestAnimationFrame(smoothUpdate)
  }
}

// 使用 requestAnimationFrame 实现平滑插值
let animationFrameId: number | null = null
let isAnimating = false

const smoothUpdate = () => {
  // 使用缓动函数实现平滑过渡
  const easing = 0.2
  const dx = targetX.value - mouseX.value
  const dy = targetY.value - mouseY.value

  // 如果差异很小，直接设置目标值
  if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) {
    mouseX.value = targetX.value
    mouseY.value = targetY.value
    isAnimating = false
    animationFrameId = null
    return
  }

  // 平滑插值
  mouseX.value += dx * easing
  mouseY.value += dy * easing

  // 继续动画
  animationFrameId = requestAnimationFrame(smoothUpdate)
}

// 鼠标光效样式 - 使用 CSS 变量和 transform 实现高性能跟踪
const mouseLightStyle = computed(() => {
  return {
    '--mouse-x': `${mouseX.value}%`,
    '--mouse-y': `${mouseY.value}%`,
  }
})

// 启动平滑更新循环
const startSmoothUpdate = () => {
  if (!isAnimating && animationFrameId === null) {
    isAnimating = true
    animationFrameId = requestAnimationFrame(smoothUpdate)
  }
}

// 获取粒子样式
const getParticleStyle = (particle: Particle) => {
  return {
    left: `${particle.x}%`,
    top: `${particle.y}%`,
    width: `${particle.size}px`,
    height: `${particle.size}px`,
    animationDuration: `${particle.duration}s`,
    animationDelay: `${particle.delay}s`,
    opacity: particle.opacity,
  }
}

onMounted(() => {
  // 生成更多随机粒子，增加视觉丰富度
  for (let i = 0; i < 30; i++) {
    particles.value.push({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 5 + 2,
      duration: Math.random() * 4 + 2,
      delay: Math.random() * 3,
      opacity: Math.random() * 0.5 + 0.3,
    })
  }

  // 初始化鼠标位置
  mouseX.value = 50
  mouseY.value = 50
  targetX.value = 50
  targetY.value = 50

  // 添加鼠标移动监听
  window.addEventListener('mousemove', handleMouseMove)
  // 启动平滑更新循环
  startSmoothUpdate()
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  // 清理动画帧
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
  isAnimating = false
})
</script>
<template lang="pug">
.server-error-page.full.select-none
  .not-found-container
    // 动态网格背景
    .grid-background

    // 漂浮粒子背景
    .particles
      .particle(
        v-for='(particle, index) in particles',
        :key='index',
        :style='getParticleStyle(particle)'
      )

    // 鼠标跟随光效
    .mouse-light(:style='mouseLightStyle')

    // 主要内容
    .content
      // 500 数字动画 - 添加分散聚拢效果
      .error-code-wrapper
        .error-code
          .digit-wrapper
            .digit 5
          .digit-wrapper
            .digit 0
          .digit-wrapper
            .digit 0
        // 装饰性几何图形
        .geometric-shapes
          .shape.shape-triangle
          .shape.shape-circle
          .shape.shape-square

      // 标题和描述
      .error-info
        h1.error-title {{ t('common.error.serverErrorTitle') }}
        p.error-description {{ t('common.error.serverError') }}
        p.app-title {{ title }}

      // 操作按钮
      .error-actions
        Button(@click='handleBackHome', @touchend='handleBackHome')
          OhVueIcon(name='fc-binoculars')
          span {{ t('common.actions.backToHome') }}

    // 装饰性元素 - 增强版
    .decoration-elements
      .circle.circle-1
      .circle.circle-2
      .circle.circle-3
      // 添加更多装饰元素
      .floating-orb.orb-1
      .floating-orb.orb-2
      .floating-orb.orb-3
</template>
<style lang="scss" scoped>
.server-error-page {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  // 使用背景色创建渐变背景
  background: linear-gradient(135deg, var(--bg100) 0%, var(--bg200) 50%, var(--bg300) 100%);
  background-attachment: fixed;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    // 使用主题色和文本色创建光效
    background:
      radial-gradient(
        circle at 20% 50%,
        color-mix(in srgb, var(--text100) 15%, transparent) 0%,
        transparent 50%
      ),
      radial-gradient(
        circle at 80% 80%,
        color-mix(in srgb, var(--accent100) 20%, transparent) 0%,
        transparent 50%
      );
    pointer-events: none;
  }
}

.not-found-container {
  position: relative;
  width: 100%;
  max-width: 1200px;
  padding: 2rem;
  z-index: 1;
}

// 动态网格背景
.grid-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(color-mix(in srgb, var(--primary200) 10%, transparent) 1px, transparent 1px),
    linear-gradient(
      90deg,
      color-mix(in srgb, var(--primary200) 10%, transparent) 1px,
      transparent 1px
    );
  background-size: 50px 50px;
  animation: gridMove 20s linear infinite;
  opacity: 0.3;
  pointer-events: none;
  z-index: 0;
}

@keyframes gridMove {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(50px, 50px);
  }
}

// 鼠标跟随光效 - 高性能优化版本（修复偏移和平滑过渡）
.mouse-light {
  position: absolute;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--accent100) 15%, transparent) 0%,
    transparent 70%
  );
  pointer-events: none;
  left: var(--mouse-x);
  top: var(--mouse-y);
  transform: translate(-50%, -50%);
  z-index: 1;
  filter: blur(40px);
  // 启用 GPU 加速
  will-change: transform, left, top;
}

// 漂浮粒子
.particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.particle {
  position: absolute;
  // 使用文本色和强调色创建粒子效果
  background: color-mix(in srgb, var(--text100) 60%, transparent);
  border-radius: 50%;
  animation: float infinite ease-in-out;
  box-shadow:
    0 0 10px color-mix(in srgb, var(--accent100) 50%, transparent),
    0 0 20px color-mix(in srgb, var(--primary200) 30%, transparent);
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) translateX(0) scale(1);
    opacity: 0.6;
  }
  25% {
    transform: translateY(-20px) translateX(10px) scale(1.1);
    opacity: 0.8;
  }
  50% {
    transform: translateY(-40px) translateX(-10px) scale(0.9);
    opacity: 1;
  }
  75% {
    transform: translateY(-20px) translateX(5px) scale(1.05);
    opacity: 0.8;
  }
}

// 主要内容
.content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  z-index: 2;
}

// 数字动画容器
.error-code-wrapper {
  position: relative;
  margin-bottom: 2rem;
  perspective: 1000px;
}

.error-code {
  display: flex;
  gap: 1rem;
  justify-content: center;
  align-items: center;
  position: relative;
}

.digit-wrapper {
  position: relative;
  display: inline-block;
}

.digit {
  font-size: clamp(6rem, 15vw, 12rem);
  font-weight: 900;
  position: relative;
  display: inline-block;
  // 使用渐变文字效果：primary200 -> accent100 -> primary100 -> accent200
  background: linear-gradient(
    135deg,
    var(--primary200) 0%,
    var(--accent100) 25%,
    var(--primary100) 50%,
    var(--accent200) 75%,
    var(--primary200) 100%
  );
  background-size: 200% 200%;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation:
    digitFloat 3s ease-in-out infinite,
    gradientShift 5s ease infinite;
  transform-style: preserve-3d;
  line-height: 1;
  // 使用 filter 创建阴影效果
  filter: drop-shadow(0 10px 30px color-mix(in srgb, var(--primary200) 50%, transparent))
    drop-shadow(0 0 40px color-mix(in srgb, var(--primary200) 40%, transparent))
    drop-shadow(0 0 60px color-mix(in srgb, var(--accent100) 30%, transparent));

  &:nth-child(1) {
    animation-delay: 0s, 0s;
  }

  &:nth-child(2) {
    animation-delay: 0.2s, 0.5s;
  }

  &:nth-child(3) {
    animation-delay: 0.4s, 1s;
  }

  // 添加悬停效果
  &:hover {
    transform: scale(1.1) rotateY(15deg);
    filter: drop-shadow(0 15px 40px color-mix(in srgb, var(--primary200) 60%, transparent))
      drop-shadow(0 0 60px color-mix(in srgb, var(--primary200) 50%, transparent))
      drop-shadow(0 0 80px color-mix(in srgb, var(--accent100) 40%, transparent));
  }
}

// 渐变动画
@keyframes gradientShift {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@keyframes digitFloat {
  0%,
  100% {
    transform: translateY(0) rotateY(0deg) scale(1);
  }
  25% {
    transform: translateY(-15px) rotateY(5deg) scale(1.05);
  }
  50% {
    transform: translateY(-25px) rotateY(10deg) scale(1.1);
  }
  75% {
    transform: translateY(-15px) rotateY(5deg) scale(1.05);
  }
}

// 几何图形装饰
.geometric-shapes {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -1;
}

.shape {
  position: absolute;
  border: 2px solid;
  animation: shapeRotate 8s linear infinite;

  &.shape-triangle {
    top: 10%;
    left: 5%;
    width: 60px;
    height: 60px;
    border-color: color-mix(in srgb, var(--primary200) 40%, transparent);
    clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
    background: color-mix(in srgb, var(--primary200) 20%, transparent);
    animation-delay: 0s;
  }

  &.shape-circle {
    bottom: 15%;
    right: 10%;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    border-color: color-mix(in srgb, var(--accent100) 40%, transparent);
    background: color-mix(in srgb, var(--accent100) 20%, transparent);
    animation-delay: 2s;
  }

  &.shape-square {
    top: 60%;
    left: 8%;
    width: 50px;
    height: 50px;
    border-color: color-mix(in srgb, var(--primary100) 40%, transparent);
    background: color-mix(in srgb, var(--primary100) 20%, transparent);
    transform: rotate(45deg);
    animation-delay: 4s;
  }
}

@keyframes shapeRotate {
  0% {
    transform: rotate(0deg) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: rotate(180deg) scale(1.2);
    opacity: 0.6;
  }
  100% {
    transform: rotate(360deg) scale(1);
    opacity: 0.3;
  }
}

// 错误信息
.error-info {
  margin-bottom: 3rem;
  // 使用主文本色
  color: var(--text100);

  .error-title {
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 700;
    margin-bottom: 1rem;
    // 普通文字使用默认颜色（text100）
    color: var(--text100);
    // 使用背景色创建阴影
    text-shadow: 0 4px 10px color-mix(in srgb, var(--bg100) 20%, transparent);
    animation: fadeInUp 0.8s ease-out;
  }

  .error-description {
    font-size: clamp(1.1rem, 2.5vw, 1.5rem);
    margin-bottom: 0.5rem;
    // 使用次文本色
    color: var(--text200);
    animation: fadeInUp 0.8s ease-out 0.2s both;
  }

  .app-title {
    font-size: clamp(0.9rem, 2vw, 1.2rem);
    // 小注释提示文字使用 text200
    color: var(--text200);
    margin-top: 0.5rem;
    animation: fadeInUp 0.8s ease-out 0.4s both;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 操作按钮
.error-actions {
  animation: fadeInUp 0.8s ease-out 0.6s both;

  :deep(.p-button) {
    padding: 1rem 2.5rem;
    font-size: 1.1rem;
    font-weight: 600;
    border-radius: 50px;
    // 使用背景色和主题色创建阴影
    box-shadow:
      0 8px 20px color-mix(in srgb, var(--bg100) 20%, transparent),
      0 4px 10px color-mix(in srgb, var(--primary100) 30%, transparent);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow:
        0 12px 30px color-mix(in srgb, var(--bg100) 30%, transparent),
        0 6px 15px color-mix(in srgb, var(--primary200) 40%, transparent);
    }

    &:active {
      transform: translateY(0);
    }
  }
}

// 装饰性圆圈
.decoration-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.circle {
  position: absolute;
  border-radius: 50%;
  // 使用文本色和主题色创建边框
  border: 2px solid color-mix(in srgb, var(--text100) 20%, transparent);
  animation: pulse 4s ease-in-out infinite;

  &.circle-1 {
    width: 300px;
    height: 300px;
    top: 10%;
    left: 10%;
    animation-delay: 0s;
  }

  &.circle-2 {
    width: 200px;
    height: 200px;
    bottom: 15%;
    right: 15%;
    animation-delay: 1s;
  }

  &.circle-3 {
    width: 150px;
    height: 150px;
    top: 50%;
    right: 10%;
    animation-delay: 2s;
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.3;
    border-color: color-mix(in srgb, var(--text100) 20%, transparent);
  }
  50% {
    transform: scale(1.1);
    opacity: 0.5;
    border-color: color-mix(in srgb, var(--primary200) 40%, transparent);
  }
}

// 浮动光球
.floating-orb {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--accent100) 60%, transparent) 0%,
    color-mix(in srgb, var(--primary200) 30%, transparent) 50%,
    transparent 100%
  );
  filter: blur(20px);
  animation: orbFloat 6s ease-in-out infinite;

  &.orb-1 {
    width: 120px;
    height: 120px;
    top: 20%;
    right: 15%;
    animation-delay: 0s;
  }

  &.orb-2 {
    width: 80px;
    height: 80px;
    bottom: 25%;
    left: 12%;
    animation-delay: 2s;
  }

  &.orb-3 {
    width: 100px;
    height: 100px;
    top: 55%;
    left: 20%;
    animation-delay: 4s;
  }
}

@keyframes orbFloat {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.4;
  }
  33% {
    transform: translate(30px, -30px) scale(1.2);
    opacity: 0.6;
  }
  66% {
    transform: translate(-20px, 20px) scale(0.8);
    opacity: 0.5;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .server-error-page {
    min-height: 100vh;
  }

  .error-code {
    gap: 0.5rem;

    .digit {
      font-size: clamp(4rem, 20vw, 8rem);
    }
  }

  .error-info {
    margin-bottom: 2rem;
  }

  .error-actions {
    :deep(.p-button) {
      padding: 0.875rem 2rem;
      font-size: 1rem;
    }
  }

  .circle {
    &.circle-1 {
      width: 200px;
      height: 200px;
    }

    &.circle-2 {
      width: 150px;
      height: 150px;
    }

    &.circle-3 {
      width: 100px;
      height: 100px;
    }
  }

  .floating-orb {
    &.orb-1 {
      width: 80px;
      height: 80px;
    }

    &.orb-2 {
      width: 60px;
      height: 60px;
    }

    &.orb-3 {
      width: 70px;
      height: 70px;
    }
  }

  .shape {
    &.shape-triangle {
      width: 40px;
      height: 40px;
    }

    &.shape-circle {
      width: 50px;
      height: 50px;
    }

    &.shape-square {
      width: 35px;
      height: 35px;
    }
  }
}

// 深浅色主题适配已通过 CSS 变量自动处理
// 所有颜色都使用 var() 变量，会根据主题自动切换
</style>
