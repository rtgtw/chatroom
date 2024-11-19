import { rooms } from "./rooms/roomManagement.js";

const handleClose = (ws) => {
    console.log("A client has disconneted");

    //notify the room someone left
    if (ws.currentRoom && rooms.has(ws.currentRoom)) {
        rooms.get(ws.currentRoom).forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(`A user has left ${ws.currentRoom}`);
            }
        });
    }


    //remove the client from its current room
    if (ws.currentRoom && rooms.has(ws.currentRoom)) {

        let currentRoom = ws.currentRoom;

        //checking to see if the client who left was in a private or group room before leaving
        //pass the expression into private room
        const privateRoom = ws.currentRoom.startsWith("private") ? true : false;

        //remove client from the current room
        rooms.get(ws.currentRoom).delete(ws);
        


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
};

export default handleClose;