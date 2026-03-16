import { Stack } from "expo-router";
import React from "react";
import Colors from "@/constants/colors";

export default function TribunalLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.bg },
        headerTintColor: Colors.text,
        headerTitleStyle: { fontWeight: "900" as const, letterSpacing: 1 } as any,
      }}
    >
      <Stack.Screen name="index" options={{ title: "THE TRIBUNAL" }} />
    </Stack>
  );
}
