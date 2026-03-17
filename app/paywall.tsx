import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Zap, Check, X, Crown, Brain, MessageSquare, Dna, Skull, Shield, Users } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/providers/AppProvider';
import Colors from '@/constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PaywallScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { upgradeToPro } = useApp();

  const handlePurchase = async (plan: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await upgradeToPro();
    router.back();
  };

  const freeFeatures = [
    'Unlimited Thought Drains',
    'Basic Socra (Default Mode)',
    '7-Day History',
    'Commitment Vault',
    'Daily Check-in',
    'Spiral Timer',
  ];

  const proFeatures = [
    { label: 'Full Socra Chat', icon: <MessageSquare color={Colors.accent} size={14} /> },
    { label: 'Tribunal Replays', icon: <Shield color={Colors.accent} size={14} /> },
    { label: 'Weekly Loop Report', icon: <Brain color={Colors.accent} size={14} /> },
    { label: 'Pattern DNA Profile', icon: <Dna color={Colors.accent} size={14} /> },
    { label: 'Accountability Partner', icon: <Users color={Colors.accent} size={14} /> },
    { label: 'Socra Personality Modes', icon: <Crown color={Colors.accent} size={14} /> },
    { label: 'The Graveyard', icon: <Skull color={Colors.accent} size={14} /> },
    { label: 'Intervention System', icon: <Zap color={Colors.accent} size={14} /> },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <X color={Colors.textSecondary} size={24} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroSection}>
          <Crown color={Colors.accent} size={36} />
          <Text style={styles.heroTitle}>STOP THINKING.{'\n'}START DOING.</Text>
          <Text style={styles.heroSubtitle}>
            The core experience is free. Pro unlocks the tools that create lasting change.
          </Text>
        </View>

        <View style={styles.freeSection}>
          <Text style={styles.tierLabel}>FREE — FOREVER</Text>
          <Text style={styles.tierDesc}>The core experience. No limits on drains.</Text>
          {freeFeatures.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <Check color={Colors.textSecondary} size={14} />
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}
        </View>

        <View style={styles.proSection}>
          <View style={styles.proHeader}>
            <Text style={styles.proLabel}>PRO</Text>
            <View style={styles.proBadge}>
              <Text style={styles.proBadgeText}>RECOMMENDED</Text>
            </View>
          </View>
          <Text style={styles.tierDesc}>Tools that create lasting behavior change.</Text>
          {proFeatures.map((f, i) => (
            <View key={i} style={styles.proFeatureRow}>
              {f.icon}
              <Text style={styles.proFeatureText}>{f.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.priceCard}>
          <Text style={styles.priceAmount}>$9.99<Text style={styles.pricePeriod}>/mo</Text></Text>
          <Text style={styles.priceAlt}>or $79/year — saves you $40.88 AND your sanity</Text>
        </View>

        <TouchableOpacity
          style={styles.yearlyButton}
          onPress={() => handlePurchase('yearly')}
          activeOpacity={0.7}
          testID="paywall-yearly"
        >
          <View style={styles.bestValue}>
            <Text style={styles.bestValueText}>BEST VALUE</Text>
          </View>
          <Zap color={Colors.bg} size={18} />
          <View style={styles.priceCol}>
            <Text style={styles.yearlyPrice}>$79/YEAR</Text>
            <Text style={styles.yearlySub}>$6.58/month — Save 34%</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.monthlyButton}
          onPress={() => handlePurchase('monthly')}
          activeOpacity={0.7}
          testID="paywall-monthly"
        >
          <Text style={styles.monthlyPrice}>$9.99/MONTH</Text>
        </TouchableOpacity>

        <Text style={styles.legal}>
          Payment will be charged to your account. Cancel anytime.
          Subscription auto-renews unless canceled 24hrs before end of period.
        </Text>

        <TouchableOpacity
          style={styles.dismissLink}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={styles.dismissText}>not yet — I love my loop</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.restoreButton}
          onPress={() => {}}
          activeOpacity={0.7}
        >
          <Text style={styles.restoreText}>RESTORE PURCHASES</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  closeButton: {
    position: 'absolute' as const,
    top: 50,
    right: 16,
    zIndex: 10,
    padding: 8,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  heroTitle: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: '900' as const,
    letterSpacing: 1,
    textAlign: 'center',
    lineHeight: 30,
  },
  heroSubtitle: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '500' as const,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 300,
  },
  freeSection: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    marginBottom: 12,
  },
  tierLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '900' as const,
    letterSpacing: 2,
    marginBottom: 4,
  },
  tierDesc: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '500' as const,
    marginBottom: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  featureText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '500' as const,
  },
  proSection: {
    backgroundColor: Colors.accentDim,
    borderWidth: 1,
    borderColor: Colors.accent,
    padding: 20,
    marginBottom: 16,
  },
  proHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  proLabel: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: '900' as const,
    letterSpacing: 2,
  },
  proBadge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  proBadgeText: {
    color: Colors.bg,
    fontSize: 8,
    fontWeight: '900' as const,
    letterSpacing: 1,
  },
  proFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  proFeatureText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '600' as const,
  },
  priceCard: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.accent,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  priceAmount: {
    color: Colors.accent,
    fontSize: 48,
    fontWeight: '900' as const,
    letterSpacing: -1,
  },
  pricePeriod: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  priceAlt: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '500' as const,
    marginTop: 4,
  },
  yearlyButton: {
    backgroundColor: Colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 10,
    position: 'relative' as const,
    overflow: 'visible' as const,
  },
  bestValue: {
    position: 'absolute' as const,
    top: -10,
    right: 12,
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  bestValueText: {
    color: Colors.accent,
    fontSize: 9,
    fontWeight: '900' as const,
    letterSpacing: 2,
  },
  priceCol: {
    alignItems: 'center',
  },
  yearlyPrice: {
    color: Colors.bg,
    fontSize: 18,
    fontWeight: '900' as const,
    letterSpacing: 2,
  },
  yearlySub: {
    color: Colors.bg,
    fontSize: 11,
    fontWeight: '600' as const,
    opacity: 0.7,
    marginTop: 2,
  },
  monthlyButton: {
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginBottom: 20,
  },
  monthlyPrice: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: '800' as const,
    letterSpacing: 2,
  },
  legal: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '500' as const,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 16,
  },
  dismissLink: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  dismissText: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '500' as const,
    fontStyle: 'italic',
  },
  restoreButton: {
    alignSelf: 'center',
    paddingVertical: 10,
  },
  restoreText: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 2,
    textDecorationLine: 'underline',
  },
});
