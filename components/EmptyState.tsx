import React from 'react';
import { StyleSheet, View } from 'react-native';
import { COLORS } from '../constants/colors';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { IconSymbol } from './ui/icon-symbol';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No habits yet",
  message = "Create your first habit to get started on your journey!",
  icon = "plus.circle.fill",
}) => {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <IconSymbol
          name={icon as any}
          size={64}
          color={COLORS.text.secondary}
          style={styles.icon}
        />
        <ThemedText style={styles.title}>{title}</ThemedText>
        <ThemedText style={styles.message}>{message}</ThemedText>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  content: {
    alignItems: 'center',
    maxWidth: 280,
  },
  icon: {
    marginBottom: 24,
    opacity: 0.6,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});