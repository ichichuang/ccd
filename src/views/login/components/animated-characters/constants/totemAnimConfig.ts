/**
 * Totem animation configuration — SSOT for all GSAP numeric values.
 * Geometry aligned with `animated-login` reference (550×400 scene); CSS vars mirror these.
 */
export const ANIM = {
  parallax: { x: 0.022, y: 0.018 },

  skewMultiplier: { success: 1.5 },

  /** Primary — typing / hiding-password (matches original quickTo targets) */
  primaryTyping: { skewOffset: -12, xShift: 40, height: 440 },
  /** Resting column height — must equal `--char-primary-h` */
  primaryDefault: { height: 400 },

  successLooking: { skewExtraOffset: 10, xShift: 20 },

  lookAtEachOther: {
    primaryFace: { left: 55, top: 65 },
    successFace: { left: 32, top: 12 },
    primaryPupil: { x: 3, y: 4 },
    successPupil: { x: 0, y: -4 },
  },

  hidingPassword: {
    primaryFace: { left: 55, top: 65 },
  },

  /** Deltas for show-password pose (faces use transform x/y on Warn/Accent vs rest positions) */
  showPassword: {
    primaryFace: { left: 20, top: 35 },
    successFace: { left: 10, top: 28 },
    warnFace: { x: -32, y: -5 },
    accentFace: { x: -32, y: -5 },
    accentMouth: { x: -30, y: 0 },
    primaryPupil: { x: -4, y: -4 },
    successPupil: { x: -4, y: -4 },
    warnPupil: { x: -5, y: -4 },
    accentPupil: { x: -5, y: -4 },
  },

  peek: {
    to: { x: 4, y: 5 },
    back: { x: -4, y: -4 },
    holdMs: 800,
    delayMin: 2000,
    delayRange: 3000,
  },

  /** 眨眼：对内层 blinkLayer 做 scaleY，避免与 Vue 绑定根节点 height 争抢 */
  blink: {
    closedScaleY: 0.08,
    closeDuration: 0.15,
    openDuration: 0.15,
    closedPauseMs: 200,
    delayMin: 3000,
    delayRange: 4000,
  },

  quickTo: { totem: 0.45, body: 0.3, face: 0.2, pupil: 0.14 },

  lookDurationMs: 800,

  faceClamp: { maxX: 15, maxY: 10, divX: 20, divY: 30 },

  skewClamp: { max: 6, divX: 120 },

  purpleFaceXMultiplier: 1.35,
  purpleFaceXMax: 22,

  /** Rest face — must match `--face-primary-*` / `--face-success-*` initial CSS */
  faceRest: {
    primaryLeft: 45,
    primaryTop: 40,
    successLeft: 26,
    successTop: 32,
  },
} as const
