import React from 'react';
import { useGame } from '../context/GameContext';
import '../assets/styles/Modal.css';

const Modal = () => {
  const { state, dispatch } = useGame();
  const { modalOpen, modalContent, players, currentPlayer, board } = state;

  if (!modalOpen || !modalContent) {
    return null;
  }

  // 關閉彈窗
  const handleCloseModal = () => {
    dispatch({ type: 'CLOSE_MODAL' });
  };

  // 購買地產
  const handleBuyProperty = () => {
    dispatch({ type: 'BUY_PROPERTY' });
    handleCloseModal();
  };

  // 升級地產
  const handleUpgradeProperty = (propertyId) => {
    dispatch({
      type: 'UPGRADE_PROPERTY',
      payload: { propertyId }
    });
    handleCloseModal();
  };

  // 支付租金
  const handlePayRent = (amount, toPlayer) => {
    dispatch({
      type: 'PAY_RENT',
      payload: { 
        fromPlayer: currentPlayer,
        toPlayer,
        amount
      }
    });
    handleCloseModal();
  };

  // 根據彈窗類型渲染不同的內容
  const renderModalContent = () => {
    switch (modalContent.type) {
      case 'cell_info':
        return renderCellInfoModal(modalContent.data);
      
      case 'purchase':
        return renderPurchaseModal(modalContent.data);
      
      case 'upgrade':
        return renderUpgradeModal(modalContent.data);
      
      case 'rent':
        return renderRentModal(modalContent.data);
      
      case 'chance':
        return renderChanceModal(modalContent.data);
      
      case 'game_over':
        return renderGameOverModal(modalContent.data);
      
      default:
        return <div>未知彈窗類型</div>;
    }
  };

  // 渲染格子資訊彈窗
  const renderCellInfoModal = (cell) => {
    if (!cell) return <div>無效的格子資料</div>;

    let content = null;

    switch (cell.type) {
      case 'property':
        content = (
          <>
            <div className="modal-property-header" style={{ backgroundColor: cell.color }}>
              <h3>{cell.name}</h3>
              <div className="price">${cell.price}</div>
            </div>
            
            <div className="modal-property-details">
              <div className="rent-info">
                <h4>租金資訊：</h4>
                <ul>
                  <li>基本租金: ${cell.rent[0]}</li>
                  <li>1 棟房子: ${cell.rent[1]}</li>
                  <li>2 棟房子: ${cell.rent[2]}</li>
                  <li>3 棟房子: ${cell.rent[3]}</li>
                  <li>4 棟房子: ${cell.rent[4]}</li>
                  <li>飯店: ${cell.rent[5]}</li>
                </ul>
              </div>
              
              {cell.owner !== undefined && (
                <div className="owner-info">
                  <h4>擁有者：</h4>
                  <div className="owner" style={{ color: players[cell.owner].color }}>
                    {players[cell.owner].name}
                  </div>
                  <div className="level-info">
                    現在等級: {cell.level || 0}
                    {cell.level > 0 && (
                      <div className="buildings">
                        {Array(cell.level).fill('🏠').join('')}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {cell.owner === undefined && players[currentPlayer].money >= cell.price && (
              <button 
                className="buy-button"
                onClick={handleBuyProperty}
              >
                購買 (${cell.price})
              </button>
            )}
            
            {cell.owner === currentPlayer && cell.level < 5 && (
              <button 
                className="upgrade-button"
                onClick={() => handleUpgradeProperty(cell.id)}
              >
                升級 (${Math.floor(cell.price * 0.5)})
              </button>
            )}
          </>
        );
        break;

      case 'railroad':
        content = (
          <>
            <div className="modal-railroad-header">
              <h3>{cell.name}</h3>
              <div className="railroad-icon">🚂</div>
              <div className="price">${cell.price}</div>
            </div>
            
            <div className="modal-railroad-details">
              <div className="rent-info">
                <h4>租金資訊：</h4>
                <ul>
                  <li>擁有 1 個鐵路: ${cell.rent[0]}</li>
                  <li>擁有 2 個鐵路: ${cell.rent[1]}</li>
                  <li>擁有 3 個鐵路: ${cell.rent[2]}</li>
                  <li>擁有 4 個鐵路: ${cell.rent[3]}</li>
                </ul>
              </div>
              
              {cell.owner !== undefined && (
                <div className="owner-info">
                  <h4>擁有者：</h4>
                  <div className="owner" style={{ color: players[cell.owner].color }}>
                    {players[cell.owner].name}
                  </div>
                </div>
              )}
            </div>
            
            {cell.owner === undefined && players[currentPlayer].money >= cell.price && (
              <button 
                className="buy-button"
                onClick={handleBuyProperty}
              >
                購買 (${cell.price})
              </button>
            )}
          </>
        );
        break;

      case 'chance':
        content = (
          <div className="modal-chance">
            <div className="chance-icon">❓</div>
            <h3>{cell.name}</h3>
            <p>{cell.description}</p>
          </div>
        );
        break;
        
      case 'tax':
        content = (
          <div className="modal-tax">
            <div className="tax-icon">💰</div>
            <h3>{cell.name}</h3>
            <p>{cell.description}</p>
            <div className="tax-amount">支付: ${cell.tax}</div>
            
            <button 
              className="pay-button"
              onClick={() => {
                dispatch({
                  type: 'PAY_TAX',
                  payload: { amount: cell.tax }
                });
                handleCloseModal();
              }}
            >
              支付稅金
            </button>
          </div>
        );
        break;
        
      default:
        content = (
          <div className="modal-basic">
            <h3>{cell.name}</h3>
            <p>{cell.description}</p>
          </div>
        );
    }

    return (
      <div className="modal-content">
        {content}
      </div>
    );
  };

  // 渲染購買地產彈窗
  const renderPurchaseModal = (data) => {
    const property = board[data.propertyId];
    const currentPlayerData = players[currentPlayer];

    return (
      <div className="modal-purchase">
        <h3>購買地產</h3>
        <div className="property-details">
          <div className="property-name" style={{ backgroundColor: property.color }}>
            {property.name}
          </div>
          <div className="property-price">價格: ${property.price}</div>
          <div className="player-money">您的資金: ${currentPlayerData.money}</div>
        </div>
        
        <div className="purchase-buttons">
          <button 
            className="confirm-button"
            onClick={handleBuyProperty}
          >
            確認購買
          </button>
          
          <button 
            className="cancel-button"
            onClick={handleCloseModal}
          >
            取消
          </button>
        </div>
      </div>
    );
  };

  // 渲染升級地產彈窗
  const renderUpgradeModal = (data) => {
    const property = board[data.id];
    const currentPlayerData = players[currentPlayer];
    const upgradePrice = Math.floor(property.price * 0.5);

    return (
      <div className="modal-upgrade">
        <h3>升級地產</h3>
        <div className="property-details">
          <div className="property-name" style={{ backgroundColor: property.color }}>
            {property.name}
          </div>
          <div className="current-level">
            目前等級: {property.level}
            {property.level > 0 && (
              <div className="buildings">
                {Array(property.level).fill('🏠').join('')}
              </div>
            )}
          </div>
          <div className="upgrade-price">升級費用: ${upgradePrice}</div>
          <div className="player-money">您的資金: ${currentPlayerData.money}</div>
          <div className="new-rent">升級後的租金: ${property.rent[property.level + 1]}</div>
        </div>
        
        <div className="upgrade-buttons">
          <button 
            className="confirm-button"
            onClick={() => handleUpgradeProperty(property.id)}
            disabled={currentPlayerData.money < upgradePrice}
          >
            確認升級
          </button>
          
          <button 
            className="cancel-button"
            onClick={handleCloseModal}
          >
            取消
          </button>
        </div>
      </div>
    );
  };

  // 渲染租金支付彈窗
  const renderRentModal = (data) => {
    const { propertyId, owner, amount } = data;
    const property = board[propertyId];
    const ownerData = players[owner];
    const currentPlayerData = players[currentPlayer];

    return (
      <div className="modal-rent">
        <h3>支付租金</h3>
        <div className="rent-details">
          <div className="property-name" style={{ backgroundColor: property.color }}>
            {property.name}
          </div>
          <div className="owner-info">
            擁有者: <span style={{ color: ownerData.color }}>{ownerData.name}</span>
          </div>
          <div className="rent-amount">應付租金: ${amount}</div>
          <div className="player-money">您的資金: ${currentPlayerData.money}</div>
        </div>
        
        <div className="rent-buttons">
          <button 
            className="pay-button"
            onClick={() => handlePayRent(amount, owner)}
          >
            支付租金
          </button>
        </div>
      </div>
    );
  };

  // 渲染機會卡/命運卡彈窗
  const renderChanceModal = (data) => {
    return (
      <div className="modal-chance-card">
        <div className="card-title">{data.type === 'chance' ? '機會' : '命運'}</div>
        <div className="card-content">{data.description}</div>
        
        <button 
          className="action-button"
          onClick={() => {
            dispatch({
              type: 'EXECUTE_CARD_EFFECT',
              payload: data
            });
            handleCloseModal();
          }}
        >
          確認
        </button>
      </div>
    );
  };

  // 渲染遊戲結束彈窗
  const renderGameOverModal = (data) => {
    const winner = players[data.winner];
    
    return (
      <div className="modal-game-over">
        <h2>遊戲結束</h2>
        <div className="winner-info">
          <h3>勝利者:</h3>
          <div className="winner" style={{ color: winner.color }}>
            {winner.name}
          </div>
        </div>
        
        <div className="final-stats">
          <h3>最終資產排名:</h3>
          <ul>
            {[...players]
              .sort((a, b) => {
                const aNetWorth = a.money + (a.properties?.reduce((sum, propId) => {
                  const prop = board[propId];
                  return sum + prop.price;
                }, 0) || 0);
                
                const bNetWorth = b.money + (b.properties?.reduce((sum, propId) => {
                  const prop = board[propId];
                  return sum + prop.price;
                }, 0) || 0);
                
                return bNetWorth - aNetWorth;
              })
              .map((player, index) => {
                const netWorth = player.money + (player.properties?.reduce((sum, propId) => {
                  const prop = board[propId];
                  return sum + prop.price;
                }, 0) || 0);
                
                return (
                  <li key={player.id}>
                    <div className="rank">#{index + 1}</div>
                    <div className="player-name" style={{ color: player.color }}>
                      {player.name}
                    </div>
                    <div className="net-worth">${netWorth}</div>
                  </li>
                );
              })}
          </ul>
        </div>
        
        <button 
          className="new-game-button"
          onClick={() => {
            dispatch({ type: 'RESET_GAME' });
            handleCloseModal();
          }}
        >
          開始新遊戲
        </button>
      </div>
    );
  };

  return (
    <div className={`modal-overlay ${modalOpen ? 'open' : ''}`}>
      <div className="modal-wrapper">
        <div className="modal-header">
          <button className="close-button" onClick={handleCloseModal}>
            &times;
          </button>
        </div>
        {renderModalContent()}
      </div>
    </div>
  );
};

export default Modal;
