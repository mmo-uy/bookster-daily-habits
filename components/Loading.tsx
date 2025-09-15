import { COLORS } from '@/constants/colors';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface LoadingProps {
  message?: string;
  size?: 'small' | 'large';
  fullScreen?: boolean;
}

export function Loading({
  message = 'Loading...',
  size = 'large',
  fullScreen = false
}: LoadingProps) {
  const containerStyle = fullScreen
    ? [styles.container, styles.fullScreen]
    : styles.container;

  return (
    <ThemedView style={containerStyle}>
      <View style={styles.content}>
        <ActivityIndicator
          size={size}
          color={COLORS.primary}
          style={styles.spinner}
        />
        <ThemedText style={styles.message}>{message}</ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 100,
  },
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
});