import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import '../assets/styles/GameSetting.css';

const GameSetting = () => {
  const { state, dispatch } = useGame();
  const { gameStarted, gameSetting } = state;
  
  // 使用 state 儲存表單值
  const [settings, setSettings] = useState({
    playerCount: gameSetting.playerCount,
    initialMoney: gameSetting.initialMoney,
    maxRounds: gameSetting.maxRounds,
    players: [
      { name: '玩家 1', color: 'red', piece: 'car' },
      { name: '玩家 2', color: 'blue', piece: 'ship' },
      { name: '玩家 3', color: 'green', piece: 'hat' },
      { name: '玩家 4', color: 'yellow', piece: 'shoe' }
    ]
  });
  
  // 如果遊戲已開始，則不顯示設定頁面
  if (gameStarted) {
    return null;
  }

  // 更新設定
  const handleSettingChange = (e) => {
    const { name, value } = e.target;
    setSettings({
      ...settings,
      [name]: parseInt(value, 10)
    });
    
    dispatch({
      type: 'UPDATE_GAME_SETTINGS',
      payload: { [name]: parseInt(value, 10) }
    });
  };
  
  // 更新玩家資訊
  const handlePlayerChange = (index, field, value) => {
    const updatedPlayers = [...settings.players];
    updatedPlayers[index] = {
      ...updatedPlayers[index],
      [field]: value
    };
    
    setSettings({
      ...settings,
      players: updatedPlayers
    });
  };
  
  // 開始遊戲
  const handleStartGame = () => {
    // 更新玩家名稱
    dispatch({
      type: 'START_GAME'
    });
  };
  
  // 棋子選項
  const pieceOptions = [
    { value: 'car', label: '🚗 汽車' },
    { value: 'ship', label: '🚢 船' },
    { value: 'hat', label: '🎩 帽子' },
    { value: 'shoe', label: '👞 鞋子' }
  ];
  
  // 顏色選項
  const colorOptions = [
    { value: 'red', label: '紅色' },
    { value: 'blue', label: '藍色' },
    { value: 'green', label: '綠色' },
    { value: 'yellow', label: '黃色' },
    { value: 'purple', label: '紫色' },
    { value: 'orange', label: '橙色' }
  ];

  return (
    <div className="game-setting">
      <h2>遊戲設定</h2>
      
      <div className="setting-form">
        <div className="form-group">
          <label htmlFor="playerCount">玩家數量</label>
          <select 
            id="playerCount" 
            name="playerCount" 
            value={settings.playerCount}
            onChange={handleSettingChange}
          >
            <option value="2">2 位玩家</option>
            <option value="3">3 位玩家</option>
            <option value="4">4 位玩家</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="initialMoney">初始資金</label>
          <select 
            id="initialMoney" 
            name="initialMoney" 
            value={settings.initialMoney}
            onChange={handleSettingChange}
          >
            <option value="10000">$10,000</option>
            <option value="15000">$15,000</option>
            <option value="20000">$20,000</option>
            <option value="30000">$30,000</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="maxRounds">最大回合數</label>
          <select 
            id="maxRounds" 
            name="maxRounds" 
            value={settings.maxRounds}
            onChange={handleSettingChange}
          >
            <option value="20">20 回合</option>
            <option value="30">30 回合</option>
            <option value="50">50 回合</option>
            <option value="100">100 回合</option>
          </select>
        </div>
      </div>
      
      <div className="player-settings">
        <h3>玩家資訊設定</h3>
        
        {Array.from({ length: settings.playerCount }).map((_, index) => (
          <div key={index} className="player-form">
            <div className="player-number">玩家 {index + 1}</div>
            
            <div className="form-group">
              <label htmlFor={`playerName${index}`}>名稱</label>
              <input
                id={`playerName${index}`}
                type="text"
                value={settings.players[index].name}
                onChange={(e) => handlePlayerChange(index, 'name', e.target.value)}
                maxLength={10}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor={`playerColor${index}`}>顏色</label>
              <select
                id={`playerColor${index}`}
                value={settings.players[index].color}
                onChange={(e) => handlePlayerChange(index, 'color', e.target.value)}
              >
                {colorOptions.map(option => (
                  <option 
                    key={option.value} 
                    value={option.value}
                    disabled={settings.players.some((p, i) => i !== index && p.color === option.value)}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
              <div 
                className="color-preview"
                style={{ backgroundColor: settings.players[index].color }}
              ></div>
            </div>
            
            <div className="form-group">
              <label htmlFor={`playerPiece${index}`}>棋子</label>
              <select
                id={`playerPiece${index}`}
                value={settings.players[index].piece}
                onChange={(e) => handlePlayerChange(index, 'piece', e.target.value)}
              >
                {pieceOptions.map(option => (
                  <option 
                    key={option.value} 
                    value={option.value}
                    disabled={settings.players.some((p, i) => i !== index && p.piece === option.value)}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="piece-preview">
                {settings.players[index].piece === 'car' ? '🚗' :
                 settings.players[index].piece === 'ship' ? '🚢' :
                 settings.players[index].piece === 'hat' ? '🎩' : '👞'}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <button 
        className="start-game-button"
        onClick={handleStartGame}
      >
        開始遊戲
      </button>
    </div>
  );
};

export default GameSetting;
