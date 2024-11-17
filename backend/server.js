import { createServer } from "http";
import WebSocket, { WebSocketServer } from "ws";
import { ENV_VARS } from "./config.js";


//Create a websocket server, pass http server into parameter for websocket server object
const server = createServer();

const wss = new WebSocketServer({ server });

//use Map to track the rooms and sockets(clients) inside of the room
const rooms = new Map();



//when a client connects to this server, the client ws (tcp connection) is passed as a parameter
wss.on("connection", (ws) => {

    let currentRoom = null;

    console.log("Client Connected!");

    //once the client is connected, listen for a message from the clients ws
    //message gets passed into the parameter
    ws.on("message", (message) => {

        
        //parse the message to a string
        const parsedMessage = message.toString();

        

        //let the client specify which room they want to join
        if (parsedMessage.startsWith("JOIN_ROOM:")) {
            const roomName = parsedMessage.split(":")[1];
            currentRoom = roomName;



            //add the current client to the requested room
            //if the rooms map doesnt have the room number, create it for key, value is a new set for 
            //sockets to be stored in
            //this if statement is only if a client is first trying to enter a room, else statement is when 
            //they are already inside, and we are broadcasting the chat
            if (!rooms.has(roomName)) {
                rooms.set(roomName, new Set());
            }

            //if its alreadfy here then add the socket into the value in the map
            rooms.get(roomName).add(ws);

            //send the client a message to say they've joined the room
            ws.send(`You joined room: ${roomName}`);

            //notify server that client joined as well
            console.log(`Client joined room: ${roomName}`);


      //notify every1 in the room someone new joined
            if (currentRoom && rooms.has(currentRoom)) {
                rooms.get(currentRoom).forEach((client) => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(`A new user has joined ${currentRoom}, say hello :)`);
                    }
                });
            }




        } else {

            //broadcast the messages to everyone in the chatroom
            //if currentRoom is truthy(not null) and its within the map
            if (currentRoom && rooms.has(currentRoom)) {
                //go to the room in the map and send a broadcast to the values (sockets)
                //client in this case is the individual web sockets for everyone in the room
                rooms.get(currentRoom).forEach((client) => {

                    //while iterating, make sure youre not echoing the message back to sender, and 
                    //the connection is open for the other sockets
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(`Room ${currentRoom}: ${parsedMessage}`);
                    }
                });
            }
        }

    });

    

    //create an event listener for on close
    ws.on("close", () => {
        console.log("A client has disconneted");

        //notify the room someone left
        if (currentRoom && rooms.has(currentRoom)) {
            rooms.get(currentRoom).forEach((client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(`A user has left room ${currentRoom}`);
                }
            });
        }


        //remove the client from its current room
        if(currentRoom && rooms.has(currentRoom)){
            rooms.get(currentRoom).delete(ws);

              //if they were the last one delete the room
              if(rooms.get(currentRoom).size === 0){
                rooms.delete(currentRoom);
            }
        }  
    });

    //on any errors
    ws.on("error", (error) => {
        console.log("Socket error: " , error.message);
    });
});



//have the server listen
server.listen(ENV_VARS.PORT, () => {
    console.log(`Websocket server running on ws://localhost:${ENV_VARS.PORT}`);
});
