/**
 * VoiceAlertService - Browser-based AI Voice Alert System
 * 
 * Uses the browser's native Web Speech API (SpeechSynthesis) for free,
 * unlimited text-to-speech alerts. No API keys, no tokens, no expiry.
 * 
 * This runs entirely in the browser — when a critical health alert triggers,
 * it speaks an urgent voice message through the device speakers so the 
 * trainer is immediately alerted, even if they're not looking at the screen.
 */

export interface VoiceAlertOptions {
  memberName: string;
  hr: number;
  spo2: number;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  bloodGroup?: string;
  medicalHistory?: string;
}

class VoiceAlertService {
  private synthesis: SpeechSynthesis | null = null;
  private isSupported: boolean = false;
  private activeAlerts: Set<string> = new Set(); // Track active alerts to prevent duplicates
  private preferredVoice: SpeechSynthesisVoice | null = null;
  private voicesLoaded: boolean = false;

  constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.synthesis = window.speechSynthesis;
      this.isSupported = true;
      this.loadVoices();
    }
  }

  /**
   * Load available voices. Some browsers load voices asynchronously.
   */
  private loadVoices(): void {
    if (!this.synthesis) return;

    const setVoice = () => {
      const voices = this.synthesis!.getVoices();
      if (voices.length === 0) return;

      this.voicesLoaded = true;

      // Prefer clear, professional English voices
      // Priority: Google voices > Microsoft voices > Default
      const preferredNames = [
        "Google UK English Female",
        "Google UK English Male",
        "Google US English",
        "Microsoft Zira",
        "Microsoft David",
        "Samantha",
        "Alex",
        "Daniel",
      ];

      for (const name of preferredNames) {
        const voice = voices.find(v => v.name.includes(name));
        if (voice) {
          this.preferredVoice = voice;
          return;
        }
      }

      // Fallback: pick the first English voice available
      const englishVoice = voices.find(v => v.lang.startsWith("en"));
      if (englishVoice) {
        this.preferredVoice = englishVoice;
      }
    };

    // Voices may already be loaded
    setVoice();

    // Some browsers (Chrome) load voices asynchronously
    if (this.synthesis.onvoiceschanged !== undefined) {
      this.synthesis.onvoiceschanged = setVoice;
    }
  }

  /**
   * Generate the emergency voice message text
   */
  private generateAlertMessage(options: VoiceAlertOptions): string {
    const { memberName, hr, spo2, emergencyContactName, bloodGroup, medicalHistory } = options;

    const hrStatus = hr > 105 ? "dangerously high" : hr < 50 ? "dangerously low" : "abnormal";
    const spo2Status = spo2 < 93 ? "critically low" : "normal";

    let message = `Attention! Emergency health alert. `;
    message += `Member ${memberName} has critical vital signs. `;
    message += `Heart rate is ${hr} beats per minute, which is ${hrStatus}. `;
    message += `Oxygen saturation is ${spo2} percent, which is ${spo2Status}. `;

    if (bloodGroup) {
      message += `Blood group is ${bloodGroup}. `;
    }

    if (medicalHistory && medicalHistory.toLowerCase() !== "none" && medicalHistory.toLowerCase() !== "n/a") {
      message += `Medical history includes ${medicalHistory}. `;
    }

    if (emergencyContactName) {
      message += `Emergency contact ${emergencyContactName} has been notified. `;
    }

    message += `Please take immediate action. Check on the member now.`;

    return message;
  }

  /**
   * Speak an emergency alert through the browser's speakers.
   * Returns a promise that resolves when the speech finishes.
   */
  speakAlert(memberId: string, options: VoiceAlertOptions): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.isSupported || !this.synthesis) {
        console.warn("VoiceAlertService: Speech synthesis not supported in this browser.");
        resolve(false);
        return;
      }

      // Prevent duplicate alerts for the same member
      if (this.activeAlerts.has(memberId)) {
        console.log(`VoiceAlertService: Alert already active for ${options.memberName}, skipping.`);
        resolve(false);
        return;
      }

      this.activeAlerts.add(memberId);

      // Cancel any ongoing speech to prioritize this alert
      this.synthesis.cancel();

      const message = this.generateAlertMessage(options);
      const utterance = new SpeechSynthesisUtterance(message);

      // Configure voice settings for clarity and urgency
      if (this.preferredVoice) {
        utterance.voice = this.preferredVoice;
      }
      utterance.rate = 0.95;    // Slightly slower for clarity
      utterance.pitch = 1.1;    // Slightly higher for urgency
      utterance.volume = 1.0;   // Maximum volume

      utterance.onend = () => {
        this.activeAlerts.delete(memberId);
        resolve(true);
      };

      utterance.onerror = (event) => {
        console.error("VoiceAlertService: Speech error:", event.error);
        this.activeAlerts.delete(memberId);
        resolve(false);
      };

      // Small delay to ensure any UI transitions complete first
      setTimeout(() => {
        try {
          this.synthesis!.speak(utterance);
        } catch (err) {
          console.error("VoiceAlertService: Failed to speak:", err);
          this.activeAlerts.delete(memberId);
          resolve(false);
        }
      }, 300);
    });
  }

  /**
   * Play an urgent alert tone before the voice message.
   * Uses the Web Audio API to generate a pure tone — no external files needed.
   */
  playAlertTone(): Promise<void> {
    return new Promise((resolve) => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Create a sequence of urgent beeps
        const playBeep = (startTime: number, frequency: number, duration: number) => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(frequency, startTime);
          
          gainNode.gain.setValueAtTime(0, startTime);
          gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
          gainNode.gain.linearRampToValueAtTime(0.3, startTime + duration - 0.02);
          gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
          
          oscillator.start(startTime);
          oscillator.stop(startTime + duration);
        };

        const now = audioContext.currentTime;
        // Three ascending urgent beeps
        playBeep(now, 880, 0.15);        // A5
        playBeep(now + 0.2, 1047, 0.15); // C6
        playBeep(now + 0.4, 1319, 0.25); // E6 (longer)

        setTimeout(() => {
          audioContext.close();
          resolve();
        }, 800);
      } catch (err) {
        console.warn("VoiceAlertService: Could not play alert tone:", err);
        resolve(); // Resolve anyway — tone is non-critical
      }
    });
  }

  /**
   * Full emergency alert sequence: tone + voice message
   */
  async triggerEmergencyAlert(memberId: string, options: VoiceAlertOptions): Promise<boolean> {
    if (!this.isSupported) return false;

    // Don't re-trigger if already active for this member
    if (this.activeAlerts.has(memberId)) return false;

    try {
      await this.playAlertTone();
      const spoken = await this.speakAlert(memberId, options);
      return spoken;
    } catch (err) {
      console.error("VoiceAlertService: Emergency alert failed:", err);
      return false;
    }
  }

  /**
   * Stop all active voice alerts
   */
  stopAll(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
    this.activeAlerts.clear();
  }

  /**
   * Stop alert for a specific member
   */
  stopAlert(memberId: string): void {
    this.activeAlerts.delete(memberId);
    // We can't cancel a specific utterance, but we can cancel all and let others re-queue
    if (this.synthesis && this.activeAlerts.size === 0) {
      this.synthesis.cancel();
    }
  }

  /**
   * Check if the browser supports speech synthesis
   */
  getIsSupported(): boolean {
    return this.isSupported;
  }

  /**
   * Initiate a phone call to the emergency contact via the browser's tel: protocol.
   * This will open the phone dialer on mobile or prompt on desktop.
   */
  static initiatePhoneCall(phoneNumber: string): void {
    if (!phoneNumber) return;
    
    // Clean the phone number
    const cleanNumber = phoneNumber.replace(/[^\d+]/g, "");
    
    // Use the tel: protocol — works on mobile (auto-dial) and desktop (opens phone app / Skype etc.)
    window.open(`tel:${cleanNumber}`, "_self");
  }
}

// Export a singleton instance
export const voiceAlertService = new VoiceAlertService();
export default voiceAlertService;
