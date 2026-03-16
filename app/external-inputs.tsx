import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack } from 'expo-router';
import { BookOpen, MessageCircle, FileText, Headphones, Plus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/providers/AppProvider';
import Colors from '@/constants/colors';
import { ExternalInput } from '@/types';
import { formatTimestamp } from '@/utils/helpers';

const INPUT_TYPES: { type: ExternalInput['type']; label: string; icon: string }[] = [
  { type: 'book', label: 'BOOK', icon: '📖' },
  { type: 'conversation', label: 'CONVO', icon: '💬' },
  { type: 'article', label: 'ARTICLE', icon: '📰' },
  { type: 'therapy', label: 'THERAPY', icon: '🧠' },
  { type: 'podcast', label: 'PODCAST', icon: '🎧' },
  { type: 'other', label: 'OTHER', icon: '📌' },
];

export default function ExternalInputsScreen() {
  const { externalInputs, addExternalInput, todayExternalInputs } = useApp();
  const [selectedType, setSelectedType] = useState<ExternalInput['type']>('book');
  const [description, setDescription] = useState<string>('');
  const [showAdd, setShowAdd] = useState<boolean>(false);

  const handleAdd = async () => {
    if (!description.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await addExternalInput({ type: selectedType, description: description.trim() });
    setDescription('');
    setShowAdd(false);
  };

  const todayCount = todayExternalInputs.length;
  const weekCount = externalInputs.filter(
    (e) => e.timestamp > Date.now() - 7 * 86400000
  ).length;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Stack.Screen options={{ title: 'EXTERNAL INPUTS' }} />

        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>INPUT TRACKER</Text>
          <Text style={styles.headerSub}>
            Log what you consumed vs how much you ruminated.{'\n'}
            External input breaks the echo chamber.
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={[styles.statVal, { color: Colors.accent }]}>{todayCount}</Text>
            <Text style={styles.statKey}>Today</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{weekCount}</Text>
            <Text style={styles.statKey}>This Week</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{externalInputs.length}</Text>
            <Text style={styles.statKey}>All Time</Text>
          </View>
        </View>

        {!showAdd ? (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              setShowAdd(true);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            activeOpacity={0.7}
          >
            <Plus color={Colors.bg} size={18} />
            <Text style={styles.addButtonText}>LOG EXTERNAL INPUT</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.addSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionLine} />
              <Text style={styles.sectionLabel}>WHAT DID YOU CONSUME?</Text>
              <View style={styles.sectionLine} />
            </View>

            <View style={styles.typeGrid}>
              {INPUT_TYPES.map((t) => (
                <TouchableOpacity
                  key={t.type}
                  style={[
                    styles.typeCard,
                    selectedType === t.type && styles.typeCardActive,
                  ]}
                  onPress={() => {
                    setSelectedType(t.type);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.typeIcon}>{t.icon}</Text>
                  <Text
                    style={[
                      styles.typeLabel,
                      selectedType === t.type && styles.typeLabelActive,
                    ]}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.descriptionInput}
              placeholder="What was it about? One sentence."
              placeholderTextColor={Colors.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
              testID="input-description"
            />

            <View style={styles.addActions}>
              <TouchableOpacity
                style={[styles.submitButton, !description.trim() && styles.buttonDisabled]}
                onPress={handleAdd}
                disabled={!description.trim()}
                activeOpacity={0.7}
              >
                <Text style={styles.submitButtonText}>LOG IT →</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowAdd(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>CANCEL</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {externalInputs.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionLine} />
              <Text style={styles.sectionLabel}>HISTORY</Text>
              <View style={styles.sectionLine} />
            </View>

            {externalInputs.slice(0, 20).map((input) => {
              const typeInfo = INPUT_TYPES.find((t) => t.type === input.type);
              return (
                <View key={input.id} style={styles.historyItem}>
                  <View style={styles.historyHeader}>
                    <Text style={styles.historyIcon}>{typeInfo?.icon || '📌'}</Text>
                    <Text style={styles.historyType}>{typeInfo?.label || 'OTHER'}</Text>
                    <Text style={styles.historyTime}>{formatTimestamp(input.timestamp)}</Text>
                  </View>
                  <Text style={styles.historyDesc}>{input.description}</Text>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
  headerCard: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
    padding: 20,
    marginBottom: 16,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '900' as const,
    letterSpacing: 2,
    marginBottom: 6,
  },
  headerSub: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '500' as const,
    lineHeight: 16,
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
  addButton: {
    backgroundColor: Colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    marginBottom: 20,
  },
  addButtonText: {
    color: Colors.bg,
    fontSize: 16,
    fontWeight: '900' as const,
    letterSpacing: 2,
  },
  addSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
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
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  typeCard: {
    width: '30%',
    flexGrow: 1,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 4,
  },
  typeCardActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentDim,
  },
  typeIcon: {
    fontSize: 18,
  },
  typeLabel: {
    color: Colors.textSecondary,
    fontSize: 9,
    fontWeight: '800' as const,
    letterSpacing: 1,
  },
  typeLabelActive: {
    color: Colors.accent,
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bg3,
    color: Colors.text,
    fontSize: 13,
    fontWeight: '500' as const,
    padding: 14,
    minHeight: 60,
    lineHeight: 20,
    marginBottom: 12,
  },
  addActions: {
    flexDirection: 'row',
    gap: 10,
  },
  submitButton: {
    flex: 1,
    backgroundColor: Colors.accent,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  submitButtonText: {
    color: Colors.bg,
    fontSize: 14,
    fontWeight: '900' as const,
    letterSpacing: 2,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '800' as const,
    letterSpacing: 2,
  },
  historyItem: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 8,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  historyIcon: {
    fontSize: 14,
  },
  historyType: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '800' as const,
    letterSpacing: 1,
    flex: 1,
  },
  historyTime: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '600' as const,
  },
  historyDesc: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 18,
  },
});
