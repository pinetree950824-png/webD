import React, { useState, useEffect } from 'react';

export default function Dashboard({ user, token, setView }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user collection statistics
    const fetchStats = async () => {
      try {
        const apiHost = import.meta.env.VITE_API_URL || '/api';
        const res = await fetch(`${apiHost}/album/collection-stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <p style={{ color: 'var(--text-secondary)' }}>수집 데이터를 계산하는 중...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="main-content" style={{ width: '100%' }}>
        {/* Welcome Banner */}
        <div className="glass-panel glass-panel-glow" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            환영합니다, <span className="glow-text-cyan" style={{ color: 'var(--accent-cyan)' }}>{user.nickname}</span> 님!
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            나만의 최강 덱을 완성하고 팩을 뜯어 멋진 도감을 수집해 보세요.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="glass-panel stat-card">
            <span className="stat-label">보유 골드</span>
            <span className="stat-value" style={{ color: 'var(--accent-gold)' }}>
              🪙 {user.gold.toLocaleString()}
            </span>
          </div>
          <div className="glass-panel stat-card">
            <span className="stat-label">보유 카드 장수</span>
            <span className="stat-value" style={{ color: 'var(--accent-cyan)' }}>
              🃏 {stats ? stats.collectedCards : 0} 장
            </span>
          </div>
          <div className="glass-panel stat-card">
            <span className="stat-label">전체 수집률</span>
            <span className="stat-value" style={{ color: 'var(--primary-color)' }}>
              📈 {stats ? stats.overallProgress : 0}%
            </span>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="glass-panel collection-progress-section">
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>전체 도감 수집 현황</h3>
          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${stats ? stats.overallProgress : 0}%` }}
            ></div>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem', textAlign: 'right' }}>
            {stats ? stats.collectedCards : 0} / {stats ? stats.totalCards : 0} 카드 수집 완료
          </p>

          {/* Pack-specific Progress */}
          <div className="packs-progress-list">
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)' }}>팩별 수집 현황</h4>
            
            {stats && stats.packsProgress.map((pack, idx) => (
              <div key={idx} className="pack-progress-row">
                <div className="pack-progress-meta">
                  <span>{pack.packName === 'Chaos Origins' ? '카오스 오리진즈' : 
                         pack.packName === 'Limit Over Collection -THE HEROES-' ? '리미트 오버 컬렉션 -더 히어로즈-' : 
                         '리미트 오버 컬렉션 -더 라이벌즈-'}</span>
                  <span style={{ fontWeight: 700 }}>{pack.progress}% ({pack.collected} / {pack.total})</span>
                </div>
                <div className="progress-bar-container" style={{ height: '6px' }}>
                  <div 
                    className="progress-bar-fill" 
                    style={{ 
                      width: `${pack.progress}%`,
                      background: pack.packName.includes('HEROES') ? 'var(--primary-color)' :
                                  pack.packName.includes('RIVALS') ? 'var(--accent-gold)' : 'var(--accent-cyan)'
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
