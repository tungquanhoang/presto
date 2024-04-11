import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginScreen from './components/LoginScreen';

function App () {
  return (
    <Router>
      <Routes>
        <Route exact path="/login" element={<LoginScreen />} />
      </Routes>
    </Router>
  );
}

export default App;
