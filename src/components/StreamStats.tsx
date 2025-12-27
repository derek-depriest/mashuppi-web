import React from 'react';

interface StreamStatsProps {
  uptime: number | null; // Uptime in seconds
  listeners: number;
  peakListeners: number;
}

const StreamStats: React.FC<StreamStatsProps> = ({ uptime, listeners, peakListeners }) => {
  // Format uptime as HH:MM:SS or DD:HH:MM:SS
  const formatUptime = (seconds: number | null): string => {
    if (seconds === null || seconds === 0) return 'Offline';

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (days > 0) {
      return `${days}d ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{
      background: 'rgba(0, 0, 0, 0.3)',
      padding: '12px',
      borderRadius: '6px',
      marginBottom: '12px',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '12px',
        fontSize: '11px'
      }}>
        {/* Stream Uptime */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            color: '#999',
            marginBottom: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Uptime
          </div>
          <div style={{
            color: '#fff',
            fontWeight: 'bold',
            fontFamily: '"Courier New", monospace',
            fontSize: '13px'
          }}>
            {formatUptime(uptime)}
          </div>
        </div>

        {/* Current Listeners */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            color: '#999',
            marginBottom: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Listeners
          </div>
          <div style={{
            color: '#4ecdc4',
            fontWeight: 'bold',
            fontFamily: '"Courier New", monospace',
            fontSize: '13px'
          }}>
            {listeners}
          </div>
        </div>

        {/* Peak Listeners */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            color: '#999',
            marginBottom: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Peak
          </div>
          <div style={{
            color: '#ff6b6b',
            fontWeight: 'bold',
            fontFamily: '"Courier New", monospace',
            fontSize: '13px'
          }}>
            {peakListeners}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamStats;
