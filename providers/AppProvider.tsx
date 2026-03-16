import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import {
  ThoughtDrain,
  TribunalSession,
  Commitment,
  ChatMessage,
  UserStats,
  EchoReport,
  DailyCheckIn,
  SpiralTimer,
  ExternalInput,
  PatternDNA,
  WeeklyReport,
  GraveyardEntry,
  SocraPersonality,
} from '@/types';
import {
  SOCRA_QUESTIONS,
  SOCRA_VERDICTS,
  SOCRA_CHAT_RESPONSES,
  PATTERN_DNA_STYLES,
  WEEKLY_VERDICTS,
  getRandomItem,
  generateLoopScore,
} from '@/mocks/socra';
import { generateId } from '@/utils/helpers';

const STORAGE_KEYS = {
  drains: 'thinkless_drains',
  tribunals: 'thinkless_tribunals',
  commitments: 'thinkless_commitments',
  chatMessages: 'thinkless_chat',
  stats: 'thinkless_stats',
  isPro: 'thinkless_is_pro',
  checkIns: 'thinkless_checkins',
  spiralTimers: 'thinkless_spiral_timers',
  externalInputs: 'thinkless_external_inputs',
  graveyard: 'thinkless_graveyard',
  personality: 'thinkless_personality',
  patternDNA: 'thinkless_pattern_dna',
  weeklyReports: 'thinkless_weekly_reports',
};

const DEFAULT_STATS: UserStats = {
  chamberScore: 42,
  totalDrains: 3,
  totalTribunals: 1,
  commitmentsKept: 2,
  commitmentsBroken: 1,
  currentStreak: 2,
  longestStreak: 5,
  weeklyScores: [
    { date: 'Mon', score: 35, thoughtToAction: 0.3, loopsDetected: 4, commitmentsKept: 1, externalInputs: 2 },
    { date: 'Tue', score: 38, thoughtToAction: 0.35, loopsDetected: 3, commitmentsKept: 1, externalInputs: 3 },
    { date: 'Wed', score: 42, thoughtToAction: 0.4, loopsDetected: 3, commitmentsKept: 2, externalInputs: 2 },
    { date: 'Thu', score: 45, thoughtToAction: 0.42, loopsDetected: 2, commitmentsKept: 2, externalInputs: 4 },
    { date: 'Fri', score: 48, thoughtToAction: 0.45, loopsDetected: 2, commitmentsKept: 2, externalInputs: 3 },
    { date: 'Sat', score: 44, thoughtToAction: 0.38, loopsDetected: 3, commitmentsKept: 2, externalInputs: 1 },
    { date: 'Sun', score: 42, thoughtToAction: 0.4, loopsDetected: 3, commitmentsKept: 2, externalInputs: 2 },
  ],
};

async function loadFromStorage<T>(key: string, fallback: T): Promise<T> {
  try {
    const stored = await AsyncStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    console.log('Failed to load from storage:', key);
    return fallback;
  }
}

async function saveToStorage<T>(key: string, data: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch {
    console.log('Failed to save to storage:', key);
  }
}

