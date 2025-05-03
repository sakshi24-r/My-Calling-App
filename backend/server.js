const express = require('express');
const cors = require('cors');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const port = 3002;

// Enable CORS with specific options
app.use(cors({
    origin: 'http://localhost:3000', // Allow frontend origin
    credentials: true
}));
app.use(express.json());

// Mock user database
const users = [
    { username: 'user1', password: 'password1', email: 'user1@example.com' },
    { username: 'user2', password: 'password2', email: 'user2@example.com' }
];

// Store connected users and their messages
const connectedUsers = new Map();
const messageHistory = [];
const activeCalls = new Map();

// Registration endpoint
app.post('/register', (req, res) => {
    console.log('Registration request received:', req.body);
    const { username, password, email } = req.body;
    
    // Validate input
    if (!username || !password || !email) {
        console.log('Missing required fields');
        return res.status(400).json({ 
            success: false,
            error: 'All fields are required' 
        });
    }
    
    // Check if username or email already exists
    if (users.some(user => user.username === username || user.email === email)) {
        console.log('Username or email already exists');
        return res.status(400).json({ 
            success: false,
            error: 'Username or email already exists' 
        });
    }
    
    try {
        // Add new user
        users.push({ username, password, email });
        console.log('User registered successfully');
        res.json({ 
            success: true, 
            message: 'Registration successful' 
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Internal server error' 
        });
    }
});

// Login endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        // In a real app, you would generate a proper JWT token here
        res.json({ 
            access_token: 'mock_token_' + username,
            user: { username }
        });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('join', ({ username }) => {
        connectedUsers.set(socket.id, username);
        io.emit('userList', Array.from(connectedUsers.values()));
    });

    socket.on('message', (message) => {
        io.emit('message', {
            ...message,
            timestamp: new Date().toISOString()
        });
    });

    socket.on('typing', (data) => {
        socket.broadcast.emit('typing', data);
    });

    socket.on('stopTyping', (data) => {
        socket.broadcast.emit('stopTyping', data);
    });

    socket.on('callUser', (data) => {
        io.to(data.to).emit('callReceived', {
            offer: data.offer,
            from: connectedUsers.get(socket.id)
        });
    });

    socket.on('answerCall', (data) => {
        io.to(data.to).emit('callAccepted', data.answer);
    });

    socket.on('iceCandidate', (data) => {
        io.to(data.to).emit('iceCandidate', data.candidate);
    });

    socket.on('endCall', () => {
        io.emit('callEnded');
    });

    socket.on('disconnect', () => {
        connectedUsers.delete(socket.id);
        io.emit('userList', Array.from(connectedUsers.values()));
        console.log('Client disconnected');
    });
});

// Start server
http.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
}); 