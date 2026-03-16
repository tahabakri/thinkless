import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "LOST" }} />
      <View style={styles.container}>
        <Text style={styles.title}>WRONG TURN.</Text>
        <Text style={styles.subtitle}>This page doesn't exist. Stop overthinking it.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>GO BACK</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: Colors.bg,
  },
  title: {
    fontSize: 24,
    fontWeight: "900" as const,
    color: Colors.text,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 8,
  },
  link: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: Colors.accent,
  },
  linkText: {
    fontSize: 12,
    fontWeight: "900" as const,
    color: Colors.bg,
    letterSpacing: 2,
  },
});
