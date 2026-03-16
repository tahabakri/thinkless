import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Lock } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/providers/AppProvider';
import Colors from '@/constants/colors';
import { formatTimestamp } from '@/utils/helpers';

type Phase = 'setup' | 'for' | 'against' | 'verdict';

export default function TribunalScreen() {
  const { addTribunal, tribunals, addCommitment } = useApp();
  const [phase, setPhase] = useState<Phase>('setup');
  const [topic, setTopic] = useState<string>('');
  const [sideA, setSideA] = useState<string>('');
  const [sideB, setSideB] = useState<string>('');
  const [verdict, setVerdict] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(150);
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [loadingVerdict, setLoadingVerdict] = useState<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const startTimer = useCallback(() => {
    setTimeLeft(150);
    setTimerActive(true);
  }, []);

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setTimerActive(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive]);

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleStartFor = () => {
    if (!topic.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPhase('for');
    startTimer();
  };

  const handleSwitchSides = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerActive(false);
    setPhase('against');
    startTimer();
  };

  const handleDeliver = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerActive(false);
    setLoadingVerdict(true);
    setPhase('verdict');

    const session = await addTribunal({
      topic: topic.trim(),
      sideA: sideA.trim(),
      sideB: sideB.trim(),
    });

    setVerdict(session.verdict);
    setLoadingVerdict(false);

    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const handleReset = () => {
    setPhase('setup');
    setTopic('');
    setSideA('');
    setSideB('');
    setVerdict(null);
    setTimeLeft(150);
    setTimerActive(false);
    setLoadingVerdict(false);
    fadeAnim.setValue(0);
  };

  const handleLockDecision = async () => {
    if (verdict) {
      await addCommitment({ decision: `TRIBUNAL: ${topic} — ${verdict}`, source: 'tribunal' });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      handleReset();
    }
  };

  if (phase === 'setup') {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>TRIBUNAL</Text>
            <Text style={styles.headerSub}>2.5 MIN EACH SIDE. THEN A LOCKED VERDICT.</Text>
          </View>
          <View style={styles.headerDivider} />

          <View style={styles.body}>
            <View style={styles.howItWorks}>
              <Text style={styles.howLabel}>HOW IT WORKS</Text>
              <Text style={styles.howText}>
                1. State the decision you can't make{'\n'}
                2. Argue FOR it for 2m 30s{'\n'}
                3. Argue AGAINST it for 2m 30s{'\n'}
                4. Socra delivers a FINAL verdict{'\n'}
                5. The verdict is{' '}
                <Text style={{ color: Colors.danger }}>locked. No appeals.</Text>
              </Text>
            </View>

            <View style={styles.sectionHeader}>
              <View style={styles.sectionLine} />
              <Text style={styles.sectionLabel}>THE DECISION</Text>
              <View style={styles.sectionLine} />
            </View>

            <TextInput
              style={styles.topicInput}
              placeholder="e.g. Should I quit my job to freelance?"
              placeholderTextColor={Colors.textMuted}
              value={topic}
              onChangeText={setTopic}
              testID="tribunal-topic"
            />

            <TouchableOpacity
              style={[styles.primaryButton, !topic.trim() && styles.buttonDisabled]}
              onPress={handleStartFor}
              disabled={!topic.trim()}
              activeOpacity={0.7}
              testID="tribunal-start"
            >
              <Text style={styles.primaryButtonText}>BEGIN TRIBUNAL →</Text>
            </TouchableOpacity>

            {tribunals.length > 0 && (
              <View style={styles.historySection}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionLine} />
                  <Text style={styles.sectionLabel}>PAST VERDICTS</Text>
                  <View style={styles.sectionLine} />
                </View>
                {tribunals.slice(0, 5).map((t) => (
                  <View key={t.id} style={styles.historyCard}>
                    <View style={styles.historyHeader}>
                      <Text style={styles.historyTime}>{formatTimestamp(t.timestamp)}</Text>
                      <View style={styles.lockedBadge}>
                        <Lock color={Colors.accent} size={9} />
                        <Text style={styles.lockedText}>LOCKED</Text>
                      </View>
                    </View>
                    <Text style={styles.historyTopic}>{t.topic}</Text>
                    <Text style={styles.historyVerdict}>{t.verdict}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  if (phase === 'for' || phase === 'against') {
    const isFor = phase === 'for';
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{isFor ? 'ARGUE FOR' : 'ARGUE AGAINST'}</Text>
            <Text style={styles.headerSub} numberOfLines={1}>{topic.toUpperCase()}</Text>
          </View>
          <View style={styles.headerDivider} />

          <View style={styles.body}>
            <View style={styles.timerSection}>
              <Text
                style={[
                  styles.timerDisplay,
                  { color: timeLeft < 30 ? Colors.danger : Colors.accent },
                ]}
              >
                {formatTime(timeLeft)}
              </Text>
              <Text style={styles.timerLabel}>
                {isFor ? 'WHY YOU SHOULD' : "WHY YOU SHOULDN'T"}
              </Text>
            </View>

            <View style={styles.timerControls}>
              <TouchableOpacity
                style={styles.timerButton}
                onPress={() => setTimerActive((r) => !r)}
                activeOpacity={0.7}
              >
                <Text style={styles.timerButtonText}>{timerActive ? 'PAUSE' : 'START'}</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={[
                styles.argumentInput,
                { borderColor: isFor ? Colors.accent : Colors.danger },
              ]}
              placeholder={
                isFor
                  ? "Make the strongest case FOR this. Every reason, every benefit, every upside. Don't hold back."
                  : 'Now tear it apart. Every risk, every downside, every reason NOT to.'
              }
              placeholderTextColor={Colors.textMuted}
              multiline
              value={isFor ? sideA : sideB}
              onChangeText={isFor ? setSideA : setSideB}
              textAlignVertical="top"
              testID={isFor ? 'tribunal-side-a' : 'tribunal-side-b'}
            />

            <TouchableOpacity
              style={[
                styles.phaseButton,
                { backgroundColor: isFor ? Colors.accent : Colors.danger },
              ]}
              onPress={isFor ? handleSwitchSides : handleDeliver}
              activeOpacity={0.7}
            >
              <Text style={styles.phaseButtonText}>
                {isFor ? 'SWITCH SIDES →' : 'SUMMON THE VERDICT →'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  if (phase === 'verdict') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>THE VERDICT</Text>
          <Text style={styles.headerSub}>THIS IS FINAL. THE VAULT IS WAITING.</Text>
        </View>
        <View style={styles.headerDivider} />

        <View style={styles.body}>
          {loadingVerdict ? (
            <View style={styles.deliberating}>
              <Text style={styles.deliberatingTitle}>DELIBERATING</Text>
              <Text style={styles.deliberatingDots}>. . .</Text>
              <Text style={styles.deliberatingLabel}>SOCRA IS REVIEWING YOUR ARGUMENTS</Text>
            </View>
          ) : verdict ? (
            <Animated.View style={{ opacity: fadeAnim }}>
              <View style={styles.verdictBox}>
                <Text style={styles.verdictTitle}>⚖ VERDICT</Text>
                <Text style={styles.verdictText}>{verdict}</Text>
                <Text style={styles.verdictLock}>🔒 THIS DECISION IS NOW SEALED</Text>
              </View>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleLockDecision}
                activeOpacity={0.7}
              >
                <Text style={styles.primaryButtonText}>LOCK IN VAULT & COMMIT →</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.outlineButton}
                onPress={handleReset}
                activeOpacity={0.7}
              >
                <Text style={styles.outlineButtonText}>NEW TRIBUNAL</Text>
              </TouchableOpacity>
            </Animated.View>
          ) : null}
        </View>
      </ScrollView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 38,
    fontWeight: '900' as const,
    letterSpacing: 2,
    lineHeight: 40,
  },
  headerSub: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '700' as const,
    letterSpacing: 2,
    marginTop: 4,
  },
  headerDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  body: {
    padding: 20,
  },
  howItWorks: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    marginBottom: 20,
  },
  howLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 2,
    marginBottom: 10,
  },
  howText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 22,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  sectionLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 3,
  },
  topicInput: {
    backgroundColor: Colors.bg3,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    fontSize: 13,
    fontWeight: '500' as const,
    padding: 14,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  primaryButtonText: {
    color: Colors.bg,
    fontSize: 18,
    fontWeight: '900' as const,
    letterSpacing: 2,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 14,
    alignItems: 'center',
  },
  outlineButtonText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '800' as const,
    letterSpacing: 2,
  },
  timerSection: {
    alignItems: 'center',
    marginVertical: 16,
  },
  timerDisplay: {
    fontSize: 76,
    fontWeight: '900' as const,
    letterSpacing: 4,
    lineHeight: 80,
    fontVariant: ['tabular-nums'],
  },
  timerLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 3,
    marginTop: 4,
  },
  timerControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 12,
  },
  timerButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  timerButtonText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '800' as const,
    letterSpacing: 2,
  },
  argumentInput: {
    borderWidth: 1,
    color: Colors.text,
    fontSize: 13,
    fontWeight: '500' as const,
    padding: 16,
    minHeight: 200,
    lineHeight: 21,
    marginBottom: 16,
  },
  phaseButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  phaseButtonText: {
    color: Colors.bg,
    fontSize: 18,
    fontWeight: '900' as const,
    letterSpacing: 2,
  },
  deliberating: {
    alignItems: 'center',
    paddingTop: 60,
  },
  deliberatingTitle: {
    color: Colors.accent,
    fontSize: 32,
    fontWeight: '900' as const,
    letterSpacing: 4,
  },
  deliberatingDots: {
    color: Colors.textMuted,
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: 8,
    marginTop: 16,
  },
  deliberatingLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 2,
    marginTop: 16,
  },
  verdictBox: {
    backgroundColor: Colors.bg3,
    borderWidth: 2,
    borderColor: Colors.accent,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  verdictTitle: {
    color: Colors.accent,
    fontSize: 42,
    fontWeight: '900' as const,
    letterSpacing: 4,
    marginBottom: 16,
  },
  verdictText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 22,
    textAlign: 'center',
  },
  verdictLock: {
    color: Colors.danger,
    fontSize: 10,
    fontWeight: '800' as const,
    letterSpacing: 2,
    marginTop: 16,
  },
  historySection: {
    marginTop: 24,
  },
  historyCard: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 8,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyTime: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.accentDim,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  lockedText: {
    color: Colors.accent,
    fontSize: 9,
    fontWeight: '800' as const,
    letterSpacing: 1,
  },
  historyTopic: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700' as const,
    marginBottom: 6,
  },
  historyVerdict: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 18,
    fontStyle: 'italic',
  },
});
