import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Lock, Check, Plus, ShieldAlert, Camera, Mic } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/providers/AppProvider';
import Colors from '@/constants/colors';
import { formatTimestamp, formatDeadline } from '@/utils/helpers';

export default function VaultScreen() {
  const { commitments, addCommitment, submitProof, isLoading } = useApp();
  const [showAdd, setShowAdd] = useState<boolean>(false);
  const [newDecision, setNewDecision] = useState<string>('');
  const [proofInputs, setProofInputs] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const addAnim = useRef(new Animated.Value(0)).current;

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  const toggleAdd = () => {
    const toValue = showAdd ? 0 : 1;
    Animated.spring(addAnim, { toValue, tension: 80, friction: 10, useNativeDriver: false }).start();
    setShowAdd(!showAdd);
  };

  const handleAdd = async () => {
    if (!newDecision.trim()) return;
    await addCommitment({ decision: newDecision.trim(), source: 'manual' });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setNewDecision('');
    setShowAdd(false);
    addAnim.setValue(0);
  };

  const handleProof = async (id: string) => {
    const proof = proofInputs[id];
    if (!proof?.trim()) return;
    await submitProof({ id, proof: proof.trim() });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setProofInputs((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setExpandedId(null);
  };

  const pending = commitments.filter((c) => !c.proofSubmitted && !c.shamed);
  const completed = commitments.filter((c) => c.proofSubmitted);
  const shamed = commitments.filter((c) => c.shamed);

  const addHeight = addAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 180],
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>COMMITMENT VAULT</Text>
          <Text style={styles.headerSub}>LOCKED DECISIONS. PROOF REQUIRED. NO MERCY.</Text>
        </View>
        <View style={styles.headerDivider} />

        <View style={styles.body}>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={[styles.statVal, { color: Colors.accent }]}>{completed.length}</Text>
              <Text style={styles.statKey}>Kept</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statVal, { color: Colors.danger }]}>{shamed.length}</Text>
              <Text style={styles.statKey}>Overdue</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{pending.length}</Text>
              <Text style={styles.statKey}>Pending</Text>
            </View>
          </View>

          {pending.map((c) => {
            const isExpanded = expandedId === c.id;
            const isOverdue = c.deadline < Date.now();
            return (
              <TouchableOpacity
                key={c.id}
                style={styles.vaultItem}
                onPress={() => setExpandedId(isExpanded ? null : c.id)}
                activeOpacity={0.7}
              >
                <View style={styles.itemTop}>
                  <View
                    style={[
                      styles.statusBadge,
                      isOverdue ? styles.statusOverdue : styles.statusPending,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        isOverdue ? styles.statusTextOverdue : styles.statusTextPending,
                      ]}
                    >
                      {isOverdue ? 'OVERDUE' : 'PENDING'}
                    </Text>
                  </View>
                  {isOverdue && (
                    <Text style={styles.shameNote}>🔴 SHAME NOTE POSTED</Text>
                  )}
                </View>
                <Text style={styles.commitmentText}>{c.decision}</Text>
                <Text style={styles.commitmentMeta}>
                  Locked: {formatTimestamp(c.timestamp)} · Due: {formatDeadline(c.deadline)}
                </Text>

                {isExpanded && (
                  <View style={styles.proofSection}>
                    <Text style={styles.proveLabel}>PROVE IT:</Text>
                    <View style={styles.proofButtons}>
                      <TouchableOpacity style={styles.proofTypeBtn} activeOpacity={0.7}>
                        <Camera color={Colors.text} size={14} />
                        <Text style={styles.proofTypeBtnText}>PHOTO</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.proofTypeBtn} activeOpacity={0.7}>
                        <Text style={styles.proofTypeBtnText}>✍ TEXT</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.proofTypeBtn} activeOpacity={0.7}>
                        <Mic color={Colors.text} size={14} />
                        <Text style={styles.proofTypeBtnText}>VOICE</Text>
                      </TouchableOpacity>
                    </View>
                    <TextInput
                      style={styles.proofInput}
                      placeholder="Describe what you did..."
                      placeholderTextColor={Colors.textMuted}
                      value={proofInputs[c.id] || ''}
                      onChangeText={(val) =>
                        setProofInputs((prev) => ({ ...prev, [c.id]: val }))
                      }
                      multiline
                      textAlignVertical="top"
                    />
                    <TouchableOpacity
                      style={[styles.submitBtn, !(proofInputs[c.id]?.trim()) && styles.submitBtnDisabled]}
                      onPress={() => handleProof(c.id)}
                      disabled={!(proofInputs[c.id]?.trim())}
                      activeOpacity={0.7}
                    >
                      <Check color={Colors.bg} size={14} />
                      <Text style={styles.submitBtnText}>SUBMIT PROOF</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}

          {completed.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionLine} />
                <Text style={styles.sectionLabel}>PROVEN — {completed.length}</Text>
                <View style={styles.sectionLine} />
              </View>
              {completed.map((c) => (
                <View key={c.id} style={styles.completedItem}>
                  <View style={styles.completedHeader}>
                    <View style={styles.statusDone}>
                      <Text style={styles.statusTextDone}>DONE</Text>
                    </View>
                    <Text style={styles.commitmentMeta}>{formatTimestamp(c.timestamp)}</Text>
                  </View>
                  <Text style={styles.completedText}>{c.decision}</Text>
                  {c.proofText && (
                    <Text style={styles.proofEvidence}>✓ Proof submitted: {c.proofText}</Text>
                  )}
                </View>
              ))}
            </>
          )}

          {shamed.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionLine} />
                <Text style={[styles.sectionLabel, { color: Colors.danger }]}>
                  WALL OF SHAME — {shamed.length}
                </Text>
                <View style={styles.sectionLine} />
              </View>
              {shamed.map((c) => (
                <View key={c.id} style={styles.shamedItem}>
                  <ShieldAlert color={Colors.danger} size={16} />
                  <Text style={styles.shamedText}>{c.decision}</Text>
                  <Text style={styles.shamedLabel}>NO ACTION TAKEN</Text>
                </View>
              ))}
            </>
          )}

          <Animated.View style={[styles.addSection, { maxHeight: addHeight, overflow: 'hidden' }]}>
            <TextInput
              style={styles.addInput}
              placeholder="What are you committing to?"
              placeholderTextColor={Colors.textMuted}
              value={newDecision}
              onChangeText={setNewDecision}
              multiline
              textAlignVertical="top"
              testID="vault-decision-input"
            />
            <TouchableOpacity
              style={[styles.lockBtn, !newDecision.trim() && styles.lockBtnDisabled]}
              onPress={handleAdd}
              disabled={!newDecision.trim()}
              activeOpacity={0.7}
            >
              <Lock color={Colors.bg} size={14} />
              <Text style={styles.lockBtnText}>LOCK IT IN</Text>
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity
            style={styles.addManualBtn}
            onPress={toggleAdd}
            activeOpacity={0.7}
            testID="vault-add"
          >
            <Text style={styles.addManualBtnText}>+ ADD MANUAL COMMITMENT</Text>
          </TouchableOpacity>

          {commitments.length === 0 && (
            <View style={styles.emptyState}>
              <Lock color={Colors.textMuted} size={40} />
              <Text style={styles.emptyTitle}>VAULT IS EMPTY</Text>
              <Text style={styles.emptyDesc}>
                Make a decision in the Drain or Tribunal to lock it here.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
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
    marginTop: 4,
  },
  headerDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  body: {
    padding: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 1,
    marginBottom: 16,
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
  },
  statKey: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '700' as const,
    letterSpacing: 1,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  vaultItem: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 10,
  },
  itemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusPending: {
    backgroundColor: Colors.border,
  },
  statusOverdue: {
    backgroundColor: Colors.danger,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800' as const,
    letterSpacing: 2,
  },
  statusTextPending: {
    color: Colors.textMuted,
  },
  statusTextOverdue: {
    color: Colors.text,
  },
  statusDone: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusTextDone: {
    color: Colors.bg,
    fontSize: 9,
    fontWeight: '800' as const,
    letterSpacing: 2,
  },
  shameNote: {
    color: Colors.danger,
    fontSize: 10,
    fontWeight: '700' as const,
  },
  commitmentText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '600' as const,
    lineHeight: 20,
    marginBottom: 4,
  },
  commitmentMeta: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '500' as const,
  },
  proofSection: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  proveLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 1,
    marginBottom: 8,
  },
  proofButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  proofTypeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 8,
  },
  proofTypeBtnText: {
    color: Colors.text,
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
  proofInput: {
    backgroundColor: Colors.bg3,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    fontSize: 13,
    fontWeight: '500' as const,
    padding: 12,
    minHeight: 60,
    marginBottom: 8,
  },
  submitBtn: {
    backgroundColor: Colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  submitBtnDisabled: {
    opacity: 0.4,
  },
  submitBtnText: {
    color: Colors.bg,
    fontSize: 11,
    fontWeight: '900' as const,
    letterSpacing: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
    marginTop: 16,
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
  completedItem: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.accentDim,
    padding: 16,
    marginBottom: 8,
  },
  completedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  completedText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600' as const,
    lineHeight: 18,
  },
  proofEvidence: {
    color: Colors.accent,
    fontSize: 10,
    fontWeight: '600' as const,
    marginTop: 6,
  },
  shamedItem: {
    backgroundColor: Colors.dangerDim,
    borderWidth: 1,
    borderColor: Colors.danger,
    padding: 16,
    marginBottom: 8,
    gap: 6,
  },
  shamedText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '600' as const,
  },
  shamedLabel: {
    color: Colors.danger,
    fontSize: 10,
    fontWeight: '800' as const,
    letterSpacing: 2,
  },
  addSection: {
    marginBottom: 8,
  },
  addInput: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    fontSize: 13,
    fontWeight: '500' as const,
    padding: 14,
    minHeight: 80,
    marginBottom: 8,
  },
  lockBtn: {
    backgroundColor: Colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  lockBtnDisabled: {
    opacity: 0.4,
  },
  lockBtnText: {
    color: Colors.bg,
    fontSize: 12,
    fontWeight: '900' as const,
    letterSpacing: 1,
  },
  addManualBtn: {
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  addManualBtnText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '800' as const,
    letterSpacing: 1,
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
  emptyDesc: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '500' as const,
    textAlign: 'center',
    maxWidth: 220,
  },
});
