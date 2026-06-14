import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';

interface CounterProps {
  value: number;
  handleIncrement: () => void;
  handleDecrement: () => void;
  handlePassValue: () => void;
}

export const Counter: React.FC<CounterProps> = ({
  value,
  handleIncrement,
  handleDecrement,
  handlePassValue,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.displayContainer}>
        <Text style={styles.label}>COUNTER VALUE</Text>
        <Text style={styles.counterText}>{value}</Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[styles.button, styles.decrementButton]} 
          onPress={handleDecrement}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>DECREMENT</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.incrementButton]} 
          onPress={handleIncrement}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>INCREMENT</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.passButton} 
        onPress={handlePassValue}
        activeOpacity={0.8}
      >
        <Text style={styles.passButtonText}>PASS VALUE</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 15,
  } as ViewStyle,
  displayContainer: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  } as ViewStyle,
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A99AD',
    letterSpacing: 2,
    marginBottom: 5,
  } as TextStyle,
  counterText: {
    fontSize: 54,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(99, 102, 241, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  } as TextStyle,
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
    marginBottom: 16,
  } as ViewStyle,
  button: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 1,
  } as ViewStyle,
  decrementButton: {
    backgroundColor: '#1E293B',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  } as ViewStyle,
  incrementButton: {
    backgroundColor: '#312E81',
    borderColor: '#4F46E5',
  } as ViewStyle,
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  } as TextStyle,
  passButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#6366F1',
  } as ViewStyle,
  passButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1.5,
  } as TextStyle,
});
