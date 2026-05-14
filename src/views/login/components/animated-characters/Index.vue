<script setup lang="ts">
import gsap from 'gsap'
import { useMouse } from '@vueuse/core'
import Pupil from './Pupil.vue'
import EyeBall from './EyeBall.vue'
import { ANIM } from './constants/totemAnimConfig'

defineOptions({ name: 'AnimatedCharacters' })

interface AnimatedCharactersProps {
  isTyping?: boolean
  showPassword?: boolean
  passwordLength?: number
}

const props = withDefaults(defineProps<AnimatedCharactersProps>(), {
  isTyping: false,
  showPassword: false,
  passwordLength: 0,
})

function getViewportCenterClient(): { x: number; y: number } {
  if (typeof window === 'undefined') return { x: 0, y: 0 }
  return { x: window.innerWidth / 2, y: window.innerHeight / 2 }
}

const { x: mouseX, y: mouseY } = useMouse({
  type: 'client',
  initialValue: getViewportCenterClient(),
})

/** 与 scoped CSS / totemAnimConfig 参考场景一致；布局用缩放盒占位，GSAP 仍在该坐标系内工作 */
const TOTEM_REF_W = 550
const TOTEM_REF_H = 400

// ── Element refs ──────────────────────────────────────────────
const containerRef = useTemplateRef<HTMLElement>('containerRef')
const totemRef = useTemplateRef<HTMLElement>('totemRef')
const rafIdRef = ref<number>(0)
let isAnimationActive = false

const { width: containerWidth, height: containerHeight } = useAppElementSize(containerRef)

const totemScale = computed(() => {
  const w = containerWidth.value
  const h = containerHeight.value
  if (w < 32 || h < 32) return 1
  const raw = Math.min(w / TOTEM_REF_W, h / TOTEM_REF_H, 1.2)
  return Math.max(raw, 0.35)
})

const totemViewportStyle = computed<Record<string, string>>(() => {
  const s = totemScale.value
  return {
    width: `${TOTEM_REF_W * s}px`,
    height: `${TOTEM_REF_H * s}px`,
  }
})

const totemInnerScaleStyle = computed<Record<string, string>>(() => {
  const s = totemScale.value
  return {
    width: `${TOTEM_REF_W}px`,
    height: `${TOTEM_REF_H}px`,
    transform: `scale(${s})`,
    transformOrigin: '0 0',
  }
})

const purpleRef = useTemplateRef<HTMLElement>('purpleRef')
const blackRef = useTemplateRef<HTMLElement>('blackRef')
const yellowRef = useTemplateRef<HTMLElement>('yellowRef')
const orangeRef = useTemplateRef<HTMLElement>('orangeRef')

const purpleFaceRef = useTemplateRef<HTMLElement>('purpleFaceRef')
const blackFaceRef = useTemplateRef<HTMLElement>('blackFaceRef')
const yellowFaceRef = useTemplateRef<HTMLElement>('yellowFaceRef')
const orangeFaceRef = useTemplateRef<HTMLElement>('orangeFaceRef')

const yellowMouthRef = useTemplateRef<HTMLElement>('yellowMouthRef')

// ── Eye / Pupil component refs (replace DOM queries) ──────────
const purpleLeftEyeRef = ref<InstanceType<typeof EyeBall> | null>(null)
const purpleRightEyeRef = ref<InstanceType<typeof EyeBall> | null>(null)
const successLeftEyeRef = ref<InstanceType<typeof EyeBall> | null>(null)
const successRightEyeRef = ref<InstanceType<typeof EyeBall> | null>(null)

const warnLeftPupilRef = ref<InstanceType<typeof Pupil> | null>(null)
const warnRightPupilRef = ref<InstanceType<typeof Pupil> | null>(null)
const accentLeftPupilRef = ref<InstanceType<typeof Pupil> | null>(null)
const accentRightPupilRef = ref<InstanceType<typeof Pupil> | null>(null)

// ── Timer refs ────────────────────────────────────────────────
const purpleBlinkTimerRef = ref<ReturnType<typeof setTimeout>>()
const blackBlinkTimerRef = ref<ReturnType<typeof setTimeout>>()
const purplePeekTimerRef = ref<ReturnType<typeof setTimeout>>()

// ── Derived state ─────────────────────────────────────────────
const isHidingPassword = computed(() => props.passwordLength > 0 && !props.showPassword)
const isShowingPassword = computed(() => props.passwordLength > 0 && props.showPassword)

const isLookingRef = ref(false)
const lookingTimerRef = ref<ReturnType<typeof setTimeout>>()

