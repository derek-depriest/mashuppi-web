import { useEffect, useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { CassetteLogo } from './CassetteLogo';
import { api, STREAM_URL, type Track, type NowPlaying } from '@/services/api';
import { StatsPage } from '@/pages/StatsPage';
import { AboutPage } from '@/pages/AboutPage';
import { Marquee } from './Marquee';
import { BarChart2, Info, Volume2 } from 'lucide-react';

export function CassettePlayer() {
  const [nowPlaying, setNowPlaying] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false); // Start paused
  const [volume, setVolume] = useState(50);
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
    api.getNowPlaying().then((data: NowPlaying) => {
      setNowPlaying(data.track);
      // Don't auto-play - browsers block it anyway
    });

    // Set up WebSocket for real-time updates
    const ws = new WebSocket('wss://mashuppi.com/ws');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'track_change') {
        setNowPlaying(data.track);
      }
    };

    return () => ws.close();
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

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

        {/* Cassette Card - Compact */}
        <Card
          onClick={togglePlay}
          className="relative p-6 bg-gradient-to-br from-purple-500 to-purple-700 border-4 border-purple-900 shadow-2xl rounded-2xl cursor-pointer hover:scale-[1.02] transition-transform duration-200 active:scale-[0.98]"
        >
          {/* Corner screws */}
          <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-gray-800 shadow-inner border border-gray-900" />
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gray-800 shadow-inner border border-gray-900" />
          <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-gray-800 shadow-inner border border-gray-900" />
          <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-gray-800 shadow-inner border border-gray-900" />

          {/* Label Area - Now Playing */}
          <div className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300 rounded-xl p-4 mb-4 shadow-inner" onClick={(e) => e.stopPropagation()}>
            <div className="text-xs text-gray-600 uppercase tracking-[0.15em] mb-1 font-bold">
              Now Playing
            </div>
            {nowPlaying ? (
              <div className="space-y-0.5 overflow-hidden">
                <Marquee
                  text={nowPlaying.title}
                  className="text-xl font-black text-gray-800 leading-tight"
                />
                <Marquee
                  text={nowPlaying.artist}
                  className="text-base font-bold text-purple-700"
                />
              </div>
            ) : (
              <div className="text-lg text-gray-600 animate-pulse">Loading...</div>
            )}
          </div>

          {/* Cassette mechanism */}
          <div className="space-y-3">
            {/* Top row buttons */}
            <div className="flex justify-center gap-6">
              <div className="w-6 h-2 bg-gray-800 rounded-sm shadow-inner" />
              <div className="w-6 h-2 bg-gray-800 rounded-sm shadow-inner" />
            </div>

            {/* Reels row */}
            <div className="relative">
              <div className="flex justify-around items-center px-8">
                {/* Left Reel */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 via-pink-500 to-red-500 flex items-center justify-center shadow-xl">
                  <div className="w-11 h-11 rounded-full bg-gray-900 flex items-center justify-center">
                    <div className={`w-8 h-8 rounded-full border-2 border-gray-700 ${isPlaying ? 'animate-spin' : ''}`}
                      style={{ animationDuration: '4s', animationTimingFunction: 'linear' }}>
                      <div className="w-full h-full relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-0.5 bg-gray-600" />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center rotate-45">
                          <div className="w-full h-0.5 bg-gray-600" />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center rotate-90">
                          <div className="w-full h-0.5 bg-gray-600" />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center -rotate-45">
                          <div className="w-full h-0.5 bg-gray-600" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Reel */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 via-pink-500 to-red-500 flex items-center justify-center shadow-xl">
                  <div className="w-11 h-11 rounded-full bg-gray-900 flex items-center justify-center">
                    <div className={`w-8 h-8 rounded-full border-2 border-gray-700 ${isPlaying ? 'animate-spin' : ''}`}
                      style={{ animationDuration: '4s', animationTimingFunction: 'linear' }}>
                      <div className="w-full h-full relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-0.5 bg-gray-600" />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center rotate-45">
                          <div className="w-full h-0.5 bg-gray-600" />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center rotate-90">
                          <div className="w-full h-0.5 bg-gray-600" />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center -rotate-45">
                          <div className="w-full h-0.5 bg-gray-600" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tape between reels */}
              <div className="absolute top-1/2 left-1/4 right-1/4 h-1 bg-gray-800 -translate-y-1/2 rounded-full shadow-inner" />
            </div>

            {/* Tape Window */}
            <div className="flex justify-center px-6">
              <div className="flex-1 h-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded shadow-inner border border-gray-700" />
            </div>
          </div>
        </Card>

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
            <Volume2 className="w-6 h-6 text-white" />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="volume-slider flex-1"
            />
            <span className="text-white text-sm font-mono w-12 text-right font-bold">{volume}%</span>
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