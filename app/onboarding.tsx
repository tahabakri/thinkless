import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  ViewToken,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { BrainCircuit, Gavel, Lock, MessageSquare, Zap } from 'lucide-react-native';
import AnimatedPressable from '@/components/AnimatedPressable';
import { useApp } from '@/providers/AppProvider';
import Colors from '@/constants/colors';
import { SocraPersonality } from '@/types';

const { width } = Dimensions.get('window');

interface Step {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
}

const STEPS: Step[] = [
  {
    title: 'WELCOME TO\nTHINKLESS',
    subtitle: 'ESCAPE THE ECHO CHAMBER',
    description:
      "You overthink. We both know it. This app won't hold your hand — it'll push you toward action. Every feature is designed to break your loops and lock your decisions.",
    icon: <Zap size={48} color={Colors.accent} />,
  },
  {
    title: 'THE DRAIN',
    subtitle: 'DUMP YOUR SPIRAL',
    description:
      "Unload your messy thoughts here. Don't organize them. Socra — your AI coach — will cut through the noise and challenge your patterns.",
    icon: <BrainCircuit size={48} color={Colors.accent} />,
  },
  {
    title: 'THE TRIBUNAL',
    subtitle: 'DEBATE YOURSELF',
    description:
      "Stuck between two choices? Argue both sides on a timer. Socra delivers the verdict. Your decision gets locked. No take-backs.",
    icon: <Gavel size={48} color={Colors.accent} />,
  },
  {
    title: 'THE VAULT',
    subtitle: 'LOCK YOUR DECISIONS',
    description:
      "Every decision you make gets locked here with a deadline. Submit proof or face the Graveyard. Accountability isn't optional.",
    icon: <Lock size={48} color={Colors.accent} />,
  },
];

const PERSONALITIES: { id: SocraPersonality; label: string; desc: string }[] = [
  { id: 'default', label: 'DEFAULT', desc: 'Blunt but fair. Sharp observations.' },
  { id: 'drill_sergeant', label: 'DRILL SERGEANT', desc: 'No mercy. ALL CAPS energy.' },
  { id: 'stoic', label: 'STOIC', desc: 'Marcus Aurelius vibes. Calm depth.' },
  { id: 'dark_humor', label: 'DARK HUMOR', desc: 'Sarcastic roasts that hit home.' },
  { id: 'deadline', label: 'DEADLINE', desc: 'Everything is a countdown.' },
];

const OVERTHINK_AREAS = ['Career', 'Relationships', 'Finance', 'Health', 'Creative projects', 'Daily decisions'];

