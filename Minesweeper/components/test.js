import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

const Minesweeper = () => {
  const [board, setBoard] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [flagMode, setFlagMode] = useState(false);
  const [hintsLeft, setHintsLeft] = useState(3);
  const [bombsLeft, setBombsLeft] = useState(10);
  const [revealedCells, setRevealedCells] = useState(0);
  
  const numRows = 10;
  const numCols = 10;
  const numBombs = 10;
  
  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const newBoard = createBoard(numRows, numCols, numBombs);
    setBoard(newBoard);
    setGameOver(false);
    setFlagMode(false);
    setHintsLeft(3);
    setBombsLeft(numBombs);
    setRevealedCells(0);
  };

  const createBoard = (rows, cols, bombs) => {
    let board = Array(rows)
      .fill()
      .map(() => Array(cols).fill({ isBomb: false, revealed: false, flagged: false, value: 0 }));

    let placedBombs = 0;
    while (placedBombs < bombs) {
      const row = Math.floor(Math.random() * rows);
      const col = Math.floor(Math.random() * cols);

      if (!board[row][col].isBomb) {
        board[row][col].isBomb = true;
        placedBombs++;
        updateNeighbors(board, row, col);
      }
    }
    return board;
  };

  const updateNeighbors = (board, row, col) => {
    const neighbors = getNeighbors(row, col);
    neighbors.forEach(([r, c]) => {
      if (!board[r][c].isBomb) {
        board[r][c].value += 1;
      }
    });
  };

  const getNeighbors = (row, col) => {
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],          [0, 1],
      [1, -1], [1, 0], [1, 1]
    ];

    return directions
      .map(([dr, dc]) => [row + dr, col + dc])
      .filter(([r, c]) => r >= 0 && r < numRows && c >= 0 && c < numCols);
  };

  const handleCellPress = (row, col) => {
    if (gameOver || board[row][col].revealed) return;
    
    if (flagMode) {
      toggleFlag(row, col);
    } else if (board[row][col].isBomb) {
      revealAllBombs();
      setGameOver(true);
    } else {
      revealCell(row, col);
    }
  };

  const revealCell = (row, col) => {
    if (board[row][col].revealed || board[row][col].flagged) return;

    let newBoard = [...board];
    newBoard[row][col].revealed = true;
    setBoard(newBoard);

    if (newBoard[row][col].value === 0) {
      const neighbors = getNeighbors(row, col);
      neighbors.forEach(([r, c]) => revealCell(r, c));
    }

    setRevealedCells(revealedCells + 1);

    if (revealedCells + 1 === numRows * numCols - numBombs) {
      setGameOver(true);
    }
  };

  const revealAllBombs = () => {
    let newBoard = [...board];
    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numCols; col++) {
        if (newBoard[row][col].isBomb) {
          newBoard[row][col].revealed = true;
        }
      }
    }
    setBoard(newBoard);
  };

  const toggleFlag = (row, col) => {
    if (board[row][col].revealed) return;

    let newBoard = [...board];
    newBoard[row][col].flagged = !newBoard[row][col].flagged;
    setBoard(newBoard);

    setBombsLeft(bombsLeft + (newBoard[row][col].flagged ? -1 : 1));
  };

  const renderCell = (cell, row, col) => {
    const { isBomb, revealed, flagged, value } = cell;

    let content = null;
    if (revealed) {
      content = isBomb ? "💣" : value > 0 ? value : '';
    } else if (flagged) {
      content = "🚩";
    }

    return (
      <TouchableOpacity
        key={`${row}-${col}`}
        style={[styles.cell, revealed ? styles.revealedCell : styles.hiddenCell]}
        onPress={() => handleCellPress(row, col)}
        onLongPress={() => toggleFlag(row, col)}
      >
        <Text style={styles.cellText}>{content}</Text>
      </TouchableOpacity>
    );
  };

  const renderBoard = () => {
    return board.map((row, rowIndex) => (
      <View key={rowIndex} style={styles.row}>
        {row.map((cell, colIndex) => renderCell(cell, rowIndex, colIndex))}
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Minesweeper</Text>
        <TouchableOpacity
          style={[styles.toolButton, flagMode ? styles.selectedTool : null]}
          onPress={() => setFlagMode(!flagMode)}
        >
          <Text style={styles.toolText}>Flag Mode</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.board}>{renderBoard()}</View>
      {gameOver && (
        <View style={styles.gameOverContainer}>
          <Text style={styles.gameOverText}>Game Over</Text>
          <TouchableOpacity style={styles.retryButton} onPress={initializeGame}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  board: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: 40,
    height: 40,
    margin: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hiddenCell: {
    backgroundColor: '#444',
  },
  revealedCell: {
    backgroundColor: '#999',
  },
  cellText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  toolButton: {
    padding: 10,
    backgroundColor: '#777',
    borderRadius: 5,
  },
  selectedTool: {
    backgroundColor: '#4CAF50',
  },
  toolText: {
    color: '#fff',
  },
  gameOverContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  gameOverText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  retryButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#008CBA',
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Minesweeper;
