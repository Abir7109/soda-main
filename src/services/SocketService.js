import { io } from 'socket.io-client'

const BACKEND_URL = 'http://localhost:8000'

const socket = io(BACKEND_URL, {
  autoConnect: false,
  transports: ['websocket'],
  reconnection: true,
  reconnectionDelay: 500,
  reconnectionDelayMax: 3000,
  reconnectionAttempts: Infinity,
  timeout: 5000
})

export default socket