export const [AppProvider, useApp] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [drains, setDrains] = useState<ThoughtDrain[]>([]);
  const [tribunals, setTribunals] = useState<TribunalSession[]>([]);
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [stats, setStats] = useState<UserStats>(DEFAULT_STATS);
  const [isPro, setIsPro] = useState<boolean>(false);
  const [checkIns, setCheckIns] = useState<DailyCheckIn[]>([]);
  const [spiralTimers, setSpiralTimers] = useState<SpiralTimer[]>([]);
  const [externalInputs, setExternalInputs] = useState<ExternalInput[]>([]);
  const [graveyard, setGraveyard] = useState<GraveyardEntry[]>([]);
  const [personality, setPersonality] = useState<SocraPersonality>('default');
  const [patternDNA, setPatternDNA] = useState<PatternDNA | null>(null);
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>([]);

  const dataQuery = useQuery({
    queryKey: ['app-data'],
    queryFn: async () => {
      const [d, t, c, m, s, p, ci, st, ei, g, pers, pdna, wr] = await Promise.all([
        loadFromStorage<ThoughtDrain[]>(STORAGE_KEYS.drains, []),
        loadFromStorage<TribunalSession[]>(STORAGE_KEYS.tribunals, []),
        loadFromStorage<Commitment[]>(STORAGE_KEYS.commitments, []),
        loadFromStorage<ChatMessage[]>(STORAGE_KEYS.chatMessages, []),
        loadFromStorage<UserStats>(STORAGE_KEYS.stats, DEFAULT_STATS),
        loadFromStorage<boolean>(STORAGE_KEYS.isPro, false),
        loadFromStorage<DailyCheckIn[]>(STORAGE_KEYS.checkIns, []),
        loadFromStorage<SpiralTimer[]>(STORAGE_KEYS.spiralTimers, []),
        loadFromStorage<ExternalInput[]>(STORAGE_KEYS.externalInputs, []),
        loadFromStorage<GraveyardEntry[]>(STORAGE_KEYS.graveyard, []),
        loadFromStorage<SocraPersonality>(STORAGE_KEYS.personality, 'default'),
        loadFromStorage<PatternDNA | null>(STORAGE_KEYS.patternDNA, null),
        loadFromStorage<WeeklyReport[]>(STORAGE_KEYS.weeklyReports, []),
      ]);
      return {
        drains: d, tribunals: t, commitments: c, chatMessages: m,
        stats: s, isPro: p, checkIns: ci, spiralTimers: st,
        externalInputs: ei, graveyard: g, personality: pers,
        patternDNA: pdna, weeklyReports: wr,
      };
    },
  });

  useEffect(() => {
    if (dataQuery.data) {
      setDrains(dataQuery.data.drains);
      setTribunals(dataQuery.data.tribunals);
      setCommitments(dataQuery.data.commitments);
      setChatMessages(dataQuery.data.chatMessages);
      setStats(dataQuery.data.stats);
      setIsPro(dataQuery.data.isPro);
      setCheckIns(dataQuery.data.checkIns);
      setSpiralTimers(dataQuery.data.spiralTimers);
      setExternalInputs(dataQuery.data.externalInputs);
      setGraveyard(dataQuery.data.graveyard);
      setPersonality(dataQuery.data.personality);
      setPatternDNA(dataQuery.data.patternDNA);
      setWeeklyReports(dataQuery.data.weeklyReports);
    }
  }, [dataQuery.data]);

  const addDrainMutation = useMutation({
    mutationFn: async (text: string) => {
      const loopScore = generateLoopScore();
      const newDrain: ThoughtDrain = {
        id: generateId(),
        text,
        socraResponse: getRandomItem(SOCRA_QUESTIONS),
        timestamp: Date.now(),
        loopScore,
        resolved: false,
      };
      const updated = [newDrain, ...drains];
      setDrains(updated);
      await saveToStorage(STORAGE_KEYS.drains, updated);

      const newStats = {
        ...stats,
        totalDrains: stats.totalDrains + 1,
        chamberScore: Math.min(100, stats.chamberScore + 2),
      };
      setStats(newStats);
      await saveToStorage(STORAGE_KEYS.stats, newStats);

      return newDrain;
    },
  });

  const addTribunalMutation = useMutation({
    mutationFn: async (session: { topic: string; sideA: string; sideB: string }) => {
      const newSession: TribunalSession = {
        id: generateId(),
        topic: session.topic,
        sideA: session.sideA,
        sideB: session.sideB,
        verdict: getRandomItem(SOCRA_VERDICTS),
        decision: '',
        timestamp: Date.now(),
        locked: true,
      };
      const updated = [newSession, ...tribunals];
      setTribunals(updated);
      await saveToStorage(STORAGE_KEYS.tribunals, updated);

      const newStats = {
        ...stats,
        totalTribunals: stats.totalTribunals + 1,
        chamberScore: Math.min(100, stats.chamberScore + 5),
      };
      setStats(newStats);
      await saveToStorage(STORAGE_KEYS.stats, newStats);

      return newSession;
    },
  });

  const addCommitmentMutation = useMutation({
    mutationFn: async (data: { decision: string; source: 'drain' | 'tribunal' | 'manual'; sharedWith?: string }) => {
      const newCommitment: Commitment = {
        id: generateId(),
        decision: data.decision,
        timestamp: Date.now(),
        deadline: Date.now() + 72 * 3600000,
        proofRequired: 'text',
        proofSubmitted: false,
        shamed: false,
        source: data.source,
        sharedWith: data.sharedWith,
      };
      const updated = [newCommitment, ...commitments];
      setCommitments(updated);
      await saveToStorage(STORAGE_KEYS.commitments, updated);
      return newCommitment;
    },
  });

  const submitProofMutation = useMutation({
    mutationFn: async (data: { id: string; proof: string }) => {
      const updated = commitments.map((c) =>
        c.id === data.id ? { ...c, proofSubmitted: true, proofText: data.proof } : c
      );
      setCommitments(updated);
      await saveToStorage(STORAGE_KEYS.commitments, updated);

      const newStats = {
        ...stats,
        commitmentsKept: stats.commitmentsKept + 1,
        chamberScore: Math.min(100, stats.chamberScore + 8),
        currentStreak: stats.currentStreak + 1,
        longestStreak: Math.max(stats.longestStreak, stats.currentStreak + 1),
      };
      setStats(newStats);
      await saveToStorage(STORAGE_KEYS.stats, newStats);
    },
  });

  const sendChatMutation = useMutation({
    mutationFn: async (text: string) => {
      const userMsg: ChatMessage = {
        id: generateId(),
        role: 'user',
        text,
        timestamp: Date.now(),
      };
      const responses = SOCRA_CHAT_RESPONSES[personality] || SOCRA_CHAT_RESPONSES.default;
      const socraMsg: ChatMessage = {
        id: generateId(),
        role: 'socra',
        text: getRandomItem(responses),
        timestamp: Date.now() + 1000,
      };
      const updated = [...chatMessages, userMsg, socraMsg];
      setChatMessages(updated);
      await saveToStorage(STORAGE_KEYS.chatMessages, updated);
      return socraMsg;
    },
  });

  const upgradeToProMutation = useMutation({
    mutationFn: async () => {
      setIsPro(true);
      await saveToStorage(STORAGE_KEYS.isPro, true);
    },
  });

  const addCheckInMutation = useMutation({
    mutationFn: async (data: { avoidingDecision: string; committedAction: string; yesterdayLoop: string }) => {
      const today = new Date().toISOString().split('T')[0];
      const newCheckIn: DailyCheckIn = {
        id: generateId(),
        date: today,
        avoidingDecision: data.avoidingDecision,
        committedAction: data.committedAction,
        yesterdayLoop: data.yesterdayLoop,
        timestamp: Date.now(),
      };
      const updated = [newCheckIn, ...checkIns];
      setCheckIns(updated);
      await saveToStorage(STORAGE_KEYS.checkIns, updated);

      const newStats = {
        ...stats,
        chamberScore: Math.min(100, stats.chamberScore + 3),
        lastCheckInDate: today,
      };
      setStats(newStats);
      await saveToStorage(STORAGE_KEYS.stats, newStats);

      return newCheckIn;
    },
  });

  const addSpiralTimerMutation = useMutation({
    mutationFn: async (data: { topic: string; durationMinutes: number }) => {
      const timer: SpiralTimer = {
        id: generateId(),
        topic: data.topic,
        durationMinutes: data.durationMinutes,
        startedAt: Date.now(),
        decided: false,
      };
      const updated = [timer, ...spiralTimers];
      setSpiralTimers(updated);
      await saveToStorage(STORAGE_KEYS.spiralTimers, updated);
      return timer;
    },
  });

  const completeSpiralTimerMutation = useMutation({
    mutationFn: async (data: { id: string; decision?: string }) => {
      const updated = spiralTimers.map((t) =>
        t.id === data.id ? { ...t, completedAt: Date.now(), decided: !!data.decision, decision: data.decision } : t
      );
      setSpiralTimers(updated);
      await saveToStorage(STORAGE_KEYS.spiralTimers, updated);

      if (data.decision) {
        const newStats = {
          ...stats,
          chamberScore: Math.min(100, stats.chamberScore + 4),
        };
        setStats(newStats);
        await saveToStorage(STORAGE_KEYS.stats, newStats);
      }
    },
  });

  const addExternalInputMutation = useMutation({
    mutationFn: async (data: { type: ExternalInput['type']; description: string }) => {
      const input: ExternalInput = {
        id: generateId(),
        type: data.type,
        description: data.description,
        timestamp: Date.now(),
      };
      const updated = [input, ...externalInputs];
      setExternalInputs(updated);
      await saveToStorage(STORAGE_KEYS.externalInputs, updated);

      const newStats = {
        ...stats,
        chamberScore: Math.min(100, stats.chamberScore + 1),
      };
      setStats(newStats);
      await saveToStorage(STORAGE_KEYS.stats, newStats);

      return input;
    },
  });

  const addToGraveyardMutation = useMutation({
    mutationFn: async (data: { type: GraveyardEntry['type']; description: string; originalId?: string }) => {
      const entry: GraveyardEntry = {
        id: generateId(),
        type: data.type,
        description: data.description,
        timestamp: Date.now(),
        originalId: data.originalId,
      };
      const updated = [entry, ...graveyard];
      setGraveyard(updated);
      await saveToStorage(STORAGE_KEYS.graveyard, updated);

      const newStats = {
        ...stats,
        commitmentsBroken: stats.commitmentsBroken + 1,
        currentStreak: 0,
      };
      setStats(newStats);
      await saveToStorage(STORAGE_KEYS.stats, newStats);

      return entry;
    },
  });

  const setPersonalityMutation = useMutation({
    mutationFn: async (mode: SocraPersonality) => {
      setPersonality(mode);
      await saveToStorage(STORAGE_KEYS.personality, mode);
    },
  });

  const generatePatternDNAMutation = useMutation({
    mutationFn: async () => {
      const topWords: Record<string, number> = {};
      drains.forEach((d) => {
        const words = d.text.toLowerCase().split(/\s+/);
        words.forEach((w) => {
          if (w.length > 4) topWords[w] = (topWords[w] || 0) + 1;
        });
      });

      const sortedLoops = Object.entries(topWords)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([word]) => word);

      const dna: PatternDNA = {
        topLoops: sortedLoops.length > 0 ? sortedLoops : ['career', 'relationship', 'money'],
        avoidanceStyle: getRandomItem(PATTERN_DNA_STYLES),
        avgThoughtToActionMinutes: Math.floor(Math.random() * 120) + 30,
        totalDrainsAnalyzed: drains.length,
        loopFrequency: topWords,
        generatedAt: Date.now(),
      };

      setPatternDNA(dna);
      await saveToStorage(STORAGE_KEYS.patternDNA, dna);
      return dna;
    },
  });

  const generateWeeklyReportMutation = useMutation({
    mutationFn: async () => {
      const report: WeeklyReport = {
        weekOf: new Date().toISOString().split('T')[0],
        avgEscapeScore: stats.chamberScore,
        loopsBroken: Math.floor(Math.random() * 5) + 1,
        commitmentsKept: stats.commitmentsKept,
        commitmentsMissed: stats.commitmentsBroken,
        totalDrains: stats.totalDrains,
        totalTribunals: stats.totalTribunals,
        streakDays: stats.currentStreak,
        socraVerdict: getRandomItem(WEEKLY_VERDICTS),
        topPattern: 'Career decision avoidance',
      };
      const updated = [report, ...weeklyReports];
      setWeeklyReports(updated);
      await saveToStorage(STORAGE_KEYS.weeklyReports, updated);
      return report;
    },
  });

  const clearChatMutation = useMutation({
    mutationFn: async () => {
      setChatMessages([]);
      await saveToStorage(STORAGE_KEYS.chatMessages, []);
    },
  });

  const echoReport: EchoReport = useMemo(() => ({
    loopScore: drains.length > 0 ? Math.round(drains.reduce((sum, d) => sum + d.loopScore, 0) / drains.length) : 0,
    repetitions: Math.floor(Math.random() * 5) + 1,
    circularPatterns: Math.floor(Math.random() * 3) + 1,
    catastrophizing: Math.floor(Math.random() * 4),
    pseudoIntellectual: Math.floor(Math.random() * 2),
    topLoops: ['Career decisions', 'Relationship analysis', 'Self-worth questioning'],
  }), [drains]);

  const weeklyDrainCount = useMemo(() => {
    const weekAgo = Date.now() - 7 * 86400000;
    return drains.filter((d) => d.timestamp > weekAgo).length;
  }, [drains]);

  const canDrain = isPro || weeklyDrainCount < 3;

  const interventionNeeded = useMemo(() => {
    if (drains.length < 3) return false;
    const recentDrains = drains.slice(0, 5);
    const uniqueTopics = new Set(recentDrains.map((d) => d.text.split(' ').slice(0, 3).join(' ')));
    return uniqueTopics.size <= 2 && recentDrains.length >= 3;
  }, [drains]);

  const todayCheckedIn = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return checkIns.some((c) => c.date === today);
  }, [checkIns]);

  const todayExternalInputs = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    return externalInputs.filter((e) => e.timestamp >= todayStart.getTime());
  }, [externalInputs]);

  return {
    drains,
    tribunals,
    commitments,
    chatMessages,
    stats,
    isPro,
    echoReport,
    canDrain,
    weeklyDrainCount,
    isLoading: dataQuery.isLoading,
    checkIns,
    spiralTimers,
    externalInputs,
    graveyard,
    personality,
    patternDNA,
    weeklyReports,
    interventionNeeded,
    todayCheckedIn,
    todayExternalInputs,

    addDrain: addDrainMutation.mutateAsync,
    isDraining: addDrainMutation.isPending,
    addTribunal: addTribunalMutation.mutateAsync,
    isTribunalPending: addTribunalMutation.isPending,
    addCommitment: addCommitmentMutation.mutateAsync,
    submitProof: submitProofMutation.mutateAsync,
    sendChat: sendChatMutation.mutateAsync,
    isChatPending: sendChatMutation.isPending,
    upgradeToPro: upgradeToProMutation.mutateAsync,
    addCheckIn: addCheckInMutation.mutateAsync,
    isCheckInPending: addCheckInMutation.isPending,
    addSpiralTimer: addSpiralTimerMutation.mutateAsync,
    completeSpiralTimer: completeSpiralTimerMutation.mutateAsync,
    addExternalInput: addExternalInputMutation.mutateAsync,
    addToGraveyard: addToGraveyardMutation.mutateAsync,
    setPersonalityMode: setPersonalityMutation.mutateAsync,
    generatePatternDNA: generatePatternDNAMutation.mutateAsync,
    isGeneratingDNA: generatePatternDNAMutation.isPending,
    generateWeeklyReport: generateWeeklyReportMutation.mutateAsync,
    isGeneratingReport: generateWeeklyReportMutation.isPending,
    clearChat: clearChatMutation.mutateAsync,
  };
});
