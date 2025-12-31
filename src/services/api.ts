import axios from 'axios';

// Use relative URL in development to go through Vite proxy
const API_BASE = import.meta.env.DEV ? '/api' : 'https://mashuppi.com/api';

export interface Track {
  artist: string;
  title: string;
  raw: string;
  album?: string | null;
  duration?: number | null;
  year?: number | null;
  trackNumber?: number | null;
  artworkUrl?: string | null;
  albumId?: string | null;
  artistId?: string | null;
  filePath?: string | null;
}

export interface NowPlaying {
  track: Track | null;
  isPlaying: boolean;
  timestamp: string;
  position?: number | null;
  queueLength?: number | null;
  elapsed?: number | null;
  total?: number | null;
  percentage?: number | null;
  nextTrack?: Track | null;
  listeners?: number;
  peakListeners?: number;
  streamStart?: string | null;
  uptime?: number | null; // Stream uptime in seconds
  bitrate?: number; // Stream bitrate in kbps
}

export interface ListenerStats {
  listeners: number;
  peakListeners: number;
  serverName?: string;
  serverDescription?: string;
  bitrate?: number;
  audioInfo?: string | null;
  streamStart?: string | null;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  year: number | null;
  artwork_url: string | null;
  track_count: number;
  play_count: number;
  last_played?: string | null;
  artist_name?: string;
}

export interface AlbumDetails {
  id: string;
  title: string;
  artist: string;
  artworkUrl: string | null;
  trackCount: number;
  tracks: Track[];
}

export const api = {
  getNowPlaying: async (): Promise<NowPlaying> => {
    const response = await axios.get(`${API_BASE}/now-playing`);
    return response.data;
  },

  getStats: async () => {
    const response = await axios.get(`${API_BASE}/stats`);
    return response.data;
  },

  getHealth: async () => {
    const response = await axios.get(`${API_BASE}/health`);
    return response.data;
  },

  getHistory: async () => {
    const response = await axios.get(`${API_BASE}/history`);
    return response.data;
  },

  getListeners: async (): Promise<ListenerStats> => {
    const response = await axios.get(`${API_BASE}/listeners`);
    return response.data;
  },

  getAlbums: async (): Promise<{ albums: Album[] }> => {
    const response = await axios.get(`${API_BASE}/albums`);
    return response.data;
  },

  getAlbumDetails: async (albumId: string): Promise<AlbumDetails> => {
    const response = await axios.get(`${API_BASE}/albums/${albumId}`);
    return response.data;
  },

  trackAlbumPlay: async (albumId: string): Promise<void> => {
    await axios.post(`${API_BASE}/albums/${albumId}/played`);
  }
};

export const STREAM_URL = 'https://mashuppi.com/stream';