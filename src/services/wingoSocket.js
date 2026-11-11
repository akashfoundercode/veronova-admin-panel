import { io } from 'socket.io-client'
import { SOCKET_CONFIG } from '@/constants/socketConfig'

class WingoSocketService {
  constructor() {
    this.socket = null
    this.subscribers = new Set()
    this.isConnected = false
    this.hasReceivedServerPacket = false
    this.lastPacket = {
      thirtySecTimer: 0,
      oneMinTimer: 0,
      twoMinTimer: 0,
      threeMinTimer: 0,
      fiveMinTimer: 0,
      tenMinTimer: 0,
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
        // Direct local websocket avoids browser CORS preflight on Socket.IO polling.
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: RECONNECT_DELAY || 1000,
        timeout: TIMEOUT || 10000,
      })

      this.socket.on('connect', () => {
        this.isConnected = true
        console.log(`[WinGo Socket] Connected successfully to ${URL} (Socket ID: ${this.socket.id})`)
        const eventNames = [EVENT_NAME, ...(SOCKET_CONFIG.WINGO.EVENT_ALIASES || [])]
        eventNames.forEach((eventName) => {
          this.socket.emit('join', eventName)
          this.socket.emit('subscribe', { event: eventName })
        })
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

      // Listen to the configured channel and temporary aliases during backend migration.
      ;[EVENT_NAME, ...(SOCKET_CONFIG.WINGO.EVENT_ALIASES || [])].forEach((eventName) => {
        this.socket.on(eventName, (rawData) => {
          console.info(`[WinGo Socket] Received ${eventName}:`, rawData)
          this.handleEventData(rawData)
        })
      })

      // Generic fallbacks in case server sends on generic names
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

    const nestedPacket = [payload.data, payload.payload, payload.result].find(
      (value) => value && typeof value === 'object' && !Array.isArray(value)
    )
    const packet = nestedPacket ? { ...payload, ...nestedPacket } : payload

    const readTimer = (keys, fallback) => {
      for (const key of keys) {
        if (packet[key] !== undefined && Number.isFinite(Number(packet[key]))) return Number(packet[key])
      }
      return fallback
    }
    const oneMin = readTimer(['oneMinTimer', 'one_min_timer', 'timer1m', 'timer_1m'], this.lastPacket.oneMinTimer ?? 60)
    const thirtySec = readTimer(['thirtySecTimer', 'thirty_sec_timer', 'sec30Timer', 'sec30_timer', 'timer30s', 'timer_30s'], null)
    const resolvedThirtySec = thirtySec !== null ? thirtySec : (oneMin % 30)
    const twoMin = readTimer(['twoMinTimer', 'two_min_timer', 'timer2m', 'timer_2m'], this.lastPacket.twoMinTimer ?? 120)

    const normalized = {
      thirtySecTimer: Math.max(0, resolvedThirtySec),
      oneMinTimer: Math.max(0, oneMin),
      twoMinTimer: Math.max(0, twoMin),
      threeMinTimer: Math.max(0, readTimer(['threeMinTimer', 'three_min_timer', 'timer3m', 'timer_3m'], this.lastPacket.threeMinTimer ?? 180)),
      fiveMinTimer: Math.max(0, readTimer(['fiveMinTimer', 'five_min_timer', 'timer5m', 'timer_5m'], this.lastPacket.fiveMinTimer ?? 300)),
      tenMinTimer: Math.max(0, readTimer(['tenMinTimer', 'ten_min_timer', 'timer10m', 'timer_10m'], this.lastPacket.tenMinTimer ?? 600)),
      timerBetTime: Math.max(0, readTimer(['timerBetTime', 'timer_bet_time', 'betTimer'], this.lastPacket.timerBetTime ?? 5)),
      timerStatus: readTimer(['timerStatus', 'timer_status', 'status'], 1),
      raw: packet,
      timestamp: Date.now(),
    }

    this.hasReceivedServerPacket = true
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
      if (!this.lastPacket || !this.hasReceivedServerPacket) return
      // Only decrement if last socket packet was received more than 1 second ago
      const timeSincePacket = Date.now() - (this.lastPacket.timestamp || 0)
      if (timeSincePacket >= 1000) {
        this.lastPacket = {
          ...this.lastPacket,
          // Countdown display may smooth server updates, but never invent a new round.
          thirtySecTimer: Math.max(0, this.lastPacket.thirtySecTimer - 1),
          oneMinTimer: Math.max(0, this.lastPacket.oneMinTimer - 1),
          twoMinTimer: Math.max(0, this.lastPacket.twoMinTimer - 1),
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
    if (this.hasReceivedServerPacket) {
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

