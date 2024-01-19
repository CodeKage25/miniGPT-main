const mongoose = require("mongoose");
require('dotenv').config();

const MONGO_DB_URL = process.env.MONGO_DB_URL;
const MAX_RETRIES = 10;
const RETRY_INTERVAL = 2000; // 2 second

async function connectToDb() {
    let retryCount = 0;

    while (retryCount < MAX_RETRIES) {
        try {
            await mongoose.connect(MONGO_DB_URL);

            mongoose.connection.on("connected", () => {
                console.log(`Mongo Db Database Connected Successfully`);
            });

            mongoose.connection.on("error", (err) => {
                console.log(`Error connecting to the database`);
                console.log(`${err}`);
            });

            break;
        } catch (error) {
            console.error(`Database Connection attempt ${retryCount + 1} failed. Retrying...`);
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
        }
    }

    if (retryCount === MAX_RETRIES) {
        console.error(`Failed to connect to the database after ${MAX_RETRIES} attempts.`);
    }
}

module.exports = connectToDb;
