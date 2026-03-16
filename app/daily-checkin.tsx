import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Sunrise, ChevronRight, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/providers/AppProvider';
import Colors from '@/constants/colors';

export default function DailyCheckInScreen() {
  const router = useRouter();
  const { addCheckIn, isCheckInPending, todayCheckedIn, checkIns } = useApp();
  const [step, setStep] = useState<number>(0);
  const [avoiding, setAvoiding] = useState<string>('');
  const [action, setAction] = useState<string>('');
  const [loop, setLoop] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  const questions = [
    {
      label: 'QUESTION 1 OF 3',
      question: "What decision are you avoiding today?",
      hint: "Name it. Don't explain it. Just name it.",
      value: avoiding,
      onChange: setAvoiding,
    },
    {
      label: 'QUESTION 2 OF 3',
      question: "What's your ONE committed action for today?",
      hint: "One thing. Specific. Measurable. No wiggle room.",
      value: action,
      onChange: setAction,
    },
    {
      label: 'QUESTION 3 OF 3',
      question: "What loop ran your head yesterday?",
      hint: "The thought that came back uninvited. Name the pattern.",
      value: loop,
      onChange: setLoop,
    },
  ];

  const handleNext = () => {
    if (step < 2) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setStep(step + 1);
    }
  };

  const handleSubmit = async () => {
    if (!avoiding.trim() || !action.trim() || !loop.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await addCheckIn({
      avoidingDecision: avoiding.trim(),
      committedAction: action.trim(),
      yesterdayLoop: loop.trim(),
    });
    setSubmitted(true);
  };

  if (todayCheckedIn && !submitted) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Stack.Screen options={{ title: 'MORNING RITUAL' }} />
        <View style={styles.completedState}>
          <View style={styles.checkCircle}>
            <Check color={Colors.bg} size={32} />
          </View>
          <Text style={styles.completedTitle}>RITUAL COMPLETE</Text>
          <Text style={styles.completedSub}>You showed up today. That's more than most.</Text>

          {checkIns.length > 0 && (
            <View style={styles.todayCard}>
              <Text style={styles.todayLabel}>TODAY'S COMMITMENT</Text>
              <Text style={styles.todayAction}>{checkIns[0].committedAction}</Text>
              <View style={styles.todayDivider} />
              <Text style={styles.todayAvoidLabel}>DECISION YOU'RE AVOIDING</Text>
              <Text style={styles.todayAvoid}>{checkIns[0].avoidingDecision}</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>BACK TO BASE</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  if (submitted) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Stack.Screen options={{ title: 'MORNING RITUAL' }} />
        <View style={styles.completedState}>
          <View style={styles.checkCircle}>
            <Check color={Colors.bg} size={32} />
          </View>
          <Text style={styles.completedTitle}>LOCKED IN</Text>
          <Text style={styles.completedSub}>
            Your action is committed. Socra will check on you tonight.
          </Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>AVOIDING</Text>
              <Text style={styles.summaryValue}>{avoiding}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: Colors.accent }]}>ACTION</Text>
              <Text style={[styles.summaryValue, { color: Colors.accent }]}>{action}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: Colors.danger }]}>YESTERDAY'S LOOP</Text>
              <Text style={styles.summaryValue}>{loop}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.primaryButtonText}>GO EXECUTE →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  const current = questions[step];
  const canProceed = current.value.trim().length > 0;
  const isLast = step === 2;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Stack.Screen options={{ title: 'MORNING RITUAL' }} />

        <View style={styles.ritualHeader}>
          <Sunrise color={Colors.accent} size={28} />
          <Text style={styles.ritualTitle}>MORNING RITUAL</Text>
          <Text style={styles.ritualSub}>3 questions. 2 minutes. No thinking allowed.</Text>
        </View>

        <View style={styles.progressBar}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[
                styles.progressSegment,
                { backgroundColor: i <= step ? Colors.accent : Colors.border },
              ]}
            />
          ))}
        </View>

        <View style={styles.questionCard}>
          <Text style={styles.questionStep}>{current.label}</Text>
          <Text style={styles.questionText}>{current.question}</Text>
          <Text style={styles.questionHint}>{current.hint}</Text>
        </View>

        <TextInput
          style={styles.answerInput}
          placeholder="Type your answer..."
          placeholderTextColor={Colors.textMuted}
          value={current.value}
          onChangeText={current.onChange}
          multiline
          textAlignVertical="top"
          autoFocus
          testID={`checkin-q${step}`}
        />

        {isLast ? (
          <TouchableOpacity
            style={[styles.primaryButton, (!canProceed || isCheckInPending) && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={!canProceed || isCheckInPending}
            activeOpacity={0.7}
            testID="checkin-submit"
          >
            {isCheckInPending ? (
              <ActivityIndicator color={Colors.bg} size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>LOCK IT IN →</Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.nextButton, !canProceed && styles.buttonDisabled]}
            onPress={handleNext}
            disabled={!canProceed}
            activeOpacity={0.7}
          >
            <Text style={styles.nextButtonText}>NEXT</Text>
            <ChevronRight color={Colors.bg} size={18} />
          </TouchableOpacity>
        )}

        {step > 0 && (
          <TouchableOpacity
            style={styles.backStepButton}
            onPress={() => setStep(step - 1)}
            activeOpacity={0.7}
          >
            <Text style={styles.backStepText}>← BACK</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
  ritualHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  ritualTitle: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '900' as const,
    letterSpacing: 3,
  },
  ritualSub: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600' as const,
    letterSpacing: 1,
    textAlign: 'center',
  },
  progressBar: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 24,
  },
  progressSegment: {
    flex: 1,
    height: 4,
  },
  questionCard: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
    padding: 20,
    marginBottom: 16,
  },
  questionStep: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '700' as const,
    letterSpacing: 3,
    marginBottom: 10,
  },
  questionText: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '800' as const,
    lineHeight: 26,
    marginBottom: 8,
  },
  questionHint: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '500' as const,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  answerInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bg3,
    color: Colors.text,
    fontSize: 14,
    fontWeight: '500' as const,
    padding: 16,
    minHeight: 120,
    lineHeight: 22,
    marginBottom: 16,
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
  nextButton: {
    backgroundColor: Colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 16,
    marginBottom: 10,
  },
  nextButtonText: {
    color: Colors.bg,
    fontSize: 18,
    fontWeight: '900' as const,
    letterSpacing: 2,
  },
  backStepButton: {
    alignSelf: 'center',
    paddingVertical: 10,
  },
  backStepText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
  completedState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  checkCircle: {
    width: 64,
    height: 64,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  completedTitle: {
    color: Colors.accent,
    fontSize: 28,
    fontWeight: '900' as const,
    letterSpacing: 3,
    marginBottom: 8,
  },
  completedSub: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '500' as const,
    textAlign: 'center',
    marginBottom: 24,
  },
  todayCard: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    width: '100%',
    marginBottom: 20,
  },
  todayLabel: {
    color: Colors.accent,
    fontSize: 9,
    fontWeight: '800' as const,
    letterSpacing: 2,
    marginBottom: 6,
  },
  todayAction: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700' as const,
    lineHeight: 20,
  },
  todayDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  todayAvoidLabel: {
    color: Colors.danger,
    fontSize: 9,
    fontWeight: '800' as const,
    letterSpacing: 2,
    marginBottom: 6,
  },
  todayAvoid: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600' as const,
    lineHeight: 18,
  },
  backButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  backButtonText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '800' as const,
    letterSpacing: 2,
  },
  summaryCard: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    width: '100%',
    marginBottom: 20,
  },
  summaryRow: {
    paddingVertical: 8,
  },
  summaryLabel: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '700' as const,
    letterSpacing: 2,
    marginBottom: 4,
  },
  summaryValue: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '600' as const,
    lineHeight: 18,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },
});
