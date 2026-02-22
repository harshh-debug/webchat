import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
	name: string;
	email: string;
	provider: "local" | "google";
	providerId?: string;
}

const userSchema: Schema<IUser> = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		provider: {
			type: String,
			enum: ["local", "google"],
			default: "local",
		},
		providerId: {
			type: String,
		},
	},
	{
		timestamps: true,
	},
);
export const userModel = mongoose.model<IUser>("User", userSchema);
