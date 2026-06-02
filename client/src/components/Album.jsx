import React, { useState, useEffect } from 'react';
import Card from './Card';

export default function Album({ token, user, addNotification }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters state
  const [packFilter, setPackFilter] = useState('all');
  const [ownedFilter, setOwnedFilter] = useState('all'); // all, owned, unowned
  const [typeFilter, setTypeFilter] = useState('all'); // all, Monster, Spell, Trap
  const [searchQuery, setSearchQuery] = useState('');

  // Selected card detail modal
  const [selectedCard, setSelectedCard] = useState(null);

  const fetchAlbumData = async () => {
    try {
      const apiHost = import.meta.env.VITE_API_URL || '/api';
      
      // Fetch all cards with owned counts for the user
      const resCards = await fetch(`${apiHost}/album/cards`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataCards = await resCards.json();

      if (resCards.ok) {
        setCards(dataCards);
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
          return (
            <div key={card.id} style={{ position: 'relative' }}>
              <Card 
                card={card} 
                isUncollected={!isCollected} 
                onClick={handleCardClick}
              />
              {isCollected && (
                <span 
                  className="badge btn-cyan" 
                  style={{ 
                    position: 'absolute', 
                    top: '-10px', 
                    right: '-10px', 
                    zIndex: 10,
                    boxShadow: '0 0 10px rgba(0,0,0,0.5)'
                  }}
                >
                  x{card.owned_count}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Card Details Modal */}
      {selectedCard && (
        <div className="modal-overlay" onClick={() => setSelectedCard(null)}>
          <div className="modal-content glass-panel glass-panel-glow" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>카드 상세 보기</h3>
              <button className="modal-close-btn" onClick={() => setSelectedCard(null)}>×</button>
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
                    보유 수량: {selectedCard.owned_count} 장
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
