/**
 * StatusIndicator.js
 * Animated wave that shows when TTS is speaking.
 * Visually shows the child that the app is talking.
 */
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

export default function SoundWave({ isActive }) {
  const bars = [useRef(new Animated.Value(0.3)).current,
                useRef(new Animated.Value(0.5)).current,
                useRef(new Animated.Value(0.8)).current,
                useRef(new Animated.Value(0.5)).current,
                useRef(new Animated.Value(0.3)).current];

  useEffect(() => {
    if (isActive) {
      bars.forEach((bar, i) => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(bar, {
              toValue: 1, duration: 300 + i * 80,
              useNativeDriver: true
            }),
            Animated.timing(bar, {
              toValue: 0.2, duration: 300 + i * 80,
              useNativeDriver: true
            }),
          ])
        ).start();
      });
    } else {
      bars.forEach(bar => {
        bar.stopAnimation();
        Animated.timing(bar, {
          toValue: 0.3, duration: 200, useNativeDriver: true
        }).start();
      });
    }
  }, [isActive]);

  return (
    <View style={styles.waveContainer}>
      {bars.map((bar, i) => (
        <Animated.View
          key={i}
          style={[styles.bar, { transform: [{ scaleY: bar }] }]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    gap: 4,
  },
  bar: {
    width: 6,
    height: 32,
    borderRadius: 3,
    backgroundColor: '#EF9F27',
  },
});
