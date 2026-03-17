import React, { memo, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Stack } from 'expo-router';
import { Skull, Ban, CircleOff } from 'lucide-react-native';
import { useApp } from '@/providers/AppProvider';
import Colors from '@/constants/colors';
import { formatTimestamp } from '@/utils/helpers';

interface GraveyardListEntry {
  id: string;
  type: 'broken_commitment' | 'unresolved_loop' | 'unmade_decision';
  description: string;
  timestamp: number;
}

function getTypeIcon(type: string) {
  switch (type) {
    case 'broken_commitment':
      return <Ban color={Colors.danger} size={16} />;
    case 'unresolved_loop':
      return <CircleOff color={Colors.warning} size={16} />;
    default:
      return <Skull color={Colors.textMuted} size={16} />;
  }
}

function getTypeLabel(type: string): string {
  switch (type) {
    case 'broken_commitment':
      return 'BROKEN COMMITMENT';
    case 'unresolved_loop':
      return 'UNRESOLVED LOOP';
    case 'unmade_decision':
      return 'UNMADE DECISION';
    default:
      return 'BURIED';
  }
}

function getTypeLabelColor(type: string): string {
  switch (type) {
    case 'broken_commitment':
      return Colors.danger;
    case 'unresolved_loop':
      return Colors.warning;
    default:
      return Colors.textMuted;
  }
}

const GravestoneItem = memo(function GravestoneItem({
  entry,
}: {
  entry: GraveyardListEntry;
}) {
  return (
    <View style={styles.gravestone}>
      <View style={styles.gravestoneHeader}>
        {getTypeIcon(entry.type)}
        <Text style={[styles.gravestoneType, { color: getTypeLabelColor(entry.type) }]}>
          {getTypeLabel(entry.type)}
        </Text>
        <Text style={styles.gravestoneTime}>{formatTimestamp(entry.timestamp)}</Text>
      </View>
      <Text style={styles.gravestoneText}>{entry.description}</Text>
      <View style={styles.gravestoneLine} />
      <Text style={styles.epitaph}>
        {entry.type === 'broken_commitment'
          ? 'No action taken. No proof submitted.'
          : entry.type === 'unresolved_loop'
          ? 'Circled endlessly. Never resolved.'
          : 'Time ran out. Decision unmade.'}
      </Text>
    </View>
  );
});

export default function GraveyardScreen() {
  const { graveyard, commitments, isLoading } = useApp();

  const allEntries = useMemo(() => {
    const brokenCommitments = commitments.filter((c) => c.shamed);
    return [
      ...graveyard,
      ...brokenCommitments.map((c) => ({
        id: c.id,
        type: 'broken_commitment' as const,
        description: c.decision,
        timestamp: c.timestamp,
      })),
    ].sort((a, b) => b.timestamp - a.timestamp);
  }, [graveyard, commitments]);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Stack.Screen options={{ title: 'THE GRAVEYARD' }} />
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'THE GRAVEYARD' }} />
      <FlatList
        style={styles.container}
        contentContainerStyle={styles.content}
        data={allEntries}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({ item }) => <GravestoneItem entry={item} />}
        ListHeaderComponent={
          <>
            <View style={styles.headerCard}>
              <Skull color={Colors.danger} size={24} />
              <Text style={styles.headerTitle}>THE GRAVEYARD</Text>
              <Text style={styles.headerSub}>
                Every commitment you broke. Every loop you never escaped.{'\n'}
                Every decision you never made. With timestamps.
              </Text>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={[styles.statVal, { color: Colors.danger }]}>
                  {allEntries.filter((e) => e.type === 'broken_commitment').length}
                </Text>
                <Text style={styles.statKey}>Broken</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statVal, { color: Colors.warning }]}>
                  {allEntries.filter((e) => e.type === 'unresolved_loop').length}
                </Text>
                <Text style={styles.statKey}>Unresolved</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statVal}>
                  {allEntries.filter((e) => e.type === 'unmade_decision').length}
                </Text>
                <Text style={styles.statKey}>Unmade</Text>
              </View>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Skull color={Colors.border} size={48} />
            <Text style={styles.emptyTitle}>GRAVEYARD IS EMPTY</Text>
            <Text style={styles.emptySub}>
              Good. Keep it that way. Every broken commitment and unmade decision ends up here.
            </Text>
          </View>
        }
        ListFooterComponent={
          allEntries.length > 0 ? (
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {allEntries.length} {allEntries.length === 1 ? 'FAILURE' : 'FAILURES'} BURIED HERE
              </Text>
              <Text style={styles.footerSub}>
                The only way out is through. Stop adding to the pile.
              </Text>
            </View>
          ) : null
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
    padding: 20,
    paddingBottom: 40,
  },
  headerCard: {
    backgroundColor: Colors.dangerDim,
    borderWidth: 1,
    borderColor: Colors.danger,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  headerTitle: {
    color: Colors.danger,
    fontSize: 22,
    fontWeight: '900' as const,
    letterSpacing: 3,
  },
  headerSub: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '500' as const,
    textAlign: 'center',
    lineHeight: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 1,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    padding: 14,
    alignItems: 'center',
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
  },
  gravestone: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderTopWidth: 3,
    borderTopColor: Colors.danger,
    padding: 16,
    marginBottom: 10,
  },
  gravestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  gravestoneType: {
    fontSize: 9,
    fontWeight: '800' as const,
    letterSpacing: 2,
    flex: 1,
  },
  gravestoneTime: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '600' as const,
    letterSpacing: 1,
  },
  gravestoneText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
  gravestoneLine: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 10,
  },
  epitaph: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '500' as const,
    fontStyle: 'italic',
    letterSpacing: 0.5,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 4,
  },
  footerText: {
    color: Colors.danger,
    fontSize: 11,
    fontWeight: '800' as const,
    letterSpacing: 2,
  },
  footerSub: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '500' as const,
  },
});
