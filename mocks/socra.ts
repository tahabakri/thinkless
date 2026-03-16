import { SocraPersonality } from '@/types';

export const SOCRA_QUESTIONS: string[] = [
  "What would you do if you couldn't think about this anymore?",
  "You already know the answer. Why are you stalling?",
  "Strip away the fear. What's left?",
  "Three days from now, will this thought have moved you forward?",
  "You're not analyzing. You're hiding. From what?",
  "Name the worst case. Now — can you survive it?",
  "Is this thought protecting you, or trapping you?",
  "You've been circling this drain. Pick a direction.",
  "What would someone who doesn't overthink do right now?",
  "The cost of waiting is higher than the cost of being wrong.",
  "You're confusing preparation with procrastination.",
  "Your brain wants comfort. Your life needs a decision.",
];

export const SOCRA_VERDICTS: string[] = [
  "Both sides have merit. But only one leads to action. Go with the side that scares you more — that's where growth lives.",
  "You argued well. Too well. That's the problem. Stop being a lawyer and start being a human. Decision: move.",
  "Side A is comfort. Side B is chaos. You need chaos right now. Locked.",
  "Neither side wins because this debate was never the point. The point is you're still sitting here. Get up.",
  "The stronger argument doesn't matter. The faster action does. Pick and commit.",
];

export const SOCRA_ECHO_RESPONSES: string[] = [
  "You've said this exact thing 4 times this week. Different words, same fear.",
  "This is a loop, not a thought. Your brain is buffering.",
  "I've seen this pattern before — in your last 3 entries. You're not processing, you're replaying.",
  "Circular reasoning detected. You're using logic to avoid feeling.",
];

export const SOCRA_CHAT_RESPONSES: Record<SocraPersonality, string[]> = {
  default: [
    "Stop explaining. Start doing.",
    "That's your ego talking. What does your gut say?",
    "You don't need more information. You need more courage.",
    "I hear you. Now — what are you going to DO about it?",
    "Interesting thought. Completely useless without action.",
    "You've identified the problem 47 times. Try solving it once.",
    "Less analysis. More movement.",
    "Your overthinking has a body count — it's your time.",
    "You're not confused. You're scared. There's a difference.",
    "Every minute you spend 'figuring it out' is a minute you could spend doing it.",
  ],
  drill_sergeant: [
    "DROP AND GIVE ME A DECISION. NOW.",
    "You think the enemy waits while you 'process your feelings'? MOVE.",
    "I've seen recruits with more decisiveness than you. And they were asleep.",
    "You want a hug or a result? Because I only do results.",
    "Ten-HUT. Your thought spiral is DISMISSED. What's the action?",
    "Soldier, you've been AWOL from your own life for 3 weeks. Report for duty.",
    "The battlefield doesn't care about your analysis paralysis. DECIDE.",
    "Permission to overthink: DENIED. Permission to act: GRANTED.",
  ],
  stoic: [
    "The impediment to action advances action. What stands in the way becomes the way.",
    "You suffer more in imagination than in reality. — Seneca. Now act.",
    "Waste no more time arguing about what a good person should be. Be one.",
    "It is not death that a man should fear. He should fear never beginning to live.",
    "The best revenge against overthinking is right action. Marcus Aurelius would agree.",
    "Memento mori. You won't live forever. Make the choice while you still can.",
    "A blazing fire makes flame and brightness out of everything that is thrown into it. Be that fire.",
    "You have power over your mind — not outside events. Realize this, and you will find strength.",
  ],
  dark_humor: [
    "Oh good, you're still thinking. I was worried you might accidentally accomplish something.",
    "Your brain is like a browser with 400 tabs open. Time to force quit.",
    "Congrats — you've officially thought about this longer than most marriages last.",
    "At this rate, you'll have the perfect plan for your deathbed. Very efficient.",
    "Plot twist: the thing you're afraid of is less painful than this conversation.",
    "You know what's worse than making the wrong choice? This. This is worse.",
    "I'd tell you to sleep on it but you've been sleeping on it since 2019.",
    "Your comfort zone called. It says even IT is getting bored in here.",
  ],
  deadline: [
    "You have 24 hours. Clock starts now. What's the move?",
    "Every hour you delay costs you. I'm tracking. The meter is running.",
    "Deadline: tonight at midnight. No extensions. No excuses. What will you have done?",
    "I'm setting a timer. When it hits zero, the decision is made FOR you. Choose.",
    "48 hours. That's all you get. After that, I'm locking the default answer.",
    "The countdown started when you opened this app. What have you decided?",
    "Time check: you've spent 14 minutes on this already. That's 14 minutes of your life. Worth it?",
    "Tick tock. The universe doesn't wait for overthinkers.",
  ],
};

export const SOCRA_INTERVENTION_MESSAGES: string[] = [
  "INTERVENTION: You've circled this loop %d times without action. I'm blocking your drain until you decide. Go to the Tribunal. Now.",
  "LOOP DETECTED: Same topic, %d entries, zero commitments. No more thinking allowed. Decide or delete.",
  "I've watched you replay this for %d sessions. Enough. The Tribunal is waiting. No more drains until you face this.",
];

export const SOCRA_SHAME_NOTIFICATIONS: string[] = [
  "Day %d streak dead. You chose comfort again.",
  "Remember that commitment? Neither does your action history.",
  "Your streak just flatlined. Socra noticed. Everyone noticed.",
  "Another commitment buried in the Graveyard. Rest in procrastination.",
];

export const SOCRA_MORNING_PROMPTS = {
  avoiding: "What decision are you avoiding today?",
  action: "What's your ONE committed action for today?",
  loop: "What loop ran your head yesterday?",
};

export const PATTERN_DNA_STYLES: string[] = [
  'The Researcher — You hide behind "gathering more data" to avoid commitment.',
  'The Perfectionist — Nothing is ever ready enough, good enough, or safe enough to act on.',
  'The Catastrophizer — You simulate every disaster to justify staying still.',
  'The Analyst — You break everything into sub-problems until the original problem disappears.',
  'The Validator — You need external permission to trust your own judgment.',
  'The Planner — Your plans have plans. None of them have start dates.',
];

export const WEEKLY_VERDICTS: string[] = [
  "Decent week. You moved more than you thought. But you still have loops eating your mornings. Fix that.",
  "Brutal truth: you committed less than you could have. The Graveyard grew. Next week, prove me wrong.",
  "Progress is happening. Slowly. Like a glacier. But glaciers move mountains eventually. Keep going.",
  "Your escape score went up but your commitment rate went down. You're thinking better but acting the same. Not enough.",
  "Best week yet. Don't get comfortable — that's when the loops sneak back in.",
];

export function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateLoopScore(): number {
  return Math.floor(Math.random() * 60) + 20;
}
