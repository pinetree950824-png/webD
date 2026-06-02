import React, { useState, useEffect } from 'react';
import Card from './Card';

export default function GachaReveal({ packName, drawnCards, onClose }) {
  const [isRipped, setIsRipped] = useState(false);
  const [showCards, setShowCards] = useState(false);
  const [revealedIndices, setRevealedIndices] = useState([]);

  // Auto-start pack ripping animation, then reveal face-down cards
  useEffect(() => {
    const ripTimer = setTimeout(() => {
      setIsRipped(true);
    }, 500);

    const showCardsTimer = setTimeout(() => {
      setShowCards(true);
    }, 1600);

    return () => {
      clearTimeout(ripTimer);
      clearTimeout(showCardsTimer);
    };
  }, []);

  const handleCardClick = (index) => {
    if (revealedIndices.includes(index)) return;
    setRevealedIndices(prev => [...prev, index]);
  };

  const handleRevealAll = () => {
    setRevealedIndices(Array.from({ length: drawnCards.length }, (_, i) => i));
  };

  const isAllRevealed = revealedIndices.length === drawnCards.length;

  return (
    <div className="gacha-reveal-container">
      {!showCards ? (
        /* Pack Ripping Scene */
        <div className="pack-ripping-scene">
          <h2 className="glow-text-purple" style={{ fontSize: '1.8rem', fontWeight: 800 }}>
            {packName} 개봉 중...
          </h2>
          <div className={`ripping-pack-wrapper ${isRipped ? 'ripped' : ''}`}>
            <div className="pack-top-rip"></div>
            <div className="pack-bottom-rip"></div>
            <div className="rip-glow-flare"></div>
          </div>
        </div>
      ) : (
        /* Cards Reveal Grid */
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <h2 className="glow-text-cyan" style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2rem' }}>
            획득한 카드
          </h2>

          <div className="reveal-grid">
            {drawnCards.map((card, index) => {
              const isRevealed = revealedIndices.includes(index);
              return (
                <div 
                  key={index} 
                  className="card-draw-item" 
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => handleCardClick(index)}
                >
                  <Card 
                    card={card} 
                    isFaceDown={!isRevealed} 
                  />
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            {!isAllRevealed && (
              <button className="btn btn-secondary" onClick={handleRevealAll}>
                모두 공개
              </button>
            )}
            {isAllRevealed && (
              <button className="btn btn-primary" onClick={onClose}>
                상점으로 돌아가기
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
