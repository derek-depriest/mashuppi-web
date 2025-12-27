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
  }
};

export const STREAM_URL = 'https://mashuppi.com/stream';