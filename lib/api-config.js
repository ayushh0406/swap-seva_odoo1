// API configuration 
export const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://mumbai-swap-backend.onrender.com' 
  : 'http://localhost:3001';

export const SOCKET_URL = process.env.NODE_ENV === 'production'
  ? 'https://mumbai-swap-backend.onrender.com'
  : 'http://localhost:3001'; 