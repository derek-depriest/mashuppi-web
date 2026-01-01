import React, { useState, useRef, useEffect } from 'react';
import { api, STREAM_URL } from '../services/api';
import type { Track, NowPlaying } from '../services/api';
import StreamStats from './StreamStats';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const MashuppiPlayer: React.FC = () => {
  const [isAudioPlaying, setIsAudioPlaying] = useState(false); // Actual audio element state
  const [volume, setVolume] = useState(75);

  // Real-time data from API
  const [nowPlaying, setNowPlaying] = useState<Track | null>(null);
  const [isStreamPlaying, setIsStreamPlaying] = useState(false); // Stream status from API
  const [elapsed, setElapsed] = useState<number | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [percentage, setPercentage] = useState<number | null>(null);
  const [position, setPosition] = useState<number | null>(null);
  const [queueLength, setQueueLength] = useState<number | null>(null);
  const [nextTrack, setNextTrack] = useState<Track | null>(null);
  const [listeners, setListeners] = useState<number>(0);
  const [peakListeners, setPeakListeners] = useState<number>(0);
  const [uptime, setUptime] = useState<number | null>(null);
  const [bitrate, setBitrate] = useState<number | null>(null);
  const [albumArtUrl, setAlbumArtUrl] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Update document title with currently playing track
  useDocumentTitle({
    artist: nowPlaying?.artist,
    title: nowPlaying?.title,
    isPlaying: isAudioPlaying && isStreamPlaying,
  });

  // Format time helper
  const formatTime = (seconds: number | null): string => {
    if (seconds === null) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Fetch now playing data
  const fetchNowPlaying = async () => {
    try {
      const data: NowPlaying = await api.getNowPlaying();
      setNowPlaying(data.track);
      setIsStreamPlaying(data.isPlaying);
      setElapsed(data.elapsed ?? null);
      setTotal(data.total ?? null);
      setPercentage(data.percentage ?? null);
      setPosition(data.position ?? null);
      setQueueLength(data.queueLength ?? null);
      setNextTrack(data.nextTrack ?? null);
      setListeners(data.listeners ?? 0);
      setPeakListeners(data.peakListeners ?? 0);
      setUptime(data.uptime ?? null);
      setBitrate(data.bitrate ?? null);
    } catch (error) {
      console.error('[MashuppiPlayer] Error fetching now playing:', error);
    }
  };

  // Fetch album artwork
  useEffect(() => {
    if (!nowPlaying) {
      setAlbumArtUrl(null);
      return;
    }

    // If track has artworkUrl from database, use it directly
    if (nowPlaying.artworkUrl) {
      const img = new Image();
      img.onload = () => {
        setAlbumArtUrl(nowPlaying.artworkUrl!);
      };
      img.onerror = () => {
        console.log('Failed to load artwork from database, falling back to API');
        setAlbumArtUrl(null);
      };
      img.src = nowPlaying.artworkUrl;
      return () => {
        img.onload = null;
        img.onerror = null;
      };
    }

    // Fallback to /api/album-art endpoint
    const timestamp = Date.now();
    const artUrl = `/api/album-art?t=${timestamp}`;

    // Preload image
    const img = new Image();
    img.onload = () => {
      setAlbumArtUrl(artUrl);
    };
    img.onerror = () => {
      setAlbumArtUrl(null);
    };
    img.src = artUrl;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [nowPlaying?.raw, nowPlaying?.artworkUrl]);

  // Setup WebSocket for real-time updates
  useEffect(() => {
    let reconnectTimeout: number | null = null;
    let heartbeatInterval: number | null = null;

    const connectWebSocket = () => {
      const ws = new WebSocket('wss://mashuppi.com/ws');

      ws.onopen = () => {
        console.log('WebSocket connected');

        // Clear any pending reconnection attempts
        if (reconnectTimeout) {
          clearTimeout(reconnectTimeout);
          reconnectTimeout = null;
        }

        // Start heartbeat - browser WebSocket automatically responds to pings
        // We just need to monitor the connection health
        heartbeatInterval = window.setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            // Connection is healthy, no action needed
            // The server will send pings and browser automatically responds with pongs
          } else if (ws.readyState === WebSocket.CLOSING || ws.readyState === WebSocket.CLOSED) {
            // Connection lost, clear interval
            if (heartbeatInterval) {
              clearInterval(heartbeatInterval);
              heartbeatInterval = null;
            }
          }
        }, 10000);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'track_change') {
            setNowPlaying(data.track);
            setPosition(data.position ?? null);
            setQueueLength(data.queueLength ?? null);
            setNextTrack(data.nextTrack ?? null);
            setListeners(data.listeners ?? 0);
            setPeakListeners(data.peakListeners ?? 0);
            setUptime(data.uptime ?? null);
            setBitrate(data.bitrate ?? null);
            setElapsed(data.elapsed ?? null);
            setTotal(data.total ?? null);
            setPercentage(data.percentage ?? null);
          }
        } catch (error) {
          console.error('[MashuppiPlayer] WebSocket message error:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected, reconnecting...');

        // Clear heartbeat interval
        if (heartbeatInterval) {
          clearInterval(heartbeatInterval);
          heartbeatInterval = null;
        }

        // Reconnect after a delay
        reconnectTimeout = window.setTimeout(connectWebSocket, 5000);
      };

      wsRef.current = ws;
    };

    connectWebSocket();

    return () => {
      // Cleanup on unmount
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Initial fetch and polling fallback
  useEffect(() => {
    fetchNowPlaying();

    const interval = setInterval(fetchNowPlaying, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Update elapsed time and uptime every second when stream is playing
  useEffect(() => {
    if (!isStreamPlaying || elapsed === null || total === null) return;

    const interval = setInterval(() => {
      // Increment elapsed time
      setElapsed((prev) => {
        if (prev === null || total === null) return prev;
        const newElapsed = prev + 1;
        if (newElapsed >= total) {
          return total;
        }
        const newPercentage = (newElapsed / total) * 100;
        setPercentage(newPercentage);
        return newElapsed;
      });

      // Increment uptime
      setUptime((prev) => {
        if (prev === null) return prev;
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isStreamPlaying, total]);

  // Audio control
  const togglePlayPause = async () => {
    if (audioRef.current) {
      if (isAudioPlaying) {
        audioRef.current.pause();
      } else {
        try {
          await audioRef.current.play();
        } catch (error) {
          console.error('[MashuppiPlayer] Error playing audio:', error);
        }
      }
    }
  };

  // Handle volume change
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  const progress = percentage ?? 0;
  const currentTrack = nowPlaying ? {
    title: nowPlaying.title || 'Unknown Title',
    artist: nowPlaying.artist || 'Unknown Artist',
    album: nowPlaying.album || 'Unknown Album',
    albumArt: albumArtUrl || 'https://images.unsplash.com/photo-1619983081563-430f63602796?w=400&h=400&fit=crop'
  } : {
    title: 'No track playing',
    artist: 'Mashuppi',
    album: 'Stream',
    albumArt: 'https://images.unsplash.com/photo-1619983081563-430f63602796?w=400&h=400&fit=crop'
  };

  return (
    <div style={{
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      {/* Hidden audio element for streaming */}
      <audio
        ref={audioRef}
        src={STREAM_URL}
        onPlay={() => setIsAudioPlaying(true)}
        onPause={() => setIsAudioPlaying(false)}
      />

      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: 'linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 50%, #1a1a1a 100%)',
        borderRadius: '12px',
        boxShadow: `
          0 0 0 1px rgba(255, 255, 255, 0.1),
          0 8px 32px rgba(0, 0, 0, 0.6),
          inset 0 1px 0 rgba(255, 255, 255, 0.1)
        `,
        overflow: 'hidden',
        border: '1px solid #1a1a1a'
      }}>
        {/* Window Chrome */}
        <div style={{
          background: 'linear-gradient(180deg, #4a4a4a 0%, #3a3a3a 100%)',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #2a2a2a',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 'bold',
              color: 'white',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
            }}>
              M
            </div>
            <span style={{
              color: '#fff',
              fontSize: '13px',
              fontWeight: '600',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
            }}>
              mashuppi player
            </span>
          </div>
          <div style={{
            display: 'flex',
            gap: '4px'
          }}>
            {['−', '□', '×'].map((symbol, i) => (
              <button
                key={i}
                style={{
                  width: '24px',
                  height: '24px',
                  background: 'linear-gradient(180deg, #5a5a5a 0%, #4a4a4a 100%)',
                  border: '1px solid #2a2a2a',
                  borderRadius: '3px',
                  color: '#ccc',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                  transition: 'all 0.1s'
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.boxShadow = 'inset 0 1px 3px rgba(0, 0, 0, 0.5)';
                  e.currentTarget.style.transform = 'translateY(1px)';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {symbol}
              </button>
            ))}
          </div>
        </div>

        {/* Main Player Body */}
        <div style={{ padding: '20px' }}>
          {/* Album Art with Reflection */}
          <div style={{
            position: 'relative',
            width: '100%',
            marginBottom: '20px'
          }}>
            <div style={{
              position: 'relative',
              paddingBottom: '100%',
              background: '#000',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: `
                0 0 0 1px rgba(255, 255, 255, 0.1),
                0 8px 24px rgba(0, 0, 0, 0.6),
                inset 0 0 60px rgba(0, 0, 0, 0.3)
              `
            }}>
              <img
                src={currentTrack.albumArt}
                alt={currentTrack.album}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              {/* Shine effect */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 50%)',
                pointerEvents: 'none'
              }} />
            </div>
            {/* Reflection */}
            {/* 
            <div style={{
              height: '40px',
              marginTop: '4px',
              background: `linear-gradient(180deg,
                rgba(0, 0, 0, 0.3) 0%,
                transparent 100%
              )`,
              borderRadius: '0 0 8px 8px',
              opacity: 0.5,
              transform: 'scaleY(-1)',
              filter: 'blur(2px)'
            }} />
            */}
          </div>

          {/* LCD Display */}
          <div style={{
            background: 'linear-gradient(180deg, #1a3a2a 0%, #0d2415 100%)',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '16px',
            border: '2px solid #0a1a0f',
            boxShadow: `
              inset 0 0 20px rgba(0, 0, 0, 0.8),
              inset 0 2px 4px rgba(0, 0, 0, 0.5),
              0 0 8px rgba(0, 255, 100, 0.2)
            `
          }}>
            <div style={{
              fontFamily: '"Courier New", monospace',
              fontSize: '14px',
              color: '#00ff66',
              textShadow: '0 0 8px rgba(0, 255, 102, 0.8)',
              marginBottom: '4px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontWeight: 'bold'
            }}>
              {currentTrack.title}
            </div>
            <div style={{
              fontFamily: '"Courier New", monospace',
              fontSize: '11px',
              color: '#00cc55',
              textShadow: '0 0 6px rgba(0, 204, 85, 0.6)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {currentTrack.artist} - {currentTrack.album}
            </div>
            {position && queueLength && (
              <div style={{
                fontFamily: '"Courier New", monospace',
                fontSize: '10px',
                color: '#00aa44',
                textShadow: '0 0 4px rgba(0, 170, 68, 0.6)',
                marginTop: '4px'
              }}>
                Track {position} of {queueLength}
              </div>
            )}
          </div>

          {/* Stream Statistics */}
          <StreamStats
            uptime={uptime}
            listeners={listeners}
            peakListeners={peakListeners}
          />

          {/* Progress Bar */}
          <div style={{ marginBottom: '16px' }}>
            <div
              style={{
                height: '24px',
                background: 'linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%)',
                borderRadius: '12px',
                cursor: 'default',
                position: 'relative',
                border: '1px solid #0a0a0a',
                boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.6)',
                overflow: 'hidden'
              }}
            >
              {/* Progress fill */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #ff6b6b 0%, #ff8e53 50%, #ffbb33 100%)',
                borderRadius: '12px',
                boxShadow: '0 0 8px rgba(255, 107, 107, 0.5)',
                transition: 'width 0.3s linear'
              }}>
                {/* Shine */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '50%',
                  background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, transparent 100%)',
                  borderRadius: '12px 12px 0 0'
                }} />
              </div>
              {/* Time display */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '8px',
                transform: 'translateY(-50%)',
                fontSize: '10px',
                fontWeight: 'bold',
                color: progress > 10 ? '#000' : '#999',
                textShadow: progress > 10 ? '0 0 3px rgba(255, 255, 255, 0.5)' : 'none',
                fontFamily: '"Courier New", monospace',
                zIndex: 2
              }}>
                {formatTime(elapsed)}
              </div>
              <div style={{
                position: 'absolute',
                top: '50%',
                right: '8px',
                transform: 'translateY(-50%)',
                fontSize: '10px',
                fontWeight: 'bold',
                color: '#999',
                fontFamily: '"Courier New", monospace',
                zIndex: 2
              }}>
                {formatTime(total)}
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <button
              onClick={togglePlayPause}
              style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(180deg, #ff6b6b 0%, #ee5a52 100%)',
                border: '1px solid #2a2a2a',
                borderRadius: '50%',
                color: '#fff',
                fontSize: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `
                  0 4px 8px rgba(0, 0, 0, 0.4),
                  inset 0 1px 0 rgba(255, 255, 255, 0.3),
                  inset 0 -1px 0 rgba(0, 0, 0, 0.3)
                `,
                transition: 'all 0.15s',
                position: 'relative'
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'translateY(2px)';
                e.currentTarget.style.boxShadow = `
                  0 2px 4px rgba(0, 0, 0, 0.4),
                  inset 0 2px 6px rgba(0, 0, 0, 0.5)
                `;
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `
                  0 4px 8px rgba(0, 0, 0, 0.4),
                  inset 0 1px 0 rgba(255, 255, 255, 0.3),
                  inset 0 -1px 0 rgba(0, 0, 0, 0.3)
                `;
              }}
            >
              {isAudioPlaying ? '⏸' : '▶'}
            </button>
          </div>

          {/* Volume Control */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <span style={{
              fontSize: '18px',
              filter: 'grayscale(0.3)'
            }}>🔊</span>
            <div style={{
              flex: 1,
              height: '8px',
              background: 'linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%)',
              borderRadius: '4px',
              position: 'relative',
              border: '1px solid #0a0a0a',
              boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.6)',
              overflow: 'hidden'
            }}>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer',
                  zIndex: 2
                }}
              />
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: `${volume}%`,
                background: 'linear-gradient(90deg, #4ecdc4 0%, #44a7a0 100%)',
                borderRadius: '4px',
                boxShadow: '0 0 6px rgba(78, 205, 196, 0.4)',
                pointerEvents: 'none'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '50%',
                  background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, transparent 100%)',
                  borderRadius: '4px 4px 0 0'
                }} />
              </div>
            </div>
            <span style={{
              fontSize: '11px',
              color: '#999',
              fontFamily: '"Courier New", monospace',
              fontWeight: 'bold',
              minWidth: '32px',
              textAlign: 'right'
            }}>
              {volume}%
            </span>
          </div>

          {/* Next Track Display */}
          {nextTrack && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '10px 12px',
              borderRadius: '6px',
              marginBottom: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{
                fontSize: '10px',
                color: '#999',
                marginBottom: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Up Next
              </div>
              <div style={{
                fontSize: '12px',
                color: '#fff',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {nextTrack.artist} - {nextTrack.title}
              </div>
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div style={{
          background: 'linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%)',
          padding: '6px 12px',
          borderTop: '1px solid #3a3a3a',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '10px',
          color: '#999',
          fontFamily: '"Courier New", monospace'
        }}>
          <span>{isAudioPlaying ? '▶ PLAYING' : '⏸ PAUSED'}</span>
          <span>{bitrate ? `${bitrate} KBPS` : 'STREAM'}</span>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};

export default MashuppiPlayer;
