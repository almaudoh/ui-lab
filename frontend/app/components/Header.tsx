'use client';

import styles from './styles';
import { useState, useRef, useEffect } from 'react';

interface HeaderProps {
  onOpenSynth: () => void;
  onOpenRecog: () => void;
}

export function Header({ onOpenSynth, onOpenRecog }: HeaderProps) {
  const [showSettings, setShowSettings] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    }

    if (showSettings) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettings]);

  return (
    <div style={styles.header}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={styles.headerTitle}>Demo Chat Interface</h1>
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowSettings(!showSettings)} 
            style={{
              ...styles.configButton,
              fontSize: '20px',
              padding: '8px 16px',
            }}
          >
            ⚙️
          </button>
          {showSettings && (
            <div ref={menuRef} style={{
              position: 'absolute',
              right: 0,
              top: '100%',
              marginTop: '8px',
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              minWidth: '200px',
              zIndex: 1000,
              overflow: 'hidden',
            }}>
              <button
                onClick={() => {
                  onOpenSynth();
                  setShowSettings(false);
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '12px 16px',
                  color: '#333',
                  textDecoration: 'none',
                  border: 'none',
                  background: 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  borderBottom: '1px solid #eee',
                  fontSize: '14px',
                  transition: 'background-color 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                🗣️ Speech Synthesis
              </button>
              <button
                onClick={() => {
                  onOpenRecog();
                  setShowSettings(false);
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '12px 16px',
                  color: '#333',
                  textDecoration: 'none',
                  border: 'none',
                  background: 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'background-color 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                🎤 Speech Recognition
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
