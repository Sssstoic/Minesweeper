import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Image, StyleSheet } from 'react-native';

const Minesweeper = ({ route, navigation }) => {
  const { difficulty } = route.params;
  const [gameLost, setGameLost] = useState(false);

  const getBoardConfig = (diff) => {
    switch (diff) {
      case 1: // Easy
        return { boardSize: 8, bombCount: 8 };
      case 2: // Medium
        return { boardSize: 10, bombCount: 15 };
      case 3: // Hard
        return { boardSize: 14, bombCount: 27 };
      default:
        return { boardSize: 8, bombCount: 8 };
    }
  };

  const { boardSize, bombCount } = getBoardConfig(difficulty);

  const hintCount = 2;
  const [board, setBoard] = useState([]);
  const [flagsLeft, setFlagsLeft] = useState(bombCount);
  const [hintsLeft, setHintsLeft] = useState(hintCount);
  const [gameOver, setGameOver] = useState(false);
  const [isGameWon, setIsGameWon] = useState(false);
  const [selectedTool, setSelectedTool] = useState('shovel');
  const [isFirstMove, setIsFirstMove] = useState(true);

  const initializeBoard = () => {
    let newBoard = Array(boardSize)
      .fill(null)
      .map(() =>
        Array(boardSize).fill(null).map(() => ({
          revealed: false,
          hasBomb: false,
          flagged: false,
          adjacentBombs: 0
        }))
      );
    setBoard(newBoard);
    setFlagsLeft(bombCount);
    setHintsLeft(hintCount);
    setGameOver(false);
    setIsGameWon(false);
    setIsFirstMove(true);
  };

  const placeBombs = (firstRow, firstCol) => {
    let bombsPlaced = 0;
    const updatedBoard = [...board];

    while (bombsPlaced < bombCount) {
      let row = Math.floor(Math.random() * boardSize);
      let col = Math.floor(Math.random() * boardSize);
      // Ensure bombs aren't placed on the first-clicked cell or adjacent cells
      if (!updatedBoard[row][col].hasBomb && !isAdjacentToFirstClick(row, col, firstRow, firstCol)) {
        updatedBoard[row][col].hasBomb = true;
        bombsPlaced++;
      }
    }
    calculateAdjacentBombs(updatedBoard);
    setBoard(updatedBoard);
  };

  const isAdjacentToFirstClick = (row, col, firstRow, firstCol, radius = 0) => {
    return Math.abs(row - firstRow) <= radius && Math.abs(col - firstCol) <= radius;
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
    if (gameOver || board[row][col].revealed) return;
  
    if (isFirstMove) {
      placeBombs(row, col); // Place bombs on the board after the first move
      setIsFirstMove(false);
    }
  
    const updatedBoard = [...board];
    const cell = updatedBoard[row][col];
  
    if (selectedTool === 'shovel') {
      if (cell.hasBomb) {
        // Bomb revealed, game over
        cell.revealed = true;
        setBoard(updatedBoard);
        revealBombs(); 
        setGameOver(true);
        setGameLost(true);
      } else {
        revealCell(row, col, updatedBoard); // Reveal the cell
      }
    } else if (selectedTool === 'flag') {
      // Handle flagging/unflagging a bomb
      if (cell.flagged) {
        cell.flagged = false;
        setFlagsLeft(flagsLeft + 1);
      } else if (flagsLeft > 0) {
        cell.flagged = true;
        setFlagsLeft(flagsLeft - 1);
      }
      setBoard(updatedBoard);
    }
  
    // Check for win condition after each cell press
    if (checkWin(updatedBoard)) {
      setIsGameWon(true);
      setGameOver(true);
    }
  };

  const revealBombs = async () => {
    const updatedBoard = [...board];
    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col < boardSize; col++) {
        if (updatedBoard[row][col].hasBomb) {
          updatedBoard[row][col].revealed = true;
          setBoard([...updatedBoard]);
          await new Promise(resolve => setTimeout(resolve, 200)); 
        }
      }
    }
  };

  const revealCell = (row, col, updatedBoard) => {
    if (row < 0 || row >= boardSize || col < 0 || col >= boardSize) return;

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

  const checkWin = (updatedBoard) => {
    let revealedCount = 0;
    let flaggedCount = 0;

    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col < boardSize; col++) {
        const cell = updatedBoard[row][col];
        
        if (cell.revealed) {
          revealedCount++; 
        }
  
        if (cell.flagged && cell.hasBomb) {
          flaggedCount++; 
        }
      }
    }

    const totalNonBombCells = boardSize * boardSize - bombCount;
    if (revealedCount === totalNonBombCells && flaggedCount === bombCount) {
      return true; 
    }
    return false; 
  };

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

  const renderGameOverScreen = () => (
    <View style={styles.gameOverContainer}>
      <Text style={styles.gameOverText}>
        {isGameWon ? '🎉 You Won! 🎉' : '💣 Game Over! 💣'}
      </Text>
      <TouchableOpacity onPress={initializeBoard} style={styles.retryButton}>
        <Text style={styles.buttonText}>Retry</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('MainPage')} style={styles.mainMenuButton}>
        <Text style={styles.buttonText}>Return to Main Menu</Text>
      </TouchableOpacity>
    </View>
  );

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
                  { borderWidth: 3, borderColor: '#333' },
                  { width: 320 / 8, height: 320 / 8 }
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

      <View style={styles.tools}>
        <View style={styles.bombContainer}>
          <Image source={require('../assets/bomb.png')} style={styles.toolIcon} />
          <Text style={styles.bombCounter}>{flagsLeft}</Text>
        </View>

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
          disabled={hintsLeft === 0}
          style={[styles.toolButton, hintsLeft === 0 ? styles.disabledHintButton : styles.enabledHintButton]}
        >
          <Image source={require('../assets/hint.png')} style={styles.toolIcon} />
          <Text style={styles.hintCounter}>{hintsLeft}</Text>
        </TouchableOpacity>
      </View>

      {gameOver && renderGameOverScreen()}
    </View>
  );
};

const getNumberColor = (num) => {
  switch (num) {
    case 1: return { color: '#5AB2FF' };
    case 2: return { color: '#ACD793' };
    case 3: return { color: '#FA7070' };
    case 4: return { color: '#FF76CE' };
    case 5: return { color: '#987D9A' };
    case 6: return { color: '#FF8343' };
    case 7: return { color: '#FFDE4D' };
    case 8: return { color: '#E4003A' };
    default: return {};
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
    backgroundColor: '#888',
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
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -150 }, { translateY: -100 }],
    width: 300,
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
  },
  gameOverText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#72BF78',
    padding: 15,
    borderRadius: 5,
    marginBottom: 15,
    width: '80%',
    alignItems: 'center',
  },
  mainMenuButton: {
    backgroundColor: '#E4003A',
    padding: 15,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
  },
});

export default Minesweeper;