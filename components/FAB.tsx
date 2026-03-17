import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { BrainCircuit, Timer, Mic, X, Zap } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';

const ACTIONS = [
  { icon: BrainCircuit, label: 'DRAIN', route: '/(tabs)/drain' as const },
  { icon: Timer, label: 'SPIRAL', route: '/spiral-timer' as const },
  { icon: Mic, label: 'VOICE', route: '/(tabs)/drain' as const, param: 'voice' },
];

export default function FAB() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const animation = useSharedValue(0);

  const toggleMenu = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const next = !open;
    setOpen(next);
    animation.value = withSpring(next ? 1 : 0, { damping: 12, stiffness: 200 });
  };

  const mainStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(animation.value, [0, 1], [0, 45])}deg` }],
  }));

  const menuStyle = useAnimatedStyle(() => ({
    opacity: animation.value,
    transform: [{ scale: interpolate(animation.value, [0, 1], [0.5, 1]) }],
  }));

  const handleAction = (action: (typeof ACTIONS)[number]) => {
    toggleMenu();
    if (action.route) {
      router.push(action.route as any);
    }
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      {open && (
        <Animated.View style={[styles.menu, menuStyle]}>
          {ACTIONS.map((action) => (
            <Pressable
              key={action.label}
              style={styles.menuItem}
              onPress={() => handleAction(action)}
            >
              <View style={styles.menuIcon}>
                <action.icon size={18} color={Colors.bg} />
              </View>
              <Text style={styles.menuLabel}>{action.label}</Text>
            </Pressable>
          ))}
        </Animated.View>
      )}

      <Pressable onPress={toggleMenu} style={styles.fab}>
        <Animated.View style={mainStyle}>
          {open ? (
            <X size={24} color={Colors.bg} />
          ) : (
            <Zap size={24} color={Colors.bg} />
          )}
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    alignItems: 'flex-end',
    zIndex: 100,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  menu: {
    marginBottom: 12,
    gap: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  menuIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    color: Colors.text,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    backgroundColor: Colors.bg2,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
});
