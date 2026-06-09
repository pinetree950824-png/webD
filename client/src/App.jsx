import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Shop from './components/Shop';
import Album from './components/Album';
import GachaReveal from './components/GachaReveal';
import Marketplace from './components/Marketplace';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('duelverse_token') || '');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('duelverse_user') || 'null'));
  const [view, setView] = useState('dashboard'); // dashboard, shop, album, market
  
  // Gacha draw overlay state
  const [revealData, setRevealData] = useState(null); // { packName, cards }
  
  // Custom toast notification system state
  const [notifications, setNotifications] = useState([]);

  // Load current user profile from server to keep gold synced
  useEffect(() => {
    if (!token) return;

    const fetchMe = async () => {
      try {
        const apiHost = import.meta.env.VITE_API_URL || '/api';
        const res = await fetch(`${apiHost}/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (res.ok) {
          setUser(data);
          localStorage.setItem('duelverse_user', JSON.stringify(data));
        } else {
          // Token expired or invalid
          handleLogout();
        }
      } catch (err) {
        console.error('Failed to sync profile:', err);
      }
    };

    fetchMe();
  }, [token, view]); // Sync gold whenever user changes tabs

  const handleLoginSuccess = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('duelverse_token', newToken);
    localStorage.setItem('duelverse_user', JSON.stringify(newUser));
    setView('dashboard');
    addNotification('로그인에 성공했습니다. 듀얼 월드에 오신 것을 환영합니다!', 'success');
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('duelverse_token');
    localStorage.removeItem('duelverse_user');
    setView('dashboard');
    addNotification('로그아웃 되었습니다.', 'success');
  };

  // Callback to sync gold from buy/sell/draw actions
  const refreshUserGold = (newGold) => {
    setUser(prev => {
      const updated = { ...prev, gold: newGold };
      localStorage.setItem('duelverse_user', JSON.stringify(updated));
      return updated;
    });
  };

  // Add toast notification
  const addNotification = (message, type = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  const handleDrawSuccess = (packName, cards, updatedGold) => {
    setRevealData({ packName, cards });
    refreshUserGold(updatedGold);
  };

  const handleCloseReveal = () => {
    setRevealData(null);
    setView('album'); // Send user to their album to view cards immediately!
  };

  // Render correct sub-page
  const renderView = () => {
    if (!token || !user) return <Login onLoginSuccess={handleLoginSuccess} />;

    switch (view) {
      case 'dashboard':
        return <Dashboard user={user} token={token} setView={setView} />;
      case 'shop':
        return (
          <Shop 
            user={user} 
            token={token} 
            onDrawSuccess={handleDrawSuccess} 
            addNotification={addNotification} 
          />
        );
      case 'album':
        return (
          <Album 
            token={token} 
            user={user} 
            refreshUser={refreshUserGold}
            addNotification={addNotification} 
          />
        );
      case 'market':
        return (
          <Marketplace 
            token={token} 
            user={user} 
            refreshUser={refreshUserGold}
            addNotification={addNotification} 
          />
        );
      default:
        return <Dashboard user={user} token={token} setView={setView} />;
    }
  };

  return (
    <div className="app-container">
      {/* Navigation Header (Only if logged in) */}
      {token && user && (
        <header className="header glass-panel">
          <div className="logo" onClick={() => setView('dashboard')}>DuelVerse</div>
          
          <nav className="nav-links">
            <span className={`nav-item ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>대시보드</span>
            <span className={`nav-item ${view === 'shop' ? 'active' : ''}`} onClick={() => setView('shop')}>부스터 상점</span>
            <span className={`nav-item ${view === 'album' ? 'active' : ''}`} onClick={() => setView('album')}>도감 앨범</span>
            <span className={`nav-item ${view === 'market' ? 'active' : ''}`} onClick={() => setView('market')}>카드 거래소</span>
          </nav>

          <div className="user-info-bar">
            <div className="gold-display">
              <span className="gold-icon">🪙</span>
              <span>{user.gold.toLocaleString()} G</span>
            </div>
            
            <div className="user-profile">
              <div className="avatar">
                {user.nickname.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user.nickname}</span>
            </div>

            <button className="btn btn-secondary" onClick={handleLogout} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
              로그아웃
            </button>
          </div>
        </header>
      )}

      {/* Main Page Content */}
      <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {renderView()}
      </main>

      {/* Gacha Open Animation Fullscreen Overlay */}
      {revealData && (
        <GachaReveal 
          packName={revealData.packName} 
          drawnCards={revealData.cards} 
          onClose={handleCloseReveal} 
        />
      )}

      {/* Floating Notification Alerts */}
      <div className="notification-container">
        {notifications.map(n => (
          <div key={n.id} className={`toast toast-${n.type}`}>
            <span>{n.type === 'success' ? '✓' : '✗'}</span>
            <span>{n.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
