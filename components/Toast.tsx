import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Toast, { BaseToast, BaseToastProps, ToastConfig } from 'react-native-toast-message';
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react-native';
import Colors from '@/constants/colors';

function CustomToast({
  icon,
  text1,
  text2,
  borderColor,
}: {
  icon: React.ReactNode;
  text1?: string;
  text2?: string;
  borderColor: string;
}) {
  return (
    <View style={[styles.container, { borderLeftColor: borderColor }]}>
      <View style={styles.icon}>{icon}</View>
      <View style={styles.textWrap}>
        {text1 && <Text style={styles.title}>{text1}</Text>}
        {text2 && <Text style={styles.subtitle}>{text2}</Text>}
      </View>
    </View>
  );
}

export const toastConfig: ToastConfig = {
  success: ({ text1, text2 }) => (
    <CustomToast
      icon={<CheckCircle size={20} color={Colors.accent} />}
      text1={text1}
      text2={text2}
      borderColor={Colors.accent}
    />
  ),
  error: ({ text1, text2 }) => (
    <CustomToast
      icon={<XCircle size={20} color={Colors.danger} />}
      text1={text1}
      text2={text2}
      borderColor={Colors.danger}
    />
  ),
  info: ({ text1, text2 }) => (
    <CustomToast
      icon={<Info size={20} color={Colors.accentHover} />}
      text1={text1}
      text2={text2}
      borderColor={Colors.accentHover}
    />
  ),
  warning: ({ text1, text2 }) => (
    <CustomToast
      icon={<AlertTriangle size={20} color={Colors.warning} />}
      text1={text1}
      text2={text2}
      borderColor={Colors.warning}
    />
  ),
  achievement: ({ text1, text2 }) => (
    <CustomToast
      icon={<CheckCircle size={20} color="#FFD700" />}
      text1={text1}
      text2={text2}
      borderColor="#FFD700"
    />
  ),
};

const styles = StyleSheet.create({
  container: {
    width: '90%',
    backgroundColor: Colors.bg2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  icon: {
    marginRight: 12,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
});

export { Toast };
