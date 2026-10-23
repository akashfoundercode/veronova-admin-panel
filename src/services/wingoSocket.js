import { io } from 'socket.io-client'
import { SOCKET_CONFIG } from '@/constants/socketConfig'

class WingoSocketService {
  constructor() {
    this.socket = null
    this.subscribers = new Set()
    this.isConnected = false
    this.lastPacket = {
      oneMinTimer: 60,
      threeMinTimer: 180,
      fiveMinTimer: 300,
      tenMinTimer: 600,
      timerBetTime: 10,
      timerStatus: 1,
      timestamp: Date.now(),
    }
    this.localTickTimer = null
    this.connect()
    this.startLocalTick()
  }

  connect() {
    if (this.socket) return

    const { URL, EVENT_NAME, RECONNECT_DELAY, TIMEOUT } = SOCKET_CONFIG.WINGO
    console.log(`[WinGo Socket] Initializing connection to ${URL} (Event: ${EVENT_NAME})...`)

    try {
      this.socket = io(URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: RECONNECT_DELAY || 1000,
        timeout: TIMEOUT || 10000,
        secure: true,
      })

      this.socket.on('connect', () => {
        this.isConnected = true
        console.log(`[WinGo Socket] Connected successfully to ${URL} (Socket ID: ${this.socket.id})`)
        this.notifySubscribers({
          type: 'CONNECTION_CHANGE',
          connected: true,
          socketId: this.socket.id,
        })
      })

      this.socket.on('disconnect', (reason) => {
        this.isConnected = false
        console.warn(`[WinGo Socket] Disconnected from ${URL}:`, reason)
        this.notifySubscribers({
          type: 'CONNECTION_CHANGE',
          connected: false,
          reason,
        })
      })

      this.socket.on('connect_error', (error) => {
        this.isConnected = false
        console.warn(`[WinGo Socket] Connection Error:`, error.message)
        this.notifySubscribers({
          type: 'CONNECTION_CHANGE',
          connected: false,
          error: error.message,
        })
      })

      // Main WinGo event listener: funplay_wingo
      this.socket.on(EVENT_NAME, (rawData) => {
        this.handleEventData(rawData)
      })

      // Generic fallbacks in case server sends on generic names
      this.socket.on('wingo', (rawData) => {
        this.handleEventData(rawData)
      })
      this.socket.on('message', (rawData) => {
        this.handleEventData(rawData)
      })
      this.socket.on('data', (rawData) => {
        this.handleEventData(rawData)
      })
    } catch (err) {
      console.error(`[WinGo Socket] Initialization error:`, err)
    }
  }

  handleEventData(rawData) {
    let payload = rawData
    if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload)
      } catch {
        return
      }
    }

    if (!payload || typeof payload !== 'object') return

    // Extract exact timers from funplay_wingo packet
    const oneMin = payload.oneMinTimer !== undefined ? Number(payload.oneMinTimer) : (this.lastPacket.oneMinTimer ?? 60)
    const thirtySec = payload.thirtySecTimer !== undefined
      ? Number(payload.thirtySecTimer)
      : payload.sec30Timer !== undefined
      ? Number(payload.sec30Timer)
      : (oneMin % 30 || 30)

    const twoMin = payload.twoMinTimer !== undefined
      ? Number(payload.twoMinTimer)
      : (this.lastPacket.twoMinTimer && this.lastPacket.twoMinTimer > 0 ? this.lastPacket.twoMinTimer : 120)

    const normalized = {
      thirtySecTimer: Math.max(0, thirtySec),
      oneMinTimer: Math.max(0, oneMin),
      twoMinTimer: Math.max(0, twoMin),
      threeMinTimer: payload.threeMinTimer !== undefined ? Number(payload.threeMinTimer) : (this.lastPacket.threeMinTimer ?? 180),
      fiveMinTimer: payload.fiveMinTimer !== undefined ? Number(payload.fiveMinTimer) : (this.lastPacket.fiveMinTimer ?? 300),
      tenMinTimer: payload.tenMinTimer !== undefined ? Number(payload.tenMinTimer) : (this.lastPacket.tenMinTimer ?? 600),
      timerBetTime: payload.timerBetTime !== undefined ? Number(payload.timerBetTime) : (this.lastPacket.timerBetTime ?? 5),
      timerStatus: payload.timerStatus !== undefined ? Number(payload.timerStatus) : 1,
      raw: payload,
      timestamp: Date.now(),
    }

    this.lastPacket = normalized

    this.notifySubscribers({
      type: 'WINGO_PACKET',
      packet: normalized,
    })
  }

  // Smooth local second countdown so clock ticks reliably between packet broadcasts
  startLocalTick() {
    if (this.localTickTimer) clearInterval(this.localTickTimer)
    this.localTickTimer = setInterval(() => {
      if (!this.lastPacket) return
      // Only decrement if last socket packet was received more than 1 second ago
      const timeSincePacket = Date.now() - (this.lastPacket.timestamp || 0)
      if (timeSincePacket >= 1000) {
        this.lastPacket = {
          ...this.lastPacket,
          thirtySecTimer: this.lastPacket.thirtySecTimer > 0 ? this.lastPacket.thirtySecTimer - 1 : 30,
          oneMinTimer: Math.max(0, this.lastPacket.oneMinTimer - 1),
          twoMinTimer: this.lastPacket.twoMinTimer > 0 ? this.lastPacket.twoMinTimer - 1 : 120,
          threeMinTimer: Math.max(0, this.lastPacket.threeMinTimer - 1),
          fiveMinTimer: Math.max(0, this.lastPacket.fiveMinTimer - 1),
          tenMinTimer: Math.max(0, this.lastPacket.tenMinTimer - 1),
        }
        this.notifySubscribers({
          type: 'WINGO_TICK',
          packet: this.lastPacket,
        })
      }
    }, 1000)
  }

  subscribe(callback) {
    this.subscribers.add(callback)
    if (this.lastPacket) {
      try {
        callback({
          type: 'WINGO_PACKET',
          packet: this.lastPacket,
        })
      } catch (err) {
        console.error('[WinGo Socket] Subscriber callback error:', err)
      }
    }
    return () => {
      this.subscribers.delete(callback)
    }
  }

  notifySubscribers(data) {
    this.subscribers.forEach((callback) => {
      try {
        callback(data)
      } catch (err) {
        console.error('[WinGo Socket] Subscriber notify error:', err)
      }
    })
  }

  getStatus() {
    return {
      connected: this.isConnected,
      channel: SOCKET_CONFIG.WINGO.EVENT_NAME,
      serverUrl: SOCKET_CONFIG.WINGO.URL,
      lastPacket: this.lastPacket,
    }
  }

  disconnect() {
    if (this.localTickTimer) clearInterval(this.localTickTimer)
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    this.isConnected = false
  }
}

// Export singleton instance
export const wingoSocket = new WingoSocketService()
export default wingoSocket

