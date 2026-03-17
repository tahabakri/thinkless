import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Send, Trash2, Sparkles, Shield, Skull as SkullIcon, Timer, Smile } from 'lucide-react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import AnimatedPressable from '@/components/AnimatedPressable';
import ThemedBottomSheet from '@/components/ThemedBottomSheet';
import { SkeletonCard } from '@/components/SkeletonLoader';
import { useApp } from '@/providers/AppProvider';
import Colors from '@/constants/colors';
import { SocraPersonality } from '@/types';
import { haptic } from '@/utils/haptics';

interface PersonalityOption {
  id: SocraPersonality;
  label: string;
  desc: string;
}

const PERSONALITIES: PersonalityOption[] = [
  { id: 'default', label: 'DEFAULT', desc: 'Blunt, warm, zero-tolerance' },
  { id: 'drill_sergeant', label: 'DRILL SERGEANT', desc: 'Maximum harsh. No mercy.' },
  { id: 'stoic', label: 'STOIC', desc: 'Marcus Aurelius vibes' },
  { id: 'dark_humor', label: 'DARK HUMOR', desc: 'Roasts you into action' },
  { id: 'deadline', label: 'DEADLINE', desc: 'Everything is a countdown' },
];

export default function ChatScreen() {
  const {
    chatMessages, sendChat, isChatPending, clearChat,
    personality, setPersonalityMode, isLoading,
  } = useApp();
  const [text, setText] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);

  useEffect(() => {
    if (chatMessages.length > 0) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [chatMessages.length]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.bg, padding: 20, paddingTop: 60 }}>
        <SkeletonCard lines={2} />
        <View style={{ height: 12 }} />
        <SkeletonCard lines={3} />
      </View>
    );
  }

  const handleSend = async () => {
    if (!text.trim() || isChatPending) return;
    haptic.light();
    const msg = text.trim();
    setText('');
    await sendChat(msg);
  };

  const handleClear = async () => {
    haptic.warning();
    await clearChat();
  };

  const handleSetPersonality = async (mode: SocraPersonality) => {
    haptic.selection();
    await setPersonalityMode(mode);
    bottomSheetRef.current?.close();
  };

  const getPersonalityIcon = useCallback(() => {
    switch (personality) {
      case 'drill_sergeant': return <Shield color={Colors.accent} size={14} />;
      case 'stoic': return <Sparkles color={Colors.accent} size={14} />;
      case 'dark_humor': return <Smile color={Colors.accent} size={14} />;
      case 'deadline': return <Timer color={Colors.accent} size={14} />;
      default: return <Sparkles color={Colors.textMuted} size={14} />;
    }
  }, [personality]);

  const currentPersonality = PERSONALITIES.find((p) => p.id === personality);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <View style={styles.topBar}>
        <AnimatedPressable
          style={styles.personalityButton}
          onPress={() => bottomSheetRef.current?.snapToIndex(0)}
        >
          {getPersonalityIcon()}
          <Text style={styles.personalityLabel}>
            {currentPersonality?.label || 'DEFAULT'}
          </Text>
        </AnimatedPressable>
        <View style={{ flex: 1 }} />
        {chatMessages.length > 0 && (
          <AnimatedPressable style={styles.clearButton} onPress={handleClear} haptic="medium">
            <Trash2 color={Colors.textMuted} size={14} />
            <Text style={styles.clearText}>CLEAR</Text>
          </AnimatedPressable>
        )}
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.messageList}
        contentContainerStyle={styles.messageContent}
      >
        {chatMessages.length === 0 && (
          <View style={styles.emptyChat}>
            <Text style={styles.socraIntro}>SOCRA</Text>
            <View style={styles.introDivider} />
            <Text style={styles.socraTagline}>
              {personality === 'default' && 'Blunt. Warm. Zero tolerance for avoidance.'}
              {personality === 'drill_sergeant' && 'DROP AND GIVE ME A DECISION.'}
              {personality === 'stoic' && 'The impediment to action advances action.'}
              {personality === 'dark_humor' && "Let's roast your overthinking into submission."}
              {personality === 'deadline' && 'The clock is ticking. Always.'}
            </Text>
            <Text style={styles.socraHint}>
              Tell me what you're stuck on. I won't validate your spiral — I'll break it.
            </Text>

            <View style={styles.quickStarters}>
              {[
                "I can't decide whether to...",
                "I keep going back to...",
                "I'm stuck on...",
              ].map((starter, i) => (
                <AnimatedPressable
                  key={i}
                  style={styles.starterChip}
                  onPress={() => setText(starter)}
                >
                  <Text style={styles.starterText}>{starter}</Text>
                </AnimatedPressable>
              ))}
            </View>
          </View>
        )}

        {chatMessages.map((msg, index) => (
          <Animated.View
            key={msg.id}
            entering={FadeInDown.delay(50).duration(300)}
          >
            <View
              style={[
                styles.messageBubble,
                msg.role === 'user' ? styles.userBubble : styles.socraBubble,
              ]}
            >
              {msg.role === 'socra' && (
                <View style={styles.socraTagRow}>
                  <Text style={styles.socraLabel}>SOCRA</Text>
                  {personality !== 'default' && (
                    <Text style={styles.modeTag}>{currentPersonality?.label}</Text>
                  )}
                  <View style={styles.socraTagLine} />
                </View>
              )}
              <Text
                style={[
                  styles.messageText,
                  msg.role === 'user' ? styles.userText : styles.socraText,
                ]}
              >
                {msg.text}
              </Text>
            </View>
          </Animated.View>
        ))}

        {isChatPending && (
          <Animated.View entering={FadeIn}>
            <View style={[styles.messageBubble, styles.socraBubble]}>
              <View style={styles.socraTagRow}>
                <Text style={styles.socraLabel}>SOCRA</Text>
                <View style={styles.socraTagLine} />
              </View>
              <Text style={styles.typingDots}>. . .</Text>
            </View>
          </Animated.View>
        )}
      </ScrollView>

      <View style={styles.inputBar}>
        <TextInput
          style={styles.chatInput}
          placeholder="What's on your mind?"
          placeholderTextColor={Colors.textMuted}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={1000}
          testID="chat-input"
        />
        <AnimatedPressable
          style={[styles.sendButton, (!text.trim() || isChatPending) && styles.sendDisabled]}
          onPress={handleSend}
          haptic="medium"
          disabled={!text.trim() || isChatPending}
        >
          <Send color={Colors.bg} size={18} />
        </AnimatedPressable>
      </View>

      <ThemedBottomSheet
        ref={bottomSheetRef}
        title="SOCRA MODES"
        snapPoints={['55%']}
      >
        <Text style={styles.modalSub}>Choose your coach style.</Text>
        {PERSONALITIES.map((p) => {
          const isActive = personality === p.id;
          return (
            <AnimatedPressable
              key={p.id}
              style={[styles.modeCard, isActive && styles.modeCardActive]}
              onPress={() => handleSetPersonality(p.id)}
            >
              <View style={styles.modeHeader}>
                <Text style={[styles.modeLabel, isActive && styles.modeLabelActive]}>
                  {p.label}
                </Text>
                {isActive && <Text style={styles.activeTag}>ACTIVE</Text>}
              </View>
              <Text style={styles.modeDesc}>{p.desc}</Text>
            </AnimatedPressable>
          );
        })}
      </ThemedBottomSheet>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  personalityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  personalityLabel: {
    color: Colors.textSecondary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearText: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  messageList: {
    flex: 1,
  },
  messageContent: {
    padding: 16,
    paddingBottom: 8,
  },
  emptyChat: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  socraIntro: {
    color: Colors.accent,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 6,
    marginBottom: 12,
  },
  introDivider: {
    width: 40,
    height: 2,
    backgroundColor: Colors.accent,
    marginBottom: 16,
  },
  socraTagline: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  socraHint: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
    marginBottom: 20,
  },
  quickStarters: {
    gap: 8,
    width: '100%',
  },
  starterChip: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  starterText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 14,
    marginBottom: 8,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  socraBubble: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
  },
  socraTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  socraLabel: {
    color: Colors.accent,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 3,
  },
  modeTag: {
    color: Colors.textMuted,
    fontSize: 7,
    fontWeight: '700',
    letterSpacing: 1,
    backgroundColor: Colors.bg3,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  socraTagLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.accent,
    opacity: 0.3,
  },
  messageText: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  userText: {
    color: Colors.text,
  },
  socraText: {
    color: Colors.text,
    fontWeight: '600',
  },
  typingDots: {
    color: Colors.accent,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 4,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.bg,
    gap: 8,
  },
  chatInput: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    fontSize: 14,
    fontWeight: '500',
    padding: 12,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: Colors.accent,
    padding: 12,
  },
  sendDisabled: {
    backgroundColor: Colors.textMuted,
    opacity: 0.4,
  },
  modalSub: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 16,
  },
  modeCard: {
    backgroundColor: Colors.bg3,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 8,
  },
  modeCardActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentDim,
  },
  modeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  modeLabel: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  modeLabelActive: {
    color: Colors.accent,
  },
  activeTag: {
    color: Colors.accent,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  modeDesc: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '500',
  },
});
