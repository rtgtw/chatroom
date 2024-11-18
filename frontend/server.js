//create a frontend server to host the static files
import express from "express";
import path from "path";
//using ES module, not commonJS
import { fileURLToPath } from "url";


//define __dirname for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//crate server
const app = express();

//designate port
const port = 3000;

//serve files on current directory
app.use(express.static(path.join(__dirname)));

//listen on port 3k
app.listen(port, () => {
    console.log("Front end hosting server listening on port 3000");
})
