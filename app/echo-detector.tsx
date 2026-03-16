import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Stack } from 'expo-router';
import { useApp } from '@/providers/AppProvider';
import Colors from '@/constants/colors';
import { getScoreColor } from '@/utils/helpers';

interface AnalysisResult {
  loopScore: number;
  patterns: string[];
  topLoop: string;
  bluntVerdict: string;
  actionPrompt: string;
}

export default function EchoDetectorScreen() {
  const { echoReport, drains } = useApp();
  const [input, setInput] = useState<string>('');
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [analyzed, setAnalyzed] = useState<boolean>(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const analyze = async () => {
    if (!input.trim()) return;
    setAnalyzing(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const mockResult: AnalysisResult = {
      loopScore: Math.floor(Math.random() * 40) + 45,
      patterns: ['Circular Reasoning', 'Analysis Paralysis', 'Catastrophizing', 'False Dichotomy'].slice(
        0,
        Math.floor(Math.random() * 2) + 2
      ),
      topLoop: 'Repeated avoidance disguised as planning',
      bluntVerdict: "You're not thinking — you're hiding inside the thought.",
      actionPrompt: "Write one sentence saying what you'll do by 5pm today.",
    };

    setResult(mockResult);
    setAnalyzing(false);
    setAnalyzed(true);

    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  const reset = () => {
    setAnalyzed(false);
    setResult(null);
    setInput('');
    fadeAnim.setValue(0);
  };

  const loopColor = result
    ? result.loopScore > 60
      ? Colors.danger
      : result.loopScore > 40
      ? Colors.warning
      : Colors.accent
    : Colors.accent;

  const loopLabel = result
    ? result.loopScore > 70
      ? 'DEEP IN THE CHAMBER'
      : result.loopScore > 40
      ? 'MILD ECHO ACTIVITY'
      : 'MOSTLY CLEAR'
    : '';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: 'ECHO DETECTOR' }} />

      {!analyzed ? (
        <>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionLine} />
            <Text style={styles.sectionLabel}>PASTE ANY TEXT OR THOUGHT TO ANALYZE</Text>
            <View style={styles.sectionLine} />
          </View>

          <TextInput
            style={styles.textInput}
            placeholder="Paste a journal entry, a voice-to-text ramble, a text you almost sent, a conversation you replayed in your head — anything."
            placeholderTextColor={Colors.textMuted}
            multiline
            value={input}
            onChangeText={setInput}
            textAlignVertical="top"
            testID="echo-input"
          />

          <TouchableOpacity
            style={[styles.analyzeButton, (!input.trim() || analyzing) && styles.buttonDisabled]}
            onPress={analyze}
            disabled={!input.trim() || analyzing}
            activeOpacity={0.7}
          >
            {analyzing ? (
              <ActivityIndicator color={Colors.bg} size="small" />
            ) : (
              <Text style={styles.analyzeButtonText}>DETECT MY ECHO →</Text>
            )}
          </TouchableOpacity>

          {analyzing && (
            <View style={styles.loadingSection}>
              <Text style={styles.loadingDots}>. . .</Text>
              <Text style={styles.loadingLabel}>AI IS MAPPING YOUR LOOPS</Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.sectionHeader}>
            <View style={styles.sectionLine} />
            <Text style={styles.sectionLabel}>HISTORICAL AVERAGE</Text>
            <View style={styles.sectionLine} />
          </View>
          <View style={styles.statRow}>
            <View style={styles.statBox}>
              <Text style={[styles.statVal, { color: Colors.danger }]}>{echoReport.loopScore || 67}</Text>
              <Text style={styles.statKey}>Avg Loop Score</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statVal, { color: Colors.accent }]}>↓12</Text>
              <Text style={styles.statKey}>vs Last Week</Text>
            </View>
          </View>
        </>
      ) : result ? (
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={[styles.loopScoreCard, { borderColor: loopColor }]}>
            <Text style={styles.loopScoreLabel}>YOUR LOOP SCORE</Text>
            <Text style={[styles.loopScoreValue, { color: loopColor }]}>{result.loopScore}</Text>
            <Text style={[styles.loopScoreStatus, { color: loopColor }]}>{loopLabel}</Text>
          </View>

          <View style={styles.sectionHeader}>
            <View style={styles.sectionLine} />
            <Text style={styles.sectionLabel}>PATTERNS DETECTED</Text>
            <View style={styles.sectionLine} />
          </View>
          <View style={styles.tagsWrap}>
            {result.patterns.map((p, i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>{p}</Text>
              </View>
            ))}
          </View>

          <View style={styles.dominantCard}>
            <Text style={styles.dominantLabel}>DOMINANT LOOP</Text>
            <Text style={styles.dominantText}>{result.topLoop}</Text>
          </View>

          <View style={styles.verdictCard}>
            <View style={styles.socraTagRow}>
              <Text style={styles.socraTag}>SOCRA'S VERDICT</Text>
              <View style={styles.socraTagLine} />
            </View>
            <Text style={styles.verdictText}>{result.bluntVerdict}</Text>
          </View>

          <View style={styles.actionCard}>
            <Text style={styles.actionLabel}>BREAK THE LOOP NOW</Text>
            <Text style={styles.actionText}>{result.actionPrompt}</Text>
          </View>

          <View style={styles.resultActions}>
            <TouchableOpacity style={styles.lockBtn} activeOpacity={0.7}>
              <Text style={styles.lockBtnText}>LOCK COMMITMENT</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.moreBtn} onPress={reset} activeOpacity={0.7}>
              <Text style={styles.moreBtnText}>ANALYZE MORE</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      ) : null}
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
  textInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    fontSize: 13,
    fontWeight: '500' as const,
    padding: 16,
    minHeight: 180,
    lineHeight: 21,
    marginBottom: 12,
  },
  analyzeButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  analyzeButtonText: {
    color: Colors.bg,
    fontSize: 18,
    fontWeight: '900' as const,
    letterSpacing: 2,
  },
  loadingSection: {
    alignItems: 'center',
    marginTop: 20,
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
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 20,
  },
  statRow: {
    flexDirection: 'row',
    gap: 1,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    padding: 14,
  },
  statVal: {
    fontSize: 28,
    fontWeight: '900' as const,
    lineHeight: 32,
  },
  statKey: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '700' as const,
    letterSpacing: 1,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  loopScoreCard: {
    backgroundColor: Colors.bgCard,
    borderWidth: 2,
    padding: 28,
    alignItems: 'center',
    marginBottom: 20,
  },
  loopScoreLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 3,
    marginBottom: 4,
  },
  loopScoreValue: {
    fontSize: 88,
    fontWeight: '900' as const,
    lineHeight: 92,
  },
  loopScoreStatus: {
    fontSize: 11,
    fontWeight: '800' as const,
    letterSpacing: 2,
    marginTop: 4,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  tag: {
    borderWidth: 1,
    borderColor: Colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    color: Colors.accent,
    fontSize: 9,
    fontWeight: '800' as const,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  dominantCard: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 3,
    borderLeftColor: Colors.danger,
    padding: 20,
    marginBottom: 12,
  },
  dominantLabel: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '700' as const,
    letterSpacing: 2,
    marginBottom: 8,
  },
  dominantText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
  verdictCard: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
    padding: 20,
    marginBottom: 12,
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
  verdictText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  actionCard: {
    backgroundColor: Colors.accent,
    padding: 20,
    marginBottom: 16,
  },
  actionLabel: {
    color: Colors.bg,
    fontSize: 9,
    fontWeight: '800' as const,
    letterSpacing: 2,
    marginBottom: 8,
  },
  actionText: {
    color: Colors.bg,
    fontSize: 13,
    fontWeight: '700' as const,
    lineHeight: 20,
  },
  resultActions: {
    flexDirection: 'row',
    gap: 10,
  },
  lockBtn: {
    flex: 1,
    backgroundColor: Colors.accent,
    paddingVertical: 14,
    alignItems: 'center',
  },
  lockBtnText: {
    color: Colors.bg,
    fontSize: 13,
    fontWeight: '900' as const,
    letterSpacing: 1,
  },
  moreBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 14,
    alignItems: 'center',
  },
  moreBtnText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '800' as const,
    letterSpacing: 1,
  },
});
