import { OhVueIcon, addIcons } from 'oh-vue-icons'
import * as FcIcons from 'oh-vue-icons/icons/fc'
import * as RiIcons from 'oh-vue-icons/icons/ri'
import * as ViIcons from 'oh-vue-icons/icons/vi'
// import {
//   RiArrowLeftSLine,
//   RiArrowRightSFill,
//   RiArrowRightSLine,
//   RiBookmarkFill,
//   RiBuilding2Line,
//   RiCakeLine,
//   RiCalendar2Line,
//   RiClipboardLine,
//   RiCloseCircleFill,
//   RiCloseFill,
//   RiCloseLine,
//   RiCompass3Line,
//   RiComputerLine,
//   RiDeleteBinLine,
//   RiFileForbidLine,
//   RiFilterFill,
//   RiFilterOffLine,
//   RiFolder3Fill,
//   RiFullscreenExitLine,
//   RiFullscreenLine,
//   RiGobletFill,
//   RiGridFill,
//   RiHashtag,
//   RiMoonClearLine,
//   RiSettings3Line,
//   RiSpeedLine,
//   RiSunLine,
//   RiUser3Line,
// } from 'oh-vue-icons/icons/ri'
import type { App } from 'vue'

// const icons = [
//   RiArrowLeftSLine,
//   RiArrowRightSLine,
//   RiBookmarkFill,
//   RiBuilding2Line,
//   RiCakeLine,
//   RiCalendar2Line,
//   RiCloseCircleFill,
//   RiCloseLine,
//   RiCompass3Line,
//   RiComputerLine,
//   RiDeleteBinLine,
//   RiFileForbidLine,
//   RiFilterFill,
//   RiFilterOffLine,
//   RiFolder3Fill,
//   RiFullscreenExitLine,
//   RiFullscreenLine,
//   RiGobletFill,
//   RiGridFill,
//   RiHashtag,
//   RiMoonClearLine,
//   RiSettings3Line,
//   RiSunLine,
//   RiClipboardLine,
//   RiUser3Line,
//   RiSpeedLine,
//   RiCloseFill,
//   RiArrowRightSFill,
// ]
const icons = { ...RiIcons, ...FcIcons, ...ViIcons }

export const setupIcons = (app: App) => {
  addIcons(...Object.values(icons))
  app.component('VIcon', OhVueIcon)
  app.component('OhVueIcon', OhVueIcon)
}
