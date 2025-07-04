require('source-map-support').install()
require('dotenv').config();
import { app } from "./app";
import { initDatabase } from "./config/database";
import { SessionModel } from "./models/Session";

const start = async () => {
    if (!process.env.PORT) {
        throw new Error('PORT is not defined.');
    }
    if (!process.env.JWT_SECRET_KEY) {
        throw new Error('JWT_SECRET_KEY is not defined.');
    }
    
    // Initialize database
    await initDatabase();
    
    // Clean up expired sessions periodically (every hour)
    setInterval(async () => {
        try {
            await SessionModel.cleanupExpiredSessions();
            console.log('✅ Cleaned up expired sessions');
        } catch (error) {
            console.error('❌ Error cleaning up sessions:', error);
        }
    }, 60 * 60 * 1000);
    
    let port = process.env.PORT || 3000;
    
    app.listen(port, () => {
        console.log(`✅ Server listening on port ${port}!`);
    });
}
start();