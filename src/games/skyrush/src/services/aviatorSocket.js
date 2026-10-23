import { io } from 'socket.io-client'
import { SOCKET_CONFIG } from '@/constants/socketConfig'

const SOCKET_SERVER_URL = SOCKET_CONFIG.AVIATOR.URL
const SOCKET_EVENT_NAME = SOCKET_CONFIG.AVIATOR.EVENT_NAME
const SOCKET_CRASH_EVENT = SOCKET_CONFIG.AVIATOR.CRASH_EVENT

class AviatorSocketService {
  constructor() {
    this.socket = null
    this.subscribers = new Set()
    this.isConnected = false
    this.lastPacket = null
    this.liveFlyingMultiplier = 1.00
    this.connect()
  }

  connect() {
    if (this.socket) return

    console.log(`[Aviator Socket] Initializing connection to ${SOCKET_SERVER_URL}...`)

    try {
      this.socket = io(SOCKET_SERVER_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 10000,
        secure: true,
      })

      this.socket.on('connect', () => {
        this.isConnected = true
        console.log(`[Aviator Socket] Connected to ${SOCKET_SERVER_URL} (ID: ${this.socket.id})`)
        
        // Subscribe to event channel
        this.socket.emit(SOCKET_EVENT_NAME)
        this.socket.emit('join', SOCKET_EVENT_NAME)
        this.socket.emit('subscribe', { event: SOCKET_EVENT_NAME })

        this.notifySubscribers({
          type: 'CONNECTION_CHANGE',
          connected: true,
          serverUrl: SOCKET_SERVER_URL,
          eventName: SOCKET_EVENT_NAME,
        })
      })

      this.socket.on('disconnect', (reason) => {
        this.isConnected = false
        console.warn(`[Aviator Socket] Disconnected from ${SOCKET_SERVER_URL}:`, reason)
        this.notifySubscribers({
          type: 'CONNECTION_CHANGE',
          connected: false,
          reason,
        })
      })

      this.socket.on('connect_error', (error) => {
        this.isConnected = false
        console.warn(`[Aviator Socket] Connection Error:`, error.message)
        this.notifySubscribers({
          type: 'CONNECTION_CHANGE',
          connected: false,
          error: error.message,
        })
      })

      // Main event listener: demobdg_aviator
      this.socket.on(SOCKET_EVENT_NAME, (rawData) => {
        this.handleEventData(rawData)
      })

      // Official crash / drop listener
      this.socket.on(SOCKET_CRASH_EVENT, (rawData) => {
        console.log(`[Aviator Socket] Incoming ${SOCKET_CRASH_EVENT} event from server:`, rawData)
        if (rawData && typeof rawData === 'object') {
          this.handleEventData({ ...rawData, status: 2 })
        } else {
          this.forceCrash()
        }
      })

      // Fallback listener for any message or data
      this.socket.on('message', (rawData) => {
        this.handleEventData(rawData)
      })
      this.socket.on('data', (rawData) => {
        this.handleEventData(rawData)
      })
      this.socket.on('aviator', (rawData) => {
        this.handleEventData(rawData)
      })
    } catch (err) {
      console.error(`[Aviator Socket] Socket initialization failed:`, err)
    }
  }

  handleEventData(rawData) {
    console.log('[demobdg_aviator PACKET]', rawData)

    let payload = rawData
    if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload)
      } catch {
        payload = { raw: payload }
      }
    }

    if (!payload || typeof payload !== 'object') {
      payload = { value: payload }
    }

    // Extract normalized fields from various backend BDG formats
    const period =
      payload.period ??
      payload.periodNo ??
      payload.round ??
      payload.issueNumber ??
      payload.round_id ??
      payload.id ??
      null

    // Status / State: 0 = betting/countdown (10s loader), 1 = flying, 2 = crashed
    const statusRaw = String(
      payload.status ?? payload.state ?? payload.gameState ?? payload.type ?? payload.phase ?? ''
    ).toLowerCase()

    let normalizedState = null
    if (
      statusRaw === '0' ||
      statusRaw.includes('wait') ||
      statusRaw.includes('count') ||
      statusRaw.includes('bet')
    ) {
      normalizedState = 'COUNTDOWN'
    } else if (
      statusRaw === '1' ||
      statusRaw.includes('fly') ||
      statusRaw.includes('play') ||
      statusRaw.includes('start')
    ) {
      normalizedState = 'FLYING'
    } else if (
      statusRaw === '2' ||
      statusRaw.includes('crash') ||
      statusRaw.includes('end') ||
      statusRaw.includes('over')
    ) {
      normalizedState = 'CRASHED'
    }

    // Time remaining / Countdown extraction (when status === 0 / COUNTDOWN):
    // "betTime": 10 is the 10-second loader duration.
    let countdownTime = null
    if (payload.betTime !== undefined && payload.betTime !== null) {
      const bt = Number(payload.betTime)
      if (!isNaN(bt) && bt > 0) countdownTime = bt
    } else if (payload.time !== undefined && payload.time !== null) {
      const t = Number(payload.time)
      if (!isNaN(t)) countdownTime = t > 60 ? t / 1000 : t
    } else if (payload.countdown !== undefined && payload.countdown !== null) {
      const c = Number(payload.countdown)
      if (!isNaN(c)) countdownTime = c > 60 ? c / 1000 : c
    } else if (payload.seconds !== undefined && payload.seconds !== null) {
      const s = Number(payload.seconds)
      if (!isNaN(s)) countdownTime = s
    } else if (payload.remaining !== undefined && payload.remaining !== null) {
      const r = Number(payload.remaining)
      if (!isNaN(r)) countdownTime = r > 60 ? r / 1000 : r
    }

    // Multiplier & Live Height extraction:
    // In status 1 (flying), timer increases (e.g. 1000.00 -> 1500.00 -> 2500.00 or 1.00 -> 1.50 -> 2.50)
    let multiplierVal = null
    if (payload.multiplier !== undefined && payload.multiplier !== null) {
      const m = Number(payload.multiplier)
      if (!isNaN(m) && m > 0) multiplierVal = m >= 100 ? +(m / 1000).toFixed(2) : +m.toFixed(2)
    } else if (payload.rate !== undefined && payload.rate !== null) {
      const r = Number(payload.rate)
      if (!isNaN(r) && r > 0) multiplierVal = r >= 100 ? +(r / 1000).toFixed(2) : +r.toFixed(2)
    }

    // During flight (status === 1), timer represents the live increasing height/multiplier!
    if (normalizedState === 'FLYING' || statusRaw === '1') {
      if (payload.timer !== undefined && payload.timer !== null) {
        const tm = Number(payload.timer)
        if (!isNaN(tm) && tm > 0 && tm < 999) {
          const multFromTimer = +tm.toFixed(2)
          if (multFromTimer >= 1.0) {
            multiplierVal = multFromTimer
            this.liveFlyingMultiplier = multFromTimer
          }
        }
      }
    } else if (normalizedState === 'COUNTDOWN' || statusRaw === '0') {
      this.liveFlyingMultiplier = 1.00
    }

    // Crash Point: only applicable when round has actually CRASHED
    let crashPointVal = null
    if (normalizedState === 'CRASHED' || statusRaw === '2' || statusRaw.includes('crash')) {
      if (payload.timer !== undefined && payload.timer !== null) {
        const tm = Number(payload.timer)
        if (!isNaN(tm) && tm > 0 && tm < 999) {
          const val = +tm.toFixed(2)
          crashPointVal = val
          multiplierVal = val
        }
      }
      if (payload.crash !== undefined && payload.crash !== null) {
        const c = Number(payload.crash)
        if (!isNaN(c) && c > 0 && c < 999) crashPointVal = +c.toFixed(2)
      } else if (payload.crashPoint !== undefined && payload.crashPoint !== null) {
        const c = Number(payload.crashPoint)
        if (!isNaN(c) && c > 0 && c < 999) crashPointVal = +c.toFixed(2)
      } else if (payload.result !== undefined && payload.result !== null) {
        const c = Number(payload.result)
        if (!isNaN(c) && c > 0 && c < 999) crashPointVal = +c.toFixed(2)
      }
    }

    const normalizedPacket = {
      period,
      time: countdownTime !== null ? Number(countdownTime) : null,
      betTime: payload.betTime !== undefined && payload.betTime !== null ? Number(payload.betTime) : null,
      status: payload.status !== undefined && payload.status !== null ? Number(payload.status) : null,
      multiplier: multiplierVal !== null ? Number(multiplierVal) : null,
      crashPoint: crashPointVal !== null ? Number(crashPointVal) : null,
      state: normalizedState,
      history: Array.isArray(payload.history) ? payload.history : null,
      raw: payload,
      timestamp: Date.now(),
    }

    this.lastPacket = normalizedPacket

    // Post to parent window (Admin dashboard)
    if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
      try {
        window.parent.postMessage(
          {
            type: 'AVIATOR_SOCKET_PACKET',
            packet: normalizedPacket,
          },
          '*'
        )
      } catch {}
    }

    this.notifySubscribers({
      type: 'SOCKET_PACKET',
      packet: normalizedPacket,
    })
  }

  subscribe(callback) {
    this.subscribers.add(callback)
    if (this.lastPacket) {
      callback({
        type: 'SOCKET_PACKET',
        packet: this.lastPacket,
      })
    }
    return () => this.subscribers.delete(callback)
  }

  notifySubscribers(event) {
    for (const callback of this.subscribers) {
      try {
        callback(event)
      } catch (err) {
        console.error('[Aviator Socket] Subscriber callback error:', err)
      }
    }
  }

  getStatus() {
    return {
      connected: this.isConnected,
      channel: SOCKET_EVENT_NAME,
      serverUrl: SOCKET_SERVER_URL,
      lastPacket: this.lastPacket,
    }
  }

  // Force crash the plane across socket connection, server endpoints & local game
  forceCrash(crashPoint = null) {
    const currentPeriod = this.lastPacket?.period || 'current'
    const now = Date.now()
    // Strictly prevent duplicate / recursive emissions for the same period (max 1 crash per round)
    if (this._lastCrashedPeriod === currentPeriod && (now - (this._lastCrashTime || 0) < 3000)) {
      return this.lastPacket
    }
    this._lastCrashedPeriod = currentPeriod
    this._lastCrashTime = now

    let cp = crashPoint ? Number(crashPoint) : null
    if (!cp || isNaN(cp) || cp < 1.0) {
      cp = this.liveFlyingMultiplier || (this.lastPacket?.multiplier ? Number(this.lastPacket.multiplier) : 1.00)
    }
    const finalCp = Math.max(1.0, +(Number(cp) || 1.0).toFixed(2))

    console.log(`[Aviator Socket] Emitting force crash to ${SOCKET_SERVER_URL} (${SOCKET_EVENT_NAME}) at exact timer ${finalCp.toFixed(2)}x (Period: ${currentPeriod})...`)

    const payload = {
      status: 2,
      state: 'CRASHED',
      timer: String(finalCp.toFixed(2)),
      crashPoint: Number(finalCp.toFixed(2)),
      period: currentPeriod,
      event: SOCKET_EVENT_NAME,
      type: 'force_crash',
      timestamp: Date.now(),
    }

    // 1. Emit crash events to the socket server using the configured crash event
    if (this.socket && this.isConnected) {
      try {
        console.log(`[Aviator Socket] Emitting ${SOCKET_CRASH_EVENT} to socket server at exact timer ${finalCp.toFixed(2)}x (Period: ${currentPeriod})`)
        this.socket.emit(SOCKET_CRASH_EVENT, payload)
        this.socket.emit(SOCKET_CRASH_EVENT, {
          period: currentPeriod,
          crashPoint: finalCp,
          timer: String(finalCp.toFixed(2)),
          multiplier: finalCp,
          status: 2,
        })
        this.socket.emit(SOCKET_CRASH_EVENT)
        this.socket.emit('force_crash', payload)
        this.socket.emit('forceCrash', payload)
        this.socket.emit('crash', payload)
        this.socket.emit('admin_crash', payload)
        this.socket.emit(SOCKET_EVENT_NAME, payload)
        this.socket.emit(`${SOCKET_EVENT_NAME}_crash`, payload)
        this.socket.emit('demobdg_aviator_control', { action: 'crash', crashPoint: cp, period: currentPeriod })
      } catch (err) {
        console.warn('[Aviator Socket] Socket emit failed:', err)
      }
    }

    // 2. Synthesize status: 2 packet and notify subscribers so game blasts cleanly
    const crashPacket = {
      period: currentPeriod,
      time: null,
      betTime: null,
      status: 2,
      multiplier: Number(finalCp.toFixed(2)),
      crashPoint: Number(finalCp.toFixed(2)),
      state: 'CRASHED',
      history: this.lastPacket?.history || null,
      raw: payload,
      timestamp: Date.now(),
    }

    this.lastPacket = crashPacket

    if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
      try {
        window.parent.postMessage({ type: 'AVIATOR_SOCKET_PACKET', packet: crashPacket }, '*')
      } catch {}
    }

    this.notifySubscribers({
      type: 'SOCKET_PACKET',
      packet: crashPacket,
    })

    return crashPacket
  }

  setTargetCrash(multiplier) {
    const cp = Number(multiplier) || 2.50
    if (this.socket && this.isConnected) {
      const payload = {
        targetCrash: cp,
        event: SOCKET_EVENT_NAME,
        type: 'set_target_crash',
        period: this.lastPacket?.period,
        timestamp: Date.now(),
      }
      try {
        this.socket.emit('set_target_crash', payload)
        this.socket.emit('setCrash', payload)
        this.socket.emit(`${SOCKET_EVENT_NAME}_target`, payload)
      } catch (err) {
        console.warn('[Aviator Socket] Set target emit error:', err)
      }
    }
  }
}

export const aviatorSocket = new AviatorSocketService()
export default aviatorSocket

