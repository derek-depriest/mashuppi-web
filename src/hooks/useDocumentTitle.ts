import { useEffect } from 'react';

const DEFAULT_TITLE = 'mashuppi - Broadcasting the Golden Age of Mashups';

interface UseDocumentTitleOptions {
  artist?: string | null;
  title?: string | null;
  isPlaying: boolean;
  prefix?: string;
}

export function useDocumentTitle({
  artist,
  title,
  isPlaying,
  prefix
}: UseDocumentTitleOptions) {
  useEffect(() => {
    if (isPlaying && artist && title) {
      // Format: "🎵 Artist - Title | mashuppi" or with custom prefix
      const playingTitle = prefix
        ? `${prefix} ${artist} - ${title} | mashuppi`
        : `🎵 ${artist} - ${title} | mashuppi`;
      document.title = playingTitle;
    } else {
      // Reset to default when paused or no track info
      document.title = DEFAULT_TITLE;
    }

    // Cleanup: reset title when component unmounts
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [artist, title, isPlaying, prefix]);
}
