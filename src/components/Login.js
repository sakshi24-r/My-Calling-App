// src/components/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import '../styles/App.css';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setIsLoading(true);
        
        try {
            console.log('Attempting login...');
            const response = await loginUser(username, password);
            console.log('Login response:', response);
            
            if (response.access_token) {
                console.log('Login successful, saving token...');
                // Save token and username
                localStorage.setItem('token', response.access_token);
                localStorage.setItem('username', username);
                console.log('Navigating to /chat...');
                navigate('/chat');
            } else {
                console.log('No access token in response');
                setError('Invalid credentials. Please try again or create a new account.');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError(error.message || 'Invalid credentials. Please try again or create a new account.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <h1>Welcome to My Calling App</h1>
            <form onSubmit={handleSubmit} className="login-form">
                {error && <div className="error-message">{error}</div>}
                <div className="form-group">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Logging in...' : 'Login'}
                </button>
                <p className="form-footer">
                    Don't have an account? <a href="/signup">Sign Up</a>
                </p>
                <div className="test-accounts">
                    <p>Test Accounts:</p>
                    <p>Username: user1, Password: password1</p>
                    <p>Username: user2, Password: password2</p>
                </div>
            </form>
        </div>
    );
}

export default Login;