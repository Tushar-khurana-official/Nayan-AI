import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppColors } from '../theme';
import { FeatureCard } from '../components';
import { RootStackParamList } from '../navigation/types';

type HomeScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Home'>;
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[AppColors.primaryDark, '#0F1629', AppColors.primaryMid]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={[AppColors.accentCyan, AppColors.accentViolet]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoGradient}
              >
                <Text style={styles.logoIcon}>👁️</Text>
              </LinearGradient>
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>NayanAI</Text>
              <Text style={styles.subtitle}>नेत्रहीन बच्चों का AI साथी</Text>
            </View>
          </View>

          {/* Offline Badge - USP of the app */}
          <View style={styles.offlineBadge}>
            <Text style={styles.offlineIcon}>✅</Text>
            <View style={styles.offlineText}>
              <Text style={styles.offlineTitle}>100% Offline — इंटरनेट की जरूरत नहीं</Text>
              <Text style={styles.offlineSubtitle}>
                सभी AI processing आपके फोन पर होती है। कोई data बाहर नहीं जाता।
                285 मिलियन नेत्रहीन लोगों के लिए।
              </Text>
            </View>
          </View>

          {/* Feature Cards Grid */}
          <View style={styles.gridContainer}>
            <View style={styles.row}>
              <FeatureCard
                title="Chat"
                subtitle="LLM Text Generation"
                icon="chat"
                gradientColors={[AppColors.accentCyan, '#0EA5E9']}
                onPress={() => navigation.navigate('Chat')}
              />
              <FeatureCard
                title="Tools"
                subtitle="Tool Calling"
                icon="tools"
                gradientColors={[AppColors.accentOrange, '#E67E22']}
                onPress={() => navigation.navigate('ToolCalling')}
              />
            </View>
            <View style={styles.row}>
              <FeatureCard
                title="Speech"
                subtitle="Speech to Text"
                icon="mic"
                gradientColors={[AppColors.accentViolet, '#7C3AED']}
                onPress={() => navigation.navigate('SpeechToText')}
              />
              <FeatureCard
                title="Voice"
                subtitle="Text to Speech"
                icon="volume"
                gradientColors={[AppColors.accentPink, '#DB2777']}
                onPress={() => navigation.navigate('TextToSpeech')}
              />
            </View>
            <View style={styles.row}>
              <FeatureCard
                title="Pipeline"
                subtitle="Voice Agent"
                icon="pipeline"
                gradientColors={[AppColors.accentGreen, '#059669']}
                onPress={() => navigation.navigate('VoicePipeline')}
              />
              <View style={{ flex: 1, margin: 8 }} />
            </View>
          </View>

          {/* Model Info Section */}
          <View style={styles.infoSection}>
            <Text style={styles.infoHeading}>🧠 On-Device AI Models</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>🤖</Text>
              <Text style={styles.infoLabel}>LLM (Text Simplification)</Text>
              <View style={{ flex: 1 }} />
              <Text style={styles.infoValue}>SmolLM2 135M</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>🔍</Text>
              <Text style={styles.infoLabel}>OCR (Hindi/English)</Text>
              <View style={{ flex: 1 }} />
              <Text style={styles.infoValue}>ML Kit On-Device</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>🔊</Text>
              <Text style={styles.infoLabel}>TTS (Hindi Voice)</Text>
              <View style={{ flex: 1 }} />
              <Text style={styles.infoValue}>ONNX VITS Local</Text>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.primaryDark,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  logoContainer: {
    marginRight: 16,
  },
  logoGradient: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: AppColors.accentCyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  logoIcon: {
    fontSize: 32,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: AppColors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: AppColors.accentCyan,
    marginTop: 4,
  },
  offlineBadge: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#0D2B1F',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#00C853',
    marginBottom: 32,
  },
  offlineIcon: {
    fontSize: 28,
    marginRight: 14,
  },
  offlineText: {
    flex: 1,
  },
  offlineTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#00E676',
    marginBottom: 4,
  },
  offlineSubtitle: {
    fontSize: 12,
    color: '#A5D6A7',
    lineHeight: 18,
  },
  gridContainer: {
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 0,
  },
  infoSection: {
    padding: 20,
    backgroundColor: AppColors.surfaceCard + '80',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AppColors.textMuted + '1A',
    marginBottom: 40,
  },
  infoHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: AppColors.textSecondary,
    marginBottom: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  infoLabel: {
    fontSize: 13,
    color: AppColors.textSecondary,
  },
  infoValue: {
    fontSize: 12,
    color: AppColors.accentCyan,
    fontWeight: '600',
  },
});