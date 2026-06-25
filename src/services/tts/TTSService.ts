import Tts from 'react-native-tts';
import {AppState, AppStateStatus} from 'react-native';

interface SpeakCallbacks {
  onStart?: () => void;
  onFinish?: () => void;
  onCancel?: () => void;
}

class TTSService {
  private initialized = false;
  private appStateSub: ReturnType<typeof AppState.addEventListener> | null = null;
  private currentCallbacks: SpeakCallbacks | null = null;

  private async ensureInit(): Promise<void> {
    if (this.initialized) {return;}
    try {
      await Tts.setDefaultLanguage('te-IN');
      Tts.setDefaultRate(0.5);
      Tts.setDefaultPitch(1.0);

      Tts.addEventListener('tts-start', this.handleStart);
      Tts.addEventListener('tts-finish', this.handleFinish);
      Tts.addEventListener('tts-error', this.handleError);
      Tts.addEventListener('tts-cancel', this.handleCancel);

      this.appStateSub = AppState.addEventListener(
        'change',
        (next: AppStateStatus) => {
          if (next === 'background' || next === 'inactive') {
            this.stop();
          }
        },
      );

      this.initialized = true;
    } catch (err) {
      console.warn('[TTSService] init error:', err);
    }
  }

  private handleStart = () => {
    this.currentCallbacks?.onStart?.();
  };

  private handleFinish = () => {
    const cbs = this.currentCallbacks;
    this.currentCallbacks = null;
    cbs?.onFinish?.();
  };

  private handleError = () => {
    const cbs = this.currentCallbacks;
    this.currentCallbacks = null;
    cbs?.onFinish?.();
  };

  private handleCancel = () => {
    const cbs = this.currentCallbacks;
    this.currentCallbacks = null;
    cbs?.onCancel?.();
  };

  async speak(text: string, callbacks: SpeakCallbacks = {}): Promise<void> {
    await this.ensureInit();

    // Preempt any currently speaking button
    if (this.currentCallbacks) {
      const prev = this.currentCallbacks;
      this.currentCallbacks = null;
      Tts.stop();
      prev.onCancel?.();
    } else {
      Tts.stop();
    }

    this.currentCallbacks = callbacks;
    Tts.speak(text);
  }

  stop(): void {
    if (this.currentCallbacks) {
      const prev = this.currentCallbacks;
      this.currentCallbacks = null;
      Tts.stop();
      prev.onCancel?.();
    }
  }

  destroy(): void {
    this.stop();
    this.appStateSub?.remove();
    this.initialized = false;
  }
}

export default new TTSService();
