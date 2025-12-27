const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const WebSocket = require('ws');
const axios = require('axios');

const app = express();
const PORT = 3000;

// Icecast configuration
const ICECAST_HOST = process.env.ICECAST_HOST || '127.0.0.1';
const ICECAST_PORT = process.env.ICECAST_PORT || 8000;
const ICECAST_MOUNT = process.env.ICECAST_MOUNT || '/mashups';

// Enable CORS for React frontend
app.use(cors());
app.use(express.json());

// Utility function to run mpc commands
function runMpc(command) {
  return new Promise((resolve, reject) => {
    exec(`mpc ${command}`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout.trim());
    });
  });
}

// Parse mpc current output with extended metadata
async function parseCurrentTrack(output) {
  if (!output || output.includes('volume:')) {
    return null;
  }

  const lines = output.split('\n');
  if (lines.length === 0) return null;

  const trackInfo = lines[0];
  // Try to split on common delimiters
  let artist = 'Unknown Artist';
  let title = trackInfo;

  if (trackInfo.includes(' - ')) {
    const parts = trackInfo.split(' - ');
    artist = parts[0].trim();
    title = parts.slice(1).join(' - ').trim();
  }

  // Get extended metadata using mpc format
  let album = null;
  let duration = null;

  try {
    const metadata = await runMpc('current --format "%album%|%time%"');
    if (metadata && metadata !== '|') {
      const [albumName, time] = metadata.split('|');
      if (albumName && albumName !== '') album = albumName;
      if (time && time !== '') duration = parseInt(time);
    }
  } catch (error) {
    // Metadata not available, continue without it
  }

  return { artist, title, raw: trackInfo, album, duration };
}

