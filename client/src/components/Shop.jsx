import React, { useState, useEffect } from 'react';

export default function Shop({ user, token, onDrawSuccess, addNotification }) {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawingPack, setDrawingPack] = useState(null); // Tracks which pack is drawing to disable buttons

  useEffect(() => {
    const fetchPacks = async () => {
      try {
        const apiHost = import.meta.env.VITE_API_URL || '/api';
        const res = await fetch(`${apiHost}/gacha/packs`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setPacks(data);
        }
      } catch (err) {
        console.error('Failed to load packs:', err);
        addNotification('부스터 팩 목록을 불러오지 못했습니다.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchPacks();
  }, [token]);

  const handleDraw = async (packName, krName, amount) => {
    if (drawingPack) return;

    const cost = amount === 1 ? 100 : 1000;
    if (user.gold < cost) {
      addNotification('골드가 부족합니다! 카드 거래소에서 판매하거나 새 닉네임으로 도전해 보세요.', 'error');
      return;
    }

    setDrawingPack({ name: packName, amount });

    try {
      const apiHost = import.meta.env.VITE_API_URL || '/api';
      const res = await fetch(`${apiHost}/gacha/draw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ packName, amount })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '뽑기 처리 중 오류 발생');
      }

      // Success: pass to parent to trigger full screen ripping animation
      onDrawSuccess(krName, data.drawnCards, data.updatedGold);
      addNotification(`${krName} ${amount}팩 개봉!`, 'success');

    } catch (err) {
      console.error('Draw failed:', err);
      addNotification(err.message, 'error');
    } finally {
      setDrawingPack(null);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <p style={{ color: 'var(--text-secondary)' }}>부스터 팩을 입고하는 중...</p>
      </div>
    );
  }

  return (
    <div className="shop-container">
      <div className="shop-title-section">
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>부스터 팩 상점</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          골드를 소모해 강력한 고화질 13기 OCG 카드를 뽑으세요! (1팩 = 100 Gold)
        </p>
      </div>

      <div className="packs-slider">
        {packs.map((pack) => {
          const isProcessing = drawingPack && drawingPack.name === pack.name;

          return (
            <div key={pack.id} className="pack-box glass-panel glass-panel-glow">
              <div className="pack-image-container">
                <img src={pack.cover_image} alt={pack.kr_name} className="pack-img" />
              </div>
              <h3 className="pack-name">{pack.kr_name}</h3>
              <p className="pack-desc">{pack.description}</p>
              
              <div className="pack-draw-actions">
                <button 
                  className="btn btn-secondary" 
                  disabled={!!drawingPack}
                  onClick={() => handleDraw(pack.name, pack.kr_name, 1)}
                >
                  {isProcessing && drawingPack.amount === 1 ? '개봉 중...' : '1팩 (100G)'}
                </button>
                <button 
                  className="btn btn-primary" 
                  disabled={!!drawingPack}
                  onClick={() => handleDraw(pack.name, pack.kr_name, 10)}
                >
                  {isProcessing && drawingPack.amount === 10 ? '개봉 중...' : '10팩 (1000G)'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
