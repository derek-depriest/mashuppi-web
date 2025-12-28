import MashuppiPlayer from '../components/MashuppiPlayer';
import ExperienceToggle from '../components/ExperienceToggle';

export function LiveExperience() {
  return (
    <div style={{ position: 'relative' }}>
      <ExperienceToggle />
      <MashuppiPlayer />
    </div>
  );
}
