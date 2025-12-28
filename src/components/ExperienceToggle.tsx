import { useExperience } from '../contexts/ExperienceContext';

export default function ExperienceToggle() {
  const { switchMode, isLive, isAlbum } = useExperience();

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 1000,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
      borderRadius: '30px',
      padding: '4px',
      display: 'flex',
      gap: '4px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
    }}>
      <button
        onClick={() => switchMode('live')}
        style={{
          padding: '10px 24px',
          background: isLive ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)' : 'transparent',
          color: '#fff',
          border: 'none',
          borderRadius: '24px',
          cursor: 'pointer',
          fontWeight: isLive ? 'bold' : 'normal',
          fontSize: '14px',
          transition: 'all 0.2s',
          boxShadow: isLive ? '0 2px 8px rgba(255, 107, 107, 0.4)' : 'none'
        }}
      >
        Live Radio
      </button>
      <button
        onClick={() => switchMode('album')}
        style={{
          padding: '10px 24px',
          background: isAlbum ? 'linear-gradient(135deg, #4ecdc4 0%, #44a7a0 100%)' : 'transparent',
          color: '#fff',
          border: 'none',
          borderRadius: '24px',
          cursor: 'pointer',
          fontWeight: isAlbum ? 'bold' : 'normal',
          fontSize: '14px',
          transition: 'all 0.2s',
          boxShadow: isAlbum ? '0 2px 8px rgba(78, 205, 196, 0.4)' : 'none'
        }}
      >
        Albums
      </button>
    </div>
  );
}
