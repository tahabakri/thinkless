let Notifications: typeof import('expo-notifications') | null = null;

try {
  Notifications = require('expo-notifications');
  Notifications!.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch {
  // expo-notifications not available (e.g. Expo Go SDK 53+)
}

export async function registerForPushNotifications(_deviceId: string): Promise<string | null> {
  return null;
}

export async function scheduleDailyCheckinReminder(_hour: number = 9, _minute: number = 0): Promise<void> {
  if (!Notifications) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'MORNING RITUAL WAITING',
        body: '3 questions. 2 minutes. No thinking. Start your day with Socra.',
        data: { route: '/daily-checkin' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: _hour,
        minute: _minute,
      },
    });
  } catch {}
}

export async function scheduleWeeklyReportReminder(): Promise<void> {
  if (!Notifications) return;
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'WEEKLY REPORT READY',
        body: "Socra's reviewed your week. Open to see the verdict.",
        data: { route: '/weekly-report' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: 1,
        hour: 10,
        minute: 0,
      },
    });
  } catch {}
}

export async function scheduleLocalNotification(
  title: string,
  body: string,
  seconds: number
): Promise<string> {
  if (!Notifications) return '';
  return Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
    },
  });
}

export async function cancelAllScheduledNotifications(): Promise<void> {
  if (!Notifications) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function scheduleCommitmentReminder(
  commitmentId: string,
  decision: string,
  deadlineMs: number
): Promise<void> {
  if (!Notifications) return;
  const now = Date.now();

  // Gentle reminder: 24h before deadline
  const gentleSeconds = Math.floor((deadlineMs - now - 86400000) / 1000);
  if (gentleSeconds > 0) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'COMMITMENT REMINDER',
          body: `You have 24 hours left: "${decision.slice(0, 60)}..."`,
          data: { route: '/vault', commitmentId },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: gentleSeconds,
        },
      });
    } catch {}
  }

  // Urgent reminder: 1h before deadline
  const urgentSeconds = Math.floor((deadlineMs - now - 3600000) / 1000);
  if (urgentSeconds > 0) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'DEADLINE APPROACHING',
          body: `1 HOUR LEFT to prove: "${decision.slice(0, 50)}..." — Submit proof or face the Graveyard.`,
          data: { route: '/vault', commitmentId },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: urgentSeconds,
        },
      });
    } catch {}
  }

  // Overdue: at deadline
  const overdueSeconds = Math.floor((deadlineMs - now) / 1000);
  if (overdueSeconds > 0) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'COMMITMENT OVERDUE',
          body: `TIME IS UP. "${decision.slice(0, 50)}..." — The Graveyard awaits.`,
          data: { route: '/vault', commitmentId },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: overdueSeconds,
        },
      });
    } catch {}
  }
}

export async function scheduleSocraticSlap(
  frequency: 'aggressive' | 'daily' | 'gentle'
): Promise<void> {
  if (!Notifications) return;

  const SLAP_MESSAGES = [
    { title: 'SOCRA SAYS', body: "You're thinking about thinking again. Stop it. What's one action you can take right now?" },
    { title: 'REALITY CHECK', body: "That thing you've been 'processing'? You already know the answer. Act on it." },
    { title: 'LOOP ALERT', body: "How many times have you replayed this conversation in your head today? Drain it. Now." },
    { title: 'DECISION TIME', body: "Every minute you spend deciding is a minute you could spend doing. Pick one. Go." },
  ];

  const seconds =
    frequency === 'aggressive' ? 7200 :
    frequency === 'daily' ? 86400 :
    259200;

  const msg = SLAP_MESSAGES[Math.floor(Math.random() * SLAP_MESSAGES.length)];

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: msg.title,
        body: msg.body,
        data: { route: '/(tabs)/drain' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds,
        repeats: true,
      },
    });
  } catch {}
}
