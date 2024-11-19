//use Map to track the rooms and sockets(clients) inside of the room
export const rooms = new Map();


export const removeFromCurrentRoom = (ws,rooms) => {
    let currentRoom = ws.currentRoom;

            //checking to see if the client who left was in a private or group room before leaving
            //pass the expression into private room
            const privateRoom = ws.currentRoom.startsWith("private") ? true : false;

            //remove client from the current room
            rooms.get(ws.currentRoom).delete(ws);

            ws.currentRoom = null;

            //clean up
            //if they were the last one, delete the room
            if (rooms.get(currentRoom).size === 0) {
                rooms.delete(currentRoom);

            }

            //if its a private room, make the other clients currentRoom null
            if (privateRoom) {
                rooms.get(currentRoom)?.forEach((client) => {
                    client.currentRoom = null;
                })
            }
}