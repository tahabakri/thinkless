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
