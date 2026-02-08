import mongoose from "mongoose";

const connectDb = async () => {
	const url = process.env.MONGO_URI;
	if (!url) {
		throw new Error("DB url not defined");
	}
	try {
		await mongoose.connect(url, {
			dbName: "chat-app",
		});
		console.log("Connected to db");
	} catch (error) {
		console.error("Failed to connected to db", error);
		process.exit(1);
	}
};

export default connectDb
