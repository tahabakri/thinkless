import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { Bell, Clock, Trash2, Info, Moon, Sun, Monitor } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import AnimatedPressable from '@/components/AnimatedPressable';
import { useApp } from '@/providers/AppProvider';
import Colors, { ThemeMode } from '@/constants/colors';
import { haptic } from '@/utils/haptics';

const THEME_OPTIONS: { id: ThemeMode; label: string; desc: string; icon: React.ReactNode }[] = [
  { id: 'default', label: 'DEFAULT', desc: 'Dark with lime accent', icon: <Monitor color={Colors.textSecondary} size={16} /> },
  { id: 'oled', label: 'OLED BLACK', desc: 'True black for battery savings', icon: <Moon color={Colors.textSecondary} size={16} /> },
  { id: 'night', label: 'NIGHT', desc: 'Softer blue-tinted theme', icon: <Sun color={Colors.textSecondary} size={16} /> },
];

export default function SettingsScreen() {
  const {
    notificationEnabled,
    slapEnabled,
    slapFrequency,
    updateNotificationSettings,
    clearAllData,
    themeMode,
    changeTheme,
  } = useApp();

  const frequencies = [
    { id: 'aggressive' as const, label: 'AGGRESSIVE', desc: 'Every 2 hours' },
    { id: 'daily' as const, label: 'DAILY', desc: 'Once per day' },
    { id: 'gentle' as const, label: 'GENTLE', desc: 'Every 3 days' },
  ];

  const handleClearData = () => {
    Alert.alert(
      'CLEAR ALL DATA',
      'This will permanently delete all your drains, tribunals, commitments, and chat history. Your escape score will reset to 0. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            haptic.heavy();
            Toast.show({
              type: 'warning',
              text1: 'ALL DATA CLEARED',
              text2: 'Starting fresh. Make it count this time.',
            });
          },
        },
      ]
    );
  };

  const handleThemeChange = async (mode: ThemeMode) => {
    haptic.selection();
    await changeTheme(mode);
    Toast.show({
      type: 'success',
      text1: 'THEME UPDATED',
      text2: `Switched to ${mode.toUpperCase()} mode.`,
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: 'SETTINGS' }} />

      {/* Theme */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionLine} />
        <Text style={styles.sectionTitle}>THEME</Text>
        <View style={styles.sectionLine} />
      </View>

      <View style={styles.themeList}>
        {THEME_OPTIONS.map((t) => (
          <AnimatedPressable
            key={t.id}
            style={[
              styles.themeCard,
              themeMode === t.id && styles.themeCardActive,
            ]}
            onPress={() => handleThemeChange(t.id)}
          >
            {t.icon}
            <Text style={[styles.themeLabel, themeMode === t.id && styles.themeLabelActive]}>
              {t.label}
            </Text>
            <Text style={styles.themeDesc}>{t.desc}</Text>
          </AnimatedPressable>
        ))}
      </View>

      {/* Notifications */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionLine} />
        <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>
        <View style={styles.sectionLine} />
      </View>

      <View style={styles.settingCard}>
        <View style={styles.settingRow}>
          <Bell color={Colors.textSecondary} size={16} />
          <Text style={styles.settingLabel}>Push Notifications</Text>
          <Switch
            value={notificationEnabled}
            onValueChange={(val) => updateNotificationSettings({ notificationEnabled: val })}
            trackColor={{ false: Colors.bgElevated, true: Colors.accentDim }}
            thumbColor={notificationEnabled ? Colors.accent : Colors.textMuted}
          />
        </View>
        <View style={styles.divider} />
        <View style={styles.settingRow}>
          <Clock color={Colors.textSecondary} size={16} />
          <Text style={styles.settingLabel}>Socratic Slap</Text>
          <Switch
            value={slapEnabled}
            onValueChange={(val) => updateNotificationSettings({ slapEnabled: val })}
            trackColor={{ false: Colors.bgElevated, true: Colors.accentDim }}
            thumbColor={slapEnabled ? Colors.accent : Colors.textMuted}
          />
        </View>
      </View>

      {slapEnabled && (
        <>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionLine} />
            <Text style={styles.sectionTitle}>SLAP FREQUENCY</Text>
            <View style={styles.sectionLine} />
          </View>

          <View style={styles.frequencyList}>
            {frequencies.map((f) => (
              <AnimatedPressable
                key={f.id}
                style={[
                  styles.frequencyCard,
                  slapFrequency === f.id && styles.frequencyCardActive,
                ]}
                onPress={() => {
                  haptic.selection();
                  updateNotificationSettings({ slapFrequency: f.id });
                }}
              >
                <Text
                  style={[
                    styles.frequencyLabel,
                    slapFrequency === f.id && styles.frequencyLabelActive,
                  ]}
                >
                  {f.label}
                </Text>
                <Text style={styles.frequencyDesc}>{f.desc}</Text>
              </AnimatedPressable>
            ))}
          </View>
          <Text style={styles.slapNote}>
            The Socratic Slap interrupts your overthinking with a sharp question from Socra. Choose how often you want to be called out.
          </Text>
        </>
      )}

      {/* About */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionLine} />
        <Text style={styles.sectionTitle}>ABOUT</Text>
        <View style={styles.sectionLine} />
      </View>

      <View style={styles.settingCard}>
        <View style={styles.settingRow}>
          <Info color={Colors.textSecondary} size={16} />
          <Text style={styles.settingLabel}>Version</Text>
          <Text style={styles.settingValue}>1.1.0</Text>
        </View>
      </View>

      {/* Danger */}
      <View style={styles.dangerSection}>
        <AnimatedPressable style={styles.dangerButton} onPress={handleClearData} haptic="heavy">
          <Trash2 color={Colors.danger} size={16} />
          <Text style={styles.dangerText}>CLEAR ALL DATA</Text>
        </AnimatedPressable>
      </View>

      <Text style={styles.footer}>
        THINKLESS — Escape the Echo Chamber{'\n'}
        Built for overthinkers who are tired of thinking.
      </Text>
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
    marginTop: 4,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  sectionTitle: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 3,
  },
  themeList: {
    gap: 8,
    marginBottom: 20,
  },
  themeCard: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  themeCardActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentDim,
  },
  themeLabel: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  themeLabelActive: {
    color: Colors.accent,
  },
  themeDesc: {
    color: Colors.textMuted,
    fontSize: 11,
    flex: 1,
    textAlign: 'right',
  },
  settingCard: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  settingLabel: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  settingValue: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
  frequencyList: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  frequencyCard: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    alignItems: 'center',
  },
  frequencyCardActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentDim,
  },
  frequencyLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 4,
  },
  frequencyLabelActive: {
    color: Colors.accent,
  },
  frequencyDesc: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '500',
  },
  slapNote: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 16,
    marginBottom: 20,
  },
  dangerSection: {
    marginTop: 8,
    marginBottom: 24,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.danger,
    paddingVertical: 14,
  },
  dangerText: {
    color: Colors.danger,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
  },
  footer: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
  },
});
