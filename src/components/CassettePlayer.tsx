import { useEffect, useState, useRef } from 'react';
import { CassetteLogo } from './CassetteLogo';
import { api, STREAM_URL, type Track, type NowPlaying } from '@/services/api';
import { StatsPage } from '@/pages/StatsPage';
import { AboutPage } from '@/pages/AboutPage';
import { Marquee } from './Marquee';
import { BarChart2, Info, Volume2, VolumeX } from 'lucide-react';

export function CassettePlayer() {
  const [nowPlaying, setNowPlaying] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false); // Start paused
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(50);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [activeModal, setActiveModal] = useState<'stats' | 'about' | null>(null);

  useEffect(() => {
    // Capture the install prompt event
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallButton(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;

    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowInstallButton(false);
    }
    setInstallPrompt(null);
  };

  useEffect(() => {
    // Fetch initial now-playing
    const fetchNowPlaying = () => {
      //console.log('[Heartbeat] Fetching now playing...');
      api.getNowPlaying().then((data: NowPlaying) => {
        //console.log('[Heartbeat] Received:', data.track?.title || 'No track');
        setNowPlaying(data.track);
      }).catch((error) => {
        console.error('[Heartbeat] Failed to fetch now playing:', error);
      });
    };

    // Initial fetch
    fetchNowPlaying();

    // Set up 10-second polling heartbeat
    //console.log('[Heartbeat] Starting 10-second polling interval');
    const heartbeatInterval = setInterval(fetchNowPlaying, 5000);

    // Set up WebSocket for real-time updates
    const ws = new WebSocket('wss://mashuppi.com/ws');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'track_change') {
        setNowPlaying(data.track);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      clearInterval(heartbeatInterval);
      ws.close();
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      const newVolume = isMuted ? 0 : volume / 100;
      audioRef.current.volume = newVolume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      // Unmute - restore previous volume
      setVolume(previousVolume);
      setIsMuted(false);
    } else {
      // Mute - save current volume and set to 0
      setPreviousVolume(volume);
      setIsMuted(true);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 flex items-center justify-center p-4 overflow-hidden relative">
      <div className="w-full max-w-2xl space-y-4">
        {/* Logo - Compact */}
        <div className="text-center space-y-2">
          <CassetteLogo className="w-20 h-16 mx-auto" />
          <h1 className="text-5xl font-black text-white tracking-wider drop-shadow-2xl">
            MASHUPPI
          </h1>
          <p className="text-purple-200 text-xs uppercase tracking-[0.3em] font-semibold">
            Broadcasting the Golden Age
          </p>
        </div>

        {/* Cassette Card - v2 Design */}
        <div
          onClick={togglePlay}
          className="relative w-full max-w-[600px] mx-auto bg-zinc-800 rounded-3xl shadow-2xl flex flex-col items-center justify-center p-3 sm:p-4 border-b-4 sm:border-b-6 md:border-b-8 border-r-4 sm:border-r-6 md:border-r-8 border-zinc-900 transform transition-transform hover:scale-105 duration-300 cursor-pointer"
        >
          {/* Screw Top Left */}
          <div className="absolute top-4 left-4 w-4 h-4 bg-zinc-400 rounded-full flex items-center justify-center shadow-inner">
            <div className="w-3 h-0.5 bg-zinc-600 rotate-45"></div>
            <div className="w-3 h-0.5 bg-zinc-600 -rotate-45 absolute"></div>
          </div>
          {/* Screw Top Right */}
          <div className="absolute top-4 right-4 w-4 h-4 bg-zinc-400 rounded-full flex items-center justify-center shadow-inner">
            <div className="w-3 h-0.5 bg-zinc-600 rotate-45"></div>
            <div className="w-3 h-0.5 bg-zinc-600 -rotate-45 absolute"></div>
          </div>
          {/* Screw Bottom Left */}
          <div className="absolute bottom-4 left-4 w-4 h-4 bg-zinc-400 rounded-full flex items-center justify-center shadow-inner">
            <div className="w-3 h-0.5 bg-zinc-600 rotate-45"></div>
            <div className="w-3 h-0.5 bg-zinc-600 -rotate-45 absolute"></div>
          </div>
          {/* Screw Bottom Right */}
          <div className="absolute bottom-4 right-4 w-4 h-4 bg-zinc-400 rounded-full flex items-center justify-center shadow-inner">
            <div className="w-3 h-0.5 bg-zinc-600 rotate-45"></div>
            <div className="w-3 h-0.5 bg-zinc-600 -rotate-45 absolute"></div>
          </div>

          {/* Main Label Area */}
          <div className="w-[90%] h-[280px] md:h-[320px] bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 rounded-xl shadow-md relative overflow-hidden flex flex-col items-center pt-4">
            {/* Label Text */}
            <div className="w-full px-4 sm:px-6 md:px-8 mb-2" onClick={(e) => e.stopPropagation()}>
              <div className="w-full bg-white/90 rounded-sm flex flex-col px-3 sm:px-4 py-2 font-handwriting text-zinc-800 shadow-sm transform -rotate-1">
                {nowPlaying ? (
                  <>
                    <Marquee text={nowPlaying.title} className="text-lg sm:text-xl leading-tight" />
                    <Marquee text={nowPlaying.artist} className="text-sm sm:text-base opacity-70" />
                  </>
                ) : (
                  <div className="text-base sm:text-lg animate-pulse">Loading...</div>
                )}
              </div>
              <div className="w-full h-0.5 bg-zinc-800/20 mt-2"></div>
              <div className="w-full h-0.5 bg-zinc-800/20 mt-1"></div>
            </div>

            {/* Central Window Area */}
            <div className="w-[85%] sm:w-[75%] md:w-[70%] h-[100px] sm:h-[110px] md:h-[120px] bg-zinc-800 rounded-full mt-2 flex items-center justify-center relative shadow-inner border-2 border-zinc-700">
              {/* Left Reel */}
              <div className={`absolute left-2 sm:left-4 md:left-6 w-16 sm:w-18 md:w-20 h-16 sm:h-18 md:h-20 bg-white rounded-full flex items-center justify-center shadow-md border-2 sm:border-3 md:border-4 border-zinc-300 ${isPlaying ? 'animate-spin-slow' : ''}`}>
                <div className="w-full h-full relative">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="absolute top-1/2 left-1/2 w-2 sm:w-2.5 md:w-3 h-4 sm:h-5 md:h-6 bg-zinc-800 gear-tooth-mobile" style={{ '--tooth-rotation': `${i * 60}deg` } as React.CSSProperties}></div>
                  ))}
                  <div className="absolute top-1/2 left-1/2 w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 border-2 border-zinc-300"></div>
                </div>
              </div>

              {/* Right Reel */}
              <div className={`absolute right-2 sm:right-4 md:right-6 w-16 sm:w-18 md:w-20 h-16 sm:h-18 md:h-20 bg-white rounded-full flex items-center justify-center shadow-md border-2 sm:border-3 md:border-4 border-zinc-300 ${isPlaying ? 'animate-spin-slow' : ''}`}>
                <div className="w-full h-full relative">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="absolute top-1/2 left-1/2 w-2 sm:w-2.5 md:w-3 h-4 sm:h-5 md:h-6 bg-zinc-800 gear-tooth-mobile" style={{ '--tooth-rotation': `${i * 60}deg` } as React.CSSProperties}></div>
                  ))}
                  <div className="absolute top-1/2 left-1/2 w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 border-2 border-zinc-300"></div>
                </div>
              </div>

              {/* Tape Window (Transparent part) */}
              <div className="w-32 sm:w-36 md:w-40 h-12 sm:h-14 md:h-16 bg-zinc-900/50 backdrop-blur-sm z-10 rounded-md border border-zinc-600/50 flex items-center justify-center overflow-hidden">
                {isPlaying && (
                  <div className="w-full h-full flex items-center justify-center space-x-1 opacity-30">
                    <div className="w-full h-0.5 bg-zinc-400 animate-pulse"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Side A/B Markings */}
            <div className="absolute top-4 left-4 text-zinc-900 font-bold text-xl opacity-70">A</div>
            <div className="absolute bottom-4 right-4 text-zinc-900 font-bold text-xs opacity-70">NR [Yes] [No]</div>
          </div>

          {/* Bottom Trapezoid Area */}
          <div className="w-[75%] h-[60px] bg-zinc-700 mt-auto mb-2 clip-path-trapezoid flex items-center justify-between px-8 relative rounded-b-lg">
            {/* Holes */}
            <div className="w-3 h-3 bg-black rounded-full shadow-inner"></div>
            <div className="w-3 h-3 bg-black rounded-full shadow-inner"></div>
            <div className="w-3 h-3 bg-black rounded-full shadow-inner"></div>
            <div className="w-3 h-3 bg-black rounded-full shadow-inner"></div>
          </div>
        </div>

        {/* Controls - Compact */}
        <div className="flex items-center justify-center gap-4 bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-4 shadow-xl">
          <button
            onClick={togglePlay}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 shadow-xl hover:shadow-2xl transition-all hover:scale-105 active:scale-95 border-4 border-purple-900 flex items-center justify-center"
          >
            {isPlaying ? (
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <div className="flex items-center gap-3 flex-1 max-w-md">
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log('[Mute] Button clicked!');
                toggleMute();
              }}
              className="transition-all hover:scale-110 active:scale-95 cursor-pointer"
              aria-label={isMuted ? "Unmute" : "Mute"}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <VolumeX className="w-6 h-6 text-white opacity-60" />
              ) : (
                <Volume2 className="w-6 h-6 text-white" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                const newVolume = Number(e.target.value);
                setVolume(newVolume);
                if (isMuted && newVolume > 0) {
                  setIsMuted(false);
                }
              }}
              className="volume-slider flex-1"
            />
            <span className="text-white text-sm font-mono w-12 text-right font-bold">{isMuted ? 0 : volume}%</span>
          </div>
        </div>

        {/* Status - Compact */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-white bg-opacity-20 backdrop-blur-md rounded-full px-4 py-2 shadow-lg">
            <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-400 animate-glow' : 'bg-gray-400'}`} />
            <span className="text-white text-sm font-bold tracking-wider">
              {isPlaying ? 'LIVE' : 'PAUSED'}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setActiveModal('stats')}
            className="text-purple-200 hover:text-white transition-colors text-sm font-semibold flex items-center gap-2"
          >
            <BarChart2 className="w-4 h-4" /> Stats
          </button>
          <span className="text-purple-400">•</span>
          <button
            onClick={() => setActiveModal('about')}
            className="text-purple-200 hover:text-white transition-colors text-sm font-semibold flex items-center gap-2"
          >
            <Info className="w-4 h-4" /> About
          </button>
        </div>

        {/* Install button - add after the Status section */}
        {showInstallButton && (
          <div className="text-center">
            <button
              onClick={handleInstallClick}
              className="inline-flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-all hover:scale-105"
            >
              <span>📱</span>
              <span>Install App</span>
            </button>
          </div>
        )}

        {/* Hidden Audio Element */}
        <audio ref={audioRef} src={STREAM_URL} />
      </div>

      {/* Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full h-full">
            {activeModal === 'stats' && <StatsPage onClose={() => setActiveModal(null)} />}
            {activeModal === 'about' && <AboutPage onClose={() => setActiveModal(null)} />}
          </div>
        </div>
      )}
    </div>
  );
}