import axios from 'axios';

// Use relative URL in development to go through Vite proxy
const API_BASE = import.meta.env.DEV ? '/api' : 'https://mashuppi.com/api';

export interface Track {
  artist: string;
  title: string;
  raw: string;
}

export interface NowPlaying {
  track: Track | null;
  isPlaying: boolean;
  timestamp: string;
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
  }
};

export const STREAM_URL = 'https://mashuppi.com/stream';