// ── GSAP QuickTo map ──────────────────────────────────────────
interface QuickToMap {
  totemX: (v: number) => void
  totemY: (v: number) => void
  purpleSkew: (v: number) => void
  blackSkew: (v: number) => void
  orangeSkew: (v: number) => void
  yellowSkew: (v: number) => void
  purpleX: (v: number) => void
  blackX: (v: number) => void
  purpleHeight: (v: number) => void
  purpleFaceLeft: (v: number) => void
  purpleFaceTop: (v: number) => void
  blackFaceLeft: (v: number) => void
  blackFaceTop: (v: number) => void
  orangeFaceX: (v: number) => void
  orangeFaceY: (v: number) => void
  yellowFaceX: (v: number) => void
  yellowFaceY: (v: number) => void
  mouthX: (v: number) => void
  mouthY: (v: number) => void
}

const quickToRef = ref<QuickToMap | null>(null)

interface PupilQuickToPair {
  x: (v: number) => void
  y: (v: number) => void
}

/** 每颗瞳孔一对 quickTo，平滑 rect 噪声，避免每帧 gsap.set 抖动 */
const pupilQuickToMapRef = ref<Map<HTMLElement, PupilQuickToPair> | null>(null)

interface EyeBallTargets {
  eyeballEl: HTMLElement
  pupilEl: HTMLElement
  blinkLayerEl: HTMLElement | null
}

interface BlinkProfile {
  closedScaleY: number
  closeDuration: number
  openDuration: number
  closedPauseMs: number
  delayMin: number
  delayRange: number
}

function buildPupilQuickToMap(): Map<HTMLElement, PupilQuickToPair> {
  const map = new Map<HTMLElement, PupilQuickToPair>()
  const dur = ANIM.quickTo.pupil
  /** x/y 共用 transform，默认 overwrite:auto 会导致后启动的 quickTo 整段干掉另一轴补间 → 跟鼠标失效 */
  const opts = { duration: dur, ease: 'power2.out' as const, overwrite: false }
  for (const el of collectPupilEls()) {
    map.set(el, {
      x: gsap.quickTo(el, 'x', opts),
      y: gsap.quickTo(el, 'y', opts),
    })
  }
  for (const { pupilEl } of collectEyeballEls()) {
    map.set(pupilEl, {
      x: gsap.quickTo(pupilEl, 'x', opts),
      y: gsap.quickTo(pupilEl, 'y', opts),
    })
  }
  return map
}

function applyPupilPos(el: HTMLElement, x: number, y: number): void {
  const pair = pupilQuickToMapRef.value?.get(el)
  if (pair) {
    pair.x(x)
    pair.y(y)
  } else {
    gsap.set(el, { x, y })
  }
}

function setEyeballClosed(eyes: EyeBallTargets[], closed: boolean): void {
  const scaleY = closed ? ANIM.showPassword.closedEyeScaleY : 1
  for (const { eyeballEl, pupilEl } of eyes) {
    gsap.to(eyeballEl, {
      scaleY,
      duration: closed ? ANIM.blink.closeDuration : ANIM.blink.openDuration,
      ease: closed ? 'power2.in' : 'power2.out',
      transformOrigin: '50% 50%',
    })
    gsap.to(pupilEl, {
      autoAlpha: closed ? 0 : 1,
      duration: closed ? ANIM.blink.closeDuration : ANIM.blink.openDuration,
      ease: closed ? 'power2.in' : 'power2.out',
    })
  }
}

function setPupilClosed(els: HTMLElement[], closed: boolean): void {
  for (const el of els) {
    gsap.to(el, {
      scaleX: closed ? 1.6 : 1,
      scaleY: closed ? ANIM.showPassword.closedEyeScaleY : 1,
      duration: closed ? ANIM.blink.closeDuration : ANIM.blink.openDuration,
      ease: closed ? 'power2.in' : 'power2.out',
      transformOrigin: '50% 50%',
    })
  }
}

/** 仅在卸载时清掉瞳孔 quickTo；运行中不能 kill，否则旧 quickTo 函数会继续 resetTo 已失效 tween。 */
function killAllPupilQuickToTweens(): void {
  for (const el of collectPupilEls()) {
    gsap.killTweensOf(el)
  }
  for (const { pupilEl } of collectEyeballEls()) {
    gsap.killTweensOf(pupilEl)
  }
}

