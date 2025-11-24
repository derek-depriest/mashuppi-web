import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
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

export function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [history, setHistory] = useState<RecentTrack[]>([]);

  useEffect(() => {
    api.getStats().then(setStats);
    api.getHistory().then(data => setHistory(data.tracks));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link 
            to="/" 
            className="text-white hover:text-purple-200 transition-colors flex items-center gap-2"
          >
            ← Back to Player
          </Link>
          <h1 className="text-4xl font-black text-white">Station Stats</h1>
          <div className="w-32" /> {/* Spacer for centering */}
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-6 bg-white bg-opacity-10 backdrop-blur-md border-2 border-purple-400">
              <div className="text-purple-200 text-sm uppercase tracking-wider mb-2">Total Songs</div>
              <div className="text-4xl font-black text-white">{stats.songs}</div>
            </Card>
            
            <Card className="p-6 bg-white bg-opacity-10 backdrop-blur-md border-2 border-purple-400">
              <div className="text-purple-200 text-sm uppercase tracking-wider mb-2">Artists</div>
              <div className="text-4xl font-black text-white">{stats.artists}</div>
            </Card>
            
            <Card className="p-6 bg-white bg-opacity-10 backdrop-blur-md border-2 border-purple-400">
              <div className="text-purple-200 text-sm uppercase tracking-wider mb-2">Albums</div>
              <div className="text-4xl font-black text-white">{stats.albums}</div>
            </Card>
            
            <Card className="p-6 bg-white bg-opacity-10 backdrop-blur-md border-2 border-purple-400">
              <div className="text-purple-200 text-sm uppercase tracking-wider mb-2">Playtime</div>
              <div className="text-2xl font-black text-white">{stats.playtime}</div>
            </Card>
          </div>
        )}

        {/* Recently Played */}
        <Card className="p-6 bg-white bg-opacity-10 backdrop-blur-md border-2 border-purple-400">
          <h2 className="text-2xl font-black text-white mb-4">Recently Played</h2>
          <div className="space-y-2">
            {history.map((track, idx) => (
              <div 
                key={idx}
                className="flex items-center gap-4 p-3 bg-purple-900 bg-opacity-30 rounded-lg hover:bg-opacity-50 transition-colors"
              >
                <div className="text-purple-300 font-mono text-sm w-8">#{idx + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-bold truncate">{track.title}</div>
                  <div className="text-purple-200 text-sm truncate">{track.artist}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}