import React, { useEffect, useState } from 'react';
import '../assets/styles/Piece.css';

const Piece = ({ player, position }) => {
  const [animate, setAnimate] = useState(false);
  const [prevPosition, setPrevPosition] = useState(position);

  // 計算棋子在棋盤上的位置
  const calculatePiecePosition = (pos) => {
    const boardSize = 40; // 預設棋盤大小
    
    // 計算棋子在哪個區域 (上、右、下、左)
    if (pos <= 10) {
      // 上方區域
      return {
        left: `${(pos * 9) + 1}%`,
        top: '1%'
      };
    } else if (pos <= 20) {
      // 右方區域
      return {
        left: '91%',
        top: `${((pos - 10) * 9) + 1}%`
      };
    } else if (pos <= 30) {
      // 下方區域 (反向)
      return {
        left: `${(30 - pos) * 9 + 1}%`,
        top: '91%'
      };
    } else {
      // 左方區域 (反向)
      return {
        left: '1%',
        top: `${(40 - pos) * 9 + 1}%`
      };
    }
  };

  // 當位置變化時觸發動畫
  useEffect(() => {
    if (position !== prevPosition) {
      setAnimate(true);
      
      // 動畫結束後關閉動畫效果
      const timer = setTimeout(() => {
        setAnimate(false);
        setPrevPosition(position);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [position, prevPosition]);

  const pieceStyle = {
    ...calculatePiecePosition(position),
    backgroundColor: player.color,
    transition: animate ? 'all 1s ease-in-out' : 'none'
  };

  // 顯示不同的棋子形狀
  const renderPieceIcon = () => {
    switch (player.piece) {
      case 'car':
        return '🚗';
      case 'ship':
        return '🚢';
      case 'hat':
        return '🎩';
      case 'shoe':
        return '👞';
      default:
        return '⚪';
    }
  };

  return (
    <div 
      className={`piece ${animate ? 'animating' : ''} ${player.bankruptcy ? 'bankrupt' : ''}`} 
      style={pieceStyle}
      data-player-id={player.id}
    >
      <div className="piece-content">
        {renderPieceIcon()}
        <span className="player-indicator">{player.id + 1}</span>
      </div>
    </div>
  );
};

export default Piece;