/** 组件卸载时清理所有 GSAP 补间，防止 "not eligible for reset" 警告 */
function killAllGsapTweens(): void {
  const bodyEls = [
    totemRef.value,
    purpleRef.value,
    blackRef.value,
    orangeRef.value,
    yellowRef.value,
    purpleFaceRef.value,
    blackFaceRef.value,
    orangeFaceRef.value,
    yellowFaceRef.value,
    yellowMouthRef.value,
  ]
  for (const el of bodyEls) {
    if (el) gsap.killTweensOf(el)
  }
  // 复用已有的 pupil 清理
  killAllPupilQuickToTweens()
  // 清理 blink 层上的补间
  for (const { blinkLayerEl } of [...collectPurpleEyeballs(), ...collectSuccessEyeballs()]) {
    if (blinkLayerEl) gsap.killTweensOf(blinkLayerEl)
  }
}

// ── Helpers: collect exposed elements from child component refs ──
function collectPupilEls(): HTMLElement[] {
  const els: HTMLElement[] = []
  for (const r of [warnLeftPupilRef, warnRightPupilRef, accentLeftPupilRef, accentRightPupilRef]) {
    const el = r.value?.pupilEl
    if (el) els.push(el)
  }
  return els
}

function collectEyeballEls(): { eyeballEl: HTMLElement; pupilEl: HTMLElement }[] {
  const pairs: { eyeballEl: HTMLElement; pupilEl: HTMLElement }[] = []
  for (const r of [purpleLeftEyeRef, purpleRightEyeRef, successLeftEyeRef, successRightEyeRef]) {
    const eb = r.value?.eyeballEl
    const pp = r.value?.pupilEl
    if (eb && pp) pairs.push({ eyeballEl: eb, pupilEl: pp })
  }
  return pairs
}

function collectPurpleEyeballs(): EyeBallTargets[] {
  const pairs: EyeBallTargets[] = []
  for (const r of [purpleLeftEyeRef, purpleRightEyeRef]) {
    const eb = r.value?.eyeballEl
    const pp = r.value?.pupilEl
    const bl = r.value?.blinkLayerEl ?? null
    if (eb && pp) pairs.push({ eyeballEl: eb, pupilEl: pp, blinkLayerEl: bl })
  }
  return pairs
}

function collectSuccessEyeballs(): EyeBallTargets[] {
  const pairs: EyeBallTargets[] = []
  for (const r of [successLeftEyeRef, successRightEyeRef]) {
    const eb = r.value?.eyeballEl
    const pp = r.value?.pupilEl
    const bl = r.value?.blinkLayerEl ?? null
    if (eb && pp) pairs.push({ eyeballEl: eb, pupilEl: pp, blinkLayerEl: bl })
  }
  return pairs
}

// ── Core math ─────────────────────────────────────────────────
function resetPupilTransforms(): void {
  for (const el of collectPupilEls()) {
    applyPupilPos(el, 0, 0)
  }
  for (const { pupilEl } of collectEyeballEls()) {
    applyPupilPos(pupilEl, 0, 0)
  }
}

function calcPos(el: HTMLElement) {
  const rect = el.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 3
  const dx = mouseX.value - cx
  const dy = mouseY.value - cy
  const { faceClamp, skewClamp } = ANIM
  return {
    faceX: Math.max(-faceClamp.maxX, Math.min(faceClamp.maxX, dx / faceClamp.divX)),
    faceY: Math.max(-faceClamp.maxY, Math.min(faceClamp.maxY, dy / faceClamp.divY)),
    bodySkew: Math.max(-skewClamp.max, Math.min(skewClamp.max, -dx / skewClamp.divX)),
  }
}

function calcEyePos(el: HTMLElement, maxDist: number) {
  const r = el.getBoundingClientRect()
  const cx = r.left + r.width / 2
  const cy = r.top + r.height / 2
  const dx = mouseX.value - cx
  const dy = mouseY.value - cy
  const dist = Math.min(Math.sqrt(dx ** 2 + dy ** 2), maxDist)
  const angle = Math.atan2(dy, dx)
  return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist }
}

/** 布局/旋转后同步一次；useMouse 不会在 resize 时更新未移动的指针 */
function seedMouseToViewportCenter(): void {
  const c = getViewportCenterClient()
  mouseX.value = c.x
  mouseY.value = c.y
}

// ── Pose functions ────────────────────────────────────────────
function applyLookAtEachOther(): void {
  const qt = quickToRef.value
  if (qt) {
    const { primaryFace, successFace } = ANIM.lookAtEachOther
    qt.purpleFaceLeft(primaryFace.left)
    qt.purpleFaceTop(primaryFace.top)
    qt.blackFaceLeft(successFace.left)
    qt.blackFaceTop(successFace.top)
  }
  const { primaryPupil, successPupil } = ANIM.lookAtEachOther
  for (const { pupilEl } of collectPurpleEyeballs()) {
    applyPupilPos(pupilEl, primaryPupil.x, primaryPupil.y)
  }
  for (const { pupilEl } of collectSuccessEyeballs()) {
    applyPupilPos(pupilEl, successPupil.x, successPupil.y)
  }
}

