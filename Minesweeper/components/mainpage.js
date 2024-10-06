import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

const MainMenu = ({ onDifficultySelect }) => {
  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>MINESWEEPER</Text>
      <Image
      source={require('../assets/bomb.png')}  
      style={styles.logo}
      />
      <Text style={styles.instructions}>These are the instructions</Text>
      {/* Difficulty Selection */}
      <View style={styles.difficultyContainer}>
        <TouchableOpacity style={styles.button} onPress={() => onDifficultySelect('easy')}>
          <Text style={styles.buttonText}>Easy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => onDifficultySelect('medium')}>
          <Text style={styles.buttonText}>Medium</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => onDifficultySelect('hard')}>
          <Text style={styles.buttonText}>Hard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#282c34',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 30,
  },
  difficultyContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#61dafb',
    padding: 15,
    borderRadius: 10,
    width: 200,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 18,
  },
  instructions: {
    color: "#F1F1F1F1",
    fontSize: 16,
  }
});

export default MainMenu;
