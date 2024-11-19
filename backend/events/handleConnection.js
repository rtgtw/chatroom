import generateUniqueId from "../config/generateUniqueId.js";
import handleMessage from "./handleMessage.js";
import handleClose from "./handleClose.js";
import handleErrors from "./handleErrors.js";



const handleWebSocketConnection = (ws, wss) => {
    //as soon as a client connects to the server, assign it a unique client id
    ws.clientId = generateUniqueId();

    //notify the server of the new user 
    console.log(`New client connected with ID: ${ws.clientId}`);

    //send the client id back to client
    ws.send(`Welcome to the chatroom! Your ID is: ${ws.clientId}`);

    //initialize the clients current room to null
    ws.currentRoom = null;

    //initialize the clients old room to null
    ws.oldRoom = null;



    //once the client is connected, listen for a message from the clients ws (websocket)
    //message (payload received from the client) gets passed into the parameter
    //ws.on is a LISTENER, meaning once this is triggered, it will listen forever
    ws.on("message", (message) => handleMessage(message, ws, wss));

    //create an event listener for on close
    ws.on("close", () => handleClose(ws));

    //listen for errors
    ws.on("error", (error) => handleErrors(error));
};


export default handleWebSocketConnection;