import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal } from 'react-native';
import Slider from '@react-native-community/slider';

const MainPage = ({ navigation }) => {
  const [difficulty, setDifficulty] = useState(1);

  const [modalVisible, setModalVisible] = useState(false);

  const getDifficultyColor = (value) => {
    if (value < 1.5) return '#7ABA78';  
    if (value < 2.5) return '#FABC3F'; 
    return '#C80036';                   
  };

  const getDifficultyText = (value) => {
    if (value < 1.5) return 'Easy';
    if (value < 2.5) return 'Medium';
    return 'Hard';
  };

  const handlePlayPress = () => {
    console.log('Game started at difficulty:', getDifficultyText(difficulty));
    navigation.navigate('Minesweeper', { difficulty });
  };

  const handleSlidingComplete = (value) => {
    if (value < 1.5) {
      setDifficulty(1);  // Easy
    } else if (value < 2.5) {
      setDifficulty(2);  // Medium
    } else {
      setDifficulty(3);  // Hard
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MINESWEEPER</Text>
      <Image
        source={require('../assets/bomb.png')}
        style={styles.logo}
      />
      <Text style={[styles.difficultyText, { color: getDifficultyColor(difficulty) }]}>
        {getDifficultyText(difficulty)}
      </Text>
      <Slider
        style={styles.slider}
        minimumValue={1}
        maximumValue={3}
        value={difficulty}
        onValueChange={(value) => setDifficulty(value)} 
        onSlidingComplete={handleSlidingComplete}
        step={0.01}  
        minimumTrackTintColor={getDifficultyColor(difficulty)}
        maximumTrackTintColor="#000000"
        thumbTintColor={getDifficultyColor(difficulty)}
      />
      <TouchableOpacity
        style={[styles.playButton, { backgroundColor: getDifficultyColor(difficulty) }]}
        onPress={handlePlayPress}
      >
        <Text style={styles.playButtonText}>PLAY</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.helpButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.helpButtonText}>?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.settingsButtonText}>!</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Instructions</Text>
            <Text style={styles.modalInstructions}>
              The goal is to clear all the cells without detonating any mines.
              - Tap on a cell to reveal what's underneath.
              - Numbers show how many mines are adjacent to that cell.
              - Long press to flag a cell if you think there's a mine.
              Clear the board to win. Good luck!
            </Text>
            <TouchableOpacity
              style={[styles.playButton, { backgroundColor: '#7ABA78' }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.playButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#212431',
    padding: 80,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#f0f0f0',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  difficultyText: {
    marginTop: 54,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  slider: {
    width: 200,
    height: 40,
    marginBottom: 20,
  },
  playButton: {
    width: 200,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  playButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  helpButton: {
    width: 50,
    height: 50,
    backgroundColor: '#444',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  helpButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
      fontSize: 24,
      fontWeight: 'bold',
      color: '#fff',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalView: {
    backgroundColor: '#212431',
    borderRadius: 10,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: "#fff"
  },
  modalInstructions: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: "#fff"
  },
});

export default MainPage;