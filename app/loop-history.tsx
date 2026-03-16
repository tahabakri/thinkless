import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Stack } from 'expo-router';
import { TrendingDown, TrendingUp } from 'lucide-react-native';
import { useApp } from '@/providers/AppProvider';
import Colors from '@/constants/colors';
import { formatTimestamp } from '@/utils/helpers';

export default function LoopHistoryScreen() {
  const { drains, stats } = useApp();

  const avgScore = drains.length > 0
    ? Math.round(drains.reduce((sum, d) => sum + d.loopScore, 0) / drains.length)
    : 0;

  const recentDrains = drains.slice(0, 20);

  const trend = recentDrains.length >= 2
    ? recentDrains[0].loopScore - recentDrains[recentDrains.length - 1].loopScore
    : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: 'LOOP HISTORY' }} />

      <View style={styles.overviewRow}>
        <View style={styles.overviewCard}>
          <Text style={[styles.overviewVal, { color: avgScore > 50 ? Colors.danger : Colors.accent }]}>
            {avgScore}
          </Text>
          <Text style={styles.overviewKey}>AVG LOOP SCORE</Text>
        </View>
        <View style={styles.overviewCard}>
          <View style={styles.trendRow}>
            {trend <= 0 ? (
              <TrendingDown color={Colors.accent} size={16} />
            ) : (
              <TrendingUp color={Colors.danger} size={16} />
            )}
            <Text style={[styles.overviewVal, { color: trend <= 0 ? Colors.accent : Colors.danger }]}>
              {trend <= 0 ? trend : `+${trend}`}
            </Text>
          </View>
          <Text style={styles.overviewKey}>TREND</Text>
        </View>
        <View style={styles.overviewCard}>
          <Text style={styles.overviewVal}>{drains.length}</Text>
          <Text style={styles.overviewKey}>TOTAL DRAINS</Text>
        </View>
      </View>

      {recentDrains.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>NO HISTORY YET</Text>
          <Text style={styles.emptySub}>
            Complete some Thought Drains to see your loop timeline.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionLine} />
            <Text style={styles.sectionLabel}>TIMELINE</Text>
            <View style={styles.sectionLine} />
          </View>

          {recentDrains.map((drain, index) => {
            const prevScore = index < recentDrains.length - 1
              ? recentDrains[index + 1].loopScore
              : drain.loopScore;
            const change = drain.loopScore - prevScore;
            const barWidth = Math.min(100, drain.loopScore);

            return (
              <View key={drain.id} style={styles.timelineItem}>
                <View style={styles.timelineDot}>
                  <View
                    style={[
                      styles.dot,
                      {
                        backgroundColor: drain.loopScore > 60
                          ? Colors.danger
                          : drain.loopScore > 40
                          ? Colors.warning
                          : Colors.accent,
                      },
                    ]}
                  />
                  {index < recentDrains.length - 1 && <View style={styles.timelineLine} />}
                </View>

                <View style={styles.timelineContent}>
                  <View style={styles.timelineHeader}>
                    <Text style={styles.timelineTime}>{formatTimestamp(drain.timestamp)}</Text>
                    <View style={styles.scoreAndChange}>
                      <Text
                        style={[
                          styles.timelineScore,
                          {
                            color: drain.loopScore > 60
                              ? Colors.danger
                              : drain.loopScore > 40
                              ? Colors.warning
                              : Colors.accent,
                          },
                        ]}
                      >
                        {drain.loopScore}
                      </Text>
                      {index < recentDrains.length - 1 && (
                        <Text
                          style={[
                            styles.changeText,
                            { color: change <= 0 ? Colors.accent : Colors.danger },
                          ]}
                        >
                          {change <= 0 ? `↓${Math.abs(change)}` : `↑${change}`}
                        </Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.loopBar}>
                    <View
                      style={[
                        styles.loopBarFill,
                        {
                          width: `${barWidth}%`,
                          backgroundColor: drain.loopScore > 60
                            ? Colors.danger
                            : drain.loopScore > 40
                            ? Colors.warning
                            : Colors.accent,
                        },
                      ]}
                    />
                  </View>

                  <Text style={styles.timelineText} numberOfLines={2}>
                    {drain.text}
                  </Text>

                  {drain.resolved && (
                    <Text style={styles.resolvedBadge}>✓ RESOLVED</Text>
                  )}
                </View>
              </View>
            );
          })}
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
  overviewRow: {
    flexDirection: 'row',
    gap: 1,
    marginBottom: 20,
  },
  overviewCard: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    padding: 14,
    alignItems: 'center',
  },
  overviewVal: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: '900' as const,
    lineHeight: 28,
  },
  overviewKey: {
    color: Colors.textMuted,
    fontSize: 8,
    fontWeight: '700' as const,
    letterSpacing: 1,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 8,
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
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  timelineDot: {
    width: 24,
    alignItems: 'center',
    paddingTop: 4,
  },
  dot: {
    width: 10,
    height: 10,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.border,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    marginLeft: 12,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 8,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timelineTime: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
  scoreAndChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timelineScore: {
    fontSize: 18,
    fontWeight: '900' as const,
  },
  changeText: {
    fontSize: 10,
    fontWeight: '700' as const,
  },
  loopBar: {
    height: 4,
    backgroundColor: Colors.border,
    marginBottom: 8,
  },
  loopBarFill: {
    height: 4,
  },
  timelineText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '500' as const,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  resolvedBadge: {
    color: Colors.accent,
    fontSize: 9,
    fontWeight: '800' as const,
    letterSpacing: 1,
    marginTop: 6,
  },
});