function applyHidingPassword(): void {
  const qt = quickToRef.value
  if (qt) {
    const { primaryFace } = ANIM.hidingPassword
    qt.purpleFaceLeft(primaryFace.left)
    qt.purpleFaceTop(primaryFace.top)
  }
}

function applyShowPassword(): void {
  const qt = quickToRef.value
  if (!qt) return

  qt.totemX(0)
  qt.totemY(0)
  qt.purpleSkew(0)
  qt.blackSkew(0)
  qt.orangeSkew(0)
  qt.yellowSkew(0)
  qt.purpleX(0)
  qt.blackX(0)
  qt.purpleHeight(ANIM.primaryDefault.height)

  const sp = ANIM.showPassword
  qt.purpleFaceLeft(sp.primaryFace.left)
  qt.purpleFaceTop(sp.primaryFace.top)
  qt.blackFaceLeft(sp.successFace.left)
  qt.blackFaceTop(sp.successFace.top)
  qt.orangeFaceX(sp.warnFace.x)
  qt.orangeFaceY(sp.warnFace.y)
  qt.yellowFaceX(sp.accentFace.x)
  qt.yellowFaceY(sp.accentFace.y)
  qt.mouthX(sp.accentMouth.x)
  qt.mouthY(sp.accentMouth.y)

  for (const { pupilEl } of collectPurpleEyeballs()) {
    applyPupilPos(pupilEl, sp.primaryPupil.x, sp.primaryPupil.y)
  }
  for (const { pupilEl } of collectSuccessEyeballs()) {
    applyPupilPos(pupilEl, sp.successPupil.x, sp.successPupil.y)
  }
  setEyeballClosed([...collectPurpleEyeballs(), ...collectSuccessEyeballs()], true)
  for (const r of [warnLeftPupilRef, warnRightPupilRef]) {
    const el = r.value?.pupilEl
    if (el) applyPupilPos(el, sp.warnPupil.x, sp.warnPupil.y)
  }
  for (const r of [accentLeftPupilRef, accentRightPupilRef]) {
    const el = r.value?.pupilEl
    if (el) applyPupilPos(el, sp.accentPupil.x, sp.accentPupil.y)
  }
  setPupilClosed(collectPupilEls(), true)
}

function releaseShowPasswordPose(): void {
  setEyeballClosed([...collectPurpleEyeballs(), ...collectSuccessEyeballs()], false)
  setPupilClosed(collectPupilEls(), false)
}

