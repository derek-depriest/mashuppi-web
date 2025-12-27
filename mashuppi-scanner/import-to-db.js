#!/usr/bin/env node

/**
 * Pi-side import script
 * Reads metadata.json and populates SQLite database
 * 
 * Usage: node import-to-db.js --input ./library-data/metadata.json --db ./mashuppi.db
 */

const fs = require('fs').promises;
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { program } = require('commander');

program
  .name('import-to-db')
  .description('Import mashuppi metadata into SQLite database')
  .requiredOption('-i, --input <path>', 'Path to metadata.json')
  .requiredOption('-d, --db <path>', 'Path to SQLite database file')
  .option('--fresh', 'Drop and recreate all tables', false)
  .parse();

const options = program.opts();

/**
 * Database schema
 */
const SCHEMA = `
-- Artists table
CREATE TABLE IF NOT EXISTS artists (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_artists_name ON artists(name);

-- Albums table
CREATE TABLE IF NOT EXISTS albums (
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

CREATE INDEX IF NOT EXISTS idx_albums_artist ON albums(artist_id);
CREATE INDEX IF NOT EXISTS idx_albums_title ON albums(title);

-- Tracks table
CREATE TABLE IF NOT EXISTS tracks (
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

CREATE INDEX IF NOT EXISTS idx_tracks_album ON tracks(album_id);
CREATE INDEX IF NOT EXISTS idx_tracks_artist ON tracks(artist_id);
CREATE INDEX IF NOT EXISTS idx_tracks_file_path ON tracks(file_path);

-- Playback history table (for detailed analytics)
CREATE TABLE IF NOT EXISTS playback_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  track_id TEXT NOT NULL,
  played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (track_id) REFERENCES tracks(id)
);

CREATE INDEX IF NOT EXISTS idx_playback_track ON playback_history(track_id);
CREATE INDEX IF NOT EXISTS idx_playback_date ON playback_history(played_at);

-- Metadata table (for storing scan info)
CREATE TABLE IF NOT EXISTS metadata (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

/**
 * Open database connection
 */
function openDatabase(dbPath) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) reject(err);
      else {
        db.run('PRAGMA foreign_keys = ON');
        resolve(db);
      }
    });
  });
}

/**
 * Run a database query
 */
function runQuery(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

/**
 * Initialize database schema
 */
async function initializeSchema(db, fresh = false) {
  if (fresh) {
    console.log('Dropping existing tables...');
    await runQuery(db, 'DROP TABLE IF EXISTS playback_history');
    await runQuery(db, 'DROP TABLE IF EXISTS tracks');
    await runQuery(db, 'DROP TABLE IF EXISTS albums');
    await runQuery(db, 'DROP TABLE IF EXISTS artists');
    await runQuery(db, 'DROP TABLE IF EXISTS metadata');
  }
  
  console.log('Creating schema...');
  const statements = SCHEMA.split(';').filter(s => s.trim());
  
  for (const statement of statements) {
    await runQuery(db, statement);
  }
}

/**
 * Import artists
 */
async function importArtists(db, artists) {
  console.log(`Importing ${artists.length} artists...`);
  
  const stmt = await new Promise((resolve, reject) => {
    const s = db.prepare(
      'INSERT OR REPLACE INTO artists (id, name) VALUES (?, ?)',
      (err) => err ? reject(err) : resolve(s)
    );
  });
  
  for (const artist of artists) {
    await new Promise((resolve, reject) => {
      stmt.run([artist.id, artist.name], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
  
  await new Promise((resolve, reject) => {
    stmt.finalize((err) => err ? reject(err) : resolve());
  });
}

/**
 * Import albums
 */
async function importAlbums(db, albums) {
  console.log(`Importing ${albums.length} albums...`);
  
  const stmt = await new Promise((resolve, reject) => {
    const s = db.prepare(
      `INSERT OR REPLACE INTO albums 
       (id, title, artist, artist_id, year, artwork_url, track_count) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      (err) => err ? reject(err) : resolve(s)
    );
  });
  
  for (const album of albums) {
    await new Promise((resolve, reject) => {
      stmt.run([
        album.id,
        album.title,
        album.artist,
        album.artistId,
        album.year,
        album.artworkUrl,
        album.trackCount
      ], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
  
  await new Promise((resolve, reject) => {
    stmt.finalize((err) => err ? reject(err) : resolve());
  });
}

/**
 * Import tracks
 */
async function importTracks(db, tracks) {
  console.log(`Importing ${tracks.length} tracks...`);
  
  const stmt = await new Promise((resolve, reject) => {
    const s = db.prepare(
      `INSERT OR REPLACE INTO tracks 
       (id, title, artist, album, album_id, artist_id, track_number, duration, file_path, year) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      (err) => err ? reject(err) : resolve(s)
    );
  });
  
  let count = 0;
  for (const track of tracks) {
    await new Promise((resolve, reject) => {
      stmt.run([
        track.id,
        track.title,
        track.artist,
        track.album,
        track.albumId,
        track.artistId,
        track.trackNumber,
        track.duration,
        track.filePath,
        track.year
      ], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    count++;
    if (count % 100 === 0) {
      process.stdout.write(`\rImported ${count}/${tracks.length} tracks...`);
    }
  }
  
  console.log(`\rImported ${tracks.length}/${tracks.length} tracks`);
  
  await new Promise((resolve, reject) => {
    stmt.finalize((err) => err ? reject(err) : resolve());
  });
}

/**
 * Update metadata table
 */
async function updateMetadata(db, metadata) {
  await runQuery(db, 
    'INSERT OR REPLACE INTO metadata (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
    ['last_scan', metadata.scannedAt]
  );
  
  await runQuery(db,
    'INSERT OR REPLACE INTO metadata (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
    ['total_tracks', metadata.stats.totalTracks.toString()]
  );
  
  await runQuery(db,
    'INSERT OR REPLACE INTO metadata (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
    ['total_albums', metadata.stats.totalAlbums.toString()]
  );
  
  await runQuery(db,
    'INSERT OR REPLACE INTO metadata (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
    ['total_artists', metadata.stats.totalArtists.toString()]
  );
}

/**
 * Main execution
 */
async function main() {
  console.log('🎵 mashuppi database import\n');
  
  // Read metadata file
  console.log(`Reading ${options.input}...`);
  const metadataJson = await fs.readFile(options.input, 'utf8');
  const metadata = JSON.parse(metadataJson);
  
  console.log(`Found: ${metadata.stats.totalArtists} artists, ${metadata.stats.totalAlbums} albums, ${metadata.stats.totalTracks} tracks\n`);
  
  // Open database
  console.log(`Opening database ${options.db}...`);
  const db = await openDatabase(options.db);
  
  try {
    // Initialize schema
    await initializeSchema(db, options.fresh);
    
    // Import data
    await importArtists(db, metadata.artists);
    await importAlbums(db, metadata.albums);
    await importTracks(db, metadata.tracks);
    await updateMetadata(db, metadata);
    
    console.log('\n✓ Import complete!\n');
    console.log('Database ready at:', options.db);
    
  } finally {
    db.close();
  }
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
