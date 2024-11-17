import { WebSocket } from "ws";
import readline from "readline";


//create a readline interface for i/o
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


//create a websocket connecting to localhost
const socket = new WebSocket("ws://localhost:8080");

//initialize current room to null
let currentRoom = null;

socket.onopen = () => {
    console.log("Connected to the server");


    rl.on("line", (input) => {

        if (input === "exit") {
            console.log("Closing connection");
            socket.close(1000, "Client requested closure");
            rl.close();
        } else {
            socket.send(input);
        }
    });

};


socket.onmessage = (event) => {
    console.log(event.data);
};


socket.onclose = () => {
    console.log("Connection closed by the server");
}