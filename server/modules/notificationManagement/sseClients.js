/**
 * SSE client map: userId (string) -> response object
 * Stores active SSE connections per user
 */
const sseClients = new Map();

module.exports = { sseClients };
