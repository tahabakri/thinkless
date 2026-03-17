import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { getDeviceId, registerDevice } from '@/lib/device';
import * as ai from '@/services/ai';
import * as drainsService from '@/services/drains';
import * as tribunalsService from '@/services/tribunals';
import * as commitmentsService from '@/services/commitments';
import * as chatService from '@/services/chat';
import * as checkinsService from '@/services/checkins';
import * as spiralService from '@/services/spiral-timers';
import * as inputsService from '@/services/external-inputs';
import * as graveyardService from '@/services/graveyard';
import * as statsService from '@/services/stats';

const DEFAULT_STATS: UserStats = {
  chamberScore: 0,
  totalDrains: 0,
  totalTribunals: 0,
  commitmentsKept: 0,
  commitmentsBroken: 0,
  currentStreak: 0,
  longestStreak: 0,
  weeklyScores: [],
};

export const [AppProvider, useApp] = createContextHook(() => {
  const queryClient = useQueryClient();

  // Device ID
  const [deviceId, setDeviceId] = useState<string | null>(null);

  // Core data
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
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [slapEnabled, setSlapEnabled] = useState(true);
  const [slapFrequency, setSlapFrequency] = useState<'aggressive' | 'daily' | 'gentle'>('daily');

  // Initialize device
  useEffect(() => {
    (async () => {
      const id = await getDeviceId();
      await registerDevice(id);
      setDeviceId(id);
    })();
  }, []);

  // Load all data once deviceId is available
  const dataQuery = useQuery({
    queryKey: ['app-data', deviceId],
    queryFn: async () => {
      if (!deviceId) throw new Error('No device ID');
      const [
        d, t, c, m, ci, st, ei, g, profile, pdna, wr,
      ] = await Promise.all([
        drainsService.getDrains(deviceId),
        tribunalsService.getTribunals(deviceId),
        commitmentsService.getCommitments(deviceId),
        chatService.getChatMessages(deviceId),
        checkinsService.getCheckins(deviceId),
        spiralService.getSpiralTimers(deviceId),
        inputsService.getExternalInputs(deviceId),
        graveyardService.getGraveyardEntries(deviceId),
        statsService.getProfile(deviceId),
        statsService.getPatternDNA(deviceId),
        statsService.getWeeklyReports(deviceId),
      ]);
      return {
        drains: d,
        tribunals: t,
        commitments: c,
        chatMessages: m,
        checkIns: ci,
        spiralTimers: st,
        externalInputs: ei,
        graveyard: g,
        stats: profile?.stats || DEFAULT_STATS,
        settings: profile?.settings || null,
        patternDNA: pdna,
        weeklyReports: wr,
      };
    },
    enabled: !!deviceId,
  });

  useEffect(() => {
    if (dataQuery.data) {
      setDrains(dataQuery.data.drains);
      setTribunals(dataQuery.data.tribunals);
      setCommitments(dataQuery.data.commitments);
      setChatMessages(dataQuery.data.chatMessages);
      setStats(dataQuery.data.stats);
      setCheckIns(dataQuery.data.checkIns);
      setSpiralTimers(dataQuery.data.spiralTimers);
      setExternalInputs(dataQuery.data.externalInputs);
      setGraveyard(dataQuery.data.graveyard);
      setPatternDNA(dataQuery.data.patternDNA);
      setWeeklyReports(dataQuery.data.weeklyReports);
      if (dataQuery.data.settings) {
        setPersonality(dataQuery.data.settings.personality);
        setIsPro(dataQuery.data.settings.isPro);
        setNotificationEnabled(dataQuery.data.settings.notificationEnabled);
        setSlapEnabled(dataQuery.data.settings.slapEnabled);
        setSlapFrequency(dataQuery.data.settings.slapFrequency);
      }
    }
  }, [dataQuery.data]);

  // ── Mutations ──

  const addDrainMutation = useMutation({
    mutationFn: async (text: string) => {
      if (!deviceId) throw new Error('No device ID');
      // AI generates the response, local function computes loop score
      const [socraResponse, loopScore] = await Promise.all([
        ai.generateDrainResponse(text, personality),
        Promise.resolve(ai.computeLoopScore(text)),
      ]);
      const newDrain = await drainsService.createDrain(deviceId, text, socraResponse, loopScore);
      const newStats = await statsService.incrementStat(deviceId, 'total_drains', 2);
      setDrains((prev) => [newDrain, ...prev]);
      setStats(newStats);
      return newDrain;
    },
  });

  const addTribunalMutation = useMutation({
    mutationFn: async (session: { topic: string; sideA: string; sideB: string }) => {
      if (!deviceId) throw new Error('No device ID');
      const verdict = await ai.generateTribunalVerdict(
        session.topic,
        session.sideA,
        session.sideB,
        personality
      );
      const newSession = await tribunalsService.createTribunal(
        deviceId,
        session.topic,
        session.sideA,
        session.sideB,
        verdict
      );
      const newStats = await statsService.incrementStat(deviceId, 'total_tribunals', 5);
      setTribunals((prev) => [newSession, ...prev]);
      setStats(newStats);
      return newSession;
    },
  });

  const addCommitmentMutation = useMutation({
    mutationFn: async (data: { decision: string; source: 'drain' | 'tribunal' | 'manual'; sharedWith?: string }) => {
      if (!deviceId) throw new Error('No device ID');
      const newCommitment = await commitmentsService.createCommitment(deviceId, data);
      setCommitments((prev) => [newCommitment, ...prev]);
      return newCommitment;
    },
  });

  const submitProofMutation = useMutation({
    mutationFn: async (data: { id: string; proof: string }) => {
      if (!deviceId) throw new Error('No device ID');
      await commitmentsService.submitProof(data.id, data.proof);
      const newStats = await statsService.incrementStat(deviceId, 'commitments_kept', 8);
      setCommitments((prev) =>
        prev.map((c) =>
          c.id === data.id ? { ...c, proofSubmitted: true, proofText: data.proof } : c
        )
      );
      setStats(newStats);
    },
  });

  const sendChatMutation = useMutation({
    mutationFn: async (text: string) => {
      if (!deviceId) throw new Error('No device ID');
      const userMsg = await chatService.createChatMessage(deviceId, 'user', text);
      setChatMessages((prev) => [...prev, userMsg]);

      const aiResponse = await ai.generateChatResponse(text, chatMessages, personality);
      const socraMsg = await chatService.createChatMessage(deviceId, 'socra', aiResponse);
      setChatMessages((prev) => [...prev, socraMsg]);
      return socraMsg;
    },
  });

  const upgradeToProMutation = useMutation({
    mutationFn: async () => {
      if (!deviceId) throw new Error('No device ID');
      await statsService.updateSettings(deviceId, { is_pro: true });
      setIsPro(true);
    },
  });

  const addCheckInMutation = useMutation({
    mutationFn: async (data: { avoidingDecision: string; committedAction: string; yesterdayLoop: string }) => {
      if (!deviceId) throw new Error('No device ID');
      const newCheckIn = await checkinsService.createCheckin(deviceId, data);
      const today = new Date().toISOString().split('T')[0];
      await statsService.updateProfileStats(deviceId, {
        chamber_score: Math.min(100, stats.chamberScore + 3),
        last_checkin_date: today,
      });
      setCheckIns((prev) => [newCheckIn, ...prev]);
      setStats((prev) => ({
        ...prev,
        chamberScore: Math.min(100, prev.chamberScore + 3),
        lastCheckInDate: today,
      }));
      return newCheckIn;
    },
  });

  const addSpiralTimerMutation = useMutation({
    mutationFn: async (data: { topic: string; durationMinutes: number }) => {
      if (!deviceId) throw new Error('No device ID');
      const timer = await spiralService.createSpiralTimer(deviceId, data.topic, data.durationMinutes);
      setSpiralTimers((prev) => [timer, ...prev]);
      return timer;
    },
  });

  const completeSpiralTimerMutation = useMutation({
    mutationFn: async (data: { id: string; decision?: string }) => {
      if (!deviceId) throw new Error('No device ID');
      await spiralService.completeSpiralTimer(data.id, data.decision);
      setSpiralTimers((prev) =>
        prev.map((t) =>
          t.id === data.id
            ? { ...t, completedAt: Date.now(), decided: !!data.decision, decision: data.decision }
            : t
        )
      );
      if (data.decision) {
        await statsService.updateProfileStats(deviceId, {
          chamber_score: Math.min(100, stats.chamberScore + 4),
        });
        setStats((prev) => ({
          ...prev,
          chamberScore: Math.min(100, prev.chamberScore + 4),
        }));
      }
    },
  });

  const addExternalInputMutation = useMutation({
    mutationFn: async (data: { type: ExternalInput['type']; description: string }) => {
      if (!deviceId) throw new Error('No device ID');
      const input = await inputsService.createExternalInput(deviceId, data.type, data.description);
      await statsService.updateProfileStats(deviceId, {
        chamber_score: Math.min(100, stats.chamberScore + 1),
      });
      setExternalInputs((prev) => [input, ...prev]);
      setStats((prev) => ({
        ...prev,
        chamberScore: Math.min(100, prev.chamberScore + 1),
      }));
      return input;
    },
  });

  const addToGraveyardMutation = useMutation({
    mutationFn: async (data: { type: GraveyardEntry['type']; description: string; originalId?: string }) => {
      if (!deviceId) throw new Error('No device ID');
      const entry = await graveyardService.createGraveyardEntry(
        deviceId,
        data.type,
        data.description,
        data.originalId
      );
      const newStats = await statsService.incrementStat(deviceId, 'commitments_broken', 0);
      setGraveyard((prev) => [entry, ...prev]);
      setStats(newStats);
      return entry;
    },
  });

  const setPersonalityMutation = useMutation({
    mutationFn: async (mode: SocraPersonality) => {
      if (!deviceId) throw new Error('No device ID');
      await statsService.updateSettings(deviceId, { personality: mode });
      setPersonality(mode);
    },
  });

  const generatePatternDNAMutation = useMutation({
    mutationFn: async () => {
      if (!deviceId) throw new Error('No device ID');

      const drainTexts = drains.map((d) => d.text);

      // Word frequency analysis
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

      // AI generates the avoidance style insight
      const avoidanceStyle = await ai.generatePatternInsight(drainTexts, personality);

      const dna: PatternDNA = {
        topLoops: sortedLoops.length > 0 ? sortedLoops : ['career', 'relationship', 'money'],
        avoidanceStyle,
        avgThoughtToActionMinutes: drains.length > 0
          ? Math.floor(
              drains.reduce((sum, d) => {
                const resolved = commitments.find(
                  (c) => c.source === 'drain' && c.timestamp > d.timestamp
                );
                return sum + (resolved ? (resolved.timestamp - d.timestamp) / 60000 : 120);
              }, 0) / drains.length
            )
          : 0,
        totalDrainsAnalyzed: drains.length,
        loopFrequency: topWords,
        generatedAt: Date.now(),
      };

      await statsService.savePatternDNA(deviceId, dna);
      setPatternDNA(dna);
      return dna;
    },
  });

  const generateWeeklyReportMutation = useMutation({
    mutationFn: async () => {
      if (!deviceId) throw new Error('No device ID');

      const weekDrains = drains.filter((d) => d.timestamp > Date.now() - 7 * 86400000);
      const loopsBroken = weekDrains.filter((d) => d.resolved).length;

      const socraVerdict = await ai.generateWeeklyVerdict(
        {
          chamberScore: stats.chamberScore,
          totalDrains: stats.totalDrains,
          totalTribunals: stats.totalTribunals,
          commitmentsKept: stats.commitmentsKept,
          commitmentsBroken: stats.commitmentsBroken,
          currentStreak: stats.currentStreak,
        },
        personality
      );

      const report: WeeklyReport = {
        weekOf: new Date().toISOString().split('T')[0],
        avgEscapeScore: stats.chamberScore,
        loopsBroken,
        commitmentsKept: stats.commitmentsKept,
        commitmentsMissed: stats.commitmentsBroken,
        totalDrains: stats.totalDrains,
        totalTribunals: stats.totalTribunals,
        streakDays: stats.currentStreak,
        socraVerdict,
        topPattern: patternDNA?.topLoops[0] || 'Not enough data',
      };

      await statsService.saveWeeklyReport(deviceId, report);
      setWeeklyReports((prev) => [report, ...prev]);
      return report;
    },
  });

  const clearChatMutation = useMutation({
    mutationFn: async () => {
      if (!deviceId) throw new Error('No device ID');
      await chatService.clearChat(deviceId);
      setChatMessages([]);
    },
  });

  const clearAllDataMutation = useMutation({
    mutationFn: async () => {
      if (!deviceId) throw new Error('No device ID');
      await statsService.clearAllData(deviceId);
      setDrains([]);
      setTribunals([]);
      setCommitments([]);
      setChatMessages([]);
      setCheckIns([]);
      setSpiralTimers([]);
      setExternalInputs([]);
      setGraveyard([]);
      setPatternDNA(null);
      setWeeklyReports([]);
      setStats(DEFAULT_STATS);
    },
  });

  const updateNotificationSettingsMutation = useMutation({
    mutationFn: async (data: {
      notificationEnabled?: boolean;
      slapEnabled?: boolean;
      slapFrequency?: 'aggressive' | 'daily' | 'gentle';
    }) => {
      if (!deviceId) throw new Error('No device ID');
      const updates: Record<string, unknown> = {};
      if (data.notificationEnabled !== undefined) {
        updates.notification_enabled = data.notificationEnabled;
        setNotificationEnabled(data.notificationEnabled);
      }
      if (data.slapEnabled !== undefined) {
        updates.slap_enabled = data.slapEnabled;
        setSlapEnabled(data.slapEnabled);
      }
      if (data.slapFrequency !== undefined) {
        updates.slap_frequency = data.slapFrequency;
        setSlapFrequency(data.slapFrequency);
      }
      await statsService.updateSettings(deviceId, updates);
    },
  });

  // ── Computed values ──

  const echoReport: EchoReport = useMemo(
    () => ({
      loopScore:
        drains.length > 0
          ? Math.round(drains.reduce((sum, d) => sum + d.loopScore, 0) / drains.length)
          : 0,
      repetitions: 0,
      circularPatterns: 0,
      catastrophizing: 0,
      pseudoIntellectual: 0,
      topLoops: [],
    }),
    [drains]
  );

  const weeklyDrainCount = useMemo(() => {
    const weekAgo = Date.now() - 7 * 86400000;
    return drains.filter((d) => d.timestamp > weekAgo).length;
  }, [drains]);

  const canDrain = isPro || weeklyDrainCount < 3;

  const interventionNeeded = useMemo(() => {
    if (drains.length < 3) return false;
    const recentDrains = drains.slice(0, 5);
    const uniqueTopics = new Set(
      recentDrains.map((d) => d.text.split(' ').slice(0, 3).join(' '))
    );
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
    // Data
    drains,
    tribunals,
    commitments,
    chatMessages,
    stats,
    isPro,
    echoReport,
    canDrain,
    weeklyDrainCount,
    isLoading: dataQuery.isLoading || !deviceId,
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
    deviceId,
    notificationEnabled,
    slapEnabled,
    slapFrequency,

    // Mutations
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
    clearAllData: clearAllDataMutation.mutateAsync,
    updateNotificationSettings: updateNotificationSettingsMutation.mutateAsync,
  };
});
