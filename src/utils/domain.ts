export type ExperienceMode = 'live' | 'album';

export function detectExperienceMode(): ExperienceMode {
  if (typeof window === 'undefined') return 'live';

  const hostname = window.location.hostname;

  if (hostname.includes('mashuppi.com')) return 'album';
  if (hostname.includes('mashuppi.live')) return 'live';

  // Development fallback - check URL param ?mode=album or ?mode=live
  const params = new URLSearchParams(window.location.search);
  const modeParam = params.get('mode');
  if (modeParam === 'album' || modeParam === 'live') {
    return modeParam as ExperienceMode;
  }

  return 'live';
}
