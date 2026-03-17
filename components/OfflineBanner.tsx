import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import Colors from '@/constants/colors';

export default function OfflineBanner() {
  const netInfo = useNetInfo();

  if (netInfo.isConnected !== false) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>NO CONNECTION — DATA WON'T SYNC</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: Colors.danger,
    paddingVertical: 6,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800' as const,
    letterSpacing: 2,
  },
});
