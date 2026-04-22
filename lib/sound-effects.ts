'use client';

// Sistema de sons usando Web Audio API (não precisa de arquivos externos)
class SoundEffects {
  private audioContext: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) {
    if (!this.audioContext || this.isMuted) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // Som de carta sendo jogada
  playCardPlayed() {
    this.playTone(400, 0.1, 'square', 0.15);
  }

  // Som de carta sendo distribuída
  playCardDealt() {
    this.playTone(500, 0.05, 'sine', 0.1);
  }

  // Som de truco pedido (agressivo)
  playTrucoCalled() {
    if (!this.audioContext || this.isMuted) return;

    // Acorde de 3 notas simultâneas
    this.playTone(200, 0.3, 'sawtooth', 0.2);
    setTimeout(() => this.playTone(250, 0.3, 'sawtooth', 0.2), 50);
    setTimeout(() => this.playTone(300, 0.4, 'sawtooth', 0.25), 100);
  }

  // Som de truco aceito
  playTrucoAccepted() {
    this.playTone(600, 0.15, 'triangle', 0.2);
    setTimeout(() => this.playTone(800, 0.2, 'triangle', 0.25), 100);
  }

  // Som de truco recusado
  playTrucoRefused() {
    this.playTone(300, 0.2, 'sawtooth', 0.2);
    setTimeout(() => this.playTone(200, 0.3, 'sawtooth', 0.25), 100);
  }

  // Som de rodada ganha
  playRoundWon() {
    this.playTone(523, 0.1, 'sine', 0.2); // C
    setTimeout(() => this.playTone(659, 0.1, 'sine', 0.2), 80); // E
    setTimeout(() => this.playTone(784, 0.2, 'sine', 0.25), 160); // G
  }

  // Som de mão ganha
  playHandWon() {
    this.playTone(523, 0.1, 'sine', 0.2); // C
    setTimeout(() => this.playTone(659, 0.1, 'sine', 0.2), 80); // E
    setTimeout(() => this.playTone(784, 0.1, 'sine', 0.2), 160); // G
    setTimeout(() => this.playTone(1047, 0.3, 'sine', 0.3), 240); // C alta
  }

  // Som de jogo vencido (melodia completa)
  playGameWon() {
    const melody = [
      { freq: 523, time: 0 },    // C
      { freq: 659, time: 150 },  // E
      { freq: 784, time: 300 },  // G
      { freq: 1047, time: 450 }, // C alta
      { freq: 784, time: 600 },  // G
      { freq: 1047, time: 750 }, // C alta
      { freq: 1319, time: 900 }, // E alta
    ];

    melody.forEach(({ freq, time }) => {
      setTimeout(() => this.playTone(freq, 0.15, 'sine', 0.25), time);
    });
  }

  // Som de derrota
  playGameLost() {
    this.playTone(400, 0.2, 'sawtooth', 0.2);
    setTimeout(() => this.playTone(350, 0.2, 'sawtooth', 0.2), 150);
    setTimeout(() => this.playTone(300, 0.4, 'sawtooth', 0.25), 300);
  }

  // Mute/Unmute
  setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  getMuted() {
    return this.isMuted;
  }
}

// Singleton instance
export const soundEffects = new SoundEffects();
