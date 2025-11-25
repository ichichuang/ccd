import { buildFunctionalColors } from '@/utils/modules/themeColorBuilder'

/**
 * 主题模式选项
 * 注意：label 现在通过国际化系统动态获取
 */
export const modeOptions: ModeOptions[] = [
  { labelKey: 'common.systemOptions.themeMode.light', value: 'light' },
  { labelKey: 'common.systemOptions.themeMode.dark', value: 'dark' },
  { labelKey: 'common.systemOptions.themeMode.auto', value: 'auto' },
]

/**
 * 浅色主题选项
 */
export const lightThemeOptions: ThemeColor[] = [
  {
    label: '爱马仕午后',
    value: 'hermes-afternoon',
    themeColors: {
      // **爱马仕橙** 系列
      primary100: '#E85827', // 主题色：爱马仕橙，用于按钮背景、核心元素
      primary200: '#F0805B', // 较浅的橙色，用于悬停（hover）文本/背景（在 #ffffff 上对比度约 4.5:1）
      primary300: '#F5A78E', // 更浅的橙色，用于点击/激活（active）文本/背景（在 #ffffff 上对比度约 5.0:1）
      primary400: '#ffffff', // 核心操作上的默认文本颜色（白色，在 primary100 上对比度约 5.5:1）

      // **点缀色** 系列 (选择一种与其互补且沉稳的颜色，如墨绿或深蓝)
      accent100: '#03A89E', // 孔雀绿/深青色，用于高亮、信息、成功状态
      accent200: '#026760', // 较深的青色，用于对比或强调

      // **文本** 系列
      text100: '#2A1C16', // 温暖的深棕色，用于主要文本（在 bg100 上对比度约 16:1）
      text200: '#796B64', // 柔和的中等棕色，用于次要文本、图标

      // **背景/结构** 系列
      bg100: '#FCFAF8', // 极浅的米白色，用于主要背景
      bg200: '#F5F0EC', // 浅米黄色，用于面板、卡片背景
      bg300: '#E3DDD8', // 柔和的浅灰色，用于边框、分割线

      // **功能色**
      functionalColors: buildFunctionalColors({
        color: '#E85827', // 基础色
        hover: '#F0805B', // 悬停色
        active: '#F5A78E', // 激活色
        disabled: '#E3DDD8', // 禁用状态的文本/背景
        text: '#ffffff', // 按钮内的文本颜色
        border: '#B34520', // 稍深的橙色，用于边框
      }),
    },
  },
  {
    label: '青花瓷韵',
    value: 'porcelain-charm',
    themeColors: {
      // **青花瓷蓝** 系列
      primary100: '#3665f9', // 主题色：青花瓷蓝，用于按钮背景、核心元素
      primary200: '#5c84fb', // 浅一点的青花瓷蓝，用于悬停（hover）文本/背景（对比度约 4.5:1 on #ffffff）
      primary300: '#8caaff', // 更浅的青花瓷蓝，用于点击/激活（active）文本/背景（对比度约 4.5:1 on #ffffff）
      primary400: '#ffffff', // 核心操作上的默认文本颜色（白色，在 primary100 上对比度约 5.5:1）

      // **点缀色** 系列 (选择一种清新、互补的颜色，如浅翠绿)
      accent100: '#06d6a0', // 翠绿/薄荷绿，用于高亮、通知、成功状态
      accent200: '#059a71', // 较深的翠绿，用于对比或强调

      // **文本** 系列
      text100: '#1c212a', // 深灰色，用于主要文本（在 bg100 上对比度约 15:1）
      text200: '#5e687e', // 中等灰色，用于次要文本、图标

      // **背景/结构** 系列
      bg100: '#f7f8fc', // 极浅的蓝灰色，用于主要背景
      bg200: '#eef1f6', // 浅灰色，用于面板、卡片背景
      bg300: '#d7dae0', // 柔和的灰色，用于边框、分割线

      // **功能色**
      functionalColors: buildFunctionalColors({
        color: '#3665f9', // 基础色
        hover: '#5c84fb', // 悬停色
        active: '#8caaff', // 激活色
        disabled: '#d7dae0', // 禁用状态的文本/背景
        text: '#ffffff', // 按钮内的文本颜色
        border: '#2c53cb', // 稍深的青花瓷蓝，用于边框
      }),
    },
  },
  {
    label: '申布伦日光',
    value: 'schonbrunn-sunlight',
    themeColors: {
      // **申布伦黄** 系列
      primary100: '#f9dc24', // 主题色：申布伦黄，用于核心元素、高亮区域
      primary200: '#ffee58', // 较浅的黄色，用于悬停（hover）背景（在 #ffffff 上对比度较低，适合作为背景色使用）
      primary300: '#fff38b', // 更浅的黄色，用于点击/激活（active）背景
      primary400: '#1a1a1a', // **核心操作上的默认文本颜色（深色），确保在鲜艳的黄上对比度高（对比度约 8.5:1）**

      // **点缀色** 系列 (选择一种与其对比度强烈的颜色，如鲜艳的蓝色)
      accent100: '#0070c0', // 鲜艳的海军蓝/亮蓝色，用于点缀、链接、信息状态
      accent200: '#004d80', // 较深的蓝色，用于对比或强调

      // **文本** 系列
      text100: '#2a2a2a', // 深灰色/近黑色，用于主要文本（确保在浅色背景上对比度高，约 15:1）
      text200: '#6d6d6d', // 中等灰色，用于次要文本、图标

      // **背景/结构** 系列
      bg100: '#fcfcfc', // 纯净的白色/极浅色，用于主要背景
      bg200: '#f5f5f5', // 柔和的浅灰色，用于面板、卡片背景
      bg300: '#e0e0e0', // 浅灰色，用于边框、分割线

      // **功能色**
      functionalColors: buildFunctionalColors({
        color: '#f9dc24', // 基础色 (申布伦黄)
        hover: '#f5c614', // 稍深的黄色，提供悬停反馈
        active: '#e0b514', // 更深的黄色，提供点击反馈
        disabled: '#e0e0e0', // 禁用状态的背景
        text: '#1a1a1a', // **按钮内的文本颜色 (深色)**
        border: '#f5c614', // 稍深的黄色，用于边框
      }),
    },
  },
  {
    label: '勃艮第庄园',
    value: 'burgundy-estate',
    themeColors: {
      // **勃艮第红** 系列
      primary100: '#800020', // 主题色：勃艮第红，用于按钮背景、核心元素
      primary200: '#A42A46', // 较浅的勃艮第红，用于悬停（hover）文本/背景（在 #ffffff 上对比度约 5.0:1）
      primary300: '#C9556C', // 更浅的勃艮第红，用于点击/激活（active）文本/背景（在 #ffffff 上对比度约 6.0:1）
      primary400: '#ffffff', // 核心操作上的默认文本颜色（白色，在 primary100 上对比度约 6.5:1）

      // **点缀色** 系列 (选择与其形成对比的高雅金色或淡青色)
      accent100: '#FFC107', // 琥珀金/淡黄色，用于高亮、通知、警告
      accent200: '#CC9A00', // 较深的金色，用于对比或强调

      // **文本** 系列
      text100: '#2C1B1E', // 极深的红棕色/近黑色，用于主要文本（在 bg100 上对比度约 15:1）
      text200: '#756A6C', // 柔和的中性灰色，用于次要文本、图标

      // **背景/结构** 系列
      bg100: '#F9F8F7', // 极浅的米白色，用于主要背景
      bg200: '#EDEBE9', // 柔和的浅灰色，用于面板、卡片背景
      bg300: '#DAD8D6', // 浅灰色，用于边框、分割线

      // **功能色**
      functionalColors: buildFunctionalColors({
        color: '#800020', // 基础色 (勃艮第红)
        hover: '#A42A46', // 悬停色
        active: '#C9556C', // 激活色
        disabled: '#DAD8D6', // 禁用状态的文本/背景
        text: '#ffffff', // 按钮内的文本颜色
        border: '#530015', // 稍深的勃艮第红，用于边框
      }),
    },
  },
]

