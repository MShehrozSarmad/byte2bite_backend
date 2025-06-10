// import { createClient } from "redis";
// import { ApiError } from "./apiError.js";

// const client = createClient({
//     username: "default",
//     password: process.env.REDIS_PASSWORD,
//     socket: {
//         host: process.env.REDIS_HOST,
//         port: 14988,
//     },
// });

// try {
//     client.on("error", (err) => console.error("Redis Client Error", err));
//     await client.connect();
//     console.log("success");
// } catch (error) {
//     throw new ApiError(503, "Server Error: Failed to connect redis");
// }

// const storeOtp = async (userId, otp) => {
//     console.log("storing otp");
//     const res = await client.set(`otp:${userId}`, otp);
//     await client.expire(`otp:${userId}`, 300);
//     return res;
// };

// const getStoredOtp = async (userId) => {
//     console.log("getting otp");
//     return await client.get(`otp:${userId}`);
// };

// export { storeOtp, getStoredOtp };
