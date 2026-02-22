import type { Request, Response } from "express";
import { redisClient } from "../index.js";
import { publishToQueue } from "../config/rabbitmq.js";
import { userModel } from "../model/User.js";
import { generateToken } from "../config/generateToken.js";
import type { AuthenticatedRequest } from "../middleware/authMiddleware.js";
import { OAuth2Client } from "google-auth-library";

export const loginUser = async (req: Request, res: Response) => {
	try {
		const { email } = req.body;

		const rateLimitKey = `OTP:ratelimit:${email}`;
		const rateLimit = await redisClient.get(rateLimitKey);
		if (rateLimit) {
			res.status(429).json({
				message: "Too many requests. Please wait before trying again.",
			});
			return;
		}

		const OTP = Math.floor(100000 + Math.random() * 900000).toString();

		const OTPkey = `OTP:${email}`;
		await redisClient.set(OTPkey, OTP, {
			EX: 300,
		});

		await redisClient.set(rateLimitKey, "true", {
			EX: 60,
		});

		const message = {
			to: email,
			subject: "WebChat OTP code",
			body: `Your OTP is ${OTP}.It is valid for 5 minutes`,
		};
		await publishToQueue("send-otp", message);
		res.status(200).json({
			message: "OTP send to your email",
		});
	} catch (error: any) {
		console.log("Error in login-user", error);
		return res.status(500).json({
			message: error.message,
		});
	}
};
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// export const loginOauthUser = async (req: Request, res: Response) => {
// 	try {
// 		const { name, email, provider } = req.body;
// 		let user = await userModel.findOne({ email });
// 		if (!user) {
// 			user = await userModel.create({
// 				name,
// 				email,
// 				provider,
// 			});
// 		}
// 		const token = generateToken(user);
// 		return res.status(200).json({
// 			message: "User verified",
// 			user,
// 			token,
// 		});
// 	} catch (error:any) {
// 		console.log("Error in loginOauthUser", error);
// 		return res.status(500).json({
// 			message: error.message,
// 		});
// 	}
// };
export const loginOauthUser = async (req: Request, res: Response) => {
	try {
		const { idToken } = req.body;

		if (!idToken) {
			return res.status(400).json({ message: "No idToken provided" });
		}

		// 🔐 Verify token with Google
		const ticket = await client.verifyIdToken({
			idToken,
			audience: process.env.GOOGLE_CLIENT_ID!,
		});

		const payload = ticket.getPayload();

		if (!payload) {
			return res.status(401).json({ message: "Invalid Google token" });
		}

		if (!payload.email || !payload.email_verified) {
			return res.status(401).json({
				message: "Google email not verified",
			});
		}

		const email = payload.email;
		const name = payload.name;
		const sub = payload.sub;

		if (!email || !name || !sub) {
			return res.status(401).json({
				message: "Incomplete Google profile",
			});
		}
		// sub = unique Google user ID

		let user = await userModel.findOne({ email });

		if (!user) {
			user = await userModel.create({
				name,
				email,
				provider: "google",
				providerId: sub,
			});
		}

		// Generate your internal JWT
		const token = generateToken(user);

		return res.status(200).json({
			message: "User verified securely",
			user: {
				_id: user._id,
				name: user.name,
				email: user.email,
			},
			token,
		});
	} catch (error) {
		console.error("Secure OAuth error:", error);
		return res.status(401).json({
			message: "Invalid or expired Google token",
		});
	}
};
export const verifyUser = async (req: Request, res: Response) => {
	try {
		const { email, otp: enteredOtp } = req.body;
		if (!email || !enteredOtp) {
			return res.status(400).json({
				message: "Email and OTP required",
			});
		}

		const otpKey = `OTP:${email}`;
		const storedOtp = await redisClient.get(otpKey);
		if (!storedOtp || storedOtp !== enteredOtp) {
			return res.status(400).json({
				message: "Invalid or expired OTP",
			});
		}
		await redisClient.del(otpKey);
		let user = await userModel.findOne({ email });

		if (!user) {
			const name = email.slice(0, 8);
			user = await userModel.create({ email, name });
		}
		const token = generateToken(user);
		return res.status(200).json({
			message: "User verified",
			user,
			token,
		});
	} catch (error: any) {
		console.log("Error in verify-user", error);
		return res.status(500).json({
			message: error.message,
		});
	}
};

export const myProfile = async (req: AuthenticatedRequest, res: Response) => {
	try {
		const user = req.user;
		res.json(user);
	} catch (error: any) {
		console.log("Error in my-profile", error);
		return res.status(500).json({
			message: error.message,
		});
	}
};

export const updateName = async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { name } = req.body;
		const user = await userModel.findById(req.user?._id);
		if (!user) {
			return res.status(401).json({
				message: "Please login",
			});
		}
		user.name = name;
		await user.save();

		const token = generateToken(user);
		return res.json({
			message: "User updated successfully!",
			user,
			token,
		});
	} catch (error: any) {
		console.log("Error in update-user", error);
		return res.status(500).json({
			message: error.message,
		});
	}
};

export const getAllUsers = async (req: AuthenticatedRequest, res: Response) => {
	try {
		const users = await userModel.find();
		return res.json(users);
	} catch (error: any) {
		console.log("Error in getall-user", error);
		return res.status(500).json({
			message: error.message,
		});
	}
};
export const getAUser = async (req: AuthenticatedRequest, res: Response) => {
	try {
		const user = await userModel.findById(req.params.id);
		return res.json(user);
	} catch (error: any) {
		console.log("Error in getA-user", error);
		return res.status(500).json({
			message: error.message,
		});
	}
};
