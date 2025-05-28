# Mumbai Swap - Skill & Goods Bartering Platform

Mumbai Swap is a platform that enables users to barter skills and goods with each other. For example, if you know how to play carrom and want to learn chess, you can find someone who knows chess and wants to learn carrom, and you can exchange your skills.

## Features

- **Skill & Goods Exchange**: Barter your skills or goods with others
- **Match Algorithm**: Find the perfect match based on what you offer and what you need
- **Real-time Chat**: Communicate directly with potential barter partners
- **Video & Voice Calls**: Built-in call functionality for remote skill exchanges
- **Trust Score System**: Rating system to build a community of trusted users
- **Location-based Matching**: Find barter partners near you
- **Blockchain Integration**: Optional blockchain verification of completed trades

## Technology Stack

- **Frontend**: Next.js, React, Tailwind CSS, Shadcn/UI
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Real-time Communication**: Socket.io, WebRTC
- **Authentication**: JWT-based authentication
- **Blockchain**: Optional blockchain integration for trade verification

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB database
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the backend directory with the following content:
   ```
   PORT=3001
   NODE_ENV=development
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   FRONTEND_URL=http://localhost:3000
   ```

4. Start the backend server:
   ```
   npm start
   ```
   
   For development with auto-reload:
   ```
   npm run dev
   ```

### Frontend Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Documentation

The API is organized around RESTful principles with the following main endpoints:

- `/api/auth`: Authentication endpoints (signup, login, etc.)
- `/api/users`: User profile endpoints
- `/api/matches`: Match discovery and management
- `/api/messages`: Chat and communication
- `/api/skills`: Skill management
- `/api/interests`: Interest management
- `/api/notifications`: User notifications

## Socket.io Events

The application uses Socket.io for real-time functionality:

- `join-conversation`: Join a conversation room
- `typing`: Indicate user is typing
- `new-message`: New message notification
- `call-signal`: WebRTC signaling for video/audio calls

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Thanks to all contributors who have helped with this project
