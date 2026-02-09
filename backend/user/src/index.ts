import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import { createClient } from "redis";
import userRouter from "./routes/userRouter.js";
import { connectRabbitMQ } from "./config/rabbitmq.js";
dotenv.config();
if (!process.env.PORT || !process.env.REDIS_URL || !process.env.MONGO_URI) {
	throw new Error("Environment variables not defined");
}
connectDb();
connectRabbitMQ()


export const redisClient = createClient({
	url: process.env.REDIS_URL,
});

redisClient
	.connect()
	.then(() => {
		console.log("RedisClient connected");
	})
	.catch(console.error);


const app = express();
app.use(express.json())

app.use("/api/v1",userRouter)

const port = process.env.PORT;

app.listen(port, () => {
	console.log(`Listening on port: ${port}`);
});
