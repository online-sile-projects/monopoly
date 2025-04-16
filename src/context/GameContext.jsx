import React, { createContext, useContext, useReducer, useState } from 'react';
import boardData from '../data/boardData.json';
import chanceCards from '../data/chanceCards.json';
import communityCards from '../data/communityCards.json';
import cardEffectHandlers from '../utils/cardEffects';

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
  pendingCardDraw: null, // 新增：待處理的卡片類型 ('chance' 或 'community' 或 null)
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
      };      case 'MOVE_PLAYER':
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
      
      // 處理移動後的格子效果
      const landedCell = state.board[newPosition];
      
      // 如果是機會或命運格，設定待抽卡狀態
      const pendingCardDraw = (landedCell.type === 'chance' || landedCell.type === 'community') 
        ? landedCell.type 
        : null;
      
      return {
        ...state,
        players: updatedPlayers,
        event: {
          type: 'move',
          player: state.currentPlayer,
          from: player.position,
          to: newPosition,
          passedStart
        },
        pendingCardDraw: pendingCardDraw // 新增的狀態，標記需要抽取的卡片類型
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
      
    case 'DRAW_CARD':
      const { cardType } = action.payload;
      // 根據卡片類型選擇相應的卡堆
      const cardDeck = cardType === 'chance' ? chanceCards : communityCards;
      // 隨機抽取一張卡
      const randomIndex = Math.floor(Math.random() * cardDeck.length);
      const drawnCard = cardDeck[randomIndex];
      
      return {
        ...state,
        modalOpen: true,
        modalContent: {
          type: 'chance',
          data: {
            ...drawnCard,
            cardType
          }
        },
        event: {
          type: 'draw_card',
          player: state.currentPlayer,
          cardType,
          cardDescription: drawnCard.description
        }
      };
      
    case 'EXECUTE_CARD_EFFECT':
      const card = action.payload;
      let effectState = state;
      
      // 根據卡片類型執行相應效果
      if (cardEffectHandlers[card.type]) {
        // 獲取對應的卡片效果處理函式
        const effectHandler = cardEffectHandlers[card.type];
        
        // 根據卡片類型執行不同的效果
        switch(card.type) {
          case 'money':
            effectState = {
              ...state,
              players: state.players.map((p, idx) => {
                if (idx === state.currentPlayer) {
                  return {
                    ...p,
                    money: p.money + card.amount
                  };
                }
                return p;
              }),
              event: {
                type: 'card_effect',
                player: state.currentPlayer,
                description: card.description,
                effect: card.amount > 0 ? '獲得金錢' : '支付金錢',
                amount: Math.abs(card.amount)
              }
            };
            break;
            
          case 'moveToPosition':
            // 檢查是否需要經過起點獎勵
            let additionalMoney = 0;
            const currentPosition = state.players[state.currentPlayer].position;
            
            // 如果新位置比當前位置小且需要獲得起點獎勵，添加 2000 元
            if (card.position < currentPosition && card.collectStartBonus) {
              additionalMoney = 2000;
            }
            
            effectState = {
              ...state,
              players: state.players.map((p, idx) => {
                if (idx === state.currentPlayer) {
                  return {
                    ...p,
                    position: card.position,
                    money: p.money + additionalMoney
                  };
                }
                return p;
              }),
              event: {
                type: 'card_effect',
                player: state.currentPlayer,
                description: card.description,
                effect: '移動到新位置',
                newPosition: card.position,
                additionalMoney
              }
            };
            break;
            
          case 'payEachPlayer':
            let totalPaid = 0;
            let playersAfterPayment = [...state.players];
            
            // 計算需要支付的總額並更新其他玩家的金錢
            state.players.forEach((p, idx) => {
              if (idx !== state.currentPlayer && !p.bankruptcy) {
                totalPaid += card.amount;
                playersAfterPayment[idx] = {
                  ...p,
                  money: p.money + card.amount
                };
              }
            });
            
            // 更新當前玩家的金錢
            playersAfterPayment[state.currentPlayer] = {
              ...playersAfterPayment[state.currentPlayer],
              money: playersAfterPayment[state.currentPlayer].money - totalPaid
            };
            
            effectState = {
              ...state,
              players: playersAfterPayment,
              event: {
                type: 'card_effect',
                player: state.currentPlayer,
                description: card.description,
                effect: '支付給其他玩家',
                amount: card.amount,
                totalPaid
              }
            };
            break;
            
          case 'collectFromEachPlayer':
            let totalCollected = 0;
            let playersAfterCollection = [...state.players];
            
            // 計算可以收集的總額並更新其他玩家的金錢
            state.players.forEach((p, idx) => {
              if (idx !== state.currentPlayer && !p.bankruptcy) {
                totalCollected += card.amount;
                playersAfterCollection[idx] = {
                  ...p,
                  money: p.money - card.amount
                };
              }
            });
            
            // 更新當前玩家的金錢
            playersAfterCollection[state.currentPlayer] = {
              ...playersAfterCollection[state.currentPlayer],
              money: playersAfterCollection[state.currentPlayer].money + totalCollected
            };
            
            effectState = {
              ...state,
              players: playersAfterCollection,
              event: {
                type: 'card_effect',
                player: state.currentPlayer,
                description: card.description,
                effect: '從其他玩家收集金錢',
                amount: card.amount,
                totalCollected
              }
            };
            break;
            
          case 'goToJail':
            effectState = {
              ...state,
              players: state.players.map((p, idx) => {
                if (idx === state.currentPlayer) {
                  return {
                    ...p,
                    position: 10, // 監獄的位置
                    inJail: true,
                    jailTurns: 1
                  };
                }
                return p;
              }),
              event: {
                type: 'card_effect',
                player: state.currentPlayer,
                description: card.description,
                effect: '進入監獄'
              }
            };
            break;
            
          default:
            // 未知卡片類型，不做處理
            break;
        }
      }
      
      return effectState;
    
    default:
      return state;
  }
}

const GameContext = createContext();

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  
  // 使用 useEffect 來處理待抽卡的狀態
  React.useEffect(() => {
    // 如果有待抽卡的狀態，在短暫延遲後觸發抽卡動作
    if (state.pendingCardDraw) {
      const timer = setTimeout(() => {
        dispatch({ 
          type: 'DRAW_CARD', 
          payload: { cardType: state.pendingCardDraw } 
        });
      }, 1000); // 延遲 1 秒，讓移動動畫完成
      
      return () => clearTimeout(timer); // 清除計時器
    }
  }, [state.pendingCardDraw]);
  
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}
