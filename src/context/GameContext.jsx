import React, { createContext, useContext, useReducer, useState } from 'react';

// 遊戲初始狀態
const initialState = {
  gameStarted: false,
  gameSetting: {
    playerCount: 2,
    initialMoney: 15000,
    maxRounds: 30
  },
  players: [], // 玩家資料
  board: [],   // 棋盤格子狀態
  turn: 0,     // 當前回合
  currentPlayer: 0, // 當前玩家索引
  round: 1,    // 當前輪數
  diceValue: [0, 0], // 骰子值
  event: null, // 當前事件
  modalOpen: false,
  modalContent: null,
};

// 建立棋盤資料
const createBoardData = () => {
  // 預設 40 格棋盤
  const boardData = [
    { id: 0, type: 'start', name: '起點', description: '經過或停留在此可得 $2000' },
    { id: 1, type: 'property', name: '台北', color: 'brown', price: 1000, rent: [60, 300, 900, 2700, 4000, 5500] },
    { id: 2, type: 'chance', name: '機會', description: '抽取機會卡' },
    { id: 3, type: 'property', name: '高雄', color: 'brown', price: 1000, rent: [60, 300, 900, 2700, 4000, 5500] },
    { id: 4, type: 'tax', name: '所得稅', tax: 2000, description: '支付 $2000 所得稅' },
    { id: 5, type: 'railroad', name: '台灣鐵路', price: 2000, rent: [250, 500, 1000, 2000] },
    { id: 6, type: 'property', name: '台中', color: 'lightblue', price: 1200, rent: [100, 500, 1500, 4500, 6250, 7500] },
    { id: 7, type: 'chance', name: '命運', description: '抽取命運卡' },
    { id: 8, type: 'property', name: '新竹', color: 'lightblue', price: 1200, rent: [100, 500, 1500, 4500, 6250, 7500] },
    { id: 9, type: 'property', name: '嘉義', color: 'lightblue', price: 1400, rent: [120, 600, 1800, 5000, 7000, 9000] },
    { id: 10, type: 'jail', name: '監獄', description: '只是探監' },
    // ... 可以繼續添加更多格子
    { id: 20, type: 'parking', name: '免費停車', description: '休息一回合' },
    { id: 30, type: 'goto-jail', name: '入獄', description: '立即進入監獄' },
    { id: 39, type: 'property', name: '信義區', color: 'blue', price: 4000, rent: [500, 2000, 6000, 14000, 17000, 20000] },
  ];
  
  // 填充剩餘的棋盤格子資料
  return boardData;
};

// 建立玩家資料
const createPlayers = (count, initialMoney) => {
  const colors = ['red', 'blue', 'green', 'yellow'];
  const pieces = ['car', 'ship', 'hat', 'shoe'];
  const players = [];
  
  for (let i = 0; i < count; i++) {
    players.push({
      id: i,
      name: `玩家 ${i + 1}`,
      money: initialMoney,
      position: 0,
      properties: [],
      inJail: false,
      jailTurns: 0,
      color: colors[i],
      piece: pieces[i],
      bankruptcy: false
    });
  }
  
  return players;
};

// reducer 處理各種 action
function gameReducer(state, action) {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...state,
        gameStarted: true,
        players: createPlayers(state.gameSetting.playerCount, state.gameSetting.initialMoney),
        board: createBoardData(),
        currentPlayer: 0,
        round: 1,
        turn: 0
      };
      
    case 'UPDATE_GAME_SETTINGS':
      return {
        ...state,
        gameSetting: {
          ...state.gameSetting,
          ...action.payload
        }
      };
      
    case 'ROLL_DICE':
      const dice1 = Math.floor(Math.random() * 6) + 1;
      const dice2 = Math.floor(Math.random() * 6) + 1;
      return {
        ...state,
        diceValue: [dice1, dice2]
      };
      
    case 'MOVE_PLAYER':
      const player = state.players[state.currentPlayer];
      const diceSum = state.diceValue[0] + state.diceValue[1];
      const boardSize = state.board.length || 40;
      const newPosition = (player.position + diceSum) % boardSize;
      
      // 判斷是否經過起點
      const passedStart = player.position + diceSum >= boardSize;
      
      const updatedPlayers = state.players.map((p, idx) => {
        if (idx === state.currentPlayer) {
          return {
            ...p,
            position: newPosition,
            // 經過起點加錢
            money: passedStart ? p.money + 2000 : p.money
          };
        }
        return p;
      });
      
      return {
        ...state,
        players: updatedPlayers,
        event: {
          type: 'move',
          player: state.currentPlayer,
          from: player.position,
          to: newPosition,
          passedStart
        }
      };
      
    case 'BUY_PROPERTY':
      const buyingPlayer = state.players[state.currentPlayer];
      const property = state.board[buyingPlayer.position];
      
      if (buyingPlayer.money < property.price) {
        return {
          ...state,
          event: {
            type: 'error',
            message: '資金不足，無法購買'
          }
        };
      }
      
      const playersAfterBuy = state.players.map((p, idx) => {
        if (idx === state.currentPlayer) {
          return {
            ...p,
            money: p.money - property.price,
            properties: [...p.properties, buyingPlayer.position]
          };
        }
        return p;
      });
      
      const updatedBoard = state.board.map((cell, idx) => {
        if (idx === buyingPlayer.position) {
          return {
            ...cell,
            owner: state.currentPlayer,
            level: 0
          };
        }
        return cell;
      });
      
      return {
        ...state,
        players: playersAfterBuy,
        board: updatedBoard,
        event: {
          type: 'purchase',
          player: state.currentPlayer,
          property: buyingPlayer.position
        }
      };
      
    case 'PAY_RENT':
      const { fromPlayer, toPlayer, amount } = action.payload;
      
      const playersAfterRent = state.players.map((p, idx) => {
        if (idx === fromPlayer) {
          return {
            ...p,
            money: p.money - amount
          };
        }
        if (idx === toPlayer) {
          return {
            ...p,
            money: p.money + amount
          };
        }
        return p;
      });
      
      return {
        ...state,
        players: playersAfterRent,
        event: {
          type: 'rent',
          fromPlayer,
          toPlayer,
          amount
        }
      };
      
    case 'NEXT_TURN':
      let nextPlayer = (state.currentPlayer + 1) % state.players.length;
      let nextRound = state.round;
      
      // 如果輪到第一位玩家，回合數+1
      if (nextPlayer === 0) {
        nextRound += 1;
      }
      
      return {
        ...state,
        currentPlayer: nextPlayer,
        round: nextRound,
        turn: state.turn + 1,
        event: null,
        modalOpen: false
      };
      
    case 'SHOW_MODAL':
      return {
        ...state,
        modalOpen: true,
        modalContent: action.payload
      };
      
    case 'CLOSE_MODAL':
      return {
        ...state,
        modalOpen: false,
        modalContent: null
      };
      
    case 'GAME_OVER':
      return {
        ...state,
        gameStarted: false,
        event: {
          type: 'gameOver',
          winner: action.payload.winner
        }
      };
      
    case 'RESET_GAME':
      return initialState;
      
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
