// socket/bettingSocket.js
import { WebSocketServer } from "ws";
import axios from "axios";

// Track clients and their subscribed gameids
let clients = [];
let cachedData = {};

export const setupWebSocket = (server) => {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    console.log("✅ WebSocket client connected");

    // Each client will have structure: { ws, gameid }
    // let client = { ws, gameid: null };
    let client = { ws, gameid: null, type: null }; // ⬅ include type
    clients.push(client)

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message);
        if (data.type === "subscribe" && data.gameid) {
          client.gameid = data.gameid;
          client.apitype = data.apitype || "cricket"; // default = cricket
          console.log(`📡 Subscribed to gameid: ${data.gameid}, apitype: ${client.apitype}`);
        }
      } catch (err) {
        console.error("❌ Invalid message:", message);
      }
    });

    ws.on("close", () => {
      clients = clients.filter((c) => c.ws !== ws);
      console.log("❌ WebSocket client disconnected");
    });
  });

  const pollBettingData = async () => {
    const uniqueSubscriptions = clients
      .map((c) => (c.gameid ? { gameid: c.gameid, apitype: c.apitype || "cricket" } : null))
      .filter(Boolean);

    const groupedByGameId = [...new Map(uniqueSubscriptions.map(obj => [`${obj.gameid}_${obj.apitype}`, obj])).values()];

    for (const { gameid, apitype } of groupedByGameId) {
      try {
        let endpoint = `https://api.cricketid.xyz/getPriveteData?key=uniique5557878&gmid=${gameid}&sid=4`; // default cricket

        if (apitype === "tennis") {
          endpoint = `https://api.cricketid.xyz/getPriveteData?key=uniique5557878&gmid=${gameid}&sid=2`;
          // console.log("tennnnis")
        } else if (apitype === "soccer") {
          console.log("soccer")
          endpoint = `https://api.cricketid.xyz/getPriveteData?key=uniique5557878&gmid=${gameid}&sid=1`;
        }
        const response = await axios.get(endpoint);
        const newData = response.data;

        if (newData.success) {
          const cacheKey = `${gameid}_${apitype}`;
          if (JSON.stringify(newData) !== JSON.stringify(cachedData[cacheKey])) {
            cachedData[cacheKey] = newData;

            // Notify relevant clients
            clients.forEach((client) => {
              if (
                client.gameid === gameid &&
                client.apitype === apitype &&
                client.ws.readyState === 1
              ) {
                client.ws.send(JSON.stringify({ gameid, apitype, data: newData.data }));
              }
            });
          }
        }
      } catch (error) {
        console.error(`❌ Polling error for ${gameid} (${apitype}):`, error.message);
      }
    }
  };

  // Poll every 2 seconds
  setInterval(pollBettingData, 2000);
};
