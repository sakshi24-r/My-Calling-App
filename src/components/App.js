// src/components/App.js
import React, { useState } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Chat from './Chat';
import VideoCall from './VideoCall';
import Login from './Login';
import SignUp from './SignUp';
import ErrorBoundary from './ErrorBoundary';
import Toast from './Toast';
import ProtectedRoute from './ProtectedRoute';
import '../styles/App.css';

function App() {
    const [error, setError] = useState(null);

    const handleError = (errorMessage) => {
        setError(errorMessage);
        setTimeout(() => setError(null), 5000);
    };

    return (
        <ErrorBoundary>
            <div className="container">
                {error && (
                    <Toast 
                        message={error} 
                        type="error" 
                        onClose={() => setError(null)} 
                    />
                )}
                <header>
                    <h1>My Calling App</h1>
                </header>
                <Routes>
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route 
                        path="/chat" 
                        element={
                            <ProtectedRoute>
                                <Chat onError={handleError} />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/video-call" 
                        element={
                            <ProtectedRoute>
                                <VideoCall onError={handleError} />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/login" 
                        element={<Login onError={handleError} />} 
                    />
                    <Route 
                        path="/signup" 
                        element={<SignUp onError={handleError} />} 
                    />
                </Routes>
                <footer>
                    <p>&copy; 2025 My Calling App</p>
                </footer>
            </div>
        </ErrorBoundary>
    );
}

export default App;