import React from 'react';
import BoardCell from './BoardCell';
import Piece from './Piece';
import { useGame } from '../context/GameContext';
import '../assets/styles/GameBoard.css';

const GameBoard = () => {
  const { state } = useGame();
  const { board, players, gameStarted } = state;

  if (!gameStarted) {
    return null; // 遊戲未開始時不顯示棋盤
  }

  // 棋盤配置: 10x10 方格，每邊各10格
  // 0-9 為上排, 10-19 為右排, 20-29 為下排, 30-39 為左排
  const renderBoard = () => {
    if (!board || board.length === 0) return null;
    
    // 建立一個視覺上的棋盤格子陣列
    const topRow = [];
    const rightCol = [];
    const bottomRow = [];
    const leftCol = [];
    
    // 填充上排 (0-9)
    for (let i = 0; i <= 9; i++) {
      topRow.push(
        <BoardCell 
          key={i} 
          cell={board[i] || { id: i, type: 'empty' }} 
          position="top"
        />
      );
    }
    
    // 填充右排 (10-19)
    for (let i = 10; i <= 19; i++) {
      rightCol.push(
        <BoardCell 
          key={i} 
          cell={board[i] || { id: i, type: 'empty' }} 
          position="right"
        />
      );
    }
    
    // 填充下排 (20-29) - 反向排列
    for (let i = 29; i >= 20; i--) {
      bottomRow.push(
        <BoardCell 
          key={i} 
          cell={board[i] || { id: i, type: 'empty' }} 
          position="bottom"
        />
      );
    }
    
    // 填充左排 (30-39) - 反向排列
    for (let i = 39; i >= 30; i--) {
      leftCol.push(
        <BoardCell 
          key={i} 
          cell={board[i] || { id: i, type: 'empty' }} 
          position="left"
        />
      );
    }
    
    return (
      <div className="game-board">
        <div className="board-top">{topRow}</div>
        <div className="board-middle">
          <div className="board-left">{leftCol}</div>
          <div className="board-center">
            <h1>大富翁</h1>
            <div className="board-inner">
              {/* 這裡可以放置中間的卡片、圖片等 */}
            </div>
          </div>
          <div className="board-right">{rightCol}</div>
        </div>
        <div className="board-bottom">{bottomRow}</div>
        
        {/* 放置所有玩家棋子 */}
        {players.map(player => (
          <Piece 
            key={player.id}
            player={player}
            position={player.position}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="game-board-container">
      {renderBoard()}
    </div>
  );
};

export default GameBoard;
