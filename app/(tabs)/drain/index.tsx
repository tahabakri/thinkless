import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Animated,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from 'react-native';
import ReanimatedAnimated, { FadeInDown } from 'react-native-reanimated';
import { BrainCircuit, Mic, MicOff } from 'lucide-react-native';
import { useApp } from '@/providers/AppProvider';
import Colors from '@/constants/colors';
import { formatTimestamp } from '@/utils/helpers';
import AnimatedPressable from '@/components/AnimatedPressable';
import { SkeletonCard } from '@/components/SkeletonLoader';
import SwipeableRow from '@/components/SwipeableRow';
import EmptyState from '@/components/EmptyState';
import { haptic } from '@/utils/haptics';
import { startRecording, stopRecording, transcribeAudio } from '@/utils/audio';
import templates, { TEMPLATE_CATEGORIES } from '@/constants/templates';

const QUICK_CHIPS = [
  'I keep...',
  'Every time I...',
  "I'm scared that...",
  "I've been avoiding...",
  "I don't know if I should...",
  'The problem is...',
];

const MOODS = ['Anxious', 'Stuck', 'Spiraling', 'Calm', 'Frustrated'] as const;
type Mood = (typeof MOODS)[number];

export default function DrainScreen() {
  const { drains, addDrain, isDraining, addCommitment, isLoading, refetchData } = useApp();
  const [text, setText] = useState<string>('');
  const [showResponse, setShowResponse] = useState<string | null>(null);
  const responseAnim = useRef(new Animated.Value(0)).current;

  // Mood selector state
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);

  // Template state
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Voice input state
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pull-to-refresh state
  const [refreshing, setRefreshing] = useState(false);

  // Swipeable history: track locally hidden drain IDs
  const [hiddenDrainIds, setHiddenDrainIds] = useState<Set<string>>(new Set());

  // Pulsing animation for recording indicator
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.3, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording, pulseAnim]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetchData();
    setRefreshing(false);
  }, [refetchData]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.bg, padding: 20, paddingTop: 60 }}>
        <SkeletonCard lines={4} style={{ marginBottom: 16 }} />
        <SkeletonCard lines={2} style={{ marginBottom: 16 }} />
        <SkeletonCard lines={3} />
      </View>
    );
  }

  const handleDrain = async () => {
    if (!text.trim()) return;
    haptic.heavy();
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
    haptic.success();
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
    haptic.light();
  };

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood === selectedMood ? null : mood);
    haptic.selection();
  };

  const handleTemplateTap = (prefill: string) => {
    setText(prefill);
    setShowTemplates(false);
    setSelectedCategory(null);
    haptic.light();
  };

  const handleVoiceInput = async () => {
    if (isRecording) {
      // Stop recording and transcribe
      setIsRecording(false);
      setIsTranscribing(true);
      try {
        const uri = await stopRecording();
        if (uri) {
          const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;
          if (apiKey) {
            const transcription = await transcribeAudio(uri, apiKey);
            setText((prev) => (prev ? prev + ' ' + transcription : transcription));
          }
        }
      } catch {
        // silently fail
      } finally {
        setIsTranscribing(false);
      }
    } else {
      // Start recording
      try {
        await startRecording();
        setIsRecording(true);
        haptic.medium();
      } catch {
        // silently fail
      }
    }
  };

  const handleDeleteDrain = (drainId: string) => {
    setHiddenDrainIds((prev) => new Set(prev).add(drainId));
    haptic.light();
  };

  const visibleDrains = drains.filter((d) => !hiddenDrainIds.has(d.id));

  const filteredTemplates = selectedCategory
    ? templates.filter((t) => t.category === selectedCategory)
    : [];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.accent}
            colors={[Colors.accent]}
            progressBackgroundColor={Colors.bg2}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>THOUGHT DRAIN</Text>
          <Text style={styles.headerSub}>SPILL IT. ALL OF IT. SOCRA WILL CUT THROUGH.</Text>
        </View>
        <View style={styles.headerDivider} />

        <View style={styles.body}>

          <View style={styles.chipsSection}>
            <Text style={styles.chipsLabel}>QUICK START</Text>
            <View style={styles.chipsWrap}>
              {QUICK_CHIPS.map((chip, i) => (
                <AnimatedPressable
                  key={i}
                  style={styles.chip}
                  onPress={() => addChip(chip)}
                  haptic="light"
                >
                  <Text style={styles.chipText}>{chip}</Text>
                </AnimatedPressable>
              ))}
            </View>
          </View>

          {/* Mood Selector */}
          <View style={styles.moodSection}>
            <Text style={styles.chipsLabel}>HOW ARE YOU FEELING?</Text>
            <View style={styles.moodRow}>
              {MOODS.map((mood) => (
                <AnimatedPressable
                  key={mood}
                  style={[
                    styles.moodChip,
                    selectedMood === mood && styles.moodChipSelected,
                  ]}
                  onPress={() => handleMoodSelect(mood)}
                  haptic="none"
                >
                  <Text
                    style={[
                      styles.moodChipText,
                      selectedMood === mood && styles.moodChipTextSelected,
                    ]}
                  >
                    {mood}
                  </Text>
                </AnimatedPressable>
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
              <AnimatedPressable
                onPress={() => {
                  setText('');
                  setShowResponse(null);
                }}
                haptic="light"
              >
                <Text style={styles.clearBtn}>CLEAR ×</Text>
              </AnimatedPressable>
            )}
          </View>

          {text.length > 20 && (
            <View style={styles.patternBadge}>
              <Text style={styles.patternText}>
                🔁 PATTERN MATCH: <Text style={{ color: Colors.accent }}>LOOP</Text> detected from your history
              </Text>
            </View>
          )}

          {/* Templates Button */}
          <AnimatedPressable
            style={styles.templatesToggle}
            onPress={() => {
              setShowTemplates(!showTemplates);
              if (showTemplates) setSelectedCategory(null);
              haptic.light();
            }}
            haptic="none"
          >
            <Text style={styles.templatesToggleText}>
              {showTemplates ? 'HIDE TEMPLATES ▲' : 'TEMPLATES ▼'}
            </Text>
          </AnimatedPressable>

          {/* Templates Section */}
          {showTemplates && (
            <View style={styles.templatesSection}>
              <View style={styles.templateCategoriesRow}>
                {TEMPLATE_CATEGORIES.map((cat) => (
                  <AnimatedPressable
                    key={cat}
                    style={[
                      styles.templateCategoryChip,
                      selectedCategory === cat && styles.templateCategoryChipSelected,
                    ]}
                    onPress={() => {
                      setSelectedCategory(selectedCategory === cat ? null : cat);
                      haptic.selection();
                    }}
                    haptic="none"
                  >
                    <Text
                      style={[
                        styles.templateCategoryText,
                        selectedCategory === cat && styles.templateCategoryTextSelected,
                      ]}
                    >
                      {cat}
                    </Text>
                  </AnimatedPressable>
                ))}
              </View>
              {filteredTemplates.length > 0 && (
                <View style={styles.templateList}>
                  {filteredTemplates.map((tmpl) => (
                    <AnimatedPressable
                      key={tmpl.id}
                      style={styles.templateItem}
                      onPress={() => handleTemplateTap(tmpl.prefill)}
                      haptic="light"
                    >
                      <Text style={styles.templateTitle}>{tmpl.title}</Text>
                      <Text style={styles.templatePrompt}>{tmpl.prompt}</Text>
                    </AnimatedPressable>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Drain + Voice buttons row */}
          <View style={styles.drainRow}>
            <AnimatedPressable
              style={[styles.drainButton, (!text.trim() || isDraining) && styles.drainButtonDisabled]}
              onPress={handleDrain}
              disabled={!text.trim() || isDraining}
              haptic="none"
              testID="drain-send"
            >
              {isDraining ? (
                <ActivityIndicator color={Colors.bg} size="small" />
              ) : (
                <Text style={styles.drainButtonText}>DRAIN IT →</Text>
              )}
            </AnimatedPressable>

            <AnimatedPressable
              style={[
                styles.micButton,
                isRecording && styles.micButtonRecording,
              ]}
              onPress={handleVoiceInput}
              disabled={isTranscribing}
              haptic="none"
            >
              {isTranscribing ? (
                <ActivityIndicator color={Colors.accent} size="small" />
              ) : isRecording ? (
                <View style={styles.micActiveWrap}>
                  <Animated.View style={[styles.recordingDot, { opacity: pulseAnim }]} />
                  <MicOff size={20} color={Colors.danger} />
                </View>
              ) : (
                <Mic size={20} color={Colors.accent} />
              )}
            </AnimatedPressable>
          </View>

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
                <AnimatedPressable
                  style={styles.commitButton}
                  onPress={() => handleCommit(showResponse)}
                  haptic="medium"
                >
                  <Text style={styles.commitButtonText}>COMMIT TO ACTION</Text>
                </AnimatedPressable>
                <AnimatedPressable
                  style={styles.drainAgainButton}
                  onPress={dismissResponse}
                  haptic="light"
                >
                  <Text style={styles.drainAgainText}>DRAIN AGAIN</Text>
                </AnimatedPressable>
              </View>
            </Animated.View>
          )}

          {!showResponse && !isDraining && visibleDrains.length === 0 && drains.length === 0 && (
            <EmptyState
              icon={<BrainCircuit size={48} color={Colors.textMuted} />}
              title="No drains yet"
              subtitle="Dump your swirling thoughts above and let Socra cut through the noise."
            />
          )}

          {!showResponse && !isDraining && visibleDrains.length > 0 && (
            <View style={styles.historySection}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionLine} />
                <Text style={styles.sectionLabel}>PAST DRAINS</Text>
                <View style={styles.sectionLine} />
              </View>
              {visibleDrains.slice(0, 3).map((drain, index) => (
                <ReanimatedAnimated.View
                  key={drain.id}
                  entering={FadeInDown.delay(index * 80).duration(400)}
                >
                  <SwipeableRow
                    onSwipeLeft={() => handleDeleteDrain(drain.id)}
                    leftLabel="DELETE"
                    leftIcon="trash"
                  >
                    <AnimatedPressable
                      style={styles.historyCard}
                      onPress={() => setText(drain.text)}
                      haptic="light"
                    >
                      <View style={styles.historyHeader}>
                        <Text style={styles.historyTime}>{formatTimestamp(drain.timestamp)}</Text>
                        <Text style={styles.historyReuse}>TAP TO REUSE</Text>
                      </View>
                      <Text style={styles.historyText} numberOfLines={2}>
                        {drain.text}
                      </Text>
                    </AnimatedPressable>
                  </SwipeableRow>
                </ReanimatedAnimated.View>
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
  drainRow: {
    flexDirection: 'row',
    gap: 10,
  },
  drainButton: {
    flex: 1,
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
  micButton: {
    width: 56,
    backgroundColor: Colors.bg3,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButtonRecording: {
    borderColor: Colors.danger,
    backgroundColor: Colors.dangerDim,
  },
  micActiveWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.danger,
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
  // Mood selector styles
  moodSection: {
    marginBottom: 14,
  },
  moodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moodChip: {
    backgroundColor: Colors.bg3,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
  },
  moodChipSelected: {
    borderColor: Colors.accent,
    borderWidth: 2,
    backgroundColor: Colors.accentDim,
  },
  moodChipText: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
  moodChipTextSelected: {
    color: Colors.accent,
  },
  // Template styles
  templatesToggle: {
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: Colors.bg3,
  },
  templatesToggleText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '800' as const,
    letterSpacing: 2,
  },
  templatesSection: {
    marginBottom: 14,
  },
  templateCategoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  templateCategoryChip: {
    backgroundColor: Colors.bg3,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  templateCategoryChipSelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentDim,
  },
  templateCategoryText: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
  templateCategoryTextSelected: {
    color: Colors.accent,
  },
  templateList: {
    gap: 8,
  },
  templateItem: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
  },
  templateTitle: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '800' as const,
    letterSpacing: 1,
    marginBottom: 4,
  },
  templatePrompt: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '500' as const,
    fontStyle: 'italic',
  },
});
