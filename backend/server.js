import { createServer } from "http";
import WebSocket,{ WebSocketServer } from "ws";
import { ENV_VARS } from "./config/config.js";
import handleWebSocketConnection from "./events/handleConnection.js";

//create http server object
const server = createServer();

//Create a websocket server, pass http server into parameter for websocket server object
export const wss = new WebSocketServer({ server });


//TODO: create a leave room function

//when a client connects to this server, the client ws (websocket aka tcp connection) is passed as a parameter
//wss (websocketserver, holds all of othe ws (websockets) in a set, so on connection, it creates a new websocket
//and places it inside of the set)
wss.on("connection", (ws) => handleWebSocketConnection(ws,wss));

//have the server listen
server.listen(ENV_VARS.PORT, "0.0.0.0" ,() => {
    console.log(`Websocket server running on ws://localhost:${ENV_VARS.PORT}`);
});
