import { removeFromCurrentRoom, rooms, joinRoom, pairWith } from "./rooms/roomManagement.js";
import { broadcastList, broadcastMessage, notify } from "./rooms/messages.js";
import { parse } from "dotenv";



const handleMessage = (message, ws, wss) => {
    //parse the message to a string
    const parsedMessage = message.toString();

    //---------------------------------------------------------------------------------------------------------//
    //Public chat room logic
    //---------------------------------------------------------------------------------------------------------//
    //let the client specify which room they want to join
    if (parsedMessage.startsWith("JOIN_ROOM:")) {
        joinRoom(ws,rooms,parsedMessage);
    }
    //---------------------------------------------------------------------------------------------------------//
    //Private chat room logic
    //---------------------------------------------------------------------------------------------------------//

    else if (parsedMessage.startsWith("PAIR_WITH:")) {
        
        pairWith(ws,wss,rooms,parsedMessage);

    }

    else if (parsedMessage.startsWith("EXIT") || parsedMessage.startsWith("exit")) {
        console.log("A client has disconneted");

        //notify the room someone left
        notify(ws,rooms,`A user has left room ${ws.currentRoom}`);


        //remove the client from its current room
        if (ws.currentRoom && rooms.has(ws.currentRoom)) {

            removeFromCurrentRoom(ws,rooms);
        }
    }
    //broadcast the messages to everyone in the chatroom
    //if currentRoom is truthy(not null) and its within the map
    else if (ws.currentRoom && rooms.has(ws.currentRoom)) {
        //broadcast message
        broadcastMessage(rooms, ws,parsedMessage);
    }
    else {
        broadcastList(ws, wss);
    }
};

export default handleMessage;