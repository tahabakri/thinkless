import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Lock, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/providers/AppProvider';
import Colors from '@/constants/colors';
import { formatTimestamp } from '@/utils/helpers';

const QUICK_CHIPS = [
  'I keep...',
  'Every time I...',
  "I'm scared that...",
  "I've been avoiding...",
  "I don't know if I should...",
  'The problem is...',
];

export default function DrainScreen() {
  const router = useRouter();
  const { drains, addDrain, isDraining, canDrain, isPro, weeklyDrainCount, addCommitment } = useApp();
  const [text, setText] = useState<string>('');
  const [showResponse, setShowResponse] = useState<string | null>(null);
  const responseAnim = useRef(new Animated.Value(0)).current;

  const handleDrain = async () => {
    if (!text.trim()) return;
    if (!canDrain) {
      router.push('/paywall' as never);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const drain = await addDrain(text.trim());
    setText('');
    setShowResponse(drain.socraResponse);

    Animated.spring(responseAnim, {
      toValue: 1,
      tension: 60,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handleCommit = async (decision: string) => {
    await addCommitment({ decision, source: 'drain' });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowResponse(null);
    responseAnim.setValue(0);
  };

  const dismissResponse = () => {
    Animated.timing(responseAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setShowResponse(null));
  };

  const addChip = (chip: string) => {
    setText((prev) => (prev ? prev + ' ' + chip : chip));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const freeDrains = Math.max(0, 3 - weeklyDrainCount);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>THOUGHT DRAIN</Text>
          <Text style={styles.headerSub}>SPILL IT. ALL OF IT. SOCRA WILL CUT THROUGH.</Text>
        </View>
        <View style={styles.headerDivider} />

        <View style={styles.body}>
          {!isPro && (
            <View style={styles.usageRow}>
              <Text style={styles.usageLabel}>
                FREE DRAINS:{' '}
                <Text style={{ color: freeDrains === 0 ? Colors.danger : Colors.accent }}>
                  {freeDrains}/3
                </Text>
              </Text>
              <TouchableOpacity onPress={() => router.push('/paywall' as never)} activeOpacity={0.7}>
                <Text style={styles.upgradeLink}>UPGRADE →</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.chipsSection}>
            <Text style={styles.chipsLabel}>QUICK START</Text>
            <View style={styles.chipsWrap}>
              {QUICK_CHIPS.map((chip, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.chip}
                  onPress={() => addChip(chip)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.chipText}>{chip}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <View style={styles.sectionLine} />
            <Text style={styles.sectionLabel}>WHAT'S SPINNING IN YOUR HEAD?</Text>
            <View style={styles.sectionLine} />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Don't organize it. Don't make it sound smart. Just dump it here — the loop, the fear, the thing you keep coming back to at 2am..."
              placeholderTextColor={Colors.textMuted}
              multiline
              value={text}
              onChangeText={setText}
              textAlignVertical="top"
              testID="drain-input"
            />
          </View>

          <View style={styles.inputMeta}>
            <Text style={styles.charCount}>{text.length} chars</Text>
            {text.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setText('');
                  setShowResponse(null);
                }}
              >
                <Text style={styles.clearBtn}>CLEAR ×</Text>
              </TouchableOpacity>
            )}
          </View>

          {text.length > 20 && (
            <View style={styles.patternBadge}>
              <Text style={styles.patternText}>
                🔁 PATTERN MATCH: <Text style={{ color: Colors.accent }}>LOOP</Text> detected from your history
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.drainButton, (!text.trim() || isDraining) && styles.drainButtonDisabled]}
            onPress={handleDrain}
            disabled={!text.trim() || isDraining}
            activeOpacity={0.7}
            testID="drain-send"
          >
            {isDraining ? (
              <ActivityIndicator color={Colors.bg} size="small" />
            ) : (
              <Text style={styles.drainButtonText}>DRAIN IT →</Text>
            )}
          </TouchableOpacity>

          {isDraining && (
            <View style={styles.loadingSection}>
              <Text style={styles.loadingDots}>. . .</Text>
              <Text style={styles.loadingLabel}>SOCRA IS CUTTING THROUGH THE NOISE</Text>
            </View>
          )}

          {showResponse && (
            <Animated.View
              style={[
                styles.responseCard,
                {
                  opacity: responseAnim,
                  transform: [
                    {
                      translateY: responseAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.socraTagRow}>
                <Text style={styles.socraTag}>SOCRA</Text>
                <View style={styles.socraTagLine} />
              </View>
              <Text style={styles.socraResponse}>{showResponse}</Text>
              <View style={styles.responseDivider} />
              <View style={styles.responseActions}>
                <TouchableOpacity
                  style={styles.commitButton}
                  onPress={() => handleCommit(showResponse)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.commitButtonText}>COMMIT TO ACTION</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.drainAgainButton}
                  onPress={dismissResponse}
                  activeOpacity={0.7}
                >
                  <Text style={styles.drainAgainText}>DRAIN AGAIN</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}

          {!showResponse && !isDraining && drains.length > 0 && (
            <View style={styles.historySection}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionLine} />
                <Text style={styles.sectionLabel}>PAST DRAINS</Text>
                <View style={styles.sectionLine} />
              </View>
              {drains.slice(0, 3).map((drain) => (
                <TouchableOpacity
                  key={drain.id}
                  style={styles.historyCard}
                  onPress={() => setText(drain.text)}
                  activeOpacity={0.7}
                >
                  <View style={styles.historyHeader}>
                    <Text style={styles.historyTime}>{formatTimestamp(drain.timestamp)}</Text>
                    <Text style={styles.historyReuse}>TAP TO REUSE</Text>
                  </View>
                  <Text style={styles.historyText} numberOfLines={2}>
                    {drain.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scrollView: {
    flex: 1,
  },
  content: {
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
  usageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  usageLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
  upgradeLink: {
    color: Colors.accent,
    fontSize: 9,
    fontWeight: '800' as const,
    letterSpacing: 1,
  },
  chipsSection: {
    marginBottom: 14,
  },
  chipsLabel: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '700' as const,
    letterSpacing: 2,
    marginBottom: 8,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    backgroundColor: Colors.bg3,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipText: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
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
  inputContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 4,
  },
  textInput: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '500' as const,
    padding: 16,
    minHeight: 160,
    lineHeight: 21,
  },
  inputMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  charCount: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '500' as const,
  },
  clearBtn: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
  patternBadge: {
    backgroundColor: Colors.bg3,
    borderLeftWidth: 2,
    borderLeftColor: Colors.border,
    padding: 10,
    marginBottom: 12,
  },
  patternText: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '600' as const,
    letterSpacing: 1,
  },
  drainButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drainButtonDisabled: {
    opacity: 0.4,
  },
  drainButtonText: {
    color: Colors.bg,
    fontSize: 18,
    fontWeight: '900' as const,
    letterSpacing: 2,
  },
  loadingSection: {
    alignItems: 'center',
    marginTop: 24,
  },
  loadingDots: {
    color: Colors.textMuted,
    fontSize: 24,
    fontWeight: '700' as const,
    letterSpacing: 4,
  },
  loadingLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 2,
    marginTop: 8,
  },
  responseCard: {
    backgroundColor: Colors.bg3,
    borderWidth: 1,
    borderColor: Colors.accent,
    padding: 20,
    marginTop: 16,
  },
  socraTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  socraTag: {
    color: Colors.accent,
    fontSize: 11,
    fontWeight: '900' as const,
    letterSpacing: 3,
  },
  socraTagLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.accent,
    opacity: 0.3,
  },
  socraResponse: {
    color: Colors.accent,
    fontSize: 16,
    fontWeight: '700' as const,
    lineHeight: 24,
  },
  responseDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 16,
  },
  responseActions: {
    flexDirection: 'row',
    gap: 10,
  },
  commitButton: {
    flex: 1,
    backgroundColor: Colors.accent,
    paddingVertical: 12,
    alignItems: 'center',
  },
  commitButtonText: {
    color: Colors.bg,
    fontSize: 13,
    fontWeight: '900' as const,
    letterSpacing: 1,
  },
  drainAgainButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 12,
    alignItems: 'center',
  },
  drainAgainText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '800' as const,
    letterSpacing: 1,
  },
  historySection: {
    marginTop: 16,
  },
  historyCard: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 10,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyTime: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
  historyReuse: {
    color: Colors.accent,
    fontSize: 9,
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
  historyText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '500' as const,
    fontStyle: 'italic',
    lineHeight: 18,
  },
});
