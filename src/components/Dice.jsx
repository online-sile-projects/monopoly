import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import '../assets/styles/Dice.css';

const Dice = () => {
  const { state, dispatch } = useGame();
  const { gameStarted, diceValue, currentPlayer, players } = state;
  const [rolling, setRolling] = useState(false);
  
  // 當骰子值變化時停止動畫
  useEffect(() => {
    if (rolling) {
      const timer = setTimeout(() => {
        setRolling(false);
        
        // 骰子停止後移動玩家
        dispatch({ type: 'MOVE_PLAYER' });
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [rolling, dispatch]);

  // 擲骰子
  const handleRollDice = () => {
    // 檢查是否為當前玩家的回合且遊戲已開始
    if (!gameStarted || players[currentPlayer].bankruptcy || players[currentPlayer].inJail) {
      return;
    }
    
    setRolling(true);
    dispatch({ type: 'ROLL_DICE' });
  };

  // 根據骰子數值顯示點數
  const renderDots = (value) => {
    switch (value) {
      case 1:
        return <div className="dice-dot center"></div>;
      case 2:
        return (
          <>
            <div className="dice-dot top-left"></div>
            <div className="dice-dot bottom-right"></div>
          </>
        );
      case 3:
        return (
          <>
            <div className="dice-dot top-left"></div>
            <div className="dice-dot center"></div>
            <div className="dice-dot bottom-right"></div>
          </>
        );
      case 4:
        return (
          <>
            <div className="dice-dot top-left"></div>
            <div className="dice-dot top-right"></div>
            <div className="dice-dot bottom-left"></div>
            <div className="dice-dot bottom-right"></div>
          </>
        );
      case 5:
        return (
          <>
            <div className="dice-dot top-left"></div>
            <div className="dice-dot top-right"></div>
            <div className="dice-dot center"></div>
            <div className="dice-dot bottom-left"></div>
            <div className="dice-dot bottom-right"></div>
          </>
        );
      case 6:
        return (
          <>
            <div className="dice-dot top-left"></div>
            <div className="dice-dot top-right"></div>
            <div className="dice-dot middle-left"></div>
            <div className="dice-dot middle-right"></div>
            <div className="dice-dot bottom-left"></div>
            <div className="dice-dot bottom-right"></div>
          </>
        );
      default:
        return null;
    }
  };

  if (!gameStarted) {
    return null; // 遊戲未開始時不顯示
  }

  return (
    <div className="dice-container">
      <div className={`dice-area ${rolling ? 'rolling' : ''}`}>
        <div className="dice dice-one">
          {renderDots(diceValue[0])}
        </div>
        <div className="dice dice-two">
          {renderDots(diceValue[1])}
        </div>
      </div>
      
      <div className="dice-total">
        總點數: {diceValue[0] + diceValue[1]}
      </div>
      
      <button 
        className={`roll-button ${rolling ? 'disabled' : ''}`}
        onClick={handleRollDice}
        disabled={rolling}
      >
        {rolling ? '擲骰中...' : '擲骰子'}
      </button>
    </div>
  );
};

export default Dice;
