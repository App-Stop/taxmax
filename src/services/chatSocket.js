// The live side of chat: one Socket.IO connection per signed-in session, shared by every
// screen. Data changes still go through the REST calls in chat.js; the socket only
// delivers events (chat:message, chat:message_updated, chat:message_deleted, chat:read,
// chat:typing) and sends typing.

import { io } from 'socket.io-client';
import { getStoredToken } from './auth';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002').replace(/\/+$/, '');

let socket = null;
let socketToken = null;
const reconnectListeners = new Set();
const statusListeners = new Set();

const notifyStatus = () => statusListeners.forEach((listener) => listener(socket?.connected ?? false));

function connect() {
  const token = getStoredToken();
  if (!token) return null;
  if (socket && socketToken === token) return socket;

  socket?.disconnect();
  socketToken = token;
  let connectedBefore = false;
  socket = io(BASE_URL, { auth: { token }, transports: ['websocket', 'polling'] });

  socket.on('connect', () => {
    // Events sent while we were away are not replayed: listeners catch up over REST.
    if (connectedBefore) reconnectListeners.forEach((listener) => listener());
    connectedBefore = true;
    notifyStatus();
  });
  // A drop (network, server restart) reconnects by itself. When the server ends the
  // connection itself (token expired or revoked, account deactivated) it stays closed.
  socket.on('disconnect', notifyStatus);
  // A refused handshake (expired or revoked token) is not retried; the next REST call signs out.
  socket.on('connect_error', (err) => {
    if (/unauthori[sz]ed/i.test(err.message)) socket?.disconnect();
    notifyStatus();
  });
  return socket;
}

// Subscribes to a chat event. Returns the unsubscribe function.
export function onChatEvent(event, handler) {
  const s = connect();
  if (!s) return () => {};
  s.on(event, handler);
  return () => s.off(event, handler);
}

// Called after the connection comes back, so screens can fetch what they missed.
export function onChatReconnect(listener) {
  connect();
  reconnectListeners.add(listener);
  return () => reconnectListeners.delete(listener);
}

// Called with true / false as the live connection comes and goes.
export function onChatStatus(listener) {
  connect();
  statusListeners.add(listener);
  listener(socket?.connected ?? false);
  return () => statusListeners.delete(listener);
}

export function sendTyping(customerId, isTyping) {
  if (socket?.connected) socket.emit('chat:typing', { customerId, isTyping });
}

// On sign-out.
export function disconnectChat() {
  socket?.disconnect();
  socket = null;
  socketToken = null;
  notifyStatus();
}
