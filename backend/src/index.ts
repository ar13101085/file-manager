require('source-map-support').install()
require('dotenv').config();
import { app } from "./app";

const start = async () => {
    if (!process.env.PORT) {
        throw new Error('PORT is not defined.');
    }
    if (!process.env.JWT_SECRET_KEY) {
        throw new Error('JWT_SECRET_KEY is not defined.');
    }
    
    let port = process.env.PORT || 3000;
    
    app.listen(port, () => {
        console.log(`Listening on port ${port}!`);
    });
}
start();