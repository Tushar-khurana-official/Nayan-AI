/**
 * App.js — NayanAI Main Application
 *
 * THE FULL PIPELINE:
 * 1. Camera captures photo of textbook
 * 2. OCR (ML Kit) extracts Hindi/Punjabi text from photo
 * 3. LLM (SmolLM2) simplifies text for a child
 * 4. TTS (Android built-in) reads it aloud in Hindi
 *
 * ALL OFFLINE. ZERO INTERNET. WORKS IN AIRPLANE MODE.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import CameraScreen from './screens/CameraScreen';
import VideoSplashScreen from './screens/VideoSplashScreen';
import SoundWave from './components/StatusIndicator';
import { extractTextFromImage } from './services/ocrService';
import { simplifyText } from './services/simplifyService';
import { speak, stopSpeaking } from './services/localTTS';

// App stages — controls what the user sees
const STAGES = {
  BOOTING: 'booting',   // App loading, voice initializing
  READY: 'ready',     // Camera visible, waiting for scan
  SCANNING: 'scanning',  // OCR reading the photo
  SPEAKING: 'speaking',  // TTS reading aloud
  ERROR: 'error',     // Something went wrong
};

export default function App() {
  const [stage, setStage] = useState(STAGES.BOOTING);
  const [statusMessage, setStatusMessage] = useState('Starting NayanAI...');
  const [resultText, setResultText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastSpokenText, setLastSpokenText] = useState('');
  const [autoScanEnabled, setAutoScanEnabled] = useState(true);
  const [triggerScan, setTriggerScan] = useState(0);
  const [showSplash, setShowSplash] = useState(true); // Entry Splash state

  // Initialize all AI services on app launch
  useEffect(() => {
    async function requestPermissions() {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.CAMERA,
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          ]);
          console.log('[App] Permissions granted:', granted);
        } catch (err) {
          console.warn('[App] Permission request error:', err);
        }
      }
    }

    async function initialize() {
      try {
        await requestPermissions();

        setStatusMessage('Setting up custom voice...');
        // LocalTTS doesn't need initTTS call as it loads lazily or via assets

        setStage(STAGES.READY);
        setStatusMessage('');

        // Welcome message in Hindi
        speak('नमस्ते! मैं NayanAI हूँ। किताब के पास कैमरा रखें और बटन दबाएं।');
      } catch (error) {
        console.error('Init error:', error);
        setStage(STAGES.ERROR);
        setStatusMessage('Startup failed. Please restart app.');
      }
    }
    initialize();
  }, []);

  /**
   * LIVE MODE TIMER
   * Automatically triggers a scan every 4 seconds if in READY stage
   */
  useEffect(() => {
    let timer;
    if (autoScanEnabled && stage === STAGES.READY && !isSpeaking) {
      timer = setTimeout(() => {
        console.log('[Live] Auto-triggering scan...');
        setTriggerScan(Date.now()); // Signal to CameraScreen to take photo
      }, 2000); // Reduced to 2s for more "Live" feel
    }
    return () => clearTimeout(timer);
  }, [autoScanEnabled, stage, isSpeaking]);

  const handlePhotoTaken = async (imagePath) => {
    // Sequential Guard: Don't scan if busy reading or processing
    if (stage !== STAGES.READY) {
      console.log('[App] Guard: Blocked scan because stage is', stage);
      return;
    }

    setResultText('');

    try {
      // STAGE 1: OCR
      setStage(STAGES.SCANNING);
      setStatusMessage('📖 Scanning page...');

      // Non-blocking audio feedback
      speak('फोटो लिया गया');

      const rawText = await extractTextFromImage(imagePath);

      if (!rawText) {
        setStage(STAGES.ERROR);
        setStatusMessage('Text not found. Please try with better lighting.');
        speak('माफ करना, पाठ नहीं मिला। अच्छी रोशनी में फिर कोशिश करें।');
        setTimeout(() => setStage(STAGES.READY), 3000);
        return;
      }

      // STAGE 2: Simplification (Local)
      setStatusMessage('🧑‍🏫 समझा रहे हैं...');
      speak('समझा रहे हैं'); // Audio Feedback before simplification

      const cleanText = simplifyText(rawText);

      // DEDUPLICATION & CHANGE DETECTION
      if (cleanText.slice(0, 30) === lastSpokenText.slice(0, 30)) {
        setStage(STAGES.READY);
        return;
      }

      setResultText(cleanText);
      setLastSpokenText(cleanText);

      // STAGE 3: TTS
      setStage(STAGES.SPEAKING);
      setStatusMessage('🔊 सुनो...');
      setIsSpeaking(true);
      speak(
        cleanText,
        () => setIsSpeaking(true),   // onStart
        () => {                       // onFinish
          setIsSpeaking(false);
          setStage(STAGES.READY);
          setStatusMessage('');
        }
      );

    } catch (error) {
      console.error('Pipeline error:', error);
      setStage(STAGES.ERROR);
      setStatusMessage(error.message || 'Something went wrong. Please try again.');
      setTimeout(() => setStage(STAGES.READY), 4000);
    }
  };

  const handleReplay = () => {
    if (resultText) {
      setIsSpeaking(true);
      speak(resultText, null, () => setIsSpeaking(false));
    }
  };

  const isProcessing = [STAGES.SCANNING].includes(stage);

  if (showSplash) {
    return <VideoSplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Premium Multi-stop Gradient Background */}
      <LinearGradient
        colors={['#E0F2FF', '#F0E6FF', '#FFF0E6']} // Soft Blue -> Purple -> Warm Orange
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header - Glassmorphism style */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>👁️ NayanAI</Text>
          <View style={styles.offlineBadge}>
            <Text style={styles.offlineBadgeText}>✈️ Offline</Text>
          </View>
        </View>

        {/* Status bar - Minimalist */}
        {(statusMessage || stage === STAGES.BOOTING || (stage === STAGES.READY && autoScanEnabled)) && (
          <View style={styles.statusBar}>
            <Text style={styles.statusText}>
              {stage === STAGES.READY && autoScanEnabled && !isSpeaking
                ? '🔍 Looking for text...'
                : statusMessage || 'Initializing...'}
            </Text>
          </View>
        )}

        {/* Camera (centered in the design) */}
        {[STAGES.READY, STAGES.SCANNING, STAGES.SPEAKING].includes(stage) && (
          <View style={styles.cameraWrapper}>
            <CameraScreen
              onPhotoTaken={handlePhotoTaken}
              isProcessing={isProcessing}
              triggerScan={triggerScan}
              autoScanEnabled={autoScanEnabled}
            />
          </View>
        )}

        {/* Result text panel - Glassmorphism Card */}
        {resultText ? (
          <View style={styles.resultPanel}>
            <SoundWave isActive={isSpeaking} />
            <ScrollView style={styles.resultScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.resultText}>{resultText}</Text>
            </ScrollView>

            <TouchableOpacity
              style={styles.replayButton}
              onPress={handleReplay}
              disabled={isSpeaking}
            >
              <LinearGradient
                colors={['#6A11CB', '#2575FC']} // Deep professional purple/blue
                style={styles.replayButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.replayButtonText}>
                  {isSpeaking ? '🔊 Reading...' : '🔁 Listen Again'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : null}

      </LinearGradient>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50, // For notch
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerTitle: { color: '#1A3C6B', fontSize: 24, fontWeight: 'bold' },
  offlineBadge: {
    backgroundColor: 'rgba(239, 159, 39, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(239, 159, 39, 0.5)',
  },
  offlineBadgeText: { color: '#1A3C6B', fontWeight: 'bold', fontSize: 13 },
  statusBar: {
    padding: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  statusText: { color: '#1A3C6B', fontSize: 15, fontWeight: '600' },
  cameraWrapper: {
    flex: 1,
    margin: 16,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    backgroundColor: '#000',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  resultPanel: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.65)', // Glassmorphism
    borderRadius: 28,
    padding: 20,
    maxHeight: 250,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  resultScroll: { maxHeight: 120, marginVertical: 10 },
  resultText: { color: '#1A3C6B', fontSize: 18, lineHeight: 30, textAlign: 'center' },
  replayButton: {
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  replayButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  replayButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
