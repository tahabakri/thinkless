import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Share,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Send, Copy, Link, UserPlus } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import * as Clipboard from 'expo-clipboard';
import AnimatedPressable from '@/components/AnimatedPressable';
import EmptyState from '@/components/EmptyState';
import { useApp } from '@/providers/AppProvider';
import Colors from '@/constants/colors';
import { haptic } from '@/utils/haptics';

export default function ShareCommitmentScreen() {
  const { commitments } = useApp();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [buddyName, setBuddyName] = useState('');

  const pending = commitments.filter((c) => !c.proofSubmitted && !c.shamed);
  const selected = pending.find((c) => c.id === selectedId);

  const shareText = selected
    ? `I locked a commitment in ThinkLess:\n\n"${selected.decision}"\n\nHold me accountable. If I don't follow through, call me out.`
    : '';

  const handleShare = async () => {
    if (!shareText) return;
    haptic.medium();
    try {
      await Share.share({
        message: shareText,
        title: 'ThinkLess Commitment',
      });
      Toast.show({
        type: 'success',
        text1: 'SHARED',
        text2: 'Your accountability buddy has been notified.',
      });
    } catch {}
  };

  const handleCopy = async () => {
    if (!shareText) return;
    await Clipboard.setStringAsync(shareText);
    haptic.success();
    Toast.show({
      type: 'success',
      text1: 'COPIED',
      text2: 'Commitment text copied to clipboard.',
    });
  };

  if (pending.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon={<UserPlus size={40} color={Colors.textMuted} />}
          title="NO PENDING COMMITMENTS"
          subtitle="Lock a decision first, then share it with a buddy."
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.intro}>
        Share a commitment with an accountability buddy. They'll know what you promised.
      </Text>

      {!selectedId ? (
        <View style={styles.list}>
          <Text style={styles.listLabel}>SELECT A COMMITMENT TO SHARE</Text>
          {pending.map((c, index) => (
            <Animated.View key={c.id} entering={FadeInDown.delay(index * 60)}>
              <AnimatedPressable
                style={styles.card}
                onPress={() => {
                  setSelectedId(c.id);
                  haptic.selection();
                }}
              >
                <Text style={styles.cardText}>{c.decision}</Text>
              </AnimatedPressable>
            </Animated.View>
          ))}
        </View>
      ) : (
        <Animated.View entering={FadeInDown} style={styles.shareForm}>
          <View style={styles.previewCard}>
            <Text style={styles.previewLabel}>COMMITMENT</Text>
            <Text style={styles.previewText}>{selected?.decision}</Text>
          </View>

          <TextInput
            style={styles.buddyInput}
            placeholder="Buddy's name (optional)"
            placeholderTextColor={Colors.textMuted}
            value={buddyName}
            onChangeText={setBuddyName}
          />

          <View style={styles.actions}>
            <AnimatedPressable style={styles.shareBtn} onPress={handleShare} haptic="medium">
              <Send size={18} color={Colors.bg} />
              <Text style={styles.shareBtnText}>SHARE</Text>
            </AnimatedPressable>
            <AnimatedPressable style={styles.copyBtn} onPress={handleCopy} haptic="light">
              <Copy size={18} color={Colors.text} />
              <Text style={styles.copyBtnText}>COPY</Text>
            </AnimatedPressable>
          </View>

          <AnimatedPressable
            style={styles.backBtn}
            onPress={() => {
              setSelectedId(null);
              setBuddyName('');
            }}
            haptic="light"
          >
            <Text style={styles.backBtnText}>BACK TO LIST</Text>
          </AnimatedPressable>
        </Animated.View>
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
  intro: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: 20,
  },
  list: {
    gap: 10,
  },
  listLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 4,
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
  },
  cardText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  shareForm: {
    gap: 16,
  },
  previewCard: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.accent,
    borderLeftWidth: 3,
    padding: 20,
  },
  previewLabel: {
    color: Colors.accent,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 8,
  },
  previewText: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
  },
  buddyInput: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    fontSize: 14,
    padding: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  shareBtn: {
    flex: 1,
    backgroundColor: Colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  shareBtnText: {
    color: Colors.bg,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  copyBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  copyBtnText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  backBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  backBtnText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
