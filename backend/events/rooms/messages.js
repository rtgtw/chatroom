import WebSocket from "ws";

/**
 * Broadcasts a message to everyone in ws(inbound websocket)'s current room location
 * @param {Object} ws
 * @param {Map<string,Set>} rooms
 * @param {string} message
 */
//template to broadcast anything to the group
export const notify = (ws, rooms, message) => {
    
    if (ws.currentRoom && rooms.has(ws.currentRoom)) {
        rooms.get(ws.currentRoom).forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    }
};


export const broadcastMessage = (rooms, ws, parsedMessage) => {
    rooms.get(ws.currentRoom).forEach((client) => {

        //while iterating the connection is open for the other sockets
        //* update, showing the clients name in the chat as well, removed client !== ws
        if (client.readyState === WebSocket.OPEN) {
            client.send(`${client.currentRoom}(${ws.clientId}): ${parsedMessage}`);
        }
    })
};



export const broadcastList = (ws, wss) => {
    ws.send(`You must join a room or pair with another client to send messages\n\nhere is a list of people who are currently in the server: `);

    //showing all other users who are currently within the server
    wss.clients.forEach((client) => {
        if (client !== ws) {
            ws.send(`User: ${client.clientId}`);
        }
    });
}