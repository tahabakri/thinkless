import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Send, Trash2, Sparkles, Shield, Skull as SkullIcon, Timer, Smile } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/providers/AppProvider';
import Colors from '@/constants/colors';
import { SocraPersonality } from '@/types';

interface PersonalityOption {
  id: SocraPersonality;
  label: string;
  desc: string;
  pro: boolean;
}

const PERSONALITIES: PersonalityOption[] = [
  { id: 'default', label: 'DEFAULT', desc: 'Blunt, warm, zero-tolerance', pro: false },
  { id: 'drill_sergeant', label: 'DRILL SERGEANT', desc: 'Maximum harsh. No mercy.', pro: true },
  { id: 'stoic', label: 'STOIC', desc: 'Marcus Aurelius vibes', pro: true },
  { id: 'dark_humor', label: 'DARK HUMOR', desc: 'Roasts you into action', pro: true },
  { id: 'deadline', label: 'DEADLINE', desc: 'Everything is a countdown', pro: true },
];

export default function ChatScreen() {
  const {
    chatMessages, sendChat, isChatPending, clearChat,
    personality, setPersonalityMode, isPro, isLoading,
  } = useApp();
  const [text, setText] = useState<string>('');
  const [showPersonality, setShowPersonality] = useState<boolean>(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (chatMessages.length > 0) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [chatMessages.length]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  const handleSend = async () => {
    if (!text.trim() || isChatPending) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const msg = text.trim();
    setText('');
    await sendChat(msg);
  };

  const handleClear = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await clearChat();
  };

  const handleSetPersonality = async (mode: SocraPersonality) => {
    if (mode !== 'default' && !isPro) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await setPersonalityMode(mode);
    setShowPersonality(false);
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
        <TouchableOpacity
          style={styles.personalityButton}
          onPress={() => setShowPersonality(true)}
          activeOpacity={0.7}
        >
          {getPersonalityIcon()}
          <Text style={styles.personalityLabel}>
            {currentPersonality?.label || 'DEFAULT'}
          </Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        {chatMessages.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={handleClear} activeOpacity={0.7}>
            <Trash2 color={Colors.textMuted} size={14} />
            <Text style={styles.clearText}>CLEAR</Text>
          </TouchableOpacity>
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
                <TouchableOpacity
                  key={i}
                  style={styles.starterChip}
                  onPress={() => setText(starter)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.starterText}>{starter}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {chatMessages.map((msg) => (
          <View
            key={msg.id}
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
        ))}

        {isChatPending && (
          <View style={[styles.messageBubble, styles.socraBubble]}>
            <View style={styles.socraTagRow}>
              <Text style={styles.socraLabel}>SOCRA</Text>
              <View style={styles.socraTagLine} />
            </View>
            <ActivityIndicator color={Colors.accent} size="small" />
          </View>
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
        <TouchableOpacity
          style={[styles.sendButton, (!text.trim() || isChatPending) && styles.sendDisabled]}
          onPress={handleSend}
          disabled={!text.trim() || isChatPending}
          activeOpacity={0.7}
          testID="chat-send"
        >
          <Send color={Colors.bg} size={18} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={showPersonality}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPersonality(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPersonality(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>SOCRA MODES</Text>
            <Text style={styles.modalSub}>
              {isPro ? 'Choose your coach style.' : 'Default mode is free. Upgrade for more.'}
            </Text>

            {PERSONALITIES.map((p) => {
              const isActive = personality === p.id;
              const isLocked = p.pro && !isPro;
              return (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.modeCard,
                    isActive && styles.modeCardActive,
                    isLocked && styles.modeCardLocked,
                  ]}
                  onPress={() => !isLocked && handleSetPersonality(p.id)}
                  activeOpacity={isLocked ? 1 : 0.7}
                >
                  <View style={styles.modeHeader}>
                    <Text
                      style={[
                        styles.modeLabel,
                        isActive && styles.modeLabelActive,
                        isLocked && styles.modeLabelLocked,
                      ]}
                    >
                      {p.label}
                    </Text>
                    {isLocked && <Text style={styles.proTag}>PRO</Text>}
                    {isActive && <Text style={styles.activeTag}>ACTIVE</Text>}
                  </View>
                  <Text style={styles.modeDesc}>{p.desc}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
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
    fontWeight: '800' as const,
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
    fontWeight: '700' as const,
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
    fontWeight: '900' as const,
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
    fontWeight: '600' as const,
    textAlign: 'center',
    marginBottom: 16,
  },
  socraHint: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '500' as const,
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
    fontWeight: '600' as const,
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
    fontWeight: '900' as const,
    letterSpacing: 3,
  },
  modeTag: {
    color: Colors.textMuted,
    fontSize: 7,
    fontWeight: '700' as const,
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
    fontWeight: '500' as const,
    lineHeight: 20,
  },
  userText: {
    color: Colors.text,
  },
  socraText: {
    color: Colors.text,
    fontWeight: '600' as const,
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
    fontWeight: '500' as const,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.bgCard,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    padding: 20,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '900' as const,
    letterSpacing: 2,
    marginBottom: 4,
  },
  modalSub: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '500' as const,
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
  modeCardLocked: {
    opacity: 0.5,
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
    fontWeight: '800' as const,
    letterSpacing: 1,
  },
  modeLabelActive: {
    color: Colors.accent,
  },
  modeLabelLocked: {
    color: Colors.textMuted,
  },
  proTag: {
    color: Colors.bg,
    backgroundColor: Colors.accent,
    fontSize: 8,
    fontWeight: '900' as const,
    letterSpacing: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  activeTag: {
    color: Colors.accent,
    fontSize: 8,
    fontWeight: '900' as const,
    letterSpacing: 1,
  },
  modeDesc: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '500' as const,
  },
});