// ── Animation tick (RAF loop) ─────────────────────────────────
function tick(): void {
  if (!isAnimationActive) return

  const container = containerRef.value
  if (!container) return

  const typing = props.isTyping
  const hiding = isHidingPassword.value
  const showing = isShowingPassword.value
  const looking = isLookingRef.value
  const qt = quickToRef.value
  if (!qt) return

  if (totemRef.value && !showing) {
    const cRect = container.getBoundingClientRect()
    const tcx = cRect.left + cRect.width / 2
    const tcy = cRect.top + cRect.height / 2
    qt.totemX((mouseX.value - tcx) * ANIM.parallax.x)
    qt.totemY((mouseY.value - tcy) * ANIM.parallax.y)
  } else if (totemRef.value && showing) {
    qt.totemX(0)
    qt.totemY(0)
  }

  if (purpleRef.value && !showing) {
    const pp = calcPos(purpleRef.value)
    if (typing || hiding) {
      qt.purpleSkew(pp.bodySkew + ANIM.primaryTyping.skewOffset)
      qt.purpleX(ANIM.primaryTyping.xShift)
      qt.purpleHeight(ANIM.primaryTyping.height)
    } else {
      qt.purpleSkew(pp.bodySkew)
      qt.purpleX(0)
      qt.purpleHeight(ANIM.primaryDefault.height)
    }
  }

  if (blackRef.value && !showing) {
    const bp = calcPos(blackRef.value)
    if (looking) {
      qt.blackSkew(bp.bodySkew * ANIM.skewMultiplier.success + ANIM.successLooking.skewExtraOffset)
      qt.blackX(ANIM.successLooking.xShift)
    } else if (typing || hiding) {
      qt.blackSkew(bp.bodySkew * ANIM.skewMultiplier.success)
      qt.blackX(0)
    } else {
      qt.blackSkew(bp.bodySkew)
      qt.blackX(0)
    }
  }

  if (orangeRef.value && !showing) {
    qt.orangeSkew(calcPos(orangeRef.value).bodySkew)
  }

  if (yellowRef.value && !showing) {
    qt.yellowSkew(calcPos(yellowRef.value).bodySkew)
  }

  if (purpleRef.value && !showing && !looking) {
    const pp = calcPos(purpleRef.value)
    const faceX =
      pp.faceX >= 0
        ? Math.min(ANIM.purpleFaceXMax, pp.faceX * ANIM.purpleFaceXMultiplier)
        : pp.faceX
    qt.purpleFaceLeft(ANIM.faceRest.primaryLeft + faceX)
    qt.purpleFaceTop(ANIM.faceRest.primaryTop + pp.faceY)
  }

  if (blackRef.value && !showing && !looking) {
    const bp = calcPos(blackRef.value)
    qt.blackFaceLeft(ANIM.faceRest.successLeft + bp.faceX)
    qt.blackFaceTop(ANIM.faceRest.successTop + bp.faceY)
  }

  if (orangeRef.value && !showing) {
    const op = calcPos(orangeRef.value)
    qt.orangeFaceX(op.faceX)
    qt.orangeFaceY(op.faceY)
  }

  if (yellowRef.value && !showing) {
    const yp = calcPos(yellowRef.value)
    qt.yellowFaceX(yp.faceX)
    qt.yellowFaceY(yp.faceY)
    qt.mouthX(yp.faceX)
    qt.mouthY(yp.faceY)
  }

  if (!showing) {
    for (const el of collectPupilEls()) {
      const maxDist = Number(el.dataset.maxDistance) || 5
      const ePos = calcEyePos(el, maxDist)
      applyPupilPos(el, ePos.x, ePos.y)
    }

    if (!looking) {
      for (const { eyeballEl, pupilEl } of collectEyeballEls()) {
        const maxDist = Number(eyeballEl.dataset.maxDistance) || 10
        const ePos = calcEyePos(eyeballEl, maxDist)
        applyPupilPos(pupilEl, ePos.x, ePos.y)
      }
    }
  }

  rafIdRef.value = requestAnimationFrame(tick)
}

// ── Blink schedulers ──────────────────────────────────────────
function animateEyeballBlink(
  eyes: EyeBallTargets[],
  profile: BlinkProfile,
  onDone: () => void
): void {
  for (const { blinkLayerEl } of eyes) {
    if (!blinkLayerEl) continue
    gsap.to(blinkLayerEl, {
      scaleY: profile.closedScaleY,
      duration: profile.closeDuration,
      ease: 'power2.in',
      transformOrigin: '50% 50%',
    })
  }

  setTimeout(() => {
    if (!isAnimationActive) return

    for (const { blinkLayerEl } of eyes) {
      if (!blinkLayerEl) continue
      gsap.to(blinkLayerEl, {
        scaleY: 1,
        duration: profile.openDuration,
        ease: 'power2.out',
        transformOrigin: '50% 50%',
      })
    }
    onDone()
  }, profile.closedPauseMs)
}

function getBlinkDelay(profile: BlinkProfile): number {
  return Math.random() * profile.delayRange + profile.delayMin
}

function schedulePurpleBlink(delayMs = getBlinkDelay(ANIM.primaryBlink)): void {
  if (!isAnimationActive) return

  clearTimeout(purpleBlinkTimerRef.value)

  purpleBlinkTimerRef.value = setTimeout(() => {
    if (!isAnimationActive) return
    if (isShowingPassword.value) return

    const eyes = collectPurpleEyeballs()
    if (!eyes.length) {
      schedulePurpleBlink()
      return
    }

    animateEyeballBlink(eyes, ANIM.primaryBlink, () => schedulePurpleBlink())
  }, delayMs)
}

function scheduleSuccessBlink(): void {
  if (!isAnimationActive) return

  const eyes = collectSuccessEyeballs()
  if (!eyes.length) return

  blackBlinkTimerRef.value = setTimeout(
    () => {
      if (!isAnimationActive) return

      animateEyeballBlink(eyes, ANIM.blink, () => scheduleSuccessBlink())
    },
    Math.random() * ANIM.blink.delayRange + ANIM.blink.delayMin
  )
}

