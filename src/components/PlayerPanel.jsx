import React from 'react';
import { useGame } from '../context/GameContext';
import '../assets/styles/PlayerPanel.css';

const PlayerPanel = () => {
  const { state } = useGame();
  const { players, currentPlayer, gameStarted, board } = state;

  if (!gameStarted) {
    return null; // 遊戲未開始時不顯示
  }

  // 根據玩家擁有的地產計算總資產價值
  const calculateNetWorth = (player) => {
    if (!player.properties || player.properties.length === 0) {
      return player.money;
    }

    const propertyValue = player.properties.reduce((total, propId) => {
      const property = board[propId];
      if (!property) return total;
      
      // 房屋增值
      const buildingValue = property.level ? (property.price * 0.5 * property.level) : 0;
      
      return total + property.price + buildingValue;
    }, 0);

    return player.money + propertyValue;
  };

  // 獲取玩家擁有的地產列表
  const getPlayerProperties = (player) => {
    if (!player.properties || player.properties.length === 0) {
      return <div className="no-properties">尚無地產</div>;
    }

    return (
      <div className="property-list">
        {player.properties.map(propId => {
          const property = board[propId];
          if (!property) return null;
          
          return (
            <div 
              key={propId} 
              className="property-item"
              style={{ backgroundColor: property.color || '#ccc' }}
            >
              <div className="property-title">{property.name}</div>
              {property.level > 0 && (
                <div className="property-buildings">
                  {Array(property.level).fill('🏠').join('')}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // 判斷玩家是否破產
  const isBankrupt = (player) => {
    return player.bankruptcy || player.money < 0;
  };

  return (
    <div className="player-panel">
      <h2>玩家資訊</h2>
      
      <div className="players-container">
        {players.map(player => (
          <div 
            key={player.id} 
            className={`player-card ${player.id === currentPlayer ? 'active' : ''} ${isBankrupt(player) ? 'bankrupt' : ''}`}
            style={{ borderColor: player.color }}
          >
            <div className="player-header" style={{ backgroundColor: player.color }}>
              <div className="player-name">{player.name}</div>
              <div className="player-piece">{player.piece === 'car' ? '🚗' : player.piece === 'ship' ? '🚢' : player.piece === 'hat' ? '🎩' : '👞'}</div>
            </div>
            
            <div className="player-stats">
              {isBankrupt(player) ? (
                <div className="bankrupt-label">破產</div>
              ) : (
                <>
                  <div className="player-money">
                    <span className="money-label">現金:</span>
                    <span className="money-value">${player.money}</span>
                  </div>
                  
                  <div className="player-net-worth">
                    <span className="net-worth-label">資產總值:</span>
                    <span className="net-worth-value">${calculateNetWorth(player)}</span>
                  </div>
                  
                  {player.inJail && (
                    <div className="player-jail-status">
                      監獄中 (剩餘 {player.jailTurns} 回合)
                    </div>
                  )}
                </>
              )}
            </div>
            
            <div className="player-properties">
              <h3>擁有的地產</h3>
              {getPlayerProperties(player)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerPanel;
