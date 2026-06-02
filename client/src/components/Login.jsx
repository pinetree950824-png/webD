import React, { useState, useEffect } from 'react';

export default function Login({ onLoginSuccess }) {
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize Google Sign-in button
  useEffect(() => {
    /* global google */
    if (window.google) {
      try {
        window.google.accounts.id.initialize({
          client_id: '325492193582-example.apps.googleusercontent.com', // Match backend client id placeholder
          callback: handleGoogleCallback,
        });

        const btnElement = document.getElementById('google-signin-button');
        if (btnElement) {
          window.google.accounts.id.renderButton(btnElement, {
            theme: 'filled_blue',
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular',
          });
        }
      } catch (err) {
        console.error('Google API init failed:', err);
      }
    }
  }, []);

  const handleGoogleCallback = async (response) => {
    setLoading(true);
    setError('');
    try {
      const apiHost = import.meta.env.VITE_API_URL || '/api';
      const res = await fetch(`${apiHost}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '구글 로그인 실패');

      onLoginSuccess(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSubmit = async (e) => {
    e.preventDefault();
    if (!nickname.trim()) return;

    setLoading(true);
    setError('');

    try {
      const apiHost = import.meta.env.VITE_API_URL || '/api';
      const res = await fetch(`${apiHost}/auth/guest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '게스트 로그인 실패');

      onLoginSuccess(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Mock Google Login trigger for testing convenience (e.g. offline or no client credentials set up)
  const handleMockGoogleLogin = () => {
    handleGoogleCallback({
      credential: `mock_${Math.floor(1000 + Math.random() * 9000)}`
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel glass-panel-glow">
        <h1 className="auth-logo">DuelVerse</h1>
        <p className="auth-subtitle">13기 오버프레임 TCG 컬렉팅 & 거래소</p>

        {error && (
          <div style={{ color: 'var(--accent-red)', fontSize: '0.85rem', marginBottom: '1rem', background: 'rgba(255,0,84,0.1)', padding: '0.5rem', borderRadius: '4px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleGuestSubmit} className="guest-form">
          <div className="form-group">
            <label htmlFor="nickname">게스트 닉네임</label>
            <input
              id="nickname"
              type="text"
              className="text-input"
              placeholder="듀얼리스트 이름을 입력하세요"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              disabled={loading}
              maxLength={15}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '로그인 중...' : '게스트 입장'}
          </button>
        </form>

        <div className="auth-divider">또는</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', alignItems: 'center' }}>
          <div id="google-signin-button" className="google-btn-wrapper"></div>
          
          <button 
            type="button" 
            className="btn btn-secondary" 
            style={{ width: '100%', fontSize: '0.85rem', padding: '0.5rem' }} 
            onClick={handleMockGoogleLogin}
            disabled={loading}
          >
            📋 구글 테스트 계정으로 접속 (로컬 검증용)
          </button>
        </div>
      </div>
    </div>
  );
}
