import { SocraPersonality, ChatMessage } from '@/types';

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY!;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const BASE_SYSTEM_PROMPT = `You are Socra, a blunt, no-nonsense cognitive coach inside the ThinkLess app. Your purpose is to break users out of overthinking loops and push them toward decisive action. You are NOT a therapist. You don't validate spiral thinking. You challenge it. You're the voice that says "stop thinking and move."

Rules:
- Keep responses SHORT: 2-3 sentences max unless asked for analysis
- Be direct, never generic or preachy
- End with a pointed question or a clear command
- Never say "it's okay to feel this way" — push toward resolution
- Reference the user's actual words to prove you're listening
- Never use bullet points or numbered lists in conversational responses`;

const PERSONALITY_MODIFIERS: Record<SocraPersonality, string> = {
  default:
    'Be direct and challenging but fair. Use sharp observations and occasional metaphors. Push for action without cruelty. You respect the user enough to be honest.',
  drill_sergeant:
    'You are a military drill sergeant. Use ALL CAPS for key words. Bark orders. Zero patience for excuses. Call users "soldier" or "recruit." Everything is a mission. Hesitation is the enemy.',
  stoic:
    'Channel Marcus Aurelius, Seneca, and Epictetus. Reference Stoic philosophy naturally. Use calm, measured language that cuts deep. Remind them of mortality. Time is finite — decisions are not.',
  dark_humor:
    'Use sharp, sarcastic wit. Point out the absurdity of their overthinking with dark comedy. Be genuinely funny but make every joke serve the message. Mock the spiral, not the person.',
  deadline:
    'Everything is a countdown. Set specific deadlines in every response. Use time-pressure language. Reference clocks, timers, expiration dates. Every minute spent thinking is a minute billed to their life.',
};

async function callGroq(systemPrompt: string, userPrompt: string): Promise<string> {
  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.9,
      max_tokens: 300,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty Groq response');
  return text.trim();
}

function getSystemPrompt(personality: SocraPersonality, extra?: string): string {
  const base = `${BASE_SYSTEM_PROMPT}\n\nPersonality mode: ${PERSONALITY_MODIFIERS[personality]}`;
  return extra ? `${base}\n\n${extra}` : base;
}

export function computeLoopScore(text: string): number {
  let score = 30;
  const words = text.toLowerCase().split(/\s+/);
  const uniqueWords = new Set(words);

  // Repetition ratio
  if (words.length > 3) {
    const repetitionRatio = 1 - uniqueWords.size / words.length;
    score += Math.floor(repetitionRatio * 30);
  }

  // Question marks = uncertainty
  const questions = (text.match(/\?/g) || []).length;
  score += Math.min(15, questions * 5);

  // Hedging words
  const hedgers = ['maybe', 'possibly', 'what if', 'should i', 'could', 'might', 'probably', 'not sure', 'i think', 'i guess', 'i don\'t know'];
  const hedgeCount = hedgers.filter((h) => text.toLowerCase().includes(h)).length;
  score += Math.min(15, hedgeCount * 5);

  // Length penalty
  if (words.length > 100) score += 10;
  else if (words.length > 50) score += 5;

  return Math.min(95, Math.max(15, score));
}

export async function generateDrainResponse(
  text: string,
  personality: SocraPersonality
): Promise<string> {
  const extra =
    'The user just did a "Thought Drain" — they dumped a spiraling thought. Your job: challenge it, cut through the noise, and ask the ONE question that gets to the core. Make them uncomfortable with their own pattern.';
  try {
    return await callGroq(getSystemPrompt(personality, extra), `User's thought dump:\n"${text}"`);
  } catch {
    return "You already know the answer. You're stalling. What would you do if you couldn't think about this anymore?";
  }
}

export async function generateTribunalVerdict(
  topic: string,
  sideA: string,
  sideB: string,
  personality: SocraPersonality
): Promise<string> {
  const extra =
    'The user is in the "Inner Tribunal" — they debated both sides of a decision. You are the judge. Deliver a verdict. Pick a side or reject both. Be decisive. End with a locked decision and command. Never say "both sides have merit" without picking one.';
  try {
    return await callGroq(
      getSystemPrompt(personality, extra),
      `Topic: "${topic}"\nSide A argues: "${sideA}"\nSide B argues: "${sideB}"\n\nDeliver your verdict.`
    );
  } catch {
    return "Both arguments are just different flavors of delay. Pick the one that scares you more — that's where growth lives. Decision is locked.";
  }
}

