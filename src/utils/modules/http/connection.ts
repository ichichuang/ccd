import { HTTP_CONFIG } from '@/constants'
import { t } from '@/locales'
import type { ConnectionConfig, ConnectionState } from './types'

/**
 * 连接状态枚举
 */
export enum ConnectionStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error',
}

/**
 * 连接管理器
 * 负责管理网络连接状态、自动重连和健康检查
 */
export class ConnectionManager {
  private state: ConnectionState
  private config: ConnectionConfig
  private healthCheckTimer?: NodeJS.Timeout
  private reconnectTimer?: NodeJS.Timeout
  private listeners: Set<(state: ConnectionState) => void>
  private isDestroyed = false

  constructor(config?: Partial<ConnectionConfig>) {
    this.config = {
      autoReconnect: true,
      maxReconnectAttempts: HTTP_CONFIG.maxReconnectAttempts,
      reconnectDelay: HTTP_CONFIG.reconnectDelay,
      healthCheckInterval: HTTP_CONFIG.healthCheckInterval,
      ...config,
    }

    this.state = {
      isConnected: navigator.onLine,
      isReconnecting: false,
      lastConnectedAt: navigator.onLine ? new Date() : undefined,
      disconnectReason: navigator.onLine ? undefined : t('http.connection.networkUnavailable'),
      reconnectAttempts: 0,
      maxReconnectAttempts: this.config.maxReconnectAttempts,
    }

    this.listeners = new Set()
    this.setupNetworkListeners()
    this.startHealthCheck()
  }

  /**
   * 获取当前连接状态
   */
  getConnectionState(): ConnectionState {
    return { ...this.state }
  }

  /**
   * 添加连接状态监听器
   */
  addListener(listener: (state: ConnectionState) => void): () => void {
    this.listeners.add(listener)
    // 立即通知当前状态
    listener(this.getConnectionState())

    // 返回移除监听器的函数
    return () => {
      this.listeners.delete(listener)
    }
  }

  /**
   * 断开连接
   */
  disconnect(reason?: string): void {
    if (this.isDestroyed) {
      return
    }

    this.state.isConnected = false
    this.state.disconnectReason = reason || t('http.connection.manualDisconnect')
    this.state.lastConnectedAt = undefined

    this.stopHealthCheck()
    this.notifyListeners()
  }

  /**
   * 重新连接
   */
  async reconnect(): Promise<boolean> {
    if (this.isDestroyed || this.state.isReconnecting) {
      return false
    }

    if (this.state.reconnectAttempts >= this.config.maxReconnectAttempts) {
      this.state.disconnectReason = t('http.connection.maxReconnectAttemptsReached')
      this.notifyListeners()
      return false
    }

    this.state.isReconnecting = true
    this.state.reconnectAttempts++
    this.notifyListeners()

    const success = await this.attemptReconnect()
    if (success) {
      this.onReconnectSuccess()
    } else {
      this.onReconnectFailed()
    }

    return success
  }

  /**
   * 尝试重新连接
   */
  private async attemptReconnect(): Promise<boolean> {
    try {
      // 等待重连延迟
      await this.delay(this.config.reconnectDelay)

      // 检查网络状态
      if (!navigator.onLine) {
        return false
      }

      // 执行健康检查
      const isHealthy = await this.performHealthCheck()
      if (isHealthy) {
        return true
      }

      // 如果健康检查失败，等待一段时间后重试
      await this.delay(1000)
      return await this.performHealthCheck()
    } catch (error) {
      console.error('重连失败:', error)
      return false
    }
  }

  /**
   * 重连成功处理
   */
  private onReconnectSuccess(): void {
    this.state.isConnected = true
    this.state.isReconnecting = false
    this.state.lastConnectedAt = new Date()
    this.state.disconnectReason = undefined
    this.state.reconnectAttempts = 0

    this.startHealthCheck()
    this.notifyListeners()

    console.log('✅ 网络连接已恢复')
  }

  /**
   * 重连失败处理
   */
  private onReconnectFailed(): void {
    this.state.isReconnecting = false
    this.state.disconnectReason = t('http.connection.reconnectFailed')

    this.notifyListeners()

    // 如果启用了自动重连，继续尝试
    if (this.config.autoReconnect) {
      this.reconnectTimer = setTimeout(() => {
        this.reconnect()
      }, this.config.reconnectDelay)
    }
  }

  /**
   * 执行健康检查
   */
  private async performHealthCheck(): Promise<boolean> {
    if (!this.config.healthCheckUrl) {
      // 如果没有配置健康检查 URL，使用网络状态作为判断依据
      return navigator.onLine
    }

    try {
      const response = await fetch(this.config.healthCheckUrl, {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache',
      })
      return response.ok
    } catch {
      return false
    }
  }

  /**
   * 启动健康检查
   */
  private startHealthCheck(): void {
    if (this.healthCheckTimer || !this.config.healthCheckUrl) {
      return
    }

    this.healthCheckTimer = setInterval(async () => {
      if (this.isDestroyed) {
        this.stopHealthCheck()
        return
      }

      const isHealthy = await this.performHealthCheck()
      if (!isHealthy && this.state.isConnected) {
        this.state.isConnected = false
        this.state.disconnectReason = t('http.connection.healthCheckFailed')
        this.notifyListeners()

        // 如果启用了自动重连，尝试重连
        if (this.config.autoReconnect) {
          this.reconnect()
        }
      }
    }, this.config.healthCheckInterval)
  }

  /**
   * 停止健康检查
   */
  private stopHealthCheck(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer)
      this.healthCheckTimer = undefined
    }
  }

  /**
   * 设置网络状态监听器
   */
  private setupNetworkListeners(): void {
    const handleOnline = () => {
      if (this.isDestroyed) {
        return
      }

      this.state.isConnected = true
      this.state.lastConnectedAt = new Date()
      this.state.disconnectReason = undefined
      this.state.reconnectAttempts = 0

      this.startHealthCheck()
      this.notifyListeners()

      console.log('✅ 网络已连接')
    }

    const handleOffline = () => {
      if (this.isDestroyed) {
        return
      }

      this.state.isConnected = false
      this.state.disconnectReason = t('http.connection.networkDisconnected')
      this.state.lastConnectedAt = undefined

      this.stopHealthCheck()
      this.notifyListeners()

      console.log('⚠️ 网络已断开')

      // 如果启用了自动重连，尝试重连
      if (this.config.autoReconnect) {
        this.reconnect()
      }
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // 保存清理函数
    this.cleanup = () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 通知所有监听器
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.getConnectionState())
      } catch (error) {
        console.error('监听器执行错误:', error)
      }
    })
  }

  /**
   * 清理资源
   */
  destroy(): void {
    if (this.isDestroyed) {
      return
    }

    this.isDestroyed = true
    this.stopHealthCheck()

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = undefined
    }

    if (this.cleanup) {
      this.cleanup()
    }

    this.listeners.clear()
  }

  private cleanup?: () => void
}

// 创建全局连接管理器实例
export const connectionManager = new ConnectionManager()

// 导出便捷函数
export const getConnectionState = () => connectionManager.getConnectionState()
export const addConnectionListener = (listener: (state: ConnectionState) => void) =>
  connectionManager.addListener(listener)
export const disconnect = (reason?: string) => connectionManager.disconnect(reason)
export const reconnect = () => connectionManager.reconnect()
