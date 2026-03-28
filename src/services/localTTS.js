import { NativeModules } from 'react-native';

const { LocalTTS } = NativeModules;

/**
 * Adds natural prefixes and pauses to the Hindi text for better flow.
 */
function enhanceSpeech(text) {
  if (!text) return '';
  return "अच्छा सुनो... " + text
    .replace(/।/g, '। ... ')
    .replace(/\n/g, ' ... ')
    .trim();
}

/**
 * Speaks a single chunk of text using the native VITS engine.
 */
async function speakChunk(text) {
  try {
    if (!LocalTTS) {
      console.warn('[LocalTTS] Native module is missing! Check if NativeAudioPackage is registered in MainApplication.kt');
      return;
    }
    console.log('[LocalTTS] Speaking chunk:', text.slice(0, 30) + '...');
    await LocalTTS.speak(text);
  } catch (e) {
    console.error('[LocalTTS] Native speak error:', e);
  }
}

/**
 * Main entry point for speaking text.
 * Handles sentence splitting to ensure smooth playback of long text.
 */
export async function speak(text, onStart, onFinish) {
  if (!text) return;
  
  if (onStart) onStart();

  const enhancedText = enhanceSpeech(text);
  
  // Split by full stop (।) to handle long paragraphs sequentially
  const parts = enhancedText.split('।');

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim();
    if (part.length > 0) {
      // Re-add the full stop for naturalness if it was a real sentence end
      const partToSpeak = i < parts.length - 1 ? part + '।' : part;
      await speakChunk(partToSpeak);
    }
  }

  if (onFinish) onFinish();
}

/**
 * No-op stop for now (MediaPlayer release handles it on finish)
 * TODO: Implement native stop if needed for rapid cancellations
 */
/**
 * Stops all current speech immediately (both native TTS and MediaPlayer).
 */
export async function stopSpeaking() {
  try {
    if (LocalTTS) {
      await LocalTTS.stop();
    }
  } catch (e) {
    console.error('[LocalTTS] Stop error:', e);
  }
}
