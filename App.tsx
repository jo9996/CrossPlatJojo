import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Counter } from './Counter';
import { Profile } from './Profile';

export default function App() {
  // State for current interactive values
  const [counter, setCounter] = useState<number>(0);
  const [tempName, setTempName] = useState<string>('');

  // State for committed profile values (only updated on "Pass Value" click)
  const [profileName, setProfileName] = useState<string>('Anonymous');
  const [profileAge, setProfileAge] = useState<number>(0);

  // Handlers for counter
  const handleIncrement = () => {
    setCounter((prev) => prev + 1);
  };

  const handleDecrement = () => {
    // Prevent age/counter from going negative
    setCounter((prev) => Math.max(0, prev - 1));
  };

  // Handler to pass the values to the profile
  const handlePassValue = () => {
    // If name is empty, default to "Anonymous"
    setProfileName(tempName.trim() ? tempName.trim() : 'Anonymous');
    setProfileAge(counter);
  };

  return (
    <LinearGradient
      colors={['#0F172A', '#1E1B4B']} // Premium deep dark slate to dark indigo gradient
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header section */}
            <View style={styles.header}>
              <Text style={styles.title}>Mobile Programming</Text>
              <Text style={styles.subtitle}>Modul 3: Components & Props</Text>
            </View>

            {/* Input card */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>INPUT NAMA</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Input your name here"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                value={tempName}
                onChangeText={setTempName}
                autoCorrect={false}
              />
            </View>

            {/* Counter controls */}
            <Counter
              value={counter}
              handleIncrement={handleIncrement}
              handleDecrement={handleDecrement}
              handlePassValue={handlePassValue}
            />

            {/* Profile visualization */}
            <Profile name={profileName} age={profileAge} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  } as ViewStyle,
  safeArea: {
    flex: 1,
  } as ViewStyle,
  keyboardView: {
    flex: 1,
  } as ViewStyle,
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  header: {
    alignItems: 'center',
    marginBottom: 30,
  } as ViewStyle,
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginBottom: 4,
  } as TextStyle,
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#818CF8', // Elegant Indigo accent
    letterSpacing: 0.5,
  } as TextStyle,
  card: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  } as ViewStyle,
  cardLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#818CF8',
    letterSpacing: 1.5,
    marginBottom: 10,
  } as TextStyle,
  textInput: {
    height: 52,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  } as TextStyle,
});
