import React, { useState, useEffect, useCallback } from 'react';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const EMPTY_CELL = 0;

const TETROMINOES = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    color: '#00bcd4'
  },
  O: {
    shape: [
      [1, 1],
      [1, 1]
    ],
    color: '#ffeb3b'
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: '#9c27b0'
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0]
    ],
    color: '#4caf50'
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0]
    ],
    color: '#f44336'
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: '#2196f3'
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: '#ff9800'
  }
};

const createEmptyBoard = () => 
  Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(EMPTY_CELL));

const getRandomTetromino = () => {
  const pieces = Object.keys(TETROMINOES);
  const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
  return {
    shape: TETROMINOES[randomPiece].shape,
    color: TETROMINOES[randomPiece].color,
    x: Math.floor(BOARD_WIDTH / 2) - Math.floor(TETROMINOES[randomPiece].shape[0].length / 2),
    y: 0
  };
};

const rotatePiece = (piece) => {
  const rotated = piece.shape.map((_, index) => 
    piece.shape.map(col => col[index]).reverse()
  );
  return { ...piece, shape: rotated };
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
  },
  wrapper: {
    maxWidth: '1200px',
    width: '100%'
  },
  title: {
    fontSize: 'clamp(2.5rem, 8vw, 4rem)',
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: '30px',
    background: 'linear-gradient(45deg, #00bcd4, #9c27b0, #ff9800)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: '0 0 30px rgba(0, 188, 212, 0.3)'
  },
  gameLayout: {
    display: 'flex',
    flexDirection: window.innerWidth < 768 ? 'column' : 'row',
    alignItems: window.innerWidth < 768 ? 'center' : 'flex-start',
    justifyContent: 'center',
    gap: '40px'
  },
  boardContainer: {
    position: 'relative',
    background: 'rgba(30, 30, 30, 0.9)',
    padding: '20px',
    borderRadius: '15px',
    boxShadow: '0 0 50px rgba(0, 188, 212, 0.2), inset 0 0 20px rgba(255, 255, 255, 0.05)',
    border: '2px solid rgba(255, 255, 255, 0.1)'
  },
  gameBoard: {
    display: 'grid',
    gridTemplateColumns: 'repeat(10, 1fr)',
    gap: '1px',
    background: '#333',
    border: '3px solid #555',
    borderRadius: '8px',
    padding: '3px'
  },
  boardCell: {
    width: window.innerWidth < 640 ? '25px' : '32px',
    height: window.innerWidth < 640 ? '25px' : '32px',
    border: '1px solid #444',
    borderRadius: '2px',
    transition: 'all 0.1s ease'
  },
  overlay: {
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    background: 'rgba(0, 0, 0, 0.85)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '15px'
  },
  gameOverText: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#f44336',
    marginBottom: '20px',
    textShadow: '0 0 20px rgba(244, 67, 54, 0.5)'
  },
  welcomeText: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#00bcd4',
    marginBottom: '20px',
    textShadow: '0 0 20px rgba(0, 188, 212, 0.5)'
  },
  pauseText: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#ffeb3b',
    textShadow: '0 0 20px rgba(255, 235, 59, 0.5)'
  },
  button: {
    padding: '12px 24px',
    border: 'none',
    borderRadius: '25px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
  },
  startButton: {
    background: 'linear-gradient(45deg, #4caf50, #45a049)',
    color: 'white'
  },
  restartButton: {
    background: 'linear-gradient(45deg, #00bcd4, #0097a7)',
    color: 'white'
  },
  infoPanels: {
    display: 'flex',
    flexDirection: 'column',
    gap: '25px'
  },
  infoPanel: {
    background: 'rgba(30, 30, 30, 0.9)',
    padding: '20px',
    borderRadius: '12px',
    minWidth: '220px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), inset 0 0 10px rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  panelTitle: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '15px',
    color: '#00bcd4',
    textShadow: '0 0 10px rgba(0, 188, 212, 0.3)'
  },
  nextTitle: {
    color: '#9c27b0',
    textShadow: '0 0 10px rgba(156, 39, 176, 0.3)'
  },
  controlsTitle: {
    color: '#4caf50',
    textShadow: '0 0 10px rgba(76, 175, 80, 0.3)'
  },
  scoreInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  scoreRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  scoreValue: {
    fontFamily: '"Courier New", monospace',
    fontWeight: 'bold',
    fontSize: '1.1rem',
    color: '#fff'
  },
  nextGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1px',
    background: '#333',
    padding: '8px',
    borderRadius: '6px',
    border: '1px solid #555',
    maxWidth: '120px',
    margin: '0 auto'
  },
  nextCell: {
    width: '20px',
    height: '20px',
    border: '1px solid #444',
    borderRadius: '2px'
  },
  controlsInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    fontSize: '0.9rem'
  },
  controlRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  controlKey: {
    fontFamily: '"Courier New", monospace',
    background: 'rgba(255, 255, 255, 0.1)',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.8rem',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  },
  pauseButton: {
    background: 'linear-gradient(45deg, #ff9800, #f57c00)',
    color: 'white',
    width: '100%',
    marginTop: '15px'
  },
  mobileControls: {
    marginTop: '40px',
    display: window.innerWidth < 768 ? 'block' : 'none'
  },
  mobileGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    maxWidth: '300px',
    margin: '0 auto'
  },
  mobileButton: {
    padding: '15px',
    background: 'rgba(60, 60, 60, 0.9)',
    color: 'white',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  dropButton: {
    gridColumn: 'span 2',
    background: 'linear-gradient(45deg, #9c27b0, #7b1fa2)'
  }
};

