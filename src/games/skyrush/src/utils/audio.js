// Web Audio API Synthesizer for Aviator game (zero external audio file dependency)

class SoundManager {
  constructor() {
    this.ctx = null
    this.muted = false
    this.engineOsc = null
    this.engineGain = null
    this.hasUserInteracted = false

    if (typeof window !== 'undefined') {
      const unlockAudio = () => {
        this.hasUserInteracted = true
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {})
        }
        window.removeEventListener('pointerdown', unlockAudio)
        window.removeEventListener('keydown', unlockAudio)
      }
      window.addEventListener('pointerdown', unlockAudio, { passive: true })
      window.addEventListener('keydown', unlockAudio, { passive: true })
    }
  }

  init() {
    if (!this.ctx && this.hasUserInteracted) {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (AudioContext) {
        this.ctx = new AudioContext()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended' && this.hasUserInteracted) {
      this.ctx.resume().catch(() => {})
    }
  }

  setMuted(muted) {
    this.muted = muted
    if (muted) {
      this.stopEngine()
    }
  }

  // Click sound on buttons
  playClick() {
    if (this.muted) return
    this.init()
    if (!this.ctx) return

    try {
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(600, this.ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.04)

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.04)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start()
      osc.stop(this.ctx.currentTime + 0.04)
    } catch (e) {
      // Ignore
    }
  }

  // Start plane engine hum during flight
  startEngine() {
    if (this.muted) return
    this.init()
    if (!this.ctx) return

    try {
      this.stopEngine()
      this.engineOsc = this.ctx.createOscillator()
      this.engineGain = this.ctx.createGain()

      this.engineOsc.type = 'sawtooth'
      this.engineOsc.frequency.setValueAtTime(80, this.ctx.currentTime)

      // Low-pass filter for smooth rumble
      const filter = this.ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(220, this.ctx.currentTime)

      this.engineGain.gain.setValueAtTime(0.06, this.ctx.currentTime)

      this.engineOsc.connect(filter)
      filter.connect(this.engineGain)
      this.engineGain.connect(this.ctx.destination)

      this.engineOsc.start()
    } catch (e) {
      // Ignore
    }
  }

  // Modulate engine pitch as multiplier increases
  updateEnginePitch(multiplier) {
    if (this.muted || !this.engineOsc || !this.ctx) return
    try {
      const baseFreq = 80
      const newFreq = Math.min(300, baseFreq + (multiplier - 1) * 20)
      this.engineOsc.frequency.setTargetAtTime(newFreq, this.ctx.currentTime, 0.1)
    } catch (e) {
      // Ignore
    }
  }

  stopEngine() {
    if (this.engineOsc) {
      try {
        this.engineOsc.stop()
        this.engineOsc.disconnect()
      } catch (e) {
        // Ignore
      }
      this.engineOsc = null
    }
  }

  // Winning / Cashout chime
  playCashout() {
    if (this.muted) return
    this.init()
    if (!this.ctx) return

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.05)

        gain.gain.setValueAtTime(0.2, this.ctx.currentTime + idx * 0.05)
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + idx * 0.05 + 0.22)

        osc.connect(gain)
        gain.connect(this.ctx.destination)

        osc.start(this.ctx.currentTime + idx * 0.05)
        osc.stop(this.ctx.currentTime + idx * 0.05 + 0.22)
      })
    } catch (e) {
      // Ignore
    }
  }

  // Cinematic Explosion Crash Sound
  playCrash() {
    if (this.muted) return
    this.init()
    this.stopEngine()
    if (!this.ctx) return

    try {
      const now = this.ctx.currentTime

      // 1. Deep Sub-Bass Impact Boom
      const subOsc = this.ctx.createOscillator()
      const subGain = this.ctx.createGain()
      subOsc.type = 'sine'
      subOsc.frequency.setValueAtTime(160, now)
      subOsc.frequency.exponentialRampToValueAtTime(32, now + 0.6)

      subGain.gain.setValueAtTime(0.45, now)
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.65)

      subOsc.connect(subGain)
      subGain.connect(this.ctx.destination)
      subOsc.start(now)
      subOsc.stop(now + 0.65)

      // 2. High-energy explosion rumble & noise blast
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.45)
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1
      }

      const noise = this.ctx.createBufferSource()
      noise.buffer = buffer

      const filter = this.ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(900, now)
      filter.frequency.exponentialRampToValueAtTime(90, now + 0.45)

      const noiseGain = this.ctx.createGain()
      noiseGain.gain.setValueAtTime(0.35, now)
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45)

      noise.connect(filter)
      filter.connect(noiseGain)
      noiseGain.connect(this.ctx.destination)

      noise.start(now)
    } catch (e) {
      // Ignore
    }
  }

  playFlewAway() {
    this.playCrash()
  }
}

export const soundManager = new SoundManager()

