import dotenv from "dotenv";

dotenv.config({path:"../.env"});


export const ENV_VARS = {
    PORT: process.env.PORT
}

