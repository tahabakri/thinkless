import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { Trophy, Flame, Target, Brain, Zap, Shield, Star, Award } from 'lucide-react-native';
import Colors from '@/constants/colors';

export type BadgeType =
  | 'first_drain'
  | 'ten_drains'
  | 'first_tribunal'
  | 'streak_7'
  | 'streak_30'
  | 'commitments_10'
  | 'loop_breaker'
  | 'socra_regular';

const BADGE_CONFIG: Record<BadgeType, { icon: any; label: string; color: string; description: string }> = {
  first_drain: { icon: Brain, label: 'FIRST DRAIN', color: '#4FC3F7', description: 'Completed your first thought drain' },
  ten_drains: { icon: Zap, label: 'DRAIN MASTER', color: '#AB47BC', description: 'Completed 10 thought drains' },
  first_tribunal: { icon: Shield, label: 'DEBATER', color: '#FF7043', description: 'Held your first tribunal' },
  streak_7: { icon: Flame, label: '7-DAY FIRE', color: '#FF5722', description: '7-day action streak' },
  streak_30: { icon: Star, label: '30-DAY LEGEND', color: '#FFD700', description: '30-day action streak' },
  commitments_10: { icon: Target, label: 'COMMITTED', color: Colors.accent, description: 'Kept 10 commitments' },
  loop_breaker: { icon: Trophy, label: 'LOOP BREAKER', color: '#66BB6A', description: 'Broke 5 thought loops' },
  socra_regular: { icon: Award, label: 'SOCRA REGULAR', color: '#26C6DA', description: '50 messages with Socra' },
};

interface Props {
  type: BadgeType;
  unlocked?: boolean;
  size?: 'small' | 'large';
  animated?: boolean;
}

export default function Badge({ type, unlocked = true, size = 'small', animated = false }: Props) {
  const config = BADGE_CONFIG[type];
  const Icon = config.icon;
  const isLarge = size === 'large';
  const iconSize = isLarge ? 28 : 18;

  const content = (
    <View style={[styles.badge, isLarge && styles.badgeLarge, !unlocked && styles.locked]}>
      <View style={[styles.iconCircle, isLarge && styles.iconCircleLarge, { borderColor: unlocked ? config.color : Colors.textMuted }]}>
        <Icon size={iconSize} color={unlocked ? config.color : Colors.textMuted} />
      </View>
      <Text style={[styles.label, isLarge && styles.labelLarge, { color: unlocked ? config.color : Colors.textMuted }]}>
        {config.label}
      </Text>
      {isLarge && (
        <Text style={styles.description}>{config.description}</Text>
      )}
    </View>
  );

  if (animated) {
    return (
      <Animated.View entering={ZoomIn.springify().damping(12)}>
        {content}
      </Animated.View>
    );
  }

  return content;
}

export { BADGE_CONFIG };

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    gap: 4,
    width: 72,
  },
  badgeLarge: {
    width: 100,
    gap: 8,
  },
  locked: {
    opacity: 0.3,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bg3 + '80',
  },
  iconCircleLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2.5,
  },
  label: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  labelLarge: {
    fontSize: 11,
    letterSpacing: 1,
  },
  description: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
