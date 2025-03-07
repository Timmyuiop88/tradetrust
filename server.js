import { createServer } from 'http';
import { Server } from 'socket.io';
import { parse } from 'url';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Store active connections and user status
const connectedUsers = new Map();
// Store user status with last seen time
const userStatus = new Map();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Initialize Socket.IO with CORS settings
  const io = new Server(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Socket.IO connection handler
  io.on('connection', (socket) => {
    console.log('Client connected for real-time updates:', socket.id);

    // Handle user authentication
    socket.on('authenticate', (userData) => {
      const userId = userData.userId;
      
      if (userId) {
        // Store user connection
        connectedUsers.set(userId, socket.id);
        socket.userId = userId;
        
        // Update user status to online
        userStatus.set(userId, {
          online: true,
          lastSeen: new Date()
        });
        
        console.log(`User ${userId} authenticated with socket ${socket.id}`);
        
        // Notify the user they're connected
        socket.emit('authenticated', { 
          success: true, 
          message: 'Successfully connected for real-time updates' 
        });
        
        // Broadcast to all connected clients that this user is online
        broadcastUserStatus(io, userId, true);
      }
    });

    // Handle joining order-specific rooms
    socket.on('joinRoom', (data) => {
      const { orderId } = data;
      
      if (orderId && socket.userId) {
        // Join a room specific to this order
        socket.join(`order-${orderId}`);
        console.log(`User ${socket.userId} joined room for order ${orderId}`);
      }
    });
    
    // Handle user status request
    socket.on('getUserStatus', (data) => {
      const { userIds } = data;
      
      if (Array.isArray(userIds) && socket.userId) {
        const statusData = {};
        
        userIds.forEach(id => {
          if (userStatus.has(id)) {
            statusData[id] = userStatus.get(id);
          } else {
            statusData[id] = { online: false, lastSeen: null };
          }
        });
        
        socket.emit('userStatusUpdate', statusData);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      
      if (socket.userId) {
        connectedUsers.delete(socket.userId);
        
        // Update user status to offline with last seen time
        if (userStatus.has(socket.userId)) {
          userStatus.set(socket.userId, {
            online: false,
            lastSeen: new Date()
          });
          
          // Broadcast to all connected clients that this user is offline
          broadcastUserStatus(io, socket.userId, false);
        }
        
        console.log(`User ${socket.userId} disconnected`);
      }
    });
  });
  
  // Function to broadcast user status changes
  function broadcastUserStatus(io, userId, isOnline) {
    io.emit('userStatusChange', {
      userId,
      status: {
        online: isOnline,
        lastSeen: isOnline ? new Date() : userStatus.get(userId)?.lastSeen || new Date()
      }
    });
  }

  // Endpoint to get user status
  server.on('request', (req, res) => {
    const parsedUrl = parse(req.url, true);
    
    if (parsedUrl.pathname === '/api/user-status' && req.method === 'GET') {
      const userId = parsedUrl.query.userId;
      
      if (userId) {
        res.setHeader('Content-Type', 'application/json');
        
        if (userStatus.has(userId)) {
          res.end(JSON.stringify(userStatus.get(userId)));
        } else {
          res.end(JSON.stringify({ online: false, lastSeen: null }));
        }
      } else {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'User ID is required' }));
      }
      return;
    }
  });

  const PORT = process.env.PORT || 3001;
  
  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> WebSocket server ready on http://localhost:${PORT}`);
  });
}); 