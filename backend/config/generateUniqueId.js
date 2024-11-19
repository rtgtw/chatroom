import { wss } from "../server.js";


 //generate a unique id for clients when entering the server
//wss (websocketserver) is a SET, which doesnt have array functionality, Array.from gives it array functions
// .some is an array method 
const generateUniqueId = () => {
    let clientId;
    let isUnique = false;

    //while isUnique is false, continue in the loop
    while (!isUnique) {
        //generate a unique ID
        clientId = Math.floor(Math.random() * 10000).toString();

        //now we check if the generated clientID is already paired with a client
        //.some returns true or false, so we can pass the result directly to isUnique variable,
        //we have to negate it, because if its true(theres a unique valaue), 
        //theres already a valid ID so isUnique should be false!
        isUnique = !Array.from(wss.clients).some((client) => client.clientId === clientId);
    }
    //if unique becomes true, breaks out of the loop, return the client id
    return clientId;
};


export default generateUniqueId;