export default function TetrisGame() {
  const [board, setBoard] = useState(createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState(getRandomTetromino());
  const [nextPiece, setNextPiece] = useState(getRandomTetromino());
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const isValidMove = useCallback((piece, board, dx = 0, dy = 0) => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = piece.x + x + dx;
          const newY = piece.y + y + dy;
          
          if (
            newX < 0 || 
            newX >= BOARD_WIDTH || 
            newY >= BOARD_HEIGHT ||
            (newY >= 0 && board[newY][newX])
          ) {
            return false;
          }
        }
      }
    }
    return true;
  }, []);

  const placePiece = useCallback((piece, board) => {
    const newBoard = board.map(row => [...row]);
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const boardY = piece.y + y;
          const boardX = piece.x + x;
          if (boardY >= 0) {
            newBoard[boardY][boardX] = piece.color;
          }
        }
      }
    }
    return newBoard;
  }, []);

  const clearLines = useCallback((board) => {
    const newBoard = board.filter(row => row.some(cell => cell === EMPTY_CELL));
    const clearedLines = BOARD_HEIGHT - newBoard.length;
    
    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(EMPTY_CELL));
    }
    
    return { newBoard, clearedLines };
  }, []);

  const movePiece = useCallback((dx, dy) => {
    if (gameOver || isPaused || !gameStarted) return;
    
    setCurrentPiece(prev => {
      if (isValidMove(prev, board, dx, dy)) {
        return { ...prev, x: prev.x + dx, y: prev.y + dy };
      } else if (dy > 0) {
        // Piece has landed
        const newBoard = placePiece(prev, board);
        const { newBoard: clearedBoard, clearedLines } = clearLines(newBoard);
        
        setBoard(clearedBoard);
        setLines(prevLines => prevLines + clearedLines);
        setScore(prevScore => prevScore + clearedLines * 100 * level);
        setLevel(Math.floor((lines + clearedLines) / 10) + 1);
        
        const newPiece = nextPiece;
        setNextPiece(getRandomTetromino());
        
        if (!isValidMove(newPiece, clearedBoard)) {
          setGameOver(true);
        }
        
        return newPiece;
      }
      return prev;
    });
  }, [board, gameOver, isPaused, gameStarted, isValidMove, placePiece, clearLines, nextPiece, level, lines]);

  const rotatePieceHandler = useCallback(() => {
    if (gameOver || isPaused || !gameStarted) return;
    
    setCurrentPiece(prev => {
      const rotated = rotatePiece(prev);
      if (isValidMove(rotated, board)) {
        return rotated;
      }
      return prev;
    });
  }, [board, gameOver, isPaused, gameStarted, isValidMove]);

  const dropPiece = useCallback(() => {
    if (gameOver || isPaused || !gameStarted) return;
    
    let newY = currentPiece.y;
    while (isValidMove(currentPiece, board, 0, newY - currentPiece.y + 1)) {
      newY++;
    }
    movePiece(0, newY - currentPiece.y);
  }, [currentPiece, board, gameOver, isPaused, gameStarted, isValidMove, movePiece]);

  const startGame = () => {
    setBoard(createEmptyBoard());
    setCurrentPiece(getRandomTetromino());
    setNextPiece(getRandomTetromino());
    setScore(0);
    setLevel(1);
    setLines(0);
    setGameOver(false);
    setIsPaused(false);
    setGameStarted(true);
  };

