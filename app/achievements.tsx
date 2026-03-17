import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useApp } from '@/providers/AppProvider';
import Badge, { BadgeType } from '@/components/Badge';
import achievements from '@/constants/achievements';
import Colors, { MONO_FONT } from '@/constants/colors';

const ALL_BADGES: BadgeType[] = achievements.map((a) => a.id);

export default function AchievementsScreen() {
  const { unlockedBadges, stats, chatMessages, drains } = useApp();

  const unlockedCount = unlockedBadges.length;
  const totalCount = ALL_BADGES.length;
  const progress = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.progressSection}>
        <Text style={styles.progressTitle}>BADGES UNLOCKED</Text>
        <Text style={styles.progressCount}>
          {unlockedCount}/{totalCount}
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      <View style={styles.badgeGrid}>
        {ALL_BADGES.map((id, index) => {
          const unlocked = unlockedBadges.includes(id);
          return (
            <Animated.View
              key={id}
              entering={FadeInDown.delay(index * 80).duration(400)}
              style={styles.badgeWrap}
            >
              <Badge
                type={id}
                unlocked={unlocked}
                size="large"
                animated={unlocked}
              />
            </Animated.View>
          );
        })}
      </View>

      <View style={styles.statsSection}>
        <Text style={styles.statsTitle}>YOUR STATS</Text>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Total Drains</Text>
          <Text style={styles.statValue}>{stats.totalDrains}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Total Tribunals</Text>
          <Text style={styles.statValue}>{stats.totalTribunals}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Commitments Kept</Text>
          <Text style={styles.statValue}>{stats.commitmentsKept}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Current Streak</Text>
          <Text style={styles.statValue}>{stats.currentStreak}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Chat Messages</Text>
          <Text style={styles.statValue}>{chatMessages.length}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Loops Broken</Text>
          <Text style={styles.statValue}>{drains.filter((d) => d.resolved).length}</Text>
        </View>
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
    padding: 20,
    paddingBottom: 40,
  },
  progressSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  progressTitle: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: 8,
  },
  progressCount: {
    color: Colors.accent,
    fontSize: 36,
    fontWeight: '900',
    fontFamily: MONO_FONT,
    marginBottom: 12,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
  },
  progressFill: {
    height: 6,
    backgroundColor: Colors.accent,
    borderRadius: 3,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 32,
  },
  badgeWrap: {
    width: 100,
    alignItems: 'center',
  },
  statsSection: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
  },
  statsTitle: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  statValue: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '900',
    fontFamily: MONO_FONT,
  },
});
