import React, { createContext, useContext, useReducer } from 'react';

// 遊戲初始狀態
const initialState = {
  players: [], // 玩家資料
  board: [],   // 棋盤格子狀態
  turn: 0,     // 當前回合
  event: null, // 當前事件
};

// reducer 處理各種 action
function gameReducer(state, action) {
  switch (action.type) {
    // 這裡可擴充各種遊戲 action
    default:
      return state;
  }
}

const GameContext = createContext();

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}
