import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MashuppiPlayer from './components/MashuppiPlayer';
import { StatsPage } from './pages/StatsPage';
import { AboutPage } from './pages/AboutPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MashuppiPlayer />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;