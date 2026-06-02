import React, { useRef, useState, useEffect } from 'react';
import { getCachedCardImage } from '../utils/indexedDB';

export default function Card({ card, isUncollected = false, isFaceDown = false, onClick = null }) {
  const cardRef = useRef(null);
  const [cachedSrc, setCachedSrc] = useState('');
  const [tiltStyle, setTiltStyle] = useState({});

  // Asynchronously resolve image from IndexedDB cache
  useEffect(() => {
    let active = true;
    if (card && card.image_url) {
      getCachedCardImage(card.image_url).then(url => {
        if (active) setCachedSrc(url);
      });
    }
    return () => { active = false; };
  }, [card?.image_url]);

  // Handle 3D Mouse Tilt and Glare
  const handleMouseMove = (e) => {
    if (isFaceDown || isUncollected || !cardRef.current) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    
    // Mouse coordinates relative to card element
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Percentage relative to card width/height
    const px = (x / rect.width) * 100;
    const py = (y / rect.height) * 100;
    
    // Tilt calculations (-15 to 15 degrees)
    const rotateX = ((y / rect.height) - 0.5) * -30;
    const rotateY = ((x / rect.width) - 0.5) * 30;

    setTiltStyle({
      transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`,
      transition: 'transform 0.05s ease-out',
      '--glare-x': `${px}%`,
      '--glare-y': `${py}%`
    });
  };

  const handleMouseLeave = () => {
    // Reset tilt on mouse exit
    setTiltStyle({
      transform: 'rotateX(0deg) rotateY(0deg) scale(1)',
      transition: 'transform 0.3s ease-out',
      '--glare-x': '50%',
      '--glare-y': '50%'
    });
  };

  if (!card) return null;

  // Determine rarity css class
  const rarityClass = card.rarity.toLowerCase().replace(/\s+/g, '-');

  // Render stars helper
  const renderStars = (level) => {
    if (!level) return null;
    return Array.from({ length: level }).map((_, i) => (
      <span key={i} className="star-icon">★</span>
    ));
  };

  return (
    <div 
      className={`card-wrapper ${isUncollected ? 'uncollected' : ''}`}
      onClick={() => onClick && onClick(card)}
    >
      <div 
        ref={cardRef}
        className={`card-3d rarity-${rarityClass}`}
        style={tiltStyle}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {isFaceDown ? (
          /* Card Back */
          <div className="card-back">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 22H22L12 2Z" stroke="#ffbe0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="14" r="4" stroke="#ffbe0b" strokeWidth="2"/>
            </svg>
          </div>
        ) : (
          /* Card Front */
          <div className="card-front card-inner">
            <div className="card-top-bar">
              <span className="card-name" title={card.name}>{card.name}</span>
              {card.card_type === 'Monster' ? (
                <span className="card-attribute">{card.attribute}</span>
              ) : (
                <span className="card-attribute" style={{ backgroundColor: card.card_type === 'Spell' ? '#007200' : '#800080' }}>
                  {card.card_type === 'Spell' ? '魔' : '陷'}
                </span>
              )}
            </div>

            {card.card_type === 'Monster' && (
              <div className="card-stars">
                {renderStars(card.level)}
              </div>
            )}

            <div className="card-image-box" style={{ marginTop: card.card_type !== 'Monster' ? '12px' : '0' }}>
              {cachedSrc && (
                <img 
                  src={cachedSrc} 
                  alt={card.name} 
                  className="card-image"
                  draggable="false"
                />
              )}
            </div>

            <div className="card-info-box">
              <p className="card-description" title={card.description}>{card.description}</p>
              
              <div className="card-stats">
                {card.card_type === 'Monster' ? (
                  <>
                    <span>공 {card.attack !== null ? card.attack : '?'}</span>
                    <span>수 {card.defense !== null ? card.defense : '?'}</span>
                  </>
                ) : (
                  <span style={{ color: card.card_type === 'Spell' ? '#00f5d4' : '#ff007f' }}>
                    [{card.card_type} Card]
                  </span>
                )}
                <span 
                  className="rarity-tag"
                  style={{ 
                    color: `var(--rarity-${rarityClass})`,
                    border: `1px solid var(--rarity-${rarityClass})` 
                  }}
                >
                  {card.rarity.replace(' Rare', '')}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
