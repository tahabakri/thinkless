import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { AppProvider } from "@/providers/AppProvider";
import Colors from "@/constants/colors";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "BACK",
        headerStyle: { backgroundColor: Colors.bg },
        headerTintColor: Colors.text,
        headerTitleStyle: { fontWeight: "900" as const, letterSpacing: 1 } as any,
        contentStyle: { backgroundColor: Colors.bg },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="leaderboard" options={{ title: "LEADERBOARD", presentation: "modal" }} />
      <Stack.Screen name="echo-detector" options={{ title: "ECHO DETECTOR", presentation: "modal" }} />
      <Stack.Screen name="settings" options={{ title: "SETTINGS", presentation: "modal" }} />
      <Stack.Screen name="paywall" options={{ title: "", presentation: "modal", headerShown: false }} />
      <Stack.Screen name="daily-checkin" options={{ title: "MORNING RITUAL", presentation: "modal" }} />
      <Stack.Screen name="spiral-timer" options={{ title: "SPIRAL TIMER", presentation: "modal" }} />
      <Stack.Screen name="weekly-report" options={{ title: "WEEKLY REPORT", presentation: "modal" }} />
      <Stack.Screen name="loop-history" options={{ title: "LOOP HISTORY", presentation: "modal" }} />
      <Stack.Screen name="graveyard" options={{ title: "THE GRAVEYARD", presentation: "modal" }} />
      <Stack.Screen name="pattern-dna" options={{ title: "PATTERN DNA", presentation: "modal" }} />
      <Stack.Screen name="external-inputs" options={{ title: "EXTERNAL INPUTS", presentation: "modal" }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AppProvider>
          <StatusBar style="light" />
          <RootLayoutNav />
        </AppProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
