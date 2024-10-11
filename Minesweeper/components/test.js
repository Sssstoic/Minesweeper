import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Image, StyleSheet } from 'react-native';

const Minesweeper = ({ route, navigation }) => {
  const { difficulty } = route.params;
  const [gameLost, setGameLost] = useState(false);
  
  const boardSize = 8;
  const bombCount = 10;
  const hintCount = 2;
  const [board, setBoard] = useState([]);
  const [flagsLeft, setFlagsLeft] = useState(bombCount);
  const [hintsLeft, setHintsLeft] = useState(hintCount);
  const [gameOver, setGameOver] = useState(false);
  const [isGameWon, setIsGameWon] = useState(false);
  const [selectedTool, setSelectedTool] = useState('shovel');

  // Initialize the board
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
    setHintsLeft(hintCount);
    setGameOver(false);
    setIsGameWon(false);
  };

  // Calculate adjacent bombs for each cell
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

  // Handle cell press based on selected tool
  const handleCellPress = (row, col) => {
    if (gameOver || board[row][col].revealed) return;

    const updatedBoard = [...board];
    const cell = updatedBoard[row][col];

    if (selectedTool === 'shovel') {
      if (cell.hasBomb) {
        cell.revealed = true;
        setBoard(updatedBoard);
        revealBombs(row, col);
        setGameOver(true);
        setGameLost(true);
      } else {
        revealCell(row, col, updatedBoard);
        if (checkWin(updatedBoard)) {
          setIsGameWon(true);
          setGameOver(true);
        }
      }
    } else if (selectedTool === 'flag') {
      if (cell.flagged) {
        cell.flagged = false;
        setFlagsLeft(flagsLeft + 1);
      } else if (flagsLeft > 0) {
        cell.flagged = true;
        setFlagsLeft(flagsLeft - 1);
      }
      setBoard(updatedBoard);
    }
  };

  // Reveal all bombs with a delay
  const revealBombs = async (clickedRow, clickedCol) => {
    const updatedBoard = [...board];
    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col < boardSize; col++) {
        if (updatedBoard[row][col].hasBomb && !(row === clickedRow && col === clickedCol)) {
          updatedBoard[row][col].revealed = true;
          setBoard([...updatedBoard]);
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
    }
  };

  // Reveal a cell and recursively reveal adjacent cells if needed
  const revealCell = (row, col, updatedBoard) => {
    const cell = updatedBoard[row][col];
    if (cell.revealed || cell.flagged) return;

    cell.revealed = true;

    if (cell.adjacentBombs === 0) {
      const directions = [
        [0, 1], [1, 1], [1, 0], [1, -1],
        [0, -1], [-1, -1], [-1, 0], [-1, 1],
      ];

      directions.forEach(([dx, dy]) => {
        const newRow = row + dx;
        const newCol = col + dy;
        if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize) {
          revealCell(newRow, newCol, updatedBoard);
        }
      });
    }

    setBoard([...updatedBoard]);
  };

  // Check if the player has won the game
  const checkWin = (updatedBoard) => {
    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col < boardSize; col++) {
        if (!updatedBoard[row][col].hasBomb && !updatedBoard[row][col].revealed) {
          return false;
        }
      }
    }
    return true;
  };

  // Use a hint to reveal a non-bomb, non-revealed cell
  const useHint = () => {
    if (hintsLeft === 0) return;
    let hintFound = false;
    const updatedBoard = [...board];
    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col < boardSize; col++) {
        const cell = updatedBoard[row][col];
        if (!cell.hasBomb && !cell.revealed) {
          revealCell(row, col, updatedBoard);
          setHintsLeft(hintsLeft - 1);
          hintFound = true;
          break;
        }
      }
      if (hintFound) break;
    }
    if (!hintFound) {
      Alert.alert('No Hints Available', 'All safe cells are already revealed.');
    }
  };

  useEffect(() => {
    initializeBoard();
  }, []);

  // Render the game over screen
  const renderGameOverScreen = () => (
    <View style={styles.gameOverContainer}>
      <Text style={styles.gameOverText}>
        {isGameWon ? '🎉 You Won! 🎉' : '💣 Game Over! 💣'}
      </Text>
      <TouchableOpacity onPress={initializeBoard} style={styles.retryButton}>
        <Text style={styles.buttonText}>Retry</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('MainMenu')} style={styles.mainMenuButton}>
        <Text style={styles.buttonText}>Return to Main Menu</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {gameOver ? (
        renderGameOverScreen()
      ) : (
        <>
          {/* Top Buttons */}
          <View style={styles.topButtons}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.topButton}>
              <Text style={styles.buttonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={initializeBoard} style={styles.topButton}>
              <Text style={styles.buttonText}>Restart</Text>
            </TouchableOpacity>
          </View>

          {/* Game Board */}
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
                      { borderWidth: 3, borderColor: '#333' }, 
                    ]}
                  >
                    {cell.flagged && !cell.revealed && (
                      <Image source={require('../assets/flag.png')} style={styles.flagIcon} />
                    )}
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

          {/* Tool Bar */}
          <View style={styles.tools}>
            {/* Bomb Counter */}
            <View style={styles.bombContainer}>
              <Image source={require('../assets/bomb.png')} style={styles.toolIcon} />
              <Text style={styles.bombCounter}>{flagsLeft}</Text>
            </View>

            {/* Shovel Tool */}
            <TouchableOpacity
              onPress={() => setSelectedTool('shovel')}
              style={[styles.toolButton, selectedTool === 'shovel' && styles.selectedTool]}
            >
              <Image source={require('../assets/shovel.png')} style={styles.toolIcon} />
            </TouchableOpacity>

            {/* Flag Tool */}
            <TouchableOpacity
              onPress={() => setSelectedTool('flag')}
              style={[styles.toolButton, selectedTool === 'flag' && styles.selectedTool]}
            >
              <Image source={require('../assets/flag.png')} style={styles.toolIcon} />
            </TouchableOpacity>

            {/* Hint Button */}
            <TouchableOpacity
              onPress={useHint}
              disabled={hintsLeft === 0}
              style={[
                styles.toolButton,
                hintsLeft === 0 ? styles.disabledHintButton : styles.enabledHintButton,
              ]}
            >
              <Image source={require('../assets/hint.png')} style={styles.toolIcon} />
              <Text style={styles.hintCounter}>{hintsLeft}</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

