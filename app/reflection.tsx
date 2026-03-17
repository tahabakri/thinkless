import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { ThumbsUp, ThumbsDown, Minus } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import AnimatedPressable from '@/components/AnimatedPressable';
import EmptyState from '@/components/EmptyState';
import { useApp } from '@/providers/AppProvider';
import Colors, { MONO_FONT } from '@/constants/colors';
import { formatTimestamp } from '@/utils/helpers';
import { haptic } from '@/utils/haptics';

type Rating = 'good' | 'neutral' | 'bad';

export default function ReflectionScreen() {
  const router = useRouter();
  const { tribunals } = useApp();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rating, setRating] = useState<Rating | null>(null);
  const [notes, setNotes] = useState('');

  const lockedTribunals = tribunals.filter((t) => t.locked);

  const handleSubmitReflection = () => {
    if (!selectedId || !rating) return;
    haptic.success();
    Toast.show({
      type: 'success',
      text1: 'REFLECTION SAVED',
      text2: 'Your decision track record is growing.',
    });
    setSelectedId(null);
    setRating(null);
    setNotes('');
  };

  if (lockedTribunals.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon={<ThumbsUp size={40} color={Colors.textMuted} />}
          title="NO LOCKED DECISIONS YET"
          subtitle="Hold a Tribunal and lock a decision to reflect on it later."
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.intro}>
        Look back at your locked decisions. Was the call right?
      </Text>

      {!selectedId ? (
        <View style={styles.list}>
          {lockedTribunals.map((t, index) => (
            <Animated.View key={t.id} entering={FadeInDown.delay(index * 60)}>
              <AnimatedPressable
                style={styles.card}
                onPress={() => {
                  setSelectedId(t.id);
                  haptic.selection();
                }}
              >
                <Text style={styles.cardTopic}>{t.topic}</Text>
                <Text style={styles.cardVerdict} numberOfLines={2}>{t.verdict}</Text>
                <Text style={styles.cardTime}>{formatTimestamp(t.timestamp)}</Text>
              </AnimatedPressable>
            </Animated.View>
          ))}
        </View>
      ) : (
        <Animated.View entering={FadeInDown} style={styles.reflectionForm}>
          <Text style={styles.formTitle}>WAS THIS THE RIGHT CALL?</Text>
          <Text style={styles.formTopic}>
            {lockedTribunals.find((t) => t.id === selectedId)?.topic}
          </Text>
          <Text style={styles.formVerdict}>
            {lockedTribunals.find((t) => t.id === selectedId)?.verdict}
          </Text>

          <View style={styles.ratingRow}>
            <AnimatedPressable
              style={[styles.ratingBtn, rating === 'good' && styles.ratingGood]}
              onPress={() => { setRating('good'); haptic.selection(); }}
            >
              <ThumbsUp size={20} color={rating === 'good' ? Colors.bg : Colors.accent} />
              <Text style={[styles.ratingLabel, rating === 'good' && styles.ratingLabelActive]}>
                YES
              </Text>
            </AnimatedPressable>
            <AnimatedPressable
              style={[styles.ratingBtn, rating === 'neutral' && styles.ratingNeutral]}
              onPress={() => { setRating('neutral'); haptic.selection(); }}
            >
              <Minus size={20} color={rating === 'neutral' ? Colors.bg : Colors.textSecondary} />
              <Text style={[styles.ratingLabel, rating === 'neutral' && styles.ratingLabelActive]}>
                MEH
              </Text>
            </AnimatedPressable>
            <AnimatedPressable
              style={[styles.ratingBtn, rating === 'bad' && styles.ratingBad]}
              onPress={() => { setRating('bad'); haptic.selection(); }}
            >
              <ThumbsDown size={20} color={rating === 'bad' ? Colors.bg : Colors.danger} />
              <Text style={[styles.ratingLabel, rating === 'bad' && styles.ratingLabelActive]}>
                NO
              </Text>
            </AnimatedPressable>
          </View>

          <TextInput
            style={styles.notesInput}
            placeholder="What happened after this decision?"
            placeholderTextColor={Colors.textMuted}
            value={notes}
            onChangeText={setNotes}
            multiline
            textAlignVertical="top"
          />

          <AnimatedPressable
            style={[styles.submitBtn, !rating && styles.submitDisabled]}
            onPress={handleSubmitReflection}
            haptic="medium"
            disabled={!rating}
          >
            <Text style={styles.submitText}>SAVE REFLECTION</Text>
          </AnimatedPressable>

          <AnimatedPressable
            style={styles.cancelBtn}
            onPress={() => {
              setSelectedId(null);
              setRating(null);
              setNotes('');
            }}
            haptic="light"
          >
            <Text style={styles.cancelText}>BACK TO LIST</Text>
          </AnimatedPressable>
        </Animated.View>
      )}
    </ScrollView>
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
  intro: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: 20,
  },
  list: {
    gap: 10,
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
  },
  cardTopic: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  cardVerdict: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18,
    marginBottom: 8,
  },
  cardTime: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
  },
  reflectionForm: {
    gap: 16,
  },
  formTitle: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },
  formTopic: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  formVerdict: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  ratingBtn: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
  },
  ratingGood: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  ratingNeutral: {
    backgroundColor: Colors.textSecondary,
    borderColor: Colors.textSecondary,
  },
  ratingBad: {
    backgroundColor: Colors.danger,
    borderColor: Colors.danger,
  },
  ratingLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  ratingLabelActive: {
    color: Colors.bg,
  },
  notesInput: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    fontSize: 13,
    padding: 16,
    minHeight: 100,
    lineHeight: 20,
  },
  submitBtn: {
    backgroundColor: Colors.accent,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitDisabled: {
    opacity: 0.4,
  },
  submitText: {
    color: Colors.bg,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },
  cancelBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
