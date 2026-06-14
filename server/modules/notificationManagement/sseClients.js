// This file is used to manage Server-Sent Events (SSE) clients for real-time notifications.
const sseClients = new Map();

module.exports = { sseClients };