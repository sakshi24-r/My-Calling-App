import React from 'react';
import '../styles/App.css';

const TypingIndicator = ({ users }) => {
    if (!users || users.length === 0) return null;

    const getMessage = () => {
        if (users.length === 1) {
            return `${users[0]} is typing...`;
        } else if (users.length === 2) {
            return `${users[0]} and ${users[1]} are typing...`;
        } else {
            return `${users[0]}, ${users[1]}, and ${users.length - 2} others are typing...`;
        }
    };

    return (
        <div className="typing-indicator">
            <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
            <span className="typing-text">{getMessage()}</span>
        </div>
    );
};

export default TypingIndicator; 