export default function OnboardingScreen() {
  const router = useRouter();
  const { setPersonalityMode } = useApp();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPersonality, setSelectedPersonality] = useState<SocraPersonality>('default');
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

  const totalSteps = STEPS.length + 2; // steps + personality + areas

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index != null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const goNext = () => {
    if (currentIndex < totalSteps - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    }
  };

  const finishOnboarding = async () => {
    await setPersonalityMode(selectedPersonality);
    await AsyncStorage.setItem('hasOnboarded', 'true');
    if (selectedAreas.length > 0) {
      await AsyncStorage.setItem('overthinkAreas', JSON.stringify(selectedAreas));
    }
    router.replace('/(tabs)/(home)' as any);
  };

  const toggleArea = (area: string) => {
    setSelectedAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const isLastStep = currentIndex === totalSteps - 1;

  const allData = [
    ...STEPS.map((s, i) => ({ type: 'step' as const, data: s, key: `step-${i}` })),
    { type: 'personality' as const, data: null, key: 'personality' },
    { type: 'areas' as const, data: null, key: 'areas' },
  ];

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={allData}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => {
          if (item.type === 'step') {
            const step = item.data as Step;
            return (
              <View style={styles.slide}>
                <Animated.View entering={FadeInUp.delay(200)} style={styles.iconWrap}>
                  {step.icon}
                </Animated.View>
                <Animated.Text entering={FadeInUp.delay(300)} style={styles.slideTitle}>
                  {step.title}
                </Animated.Text>
                <Animated.Text entering={FadeInUp.delay(400)} style={styles.slideSub}>
                  {step.subtitle}
                </Animated.Text>
                <Animated.Text entering={FadeInDown.delay(500)} style={styles.slideDesc}>
                  {step.description}
                </Animated.Text>
              </View>
            );
          }

          if (item.type === 'personality') {
            return (
              <View style={styles.slide}>
                <Animated.View entering={FadeInUp.delay(200)}>
                  <MessageSquare size={48} color={Colors.accent} />
                </Animated.View>
                <Animated.Text entering={FadeInUp.delay(300)} style={styles.slideTitle}>
                  MEET SOCRA
                </Animated.Text>
                <Animated.Text entering={FadeInUp.delay(400)} style={styles.slideSub}>
                  PICK YOUR COACH'S PERSONALITY
                </Animated.Text>
                <View style={styles.personalityList}>
                  {PERSONALITIES.map((p) => (
                    <AnimatedPressable
                      key={p.id}
                      style={[
                        styles.personalityItem,
                        selectedPersonality === p.id && styles.personalitySelected,
                      ]}
                      onPress={() => setSelectedPersonality(p.id)}
                    >
                      <Text
                        style={[
                          styles.personalityLabel,
                          selectedPersonality === p.id && styles.personalityLabelSelected,
                        ]}
                      >
                        {p.label}
                      </Text>
                      <Text style={styles.personalityDesc}>{p.desc}</Text>
                    </AnimatedPressable>
                  ))}
                </View>
              </View>
            );
          }

          // Areas
          return (
            <View style={styles.slide}>
              <Animated.Text entering={FadeInUp.delay(200)} style={styles.slideTitle}>
                WHAT DO YOU{'\n'}OVERTHINK?
              </Animated.Text>
              <Animated.Text entering={FadeInUp.delay(300)} style={styles.slideSub}>
                SELECT ALL THAT APPLY
              </Animated.Text>
              <View style={styles.areasGrid}>
                {OVERTHINK_AREAS.map((area) => (
                  <AnimatedPressable
                    key={area}
                    style={[
                      styles.areaChip,
                      selectedAreas.includes(area) && styles.areaSelected,
                    ]}
                    onPress={() => toggleArea(area)}
                  >
                    <Text
                      style={[
                        styles.areaText,
                        selectedAreas.includes(area) && styles.areaTextSelected,
                      ]}
                    >
                      {area.toUpperCase()}
                    </Text>
                  </AnimatedPressable>
                ))}
              </View>
            </View>
          );
        }}
      />

      {/* Dots */}
      <View style={styles.dotsRow}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <View
            key={i}
            style={[styles.dot, currentIndex === i && styles.dotActive]}
          />
        ))}
      </View>

      {/* Button */}
      <View style={styles.bottomRow}>
        <AnimatedPressable
          style={styles.nextBtn}
          haptic="medium"
          onPress={isLastStep ? finishOnboarding : goNext}
        >
          <Text style={styles.nextBtnText}>
            {isLastStep ? "LET'S GO" : 'NEXT'}
          </Text>
        </AnimatedPressable>
        {!isLastStep && (
          <AnimatedPressable
            style={styles.skipBtn}
            haptic="light"
            onPress={finishOnboarding}
          >
            <Text style={styles.skipBtnText}>SKIP</Text>
          </AnimatedPressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconWrap: {
    marginBottom: 24,
  },
  slideTitle: {
    color: Colors.text,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
    lineHeight: 38,
    marginBottom: 8,
  },
  slideSub: {
    color: Colors.accent,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 3,
    textAlign: 'center',
    marginBottom: 24,
  },
  slideDesc: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
  personalityList: {
    width: '100%',
    gap: 8,
    marginTop: 16,
  },
  personalityItem: {
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    backgroundColor: Colors.bgCard,
  },
  personalitySelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentDim,
  },
  personalityLabel: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  personalityLabelSelected: {
    color: Colors.accent,
  },
  personalityDesc: {
    color: Colors.textSecondary,
    fontSize: 11,
  },
  areasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 24,
  },
  areaChip: {
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: Colors.bgCard,
  },
  areaSelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentDim,
  },
  areaText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  areaTextSelected: {
    color: Colors.accent,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  dotActive: {
    backgroundColor: Colors.accent,
    width: 24,
  },
  bottomRow: {
    paddingHorizontal: 32,
    paddingBottom: 48,
    gap: 12,
  },
  nextBtn: {
    backgroundColor: Colors.accent,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextBtnText: {
    color: Colors.bg,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
  },
  skipBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipBtnText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
});
