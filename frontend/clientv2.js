//client side js to interact with html ui

//connect to backend websocket server
const socket = new WebSocket("ws://192.168.87.24:8080");


//get references by dom eleements
const messageDiv = document.getElementById("messages");
const messageInput = document.getElementById("message");


//handle incoming messages
socket.onmessage = (event) => {
    const newMessage = document.createElement("div");
    newMessage.textContent = event.data;
    messageDiv.appendChild(newMessage);
    messageDiv.scrollTop = messageDiv.scrollHeight;
};

//when client connects
socket.onopen = () => {
    const newMessage = document.createElement("div");
    newMessage.textContent = "Connected to the Web Socket server";
    newMessage.style.color = "green";
    messageDiv.appendChild(newMessage);
};


//client disconnects
socket.onclose = () => {
    const newMessage = document.createElement("div");
    newMessage.textContent = "Disconnected from the server";
    newMessage.style.color = "red";
    messageDiv.appendChild(newMessage);
};


//handle sending messages
function sendMessage(){
    const message = messageInput.value;

    if(message.trim() !== ""){
        socket.send(message);
        //clear the text box
        messageInput.value="";
    }
}

//add an event listener to the input box for if the user hits enter
//messageInput is the input box
messageInput.addEventListener("keydown", (event) =>{
    if(event.key === "Enter"){
        sendMessage();
    }
})