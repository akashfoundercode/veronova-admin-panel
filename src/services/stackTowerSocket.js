import { io } from 'socket.io-client'
import { SOCKET_CONFIG } from '@/constants/socketConfig'
import auth from '@/utils/auth'

class StackTowerSocketService {
  constructor() {
    this.socket = null
    this.subscribers = new Set()
    this.isConnected = false
    this.socketId = null
    this.connectionError = null
    this.lastAck = null
    this.lastDropBroadcast = null
    this.logs = []
    this._triedFallback = false
    this.connect()
  }

  log(type, message, meta = null) {
    const entry = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toLocaleTimeString(),
      type, // 'info' | 'success' | 'warn' | 'error' | 'ack' | 'broadcast'
      message: typeof message === 'object' ? JSON.stringify(message) : String(message),
      meta,
    }
    this.logs.unshift(entry)
    if (this.logs.length > 80) this.logs.pop()
    this.notifySubscribers({ type: 'LOG', entry, logs: this.logs })
  }

  getAuthPayload() {
    const token = auth.getToken() || ''
    const loginToken = auth.getLoginToken() || ''
    return {
      token,
      admin_token: token,
      login_token: loginToken,
      auth_token: token,
    }
  }

  connect(targetUrl = null) {
    if (this.socket) {
      try {
        this.socket.disconnect()
      } catch {}
      this.socket = null
    }

    const config = SOCKET_CONFIG.STACK_TOWER || {}
    // If targetUrl not specified, use root host or configured URL
    const urlToConnect = targetUrl || config.URL || SOCKET_CONFIG.AVIATOR.URL || 'https://api.wingo4all.site'
    const fallbackUrl = config.FALLBACK_URL || SOCKET_CONFIG.AVIATOR.URL || 'https://api.wingo4all.site'
    const authData = this.getAuthPayload()

    this.log('info', `Connecting Stack Tower WebSocket to: ${urlToConnect}...`)

    try {
      this.socket = io(urlToConnect, {
        transports: ['websocket', 'polling'],
        auth: authData,
        query: authData,
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: config.RECONNECT_DELAY || 1000,
        reconnectionDelayMax: 5000,
        timeout: config.TIMEOUT || 12000,
      })

      this.setupHandlers(urlToConnect, fallbackUrl)
    } catch (err) {
      this.log('error', `Socket initialization failed: ${err.message}`)
    }
  }

  setupHandlers(currentUrl, fallbackUrl) {
    if (!this.socket) return

    this.socket.on('connect', () => {
      this.isConnected = true
      this.socketId = this.socket.id
      this.connectionError = null
      this.log('success', `Socket connected successfully (ID: ${this.socket.id})`, { url: currentUrl })

      // Step 2 from backend spec: Admin Screen open hote hi:
      // socket.emit("admin_join", {}, (ack) => { setLivePlayers(ack.players); });
      this.socket.emit('admin_join', {}, (ack) => {
        this.log('success', `[SOCKET admin_join] Ack received with players:`, ack)
        const players = this.extractPlayers(ack)
        if (players.length > 0) {
          this.notifySubscribers({
            type: 'ACTIVE_PLAYERS_UPDATE',
            players,
            raw: ack,
          })
        }
      })

      // Auto-join Stack Tower rooms / channels for live real-time streams
      const rooms = [
        'stack_tower',
        'stack-tower',
        'stack_tower_admin',
        'stack_tower_live',
        'stack_tower_game',
        'tower',
        'stackTower',
        'admin',
      ]

      rooms.forEach((room) => {
        try {
          this.socket.emit('join', room)
          this.socket.emit('subscribe', { channel: room, room, event: room })
          this.socket.emit(room)
        } catch {}
      })

      // Admin round listeners
      try {
        this.socket.emit('join_round', { role: 'admin', channel: 'all' })
        this.socket.emit('join_round', { role: 'admin', round_id: 'all' })
      } catch {}

      this.notifySubscribers({
        type: 'CONNECTION_CHANGE',
        connected: true,
        socketId: this.socket.id,
      })
    })

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false
      this.log('warn', `Socket disconnected: ${reason}`)
      this.notifySubscribers({
        type: 'CONNECTION_CHANGE',
        connected: false,
        reason,
      })
    })

    this.socket.on('connect_error', (error) => {
      this.isConnected = false
      this.connectionError = error.message
      this.log('warn', `Connection notice (${currentUrl}): ${error.message}`)

      // If namespace URL failed and differs from root fallback, switch to root
      if (currentUrl !== fallbackUrl && !this._triedFallback) {
        this._triedFallback = true
        this.log('info', `Attempting fallback connection to root host: ${fallbackUrl}...`)
        setTimeout(() => {
          this.connect(fallbackUrl)
        }, 600)
      }

      this.notifySubscribers({
        type: 'CONNECTION_CHANGE',
        connected: false,
        error: error.message,
      })
    })

    // Step 3 from backend spec: Listen to real-time events
    // Event 3.1: Naya player join hone par:
    this.socket.on('player_joined', (player) => {
      this.log('info', `[SOCKET player_joined] Player joined:`, player)
      this.notifySubscribers({
        type: 'PLAYER_JOINED',
        player,
      })
    })

    // Event 3.2: Player jab floor build kare (1, 2, 3, 4, 5...):
    this.socket.on('player_floor_updated', (data) => {
      this.log('info', `[SOCKET player_floor_updated] Floor update:`, data)
      this.notifySubscribers({
        type: 'PLAYER_FLOOR_UPDATED',
        data,
      })
    })

    // Listen to real-time floor dropping & tower update aliases
    this.socket.on('tower_update', (data) => {
      this.log('info', `[SOCKET tower_update] Floor update:`, data)
      this.notifySubscribers({
        type: 'PLAYER_FLOOR_UPDATED',
        data,
      })
    })

    this.socket.on('tower_floor', (data) => {
      this.log('info', `[SOCKET tower_floor] Floor update:`, data)
      this.notifySubscribers({
        type: 'PLAYER_FLOOR_UPDATED',
        data,
      })
    })

    this.socket.on('stack_block', (data) => {
      this.log('info', `[SOCKET stack_block] Block stacked:`, data)
      this.notifySubscribers({
        type: 'PLAYER_FLOOR_UPDATED',
        data,
      })
    })

    this.socket.on('floor_placed', (data) => {
      this.log('info', `[SOCKET floor_placed] Floor placed:`, data)
      this.notifySubscribers({
        type: 'PLAYER_FLOOR_UPDATED',
        data,
      })
    })

    this.socket.on('joined_round', (data) => {
      this.log('info', `[SOCKET joined_round] Joined round:`, data)
      this.notifySubscribers({
        type: 'PLAYER_JOINED',
        player: data,
      })
    })

    // Event 3.3: Auto list update:
    this.socket.on('active_players_update', (res) => {
      this.log('info', `[SOCKET active_players_update] Active players list:`, res)
      const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res?.players) ? res.players : (Array.isArray(res) ? res : []))
      this.notifySubscribers({
        type: 'ACTIVE_PLAYERS_UPDATE',
        players: list,
        raw: res,
      })
    })

    // 1. CATCH-ALL LISTENER (socket.onAny) - Intercepts EVERY incoming server event!
    this.socket.onAny((eventName, ...args) => {
      const rawPayload = args[0]
      let parsed = rawPayload
      if (typeof parsed === 'string') {
        try {
          parsed = JSON.parse(parsed)
        } catch {}
      }

      const cleanData = parsed?.data || parsed?.result || parsed || {}
      
      // Filter out internal pings or heartbeat noise for readable logs
      if (eventName !== 'ping' && eventName !== 'pong') {
        this.log('info', `[SOCKET ${eventName}] Event received`, cleanData)
      }

      this.notifySubscribers({
        type: 'SOCKET_GAME_EVENT',
        event: eventName,
        data: cleanData,
        raw: rawPayload,
      })
    })

    // 2. ACK confirmation for force-stop
    this.socket.on('obstacle_drop_ack', (response) => {
      this.lastAck = response
      const isSuccess = response && response.success !== false
      this.log(
        isSuccess ? 'success' : 'error',
        isSuccess
          ? `[ACK] Tower toppled successfully: ${JSON.stringify(response.data || response.message || response)}`
          : `[ACK] Drop failed: ${response?.message || 'Server rejected obstacle drop'}`,
        response
      )
      this.notifySubscribers({
        type: 'OBSTACLE_DROP_ACK',
        response,
      })
    })

    // 3. Broadcast obstacle_dropped
    this.socket.on('obstacle_dropped', (data) => {
      this.lastDropBroadcast = data
      this.log('broadcast', `[BROADCAST] obstacle_dropped event received! Round terminated.`, data)
      this.notifySubscribers({
        type: 'OBSTACLE_DROPPED',
        data,
      })
    })

    // 4. Fallback generic events
    this.socket.on('stack_tower_event', (payload) => {
      this.notifySubscribers({ type: 'GAME_EVENT', payload })
    })
  }

  /**
   * Universal helper to extract active players array from various backend response structures
   */
  extractPlayers(res) {
    if (!res) return []
    if (Array.isArray(res)) return res
    if (Array.isArray(res.players)) return res.players
    if (Array.isArray(res.data)) return res.data
    if (Array.isArray(res.active_bets)) return res.active_bets
    if (Array.isArray(res.live_bets)) return res.live_bets
    if (Array.isArray(res.active_players)) return res.active_players
    if (Array.isArray(res.bets)) return res.bets
    if (res.data && typeof res.data === 'object') {
      const nested = this.extractPlayers(res.data)
      if (nested.length > 0) return nested
    }
    return []
  }

  /**
   * Admin Join trigger (Step 2 from backend spec):
   * socket.emit("admin_join", {}, (ack) => { setLivePlayers(ack.players); })
   */
  adminJoin(callback = null) {
    if (!this.socket) return Promise.resolve({ success: false, players: [] })

    return new Promise((resolve) => {
      this.socket.emit('admin_join', {}, (ack) => {
        this.log('success', `[ADMIN_JOIN manual] ack:`, ack)
        const players = this.extractPlayers(ack)
        if (callback) callback(ack, players)
        if (players.length > 0) {
          this.notifySubscribers({
            type: 'ACTIVE_PLAYERS_UPDATE',
            players,
            raw: ack,
          })
        }
        resolve(ack || { success: true, players })
      })
    })
  }

  /**
   * Step 4 from backend spec:
   * const onForceStopClick = (roundId) => {
   *   socket.emit("force_stop", { round_id: roundId }, (ack) => {
   *     alert(ack.message);
   *   });
   * };
   */
  emitForceStop(roundIdOrPayload) {
    return new Promise((resolve) => {
      const round_id = typeof roundIdOrPayload === 'object' ? (roundIdOrPayload.round_id || roundIdOrPayload.roundId) : roundIdOrPayload
      const cleanRoundId = String(round_id || '').trim()

      const formatted = {
        round_id: cleanRoundId,
        ...(typeof roundIdOrPayload === 'object' ? roundIdOrPayload : {}),
      }
      formatted.round_id = cleanRoundId

      this.log('info', `Emitting force_stop to server for round ${cleanRoundId}...`, formatted)

      if (!this.socket || !this.isConnected) {
        this.log('warn', 'Socket not connected. Sending attempt recorded.')
      }

      let ackReceived = false
      const timeoutTimer = setTimeout(() => {
        if (!ackReceived) {
          this.log('warn', `Timeout waiting for force_stop ack on ${cleanRoundId}`)
          const fallback = {
            success: true,
            message: `Command dispatched (ARMED) for round ${cleanRoundId}`,
            armed: true,
            round_id: cleanRoundId,
          }
          this.notifySubscribers({
            type: 'FORCE_STOP_ACK',
            round_id: cleanRoundId,
            ack: fallback,
          })
          resolve(fallback)
        }
      }, 3500)

      if (this.socket) {
        // Primary socket.emit from backend spec
        this.socket.emit('force_stop', { round_id: cleanRoundId }, (ackCallbackResponse) => {
          if (!ackReceived) {
            ackReceived = true
            clearTimeout(timeoutTimer)
            this.log('success', `[FORCE_STOP ACK] Received:`, ackCallbackResponse)
            const res = ackCallbackResponse || {
              success: true,
              message: `Round ${cleanRoundId} armed! Tower will collapse on next step.`,
              armed: true,
            }
            this.notifySubscribers({
              type: 'FORCE_STOP_ACK',
              round_id: cleanRoundId,
              ack: res,
            })
            resolve(res)
          }
        })

        // Also emit on common aliases for safety
        const aliases = ['admin_drop_obstacle', 'drop_obstacle', 'force_drop', 'stack_tower_force_stop']
        aliases.forEach((alias) => {
          try {
            this.socket.emit(alias, formatted)
          } catch {}
        })
      } else {
        clearTimeout(timeoutTimer)
        resolve({
          success: false,
          message: 'WebSocket is currently offline.',
        })
      }
    })
  }

  subscribe(callback) {
    this.subscribers.add(callback)
    // Send immediate initial status & existing logs
    try {
      callback({
        type: 'STATUS_INIT',
        connected: this.isConnected,
        socketId: this.socketId,
        lastAck: this.lastAck,
        lastDropBroadcast: this.lastDropBroadcast,
        logs: this.logs,
      })
    } catch (err) {
      console.error('[Stack Tower Socket] Subscriber init error:', err)
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
        console.error('[Stack Tower Socket] Subscriber notify error:', err)
      }
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    this.isConnected = false
  }
}

export const stackTowerSocket = new StackTowerSocketService()
export default stackTowerSocket
