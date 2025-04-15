import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import '../assets/styles/Header.css';

const Header = () => {
  const { state, dispatch } = useGame();
  const { gameStarted } = state;
  const [showRules, setShowRules] = useState(false);

  // 顯示/隱藏遊戲規則
  const toggleRules = () => {
    setShowRules(!showRules);
  };

  // 重置遊戲
  const handleResetGame = () => {
    if (window.confirm('確定要重置遊戲嗎？所有遊戲進度將會遺失。')) {
      dispatch({ type: 'RESET_GAME' });
    }
  };

  return (
    <header className="game-header">
      <div className="header-content">
        <div className="logo">
          <h1>大富翁</h1>
        </div>
        
        <div className="header-actions">
          <button 
            className="rules-button"
            onClick={toggleRules}
          >
            遊戲規則
          </button>
          
          {gameStarted && (
            <button 
              className="reset-button"
              onClick={handleResetGame}
            >
              重設遊戲
            </button>
          )}
        </div>
      </div>
      
      {showRules && (
        <div className="rules-panel">
          <h2>遊戲規則</h2>
          <div className="rules-content">
            <h3>基本規則</h3>
            <ul>
              <li>每位玩家輪流擲骰子移動棋子</li>
              <li>玩家可以購買自己停留格子上的地產</li>
              <li>當玩家停留在其他玩家的地產上時，必須支付租金</li>
              <li>經過起點時獲得 $2000</li>
              <li>資金耗盡時破產，遊戲結束</li>
            </ul>
            
            <h3>地產升級</h3>
            <ul>
              <li>擁有地產後，可以支付建設費用升級</li>
              <li>地產等級越高，租金越高</li>
              <li>最高可升級至 5 級（飯店）</li>
            </ul>
            
            <h3>特殊格子</h3>
            <ul>
              <li>起點：經過或停留在此可得 $2000</li>
              <li>監獄：探監，沒有影響</li>
              <li>入獄：立即進入監獄，暫停一回合</li>
              <li>免費停車：休息一回合</li>
              <li>機會/命運：抽取機會/命運卡，依指示行動</li>
              <li>稅金：支付指定金額的稅金</li>
            </ul>
            
            <h3>遊戲勝利</h3>
            <ul>
              <li>當其他玩家都破產時，最後一名未破產的玩家獲勝</li>
              <li>達到最大回合數時，資產最多的玩家獲勝</li>
            </ul>
          </div>
          
          <button 
            className="close-rules-button"
            onClick={toggleRules}
          >
            關閉規則
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
