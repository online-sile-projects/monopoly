// 匯入資料檔案
import boardDataJson from '../data/boardData.json';
import chanceCardsJson from '../data/chanceCards.json';
import communityCardsJson from '../data/communityCards.json';

// 卡片效果處理函式集合
const cardEffectHandlers = {
  // 金錢增減效果
  money: (state, playerId, amount) => {
    return updatePlayerMoney(state, playerId, amount);
  },
  
  // 移動到特定位置
  moveToPosition: (state, playerId, position, collectStartBonus = false) => {
    const newState = movePlayerToPosition(state, playerId, position);
    
    // 如果需要額外獲得起點獎勵
    if (collectStartBonus) {
      return updatePlayerMoney(newState, playerId, 2000);
    }
    
    return newState;
  },
  
  // 支付給每位玩家
  payEachPlayer: (state, playerId, amount) => {
    // 計算需要付給其他玩家的總金額
    const otherPlayers = state.players.filter(p => p.id !== playerId && !p.bankruptcy);
    const totalPay = otherPlayers.length * amount;
    
    // 更新支付玩家的金錢
    let newState = updatePlayerMoney(state, playerId, -totalPay);
    
    // 更新收款玩家的金錢
    otherPlayers.forEach(player => {
      newState = updatePlayerMoney(newState, player.id, amount);
    });
    
    return newState;
  },
  
  // 從每位玩家收取金錢
  collectFromEachPlayer: (state, playerId, amount) => {
    // 計算收到的總金額
    const otherPlayers = state.players.filter(p => p.id !== playerId && !p.bankruptcy);
    const totalReceive = otherPlayers.length * amount;
    
    // 更新收款玩家的金錢
    let newState = updatePlayerMoney(state, playerId, totalReceive);
    
    // 更新支付玩家的金錢
    otherPlayers.forEach(player => {
      newState = updatePlayerMoney(newState, player.id, -amount);
    });
    
    return newState;
  },
  
  // 前往監獄
  goToJail: (state, playerId) => {
    return {
      ...state,
      players: state.players.map((p, idx) => {
        if (idx === playerId) {
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
        player: playerId,
        message: `玩家 ${playerId + 1} 被送進監獄`
      }
    };
  }
};

// 匯出卡片效果處理函式和資料檔案
export { cardEffectHandlers as default, boardDataJson, chanceCardsJson, communityCardsJson };