// ── Lifecycle ─────────────────────────────────────────────────
onMounted(() => {
  isAnimationActive = true
  resetPupilTransforms()

  if (
    !totemRef.value ||
    !purpleRef.value ||
    !blackRef.value ||
    !orangeRef.value ||
    !yellowRef.value ||
    !purpleFaceRef.value ||
    !blackFaceRef.value ||
    !orangeFaceRef.value ||
    !yellowFaceRef.value ||
    !yellowMouthRef.value
  ) {
    isAnimationActive = false
    return
  }

  const qt: QuickToMap = {
    totemX: gsap.quickTo(totemRef.value, 'x', { duration: ANIM.quickTo.totem, ease: 'power3.out' }),
    totemY: gsap.quickTo(totemRef.value, 'y', { duration: ANIM.quickTo.totem, ease: 'power3.out' }),
    purpleSkew: gsap.quickTo(purpleRef.value, 'skewX', {
      duration: ANIM.quickTo.body,
      ease: 'power2.out',
    }),
    blackSkew: gsap.quickTo(blackRef.value, 'skewX', {
      duration: ANIM.quickTo.body,
      ease: 'power2.out',
    }),
    orangeSkew: gsap.quickTo(orangeRef.value, 'skewX', {
      duration: ANIM.quickTo.body,
      ease: 'power2.out',
    }),
    yellowSkew: gsap.quickTo(yellowRef.value, 'skewX', {
      duration: ANIM.quickTo.body,
      ease: 'power2.out',
    }),
    purpleX: gsap.quickTo(purpleRef.value, 'x', {
      duration: ANIM.quickTo.body,
      ease: 'power2.out',
    }),
    blackX: gsap.quickTo(blackRef.value, 'x', { duration: ANIM.quickTo.body, ease: 'power2.out' }),
    purpleHeight: gsap.quickTo(purpleRef.value, 'height', {
      duration: ANIM.quickTo.body,
      ease: 'power2.out',
    }),
    purpleFaceLeft: gsap.quickTo(purpleFaceRef.value, 'left', {
      duration: ANIM.quickTo.body,
      ease: 'power2.out',
    }),
    purpleFaceTop: gsap.quickTo(purpleFaceRef.value, 'top', {
      duration: ANIM.quickTo.body,
      ease: 'power2.out',
    }),
    blackFaceLeft: gsap.quickTo(blackFaceRef.value, 'left', {
      duration: ANIM.quickTo.body,
      ease: 'power2.out',
    }),
    blackFaceTop: gsap.quickTo(blackFaceRef.value, 'top', {
      duration: ANIM.quickTo.body,
      ease: 'power2.out',
    }),
    orangeFaceX: gsap.quickTo(orangeFaceRef.value, 'x', {
      duration: ANIM.quickTo.face,
      ease: 'power2.out',
    }),
    orangeFaceY: gsap.quickTo(orangeFaceRef.value, 'y', {
      duration: ANIM.quickTo.face,
      ease: 'power2.out',
    }),
    yellowFaceX: gsap.quickTo(yellowFaceRef.value, 'x', {
      duration: ANIM.quickTo.face,
      ease: 'power2.out',
    }),
    yellowFaceY: gsap.quickTo(yellowFaceRef.value, 'y', {
      duration: ANIM.quickTo.face,
      ease: 'power2.out',
    }),
    mouthX: gsap.quickTo(yellowMouthRef.value, 'x', {
      duration: ANIM.quickTo.face,
      ease: 'power2.out',
    }),
    mouthY: gsap.quickTo(yellowMouthRef.value, 'y', {
      duration: ANIM.quickTo.face,
      ease: 'power2.out',
    }),
  }
  quickToRef.value = qt

  pupilQuickToMapRef.value = buildPupilQuickToMap()
  resetPupilTransforms()

  gsap.set(totemRef.value, { x: 0, y: 0 })

  seedMouseToViewportCenter()
  rafIdRef.value = requestAnimationFrame(tick)
  nextTick(() => {
    if (!isAnimationActive) return
    seedMouseToViewportCenter()
  })

  schedulePurpleBlink()
  scheduleSuccessBlink()
})

onBeforeUnmount(() => {
  isAnimationActive = false

  // 1. 先停止 RAF 循环 — 阻止新的 quickTo 调用
  cancelAnimationFrame(rafIdRef.value)

  // 2. 清除所有定时器
  clearTimeout(purpleBlinkTimerRef.value)
  clearTimeout(blackBlinkTimerRef.value)
  clearTimeout(purplePeekTimerRef.value)
  clearTimeout(lookingTimerRef.value)

  // 3. Kill 所有 GSAP 补间（quickTo + gsap.to）
  killAllGsapTweens()

  // 4. 清空引用，防止残留闭包调用
  quickToRef.value = null
  pupilQuickToMapRef.value = null
})

