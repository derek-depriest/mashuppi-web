import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Mock data
let mockListeners = 5;

// Mock API endpoints for local development
app.get('/api/now-playing', (_req, res) => {
  res.json({
    track: {
      artist: 'Bruneaux',
      title: 'Straight Flexin\'',
      raw: 'Bruneaux - Straight Flexin\'',
      album: null,
      duration: null
    },
    isPlaying: true,
    position: 42,
    queueLength: 247,
    elapsed: null,
    total: null,
    percentage: null,
    nextTrack: {
      artist: 'The Airport District',
      title: 'Just Say It',
      raw: 'The Airport District - Just Say It',
      album: null,
      duration: null
    },
    listeners: mockListeners,
    peakListeners: 12,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/stats', (_req, res) => {
  res.json({
    artists: '42',
    albums: '156',
    songs: '847',
    db_playtime: '2d 14h 23m',
    playtime: '48h 12m 34s'
  });
});

app.get('/api/history', (_req, res) => {
  const tracks = Array.from({ length: 20 }, (_, i) => ({
    position: i + 1,
    artist: 'Test Artist ' + (i + 1),
    title: 'Test Track ' + (i + 1),
    raw: `Test Artist ${i + 1} - Test Track ${i + 1}`
  }));
  res.json({ tracks });
});

app.get('/api/listeners', (_req, res) => {
  // Simulate changing listener count
  mockListeners = Math.floor(Math.random() * 20) + 1;
  res.json({
    listeners: mockListeners,
    peakListeners: 12,
    serverName: 'mashuppi',
    serverDescription: 'Broadcasting the Golden Age',
    bitrate: 128,
    audioInfo: null,
    streamStart: new Date().toISOString()
  });
});

app.get('/api/album-art', (_req, res) => {
  // For dev server, return a placeholder or 404
  // In production, this would fetch from MPD
  res.status(404).json({ error: 'Album art not available in dev mode' });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'mashuppi-dev-api' });
});

app.listen(PORT, () => {
  console.log(`🎵 Mock API server running on http://localhost:${PORT}`);
  console.log(`Use this for local development when Pi is not accessible`);
});
