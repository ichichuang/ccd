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
 * 浅色主题选项 (Light Theme Options) - 红、橙、黄、绿、青、蓝、紫 7色系
 */
export const lightThemeOptions: ThemeColor[] = [
  // 1. 红色系: 经典红 (Classic Red) - #D32F2F
  {
    label: '经典红',
    value: 'classic-red',
    themeColors: {
      primary100: '#D32F2F',
      primary200: '#E57373',
      primary300: '#FFCDD2',
      primary400: '#ffffff', // 白色文本
      accent100: '#00B8D4', // 亮青色点缀
      accent200: '#00838F',
      text100: '#212121', // 深灰色
      text200: '#757575',
      bg100: '#FAFAFA',
      bg200: '#F5F5F5',
      bg300: '#E0E0E0',
      functionalColors: buildFunctionalColors({
        color: '#D32F2F',
        hover: '#E57373',
        active: '#FFCDD2',
        disabled: '#E0E0E0',
        text: '#ffffff',
        border: '#B71C1C',
      }),
    },
  },
  // 2. 橙色系: 爱马仕午后 (Hermès Afternoon) - #E85827 (您原有的方案)
  {
    label: '爱马仕午后',
    value: 'hermes-afternoon',
    themeColors: {
      primary100: '#E85827',
      primary200: '#F0805B',
      primary300: '#F5A78E',
      primary400: '#ffffff',
      accent100: '#03A89E',
      accent200: '#026760',
      text100: '#2A1C16',
      text200: '#796B64',
      bg100: '#FCFAF8',
      bg200: '#F5F0EC',
      bg300: '#E3DDD8',
      functionalColors: buildFunctionalColors({
        color: '#E85827',
        hover: '#F0805B',
        active: '#F5A78E',
        disabled: '#E3DDD8',
        text: '#ffffff',
        border: '#B34520',
      }),
    },
  },
  // 3. 黄色系: 申布伦日光 (Schönbrunn Sunlight) - #f9dc24 (您原有的方案)
  {
    label: '申布伦日光',
    value: 'schonbrunn-sunlight',
    themeColors: {
      primary100: '#f9dc24',
      primary200: '#ffee58',
      primary300: '#fff38b',
      primary400: '#1a1a1a', // 核心操作上的深色文本
      accent100: '#0070c0',
      accent200: '#004d80',
      text100: '#2a2a2a',
      text200: '#6d6d6d',
      bg100: '#fcfcfc',
      bg200: '#f5f5f5',
      bg300: '#e0e0e0',
      functionalColors: buildFunctionalColors({
        color: '#f9dc24',
        hover: '#f5c614',
        active: '#e0b514',
        disabled: '#e0e0e0',
        text: '#1a1a1a', // 按钮内的深色文本
        border: '#f5c614',
      }),
    },
  },
  // 4. 绿色系: 翡翠绿 (Emerald Green) - #009688
  {
    label: '翡翠绿',
    value: 'emerald-green',
    themeColors: {
      primary100: '#009688',
      primary200: '#4DB6AC',
      primary300: '#B2DFDB',
      primary400: '#ffffff', // 白色文本
      accent100: '#FF9800', // 琥珀色点缀
      accent200: '#FB8C00',
      text100: '#212121',
      text200: '#757575',
      bg100: '#FAFAFA',
      bg200: '#F5F5F5',
      bg300: '#E0E0E0',
      functionalColors: buildFunctionalColors({
        color: '#009688',
        hover: '#4DB6AC',
        active: '#B2DFDB',
        disabled: '#E0E0E0',
        text: '#ffffff',
        border: '#00695C',
      }),
    },
  },
  // 5. 青色系: 邦迪海岸 (Bondi Coast) - #0897b4
  {
    label: '邦迪海岸',
    value: 'bondi-coast',
    themeColors: {
      primary100: '#0897b4',
      primary200: '#34b2cd',
      primary300: '#64d0e6',
      primary400: '#ffffff',
      accent100: '#ff8a5c', // 珊瑚橙点缀
      accent200: '#e64e20',
      text100: '#142833',
      text200: '#5a7385',
      bg100: '#f8fcfe',
      bg200: '#eef5f8',
      bg300: '#d9e3e9',
      functionalColors: buildFunctionalColors({
        color: '#0897b4',
        hover: '#34b2cd',
        active: '#64d0e6',
        disabled: '#d9e3e9',
        text: '#ffffff',
        border: '#057991',
      }),
    },
  },
  // 6. 蓝色系: 青花瓷韵 (Porcelain Charm) - #3665f9 (您原有的方案)
  {
    label: '青花瓷韵',
    value: 'porcelain-charm',
    themeColors: {
      primary100: '#3665f9',
      primary200: '#5c84fb',
      primary300: '#8caaff',
      primary400: '#ffffff',
      accent100: '#06d6a0',
      accent200: '#059a71',
      text100: '#1c212a',
      text200: '#5e687e',
      bg100: '#f7f8fc',
      bg200: '#eef1f6',
      bg300: '#d7dae0',
      functionalColors: buildFunctionalColors({
        color: '#3665f9',
        hover: '#5c84fb',
        active: '#8caaff',
        disabled: '#d7dae0',
        text: '#ffffff',
        border: '#2c53cb',
      }),
    },
  },
  // 7. 紫色系: 薰衣草紫 (Lavender Violet) - #673AB7
  {
    label: '薰衣草紫',
    value: 'lavender-violet',
    themeColors: {
      primary100: '#673AB7',
      primary200: '#9575CD',
      primary300: '#D1C4E9',
      primary400: '#ffffff', // 白色文本
      accent100: '#FFB300', // 橙色点缀
      accent200: '#FF8F00',
      text100: '#212121',
      text200: '#757575',
      bg100: '#FAFAFA',
      bg200: '#F5F5F5',
      bg300: '#E0E0E0',
      functionalColors: buildFunctionalColors({
        color: '#673AB7',
        hover: '#9575CD',
        active: '#D1C4E9',
        disabled: '#E0E0E0',
        text: '#ffffff',
        border: '#512DA8',
      }),
    },
  },
]

