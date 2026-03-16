import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Stack } from 'expo-router';
import { Zap, Flame } from 'lucide-react-native';
import { MOCK_LEADERBOARD } from '@/mocks/leaderboard';
import { useApp } from '@/providers/AppProvider';
import Colors from '@/constants/colors';

interface LeaderUser {
  name: string;
  score: number;
  actions: number;
  streak: number;
  you: boolean;
}

const USERS: LeaderUser[] = [
  { name: 'BreakingBad_Mo', score: 94, actions: 23, streak: 12, you: false },
  { name: 'ActionJax99', score: 76, actions: 18, streak: 3, you: false },
  { name: 'Thinker2Doer', score: 71, actions: 11, streak: 7, you: false },
  { name: 'LoopBreaker_K', score: 65, actions: 9, streak: 4, you: false },
  { name: 'PhilosophyNerd', score: 34, actions: 3, streak: 1, you: false },
  { name: 'PerpetualPlanner', score: 12, actions: 1, streak: 0, you: false },
];

export default function LeaderboardScreen() {
  const { stats } = useApp();

  const allUsers: LeaderUser[] = [
    USERS[0],
    { name: 'you', score: stats.chamberScore, actions: stats.totalDrains + stats.totalTribunals, streak: stats.currentStreak, you: true },
    ...USERS.slice(1),
  ].sort((a, b) => b.score - a.score);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: 'LEADERBOARD' }} />

      <View style={styles.rankingInfo}>
        <Text style={styles.rankingInfoLabel}>HOW RANKING WORKS</Text>
        <Text style={styles.rankingInfoText}>
          Speed from thought → action (40%) · Commitments kept (35%) · Loop breaks (15%) · Streak (10%)
        </Text>
        <Text style={styles.rankingInfoAccent}>Smart ideas don't count. Only done things.</Text>
      </View>

      <View style={styles.colHeaders}>
        <Text style={[styles.colHeader, { width: 46 }]}>RANK</Text>
        <Text style={[styles.colHeader, { flex: 1 }]}>HANDLE</Text>
        <Text style={[styles.colHeader, { width: 60, textAlign: 'right' as const }]}>SCORE</Text>
        <Text style={[styles.colHeader, { width: 50, textAlign: 'right' as const }]}>ACTS</Text>
      </View>

      {allUsers.map((u, i) => (
        <View
          key={u.name + i}
          style={[styles.row, u.you && styles.rowYou]}
        >
          <Text style={[styles.rank, i < 3 && styles.rankTop]}>{i + 1}</Text>
          <View style={styles.infoCol}>
            <Text style={[styles.name, u.you && styles.nameYou]}>
              {u.you ? '► YOU' : u.name}
            </Text>
            <View style={styles.streakRow}>
              {u.streak > 0 ? (
                <>
                  <Flame color={Colors.warning} size={10} />
                  <Text style={styles.streakText}>{u.streak}d streak</Text>
                </>
              ) : (
                <Text style={styles.streakText}>no streak</Text>
              )}
            </View>
          </View>
          <View style={styles.scoreCol}>
            <Text style={[styles.score, i < 3 && styles.scoreTop]}>{u.score}</Text>
            <Text style={styles.acts}>{u.actions} acts</Text>
          </View>
        </View>
      ))}

      <View style={styles.divider} />
      <Text style={styles.footerText}>TOP 3% OF ACTION-TAKERS THIS WEEK</Text>
      <Text style={styles.footerAccent}>BOTTOM 90% STUCK THEORIZING</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  rankingInfo: {
    backgroundColor: 'rgba(170,255,0,0.04)',
    borderWidth: 1,
    borderColor: Colors.accent,
    padding: 16,
    marginBottom: 16,
  },
  rankingInfoLabel: {
    color: Colors.accent,
    fontSize: 10,
    fontWeight: '800' as const,
    letterSpacing: 2,
    marginBottom: 6,
  },
  rankingInfoText: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '500' as const,
    lineHeight: 18,
  },
  rankingInfoAccent: {
    color: Colors.danger,
    fontSize: 11,
    fontWeight: '700' as const,
    marginTop: 4,
  },
  colHeaders: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  colHeader: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rowYou: {
    backgroundColor: 'rgba(170,255,0,0.04)',
    borderLeftWidth: 2,
    borderLeftColor: Colors.accent,
  },
  rank: {
    width: 30,
    color: Colors.textMuted,
    fontSize: 22,
    fontWeight: '900' as const,
  },
  rankTop: {
    color: Colors.accent,
  },
  infoCol: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '600' as const,
  },
  nameYou: {
    color: Colors.accent,
    fontWeight: '800' as const,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  streakText: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '600' as const,
  },
  scoreCol: {
    alignItems: 'flex-end',
  },
  score: {
    color: Colors.accent,
    fontSize: 20,
    fontWeight: '900' as const,
  },
  scoreTop: {
    color: Colors.accent,
  },
  acts: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '600' as const,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 16,
  },
  footerText: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 2,
    textAlign: 'center',
  },
  footerAccent: {
    color: Colors.accent,
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: 4,
  },
});
