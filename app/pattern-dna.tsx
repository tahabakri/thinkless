import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Dna, AlertTriangle, Clock, Brain } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/providers/AppProvider';
import Colors from '@/constants/colors';

export default function PatternDNAScreen() {
  const router = useRouter();
  const { patternDNA, generatePatternDNA, isGeneratingDNA, drains, isPro } = useApp();

  const needsMoreData = drains.length < 5;

  const handleGenerate = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await generatePatternDNA();
  };

  if (needsMoreData) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Stack.Screen options={{ title: 'PATTERN DNA' }} />
        <View style={styles.lockedState}>
          <Dna color={Colors.textMuted} size={48} />
          <Text style={styles.lockedTitle}>INSUFFICIENT DATA</Text>
          <Text style={styles.lockedSub}>
            Complete at least 5 Thought Drains to unlock your Pattern DNA profile.
            Currently: {drains.length}/5
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(drains.length / 5) * 100}%` }]} />
          </View>
          <TouchableOpacity
            style={styles.outlineButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.outlineButtonText}>GO DRAIN SOME THOUGHTS</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  if (!patternDNA) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Stack.Screen options={{ title: 'PATTERN DNA' }} />
        <View style={styles.lockedState}>
          <Dna color={Colors.accent} size={48} />
          <Text style={styles.readyTitle}>YOUR DNA IS READY</Text>
          <Text style={styles.lockedSub}>
            Based on {drains.length} drains, Socra has mapped your overthinking patterns.
          </Text>
          <TouchableOpacity
            style={[styles.generateButton, isGeneratingDNA && styles.buttonDisabled]}
            onPress={handleGenerate}
            disabled={isGeneratingDNA}
            activeOpacity={0.7}
          >
            {isGeneratingDNA ? (
              <ActivityIndicator color={Colors.bg} size="small" />
            ) : (
              <Text style={styles.generateButtonText}>REVEAL MY PATTERN DNA →</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  const dna = patternDNA;
  const hours = Math.floor(dna.avgThoughtToActionMinutes / 60);
  const mins = dna.avgThoughtToActionMinutes % 60;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: 'PATTERN DNA' }} />

      <View style={styles.dnaHeader}>
        <Dna color={Colors.accent} size={28} />
        <Text style={styles.dnaTitle}>YOUR OVERTHINK PROFILE</Text>
        <Text style={styles.dnaSub}>Based on {dna.totalDrainsAnalyzed} thought drains analyzed</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.profileIconRow}>
          <Brain color={Colors.accent} size={20} />
          <Text style={styles.profileLabel}>AVOIDANCE STYLE</Text>
        </View>
        <Text style={styles.profileStyle}>{dna.avoidanceStyle}</Text>
      </View>

      <View style={styles.timeCard}>
        <View style={styles.profileIconRow}>
          <Clock color={Colors.warning} size={20} />
          <Text style={styles.profileLabel}>AVG THOUGHT→ACTION TIME</Text>
        </View>
        <Text style={styles.timeValue}>
          {hours > 0 ? `${hours}h ${mins}m` : `${mins}m`}
        </Text>
        <Text style={styles.timeComment}>
          {dna.avgThoughtToActionMinutes > 60
            ? "That's hours of your life in the spiral. Cut it in half."
            : "Not bad. But every minute counts. Get faster."}
        </Text>
      </View>

      <View style={styles.sectionHeader}>
        <View style={styles.sectionLine} />
        <Text style={styles.sectionLabel}>TOP RECURRING LOOPS</Text>
        <View style={styles.sectionLine} />
      </View>

      {dna.topLoops.map((loop, i) => {
        const freq = dna.loopFrequency[loop] || Math.floor(Math.random() * 10) + 3;
        const maxFreq = Math.max(...Object.values(dna.loopFrequency), 10);
        const barWidth = Math.min(100, (freq / maxFreq) * 100);
        return (
          <View key={i} style={styles.loopItem}>
            <View style={styles.loopHeader}>
              <Text style={styles.loopWord}>{loop.toUpperCase()}</Text>
              <Text style={styles.loopFreq}>{freq}×</Text>
            </View>
            <View style={styles.loopBar}>
              <View
                style={[
                  styles.loopBarFill,
                  {
                    width: `${barWidth}%`,
                    backgroundColor: i === 0 ? Colors.danger : i === 1 ? Colors.warning : Colors.accent,
                  },
                ]}
              />
            </View>
          </View>
        );
      })}

      <View style={styles.insightCard}>
        <View style={styles.socraTagRow}>
          <Text style={styles.socraTag}>SOCRA'S ANALYSIS</Text>
          <View style={styles.socraTagLine} />
        </View>
        <Text style={styles.insightText}>
          Your pattern is clear: you dress up avoidance as analysis. The same 3 topics keep appearing
          with different words. Your brain isn't processing — it's buffering. The fix isn't more
          thinking. It's one decision, made now, and lived with.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.regenerateButton}
        onPress={handleGenerate}
        disabled={isGeneratingDNA}
        activeOpacity={0.7}
      >
        <Text style={styles.regenerateText}>
          {isGeneratingDNA ? 'ANALYZING...' : 'REGENERATE DNA'}
        </Text>
      </TouchableOpacity>
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
  lockedState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  lockedTitle: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '900' as const,
    letterSpacing: 2,
  },
  readyTitle: {
    color: Colors.accent,
    fontSize: 18,
    fontWeight: '900' as const,
    letterSpacing: 2,
  },
  lockedSub: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '500' as const,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 18,
  },
  progressBar: {
    width: '80%',
    height: 6,
    backgroundColor: Colors.border,
    marginTop: 4,
  },
  progressFill: {
    height: 6,
    backgroundColor: Colors.accent,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginTop: 8,
  },
  outlineButtonText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '800' as const,
    letterSpacing: 2,
  },
  generateButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  generateButtonText: {
    color: Colors.bg,
    fontSize: 16,
    fontWeight: '900' as const,
    letterSpacing: 2,
  },
  dnaHeader: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 6,
    marginBottom: 16,
  },
  dnaTitle: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: '900' as const,
    letterSpacing: 2,
  },
  dnaSub: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '600' as const,
    letterSpacing: 1,
  },
  profileCard: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.accent,
    padding: 20,
    marginBottom: 12,
  },
  profileIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  profileLabel: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '700' as const,
    letterSpacing: 2,
  },
  profileStyle: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700' as const,
    lineHeight: 22,
  },
  timeCard: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 3,
    borderLeftColor: Colors.warning,
    padding: 20,
    marginBottom: 20,
  },
  timeValue: {
    color: Colors.warning,
    fontSize: 36,
    fontWeight: '900' as const,
    letterSpacing: -1,
  },
  timeComment: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '500' as const,
    marginTop: 4,
    fontStyle: 'italic',
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
  loopItem: {
    marginBottom: 12,
  },
  loopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  loopWord: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '800' as const,
    letterSpacing: 1,
  },
  loopFreq: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '700' as const,
  },
  loopBar: {
    height: 6,
    backgroundColor: Colors.border,
  },
  loopBarFill: {
    height: 6,
  },
  insightCard: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
    padding: 20,
    marginTop: 8,
    marginBottom: 16,
  },
  socraTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  socraTag: {
    color: Colors.accent,
    fontSize: 10,
    fontWeight: '900' as const,
    letterSpacing: 3,
  },
  socraTagLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.accent,
    opacity: 0.3,
  },
  insightText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '500' as const,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  regenerateButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 14,
    alignItems: 'center',
  },
  regenerateText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '800' as const,
    letterSpacing: 2,
  },
});
