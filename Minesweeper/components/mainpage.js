import React, { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Slider from '@react-native-community/slider';  

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
      <Text style={styles.title}>MINESWEEPER</Text>

      {/* Minesweeper Logo */}
      <Image
        source={require('../assets/bomb.png')}  
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
        step={1}  
        onValueChange={(value) => setDifficulty(value)}
        minimumTrackTintColor={getDifficultyColor(difficulty)}
        maximumTrackTintColor="#000000"
        thumbTintColor={getDifficultyColor(difficulty)} 
      />

      {/* Instructions*/}
      <Text style={styles.instructions}>
      Welcome to Minesweeper! The goal is to clear all the cells without detonating any mines.
      - Tap on a cell to reveal what's underneath.
      - Numbers show how many mines are adjacent to that cell.
      - Long press to flag a cell if you think there's a mine.
      Clear the board to win. Good luck!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#212121',
    padding: 80,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 30,
    color: "#f0f0f0"
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
    height: 80,
    marginBottom: 20,
  },
  instructions: {
    fontSize: 14,
    textAlign: 'center',
    color: '#f0f0f0',
    paddingHorizontal: 2,
  },
});

export default MainPage;
