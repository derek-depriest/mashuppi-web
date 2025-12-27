#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { parseFile } = require('music-metadata');
const { program } = require('commander');
const chalk = require('chalk');

// Configure CLI
program
  .name('mashuppi-scanner')
  .description('Scan music library and extract metadata for mashuppi')
  .requiredOption('-m, --music-dir <path>', 'Path to music directory')
  .requiredOption('-o, --output <path>', 'Output directory for metadata and artwork')
  .option('-v, --verbose', 'Verbose logging', false)
  .parse();

const options = program.opts();

// Stats tracking
const stats = {
  totalFiles: 0,
  processed: 0,
  errors: 0,
  albums: new Map(),
  artists: new Map(),
  tracks: []
};

/**
 * Hash function for generating consistent IDs
 */
function hashString(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}

/**
 * Recursively find all MP3 files in directory
 */
async function findMP3Files(dir) {
  const files = [];
  
  async function walk(currentDir) {
    try {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        
        if (entry.isDirectory()) {
          await walk(fullPath);
        } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.mp3')) {
          files.push(fullPath);
        }
      }
    } catch (err) {
      console.error(chalk.red(`Error reading directory ${currentDir}:`, err.message));
    }
  }
  
  await walk(dir);
  return files;
}

/**
 * Extract album art and save to output directory
 */
async function extractAlbumArt(metadata, albumId, outputDir) {
  const artDir = path.join(outputDir, 'album-art');
  await fs.mkdir(artDir, { recursive: true });
  
  const artPath = path.join(artDir, `${albumId}.jpg`);
  
  // Check if already extracted
  try {
    await fs.access(artPath);
    return `/album-art/${albumId}.jpg`;
  } catch {
    // Doesn't exist, extract it
  }
  
  if (metadata.common.picture && metadata.common.picture.length > 0) {
    const picture = metadata.common.picture[0];
    await fs.writeFile(artPath, picture.data);
    return `/album-art/${albumId}.jpg`;
  }
  
  return null;
}

/**
 * Process a single MP3 file
 */
async function processMP3(filePath, musicDir, outputDir) {
  try {
    const metadata = await parseFile(filePath);
    const relativePath = path.relative(musicDir, filePath).replace(/\\/g, '/');
    
    // Extract basic metadata
    const title = metadata.common.title || path.basename(filePath, '.mp3');
    const artist = metadata.common.artist || 'Unknown Artist';
    const album = metadata.common.album || 'Unknown Album';
    const albumArtist = metadata.common.albumartist || artist;
    const year = metadata.common.year || null;
    const trackNumber = metadata.common.track?.no || null;
    const duration = metadata.format.duration || 0;
    
    // Generate IDs
    const artistId = hashString(albumArtist.toLowerCase());
    const albumId = hashString(`${albumArtist.toLowerCase()}-${album.toLowerCase()}`);
    const trackId = hashString(relativePath);
    
    // Extract album art (only once per album)
    let artworkUrl = null;
    if (!stats.albums.has(albumId)) {
      artworkUrl = await extractAlbumArt(metadata, albumId, outputDir);
    } else {
      artworkUrl = stats.albums.get(albumId).artworkUrl;
    }
    
    // Update stats
    if (!stats.artists.has(artistId)) {
      stats.artists.set(artistId, {
        id: artistId,
        name: albumArtist
      });
    }
    
    if (!stats.albums.has(albumId)) {
      stats.albums.set(albumId, {
        id: albumId,
        title: album,
        artist: albumArtist,
        artistId: artistId,
        year: year,
        artworkUrl: artworkUrl,
        trackCount: 0
      });
    }
    
    const albumData = stats.albums.get(albumId);
    albumData.trackCount++;
    
    // Add track
    stats.tracks.push({
      id: trackId,
      title: title,
      artist: artist,
      album: album,
      albumId: albumId,
      artistId: artistId,
      trackNumber: trackNumber,
      duration: Math.round(duration),
      filePath: relativePath,
      year: year
    });
    
    stats.processed++;
    
    if (options.verbose) {
      console.log(chalk.green(`✓ ${artist} - ${title}`));
    } else if (stats.processed % 10 === 0) {
      process.stdout.write(`\rProcessed: ${stats.processed}/${stats.totalFiles}`);
    }
    
  } catch (err) {
    stats.errors++;
    console.error(chalk.red(`\n✗ Error processing ${filePath}:`), err.message);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log(chalk.cyan('🎵 mashuppi music library scanner\n'));
  
  // Validate input directory
  try {
    await fs.access(options.musicDir);
  } catch {
    console.error(chalk.red(`Error: Music directory not found: ${options.musicDir}`));
    process.exit(1);
  }
  
  // Create output directory
  await fs.mkdir(options.output, { recursive: true });
  
  console.log(chalk.blue('Scanning for MP3 files...'));
  const mp3Files = await findMP3Files(options.musicDir);
  stats.totalFiles = mp3Files.length;
  
  console.log(chalk.blue(`Found ${stats.totalFiles} MP3 files\n`));
  
  if (stats.totalFiles === 0) {
    console.log(chalk.yellow('No MP3 files found. Exiting.'));
    return;
  }
  
  console.log(chalk.blue('Extracting metadata...'));
  
  // Process all files
  for (const filePath of mp3Files) {
    await processMP3(filePath, options.musicDir, options.output);
  }
  
  console.log('\n\n' + chalk.blue('Generating output files...'));
  
  // Convert Maps to arrays
  const output = {
    scannedAt: new Date().toISOString(),
    stats: {
      totalTracks: stats.tracks.length,
      totalAlbums: stats.albums.size,
      totalArtists: stats.artists.size,
      errors: stats.errors
    },
    artists: Array.from(stats.artists.values()).sort((a, b) => a.name.localeCompare(b.name)),
    albums: Array.from(stats.albums.values()).sort((a, b) => a.title.localeCompare(b.title)),
    tracks: stats.tracks.sort((a, b) => {
      // Sort by album, then track number
      if (a.albumId !== b.albumId) {
        return a.album.localeCompare(b.album);
      }
      return (a.trackNumber || 999) - (b.trackNumber || 999);
    })
  };
  
  // Write metadata.json
  const metadataPath = path.join(options.output, 'metadata.json');
  await fs.writeFile(metadataPath, JSON.stringify(output, null, 2));
  
  // Print summary
  console.log('\n' + chalk.green('✓ Scan complete!\n'));
  console.log(chalk.white('Summary:'));
  console.log(`  Artists:  ${chalk.cyan(stats.artists.size)}`);
  console.log(`  Albums:   ${chalk.cyan(stats.albums.size)}`);
  console.log(`  Tracks:   ${chalk.cyan(stats.tracks.length)}`);
  console.log(`  Errors:   ${stats.errors > 0 ? chalk.red(stats.errors) : chalk.green(stats.errors)}`);
  console.log('\n' + chalk.white('Output:'));
  console.log(`  Metadata: ${chalk.cyan(metadataPath)}`);
  console.log(`  Artwork:  ${chalk.cyan(path.join(options.output, 'album-art'))}`);
  console.log('\n' + chalk.blue('Ready to deploy to your Pi!'));
}

main().catch(err => {
  console.error(chalk.red('Fatal error:'), err);
  process.exit(1);
});
