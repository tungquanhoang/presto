import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen';
import PresentationEditPage from './components/PresentationEditPage';
import Dashboard from './components/Dashboard';
import PresentationPreviewPage from './components/PresentationPreviewPage';

function App () {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Navigate to='/login' />} />
        <Route exact path='/login' element={<LoginScreen />} />
        <Route exact path='/register' element={<RegisterScreen />} />
        <Route exact path='/dashboard' element={<Dashboard />} />
        <Route path='/presentation/:id/edit' element={<PresentationEditPage />} />
        <Route path='/presentation/:id/preview' element={<PresentationPreviewPage />} />
      </Routes>
    </Router>
  );
}

export default App;