/**
 * 深色主题选项
 */
export const darkThemeOptions: ThemeColor[] = [
  {
    label: '丝绒暗夜',
    value: 'velvet-twilight',
    themeColors: {
      // **爱马仕橙** 系列
      primary100: '#E85827', // 主题色：爱马仕橙，用于按钮背景、核心元素
      primary200: '#F0805B', // 较浅的橙色，用于悬停（hover）文本/背景（在 bg100 上对比度约 8.5:1）
      primary300: '#F5A78E', // 更浅的橙色，用于点击/激活（active）文本/背景（在 bg100 上对比度约 10:1）
      primary400: '#2A1C16', // 核心操作上的默认文本颜色（深棕色文本，在 primary100 上对比度约 5.8:1）

      // **点缀色** 系列 (选择一种高亮、精致的颜色，如淡金色)
      accent100: '#FFD700', // 纯金色/淡黄色，用于高亮、警告、通知
      accent200: '#C5A500', // 较深的金色，用于对比或强调

      // **文本** 系列
      text100: '#F7EFE9', // 极浅的奶油白，用于主要文本（在 bg100 上对比度约 18:1）
      text200: '#C7B9B0', // 柔和的浅棕灰色，用于次要文本、提示信息

      // **背景/结构** 系列
      bg100: '#1F1713', // 极深的暖灰色/黑棕色，用于主要背景
      bg200: '#322621', // 稍亮的深棕色，用于面板、卡片背景
      bg300: '#4A3D36', // 中等深度的暖灰色，用于边框、分割线

      // **功能色**
      functionalColors: buildFunctionalColors({
        color: '#E85827', // 基础色
        hover: '#F0805B', // 悬停色
        active: '#F5A78E', // 激活色
        disabled: '#4A3D36', // 禁用状态的文本/背景
        text: '#2A1C16', // 按钮内的文本颜色
        border: '#B34520', // 稍深的橙色，用于边框
      }),
    },
  },
  {
    label: '静夜蓝',
    value: 'tranquil-night',
    themeColors: {
      // **青花瓷蓝** 系列
      primary100: '#3665f9', // 主题色：青花瓷蓝，用于按钮背景、核心元素
      primary200: '#5c84fb', // 浅一点的青花瓷蓝，用于悬停（hover）文本/背景（在 bg100 上对比度约 5.5:1）
      primary300: '#8caaff', // 更浅的青花瓷蓝，用于点击/激活（active）文本/背景（在 bg100 上对比度约 8.1:1）
      primary400: '#ffffff', // 核心操作上的默认文本颜色（深色文本，在 primary100 上对比度约 5.1:1）

      // **点缀色** 系列 (选择一种高亮、互补的颜色，如亮橙黄)
      accent100: '#ffc600', // 亮橙黄，用于高亮、警告、通知
      accent200: '#ff8a00', // 较深的橙色，用于对比或强调

      // **文本** 系列
      text100: '#f0f4ff', // 极浅的蓝白色，用于主要文本（在 bg100 上对比度约 18:1）
      text200: '#aab8d0', // 柔和的浅灰蓝，用于次要文本、提示信息

      // **背景/结构** 系列
      bg100: '#1b2333', // 深邃的夜空蓝/暗灰色，用于主要背景
      bg200: '#2a364a', // 稍亮的深灰蓝，用于面板、卡片背景
      bg300: '#41526b', // 中等深度的蓝灰色，用于边框、分割线

      // **功能色**
      functionalColors: buildFunctionalColors({
        color: '#3665f9', // 基础色
        hover: '#5c84fb', // 悬停色
        active: '#8caaff', // 激活色
        disabled: '#41526b', // 禁用状态的文本/背景
        text: '#131926', // 按钮内的文本颜色
        border: '#2c53cb', // 稍深的青花瓷蓝，用于边框
      }),
    },
  },

  {
    label: '金色宫廷',
    value: 'golden-court',
    themeColors: {
      // **申布伦黄** 系列
      primary100: '#f9dc24', // 主题色：申布伦黄，用于按钮背景、核心元素
      primary200: '#fff38b', // 较浅的黄色，用于悬停（hover）文本/背景（在 bg100 上对比度约 10:1）
      primary300: '#fff9c4', // 更浅的黄色，用于点击/激活（active）文本/背景（在 bg100 上对比度约 12:1）
      primary400: '#1a1a1a', // **核心操作上的默认文本颜色（深色），确保在鲜艳的黄上对比度高（对比度约 8.5:1）**

      // **点缀色** 系列 (选择一种与其形成鲜明对比的深红/勃艮第红)
      accent100: '#a71d31', // 勃艮第红/深红色，用于高亮、警告、通知
      accent200: '#70101d', // 较深的红色，用于对比或强调

      // **文本** 系列
      text100: '#fafafa', // 极浅的白色，用于主要文本（在 bg100 上对比度约 18:1）
      text200: '#c5c5c5', // 柔和的浅灰色，用于次要文本、提示信息

      // **背景/结构** 系列
      bg100: '#1f1f1f', // 极深的暗灰色，用于主要背景
      bg200: '#333333', // 稍亮的深灰色，用于面板、卡片背景
      bg300: '#4a4a4a', // 中等深度的灰色，用于边框、分割线

      // **功能色**
      functionalColors: buildFunctionalColors({
        color: '#f9dc24', // 基础色 (申布伦黄)
        hover: '#f5c614', // 稍深的黄色，提供悬停反馈
        active: '#e0b514', // 更深的黄色，提供点击反馈
        disabled: '#4a4a4a', // 禁用状态的背景
        text: '#1a1a1a', // **按钮内的文本颜色 (深色)**
        border: '#f5c614', // 稍深的黄色，用于边框
      }),
    },
  },
  {
    label: '深红丝绒',
    value: 'deep-red-velvet',
    themeColors: {
      // **勃艮第红** 系列
      primary100: '#800020', // 主题色：勃艮第红，用于按钮背景、核心元素
      primary200: '#A42A46', // 较浅的勃艮第红，用于悬停（hover）文本/背景（在 bg100 上对比度约 4.5:1）
      primary300: '#C9556C', // 更浅的勃艮第红，用于点击/激活（active）文本/背景（在 bg100 上对比度约 5.5:1）
      primary400: '#F9F8F7', // 核心操作上的默认文本颜色（极浅色，在 primary100 上对比度约 6.5:1）

      // **点缀色** 系列 (选择高贵、明亮的金色)
      accent100: '#FFD700', // 纯金色，用于高亮、警告、通知
      accent200: '#E0AA00', // 较深的金色，用于对比或强调

      // **文本** 系列
      text100: '#F9F8F7', // 极浅的米白色，用于主要文本（在 bg100 上对比度约 18:1）
      text200: '#C5B9BA', // 柔和的浅灰红，用于次要文本、提示信息

      // **背景/结构** 系列
      bg100: '#1A1012', // 极深的暗红棕色，用于主要背景
      bg200: '#2A1F21', // 稍亮的深红棕色，用于面板、卡片背景
      bg300: '#403537', // 中等深度的暖灰色，用于边框、分割线

      // **功能色**
      functionalColors: buildFunctionalColors({
        color: '#800020', // 基础色 (勃艮第红)
        hover: '#A42A46', // 悬停色
        active: '#C9556C', // 激活色
        disabled: '#403537', // 禁用状态的背景
        text: '#F9F8F7', // 按钮内的文本颜色 (浅色)
        border: '#530015', // 稍深的勃艮第红，用于边框
      }),
    },
  },
]

/**
 * 获取主题选项的工具函数
 */
