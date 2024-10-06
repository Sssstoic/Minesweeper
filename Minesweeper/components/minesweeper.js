import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';

const Minesweeper = ({ navigation }) => {
  const boardSize = 8;  // Simple 8x8 board
  const bombCount = 10; // 10 bombs
  const [board, setBoard] = useState([]);
  const [flagsLeft, setFlagsLeft] = useState(bombCount);
  const [gameOver, setGameOver] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [selectedTool, setSelectedTool] = useState('shovel'); // 'shovel' or 'flag'

  // Initialize board and bombs
  const initializeBoard = () => {
    let newBoard = Array(boardSize)
      .fill(null)
      .map(() =>
        Array(boardSize)
          .fill(null)
          .map(() => ({ revealed: false, hasBomb: false, flagged: false, adjacentBombs: 0 }))
      );
    let bombsPlaced = 0;
    while (bombsPlaced < bombCount) {
      let row = Math.floor(Math.random() * boardSize);
      let col = Math.floor(Math.random() * boardSize);
      if (!newBoard[row][col].hasBomb) {
        newBoard[row][col].hasBomb = true;
        bombsPlaced++;
      }
    }
    calculateAdjacentBombs(newBoard);
    setBoard(newBoard);
    setFlagsLeft(bombCount);
    setGameOver(false);
    setHintUsed(false);
  };

  // Calculate the number of bombs around each cell
  const calculateAdjacentBombs = (board) => {
    const directions = [
      [0, 1], [1, 1], [1, 0], [1, -1],
      [0, -1], [-1, -1], [-1, 0], [-1, 1],
    ];
    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col < boardSize; col++) {
        if (board[row][col].hasBomb) continue;
        let adjacentBombs = 0;
        directions.forEach(([dx, dy]) => {
          const newRow = row + dx;
          const newCol = col + dy;
          if (
            newRow >= 0 && newRow < boardSize &&
            newCol >= 0 && newCol < boardSize &&
            board[newRow][newCol].hasBomb
          ) {
            adjacentBombs++;
          }
        });
        board[row][col].adjacentBombs = adjacentBombs;
      }
    }
  };

  // Handle clicking on a cell
  const handleCellPress = (row, col) => {
    if (gameOver || board[row][col].revealed || board[row][col].flagged) return;
    if (selectedTool === 'shovel') {
      if (board[row][col].hasBomb) {
        setGameOver(true);
        Alert.alert('Game Over', 'You clicked on a bomb!');
      } else {
        revealCell(row, col);
        if (checkWin()) {
          Alert.alert('Congratulations!', 'You won the game!');
        }
      }
    } else if (selectedTool === 'flag' && !board[row][col].revealed) {
      if (board[row][col].flagged) {
        board[row][col].flagged = false;
        setFlagsLeft(flagsLeft + 1);
      } else if (flagsLeft > 0) {
        board[row][col].flagged = true;
        setFlagsLeft(flagsLeft - 1);
      }
      setBoard([...board]);
    }
  };

  // Reveal a cell and recursively reveal adjacent cells if no bombs nearby
  const revealCell = (row, col) => {
    if (board[row][col].revealed || board[row][col].flagged) return;
    board[row][col].revealed = true;
    setBoard([...board]);
    if (board[row][col].adjacentBombs === 0) {
      const directions = [
        [0, 1], [1, 1], [1, 0], [1, -1],
        [0, -1], [-1, -1], [-1, 0], [-1, 1],
      ];
      directions.forEach(([dx, dy]) => {
        const newRow = row + dx;
        const newCol = col + dy;
        if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize) {
          revealCell(newRow, newCol);
        }
      });
    }
  };

  // Check if player won
  const checkWin = () => {
    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col < boardSize; col++) {
        if (!board[row][col].hasBomb && !board[row][col].revealed) {
          return false;
        }
      }
    }
    return true;
  };

  // Use hint to reveal a safe cell
  const useHint = () => {
    if (hintUsed) return;
    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col < boardSize; col++) {
        if (!board[row][col].hasBomb && !board[row][col].revealed) {
          revealCell(row, col);
          setHintUsed(true);
          break;
        }
      }
    }
  };

  // Initialize board when component mounts
  useEffect(() => {
    initializeBoard();
  }, []);

  return (
    <View style={styles.container}>
      {/* Top buttons */}
      <View style={styles.topButtons}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.topButton}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={initializeBoard} style={styles.topButton}>
          <Text style={styles.buttonText}>Restart</Text>
        </TouchableOpacity>
      </View>

      {/* Game board */}
      <View style={styles.board}>
        {board.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((cell, colIndex) => (
              <TouchableOpacity
                key={colIndex}
                onPress={() => handleCellPress(rowIndex, colIndex)}
                style={[
                  styles.cell,
                  cell.revealed && styles.revealedCell,
                  cell.flagged && styles.flaggedCell,
                ]}
              >
                {cell.revealed && !cell.hasBomb && <Text>{cell.adjacentBombs || ''}</Text>}
                {cell.revealed && cell.hasBomb && <Image source={require('../assets/bomb.png')} style={styles.bombIcon} />}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      {/* Bomb counter and tools */}
      <View style={styles.tools}>
        <Text style={styles.bombCounter}>Bombs left: {flagsLeft}</Text>
        <TouchableOpacity onPress={() => setSelectedTool('shovel')}>
          <Image source={require('../assets/shovel.png')} style={styles.toolIcon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSelectedTool('flag')}>
          <Image source={require('../assets/flag.png')} style={styles.toolIcon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={useHint} disabled={hintUsed}>
          <Text style={[styles.hintButton, hintUsed && styles.disabledHint]}>Hint</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#212121',
    paddingTop: 40,
  },
  topButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
  },
  topButton: {
    backgroundColor: '#444',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
  },
  board: {
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: 40,
    height: 40,
    backgroundColor: '#888',
    margin: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  revealedCell: {
    backgroundColor: '#ccc',
  },
  flaggedCell: {
    backgroundColor: '#f00',
  },
  bombIcon: {
    width: 24,
    height: 24,
  },
  tools: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '90%',
    marginBottom: 20,
  },
  bombCounter: {
    color: '#fff',
    fontSize: 18,
  },
  toolIcon: {
    width: 40,
    height: 40,
  },
  hintButton: {
    backgroundColor: '#ffcc00',
    padding: 10,
    borderRadius: 5,
    color: '#000',
  },
  disabledHint: {
    backgroundColor: '#555',
  },
});

export default Minesweeper;
