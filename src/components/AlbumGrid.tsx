import type { Album } from '../services/api';

interface AlbumGridProps {
  albums: Album[];
  loading: boolean;
  onAlbumClick: (albumId: string) => void;
}

export default function AlbumGrid({ albums, loading, onAlbumClick }: AlbumGridProps) {
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#fff',
          fontSize: '18px'
        }}>
          Loading albums...
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      padding: '100px 20px 40px 20px'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        border: '1px solid #1a1a1a'
      }}>
        {/* Window Chrome */}
        <div style={{
          background: 'linear-gradient(180deg, #4a4a4a 0%, #3a3a3a 100%)',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #2a2a2a',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #4ecdc4 0%, #44a7a0 100%)',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 'bold',
              color: 'white',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
            }}>
              A
            </div>
            <span style={{
              color: '#fff',
              fontSize: '13px',
              fontWeight: '600',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
            }}>
              album collection
            </span>
          </div>
          <div style={{
            display: 'flex',
            gap: '4px'
          }}>
            {['−', '□', '×'].map((symbol, i) => (
              <button
                key={i}
                style={{
                  width: '24px',
                  height: '24px',
                  background: 'linear-gradient(180deg, #5a5a5a 0%, #4a4a4a 100%)',
                  border: '1px solid #2a2a2a',
                  borderRadius: '3px',
                  color: '#ccc',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                  transition: 'all 0.1s'
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.boxShadow = 'inset 0 1px 3px rgba(0, 0, 0, 0.5)';
                  e.currentTarget.style.transform = 'translateY(1px)';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {symbol}
              </button>
            ))}
          </div>
        </div>

        {/* Window Body */}
        <div style={{ padding: '32px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '20px'
        }}>
      {albums.map(album => (
        <div
          key={album.id}
          onClick={() => onAlbumClick(album.id)}
          style={{
            background: '#2a2a2a',
            borderRadius: '8px',
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
            border: '1px solid #3a3a3a'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {/* Album Artwork */}
          <div style={{ paddingBottom: '100%', position: 'relative', background: '#1a1a1a' }}>
            {album.artwork_url ? (
              <img
                src={album.artwork_url}
                alt={album.title}
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#666',
                fontSize: '48px'
              }}>
                🎵
              </div>
            )}
          </div>

          {/* Album Info */}
          <div style={{ padding: '12px' }}>
            <div style={{
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '14px',
              marginBottom: '4px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {album.title}
            </div>
            <div style={{
              color: '#999',
              fontSize: '12px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {album.artist}
            </div>
            <div style={{
              color: '#666',
              fontSize: '11px',
              marginTop: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>{album.track_count} tracks</span>
              {album.play_count > 0 && (
                <span style={{
                  color: '#4ecdc4',
                  fontWeight: 'bold'
                }}>
                  {album.play_count} plays
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
        </div>
        </div>
      </div>
    </div>
  );
}
