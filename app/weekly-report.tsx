import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { FileText, Share2, TrendingUp, TrendingDown } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/providers/AppProvider';
import Colors from '@/constants/colors';
import Svg, { Circle } from 'react-native-svg';

const RING_SIZE = 140;
const RING_RADIUS = 58;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export default function WeeklyReportScreen() {
  const router = useRouter();
  const { weeklyReports, generateWeeklyReport, isGeneratingReport, stats } = useApp();
  const [currentReport, setCurrentReport] = useState(weeklyReports[0] || null);

  const handleGenerate = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const report = await generateWeeklyReport();
    setCurrentReport(report);
  };

  useEffect(() => {
    if (weeklyReports.length > 0 && !currentReport) {
      setCurrentReport(weeklyReports[0]);
    }
  }, [weeklyReports]);

  const report = currentReport;
  const fill = report ? RING_CIRCUMFERENCE * (report.avgEscapeScore / 100) : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: 'WEEKLY REPORT' }} />

      {!report ? (
        <View style={styles.emptyState}>
          <FileText color={Colors.textMuted} size={40} />
          <Text style={styles.emptyTitle}>NO REPORT YET</Text>
          <Text style={styles.emptySub}>
            Generate your weekly loop report to see your progress, patterns, and Socra's verdict.
          </Text>
          <TouchableOpacity
            style={[styles.generateButton, isGeneratingReport && styles.buttonDisabled]}
            onPress={handleGenerate}
            disabled={isGeneratingReport}
            activeOpacity={0.7}
          >
            {isGeneratingReport ? (
              <ActivityIndicator color={Colors.bg} size="small" />
            ) : (
              <Text style={styles.generateButtonText}>GENERATE REPORT →</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.reportHeader}>
            <Text style={styles.reportWeek}>WEEK OF {report.weekOf.toUpperCase()}</Text>
            <TouchableOpacity style={styles.shareButton} activeOpacity={0.7}>
              <Share2 color={Colors.accent} size={16} />
              <Text style={styles.shareText}>SHARE</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.scoreSection}>
            <View style={styles.ringContainer}>
              <Svg width={RING_SIZE} height={RING_SIZE} viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}>
                <Circle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RING_RADIUS}
                  fill="none"
                  stroke={Colors.bg3}
                  strokeWidth={10}
                />
                <Circle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RING_RADIUS}
                  fill="none"
                  stroke={Colors.accent}
                  strokeWidth={10}
                  strokeDasharray={`${fill} ${RING_CIRCUMFERENCE}`}
                  strokeLinecap="butt"
                  transform={`rotate(-90, ${RING_SIZE / 2}, ${RING_SIZE / 2})`}
                />
              </Svg>
              <View style={styles.ringCenter}>
                <Text style={styles.ringScore}>{report.avgEscapeScore}</Text>
                <Text style={styles.ringLabel}>AVG SCORE</Text>
              </View>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statRow}>
              <View style={styles.statBox}>
                <Text style={[styles.statVal, { color: Colors.accent }]}>{report.loopsBroken}</Text>
                <Text style={styles.statKey}>Loops Broken</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statVal, { color: Colors.accent }]}>{report.commitmentsKept}</Text>
                <Text style={styles.statKey}>Commitments Kept</Text>
              </View>
            </View>
            <View style={styles.statRow}>
              <View style={styles.statBox}>
                <Text style={[styles.statVal, { color: Colors.danger }]}>{report.commitmentsMissed}</Text>
                <Text style={styles.statKey}>Commitments Missed</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statVal}>{report.streakDays}</Text>
                <Text style={styles.statKey}>Streak Days</Text>
              </View>
            </View>
            <View style={styles.statRow}>
              <View style={styles.statBox}>
                <Text style={styles.statVal}>{report.totalDrains}</Text>
                <Text style={styles.statKey}>Total Drains</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statVal}>{report.totalTribunals}</Text>
                <Text style={styles.statKey}>Tribunals Held</Text>
              </View>
            </View>
          </View>

          <View style={styles.patternCard}>
            <Text style={styles.patternLabel}>TOP PATTERN THIS WEEK</Text>
            <Text style={styles.patternText}>{report.topPattern}</Text>
          </View>

          <View style={styles.verdictCard}>
            <View style={styles.socraTagRow}>
              <Text style={styles.socraTag}>SOCRA'S WEEKLY VERDICT</Text>
              <View style={styles.socraTagLine} />
            </View>
            <Text style={styles.verdictText}>{report.socraVerdict}</Text>
          </View>

          <View style={styles.weeklyScoreChart}>
            <Text style={styles.chartLabel}>DAILY SCORES</Text>
            <View style={styles.chartBars}>
              {stats.weeklyScores.map((day, i) => (
                <View key={i} style={styles.chartBarCol}>
                  <View style={styles.chartBarBg}>
                    <View
                      style={[
                        styles.chartBarFill,
                        {
                          height: `${day.score}%`,
                          backgroundColor: day.score >= 50 ? Colors.accent : Colors.danger,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.chartBarLabel}>{day.date.charAt(0)}</Text>
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={styles.regenerateButton}
            onPress={handleGenerate}
            disabled={isGeneratingReport}
            activeOpacity={0.7}
          >
            <Text style={styles.regenerateText}>
              {isGeneratingReport ? 'GENERATING...' : 'REGENERATE REPORT'}
            </Text>
          </TouchableOpacity>
        </>
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '900' as const,
    letterSpacing: 2,
  },
  emptySub: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '500' as const,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 18,
    marginBottom: 8,
  },
  generateButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 16,
    paddingHorizontal: 32,
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
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  reportWeek: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 2,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.accent,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  shareText: {
    color: Colors.accent,
    fontSize: 10,
    fontWeight: '800' as const,
    letterSpacing: 1,
  },
  scoreSection: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 16,
  },
  ringContainer: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  ringScore: {
    color: Colors.accent,
    fontSize: 42,
    fontWeight: '900' as const,
    lineHeight: 46,
  },
  ringLabel: {
    color: Colors.textMuted,
    fontSize: 8,
    fontWeight: '700' as const,
    letterSpacing: 2,
  },
  statsGrid: {
    gap: 1,
    marginBottom: 16,
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
    color: Colors.text,
    fontSize: 26,
    fontWeight: '900' as const,
    lineHeight: 30,
  },
  statKey: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '700' as const,
    letterSpacing: 1,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  patternCard: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 3,
    borderLeftColor: Colors.danger,
    padding: 20,
    marginBottom: 12,
  },
  patternLabel: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '700' as const,
    letterSpacing: 2,
    marginBottom: 8,
  },
  patternText: {
    color: Colors.text,
    fontSize: 14,
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
  verdictText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '500' as const,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  weeklyScoreChart: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 16,
  },
  chartLabel: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '700' as const,
    letterSpacing: 2,
    marginBottom: 12,
  },
  chartBars: {
    flexDirection: 'row',
    gap: 6,
    height: 80,
    alignItems: 'flex-end',
  },
  chartBarCol: {
    flex: 1,
    alignItems: 'center',
  },
  chartBarBg: {
    width: '100%',
    height: 60,
    backgroundColor: Colors.bg3,
    justifyContent: 'flex-end',
  },
  chartBarFill: {
    width: '100%',
  },
  chartBarLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '700' as const,
    marginTop: 4,
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
