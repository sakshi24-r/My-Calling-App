// src/components/Chat.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { translateMessage } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import Toast from './Toast';
import ConnectionStatus from './ConnectionStatus';
import TypingIndicator from './TypingIndicator';
import '../styles/App.css';

const Chat = ({ onError }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isSendingMessage, setIsSendingMessage] = useState(false);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [connectedUsers, setConnectedUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [typingUsers, setTypingUsers] = useState([]);
    const [connectionStatus, setConnectionStatus] = useState('connecting');
    const [connectionQuality, setConnectionQuality] = useState(100);
    const [toast, setToast] = useState(null);
    const messagesEndRef = useRef();
    const typingTimeoutRef = useRef();
    const socketRef = useRef();
    const navigate = useNavigate();

    useEffect(() => {
        const username = localStorage.getItem('username');
        if (!username) {
            navigate('/login');
            return;
        }
        setCurrentUser(username);

        // Create socket connection
        socketRef.current = io('http://localhost:3002', {
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            timeout: 20000
        });
        
        const socket = socketRef.current;

        socket.on('connect', () => {
            console.log('Connected to server');
            setIsLoading(false);
            setConnectionStatus('connected');
            socket.emit('join', { username });
        });

        socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            setIsLoading(false);
            setConnectionStatus('disconnected');
            setToast({
                type: 'error',
                message: 'Failed to connect to chat server. Please try again.'
            });
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from server');
            setConnectionStatus('disconnected');
            setToast({
                type: 'warning',
                message: 'Disconnected from server. Attempting to reconnect...'
            });
        });

        socket.on('reconnect', () => {
            console.log('Reconnected to server');
            setConnectionStatus('connected');
            setToast({
                type: 'success',
                message: 'Reconnected to server!'
            });
            // Rejoin the chat after reconnection
            socket.emit('join', { username });
        });

        socket.on('userList', (users) => {
            console.log('Updated user list:', users);
            setConnectedUsers(users);
        });

        socket.on('message', (message) => {
            console.log('New message received:', message);
            setMessages(prevMessages => [...prevMessages, message]);
        });

        socket.on('typing', (data) => {
            if (data.username !== currentUser) {
                setTypingUsers(prev => [...prev, data.username]);
                setTimeout(() => {
                    setTypingUsers(prev => prev.filter(user => user !== data.username));
                }, 3000);
            }
        });

        // Simulate connection quality changes
        const qualityInterval = setInterval(() => {
            setConnectionQuality(Math.max(20, Math.min(100, connectionQuality + (Math.random() * 20 - 10))));
        }, 5000);

        return () => {
            clearInterval(qualityInterval);
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [navigate, currentUser]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleTyping = () => {
        if (socketRef.current) {
            socketRef.current.emit('typing', { username: currentUser });

            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            typingTimeoutRef.current = setTimeout(() => {
                socketRef.current.emit('stopTyping', { username: currentUser });
            }, 3000);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim() || !socketRef.current) return;

        setIsSendingMessage(true);
        
        try {
            const translatedText = await translateMessage(message, 'en');
            socketRef.current.emit('message', {
                text: translatedText,
                originalText: message,
                sender: currentUser,
                timestamp: new Date().toISOString()
            }, (error) => {
                if (error) {
                    console.error('Error sending message:', error);
                    setToast({
                        type: 'error',
                        message: 'Failed to send message. Please try again.'
                    });
                } else {
                    setToast({
                        type: 'success',
                        message: 'Message sent successfully!'
                    });
                }
            });
        } catch (error) {
            console.error('Translation error:', error);
            setToast({
                type: 'error',
                message: 'Translation failed. Sending original message...'
            });
            socketRef.current.emit('message', {
                text: message,
                originalText: message,
                sender: currentUser,
                timestamp: new Date().toISOString()
            });
        } finally {
            setIsSendingMessage(false);
            setMessage('');
        }
    };

    if (isLoading) {
        return <LoadingSpinner message="Connecting to chat server..." />;
    }

    return (
        <div className="chat-container">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
            
            <div className="chat-header">
                <h2>Chat Room</h2>
                <ConnectionStatus
                    status={connectionStatus}
                    quality={connectionQuality}
                />
            </div>

            <div className="chat-box">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`message ${msg.sender === currentUser ? 'own-message' : 'other-message'}`}
                    >
                        <div className="message-header">
                            <span className="sender">{msg.sender}</span>
                            <span className="timestamp">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                            </span>
                        </div>
                        <div className="message-content">
                            {msg.text}
                            {msg.originalText && msg.originalText !== msg.text && (
                                <div className="original-text">
                                    Original: {msg.originalText}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                <TypingIndicator users={typingUsers} />
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="message-form">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => {
                        setMessage(e.target.value);
                        handleTyping();
                    }}
                    placeholder="Type a message..."
                    disabled={isSendingMessage}
                />
                <button type="submit" disabled={isSendingMessage}>
                    {isSendingMessage ? 'Sending...' : 'Send'}
                </button>
            </form>
        </div>
    );
};

export default Chat;