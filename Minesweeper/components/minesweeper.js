import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Image, StyleSheet } from 'react-native';

const Minesweeper = ({ route, navigation }) => {
  const { difficulty } = route.params;

  const boardSize = 8;
  const bombCount = 10;
  const [board, setBoard] = useState([]);
  const [flagsLeft, setFlagsLeft] = useState(bombCount);
  const [gameOver, setGameOver] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [selectedTool, setSelectedTool] = useState('shovel');

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

  // Updated revealCell function for first-time "explosion"
  const revealCell = (row, col) => {
    if (board[row][col].revealed || board[row][col].flagged) return;

    board[row][col].revealed = true;

    if (board[row][col].adjacentBombs === 0) {
      const directions = [
        [0, 1], [1, 1], [1, 0], [1, -1],
        [0, -1], [-1, -1], [-1, 0], [-1, 1],
      ];

      // Recursively reveal nearby cells
      directions.forEach(([dx, dy]) => {
        const newRow = row + dx;
        const newCol = col + dy;
        if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize) {
          revealCell(newRow, newCol);  // Recursion to open adjacent cells
        }
      });
    }

    setBoard([...board]);  // Trigger re-render
  };

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

  const useHint = () => {
    if (hintUsed) return;
    let hintFound = false;
    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col < boardSize; col++) {
        if (!board[row][col].hasBomb && !board[row][col].revealed) {
          revealCell(row, col);
          setHintUsed(true);
          hintFound = true;
          break;
        }
      }
      if (hintFound) break;
    }
  };

  useEffect(() => {
    initializeBoard();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.topButtons}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.topButton}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={initializeBoard} style={styles.topButton}>
          <Text style={styles.buttonText}>Restart</Text>
        </TouchableOpacity>
      </View>

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
                  { borderWidth: 2, borderColor: '#666' }, // Adding border to each cell
                ]}
              >
                {cell.revealed && !cell.hasBomb && (
                  <Text style={[styles.cellText, getNumberColor(cell.adjacentBombs)]}>
                    {cell.adjacentBombs || ''}
                  </Text>
                )}
                {cell.revealed && cell.hasBomb && (
                  <Image source={require('../assets/bomb.png')} style={styles.bombIcon} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      <View style={styles.tools}>
        <Image source={require('../assets/bomb.png')} style={styles.bombIcon} />
        <Text style={styles.bombCounter}>{flagsLeft}</Text>
        <TouchableOpacity
          onPress={() => setSelectedTool('shovel')}
          style={[styles.toolButton, selectedTool === 'shovel' && styles.selectedTool]}
        >
          <Image source={require('../assets/shovel.png')} style={styles.toolIcon} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSelectedTool('flag')}
          style={[styles.toolButton, selectedTool === 'flag' && styles.selectedTool]}
        >
          <Image source={require('../assets/flag.png')} style={styles.toolIcon} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={useHint}
          style={[styles.hintButton, hintUsed && styles.disabledHint]}
          disabled={hintUsed}
        >
          <Text>Hint</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getNumberColor = (num) => {
  switch (num) {
    case 1:
      return { color: '#1230AE' }; 
    case 2:
      return { color: '#6A9C89' }; 
    case 3:
      return { color: '#A04747' }; 
    case 4:
      return { color: '#2E073F' }; 
    case 5:
      return { color: '#41B3A2' }; 
    case 6:
      return { color: '#FF8343' }; 
    case 7:
      return { color: '#17153B' }; 
    case 8:
      return { color: '#E4003A' }; 
    default:
      return {};
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333',
  },
  topButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    paddingBottom: 20,
  },
  topButton: {
    backgroundColor: '#008CBA',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  board: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8
  },
  revealedCell: {
    backgroundColor: '#333',
  },
  flaggedCell: {
    backgroundColor: '#FF4500',
  },
  cellText: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  bombIcon: {
    width: 50,
    height: 50,
  },
  tools: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
    paddingBottom: 20,
    marginRight: 50,

  },
  toolButton: {
    backgroundColor: '#666',
    padding: 15,
    borderRadius: 5,
  },
  toolIcon: {
    width: 40,
    height: 40,
  },
  selectedTool: {
    borderColor: '#78D172',
    backgroundColor: "#7ABA78",
    borderWidth: 2,
  },
  hintButton: {
    backgroundColor: 'yellow',
    padding: 10,
    borderRadius: 5,
    fontWeight: 'bold',
  },
  disabledHint: {
    backgroundColor: 'gray',
  },
  bombCounter: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Minesweeper;