// Parse mpc status to get playback info
function parseStatus(statusOutput) {
  const lines = statusOutput.split('\n');
  let isPlaying = false;
  let position = null;
  let queueLength = null;
  let elapsed = null;
  let total = null;
  let percentage = null;

  lines.forEach(line => {
    if (line.includes('[playing]')) isPlaying = true;
    if (line.includes('[paused]')) isPlaying = false;

    // Parse: [playing] #5/247   0:23/3:45 (10%)
    const match = line.match(/#(\d+)\/(\d+)\s+(\d+):(\d+)\/(\d+):(\d+)\s+\((\d+)%\)/);
    if (match) {
      position = parseInt(match[1]);
      queueLength = parseInt(match[2]);
      elapsed = parseInt(match[3]) * 60 + parseInt(match[4]);
      total = parseInt(match[5]) * 60 + parseInt(match[6]);
      percentage = parseInt(match[7]);
    }
  });

  return { isPlaying, position, queueLength, elapsed, total, percentage };
}

// Fetch Icecast stats
async function getIcecastStats() {
  try {
    const url = `http://${ICECAST_HOST}:${ICECAST_PORT}/status-json.xsl`;
    const response = await axios.get(url, { timeout: 5000 });

    if (response.data && response.data.icestats && response.data.icestats.source) {
      const source = Array.isArray(response.data.icestats.source)
        ? response.data.icestats.source.find(s => s.listenurl && s.listenurl.includes(ICECAST_MOUNT))
        : response.data.icestats.source;

      if (source) {
        return {
          listeners: source.listeners || 0,
          peakListeners: source.listener_peak || 0,
          serverName: source.server_name || 'mashuppi',
          serverDescription: source.server_description || '',
          bitrate: source.bitrate || 128,
          audioInfo: source.audio_info || null,
          streamStart: source.stream_start || null
        };
      }
    }

    return { listeners: 0, peakListeners: 0 };
  } catch (error) {
    console.error('Failed to fetch Icecast stats:', error.message);
    return { listeners: 0, peakListeners: 0 };
  }
}

// API Routes

// Get current playing track
app.get('/api/now-playing', async (req, res) => {
  try {
    const current = await runMpc('current');
    const status = await runMpc('status');

    const track = await parseCurrentTrack(current);
    const statusInfo = parseStatus(status);

    // Get next track
    let nextTrack = null;
    try {
      const queued = await runMpc('queued');
      if (queued) {
        nextTrack = await parseCurrentTrack(queued);
      }
    } catch (error) {
      // No next track or error fetching it
    }

    // Get Icecast listener stats
    const icecastStats = await getIcecastStats();

    res.json({
      track,
      isPlaying: statusInfo.isPlaying,
      position: statusInfo.position,
      queueLength: statusInfo.queueLength,
      elapsed: statusInfo.elapsed,
      total: statusInfo.total,
      percentage: statusInfo.percentage,
      nextTrack,
      listeners: icecastStats.listeners,
      peakListeners: icecastStats.peakListeners,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get player stats
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await runMpc('stats');
    const lines = stats.split('\n');
    
    const data = {};
    lines.forEach(line => {
      const [key, value] = line.split(':').map(s => s.trim());
      if (key && value) {
        data[key.toLowerCase().replace(/ /g, '_')] = value;
      }
    });
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get playlist history
app.get('/api/history', async (req, res) => {
    try {
        const playlist = await runMpc('playlist');
        
        const tracks = playlist.split('\n')
            .filter(line => line.trim())
            .slice(-20)
            .reverse()
            .map((line, idx) => {
                // Parse format: "Artist - Title" or just filename
                const parts = line.split(' - ');
                let artist = 'Unknown Artist';
                let title = line;
                
                if (parts.length >= 2) {
                    artist = parts[0].trim();
                    title = parts.slice(1).join(' - ').trim();
                }
                
                return {
                    position: idx + 1,
                    artist: artist,
                    title: title.replace('.mp3', ''),
                    raw: line
                };
            });
        
        res.json({ tracks });
    } catch (error) {
        console.error('History error:', error);
        res.json({ tracks: [] });
    }
});

// Get listener stats
app.get('/api/listeners', async (req, res) => {
  try {
    const stats = await getIcecastStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get album art for current track
app.get('/api/album-art', async (req, res) => {
  try {
    // Get current track file path
    const current = await runMpc('current --format "%file%"');

    if (!current || current.includes('volume:')) {
      console.log('[Album Art] No track currently playing');
      return res.status(404).json({ error: 'No track currently playing' });
    }

    console.log('[Album Art] Fetching art for:', current);

    const { exec } = require('child_process');
    const fs = require('fs');
    const path = require('path');

    // First, try the albumart command (MPD 0.21+)
    const escapedPath = current.replace(/"/g, '\\"').replace(/'/g, "\\'");

    // MPD albumart returns data in chunks, need to fetch all chunks
    const chunkSize = 8192; // MPD typically uses 8KB chunks

    // Promisify the exec callback to properly handle async recursion
    const fetchChunk = (currentOffset) => {
      return new Promise((resolve, reject) => {
        exec(`printf 'albumart "%s" ${currentOffset}\\nclose\\n' "${escapedPath}" | nc -w 2 localhost 6600`, {
          encoding: null,
          maxBuffer: 10 * 1024 * 1024
        }, (error, stdout) => {
          if (error) {
            console.error('[Album Art] albumart command error:', error.message);
            return reject(new Error('albumart_failed'));
          }

          const responseStr = stdout.toString('utf8', 0, 200);

          if (responseStr.includes('ACK')) {
            // If this is the first chunk and we got an error, fall back
            if (currentOffset === 0) {
              console.error('[Album Art] MPD albumart error:', responseStr.split('\n')[0]);
              return reject(new Error('albumart_failed'));
            }
            // Otherwise, we're done collecting chunks (no more data)
            return resolve(null);
          }

          const binaryMatch = responseStr.match(/binary: (\d+)/);
          if (binaryMatch) {
            const size = parseInt(binaryMatch[1]);
            console.log(`[Album Art] Chunk at offset ${currentOffset}, size: ${size} bytes`);

            const headerStr = stdout.toString('utf8', 0, 1000);
            const binaryIndex = headerStr.indexOf('binary:');
            const newlineAfterBinary = headerStr.indexOf('\n', binaryIndex);
            const dataStart = newlineAfterBinary + 1;

            const chunkData = stdout.subarray(dataStart, dataStart + size);

            // Return chunk data and whether there are more chunks
            return resolve({
              data: chunkData,
              hasMore: size === chunkSize
            });
          }

          console.log('[Album Art] No binary data found in albumart response');
          return reject(new Error('albumart_failed'));
        });
      });
    };

    // Fetch all chunks recursively with proper async/await
    const fetchAllChunks = async () => {
      const chunks = [];
      let offset = 0;

      while (true) {
        try {
          const result = await fetchChunk(offset);

          if (result === null) {
            // No more chunks
            break;
          }

          chunks.push(result.data);

          if (!result.hasMore) {
            // Last chunk received
            break;
          }

          offset += chunkSize;
        } catch (err) {
          throw err;
        }
      }

      return chunks;
    };

    // Try to fetch album art via albumart command
    try {
      const chunks = await fetchAllChunks();

      if (chunks.length > 0) {
        const imageData = Buffer.concat(chunks);
        console.log(`[Album Art] Complete image collected, ${chunks.length} chunks, total size: ${imageData.length} bytes`);

        let contentType = 'image/jpeg';
        if (imageData[0] === 0x89 && imageData[1] === 0x50) {
          contentType = 'image/png';
        } else if (imageData[0] === 0xFF && imageData[1] === 0xD8) {
          contentType = 'image/jpeg';
        } else if (imageData[0] === 0x47 && imageData[1] === 0x49) {
          contentType = 'image/gif';
        }

        console.log('[Album Art] Sending complete image, type:', contentType);
        res.set('Content-Type', contentType);
        res.set('Cache-Control', 'public, max-age=60');
        return res.send(imageData);
      }
    } catch (err) {
      // Fall through to tryReadpicture
      console.log('[Album Art] albumart method failed, trying fallbacks');
    }

    // Fallback: Try readpicture command (MPD 0.22+)
    tryReadpicture();

    function tryReadpicture() {
      console.log('[Album Art] Trying readpicture...');
      exec(`printf 'readpicture "%s" 0\\nclose\\n' "${escapedPath}" | nc -w 2 localhost 6600`, {
        encoding: null, // Get raw buffer
        maxBuffer: 10 * 1024 * 1024
      }, async (error, stdout) => {
        if (error) {
          console.error('[Album Art] readpicture error:', error.message);
          return tryFileSystemSearch();
        }

        // Parse MPD protocol response - work with raw buffer
        const responseStr = stdout.toString('utf8', 0, 200);

        if (responseStr.includes('ACK')) {
          console.error('[Album Art] MPD readpicture error:', responseStr.split('\n')[0]);
          return tryFileSystemSearch();
        }

        const binaryMatch = responseStr.match(/binary: (\d+)/);
        if (binaryMatch) {
          const size = parseInt(binaryMatch[1]);
          console.log('[Album Art] Found image via readpicture, size:', size, 'bytes');

          // Find where the binary data starts in the buffer
          const headerStr = stdout.toString('utf8', 0, 1000);
          const binaryIndex = headerStr.indexOf('binary:');
          const newlineAfterBinary = headerStr.indexOf('\n', binaryIndex);
          const dataStart = newlineAfterBinary + 1;

          // Extract just the image data
          const imageData = stdout.subarray(dataStart, dataStart + size);

          let contentType = 'image/jpeg';
          if (imageData[0] === 0x89 && imageData[1] === 0x50) {
            contentType = 'image/png';
          } else if (imageData[0] === 0xFF && imageData[1] === 0xD8) {
            contentType = 'image/jpeg';
          } else if (imageData[0] === 0x47 && imageData[1] === 0x49) {
            contentType = 'image/gif';
          }

          console.log('[Album Art] Sending image, type:', contentType, 'actual size:', imageData.length);
          res.set('Content-Type', contentType);
          res.set('Cache-Control', 'public, max-age=60');
          return res.send(imageData);
        }

        console.log('[Album Art] No binary data found in readpicture response');
        return tryFileSystemSearch();
      });
    }

    // Last fallback: Look for cover.jpg/cover.png in the same directory
    function tryFileSystemSearch() {
      console.log('[Album Art] Trying filesystem search...');

      // Get MPD music directory from environment or default
      const musicDir = process.env.MPD_MUSIC_DIR || '/var/lib/mpd/music';
      const trackDir = path.dirname(path.join(musicDir, current));

      console.log('[Album Art] Searching in:', trackDir);

      const coverNames = ['cover.jpg', 'Cover.jpg', 'cover.png', 'Cover.png', 'folder.jpg', 'Folder.jpg', 'album.jpg', 'Album.jpg'];

      for (const coverName of coverNames) {
        const coverPath = path.join(trackDir, coverName);
        if (fs.existsSync(coverPath)) {
          console.log('[Album Art] Found cover file:', coverPath);

          const ext = path.extname(coverPath).toLowerCase();
          const contentType = ext === '.png' ? 'image/png' : 'image/jpeg';

          res.set('Content-Type', contentType);
          res.set('Cache-Control', 'public, max-age=60');
          return res.sendFile(coverPath);
        }
      }

      console.log('[Album Art] No album art found via any method');
      res.status(404).json({ error: 'Album art not found for track' });
    }

  } catch (error) {
    console.error('[Album Art] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'mashuppi-api' });
});

// Start HTTP server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎵 mashuppi API running on port ${PORT}`);
});

// WebSocket for real-time updates
const wss = new WebSocket.Server({ server });

let lastTrack = null;

// Poll MPD every 2 seconds and broadcast changes
setInterval(async () => {
  try {
    const current = await runMpc('current');
    const track = await parseCurrentTrack(current);

    if (track && JSON.stringify(track) !== JSON.stringify(lastTrack)) {
      lastTrack = track;

      // Get status info
      const status = await runMpc('status');
      const statusInfo = parseStatus(status);

      // Get next track
      let nextTrack = null;
      try {
        const queued = await runMpc('queued');
        if (queued) {
          nextTrack = await parseCurrentTrack(queued);
        }
      } catch (error) {
        // No next track
      }

      // Get Icecast listener stats
      const icecastStats = await getIcecastStats();

      // Broadcast to all connected clients
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'track_change',
            track,
            isPlaying: statusInfo.isPlaying,
            position: statusInfo.position,
            queueLength: statusInfo.queueLength,
            nextTrack,
            listeners: icecastStats.listeners,
            peakListeners: icecastStats.peakListeners,
            timestamp: new Date().toISOString()
          }));
        }
      });

      const albumInfo = track.album ? ` (${track.album})` : '';
      console.log(`🎵 Now playing: ${track.artist} - ${track.title}${albumInfo}`);
    }
  } catch (error) {
    console.error('Error polling MPD:', error.message);
  }
}, 2000);

wss.on('connection', (ws) => {
  console.log('📡 WebSocket client connected');

  // Send current track immediately on connect
  Promise.all([
    runMpc('current'),
    runMpc('status'),
    runMpc('queued').catch(() => null),
    getIcecastStats()
  ]).then(async ([current, status, queued, icecastStats]) => {
    const track = await parseCurrentTrack(current);
    const statusInfo = parseStatus(status);
    const nextTrack = queued ? await parseCurrentTrack(queued) : null;

    if (track) {
      ws.send(JSON.stringify({
        type: 'track_change',
        track,
        isPlaying: statusInfo.isPlaying,
        position: statusInfo.position,
        queueLength: statusInfo.queueLength,
        nextTrack,
        listeners: icecastStats.listeners,
        peakListeners: icecastStats.peakListeners,
        timestamp: new Date().toISOString()
      }));
    }
  });

  ws.on('close', () => {
    console.log('📡 WebSocket client disconnected');
  });
});

console.log('📡 WebSocket server ready for connections');