// ── Watchers ──────────────────────────────────────────────────
watch(
  () => [isShowingPassword.value, props.passwordLength] as const,
  ([showing, len]) => {
    if (!showing || len <= 0) {
      clearTimeout(purplePeekTimerRef.value)
      return
    }

    const schedulePeek = () => {
      purplePeekTimerRef.value = setTimeout(
        () => {
          if (!isAnimationActive) return
          setEyeballClosed(collectPurpleEyeballs(), false)

          for (const { pupilEl } of collectPurpleEyeballs()) {
            applyPupilPos(pupilEl, ANIM.peek.to.x, ANIM.peek.to.y)
          }
          const qt = quickToRef.value
          if (qt) {
            qt.purpleFaceLeft(ANIM.showPassword.primaryFace.left)
            qt.purpleFaceTop(ANIM.showPassword.primaryFace.top)
          }

          setTimeout(() => {
            if (!isAnimationActive) return

            for (const { pupilEl } of collectPurpleEyeballs()) {
              applyPupilPos(pupilEl, ANIM.peek.back.x, ANIM.peek.back.y)
            }
            setEyeballClosed(collectPurpleEyeballs(), true)
            schedulePeek()
          }, ANIM.peek.holdMs)
        },
        Math.random() * ANIM.peek.delayRange + ANIM.peek.delayMin
      )
    }

    schedulePeek()
  }
)

watch(
  () => [props.isTyping, isShowingPassword.value] as const,
  ([typing, showing]) => {
    if (typing && !showing) {
      isLookingRef.value = true
      applyLookAtEachOther()

      clearTimeout(lookingTimerRef.value)
      lookingTimerRef.value = setTimeout(() => {
        isLookingRef.value = false
      }, ANIM.lookDurationMs)
    } else {
      clearTimeout(lookingTimerRef.value)
      isLookingRef.value = false
    }
  }
)

watch(
  () => [isShowingPassword.value, isHidingPassword.value] as const,
  ([showing, hiding]) => {
    if (showing) {
      clearTimeout(purpleBlinkTimerRef.value)
      applyShowPassword()
    } else if (hiding) {
      releaseShowPasswordPose()
      applyHidingPassword()
      schedulePurpleBlink(ANIM.primaryBlink.resumeDelayMs)
    } else {
      releaseShowPasswordPose()
      schedulePurpleBlink(ANIM.primaryBlink.resumeDelayMs)
    }
  }
)
</script>

