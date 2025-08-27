
// import { createClient } from 'redis';
// import dotenv from "dotenv";

// // Replace these with your Redis Cloud credentials

//  // Dotenv Config
// dotenv.config();

// const redisClient = createClient({
//     username: process.env.REDIS_USERNAME,
//     password: process.env.REDIS_PASSWORD,
//     socket: {
//         host: process.env.REDIS_HOST,
//         port: process.env.REDIS_PORT
//     }
// });

// redisClient.on('error', (err) => console.error('❌ Redis error:', err));

// (async () => {
//   try {
//     await redisClient.connect();
//     console.log('✅ Connected to Redis Cloud');
//   } catch (err) {
//     console.error('Redis connection error:', err);
//   }
// })();

// export default redisClient;
