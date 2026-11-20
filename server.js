const WebSocket = require('ws');
const port = process.env.PORT || 3000;
const wss = new WebSocket.Server({ port });

const clients = new Map();

wss.on('connection', (ws) => {
  let userId = null;

  ws.on('message', (raw) => {
    try {
      const data = JSON.parse(raw);

      if (data.type === 'register') {
        userId = String(data.userId);
        clients.set(userId, ws);
        console.log('Connected:', userId);
        return;
      }

      if (data.type === 'morph' && userId) {
        for (const [id, client] of clients) {
          if (id !== userId && client.readyState === 1) {
            client.send(JSON.stringify(data));
          }
        }
      }
    } catch (e) {}
  });

  ws.on('close', () => {
    if (userId) {
      clients.delete(userId);
      console.log('Disconnected:', userId);
    }
  });
});

console.log('Server started on port', port);