<template>
  <!-- 登录页 ≥lg 与 glass-card 左右 row-between；根节点 min-w-0 避免 flex 子项撑破 -->
  <div
    ref="containerRef"
    class="totem-container relative flex min-h-[var(--container-h)] w-full max-w-full min-w-0 flex-col items-center justify-center"
  >
    <div
      ref="totemRef"
      class="relative mx-auto will-change-transform"
    >
      <div
        class="relative mx-auto"
        :style="totemViewportStyle"
      >
        <div
          class="absolute top-0 left-0 will-change-transform"
          :style="totemInnerScaleStyle"
        >
          <div
            class="totem-stage relative h-[var(--stage-h)] w-full max-w-[var(--stage-max-w)] overflow-visible will-change-transform"
          >
            <div class="core-ensemble relative h-full w-full overflow-visible">
              <!-- Back glow (behind all bodies) -->
              <div
                class="pointer-events-none absolute bottom-[var(--weave-v-bottom)] left-1/2 z-base h-[var(--weave-v-h)] w-[var(--weave-v-w)] -translate-x-1/2 bg-gradient-to-b from-transparent via-info/12 to-info/8"
                aria-hidden="true"
              />
              <div
                class="pointer-events-none absolute bottom-[var(--weave-h-bottom)] left-1/2 z-base h-[var(--weave-h-h)] w-[var(--weave-h-w)] -translate-x-1/2 rounded-full bg-info/10"
                aria-hidden="true"
              />

              <!-- Primary (purple) — original z-order: back -->
              <div
                class="absolute bottom-0 left-[var(--char-primary-left)] z-base h-[var(--char-primary-h)] w-[var(--char-primary-w)]"
              >
                <div
                  ref="purpleRef"
                  class="layout-full origin-bottom rounded-t-[var(--char-primary-r)] bg-primary shadow-md will-change-transform transform-gpu"
                >
                  <div
                    ref="purpleFaceRef"
                    class="absolute left-[var(--face-primary-l)] top-[var(--face-primary-t)] row-start gap-[var(--face-primary-gap)]"
                  >
                    <EyeBall
                      ref="purpleLeftEyeRef"
                      size="18px"
                      pupil-size="7px"
                      :max-distance="5"
                    />
                    <EyeBall
                      ref="purpleRightEyeRef"
                      size="18px"
                      pupil-size="7px"
                      :max-distance="5"
                    />
                  </div>
                </div>
              </div>

              <!-- Success (green / dark strip in original: black) -->
              <div
                ref="blackRef"
                class="absolute bottom-0 left-[var(--char-success-left)] z-content h-[var(--char-success-h)] w-[var(--char-success-w)] origin-bottom rounded-t-[var(--char-success-r)] bg-success shadow-md will-change-transform"
              >
                <div
                  ref="blackFaceRef"
                  class="absolute left-[var(--face-success-l)] top-[var(--face-success-t)] row-start gap-[var(--face-success-gap)]"
                >
                  <EyeBall
                    ref="successLeftEyeRef"
                    size="16px"
                    pupil-size="6px"
                    :max-distance="4"
                  />
                  <EyeBall
                    ref="successRightEyeRef"
                    size="16px"
                    pupil-size="6px"
                    :max-distance="4"
                  />
                </div>
              </div>

              <!-- Warn (orange base, wide) -->
              <div
                class="absolute bottom-0 left-[var(--char-warn-left)] z-layout h-[var(--char-warn-h)] w-[var(--char-warn-w)]"
              >
                <div
                  ref="orangeRef"
                  class="layout-full origin-bottom rounded-t-[var(--char-warn-r)] bg-warn shadow-md will-change-transform transform-gpu"
                >
                  <div
                    ref="orangeFaceRef"
                    class="absolute left-[var(--face-warn-l)] top-[var(--face-warn-t)] row-start gap-[var(--face-warn-gap)]"
                  >
                    <Pupil
                      ref="warnLeftPupilRef"
                      size="12px"
                      :max-distance="5"
                    />
                    <Pupil
                      ref="warnRightPupilRef"
                      size="12px"
                      :max-distance="5"
                    />
                  </div>
                </div>
              </div>

              <!-- Accent — 主题四色之一：与 primary / success / warn 并列，随 ColorTokenState.accent 联动 -->
              <div
                ref="yellowRef"
                class="totem-accent absolute bottom-0 left-[var(--char-accent-left)] z-overlay h-[var(--char-accent-h)] w-[var(--char-accent-w)] origin-bottom rounded-t-[var(--char-accent-r)] bg-accent shadow-md will-change-transform"
              >
                <div
                  ref="yellowFaceRef"
                  class="absolute left-[var(--face-accent-l)] top-[var(--face-accent-t)] row-start gap-[var(--face-accent-gap)]"
                >
                  <Pupil
                    ref="accentLeftPupilRef"
                    size="12px"
                    :max-distance="5"
                  />
                  <Pupil
                    ref="accentRightPupilRef"
                    size="12px"
                    :max-distance="5"
                  />
                </div>
                <div
                  ref="yellowMouthRef"
                  class="absolute left-[var(--mouth-l)] top-[var(--mouth-t)] h-[var(--mouth-h)] w-[var(--mouth-w)] rounded-full bg-foreground"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 参考 animated-login：550×400 场景，四体同底、横向咬合（SSOT 与 totemAnimConfig 一致） */
.totem-container {
  --stage-h: 400px;
  --stage-max-w: min(100%, 550px);
  --container-h: 420px;

  /* Bodies — pixel-aligned to original */
  --char-primary-left: 70px;
  --char-primary-w: 180px;
  --char-primary-h: 400px;
  --char-primary-r: 10px;
  --char-success-left: 240px;
  --char-success-w: 120px;
  --char-success-h: 310px;
  --char-success-r: 8px;
  --char-warn-left: 0px;
  --char-warn-w: 240px;
  --char-warn-h: 200px;
  --char-warn-r: 120px;
  --char-accent-left: 310px;
  --char-accent-w: 140px;
  --char-accent-h: 230px;
  --char-accent-r: 70px;

  /* Faces — original rest positions */
  --face-primary-l: 45px;
  --face-primary-t: 40px;
  --face-primary-gap: 32px;
  --face-success-l: 26px;
  --face-success-t: 32px;
  --face-success-gap: 24px;
  --face-warn-l: 82px;
  --face-warn-t: 90px;
  --face-warn-gap: 32px;
  --face-accent-l: 52px;
  --face-accent-t: 40px;
  --face-accent-gap: 24px;
  --mouth-l: 40px;
  --mouth-t: 88px;
  --mouth-h: 4px;
  --mouth-w: 80px;

  /* Soft backdrop (theme info) */
  --weave-v-bottom: 0px;
  --weave-v-h: 320px;
  --weave-v-w: 120px;
  --weave-h-bottom: 8px;
  --weave-h-h: 3px;
  --weave-h-w: 280px;
}
</style>
