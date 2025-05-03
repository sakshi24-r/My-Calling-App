import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const useSocketConnection = (url) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);
    const [reconnectAttempts, setReconnectAttempts] = useState(0);
    const MAX_RECONNECT_ATTEMPTS = 5;

    useEffect(() => {
        const socketInstance = io(url, {
            reconnection: true,
            reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000
        });

        socketInstance.on('connect', () => {
            setIsConnected(true);
            setError(null);
            setReconnectAttempts(0);
            console.log('Socket connected');
        });

        socketInstance.on('connect_error', (err) => {
            setError(`Connection error: ${err.message}`);
            console.error('Socket connection error:', err);
        });

        socketInstance.on('disconnect', (reason) => {
            setIsConnected(false);
            if (reason === 'io server disconnect') {
                setError('Server disconnected. Please refresh the page.');
            } else {
                setError('Connection lost. Attempting to reconnect...');
            }
        });

        socketInstance.on('reconnect_attempt', (attemptNumber) => {
            setReconnectAttempts(attemptNumber);
            if (attemptNumber >= MAX_RECONNECT_ATTEMPTS) {
                setError('Maximum reconnection attempts reached. Please refresh the page.');
            }
        });

        socketInstance.on('reconnect_failed', () => {
            setError('Failed to reconnect. Please refresh the page.');
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, [url]);

    return { socket, isConnected, error, reconnectAttempts };
};

export default useSocketConnection; 