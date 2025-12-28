import { useState, useEffect } from 'react';
import { api } from '../services/api';
import AlbumGrid from '../components/AlbumGrid';
import AlbumPlayer from '../components/AlbumPlayer';
import ExperienceToggle from '../components/ExperienceToggle';
import type { Album, AlbumDetails } from '../services/api';

export function AlbumExperience() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAlbums().then(data => {
      setAlbums(data.albums);
      setLoading(false);
    });
  }, []);

  const handleAlbumSelect = async (albumId: string) => {
    const albumDetails = await api.getAlbumDetails(albumId);
    setSelectedAlbum(albumDetails);
  };

  const handleBack = () => {
    setSelectedAlbum(null);
  };

  return (
    <div>
      <ExperienceToggle />

      {selectedAlbum ? (
        <AlbumPlayer
          albumId={selectedAlbum.id}
          albumTitle={selectedAlbum.title}
          albumArtist={selectedAlbum.artist}
          albumArtwork={selectedAlbum.artworkUrl}
          tracks={selectedAlbum.tracks}
          onBack={handleBack}
        />
      ) : (
        <AlbumGrid
          albums={albums}
          loading={loading}
          onAlbumClick={handleAlbumSelect}
        />
      )}
    </div>
  );
}