export async function generateChatResponse(
  message: string,
  recentHistory: ChatMessage[],
  personality: SocraPersonality
): Promise<string> {
  const extra =
    'You are in a direct conversation with the user. Respond to their message. Stay in character. Push toward action.';
  const historyContext = recentHistory
    .slice(-6)
    .map((m) => `${m.role === 'user' ? 'User' : 'Socra'}: ${m.text}`)
    .join('\n');
  const prompt = historyContext
    ? `Recent conversation:\n${historyContext}\n\nUser's new message: "${message}"`
    : `User says: "${message}"`;
  try {
    return await callGroq(getSystemPrompt(personality, extra), prompt);
  } catch {
    return "Stop explaining. Start doing. What's one action you can take in the next 10 minutes?";
  }
}

export interface EchoAnalysisResult {
  loopScore: number;
  patterns: string[];
  topLoop: string;
  bluntVerdict: string;
  actionPrompt: string;
}

export async function analyzeEcho(
  text: string,
  recentDrains: string[],
  personality: SocraPersonality
): Promise<EchoAnalysisResult> {
  const extra = `You are running the "Echo Detector" — analyzing text for overthinking patterns. Respond ONLY with valid JSON in this exact format:
{"patterns": ["Pattern Name 1", "Pattern Name 2"], "topLoop": "one sentence describing the dominant loop", "bluntVerdict": "your 1-2 sentence brutally honest verdict", "actionPrompt": "specific actionable command for the user"}

Pattern types to detect: Circular Reasoning, Analysis Paralysis, Catastrophizing, False Dichotomy, Validation Seeking, Perfectionism Loop, Fear Masking, Decision Avoidance.
Pick 2-4 that apply.`;

  const drainsContext =
    recentDrains.length > 0
      ? `\n\nTheir recent thought drains for context:\n${recentDrains.slice(0, 5).map((d, i) => `${i + 1}. "${d}"`).join('\n')}`
      : '';

  try {
    const raw = await callGroq(
      getSystemPrompt(personality, extra),
      `Analyze this text for overthinking patterns:\n"${text}"${drainsContext}`
    );

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');
    const parsed = JSON.parse(jsonMatch[0]);

    return {
      loopScore: computeLoopScore(text),
      patterns: parsed.patterns || ['Analysis Paralysis'],
      topLoop: parsed.topLoop || 'Repeated avoidance disguised as planning',
      bluntVerdict: parsed.bluntVerdict || "You're not thinking — you're hiding inside the thought.",
      actionPrompt: parsed.actionPrompt || "Write one sentence saying what you'll do in the next hour.",
    };
  } catch {
    return {
      loopScore: computeLoopScore(text),
      patterns: ['Analysis Paralysis', 'Circular Reasoning'],
      topLoop: 'Repeated avoidance disguised as planning',
      bluntVerdict: "You're not thinking — you're hiding inside the thought.",
      actionPrompt: "Write one sentence saying what you'll do by end of day.",
    };
  }
}

export async function generatePatternInsight(
  drainTexts: string[],
  personality: SocraPersonality
): Promise<string> {
  const extra =
    'You are generating a "Pattern DNA" analysis — identifying the user\'s core avoidance style based on their thought drain history. Name their avoidance archetype (e.g., "The Researcher," "The Perfectionist," "The Catastrophizer") and explain in 2-3 sentences how it manifests. Be specific to THEIR patterns.';
  try {
    return await callGroq(
      getSystemPrompt(personality, extra),
      `Here are the user's recent thought drains:\n${drainTexts.slice(0, 10).map((d, i) => `${i + 1}. "${d}"`).join('\n')}\n\nIdentify their avoidance archetype and pattern.`
    );
  } catch {
    return 'The Analyst — You break everything into sub-problems until the original problem disappears. Your research is procrastination wearing a lab coat.';
  }
}

export async function generateWeeklyVerdict(
  stats: {
    chamberScore: number;
    totalDrains: number;
    totalTribunals: number;
    commitmentsKept: number;
    commitmentsBroken: number;
    currentStreak: number;
  },
  personality: SocraPersonality
): Promise<string> {
  const extra =
    'You are delivering a weekly performance verdict. Be honest about their progress (or lack of it). Reference specific numbers. End with a challenge for next week.';
  try {
    return await callGroq(
      getSystemPrompt(personality, extra),
      `Weekly stats:\n- Escape Score: ${stats.chamberScore}\n- Drains completed: ${stats.totalDrains}\n- Tribunals held: ${stats.totalTribunals}\n- Commitments kept: ${stats.commitmentsKept}\n- Commitments broken: ${stats.commitmentsBroken}\n- Current streak: ${stats.currentStreak} days\n\nDeliver your weekly verdict.`
    );
  } catch {
    return "Your numbers tell a story — and it's a short one. More drains, fewer decisions. Next week, flip that ratio or the Graveyard grows.";
  }
}