// Function to get color based on the number of adjacent bombs
const getNumberColor = (num) => {
  switch (num) {
    case 1:
      return { color: '#5AB2FF' }; 
    case 2:
      return { color: '#ACD793' }; 
    case 3:
      return { color: '#FA7070' }; 
    case 4:
      return { color: '#FF76CE' }; 
    case 5:
      return { color: '#987D9A' }; 
    case 6:
      return { color: '#FF8343' }; 
    case 7:
      return { color: '#FFDE4D' }; 
    case 8:
      return { color: '#E4003A' }; 
    default:
      return {};
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#333',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
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
    width: '45%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  board: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginBottom: 40,
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
    borderRadius: 8,
    margin: 2,
  },
  revealedCell: {
    backgroundColor: '#333',
  },
  cellText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  bombIcon: {
    width: 30,
    height: 30,
  },
  flagIcon: {
    width: 30,
    height: 30,
  },
  tools: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
    paddingVertical: 15,
    borderWidth: 2,
    borderRadius: 8,
    borderColor: '#fff',
    paddingHorizontal: 20,
    backgroundColor: '#444',
  },
  bombContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bombCounter: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  toolButton: {
    backgroundColor: '#666',
    padding: 10,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  toolIcon: {
    width: 30,
    height: 30,
  },
  selectedTool: {
    borderColor: '#78D172',
    backgroundColor: '#7ABA78',
    borderWidth: 2,
  },
  hintCounter: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  enabledHintButton: {
    backgroundColor: 'yellow',
  },
  disabledHintButton: {
    backgroundColor: 'gray',
  },
  gameOverContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  gameOverText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: 'green',
    padding: 15,
    borderRadius: 5,
    marginBottom: 15,
    width: '80%',
    alignItems: 'center',
  },
  mainMenuButton: {
    backgroundColor: 'blue',
    padding: 15,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
  },
});

export default Minesweeper;
