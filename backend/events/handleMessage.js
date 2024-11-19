import { removeFromCurrentRoom, rooms } from "./rooms/roomManagement.js";
import { broadcastList, broadcastMessage, notify } from "./rooms/messages.js";
import WebSocket from "ws";



const handleMessage = (message, ws, wss) => {
    //parse the message to a string
    const parsedMessage = message.toString();

    //---------------------------------------------------------------------------------------------------------//
    //Public chat room logic
    //---------------------------------------------------------------------------------------------------------//
    //let the client specify which room they want to join
    if (parsedMessage.startsWith("JOIN_ROOM:")) {

        //Hold the value of the users old room before switching rooms, to notify others
        ws.oldRoom = ws.currentRoom;

        //Parse the requested room name sent by the client and store in roomName
        const roomName = parsedMessage.split(":")[1];

        //pass this parsed value as the websockets current room
        ws.currentRoom = roomName;


        //add the current client to the requested room
        //if the rooms map doesnt have the room number, create it , and store the room number as the key, 
        //the value is a new set for sockets to be stored in
        //this if statement is only if a client is first trying to enter a room, else statement is when 
        //they are already inside, and we are broadcasting the chat

        //if falsy
        if (!rooms.has(roomName)) {
            //add the key-value pair of roomName-socket (client) to rooms
            rooms.set(roomName, new Set());
        }

        //if its already a room then add the socket into the value at the specified key(room)
        //use .add to append the socket to the key
        rooms.get(roomName).add(ws);

        //if the old room is truthy and isnt private
        if (ws.oldRoom && !ws.oldRoom.startsWith("private")) {

            //remove the client from the old room
            rooms.get(ws.oldRoom).delete(ws);

            //notify every1 in the room the client has left
            if (ws.oldRoom && rooms.has(ws.oldRoom)) {

                //obtain the key and iterate through each value (sockets)
                rooms.get(ws.oldRoom).forEach((client) => {
                    //client !== ws means we dont want the client that is exiting, we wanna notify everyone else
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(`User:${ws.clientId} has left the room`);
                    }
                });
            }
            //if the old room is a private room
        } else if (ws.oldRoom && ws.oldRoom.startsWith("private")) {

            //remove the client from the old room
            rooms.get(ws.oldRoom).delete(ws);

            //notify  the other client in the room someone left
            if (ws.oldRoom && rooms.has(ws.oldRoom)) {

                rooms.get(ws.oldRoom).forEach((client) => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(`User:${ws.clientId} has left the room`);

                        //change the other private room members oldRoom value
                        client.oldRoom = ws.oldRoom;

                        //make the private members currentRoom null aswell
                        client.currentRoom = null;

                        //delete private member from the room and exit
                        rooms.get(client.oldRoom).delete(client);
                        client.send(`Exiting ${client.oldRoom}...`);
                    }
                });
            }
        }

        //send the client a message to say they've joined the room
        ws.send(`You joined room: ${roomName}`);

        //notify server that client joined as well
        console.log(`Client joined room: ${roomName}`);


        //notify every1 in the room someone new has joined
        if (ws.currentRoom && rooms.has(ws.currentRoom)) {
            rooms.get(ws.currentRoom).forEach((client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(`User:${ws.clientId} has joined room ${ws.currentRoom}, say hello :)`);
                }
            });
        }

    }
    //---------------------------------------------------------------------------------------------------------//
    //Private chat room logic
    //---------------------------------------------------------------------------------------------------------//

    else if (parsedMessage.startsWith("PAIR_WITH:")) {
        console.log("Initializing private room...");

        const clientId = parsedMessage.split(":")[1];

        //We have to check if the clientId is currently in a private room , if so, we have to
        //disconnect the other person
        const potentialClient = Array.from(wss.clients).find((client) => { return client !== ws && client.clientId === clientId });

        //They are currently inside of a private room, disconnect the second person before connecting
        if (potentialClient?.currentRoom?.startsWith("private")) {

            potentialClient.oldRoom = potentialClient.currentRoom;

            //iterates through the private room and removes the other member inside of it
            rooms.get(potentialClient.oldRoom).forEach((client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(`User:${potentialClient.clientId} has left the room`);

                    // change the other private members old room value
                    client.oldRoom = potentialClient.oldRoom;

                    //make the private members currentRoom null aswell
                    client.currentRoom = null;

                    potentialClient.currentRoom = null;

                    //delete private member from the room and exit
                    rooms.get(client.oldRoom).delete(client);

                    client.send(`Exiting ${client.oldRoom}...`);
                }
            });
        }


        //change oldRoom of the private room requestor
        ws.oldRoom = ws.currentRoom;
        ws.currentRoom = null;

        //requestors old room could be null, only enter if it isnt null
        if (ws.oldRoom) {
            rooms.get(ws.oldRoom).delete(ws);
        }

        //find the clientID this current client wants to connect with inside of the maps
        //returns the socket in targetClient
        const targetClient = Array.from(wss.clients).find((client) => { return client !== ws && client.clientId === clientId });

        //if targetClient is truthy, meaning its in the set of sockets and it was found
        if (targetClient) {
            //create the private room
            const privateRoomName = `private-${ws.clientId}-${clientId}`;

            //change the current room for this socket(client), and also for the target socket(client)
            ws.currentRoom = privateRoomName;

            //check if rooms set doesnt has this name
            if (!rooms.has(privateRoomName)) {
                rooms.set(privateRoomName, new Set());
            }
            //add the current client
            rooms.get(privateRoomName).add(ws);

            //!!!!!!!*** VERY important
            //so this means they that the targetClient can SEE the messages in the private room
            rooms.get(privateRoomName).add(targetClient);

            //we also want to remove the targetClient from its old room
            if (targetClient.currentRoom != null) {
                rooms.get(targetClient.currentRoom).delete(targetClient);
            }

            //we also have to change the targetClients currentRoom property to reflect the private room
            targetClient.currentRoom = privateRoomName;


            //notify both clients of the pairpair
            ws.send(`Paired with client ${clientId} in private room:\n${privateRoomName}`);
            targetClient.send(`Paired with client ${ws.clientId} in private room:\n${privateRoomName}`);

        } else {
            //if a targetClient couldnt be found say we couldnt find them
            ws.send(`Client ${clientId} was not found`);
        }

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