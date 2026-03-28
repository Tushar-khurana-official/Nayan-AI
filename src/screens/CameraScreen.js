/**
 * CameraScreen.js — NayanAI
 *
 * NEW FEATURES ADDED:
 * 1. Audio guidance — blind users ko camera tips audio mein sunate hain
 * 2. Shake-to-repeat — phone hilao, last text phir padhega
 * 3. Reading speed control — dheere/normal/tez slider
 */

import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Vibration,
  Animated,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import Tts from 'react-native-tts';
import { accelerometer, setUpdateIntervalForType, SensorTypes } from 'react-native-sensors';

// ─── Reading Speed Options ───────────────────────────────────────────────────
const SPEED_OPTIONS = [
  { label: 'धीरे', value: 0.2, color: '#4CAF50' },
  { label: 'Normal', value: 0.5, color: '#2196F3' },
  { label: 'तेज़', value: 1.0, color: '#FF9800' },
];

export default function CameraScreen({
  onPhotoTaken,
  isProcessing,
  triggerScan,
  autoScanEnabled,
  lastSpokenText,  // NEW: passed from App.js to enable shake-to-repeat
}) {
  const device = useCameraDevice('back');
  const camera = useRef(null);
  const { hasPermission, requestPermission } = useCameraPermission();
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const [speedIndex, setSpeedIndex] = useState(1); // Default: Normal
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // ── Pulse animation for the scan button ────────────────────────────────────
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.12, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 800, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // ── Audio guidance on first mount ──────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      speakGuide('कैमरा किताब के पास रखें और बड़ा बटन दबाएं।');
    }, 6000);
    return () => clearTimeout(timer);
  }, []);

  // ── Shake-to-repeat using accelerometer ────────────────────────────────────
  useEffect(() => {
    let lastShakeTime = 0;
    setUpdateIntervalForType(SensorTypes.accelerometer, 200);

    const subscription = accelerometer.subscribe(({ x, y, z }) => {
      const totalForce = Math.abs(x) + Math.abs(y) + Math.abs(z);
      const now = Date.now();
      // Shake threshold: force > 25 and cooldown of 2 seconds
      if (totalForce > 25 && now - lastShakeTime > 2000) {
        lastShakeTime = now;
        Vibration.vibrate([0, 80, 100, 80]);
        if (lastSpokenText) {
          speakGuide(lastSpokenText);
        } else {
          speakGuide('अभी कोई text नहीं है। कृपया पहले scan करें।');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [lastSpokenText]);

  // ── Respond to Auto-Scan triggers ──────────────────────────────────────────
  useEffect(() => {
    if (triggerScan > 0 && !isTakingPhoto && !isProcessing) {
      takePhoto();
    }
  }, [triggerScan]);

  // ── Helper to speak with selected speed ────────────────────────────────────
  const speakGuide = (text) => {
    const rate = SPEED_OPTIONS[speedIndex].value;
    Tts.setDefaultRate(rate);
    Tts.speak(text);
  };

  // ── Change speed and announce it ───────────────────────────────────────────
  const cycleSpeed = () => {
    const nextIndex = (speedIndex + 1) % SPEED_OPTIONS.length;
    setSpeedIndex(nextIndex);
    const next = SPEED_OPTIONS[nextIndex];
    Tts.setDefaultRate(next.value);
    Tts.speak(`Speed: ${next.label}`);
  };

  // ── Permission screen ───────────────────────────────────────────────────────
  if (!hasPermission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>📷 Camera Access Needed</Text>
        <Text style={styles.permissionText}>
          NayanAI को camera चाहिए textbook पढ़ने के लिए।{'\n'}
          आपकी photos कभी इस device से बाहर नहीं जातीं।
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
          accessibilityLabel="Camera permission allow karo"
        >
          <Text style={styles.permissionButtonText}>Camera Allow करें</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>Camera नहीं मिला</Text>
        <Text style={styles.permissionText}>इस device में back camera नहीं है।</Text>
      </View>
    );
  }

  const takePhoto = async () => {
    if (isTakingPhoto || isProcessing) return;
    setIsTakingPhoto(true);
    // Audio feedback instead of just visual
    Tts.speak('Photo ले रहा हूँ...');
    try {
      const photo = await camera.current.takePhoto({
        flash: 'off',
        qualityPrioritization: 'quality',
      });
      Vibration.vibrate(100);
      onPhotoTaken(photo.path);
    } catch (error) {
      Alert.alert('Error', 'Photo नहीं ले पाया। दोबारा कोशिश करें।');
      Tts.speak('Photo नहीं ले पाया। दोबारा कोशिश करें।');
    } finally {
      setIsTakingPhoto(false);
    }
  };

  const currentSpeed = SPEED_OPTIONS[speedIndex];

  return (
    <View style={styles.container}>
      {/* Full screen camera preview */}
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={!isProcessing}
        photo={true}
      />

      {/* Processing overlay */}
      {isProcessing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color="#EF9F27" />
          <Text style={styles.processingText}>Text पढ़ रहा हूँ...</Text>
        </View>
      )}

      {/* Top bar: Live indicator + Speed control */}
      {!isProcessing && (
        <View style={styles.topBar}>
          {autoScanEnabled && (
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
          <View style={{ flex: 1 }} />
          {/* Reading Speed Button */}
          <TouchableOpacity
            style={[styles.speedButton, { borderColor: currentSpeed.color }]}
            onPress={cycleSpeed}
            accessibilityLabel={`Reading speed: ${currentSpeed.label}. Tap to change.`}
          >
            <Text style={styles.speedIcon}>🔊</Text>
            <Text style={[styles.speedLabel, { color: currentSpeed.color }]}>
              {currentSpeed.label}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom: Scan button + shake hint */}
      <View style={styles.buttonContainer}>
        <Text style={styles.hint}>
          {isProcessing
            ? 'पढ़ रहा हूँ...'
            : 'किताब पर camera रखें और बटन दबाएं'}
        </Text>

        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            style={[
              styles.scanButton,
              (isTakingPhoto || isProcessing) && styles.scanButtonDisabled,
            ]}
            onPress={takePhoto}
            disabled={isTakingPhoto || isProcessing}
            accessibilityLabel="Text scan karo"
            accessibilityHint="Photo leta hai aur text oonchi awaaz mein padhta hai"
          >
            <Text style={styles.scanButtonText}>
              {isTakingPhoto ? '⏳' : '📸'}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.shakeHint}>📳 Phone हिलाओ = दोबारा सुनो</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A3C6B',
    padding: 32,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  permissionText: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 26,
  },
  permissionButton: {
    backgroundColor: '#EF9F27',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
  },
  permissionButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A3C6B',
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    color: '#EF9F27',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  topBar: {
    position: 'absolute',
    top: 20,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00ff00',
    marginRight: 6,
  },
  liveText: {
    color: '#00ff00',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  speedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    gap: 6,
  },
  speedIcon: {
    fontSize: 14,
  },
  speedLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: 44,
    paddingTop: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  hint: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  scanButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  scanButtonDisabled: {
    opacity: 0.3,
  },
  scanButtonText: {
    fontSize: 36,
  },
  shakeHint: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginTop: 14,
    textAlign: 'center',
  },
});