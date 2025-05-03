import React from 'react';
import '../styles/App.css';

const ConnectionStatus = ({ status, quality }) => {
    const getStatusColor = () => {
        switch (status) {
            case 'connected':
                return '#4CAF50';
            case 'connecting':
                return '#FFC107';
            case 'disconnected':
                return '#F44336';
            default:
                return '#9E9E9E';
        }
    };

    const getQualityIndicator = () => {
        if (!quality) return null;
        
        const qualityLevel = Math.min(5, Math.max(1, Math.ceil(quality / 20)));
        return (
            <div className="quality-indicator">
                {Array(5).fill(0).map((_, i) => (
                    <div
                        key={i}
                        className={`quality-bar ${i < qualityLevel ? 'active' : ''}`}
                        style={{ height: `${(i + 1) * 20}%` }}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="connection-status">
            <div className="status-indicator" style={{ backgroundColor: getStatusColor() }} />
            <span className="status-text">
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
            {getQualityIndicator()}
        </div>
    );
};

export default ConnectionStatus; 