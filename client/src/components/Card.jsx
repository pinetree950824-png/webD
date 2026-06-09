import React, { useRef, useState, useEffect } from 'react';
import { getCachedCardImage } from '../utils/indexedDB';

export default function Card({ card, isUncollected = false, isFaceDown = false, onClick = null, size = 'normal' }) {
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
  const getRarityClass = (rarity) => {
    const r = (rarity || '').toLowerCase().trim();
    if (r.includes('prismatic secret') || r.includes('prismatic')) return 'prismatic-secret';
    if (r.includes('collector')) return 'collectors-rare';
    if (r.includes('secret')) return 'secret-rare';
    if (r.includes('common') || r === 'normal') return 'common';
    if (r === 'rare') return 'rare';
    if (r.includes('super')) return 'super';
    if (r.includes('ultra')) return 'ultra';
    if (r.includes('overframe') || r.includes('ace')) {
      return 'overframe';
    }
    return 'common';
  };

  const rarityClass = getRarityClass(card.rarity);

  // Render stars helper
  const renderStars = (level) => {
    if (!level) return null;
    return Array.from({ length: level }).map((_, i) => (
      <span key={i} className="star-icon">★</span>
    ));
  };

  return (
    <div 
      className={`card-wrapper ${size === 'large' ? 'large' : ''} ${isUncollected ? 'uncollected' : ''}`}
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
          <div className="card-front" style={{ padding: 0, overflow: 'hidden', height: '100%', borderRadius: 'inherit', position: 'relative' }}>
            {cachedSrc && (
              <img 
                src={cachedSrc} 
                alt={card.name} 
                draggable="false"
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'fill',
                  display: 'block'
                }}
              />
            )}
            
            {/* Rarity Overlay Layers */}
            {!isUncollected && (
              <>
                {/* 1. Secret Rare overlays */}
                {rarityClass === 'secret-rare' && (
                  <>
                    <div className="rare-overlay secret-name-glow" />
                    <div className="rare-overlay secret-glitter-bg" />
                  </>
                )}
                
                {/* 2. Prismatic Secret Rare overlays */}
                {rarityClass === 'prismatic-secret' && (
                  <>
                    <div className="rare-overlay prismatic-name-glow" />
                    <div className="rare-overlay prismatic-cross-shimmer" />
                  </>
                )}
                
                {/* 3. Collector's Rare overlays */}
                {rarityClass === 'collectors-rare' && (
                  <>
                    <div className="rare-overlay collectors-name-glow" />
                    <div className="rare-overlay collectors-dots-glitter" />
                    <div className="rare-overlay collectors-illustration-emboss" />
                    <div className="rare-overlay collectors-frame-jewel" />
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
