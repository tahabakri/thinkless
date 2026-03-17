import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Trophy, Settings, Zap, Sunrise, Timer, FileText,
  Skull, Dna, BookOpen, History, AlertTriangle, Award,
} from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';
import ReAnimated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useApp } from '@/providers/AppProvider';
import Colors, { getScoreRingColor, MONO_FONT } from '@/constants/colors';
import AnimatedPressable from '@/components/AnimatedPressable';
import { SkeletonCard } from '@/components/SkeletonLoader';
import EmptyState from '@/components/EmptyState';
import { haptic } from '@/utils/haptics';

const RING_SIZE = 200;
const RING_RADIUS = 85;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

interface BreakdownItem {
  label: string;
  value: number;
  good: boolean;
}

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  route: string;
  accent?: boolean;
}

/* ── Animated counting score display ─────────────────────────── */
function AnimatedScore({ target }: { target: number }) {
  const animValue = useSharedValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    animValue.value = 0;
    animValue.value = withTiming(target, {
      duration: 1200,
      easing: Easing.out(Easing.cubic),
    });

    // Drive the JS-side display via a polling approach since
    // runOnJS inside withTiming callback fires only once at the end.
    let frame: ReturnType<typeof requestAnimationFrame>;
    const start = Date.now();
    const duration = 1200;
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * target));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return (
    <Text style={styles.ringScore}>{display}</Text>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const appContext = useApp();

  const [refreshing, setRefreshing] = useState(false);
  const [breakdownExpanded, setBreakdownExpanded] = useState(false);

  const stats = appContext?.stats ?? { chamberScore: 0, totalDrains: 0, totalTribunals: 0, commitmentsKept: 0, commitmentsBroken: 0, currentStreak: 0, longestStreak: 0, weeklyScores: [] };
  const commitments = appContext?.commitments ?? [];
  const echoReport = appContext?.echoReport ?? { loopScore: 0, repetitions: 0, circularPatterns: 0, catastrophizing: 0, pseudoIntellectual: 0, topLoops: [] };
  const todayCheckedIn = appContext?.todayCheckedIn ?? false;
  const todayExternalInputs = appContext?.todayExternalInputs ?? [];
  const interventionNeeded = appContext?.interventionNeeded ?? false;
  const drains = appContext?.drains ?? [];
  const isLoading = appContext?.isLoading ?? true;
  const refetchData = appContext?.refetchData;

  const score = stats.chamberScore;
  const fill = RING_CIRCUMFERENCE * (score / 100);
  const ringColor = getScoreRingColor(score);

  /* ── Pull-to-refresh ───────────────────────────────────────── */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    haptic.light();
    try {
      await refetchData?.();
    } finally {
      setRefreshing(false);
    }
  }, [refetchData]);

  /* ── Skeleton loading state ────────────────────────────────── */
  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.bg, paddingTop: 60, paddingHorizontal: 20, gap: 16 }}>
        <SkeletonCard lines={2} />
        <SkeletonCard lines={4} />
        <SkeletonCard lines={3} />
      </View>
    );
  }

  const pendingCommitments = commitments.filter((c) => !c.proofSubmitted && !c.shamed).length;

  const breakdown: BreakdownItem[] = [
    { label: 'Thought→Action Ratio', value: Math.min(100, Math.round(score * 1.1)), good: true },
    { label: 'Loop Patterns Detected', value: echoReport.loopScore, good: echoReport.loopScore < 40 },
    { label: 'Commitments Kept', value: Math.min(100, stats.commitmentsKept * 20), good: true },
    { label: 'External Input Consumed', value: Math.min(100, todayExternalInputs.length * 20), good: true },
  ];

  const streakDays = stats.currentStreak;

  const quickActions: QuickAction[] = [
    {
      label: 'MORNING RITUAL',
      icon: <Sunrise color={todayCheckedIn ? Colors.textMuted : Colors.accent} size={16} />,
      route: '/daily-checkin',
      accent: !todayCheckedIn,
    },
    {
      label: 'SPIRAL TIMER',
      icon: <Timer color={Colors.textSecondary} size={16} />,
      route: '/spiral-timer',
    },
    {
      label: 'WEEKLY REPORT',
      icon: <FileText color={Colors.textSecondary} size={16} />,
      route: '/weekly-report',
    },
    {
      label: 'LOOP HISTORY',
      icon: <History color={Colors.textSecondary} size={16} />,
      route: '/loop-history',
    },
    {
      label: 'PATTERN DNA',
      icon: <Dna color={Colors.textSecondary} size={16} />,
      route: '/pattern-dna',
    },
    {
      label: 'EXTERNAL INPUTS',
      icon: <BookOpen color={Colors.textSecondary} size={16} />,
      route: '/external-inputs',
    },
    {
      label: 'ACHIEVEMENTS',
      icon: <Award color={Colors.textSecondary} size={16} />,
      route: '/achievements',
    },
  ];

  return (
    <ScrollView
      style={styles.container}
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
        <View>
          <Text style={styles.headerTitle}>THINKLESS</Text>
          <Text style={styles.headerSub}>ESCAPE THE ECHO CHAMBER</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.headerDate}>
            {new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()}
          </Text>
          <Text style={styles.headerStreak}>DAY {stats.currentStreak > 0 ? stats.currentStreak : 1}</Text>
        </View>
      </View>
      <View style={styles.headerDivider} />

      {!todayCheckedIn && (
        <AnimatedPressable
          style={styles.checkinBanner}
          onPress={() => {
            haptic.medium();
            router.push('/daily-checkin' as never);
          }}
        >
          <Sunrise color={Colors.bg} size={18} />
          <View style={styles.checkinBannerInfo}>
            <Text style={styles.checkinBannerTitle}>MORNING RITUAL WAITING</Text>
            <Text style={styles.checkinBannerSub}>3 questions. 2 minutes. No thinking.</Text>
          </View>
          <Text style={styles.checkinBannerArrow}>→</Text>
        </AnimatedPressable>
      )}

      {interventionNeeded && (
        <AnimatedPressable
          style={styles.interventionBanner}
          onPress={() => {
            haptic.warning();
            router.push('/tribunal' as never);
          }}
        >
          <AlertTriangle color={Colors.bg} size={18} />
          <View style={styles.interventionInfo}>
            <Text style={styles.interventionTitle}>INTERVENTION</Text>
            <Text style={styles.interventionSub}>Same loop detected 3+ times. Tribunal required.</Text>
          </View>
        </AnimatedPressable>
      )}

      {/* ── Escape Score Ring (tappable) ──────────────────────── */}
      <AnimatedPressable
        haptic="light"
        style={styles.ringWrap}
        onPress={() => {
          haptic.selection();
          setBreakdownExpanded((prev) => !prev);
        }}
      >
        <Svg width={RING_SIZE} height={RING_SIZE} viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}>
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            fill="none"
            stroke={Colors.bg3}
            strokeWidth={12}
          />
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            fill="none"
            stroke={ringColor}
            strokeWidth={12}
            strokeDasharray={`${fill} ${RING_CIRCUMFERENCE}`}
            strokeLinecap="butt"
            transform={`rotate(-90, ${RING_SIZE / 2}, ${RING_SIZE / 2})`}
          />
        </Svg>
        <View style={styles.ringCenter}>
          <AnimatedScore target={score} />
          <Text style={styles.ringLabel}>ESCAPE SCORE</Text>
          <Text style={styles.ringHint}>{breakdownExpanded ? 'TAP TO COLLAPSE' : 'TAP FOR BREAKDOWN'}</Text>
        </View>
      </AnimatedPressable>

      {/* ── Inline breakdown expansion below ring ────────────── */}
      {breakdownExpanded && (
        <View style={styles.breakdownExpandedWrap}>
          {breakdown.map((item, idx) => (
            <ReAnimated.View
              key={item.label}
              entering={FadeInDown.delay(idx * 80).duration(300)}
              style={styles.breakdownExpandedRow}
            >
              <Text style={styles.breakdownExpandedLabel}>{item.label}</Text>
              <Text
                style={[
                  styles.breakdownExpandedValue,
                  { color: item.good ? Colors.accent : Colors.danger },
                ]}
              >
                {item.value}
              </Text>
            </ReAnimated.View>
          ))}
        </View>
      )}

      <View style={styles.sectionHeader}>
        <View style={styles.sectionLine} />
        <Text style={styles.sectionTitle}>{"TODAY'S BREAKDOWN"}</Text>
        <View style={styles.sectionLine} />
      </View>

      {breakdown.length === 0 ? (
        <EmptyState
          icon={<Zap color={Colors.textMuted} size={32} />}
          title="No data yet"
          subtitle="Complete your morning ritual to see today's breakdown."
        />
      ) : (
        breakdown.map((item, idx) => (
          <ReAnimated.View
            key={item.label}
            entering={FadeInDown.delay(idx * 60).duration(350)}
            style={styles.breakdownItem}
          >
            <View style={styles.breakdownHeader}>
              <Text style={styles.breakdownLabel}>{item.label}</Text>
              <Text style={[styles.breakdownValue, { color: item.good ? Colors.accent : Colors.danger }]}>
                {item.value}
              </Text>
            </View>
            <View style={styles.barBg}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${Math.min(100, item.value)}%`,
                    backgroundColor: item.good ? Colors.accent : Colors.danger,
                  },
                ]}
              />
            </View>
          </ReAnimated.View>
        ))
      )}

      <View style={styles.divider} />

      <View style={styles.sectionHeader}>
        <View style={styles.sectionLine} />
        <Text style={styles.sectionTitle}>THIS WEEK</Text>
        <View style={styles.sectionLine} />
      </View>

      <View style={styles.statGrid}>
        <View style={styles.statRow}>
          <View style={styles.statBox}>
            <Text style={[styles.statVal, { color: Colors.accent }]}>{stats.totalDrains}</Text>
            <Text style={styles.statKey}>Actions Taken</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statVal, { color: Colors.danger }]}>{echoReport.circularPatterns}</Text>
            <Text style={styles.statKey}>Loops Broken</Text>
          </View>
        </View>
        <View style={styles.statRow}>
          <View style={styles.statBox}>
            <Text style={[styles.statVal, { color: Colors.accent }]}>{stats.totalDrains}</Text>
            <Text style={styles.statKey}>Drains Done</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{stats.totalTribunals}</Text>
            <Text style={styles.statKey}>Locked Decisions</Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.socraCard}>
        <View style={styles.socraTagRow}>
          <Text style={styles.socraTag}>SOCRA SAYS</Text>
          <View style={styles.socraTagLine} />
        </View>
        <Text style={styles.socraQuote}>
          {drains.length > 0
            ? `"${drains[0].socraResponse}"`
            : '"No thoughts drained yet. Start dumping your spiral into the Drain and I\'ll tell you what you already know."'}
        </Text>
      </View>

      {pendingCommitments > 0 && (
        <AnimatedPressable
          style={styles.alertCard}
          onPress={() => {
            haptic.warning();
            router.push('/vault' as never);
          }}
          testID="pending-commitments-alert"
        >
          <Zap color={Colors.danger} size={16} />
          <Text style={styles.alertText}>
            {pendingCommitments} COMMITMENT{pendingCommitments > 1 ? 'S' : ''} AWAITING PROOF
          </Text>
        </AnimatedPressable>
      )}

      <View style={styles.streakRow}>
        {DAYS.map((d, i) => (
          <View
            key={i}
            style={[
              styles.streakDay,
              { backgroundColor: i < streakDays ? Colors.accent : Colors.bgCard },
            ]}
          >
            <Text
              style={[
                styles.streakDayText,
                { color: i < streakDays ? Colors.bg : Colors.textMuted },
              ]}
            >
              {d}
            </Text>
          </View>
        ))}
      </View>
      <Text style={styles.streakLabel}>
        {streakDays > 0 ? `${streakDays} DAY ACTION STREAK` : 'START YOUR STREAK'}
        {stats.longestStreak > 0 && ` · BEST: ${stats.longestStreak}D`}
      </Text>

      <View style={styles.divider} />

      <View style={styles.sectionHeader}>
        <View style={styles.sectionLine} />
        <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
        <View style={styles.sectionLine} />
      </View>

      <View style={styles.quickGrid}>
        {quickActions.map((action, idx) => (
          <ReAnimated.View
            key={action.label}
            entering={FadeInDown.delay(idx * 50).duration(300)}
            style={{ width: '48%', flexGrow: 1 }}
          >
            <AnimatedPressable
              style={[styles.quickCard, action.accent && styles.quickCardAccent]}
              onPress={() => {
                haptic.light();
                router.push(action.route as never);
              }}
            >
              {action.icon}
              <Text style={[styles.quickLabel, action.accent && styles.quickLabelAccent]}>
                {action.label}
              </Text>
            </AnimatedPressable>
          </ReAnimated.View>
        ))}
      </View>

      <View style={styles.navRow}>
        <AnimatedPressable
          style={styles.navButton}
          onPress={() => {
            haptic.light();
            router.push('/leaderboard' as never);
          }}
          testID="nav-leaderboard"
        >
          <Trophy color={Colors.textMuted} size={14} />
          <Text style={styles.navButtonText}>LEADERBOARD</Text>
        </AnimatedPressable>
        <AnimatedPressable
          style={styles.navButton}
          onPress={() => {
            haptic.light();
            router.push('/graveyard' as never);
          }}
        >
          <Skull color={Colors.danger} size={14} />
          <Text style={[styles.navButtonText, { color: Colors.danger }]}>GRAVEYARD</Text>
        </AnimatedPressable>
      </View>

      <View style={styles.bottomRow}>
        <AnimatedPressable
          style={styles.settingsButton}
          onPress={() => {
            haptic.light();
            router.push('/settings' as never);
          }}
          testID="nav-settings"
        >
          <Settings color={Colors.textMuted} size={14} />
          <Text style={styles.navButtonText}>SETTINGS</Text>
        </AnimatedPressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
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
    marginTop: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  headerDate: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '600' as const,
    letterSpacing: 1,
  },
  headerStreak: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: '900' as const,
    letterSpacing: 1,
    marginTop: 2,
  },
  headerDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  checkinBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent,
    marginHorizontal: 20,
    marginTop: 12,
    padding: 14,
    gap: 10,
  },
  checkinBannerInfo: {
    flex: 1,
  },
  checkinBannerTitle: {
    color: Colors.bg,
    fontSize: 12,
    fontWeight: '900' as const,
    letterSpacing: 1,
  },
  checkinBannerSub: {
    color: Colors.bg,
    fontSize: 10,
    fontWeight: '600' as const,
    opacity: 0.8,
    marginTop: 1,
  },
  checkinBannerArrow: {
    color: Colors.bg,
    fontSize: 18,
    fontWeight: '900' as const,
  },
  interventionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.danger,
    marginHorizontal: 20,
    marginTop: 8,
    padding: 14,
    gap: 10,
  },
  interventionInfo: {
    flex: 1,
  },
  interventionTitle: {
    color: Colors.bg,
    fontSize: 12,
    fontWeight: '900' as const,
    letterSpacing: 2,
  },
  interventionSub: {
    color: Colors.bg,
    fontSize: 10,
    fontWeight: '600' as const,
    opacity: 0.9,
    marginTop: 1,
  },
  ringWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  ringScore: {
    color: Colors.accent,
    fontSize: 68,
    fontWeight: '900' as const,
    letterSpacing: -2,
    lineHeight: 72,
    fontFamily: MONO_FONT,
  },
  ringLabel: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '700' as const,
    letterSpacing: 2,
    marginTop: 2,
  },
  ringHint: {
    color: Colors.textMuted,
    fontSize: 7,
    fontWeight: '600' as const,
    letterSpacing: 1,
    marginTop: 4,
    opacity: 0.6,
  },
  breakdownExpandedWrap: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    gap: 10,
  },
  breakdownExpandedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownExpandedLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600' as const,
  },
  breakdownExpandedValue: {
    fontSize: 14,
    fontWeight: '900' as const,
    fontFamily: MONO_FONT,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
    gap: 10,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  sectionTitle: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 3,
  },
  breakdownItem: {
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  breakdownLabel: {
    color: Colors.text,
    fontSize: 11,
    fontWeight: '500' as const,
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: '900' as const,
    fontFamily: MONO_FONT,
  },
  barBg: {
    height: 8,
    backgroundColor: Colors.border,
  },
  barFill: {
    height: 8,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 16,
    marginHorizontal: 20,
  },
  statGrid: {
    paddingHorizontal: 20,
    gap: 1,
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
    fontSize: 28,
    fontWeight: '900' as const,
    lineHeight: 32,
    fontFamily: MONO_FONT,
  },
  statKey: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '700' as const,
    letterSpacing: 1,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  socraCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
    padding: 20,
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
  socraQuote: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '500' as const,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: Colors.dangerDim,
    borderWidth: 1,
    borderColor: Colors.danger,
    padding: 14,
  },
  alertText: {
    color: Colors.danger,
    fontSize: 11,
    fontWeight: '800' as const,
    letterSpacing: 1,
    flex: 1,
  },
  streakRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 6,
    marginTop: 8,
  },
  streakDay: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  streakDayText: {
    fontSize: 11,
    fontWeight: '900' as const,
    letterSpacing: 1,
  },
  streakLabel: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '700' as const,
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 8,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  quickCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  quickCardAccent: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentDim,
  },
  quickLabel: {
    color: Colors.textSecondary,
    fontSize: 9,
    fontWeight: '800' as const,
    letterSpacing: 1,
    flex: 1,
  },
  quickLabelAccent: {
    color: Colors.accent,
  },
  navRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    marginTop: 4,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 14,
  },
  navButtonText: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '800' as const,
    letterSpacing: 2,
  },
  bottomRow: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 14,
  },
});
