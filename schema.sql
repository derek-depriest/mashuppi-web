CREATE TABLE artists (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_artists_name ON artists(name);
CREATE TABLE albums (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  artist_id TEXT NOT NULL,
  year INTEGER,
  artwork_url TEXT,
  track_count INTEGER DEFAULT 0,
  play_count INTEGER DEFAULT 0,
  last_played DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (artist_id) REFERENCES artists(id)
);
CREATE INDEX idx_albums_artist ON albums(artist_id);
CREATE INDEX idx_albums_title ON albums(title);
CREATE TABLE tracks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  album TEXT NOT NULL,
  album_id TEXT NOT NULL,
  artist_id TEXT NOT NULL,
  track_number INTEGER,
  duration INTEGER NOT NULL,
  file_path TEXT NOT NULL UNIQUE,
  year INTEGER,
  play_count INTEGER DEFAULT 0,
  last_played DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (album_id) REFERENCES albums(id),
  FOREIGN KEY (artist_id) REFERENCES artists(id)
);
CREATE INDEX idx_tracks_album ON tracks(album_id);
CREATE INDEX idx_tracks_artist ON tracks(artist_id);
CREATE INDEX idx_tracks_file_path ON tracks(file_path);
CREATE TABLE playback_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  track_id TEXT NOT NULL,
  played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (track_id) REFERENCES tracks(id)
);
CREATE TABLE sqlite_sequence(name,seq);
CREATE INDEX idx_playback_track ON playback_history(track_id);
CREATE INDEX idx_playback_date ON playback_history(played_at);
CREATE TABLE metadata (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
