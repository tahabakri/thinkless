import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '@/constants/colors';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Could send to error reporting service in the future
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.icon}>⚠</Text>
          <Text style={styles.title}>SOMETHING BROKE</Text>
          <Text style={styles.subtitle}>
            Even Socra crashes sometimes. The important thing is what you do next.
          </Text>
          <Text style={styles.errorText}>
            {this.state.error?.message || 'Unknown error'}
          </Text>
          <TouchableOpacity style={styles.button} onPress={this.handleReset} activeOpacity={0.7}>
            <Text style={styles.buttonText}>TRY AGAIN</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    color: Colors.danger,
    fontSize: 20,
    fontWeight: '900' as const,
    letterSpacing: 3,
    marginBottom: 12,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '500' as const,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  errorText: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '500' as const,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 24,
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: Colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  buttonText: {
    color: Colors.bg,
    fontSize: 14,
    fontWeight: '900' as const,
    letterSpacing: 2,
  },
});
