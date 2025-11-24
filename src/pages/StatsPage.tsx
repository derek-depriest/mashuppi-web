import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/services/api';

interface Stats {
  artists: string;
  albums: string;
  songs: string;
  db_playtime: string;
  playtime: string;
}

interface RecentTrack {
  position: number;
  artist: string;
  title: string;
  raw: string;
}

export function StatsPage({ onClose }: { onClose?: () => void }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [history, setHistory] = useState<RecentTrack[]>([]);

  useEffect(() => {
    api.getStats().then(setStats);
    api.getHistory().then(data => setHistory(data.tracks));
  }, []);

  const isModal = !!onClose;

  return (
    <div className={isModal ? "bg-gray-900 text-white p-6 rounded-xl shadow-2xl max-w-2xl mx-auto border border-gray-800" : "min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 p-6"}>
      <div className={isModal ? "space-y-6" : "max-w-4xl mx-auto space-y-6"}>
        {/* Header */}
        <div className="flex items-center justify-between">
          {isModal ? (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕ Close
            </button>
          ) : (
            <Link
              to="/"
              className="text-white hover:text-purple-200 transition-colors flex items-center gap-2"
            >
              ← Back to Player
            </Link>
          )}
          <h1 className="text-3xl font-black text-white">Station Stats</h1>
          <div className="w-20" /> {/* Spacer */}
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white bg-opacity-10 p-4 rounded-lg backdrop-blur-sm">
              <div className="text-purple-300 text-sm font-bold uppercase tracking-wider">Total Tracks</div>
              <div className="text-3xl font-black">{stats.songs}</div>
            </div>
            <div className="bg-white bg-opacity-10 p-4 rounded-lg backdrop-blur-sm">
              <div className="text-purple-300 text-sm font-bold uppercase tracking-wider">Unique Artists</div>
              <div className="text-3xl font-black">{stats.artists}</div>
            </div>
            <div className="bg-white bg-opacity-10 p-4 rounded-lg backdrop-blur-sm">
              <div className="text-purple-300 text-sm font-bold uppercase tracking-wider">Playtime</div>
              <div className="text-3xl font-black">{stats.playtime}</div>
            </div>
          </div>
        )}

        {/* Recent Tracks */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-purple-200">Recently Played</h2>
          <div className="space-y-2">
            {history.map((track, i) => (
              <div key={i} className="bg-white bg-opacity-5 p-3 rounded flex items-center justify-between hover:bg-opacity-10 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="font-bold truncate">{track.title}</div>
                  <div className="text-sm text-gray-400 truncate">{track.artist}</div>
                </div>
                <div className="text-xs text-gray-500 ml-4">#{i + 1}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}