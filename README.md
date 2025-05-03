 HEAD
# My Calling App

A real-time video calling and chat application built with React, Socket.io, and WebRTC.

## Features

- Real-time video calling
- Text chat with typing indicators
- User authentication
- Connection status monitoring
- Call quality indicators
- Toast notifications
- Responsive design

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Modern web browser with WebRTC support

## Installation

1. Clone the repository:
```bash
git clone <your-repository-url>
cd my_calling_app
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

1. Start the backend server:
```bash
npm run server
```

2. In a new terminal, start the frontend development server:
```bash
npm start
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

## Project Structure

```
my_calling_app/
├── backend/
│   └── server.js
├── src/
│   ├── components/
│   │   ├── App.js
│   │   ├── Chat.js
│   │   ├── VideoCall.js
│   │   ├── Login.js
│   │   ├── Toast.js
│   │   ├── ConnectionStatus.js
│   │   └── TypingIndicator.js
│   ├── styles/
│   │   └── App.css
│   └── services/
│       └── api.js
├── package.json
└── README.md
```

## Usage

1. **Login**
   - Enter your username to join the application
   - The username will be stored in localStorage

2. **Chat**
   - Send and receive messages in real-time
   - See who's typing
   - View connection status
   - Get message delivery notifications

3. **Video Call**
   - Start a call with any connected user
   - Toggle video and audio
   - Monitor call quality
   - End calls
   - Receive incoming call notifications

## Development

- Frontend runs on port 3000
- Backend runs on port 3001
- Hot reloading is enabled for development
- Socket.io handles real-time communication
- WebRTC handles peer-to-peer video calls

## Troubleshooting

If you encounter any issues:

1. Check if both servers are running
2. Ensure your browser supports WebRTC
3. Check console for error messages
4. Verify camera and microphone permissions
5. Try clearing browser cache and localStorage

## Contributing

Feel free to submit issues and enhancement requests!

# My-Calling-App
its help for chat calling and video calling 
79e5adf6f7fe2767525c3832cb64a3ee3105eac1
