import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Check, Trash2, Skull } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface Props {
  children: React.ReactNode;
  onSwipeRight?: () => void;
  onSwipeLeft?: () => void;
  rightLabel?: string;
  leftLabel?: string;
  rightColor?: string;
  leftColor?: string;
  rightIcon?: 'check' | 'trash' | 'skull';
  leftIcon?: 'check' | 'trash' | 'skull';
}

const ICONS = {
  check: Check,
  trash: Trash2,
  skull: Skull,
};

export default function SwipeableRow({
  children,
  onSwipeRight,
  onSwipeLeft,
  rightLabel = 'DONE',
  leftLabel = 'DELETE',
  rightColor = Colors.accent,
  leftColor = Colors.danger,
  rightIcon = 'check',
  leftIcon = 'trash',
}: Props) {
  const renderLeftAction = () => {
    if (!onSwipeRight) return null;
    const Icon = ICONS[rightIcon];
    return (
      <View style={[styles.action, styles.leftAction, { backgroundColor: rightColor + '20' }]}>
        <Icon size={20} color={rightColor} />
        <Text style={[styles.actionText, { color: rightColor }]}>{rightLabel}</Text>
      </View>
    );
  };

  const renderRightAction = () => {
    if (!onSwipeLeft) return null;
    const Icon = ICONS[leftIcon];
    return (
      <View style={[styles.action, styles.rightAction, { backgroundColor: leftColor + '20' }]}>
        <Text style={[styles.actionText, { color: leftColor }]}>{leftLabel}</Text>
        <Icon size={20} color={leftColor} />
      </View>
    );
  };

  return (
    <Swipeable
      renderLeftActions={renderLeftAction}
      renderRightActions={renderRightAction}
      onSwipeableOpen={(direction) => {
        if (direction === 'left') onSwipeRight?.();
        if (direction === 'right') onSwipeLeft?.();
      }}
      overshootLeft={false}
      overshootRight={false}
    >
      {children}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  action: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 16,
  },
  leftAction: {
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  rightAction: {
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  actionText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
