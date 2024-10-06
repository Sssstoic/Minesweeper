import React, { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Slider from '@react-native-community/slider';  // If you're using the community slider package

const MainPage = () => {
  const [difficulty, setDifficulty] = useState(1);

  // Get the color based on difficulty
  const getDifficultyColor = (value) => {
    if (value < 1.5) return 'green';  // Easy
    if (value < 2.5) return 'yellow'; // Medium
    return 'red';                     // Hard
  };

  const getDifficultyText = (value) => {
    if (value < 1.5) return 'Easy';
    if (value < 2.5) return 'Medium';
    return 'Hard';
  };

  return (
    <View style={styles.container}>
      {/* Minesweeper Title */}
      <Text style={styles.title}>Minesweeper</Text>

      {/* Minesweeper Logo */}
      <Image
        source={require('./assets/LOL.png')}  // Ensure the logo path is correct
        style={styles.logo}
      />

      {/* Difficulty Slider */}
      <Text style={[styles.difficultyText, { color: getDifficultyColor(difficulty) }]}>
        {getDifficultyText(difficulty)}
      </Text>
      <Slider
        style={styles.slider}
        minimumValue={1}
        maximumValue={3}
        step={1}  // Snap to 1, 2, or 3 (Easy, Medium, Hard)
        onValueChange={(value) => setDifficulty(value)}
        minimumTrackTintColor={getDifficultyColor(difficulty)}
        maximumTrackTintColor="#000000"
        thumbTintColor={getDifficultyColor(difficulty)}  // Thumb color changes with difficulty
      />

      {/* Instructions (Optional) */}
      <Text style={styles.instructions}>
        Drag the slider to select the difficulty: Easy (Green), Medium (Yellow), or Hard (Red)
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  difficultyText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  slider: {
    width: 300,
    height: 40,
    marginBottom: 20,
  },
  instructions: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
    paddingHorizontal: 20,
  },
});

export default MainPage;
