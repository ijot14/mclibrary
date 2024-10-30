import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google'; // Import GoogleOAuthProvider
import Login from './components/Login';
import MainDashboard from './components/dashboad'; // Ensure dashboard path is correct
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';


const clientId = "242618908381-3ruor4lnnnmjlhq457n09nldn51qmnm7.apps.googleusercontent.com"; // Your Google client ID

function App() {
  return (
    <GoogleOAuthProvider clientId={clientId}> {/* Wrap your Router with GoogleOAuthProvider */}
      <Router>
        <Routes>
          <Route path="/" element={<Login />} /> {/* Home redirects to Login */}
          <Route path="/login" element={<Login />} /> {/* Explicit login route */}
          <Route path="/dashboard" element={<MainDashboard />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
