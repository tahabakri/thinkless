export interface ThoughtTemplate {
  id: string;
  category: string;
  title: string;
  prompt: string;
  prefill: string;
  icon: string;
}

const templates: ThoughtTemplate[] = [
  // Career
  {
    id: 'career_change',
    category: 'Career',
    title: 'Career Change',
    prompt: 'What specific career move are you overthinking?',
    prefill: 'I keep going back and forth about whether I should ',
    icon: 'briefcase',
  },
  {
    id: 'career_negotiation',
    category: 'Career',
    title: 'Negotiation',
    prompt: 'What are you afraid to ask for?',
    prefill: "I want to ask for a raise/promotion but I'm worried that ",
    icon: 'briefcase',
  },
  // Relationships
  {
    id: 'rel_conversation',
    category: 'Relationships',
    title: 'Hard Conversation',
    prompt: 'What conversation are you avoiding?',
    prefill: "I need to tell someone that ",
    icon: 'heart',
  },
  {
    id: 'rel_boundary',
    category: 'Relationships',
    title: 'Setting Boundaries',
    prompt: "What boundary can't you set?",
    prefill: "I keep letting people ",
    icon: 'heart',
  },
  // Finance
  {
    id: 'fin_investment',
    category: 'Finance',
    title: 'Money Decision',
    prompt: 'What financial decision are you paralyzed by?',
    prefill: "I can't decide whether to spend/invest/save because ",
    icon: 'dollar-sign',
  },
  {
    id: 'fin_purchase',
    category: 'Finance',
    title: 'Big Purchase',
    prompt: 'What purchase are you endlessly researching?',
    prefill: "I've been researching this for weeks but I still can't decide on ",
    icon: 'dollar-sign',
  },
  // Health
  {
    id: 'health_habit',
    category: 'Health',
    title: 'Health Habit',
    prompt: 'What health change are you overthinking?',
    prefill: 'I know I should start/stop ',
    icon: 'activity',
  },
  {
    id: 'health_appointment',
    category: 'Health',
    title: 'Medical Decision',
    prompt: 'What health appointment/decision are you avoiding?',
    prefill: "I've been putting off ",
    icon: 'activity',
  },
  // Creative
  {
    id: 'creative_start',
    category: 'Creative',
    title: 'Starting a Project',
    prompt: 'What project are you planning instead of starting?',
    prefill: "I want to create/build/write ",
    icon: 'sparkles',
  },
  {
    id: 'creative_share',
    category: 'Creative',
    title: 'Sharing Work',
    prompt: "What work are you too afraid to share?",
    prefill: "I've been sitting on this because I'm afraid people will think ",
    icon: 'sparkles',
  },
];

export const TEMPLATE_CATEGORIES = ['Career', 'Relationships', 'Finance', 'Health', 'Creative'] as const;

export default templates;
