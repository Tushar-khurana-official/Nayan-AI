import React, { useEffect } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import Video from 'react-native-video';

/**
 * VideoSplashScreen.js
 * 
 * WHAT THIS DOES:
 * Plays the brand splash video (3-5 seconds) on app launch.
 * Automatically signals completion to App.js to navigate to the main screen.
 */
export default function VideoSplashScreen({ onFinish }) {

  // Auto-finish after 4.5 seconds (safe margin for the 4s video)
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 4500);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <Video
        source={require('../../assets/splash.mp4')}
        style={styles.video}
        resizeMode="cover"
        repeat={false}
        muted={true} // User requested muted for app start
        onEnd={onFinish} // Also finish when video naturally ends
        onError={(e) => {
          console.error('[VideoSplash] Error playing video:', e);
          onFinish(); // Fail gracefully to main screen
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  video: {
    ...StyleSheet.absoluteFillObject,
  },
});
