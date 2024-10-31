import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Corrected to named import
import '../styles/Login.css'; // Your CSS file
import { GoogleLogin } from '@react-oauth/google';

const LoginForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSuccess = (res) => {
    try {
      // Decode the JWT token to extract user information
      const decoded = jwtDecode(res.credential);

      // Log the decoded token to see its structure
      console.log("Decoded JWT: ", decoded);

      // Check if the decoded object contains the email property
      if (decoded && decoded.email) {
        const email = decoded.email;

        // Check if the email ends with @mabinicolleges.edu.ph
        if (email.endsWith('@mabinicolleges.edu.ph')) {
          Swal.fire({
            icon: 'success',
            title: 'Login Successful!',
            text: `Welcome, ${decoded.name}!`, // Use decoded name
          });
          navigate('/dashboard');
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Login Failed',
            text: 'Only @mabinicolleges.edu.ph email addresses are allowed.',
          });
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: 'Email not found in the token. Please try again.',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error Decoding Token',
        text: 'There was an error decoding the token. Please try again.',
      });
      console.error("Token decoding error:", error);
    }
  };

  const onFailure = (res) => {
    console.log("LOGIN Failure: ", res);
    Swal.fire({
      icon: 'error',
      title: 'Login Failed',
      text: 'Google login failed. Please try again.',
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://backend-j2o4.onrender.com/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error(await response.json().message);
      }

      const data = await response.json();
      setLoading(false);
      Swal.fire({
        icon: 'success',
        title: 'Login Successful!',
        text: `Welcome back, ${data.user.name}!`,
      });

      navigate('/dashboard');
    } catch (err) {
      setLoading(false);
      setError(err.message);
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: err.message,
      });
    }
  };

  return (
    <div className="login-page">
      <div className="wrapper">
        <form onSubmit={handleSubmit}>
          <h2>Login</h2>
          {error && <p className="login-error">{error}</p>}
          <div className="input-field">
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label>Enter your  School Email</label>
          </div>
          <div className="input-field">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label>Enter your password</label>
          </div>
          <div id="sigInButton">
            <GoogleLogin
              onSuccess={onSuccess}
              onError={onFailure}
            />
          </div>
          <div className="forget">
            {/* You can add a "Forget password?" link here */}
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Log In'}
          </button>
          {loading && <p className="loading-text">Please wait...</p>}
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
