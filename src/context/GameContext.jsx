import React, { createContext, useContext, useReducer, useState } from 'react';
import boardData from '../data/boardData.json';

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
  hasDiceRolled: false, // 當前回合是否已經擲過骰子
  event: null, // 當前事件
  modalOpen: false,
  modalContent: null,
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
        board: boardData,
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
      // 如果已經擲過骰子，則不允許再次擲骰
      if (state.hasDiceRolled) {
        return {
          ...state,
          event: {
            type: 'error',
            message: '本回合已經擲過骰子了'
          }
        };
      }
      const dice1 = Math.floor(Math.random() * 6) + 1;
      const dice2 = Math.floor(Math.random() * 6) + 1;
      return {
        ...state,
        diceValue: [dice1, dice2],
        hasDiceRolled: true
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
        modalOpen: false,
        hasDiceRolled: false,  // 重置骰子擲出標記
        diceValue: [0, 0]      // 重置骰子值
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