const togglePause = useCallback(() => {
    if (gameStarted && !gameOver) {
      setIsPaused(prev => !prev);
    }
  }, [gameStarted, gameOver]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!gameStarted) return;

      switch (e.key) {
        case 'ArrowLeft':
          movePiece(-1, 0);
          break;
        case 'ArrowRight':
          movePiece(1, 0);
          break;
        case 'ArrowDown':
          movePiece(0, 1);
          break;
        case 'ArrowUp':
          rotatePieceHandler();
          break;
        case ' ':
          e.preventDefault();
          dropPiece();
          break;
        case 'P':
          togglePause();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [movePiece, rotatePieceHandler, dropPiece, gameStarted, togglePause]);

  useEffect(() => {
    if (!gameStarted || gameOver || isPaused) return;

    const dropInterval = Math.max(100, 1000 - (level - 1) * 100);
    const interval = setInterval(() => {
      movePiece(0, 1);
    }, dropInterval);

    return () => clearInterval(interval);
  }, [movePiece, level, gameStarted, gameOver, isPaused, togglePause]);
}
   
   const renderBoard = () => {
  const displayBoard = board.map(row => [...row]);

  // Draw current piece
  if (currentPiece && !gameOver) {
    for (let y = 0; y < currentPiece.shape.length; y++) {
      for (let x = 0; x < currentPiece.shape[y].length; x++) {
        if (currentPiece.shape[y][x]) {
          const boardY = currentPiece.y + y;
          const boardX = currentPiece.x + x;
          if (
            boardY >= 0 &&
            boardY < BOARD_HEIGHT &&
            boardX >= 0 &&
            boardX < BOARD_WIDTH
          ) {
            displayBoard[boardY][boardX] = currentPiece.color;
          }
        }
      }
    }
  }

  return displayBoard;
};

  const renderNextPiece = () => {
    const gridSize = 4;
    const grid = Array(gridSize).fill().map(() => Array(gridSize).fill(EMPTY_CELL));
    
    if (nextPiece) {
      const offsetY = Math.floor((gridSize - nextPiece.shape.length) / 2);
      const offsetX = Math.floor((gridSize - nextPiece.shape[0].length) / 2);
      
      for (let y = 0; y < nextPiece.shape.length; y++) {
        for (let x = 0; x < nextPiece.shape[y].length; x++) {
          if (nextPiece.shape[y][x]) {
            grid[offsetY + y][offsetX + x] = nextPiece.color;
          }
        }
      }
    }
    
    return grid;
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <h1 style={styles.title}>TETRIS</h1>
        
        <div style={styles.gameLayout}>
          {/* Game Board */}
          <div style={styles.boardContainer}>
            <div style={styles.gameBoard}>
              {renderBoard().map((row, y) => 
                row.map((cell, x) => (
                  <div 
                    key={`${y}-${x}`} 
                    style={{
                      ...styles.boardCell,
                      backgroundColor: cell || '#1a1a1a'
                    }}
                  />
                ))
              )}
            </div>
            
            {gameOver && (
              <div style={styles.overlay}>
                <h2 style={styles.gameOverText}>Game Over!</h2>
                <button 
                  onClick={startGame} 
                  style={{...styles.button, ...styles.restartButton}}
                  onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  Play Again
                </button>
              </div>
            )}
            
            {!gameStarted && (
              <div style={styles.overlay}>
                <h2 style={styles.welcomeText}>Tetris</h2>
                <button 
                  onClick={startGame} 
                  style={{...styles.button, ...styles.startButton}}
                  onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  Start Game
                </button>
              </div>
            )}
            
            {isPaused && gameStarted && !gameOver && (
              <div style={styles.overlay}>
                <h2 style={styles.pauseText}>PAUSED</h2>
              </div>
            )}
          </div>
          
          {/* Game Info */}
          <div style={styles.infoPanels}>
            {/* Score Panel */}
            <div style={styles.infoPanel}>
              <h2 style={styles.panelTitle}>Score</h2>
              <div style={styles.scoreInfo}>
                <div style={styles.scoreRow}>
                  <span>Score:</span>
                  <span style={styles.scoreValue}>{score}</span>
                </div>
                <div style={styles.scoreRow}>
                  <span>Level:</span>
                  <span style={styles.scoreValue}>{level}</span>
                </div>
                <div style={styles.scoreRow}>
                  <span>Lines:</span>
                  <span style={styles.scoreValue}>{lines}</span>
                </div>
              </div>
            </div>
            
            {/* Next Piece */}
            <div style={styles.infoPanel}>
              <h2 style={{...styles.panelTitle, ...styles.nextTitle}}>Next</h2>
              <div style={styles.nextGrid}>
                {renderNextPiece().map((row, y) => 
                  row.map((cell, x) => (
                    <div 
                      key={`next-${y}-${x}`} 
                      style={{
                        ...styles.nextCell,
                        backgroundColor: cell || '#1a1a1a'
                      }}
                    />
                  ))
                )}
              </div>
            </div>
            
            {/* Controls */}
            <div style={styles.infoPanel}>
              <h2 style={{...styles.panelTitle, ...styles.controlsTitle}}>Controls</h2>
              <div style={styles.controlsInfo}>
                <div style={styles.controlRow}>
                  <span>Move:</span>
                  <span style={styles.controlKey}>← →</span>
                </div>
                <div style={styles.controlRow}>
                  <span>Rotate:</span>
                  <span style={styles.controlKey}>↑</span>
                </div>
                <div style={styles.controlRow}>
                  <span>Down:</span>
                  <span style={styles.controlKey}>↓</span>
                </div>
                <div style={styles.controlRow}>
                  <span>Drop:</span>
                  <span style={styles.controlKey}>Space</span>
                </div>
                <div style={styles.controlRow}>
                  <span>Pause:</span>
                  <span style={styles.controlKey}>P</span>
                </div>
              </div>
              
              {gameStarted && !gameOver && (
                <button 
                  onClick={togglePause} 
                  style={{...styles.button, ...styles.pauseButton}}
                  onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  {isPaused ? 'Resume' : 'Pause'}
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile Controls */}
        <div style={styles.mobileControls}>
          <div style={styles.mobileGrid}>
            <button 
              onClick={() => movePiece(-1, 0)}
              style={styles.mobileButton}
              onTouchStart={(e) => e.target.style.transform = 'scale(0.95)'}
              onTouchEnd={(e) => e.target.style.transform = 'scale(1)'}
            >
              ←
            </button>
            <button 
              onClick={rotatePieceHandler}
              style={styles.mobileButton}
              onTouchStart={(e) => e.target.style.transform = 'scale(0.95)'}
              onTouchEnd={(e) => e.target.style.transform = 'scale(1)'}
            >
              ↻
            </button>
            <button 
              onClick={() => movePiece(1, 0)}
              style={styles.mobileButton}
              onTouchStart={(e) => e.target.style.transform = 'scale(0.95)'}
              onTouchEnd={(e) => e.target.style.transform = 'scale(1)'}
            >
              →
            </button>
            <button 
              onClick={() => movePiece(0, 1)}
              style={styles.mobileButton}
              onTouchStart={(e) => e.target.style.transform = 'scale(0.95)'}
              onTouchEnd={(e) => e.target.style.transform = 'scale(1)'}
            >
              ↓
            </button>
            <button 
              onClick={dropPiece}
              style={{...styles.mobileButton, ...styles.dropButton}}
              onTouchStart={(e) => e.target.style.transform = 'scale(0.95)'}
              onTouchEnd={(e) => e.target.style.transform = 'scale(1)'}
            >
              DROP
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
