import React, { useState, useRef, useEffect } from 'react';
import type { Track } from '../services/api';
import { api } from '../services/api';

interface AlbumPlayerProps {
  albumId: string;
  albumTitle: string;
  albumArtist: string;
  albumArtwork: string | null;
  tracks: Track[];
  onBack: () => void;
}

export default function AlbumPlayer({
  albumId,
  albumTitle,
  albumArtwork,
  tracks,
  onBack
}: AlbumPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(75);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);
  const nextAudioRef = useRef<HTMLAudioElement>(null); // For gapless preload

  const currentTrack = tracks[currentIndex];
  const nextTrack = currentIndex < tracks.length - 1 ? tracks[currentIndex + 1] : null;

  // Track album play on mount
  useEffect(() => {
    api.trackAlbumPlay(albumId);
  }, [albumId]);

  // Load current track
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;

    const audio = audioRef.current;
    audio.src = `https://mashuppi.com/music/${currentTrack.filePath}`;
    audio.volume = volume / 100;

    if (isPlaying) {
      audio.play().catch(err => console.error('Playback error:', err));
    }
  }, [currentIndex, currentTrack]);

  // Preload next track for gapless playback
  useEffect(() => {
    if (!nextAudioRef.current || !nextTrack) return;

    const nextAudio = nextAudioRef.current;
    nextAudio.src = `https://mashuppi.com/music/${nextTrack.filePath}`;
    nextAudio.preload = 'auto';
    nextAudio.volume = volume / 100;
  }, [nextTrack, volume]);

  // Update elapsed time
  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setElapsed(audio.currentTime);
      setDuration(audio.duration || currentTrack.duration || 0);
    };

    const handleEnded = () => {
      // Gapless transition to next track
      if (nextTrack && nextAudioRef.current) {
        // Swap audio elements for seamless transition
        const temp = audioRef.current;
        audioRef.current = nextAudioRef.current;
        nextAudioRef.current = temp;

        setCurrentIndex(prev => prev + 1);
        setIsPlaying(true);
        audioRef.current.play();
      } else {
        // End of album
        setIsPlaying(false);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || currentTrack.duration || 0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [currentIndex, currentTrack, nextTrack]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    if (currentIndex < tracks.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsPlaying(true);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;

    audioRef.current.currentTime = newTime;
    setElapsed(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) audioRef.current.volume = newVolume / 100;
    if (nextAudioRef.current) nextAudioRef.current.volume = newVolume / 100;
  };

  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const percentage = duration > 0 ? (elapsed / duration) * 100 : 0;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      {/* Hidden audio elements */}
      <audio ref={audioRef} />
      <audio ref={nextAudioRef} />

      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          position: 'fixed',
          top: '80px',
          left: '20px',
          padding: '10px 20px',
          background: 'rgba(0,0,0,0.8)',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '8px',
          cursor: 'pointer',
          zIndex: 1000,
          backdropFilter: 'blur(10px)'
        }}
      >
        ← Back to Albums
      </button>

      {/* Player Container */}
      <div style={{
        width: '100%',
        maxWidth: '500px',
        background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
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
              background: 'linear-gradient(135deg, #4ecdc4 0%, #44a7a0 100%)',
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
              ♪
            </div>
            <span style={{
              color: '#fff',
              fontSize: '13px',
              fontWeight: '600',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
            }}>
              album player
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

        {/* Window Body */}
        <div style={{ padding: '32px' }}>
        {/* Album Artwork */}
        <div style={{
          width: '100%',
          paddingBottom: '100%',
          position: 'relative',
          borderRadius: '12px',
          overflow: 'hidden',
          marginBottom: '24px',
          background: '#0a0a0a',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
        }}>
          {albumArtwork ? (
            <img
              src={albumArtwork}
              alt={albumTitle}
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <div style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '80px',
              color: '#333'
            }}>
              💿
            </div>
          )}
        </div>

        {/* Track Info */}
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <div style={{
            color: '#fff',
            fontSize: '20px',
            fontWeight: 'bold',
            marginBottom: '8px'
          }}>
            {currentTrack.title}
          </div>
          <div style={{
            color: '#999',
            fontSize: '16px',
            marginBottom: '4px'
          }}>
            {currentTrack.artist}
          </div>
          <div style={{
            color: '#666',
            fontSize: '14px'
          }}>
            Track {currentIndex + 1} of {tracks.length} • {albumTitle}
          </div>
        </div>

        {/* Progress Bar */}
        <div
          onClick={handleSeek}
          style={{
            marginBottom: '20px',
            height: '24px',
            background: 'linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%)',
            borderRadius: '12px',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <div style={{
            height: '100%',
            width: `${percentage}%`,
            background: 'linear-gradient(90deg, #4ecdc4 0%, #44a7a0 100%)',
            borderRadius: '12px',
            transition: 'width 0.1s linear'
          }} />
        </div>

        {/* Time Display */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '24px',
          fontSize: '12px',
          color: '#999',
          fontFamily: '"Courier New", monospace'
        }}>
          <span>{formatTime(elapsed)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Control Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '20px',
          marginBottom: '24px'
        }}>
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            style={{
              padding: '12px 20px',
              background: currentIndex === 0 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
              opacity: currentIndex === 0 ? 0.3 : 1
            }}
          >
            PREV
          </button>
          <button
            onClick={togglePlayPause}
            style={{
              padding: '16px 32px',
              background: 'linear-gradient(135deg, #4ecdc4 0%, #44a7a0 100%)',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(78, 205, 196, 0.4)',
              minWidth: '100px'
            }}
          >
            {isPlaying ? 'PAUSE' : 'PLAY'}
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex === tracks.length - 1}
            style={{
              padding: '12px 20px',
              background: currentIndex === tracks.length - 1 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: currentIndex === tracks.length - 1 ? 'not-allowed' : 'pointer',
              opacity: currentIndex === tracks.length - 1 ? 0.3 : 1
            }}
          >
            NEXT
          </button>
        </div>

        {/* Volume Control */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ color: '#999', fontSize: '12px', fontWeight: 'bold' }}>VOL</span>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            style={{
              flex: 1,
              cursor: 'pointer'
            }}
          />
          <span style={{ color: '#999', fontSize: '12px', minWidth: '35px', fontFamily: '"Courier New", monospace' }}>
            {volume}%
          </span>
        </div>
        </div>
      </div>
    </div>
  );
}
