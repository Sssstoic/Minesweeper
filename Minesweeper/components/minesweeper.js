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
    setHintsLeft(hintCount);
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
            // When the player hits a bomb, trigger the game lost state
            board[row][col].revealed = true;  // Reveal the bomb they clicked
            setBoard([...board]);
            revealBombs(row, col);  // Call the function to reveal all bombs one by one
            setGameLost(true);  // Mark game as lost
        } else {
            // If it's not a bomb, reveal the cell
            revealCell(row, col);
            if (checkWin()) {
                Alert.alert('Congratulations!', 'You won the game!');
            }
        }
    } else if (selectedTool === 'flag' && !board[row][col].revealed) {
        // Handle flagging/unflagging logic
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

// Function to reveal all bombs one by one
const revealBombs = async (clickedRow, clickedCol) => {
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            if (board[row][col].hasBomb && !(row === clickedRow && col === clickedCol)) {
                board[row][col].revealed = true;
                setBoard([...board]);  
                await new Promise(resolve => setTimeout(resolve, 200));  
            }
        }
    }
    setGameOver(true);  // End the game after all bombs are revealed
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
          revealCell(newRow, newCol);  
        }
      });
    }

    setBoard([...board]);  
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
    if (hintsLeft === 0) return;
    let hintFound = false;
    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col < boardSize; col++) {  // Corrected from colIndex to col
        if (!board[row][col].hasBomb && !board[row][col].revealed) {
          revealCell(row, col);
          setHintsLeft(hintsLeft - 1);
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
                  { borderWidth: 3, borderColor: '#333' }, 
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


     <View
          style={[
            styles.counterContainer,
            hintsLeft === 0 ? styles.disabledHintContainer : styles.hintContainer,
          ]}
        >
          <TouchableOpacity onPress={useHint} disabled={hintsLeft === 0}>
            <Image source={require('../assets/hint.png')} style={styles.toolIcon} />
          </TouchableOpacity>
          <Text style={styles.counterText}>{hintsLeft}</Text>
        </View>
      </View>
    </View>
  );
};

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
    borderRadius: 8,
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
    width: 30,
    height: 30,
  },

  tools: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
    paddingVertical: 15,
    borderWidth: 4,
    borderRadius: 8,
    borderColor: '#fff',
    marginTop: 50,
    paddingHorizontal: 20,
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
    padding: 12,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },

  toolIcon: {
    width: 40,
    height: 40,
  },

  selectedTool: {
    borderColor: '#78D172',
    backgroundColor: '#7ABA78',
    borderWidth: 2,
  },

  hintContainer: {
    backgroundColor: 'yellow',
    padding: 12,
    borderRadius: 5,
  },

  disabledHintContainer: {
    backgroundColor: 'gray',
    padding: 12,
    borderRadius: 5,
  },
});
export default Minesweeper;
