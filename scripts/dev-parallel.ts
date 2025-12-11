import { spawn } from 'child_process'
import { logFile, logInfo, logTitle, logWarning } from './utils/logger.js'

logTitle('启动开发环境')
logInfo('启动命名规范监听...')

// 兼容 Windows：使用 pnpm.cmd，否则使用 pnpm
const pnpmCommand = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'

// Windows 下使用 shell 以避免 spawn EINVAL
const isWindows = process.platform === 'win32'

// 启动 Vite 开发服务器 - 保持完整的输出
const viteProcess = spawn(pnpmCommand, ['exec', 'vite'], {
  stdio: 'inherit',
  shell: isWindows,
})

// 启动命名规范监听 - 完全静默，避免干扰 Vite 输出
const namingWatchProcess = spawn(pnpmCommand, ['naming-watch'], {
  stdio: 'pipe',
  shell: isWindows,
})

// 处理命名规范监听的输出 - 完全静默，除非有错误
namingWatchProcess.stdout?.on('data', data => {
  const output = data.toString()
  // 只在有严重错误时才显示
  if (output.includes('❌') && output.includes('错误')) {
    console.log('\n' + output)
  }
})

namingWatchProcess.stderr?.on('data', data => {
  const output = data.toString()
  // 只在有严重错误时才显示
  if (output.includes('Error') || output.includes('error')) {
    console.error('\n命名规范监听错误:', output)
  }
})

// 处理进程退出
process.on('SIGINT', () => {
  logWarning('\n正在停止开发环境...')
  viteProcess.kill('SIGINT')
  namingWatchProcess.kill('SIGINT')
  process.exit(0)
})

// 处理子进程退出
viteProcess.on('exit', code => {
  logFile(`Vite 开发服务器已退出 (代码: ${code})`)
  namingWatchProcess.kill('SIGINT')
  process.exit(code || 0)
})

namingWatchProcess.on('exit', code => {
  if (code !== 0) {
    logInfo(`命名规范监听已退出 (代码: ${code})`)
  }
  viteProcess.kill('SIGINT')
  process.exit(code || 0)
})