/**
 * 深色主题选项 (Dark Theme Options) - 红、橙、黄、绿、青、蓝、紫 7色系
 */
export const darkThemeOptions: ThemeColor[] = [
  // 1. 红色系: 深红丝绒 (Deep Red Velvet) - #800020 (您原有的方案)
  {
    label: '深红丝绒',
    value: 'deep-red-velvet',
    themeColors: {
      primary100: '#800020',
      primary200: '#A42A46',
      primary300: '#C9556C',
      primary400: '#F9F8F7', // 极浅色文本
      accent100: '#FFD700',
      accent200: '#E0AA00',
      text100: '#F9F8F7',
      text200: '#C5B9BA',
      bg100: '#1A1012',
      bg200: '#2A1F21',
      bg300: '#403537',
      functionalColors: buildFunctionalColors({
        color: '#800020',
        hover: '#A42A46',
        active: '#C9556C',
        disabled: '#403537',
        text: '#F9F8F7',
        border: '#530015',
      }),
    },
  },
  // 2. 橙色系: 燃木之光 (Burnt Wood Glow) - #FF7043
  {
    label: '燃木之光',
    value: 'burnt-wood-glow',
    themeColors: {
      primary100: '#FF7043',
      primary200: '#FFAA85',
      primary300: '#FFDAB9',
      primary400: '#1F1F1F', // 深色文本
      accent100: '#00BCD4', // 青色点缀
      accent200: '#00838F',
      text100: '#FAFAFA',
      text200: '#BDBDBD',
      bg100: '#1F1F1F',
      bg200: '#333333',
      bg300: '#4A4A4A',
      functionalColors: buildFunctionalColors({
        color: '#FF7043',
        hover: '#FFAA85',
        active: '#FFDAB9',
        disabled: '#4A4A4A',
        text: '#1F1F1F',
        border: '#F4511E',
      }),
    },
  },
  // 3. 黄色系: 金色宫廷 (Golden Court) - #f9dc24 (您原有的方案)
  {
    label: '金色宫廷',
    value: 'golden-court',
    themeColors: {
      primary100: '#f9dc24',
      primary200: '#fff38b',
      primary300: '#fff9c4',
      primary400: '#1a1a1a',
      accent100: '#a71d31',
      accent200: '#70101d',
      text100: '#fafafa',
      text200: '#c5c5c5',
      bg100: '#1f1f1f',
      bg200: '#333333',
      bg300: '#4a4a4a',
      functionalColors: buildFunctionalColors({
        color: '#f9dc24',
        hover: '#f5c614',
        active: '#e0b514',
        disabled: '#4a4a4a',
        text: '#1a1a1a',
        border: '#f5c614',
      }),
    },
  },
  // 4. 绿色系: 森林夜语 (Forest Night) - #4CAF50
  {
    label: '森林夜语',
    value: 'forest-night',
    themeColors: {
      primary100: '#4CAF50',
      primary200: '#81C784',
      primary300: '#C8E6C9',
      primary400: '#1F1F1F', // 深色文本
      accent100: '#FF9800', // 琥珀色点缀
      accent200: '#FB8C00',
      text100: '#FAFAFA',
      text200: '#BDBDBD',
      bg100: '#1F1F1F',
      bg200: '#333333',
      bg300: '#4A4A4A',
      functionalColors: buildFunctionalColors({
        color: '#4CAF50',
        hover: '#81C784',
        active: '#C8E6C9',
        disabled: '#4A4A4A',
        text: '#1F1F1F',
        border: '#388E3C',
      }),
    },
  },
  // 5. 青色系: 深海潜影 (Deep Dive Shadow) - #00BCD4
  {
    label: '深海潜影',
    value: 'deep-dive-shadow',
    themeColors: {
      primary100: '#00BCD4',
      primary200: '#4DD0E1',
      primary300: '#B2EBF2',
      primary400: '#1F1F1F', // 深色文本
      accent100: '#FFEB3B', // 黄色点缀
      accent200: '#FFC107',
      text100: '#E0F7FA', // 极浅青色文本
      text200: '#80DEEA',
      bg100: '#1A237E', // 深蓝色背景
      bg200: '#303F9F',
      bg300: '#5C6BC0',
      functionalColors: buildFunctionalColors({
        color: '#00BCD4',
        hover: '#4DD0E1',
        active: '#B2EBF2',
        disabled: '#5C6BC0',
        text: '#1F1F1F',
        border: '#0097A7',
      }),
    },
  },
  // 6. 蓝色系: 静夜蓝 (Tranquil Night) - #3665f9 (您原有的方案，Primary100为青花瓷蓝)
  {
    label: '静夜蓝',
    value: 'tranquil-night',
    themeColors: {
      primary100: '#3665f9',
      primary200: '#5c84fb',
      primary300: '#8caaff',
      primary400: '#ffffff', // 白色文本
      accent100: '#ffc600',
      accent200: '#ff8a00',
      text100: '#f0f4ff',
      text200: '#aab8d0',
      bg100: '#1b2333',
      bg200: '#2a364a',
      bg300: '#41526b',
      functionalColors: buildFunctionalColors({
        color: '#3665f9',
        hover: '#5c84fb',
        active: '#8caaff',
        disabled: '#41526b',
        text: '#131926',
        border: '#2c53cb',
      }),
    },
  },
  // 7. 紫色系: 皇家紫 (Royal Purple) - #9C27B0
  {
    label: '皇家紫',
    value: 'royal-purple',
    themeColors: {
      primary100: '#9C27B0',
      primary200: '#CE93D8',
      primary300: '#E1BEE7',
      primary400: '#1F1F1F', // 深色文本
      accent100: '#FFD700', // 金色点缀
      accent200: '#FFC107',
      text100: '#FAFAFA',
      text200: '#BDBDBD',
      bg100: '#1F1F1F',
      bg200: '#333333',
      bg300: '#4A4A4A',
      functionalColors: buildFunctionalColors({
        color: '#9C27B0',
        hover: '#CE93D8',
        active: '#E1BEE7',
        disabled: '#4A4A4A',
        text: '#1F1F1F',
        border: '#7B1FA2',
      }),
    },
  },
]

/**
 * 获取主题选项的工具函数
 */
