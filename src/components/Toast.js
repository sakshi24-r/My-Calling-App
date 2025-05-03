import React, { useEffect, useState } from 'react';
import '../styles/App.css';

const Toast = ({ message, type = 'info', duration = 3000, onClose }) => {
    const [visible, setVisible] = useState(true);
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            if (onClose) onClose();
        }, duration);

        const progressInterval = setInterval(() => {
            setProgress(prev => Math.max(0, prev - (100 / (duration / 50))));
        }, 50);

        return () => {
            clearTimeout(timer);
            clearInterval(progressInterval);
        };
    }, [duration, onClose]);

    if (!visible) return null;

    const getIcon = () => {
        switch (type) {
            case 'success':
                return '✓';
            case 'error':
                return '✕';
            case 'warning':
                return '⚠';
            case 'info':
                return 'ℹ';
            default:
                return '';
        }
    };

    return (
        <div className={`toast ${type}`}>
            <div className="toast-content">
                <span className="toast-icon">{getIcon()}</span>
                <span className="toast-message">{message}</span>
                <button 
                    className="toast-close" 
                    onClick={() => {
                        setVisible(false);
                        if (onClose) onClose();
                    }}
                >
                    ×
                </button>
            </div>
            <div className="toast-progress" style={{ width: `${progress}%` }} />
        </div>
    );
};

export default Toast; 