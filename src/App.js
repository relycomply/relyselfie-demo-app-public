import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useTheme } from './context/ThemeContext';
import { useEffect } from 'react';
import './App.css';
import Welcome from './pages/Welcome';
import Instructions from './pages/Instructions';
import CameraCapture from './pages/CameraCapture';
import Success from './pages/Success';
import { ColorProvider } from './context/ColorContext';
import { ThemeProvider } from './context/ThemeContext';

function AppContent() {
  const { isDarkMode } = useTheme();

  useEffect(() => {
    document.body.classList.toggle('dark-mode', isDarkMode);
  }, [isDarkMode]);

  return (
    <ColorProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/instructions" element={<Instructions />} />
            <Route path="/camera" element={<CameraCapture />} />
            <Route path="/success" element={<Success />} />
          </Routes>
        </div>
      </Router>
    </ColorProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
