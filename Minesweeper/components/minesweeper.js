import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Image } from 'react-native';
import { StyleSheet } from 'react-native';

const Minesweeper = ({ route, navigation }) => {
  const { difficulty } = route.params;
  const [gameLost, setGameLost] = useState(false);

  // Define the board size and bomb count based on the difficulty
  const getBoardConfig = (diff) => {
    switch (diff) {
      case 1: // Easy
        return { boardSize: 10, bombCount: 8 };
      case 2: // Medium
        return { boardSize: 12, bombCount: 15 };
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
  const [allBombsRevealed, setAllBombsRevealed] = useState(false);

  // Initialize the board (empty cells at first)
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
    setAllBombsRevealed(false);
  };

  // Place bombs, ensuring no bomb is near the first click (1-cell buffer)
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

  // Adjust this function if you want to make the first reveal smaller
const isAdjacentToFirstClick = (row, col, firstRow, firstCol, radius = 0) => {
  // Adjust the radius to control the size of the first reveal area
  // radius = 0 -> only reveal the clicked cell
  // radius = 1 -> reveal the 3x3 area (current behavior)
  // You can modify the radius to your needs
  return Math.abs(row - firstRow) <= radius && Math.abs(col - firstCol) <= radius;
};

// Calculate the number of bombs adjacent to each cell
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


  // Handle cell click, first move reveals safe area
  const handleCellPress = (row, col) => {
    if (gameOver || board[row][col].revealed) return;

    if (isFirstMove) {
      // On first move, place bombs and ensure the area clicked is safe
      placeBombs(row, col);
      setIsFirstMove(false);
    }

    const updatedBoard = [...board];
    const cell = updatedBoard[row][col];

    if (selectedTool === 'shovel') {
      if (cell.hasBomb) {
        // Bomb clicked, game over
        cell.revealed = true;
        setBoard(updatedBoard);
        revealBombs(); 
        setGameOver(true);
        setGameLost(true);
      } else {
        // Safe cell, reveal adjacent area (modify reveal size in revealCell function)
        revealCell(row, col, updatedBoard);
        if (checkWin(updatedBoard)) {
          setIsGameWon(true);
          setGameOver(true);
        }
      }
    } else if (selectedTool === 'flag') {
      // Place or remove a flag
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

  // Reveal bombs when game over
  const revealBombs = async () => {
    const updatedBoard = [...board];
    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col < boardSize; col++) {
        if (updatedBoard[row][col].hasBomb) {
          updatedBoard[row][col].revealed = true;
          setBoard([...updatedBoard]);
          await new Promise(resolve => setTimeout(resolve, 200)); // Add delay for bomb reveal effect
        }
      }
    }
    setAllBombsRevealed(true);
  };

  // Reveal the clicked cell and surrounding area if no adjacent bombs
  const revealCell = (row, col, updatedBoard) => {
    if (row < 0 || row >= boardSize || col < 0 || col >= boardSize) return;

    const cell = updatedBoard[row][col];

    if (cell.revealed || cell.flagged) return;

    cell.revealed = true;

    // Modify this part to control how large the revealed area is after the first click
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

  // Check if player has won the game
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
            { width: 320 / 8, height: 320 / 8 } // Adjust cell size based on screen width
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
          style={[
            styles.toolButton,
            hintsLeft === 0 ? styles.disabledHintButton : styles.enabledHintButton,
          ]}
        >
          <Image source={require('../assets/hint.png')} style={styles.toolIcon} />
          <Text style={styles.hintCounter}>{hintsLeft}</Text>
        </TouchableOpacity>
      </View>

      {gameOver && allBombsRevealed && renderGameOverScreen()}
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
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
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
