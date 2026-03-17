import React, { useState, useEffect, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Stack } from 'expo-router';
import { Flame } from 'lucide-react-native';
import { useApp } from '@/providers/AppProvider';
import { getLeaderboard } from '@/services/leaderboard';
import { LeaderboardEntry } from '@/types';
import Colors from '@/constants/colors';

const LeaderboardRow = memo(function LeaderboardRow({
  entry,
  index,
}: {
  entry: LeaderboardEntry;
  index: number;
}) {
  return (
    <View style={[styles.row, entry.isYou && styles.rowYou]}>
      <Text style={[styles.rank, index < 3 && styles.rankTop]}>{index + 1}</Text>
      <View style={styles.infoCol}>
        <Text style={[styles.name, entry.isYou && styles.nameYou]}>
          {entry.isYou ? '► YOU' : entry.name}
        </Text>
        <View style={styles.streakRow}>
          {(entry.streak || 0) > 0 ? (
            <>
              <Flame color={Colors.warning} size={10} />
              <Text style={styles.streakText}>{entry.streak}d streak</Text>
            </>
          ) : (
            <Text style={styles.streakText}>no streak</Text>
          )}
        </View>
      </View>
      <View style={styles.scoreCol}>
        <Text style={[styles.score, index < 3 && styles.scoreTop]}>{entry.score}</Text>
        <Text style={styles.acts}>{entry.actionsTaken} acts</Text>
      </View>
    </View>
  );
});

export default function LeaderboardScreen() {
  const { stats, deviceId } = useApp();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!deviceId) return;
    (async () => {
      try {
        const { entries: leaderEntries } = await getLeaderboard(deviceId);
        setEntries(leaderEntries);
      } catch {
        setEntries([
          {
            id: deviceId,
            name: 'you',
            score: stats.chamberScore,
            actionsTaken: stats.totalDrains + stats.totalTribunals,
            avgResponseTime: '',
            rank: 1,
            streak: stats.currentStreak,
            isYou: true,
          },
        ]);
      } finally {
        setLoading(false);
      }
    })();
  }, [deviceId, stats.chamberScore]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Stack.Screen options={{ title: 'LEADERBOARD' }} />
        <ActivityIndicator color={Colors.accent} size="large" />
        <Text style={styles.loadingText}>LOADING RANKINGS...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'LEADERBOARD' }} />
      <FlatList
        style={styles.container}
        contentContainerStyle={styles.content}
        data={entries}
        keyExtractor={(item, index) => item.id + index}
        renderItem={({ item, index }) => (
          <LeaderboardRow entry={item} index={index} />
        )}
        ListHeaderComponent={
          <>
            <View style={styles.rankingInfo}>
              <Text style={styles.rankingInfoLabel}>HOW RANKING WORKS</Text>
              <Text style={styles.rankingInfoText}>
                Speed from thought → action (40%) · Commitments kept (35%) · Loop breaks (15%) · Streak (10%)
              </Text>
              <Text style={styles.rankingInfoAccent}>Smart ideas don't count. Only done things.</Text>
            </View>

            {entries.length > 0 && (
              <View style={styles.colHeaders}>
                <Text style={[styles.colHeader, { width: 46 }]}>RANK</Text>
                <Text style={[styles.colHeader, { flex: 1 }]}>HANDLE</Text>
                <Text style={[styles.colHeader, { width: 60, textAlign: 'right' as const }]}>SCORE</Text>
                <Text style={[styles.colHeader, { width: 50, textAlign: 'right' as const }]}>ACTS</Text>
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>NO RANKINGS YET</Text>
            <Text style={styles.emptyText}>
              Start draining thoughts and keeping commitments to appear on the leaderboard.
            </Text>
          </View>
        }
        ListFooterComponent={
          <>
            <View style={styles.divider} />
            <Text style={styles.footerText}>ANONYMOUS RANKINGS · DEVICE-BASED</Text>
            <Text style={styles.footerAccent}>ACTIONS SPEAK LOUDER THAN ANALYSIS</Text>
          </>
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingText: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 2,
    marginTop: 12,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '900' as const,
    letterSpacing: 2,
    marginBottom: 8,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '500' as const,
    textAlign: 'center',
    lineHeight: 18,
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
