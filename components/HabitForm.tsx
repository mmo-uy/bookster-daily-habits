import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { DayOfWeek, Habit } from '../types/habits';
import { ThemedText } from './themed-text';

interface HabitFormProps {
  isVisible: boolean;
  isEditMode: boolean;
  editingHabit: Habit | null;
  onSubmit: (data: {
    name: string;
    description: string;
    dayOfWeek: DayOfWeek;
  }) => void;
  onCancel: () => void;
  onDelete?: (habitId: string) => void;
  title?: string;
}

export const HabitForm: React.FC<HabitFormProps> = ({
  isVisible,
  isEditMode,
  editingHabit,
  onSubmit,
  onCancel,
  onDelete,
  title,
}) => {
  const [habitName, setHabitName] = useState<string>('');
  const [habitDescription, setHabitDescription] = useState<string>('');
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<DayOfWeek>('monday');

  useEffect(() => {
    if (isVisible) {
      if (isEditMode && editingHabit) {
        setHabitName(editingHabit.name || '');
        setHabitDescription(editingHabit.description || '');
        setSelectedDayOfWeek(editingHabit.dayOfWeek || 'monday');
      } else {
        setHabitName('');
        setHabitDescription('');
        setSelectedDayOfWeek('monday');
      }
    }
  }, [isVisible, isEditMode, editingHabit]);

  const handleSubmit = () => {
    const trimmedName = safeHabitName.trim();
    if (trimmedName) {
      onSubmit({
        name: trimmedName,
        description: (habitDescription || '').trim(),
        dayOfWeek: selectedDayOfWeek,
      });
    }
  };

  const handleCancel = () => {
    setHabitName('');
    setHabitDescription('');
    setSelectedDayOfWeek('monday');
    onCancel();
  };

  const safeHabitName = habitName || '';

  if (!isVisible) return null;

  return (
    <View style={styles.formContainer}>
      {title && (
        <ThemedText type="title" style={styles.formTitle}>
          {title}
        </ThemedText>
      )}

      <TextInput
        style={styles.input}
        placeholder="Habit name"
        value={habitName}
        onChangeText={setHabitName}
        placeholderTextColor="#666"
      />

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Description (optional)"
        value={habitDescription}
        onChangeText={setHabitDescription}
        multiline
        numberOfLines={3}
        placeholderTextColor="#666"
      />

      <ThemedText style={styles.dayLabel}>Select Day:</ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.daySelector}
        contentContainerStyle={styles.daySelectorContent}
      >
        {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const).map((day) => (
          <TouchableOpacity
            key={day}
            style={[
              styles.dayButton,
              selectedDayOfWeek === day && styles.dayButtonActive,
            ]}
            onPress={() => setSelectedDayOfWeek(day)}
          >
            <ThemedText
              style={[
                styles.dayButtonText,
                selectedDayOfWeek === day && styles.dayButtonTextActive,
              ]}
            >
              {day.charAt(0).toUpperCase() + day.slice(1, 3)}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
        </TouchableOpacity>

        {isEditMode && onDelete && editingHabit && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onDelete(editingHabit.id)}
          >
            <ThemedText style={styles.deleteButtonText}>Delete</ThemedText>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.submitButton, !safeHabitName.trim() && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!safeHabitName.trim()}
        >
          <ThemedText style={styles.submitButtonText}>
            {isEditMode ? 'Update Habit' : 'Add Habit'}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    color: '#000000',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dayLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    alignSelf: 'flex-start',
    color: '#333333',
  },
  daySelector: {
    maxHeight: 50,
    marginBottom: 16,
  },
  daySelectorContent: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  dayButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minWidth: 70,
    alignItems: 'center',
  },
  dayButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  dayButtonText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  dayButtonTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
  },
  cancelButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});