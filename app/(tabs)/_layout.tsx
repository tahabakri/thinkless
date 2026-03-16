import { Tabs } from "expo-router";
import { Home, BrainCircuit, Gavel, Lock, MessageSquare } from "lucide-react-native";
import React from "react";
import Colors from "@/constants/colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.inactive,
        tabBarStyle: {
          backgroundColor: Colors.tabBar,
          borderTopColor: Colors.tabBarBorder,
          borderTopWidth: 1,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontWeight: "800" as const,
          fontSize: 9,
          letterSpacing: 1.5,
          textTransform: "uppercase",
        },
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: "BASE",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size - 2} />,
        }}
      />
      <Tabs.Screen
        name="drain"
        options={{
          title: "DRAIN",
          tabBarIcon: ({ color, size }) => <BrainCircuit color={color} size={size - 2} />,
        }}
      />
      <Tabs.Screen
        name="tribunal"
        options={{
          title: "TRIBUNAL",
          tabBarIcon: ({ color, size }) => <Gavel color={color} size={size - 2} />,
        }}
      />
      <Tabs.Screen
        name="vault"
        options={{
          title: "VAULT",
          tabBarIcon: ({ color, size }) => <Lock color={color} size={size - 2} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "SOCRA",
          tabBarIcon: ({ color, size }) => <MessageSquare color={color} size={size - 2} />,
        }}
      />
    </Tabs>
  );
}
