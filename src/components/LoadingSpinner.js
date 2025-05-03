import React from 'react';
import '../styles/App.css';

const LoadingSpinner = ({ message = 'Loading...' }) => {
    return (
        <div className="loading-spinner-container">
            <div className="loading-spinner"></div>
            <p className="loading-message">{message}</p>
        </div>
    );
};

export default LoadingSpinner; 