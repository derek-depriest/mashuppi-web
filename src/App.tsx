import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ExperienceProvider, useExperience } from './contexts/ExperienceContext';
import { LiveExperience } from './pages/LiveExperience';
import { AlbumExperience } from './pages/AlbumExperience';
import { StatsPage } from './pages/StatsPage';
import { AboutPage } from './pages/AboutPage';
import './App.css';

function ExperienceRouter() {
  const { isLive } = useExperience();
  return isLive ? <LiveExperience /> : <AlbumExperience />;
}

function App() {
  return (
    <ExperienceProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ExperienceRouter />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </BrowserRouter>
    </ExperienceProvider>
  );
}

export default App;