import React from 'react';
import { useGame } from '../context/GameContext';
import '../assets/styles/BoardCell.css';

const BoardCell = ({ cell, position }) => {
  const { state, dispatch } = useGame();
  const { players, currentPlayer } = state;
  
  // 根據格子類型顯示不同樣式
  const getCellClassName = () => {
    let className = `board-cell ${position} ${cell.type}`;
    
    // 如果格子有顏色（地產有顏色）
    if (cell.color) {
      className += ` ${cell.color}`;
    }
    
    // 如果格子有擁有者
    if (cell.owner !== undefined) {
      className += ' owned';
    }
    
    return className;
  };
  
  // 顯示格子相關資訊
  const renderCellContent = () => {
    switch (cell.type) {
      case 'property':
        return (
          <div className="cell-content">
            {cell.color && <div className="property-color" style={{ backgroundColor: cell.color }}></div>}
            <div className="property-name">{cell.name}</div>
            <div className="property-price">${cell.price}</div>
            {cell.owner !== undefined && (
              <div className="property-owner" style={{ backgroundColor: players[cell.owner]?.color }}></div>
            )}
            {cell.level > 0 && (
              <div className="property-level">
                {Array(cell.level).fill('🏠').join('')}
              </div>
            )}
          </div>
        );
        
      case 'railroad':
        return (
          <div className="cell-content">
            <div className="railroad-icon">🚂</div>
            <div className="railroad-name">{cell.name}</div>
            <div className="railroad-price">${cell.price}</div>
          </div>
        );
        
      case 'utility':
        return (
          <div className="cell-content">
            <div className="utility-icon">
              {cell.name.includes('水') ? '💧' : '💡'}
            </div>
            <div className="utility-name">{cell.name}</div>
            <div className="utility-price">${cell.price}</div>
          </div>
        );
        
      case 'chance':
        return (
          <div className="cell-content">
            <div className="chance-icon">❓</div>
            <div className="chance-name">{cell.name}</div>
          </div>
        );
        
      case 'start':
        return (
          <div className="cell-content">
            <div className="start-icon">🏁</div>
            <div className="start-name">起點</div>
          </div>
        );
        
      case 'jail':
        return (
          <div className="cell-content">
            <div className="jail-icon">🔒</div>
            <div className="jail-name">監獄</div>
          </div>
        );
        
      case 'parking':
        return (
          <div className="cell-content">
            <div className="parking-icon">🅿️</div>
            <div className="parking-name">免費停車</div>
          </div>
        );
        
      case 'goto-jail':
        return (
          <div className="cell-content">
            <div className="goto-jail-icon">👮</div>
            <div className="goto-jail-name">入獄</div>
          </div>
        );
        
      case 'tax':
        return (
          <div className="cell-content">
            <div className="tax-icon">💰</div>
            <div className="tax-name">{cell.name}</div>
            <div className="tax-amount">${cell.tax}</div>
          </div>
        );
        
      case 'empty':
        return <div className="empty-cell"></div>;
        
      default:
        return <div className="cell-content">{cell.name}</div>;
    }
  };
  
  // 處理點擊格子
  const handleCellClick = () => {
    // 顯示該格子詳細資訊的 Modal
    if (cell.type !== 'empty') {
      dispatch({
        type: 'SHOW_MODAL',
        payload: {
          type: 'cell_info',
          data: cell
        }
      });
    }
  };
  
  return (
    <div 
      className={getCellClassName()}
      onClick={handleCellClick}
    >
      {renderCellContent()}
    </div>
  );
};

export default BoardCell;
