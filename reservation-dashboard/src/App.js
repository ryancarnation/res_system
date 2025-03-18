import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Reservations from './pages/Reservations';
import Properties from './pages/Properties';
import Reports from './pages/Reports';

import { SnackbarProvider } from 'notistack';

function App() {
  return (
    <SnackbarProvider maxSnack={3}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/reservations" element={<Reservations />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </Router>
    </SnackbarProvider>
  );
}

export default App;
