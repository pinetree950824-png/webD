import React, { useState, useEffect } from 'react';
import Card from './Card';

export default function Album({ token, user, refreshUser, addNotification }) {
  const [cards, setCards] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters state
  const [packFilter, setPackFilter] = useState('all');
  const [ownedFilter, setOwnedFilter] = useState('all'); // all, owned, unowned
  const [typeFilter, setTypeFilter] = useState('all'); // all, Monster, Spell, Trap
  const [searchQuery, setSearchQuery] = useState('');

  // Selected card detail modal
  const [selectedCard, setSelectedCard] = useState(null);

  // Selling states
  const [sellPrice, setSellPrice] = useState('');
  const [isSellingMode, setIsSellingMode] = useState(false);
  const [sellingError, setSellingError] = useState('');

  const fetchAlbumData = async () => {
    try {
      const apiHost = import.meta.env.VITE_API_URL || '/api';
      
      // Fetch all cards with owned counts for the user
      const resCards = await fetch(`${apiHost}/album/cards`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataCards = await resCards.json();

      // Fetch user inventory to get user_card_ids
      const resInventory = await fetch(`${apiHost}/album/inventory`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataInventory = await resInventory.json();

      // Fetch marketplace listings to find active listings
      const resListings = await fetch(`${apiHost}/market/listings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataListings = await resListings.json();

      if (resCards.ok && resInventory.ok && resListings.ok) {
        setCards(dataCards);
        setInventory(dataInventory);
        setListings(dataListings);
      }
    } catch (err) {
      console.error('Failed to load album data:', err);
      addNotification('도감 데이터를 불러오지 못했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbumData();
  }, [token]);

  const sellingUserCardIds = React.useMemo(() => {
    return new Set(
      listings
        .filter(item => item.seller_id === user.id)
        .map(item => item.user_card_id)
    );
  }, [listings, user.id]);

  const getCardStatus = (cardId) => {
    const cardOwnedItems = inventory.filter(item => item.card_id === cardId);
    const totalOwned = cardOwnedItems.length;
    const activeSelling = cardOwnedItems.filter(item => sellingUserCardIds.has(item.user_card_id)).length;
    const available = totalOwned - activeSelling;
    const availableIds = cardOwnedItems.filter(item => !sellingUserCardIds.has(item.user_card_id)).map(item => item.user_card_id);
    return { totalOwned, activeSelling, available, availableIds };
  };

  const handleRegisterSale = async (userCardId, cardName) => {
    const priceNum = parseInt(sellPrice);
    if (!sellPrice || isNaN(priceNum) || priceNum <= 0) {
      setSellingError('올바른 가격(1 Gold 이상)을 입력해주세요.');
      return;
    }

    try {
      const apiHost = import.meta.env.VITE_API_URL || '/api';
      const res = await fetch(`${apiHost}/market/sell`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userCardId, price: priceNum })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '판매 등록 실패');

      addNotification(`[${cardName}] 카드를 ${priceNum} Gold에 판매 등록했습니다.`, 'success');
      
      // Reset state
      setIsSellingMode(false);
      setSellPrice('');
      setSelectedCard(null); // Close modal
      
      // Reload all data to sync counts
      fetchAlbumData();
      
    } catch (err) {
      console.error('Register sale failed:', err);
      setSellingError(err.message);
    }
  };

  // Filter logic
  const filteredCards = cards.filter(card => {
    // Pack filter
    if (packFilter !== 'all') {
      if (packFilter === 'chaos' && card.booster_pack !== 'Chaos Origins') return false;
      if (packFilter === 'heroes' && card.booster_pack !== 'Limit Over Collection -THE HEROES-') return false;
      if (packFilter === 'rivals' && card.booster_pack !== 'Limit Over Collection -THE RIVALS-') return false;
    }

    // Owned filter
    if (ownedFilter === 'owned' && card.owned_count === 0) return false;
    if (ownedFilter === 'unowned' && card.owned_count > 0) return false;

    // Type filter
    if (typeFilter !== 'all' && card.card_type !== typeFilter) return false;

    // Search query
    if (searchQuery.trim() !== '') {
      if (!card.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    }

    return true;
  });

  const handleCardClick = (card) => {
    if (card.owned_count === 0) return; // Can't view details of uncollected cards
    setSelectedCard(card);
  };

  // Stats
  const collectedCount = cards.filter(c => c.owned_count > 0).length;
  const totalCount = cards.length;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <p style={{ color: 'var(--text-secondary)' }}>도감을 정리하는 중...</p>
      </div>
    );
  }

  return (
    <div className="album-container">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>듀얼 앨범 도감</h2>
          <p className="collection-count-banner" style={{ color: 'var(--accent-cyan)', marginTop: '0.2rem' }}>
            수집률: {collectedCount} / {totalCount} 장 ({totalCount > 0 ? Math.round((collectedCount / totalCount) * 100) : 0}%)
          </p>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <input 
            type="text" 
            className="text-input search-bar" 
            placeholder="카드 이름 검색..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <select 
            className="filter-select" 
            value={packFilter} 
            onChange={(e) => setPackFilter(e.target.value)}
          >
            <option value="all">모든 팩</option>
            <option value="chaos">카오스 오리진즈</option>
            <option value="heroes">리미트 오버 -더 히어로즈-</option>
            <option value="rivals">리미트 오버 -더 라이벌즈-</option>
          </select>

          <select 
            className="filter-select" 
            value={ownedFilter} 
            onChange={(e) => setOwnedFilter(e.target.value)}
          >
            <option value="all">전체 보기</option>
            <option value="owned">보유 중</option>
            <option value="unowned">미보유</option>
          </select>

          <select 
            className="filter-select" 
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">모든 타입</option>
            <option value="Monster">몬스터 카드</option>
            <option value="Spell">마법 카드</option>
            <option value="Trap">함정 카드</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="album-grid">
        {filteredCards.map((card) => {
          const isCollected = card.owned_count > 0;
          const { totalOwned, activeSelling, available } = getCardStatus(card.id);
          // If the user owns the card, but all copies are currently listed on the marketplace,
          // render it as grayed out / uncollected with an "On Sale" mark to avoid confusion.
          const isEffectivelyUncollected = !isCollected || available === 0;

          return (
            <div key={card.id} style={{ position: 'relative' }}>
              <Card 
                card={card} 
                isUncollected={isEffectivelyUncollected} 
                onClick={handleCardClick}
              />
              {isCollected && (
                <div style={{ position: 'absolute', top: '-10px', right: '-10px', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                  <span 
                    className="badge btn-cyan" 
                    style={{ 
                      boxShadow: '0 0 10px rgba(0,0,0,0.5)'
                    }}
                  >
                    x{card.owned_count}
                  </span>
                  {activeSelling > 0 && (
                    <span 
                      className="badge" 
                      style={{ 
                        background: 'var(--accent-red)',
                        color: 'white',
                        boxShadow: '0 0 10px rgba(0,0,0,0.5)',
                        fontSize: '0.7rem',
                        padding: '0.15rem 0.3rem',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      판매 중 {activeSelling}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Card Details Modal */}
      {selectedCard && (() => {
        const { totalOwned, activeSelling, available, availableIds } = getCardStatus(selectedCard.id);
        return (
          <div className="modal-overlay" onClick={() => { setSelectedCard(null); setIsSellingMode(false); }}>
            <div className="modal-content glass-panel glass-panel-glow" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
              <div className="modal-header">
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>카드 상세 보기</h3>
                <button className="modal-close-btn" onClick={() => { setSelectedCard(null); setIsSellingMode(false); }}>×</button>
              </div>
              
              <div className="card-detail-modal-layout">
                <Card card={selectedCard} />
                
                <div className="card-metadata-info">
                  <h4 className="card-title-name glow-text-cyan">{selectedCard.name}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <strong>수집 팩:</strong> {selectedCard.booster_pack === 'Chaos Origins' ? '카오스 오리진즈' : 
                                           selectedCard.booster_pack.includes('HEROES') ? '리미트 오버 컬렉션 -더 히어로즈-' : 
                                           '리미트 오버 컬렉션 -더 라이벌즈-'}
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <strong>등급:</strong> <span style={{ color: `var(--rarity-${selectedCard.rarity.toLowerCase().replace(/\s+/g, '-')})` }}>{selectedCard.rarity}</span>
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.3)', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', minHeight: '80px', whiteSpace: 'pre-line' }}>
                    {selectedCard.description}
                  </p>

                  <div style={{ marginTop: '1rem', borderTop: '1px dashed var(--border-color)', paddingTop: '1rem' }}>
                    <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
                      보유 수량: {totalOwned} 장 {activeSelling > 0 && `(거래소 판매 중: ${activeSelling} 장)`}
                    </p>
                    {available > 0 ? (
                      <div style={{ marginTop: '0.8rem' }}>
                        {!isSellingMode ? (
                          <button 
                            className="btn btn-cyan" 
                            style={{ width: '100%' }}
                            onClick={() => {
                              setIsSellingMode(true);
                              setSellPrice('');
                              setSellingError('');
                            }}
                          >
                            거래소에 판매 등록
                          </button>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>판매 가격 설정 (Gold)</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <input 
                                type="number" 
                                className="text-input" 
                                placeholder="예: 500" 
                                value={sellPrice}
                                onChange={(e) => setSellPrice(e.target.value)}
                                style={{ flexGrow: 1, padding: '0.4rem' }}
                              />
                              <button 
                                className="btn btn-cyan" 
                                onClick={() => handleRegisterSale(availableIds[0], selectedCard.name)}
                                style={{ padding: '0.4rem 1rem' }}
                              >
                                등록
                              </button>
                              <button 
                                className="btn btn-secondary" 
                                onClick={() => setIsSellingMode(false)}
                                style={{ padding: '0.4rem 0.8rem' }}
                              >
                                취소
                              </button>
                            </div>
                            {sellingError && <p style={{ color: 'var(--accent-red)', fontSize: '0.75rem', marginTop: '0.2rem' }}>{sellingError}</p>}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontStyle: 'italic' }}>
                        {activeSelling > 0 ? '보유한 카드가 모두 판매 등록되어 추가 판매할 수 없습니다.' : '보유 수량이 없어 판매할 수 없습니다.'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
