import React from 'react';
import { useGame } from '../context/GameContext';
import '../assets/styles/ActionPanel.css';

const ActionPanel = () => {
  const { state, dispatch } = useGame();
  const { 
    gameStarted, 
    currentPlayer, 
    players, 
    board, 
    event,
    round,
    gameSetting
  } = state;

  if (!gameStarted) {
    return null; // 遊戲未開始時不顯示
  }

  const currentPlayerData = players[currentPlayer];

  // 顯示當前事件訊息
  const renderEventMessage = () => {
    if (!event) return null;

    switch (event.type) {
      case 'move':
        const fromCell = board[event.from];
        const toCell = board[event.to];
        return (
          <div className="event-message move">
            <span className="player-name">{players[event.player].name}</span>
            從 <span className="cell-name">{fromCell?.name || event.from}</span>
            移動到 <span className="cell-name">{toCell?.name || event.to}</span>
            {event.passedStart && <span className="bonus-message">經過起點獲得 $2000</span>}
          </div>
        );

      case 'purchase':
        const property = board[event.property];
        return (
          <div className="event-message purchase">
            <span className="player-name">{players[event.player].name}</span>
            購買了 <span className="cell-name">{property?.name || event.property}</span>
            價格: ${property?.price}
          </div>
        );

      case 'rent':
        return (
          <div className="event-message rent">
            <span className="player-name">{players[event.fromPlayer].name}</span>
            支付租金 ${event.amount} 給 
            <span className="player-name">{players[event.toPlayer].name}</span>
          </div>
        );

      case 'error':
        return (
          <div className="event-message error">
            {event.message}
          </div>
        );

      case 'gameOver':
        return (
          <div className="event-message game-over">
            遊戲結束！勝利者：
            <span className="player-name">{players[event.winner].name}</span>
          </div>
        );

      default:
        return null;
    }
  };

  // 處理當前地產的購買和房屋升級
  const handlePropertyAction = () => {
    const currentCell = board[currentPlayerData.position];

    // 如果是可購買的地產且沒有擁有者
    if (['property', 'railroad', 'utility'].includes(currentCell?.type) && currentCell.owner === undefined) {
      dispatch({
        type: 'BUY_PROPERTY'
      });
    } 
    // 如果是自己的地產且可以升級
    else if (currentCell?.type === 'property' && currentCell.owner === currentPlayer && currentCell.level < 5) {
      dispatch({
        type: 'SHOW_MODAL',
        payload: {
          type: 'upgrade',
          data: currentCell
        }
      });
    }
  };

  // 結束回合
  const handleEndTurn = () => {
    dispatch({ type: 'NEXT_TURN' });
  };

  // 判斷當前是否可以進行屬性操作
  const canPerformPropertyAction = () => {
    if (!currentPlayerData || currentPlayerData.bankruptcy || currentPlayerData.inJail) return false;
    
    const currentCell = board[currentPlayerData.position];
    
    // 如果是可購買的地產且沒有擁有者，且玩家有足夠的錢
    if (['property', 'railroad', 'utility'].includes(currentCell?.type) && 
        currentCell.owner === undefined && 
        currentPlayerData.money >= currentCell.price) {
      return true;
    }
    
    // 如果是自己的地產且可以升級
    if (currentCell?.type === 'property' && 
        currentCell.owner === currentPlayer && 
        currentCell.level < 5) {
      return true;
    }
    
    return false;
  };

  // 顯示當前位置的地產資訊
  const renderCurrentLocation = () => {
    if (!currentPlayerData) return null;
    
    const currentCell = board[currentPlayerData.position];
    if (!currentCell) return null;
    
    return (
      <div className="current-location">
        <div className="location-label">目前位置:</div>
        <div className="location-name">
          {currentCell.name || `位置 ${currentPlayerData.position}`}
        </div>
      </div>
    );
  };

  // 獲取地產操作按鈕的文字
  const getPropertyActionText = () => {
    const currentCell = board[currentPlayerData?.position];
    
    if (!currentCell) return '';
    
    if (['property', 'railroad', 'utility'].includes(currentCell.type) && currentCell.owner === undefined) {
      return `購買 ${currentCell.name} ($${currentCell.price})`;
    } 
    
    if (currentCell.type === 'property' && currentCell.owner === currentPlayer && currentCell.level < 5) {
      return `升級 ${currentCell.name} (等級 ${currentCell.level + 1})`;
    }
    
    return '';
  };

  return (
    <div className="action-panel">
      <div className="game-status">
        <div className="round-info">
          回合：{round} / {gameSetting.maxRounds}
        </div>
        <div className="turn-info">
          當前玩家：
          <span className="current-player" style={{ color: currentPlayerData?.color }}>
            {currentPlayerData?.name}
          </span>
        </div>
      </div>
      
      {renderCurrentLocation()}
      
      <div className="event-container">
        {renderEventMessage()}
      </div>
      
      <div className="action-buttons">
        <button 
          className={`property-action ${canPerformPropertyAction() ? '' : 'disabled'}`}
          onClick={handlePropertyAction}
          disabled={!canPerformPropertyAction()}
        >
          {getPropertyActionText()}
        </button>
        
        <button 
          className="end-turn"
          onClick={handleEndTurn}
        >
          結束回合
        </button>
      </div>
    </div>
  );
};

export default ActionPanel;
