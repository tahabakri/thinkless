import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Stack, useRouter } from 'expo-router';
import { Timer, AlertTriangle, Zap, Eye, EyeOff } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import AnimatedPressable from '@/components/AnimatedPressable';
import { haptic } from '@/utils/haptics';
import { useApp } from '@/providers/AppProvider';
import Colors from '@/constants/colors';

const DURATIONS = [
  { minutes: 5, label: '5 MIN' },
  { minutes: 10, label: '10 MIN' },
  { minutes: 15, label: '15 MIN' },
  { minutes: 20, label: '20 MIN' },
];

export default function SpiralTimerScreen() {
  const router = useRouter();
  const { addSpiralTimer, completeSpiralTimer, addCommitment, spiralTimers } = useApp();
  const [phase, setPhase] = useState<'setup' | 'running' | 'timesup' | 'decided'>('setup');
  const [topic, setTopic] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<number>(10);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [currentTimerId, setCurrentTimerId] = useState<string | null>(null);
  const [decision, setDecision] = useState<string>('');
  const [focusMode, setFocusMode] = useState<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const focusBorderAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (phase === 'running' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setPhase('timesup');
            haptic.error();
            return 0;
          }
          if (prev <= 30) {
            haptic.light();
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, timeLeft]);

  useEffect(() => {
    if (phase === 'timesup') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    }
    return () => pulseAnim.stopAnimation();
  }, [phase]);

  useEffect(() => {
    if (focusMode && phase === 'running') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(focusBorderAnim, { toValue: 1, duration: 1000, useNativeDriver: false }),
          Animated.timing(focusBorderAnim, { toValue: 0.3, duration: 1000, useNativeDriver: false }),
        ])
      ).start();
    } else {
      focusBorderAnim.stopAnimation();
      focusBorderAnim.setValue(0.3);
    }
    return () => focusBorderAnim.stopAnimation();
  }, [focusMode, phase]);

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleStart = async () => {
    if (!topic.trim()) return;
    haptic.heavy();
    const timer = await addSpiralTimer({ topic: topic.trim(), durationMinutes: selectedDuration });
    setCurrentTimerId(timer.id);
    setTimeLeft(selectedDuration * 60);
    setPhase('running');
  };

  const handleDecide = async () => {
    if (!decision.trim() || !currentTimerId) return;
    haptic.success();
    await completeSpiralTimer({ id: currentTimerId, decision: decision.trim() });
    await addCommitment({ decision: `SPIRAL: ${topic} → ${decision.trim()}`, source: 'manual' });
    setPhase('decided');
    Toast.show({
      type: 'success',
      text1: 'Decision Locked',
      text2: 'Your decision has been committed.',
    });
  };

  const handleSkipDecision = async () => {
    if (!currentTimerId) return;
    await completeSpiralTimer({ id: currentTimerId });
    setPhase('decided');
  };

  const handleReset = () => {
    setPhase('setup');
    setTopic('');
    setDecision('');
    setCurrentTimerId(null);
    setTimeLeft(0);
    setFocusMode(false);
  };

  const toggleFocusMode = () => {
    setFocusMode((prev) => !prev);
    haptic.light();
  };

  const progress = phase === 'running' ? 1 - (timeLeft / (selectedDuration * 60)) : 0;

  if (phase === 'setup') {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <StatusBar style="light" />
        <ScrollView contentContainerStyle={styles.content}>
          <Stack.Screen options={{ title: 'SPIRAL TIMER' }} />

          <View style={styles.headerSection}>
            <Timer color={Colors.accent} size={28} />
            <Text style={styles.headerTitle}>OVERTHINK ALARM</Text>
            <Text style={styles.headerSub}>Set a topic. Set a timer. When it hits zero, decide.</Text>
          </View>

          <View style={styles.sectionHeader}>
            <View style={styles.sectionLine} />
            <Text style={styles.sectionLabel}>WHAT ARE YOU SPIRALING ON?</Text>
            <View style={styles.sectionLine} />
          </View>

          <TextInput
            style={styles.topicInput}
            placeholder="e.g. Whether to accept the job offer..."
            placeholderTextColor={Colors.textMuted}
            value={topic}
            onChangeText={setTopic}
            multiline
            textAlignVertical="top"
            testID="spiral-topic"
          />

          <View style={styles.sectionHeader}>
            <View style={styles.sectionLine} />
            <Text style={styles.sectionLabel}>HOW LONG DO YOU GET?</Text>
            <View style={styles.sectionLine} />
          </View>

          <View style={styles.durationRow}>
            {DURATIONS.map((d) => (
              <AnimatedPressable
                key={d.minutes}
                style={[
                  styles.durationCard,
                  selectedDuration === d.minutes && styles.durationCardActive,
                ]}
                onPress={() => {
                  setSelectedDuration(d.minutes);
                  haptic.light();
                }}
                haptic="none"
              >
                <Text
                  style={[
                    styles.durationText,
                    selectedDuration === d.minutes && styles.durationTextActive,
                  ]}
                >
                  {d.label}
                </Text>
              </AnimatedPressable>
            ))}
          </View>

          <AnimatedPressable
            style={[styles.startButton, !topic.trim() && styles.buttonDisabled]}
            onPress={handleStart}
            disabled={!topic.trim()}
            haptic="heavy"
            testID="spiral-start"
          >
            <Text style={styles.startButtonText}>START THE CLOCK →</Text>
          </AnimatedPressable>

          {spiralTimers.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionLine} />
                <Text style={styles.sectionLabel}>PAST TIMERS</Text>
                <View style={styles.sectionLine} />
              </View>
              {spiralTimers.slice(0, 5).map((t) => (
                <View key={t.id} style={styles.pastTimer}>
                  <View style={styles.pastTimerHeader}>
                    <Text style={styles.pastTimerTopic} numberOfLines={1}>{t.topic}</Text>
                    <Text style={[styles.pastTimerStatus, { color: t.decided ? Colors.accent : Colors.danger }]}>
                      {t.decided ? 'DECIDED' : 'NO DECISION'}
                    </Text>
                  </View>
                  {t.decision && (
                    <Text style={styles.pastTimerDecision}>→ {t.decision}</Text>
                  )}
                </View>
              ))}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  if (phase === 'running') {
    const isUrgent = timeLeft <= 30;
    return (
      <View style={styles.container}>
        <StatusBar hidden={focusMode} style="light" />
        <Stack.Screen options={{ title: 'THINKING...' }} />
        <View style={styles.runningHeader}>
          <AnimatedPressable
            style={[styles.focusButton, focusMode && styles.focusButtonActive]}
            onPress={toggleFocusMode}
            haptic="light"
          >
            {focusMode ? (
              <EyeOff color={Colors.bg} size={14} />
            ) : (
              <Eye color={Colors.accent} size={14} />
            )}
            <Text style={[styles.focusButtonText, focusMode && styles.focusButtonTextActive]}>
              {focusMode ? 'EXIT FOCUS' : 'FOCUS MODE'}
            </Text>
          </AnimatedPressable>
        </View>
        {focusMode && (
          <Animated.View
            style={[
              styles.focusBorder,
              { borderColor: Colors.accent, opacity: focusBorderAnim },
            ]}
            pointerEvents="none"
          />
        )}
        <View style={styles.timerBody}>
          {focusMode && (
            <Text style={styles.focusBadge}>FOCUS MODE</Text>
          )}
          <Text style={styles.timerTopic}>{topic}</Text>

          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress * 100}%`, backgroundColor: isUrgent ? Colors.danger : Colors.accent }]} />
          </View>

          <Text style={[styles.timerDisplay, { color: isUrgent ? Colors.danger : Colors.accent }]}>
            {formatTime(timeLeft)}
          </Text>
          <Text style={styles.timerHint}>
            {isUrgent ? "TIME'S ALMOST UP. DECIDE." : "Think. But know the clock is ticking."}
          </Text>

          <AnimatedPressable
            style={[styles.earlyDecideButton, { borderColor: isUrgent ? Colors.danger : Colors.accent }]}
            onPress={() => {
              if (timerRef.current) clearInterval(timerRef.current);
              setPhase('timesup');
              haptic.heavy();
            }}
            haptic="none"
          >
            <Text style={[styles.earlyDecideText, { color: isUrgent ? Colors.danger : Colors.accent }]}>
              I'M READY TO DECIDE
            </Text>
          </AnimatedPressable>
        </View>
      </View>
    );
  }

  if (phase === 'timesup') {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <StatusBar style="light" />
        <ScrollView contentContainerStyle={styles.content}>
          <Stack.Screen options={{ title: "TIME'S UP" }} />

          <Animated.View style={[styles.timesUpBanner, { transform: [{ scale: pulseAnim }] }]}>
            <AlertTriangle color={Colors.bg} size={28} />
            <Text style={styles.timesUpText}>TIME'S UP</Text>
            <Text style={styles.timesUpSub}>
              You've been thinking about "{topic}" long enough. Decide. Now.
            </Text>
          </Animated.View>

          <View style={styles.sectionHeader}>
            <View style={styles.sectionLine} />
            <Text style={styles.sectionLabel}>YOUR DECISION</Text>
            <View style={styles.sectionLine} />
          </View>

          <TextInput
            style={styles.decisionInput}
            placeholder="What's the decision? No hedging. No 'maybe'. State it clearly."
            placeholderTextColor={Colors.textMuted}
            value={decision}
            onChangeText={setDecision}
            multiline
            textAlignVertical="top"
            autoFocus
            testID="spiral-decision"
          />

          <AnimatedPressable
            style={[styles.lockButton, !decision.trim() && styles.buttonDisabled]}
            onPress={handleDecide}
            disabled={!decision.trim()}
            haptic="heavy"
          >
            <Zap color={Colors.bg} size={18} />
            <Text style={styles.lockButtonText}>LOCK DECISION →</Text>
          </AnimatedPressable>

          <AnimatedPressable
            style={styles.skipButton}
            onPress={handleSkipDecision}
            haptic="light"
          >
            <Text style={styles.skipButtonText}>I couldn't decide (goes to Graveyard)</Text>
          </AnimatedPressable>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Stack.Screen options={{ title: 'DECIDED' }} />
      <View style={styles.decidedBody}>
        <View style={styles.decidedIcon}>
          <Zap color={Colors.bg} size={32} />
        </View>
        <Text style={styles.decidedTitle}>
          {decision ? 'DECISION LOCKED' : 'SENT TO GRAVEYARD'}
        </Text>
        {decision ? (
          <View style={styles.decidedCard}>
            <Text style={styles.decidedLabel}>YOUR DECISION</Text>
            <Text style={styles.decidedText}>{decision}</Text>
          </View>
        ) : (
          <Text style={styles.decidedSub}>
            Another unmade decision for the pile. The Graveyard grows.
          </Text>
        )}
        <AnimatedPressable
          style={styles.startButton}
          onPress={handleReset}
          haptic="medium"
        >
          <Text style={styles.startButtonText}>NEW TIMER</Text>
        </AnimatedPressable>
        <AnimatedPressable
          style={styles.outlineButton}
          onPress={() => router.back()}
          haptic="light"
        >
          <Text style={styles.outlineButtonText}>BACK TO BASE</Text>
        </AnimatedPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  headerSection: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 26,
    fontWeight: '900' as const,
    letterSpacing: 3,
  },
  headerSub: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600' as const,
    letterSpacing: 1,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
    marginTop: 8,
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
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bg3,
    color: Colors.text,
    fontSize: 14,
    fontWeight: '500' as const,
    padding: 16,
    minHeight: 80,
    lineHeight: 22,
    marginBottom: 16,
  },
  durationRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  durationCard: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 14,
    alignItems: 'center',
  },
  durationCardActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentDim,
  },
  durationText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '900' as const,
    letterSpacing: 1,
  },
  durationTextActive: {
    color: Colors.accent,
  },
  startButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  startButtonText: {
    color: Colors.bg,
    fontSize: 18,
    fontWeight: '900' as const,
    letterSpacing: 2,
  },
  pastTimer: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 8,
  },
  pastTimerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pastTimerTopic: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '600' as const,
    flex: 1,
    marginRight: 8,
  },
  pastTimerStatus: {
    fontSize: 9,
    fontWeight: '800' as const,
    letterSpacing: 1,
  },
  pastTimerDecision: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '500' as const,
    marginTop: 6,
    fontStyle: 'italic',
  },
  runningHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  focusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.accent,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  focusButtonActive: {
    backgroundColor: Colors.accent,
  },
  focusButtonText: {
    color: Colors.accent,
    fontSize: 10,
    fontWeight: '800' as const,
    letterSpacing: 1,
  },
  focusButtonTextActive: {
    color: Colors.bg,
  },
  focusBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 4,
    borderColor: Colors.accent,
    zIndex: 10,
  },
  focusBadge: {
    color: Colors.accent,
    fontSize: 10,
    fontWeight: '900' as const,
    letterSpacing: 4,
    marginBottom: 12,
    backgroundColor: Colors.accentDim,
    paddingVertical: 4,
    paddingHorizontal: 12,
    overflow: 'hidden',
  },
  timerBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  timerTopic: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600' as const,
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 280,
  },
  progressBarBg: {
    width: '100%',
    height: 6,
    backgroundColor: Colors.border,
    marginBottom: 32,
  },
  progressBarFill: {
    height: 6,
  },
  timerDisplay: {
    fontSize: 96,
    fontWeight: '900' as const,
    letterSpacing: 4,
    lineHeight: 100,
    fontVariant: ['tabular-nums'],
    fontFamily: 'monospace',
  },
  timerHint: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600' as const,
    letterSpacing: 1,
    marginTop: 8,
    textAlign: 'center',
  },
  earlyDecideButton: {
    borderWidth: 2,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 40,
  },
  earlyDecideText: {
    fontSize: 14,
    fontWeight: '900' as const,
    letterSpacing: 2,
  },
  timesUpBanner: {
    backgroundColor: Colors.danger,
    padding: 28,
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  timesUpText: {
    color: Colors.bg,
    fontSize: 36,
    fontWeight: '900' as const,
    letterSpacing: 4,
  },
  timesUpSub: {
    color: Colors.bg,
    fontSize: 13,
    fontWeight: '600' as const,
    textAlign: 'center',
    lineHeight: 18,
    opacity: 0.9,
  },
  decisionInput: {
    borderWidth: 2,
    borderColor: Colors.accent,
    backgroundColor: Colors.bg3,
    color: Colors.text,
    fontSize: 14,
    fontWeight: '500' as const,
    padding: 16,
    minHeight: 100,
    lineHeight: 22,
    marginBottom: 16,
  },
  lockButton: {
    backgroundColor: Colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    marginBottom: 12,
  },
  lockButtonText: {
    color: Colors.bg,
    fontSize: 18,
    fontWeight: '900' as const,
    letterSpacing: 2,
  },
  skipButton: {
    alignSelf: 'center',
    paddingVertical: 10,
  },
  skipButtonText: {
    color: Colors.danger,
    fontSize: 11,
    fontWeight: '600' as const,
    fontStyle: 'italic',
  },
  decidedBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  decidedIcon: {
    width: 64,
    height: 64,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  decidedTitle: {
    color: Colors.accent,
    fontSize: 24,
    fontWeight: '900' as const,
    letterSpacing: 3,
    marginBottom: 16,
  },
  decidedSub: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '500' as const,
    textAlign: 'center',
    marginBottom: 24,
  },
  decidedCard: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.accent,
    padding: 20,
    width: '100%',
    marginBottom: 24,
  },
  decidedLabel: {
    color: Colors.accent,
    fontSize: 9,
    fontWeight: '800' as const,
    letterSpacing: 2,
    marginBottom: 6,
  },
  decidedText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700' as const,
    lineHeight: 20,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  outlineButtonText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '800' as const,
    letterSpacing: 2,
  },
});
