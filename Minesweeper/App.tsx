import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';  // Make sure Text is imported correctly
import MainMenu from './components/mainpage';

export default function App() {
  const [difficulty, setDifficulty] = useState<string | null>(null);  // String type for difficulty

  const handleDifficultySelect = (selectedDifficulty: 'easy' | 'medium' | 'hard') => {  // Explicitly type the parameter
    setDifficulty(selectedDifficulty);
    console.log(`Selected difficulty: ${selectedDifficulty}`);
    // You can add navigation logic or game setup based on the difficulty
  };

  return (
    <>
      {difficulty ? (
        <View>
          {/* Ensure Text and View are correctly imported */}
          <Text>Game Screen - Difficulty: {difficulty}</Text>
        </View>
      ) : (
        <MainMenu onDifficultySelect={handleDifficultySelect} />
      )}
      <StatusBar style="auto" />
    </>
  );
}
