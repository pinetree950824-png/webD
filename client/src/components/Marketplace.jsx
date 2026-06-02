import React, { useState, useEffect } from 'react';
import Card from './Card';

export default function Marketplace({ token, user, refreshUser, addNotification }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null); // Triggers loading on buy/cancel action

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [packFilter, setPackFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest'); // newest, price-asc, price-desc

  const fetchListings = async () => {
    try {
      const apiHost = import.meta.env.VITE_API_URL || '/api';
      const res = await fetch(`${apiHost}/market/listings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setListings(data);
      }
    } catch (err) {
      console.error('Fetch listings failed:', err);
      addNotification('거래소 데이터를 불러오지 못했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [token]);

  const handleBuy = async (listingId, cardName, price) => {
    if (user.gold < price) {
      addNotification('골드가 부족하여 구매할 수 없습니다.', 'error');
      return;
    }

    setProcessingId(listingId);

    try {
      const apiHost = import.meta.env.VITE_API_URL || '/api';
      const res = await fetch(`${apiHost}/market/buy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ listingId })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '구매 처리 실패');

      addNotification(`[${cardName}] 카드를 ${price} Gold에 구매 완료했습니다.`, 'success');
      
      // Update gold in parent state
      refreshUser(data.updatedGold);
      fetchListings(); // Reload listings

    } catch (err) {
      console.error('Buy card failed:', err);
      addNotification(err.message, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancel = async (listingId, cardName) => {
    setProcessingId(listingId);

    try {
      const apiHost = import.meta.env.VITE_API_URL || '/api';
      const res = await fetch(`${apiHost}/market/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ listingId })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '등록 취소 실패');

      addNotification(`[${cardName}] 카드 판매 등록이 취소되었습니다.`, 'success');
      fetchListings(); // Reload listings

    } catch (err) {
      console.error('Cancel listing failed:', err);
      addNotification(err.message, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  // Filter listings
  const filteredListings = listings.filter(item => {
    // Pack filter
    if (packFilter !== 'all') {
      if (packFilter === 'chaos' && item.booster_pack !== 'Chaos Origins') return false;
      if (packFilter === 'heroes' && item.booster_pack !== 'Limit Over Collection -THE HEROES-') return false;
      if (packFilter === 'rivals' && item.booster_pack !== 'Limit Over Collection -THE RIVALS-') return false;
    }

    // Name search
    if (searchQuery.trim() !== '') {
      if (!item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    }

    return true;
  });

  // Sort listings
  const sortedListings = [...filteredListings].sort((a, b) => {
    if (sortOrder === 'newest') {
      return new Date(b.listed_at) - new Date(a.listed_at);
    }
    if (sortOrder === 'price-asc') {
      return a.price - b.price;
    }
    if (sortOrder === 'price-desc') {
      return b.price - a.price;
    }
    return 0;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <p style={{ color: 'var(--text-secondary)' }}>거래소 게시판을 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="market-container">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>카드 거래소</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
            다른 유저들이 올린 카드를 구매하거나, 앨범 도감에서 중복 카드를 골라 판매해 보세요!
          </p>
        </div>

        {/* Filters & Sorting */}
        <div className="filters-bar">
          <input 
            type="text" 
            className="text-input search-bar" 
            placeholder="카드 검색..." 
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
            value={sortOrder} 
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="newest">최근 등록순</option>
            <option value="price-asc">가격 낮은순</option>
            <option value="price-desc">가격 높은순</option>
          </select>
        </div>
      </div>

      {/* Listings Grid */}
      {sortedListings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem' }}>
            <circle cx="12" cy="12" r="10"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          <p style={{ fontSize: '1.1rem' }}>현재 등록된 카드가 없습니다.</p>
          <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>도감 앨범 탭에서 중복 카드를 판매해 보세요.</p>
        </div>
      ) : (
        <div className="market-listings-grid">
          {sortedListings.map((item) => {
            const isSeller = item.seller_id === user.id;
            const isProcessing = processingId === item.id;

            return (
              <div key={item.id} className="listing-card glass-panel glass-panel-glow">
                <div style={{ alignSelf: 'center' }}>
                  <Card card={item} />
                </div>
                
                <div className="listing-seller-info">
                  <span>판매자: <strong>{item.seller_nickname}</strong></span>
                  {isSeller && <span style={{ color: 'var(--accent-cyan)' }}>나의 판매글</span>}
                </div>

                <div className="listing-price-tag">
                  🪙 {item.price.toLocaleString()} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>G</span>
                </div>

                {isSeller ? (
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => handleCancel(item.id, item.name)}
                    disabled={isProcessing}
                    style={{ border: '1px solid rgba(255, 0, 84, 0.4)', color: 'var(--accent-red)' }}
                  >
                    {isProcessing ? '취소 중...' : '판매 취소'}
                  </button>
                ) : (
                  <button 
                    className="btn btn-cyan" 
                    onClick={() => handleBuy(item.id, item.name, item.price)}
                    disabled={isProcessing || user.gold < item.price}
                  >
                    {isProcessing ? '구매 중...' : '카드 구매'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
