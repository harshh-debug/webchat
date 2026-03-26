import type { Response } from "express";
import type { AuthenticatedRequest } from "../middlewares/authMiddleware.js";
import { chatModel } from "../models/chatModel.js";
import { messageModel } from "../models/messageModel.js";
import axios from "axios";
import cloudinary from "../config/cloudinary.js";
import { getRecieverSocketId, io } from "../config/socket.js";

const uploadImageBuffer = async (buffer: Buffer) => {
	return new Promise<{ secureUrl: string; publicId: string }>(
		(resolve, reject) => {
			const uploadStream = cloudinary.uploader.upload_stream(
				{
					folder: "webchat/messages",
					resource_type: "image",
				},
				(error, result) => {
					if (error || !result) {
						reject(error || new Error("Cloudinary upload failed"));
						return;
					}

					resolve({
						secureUrl: result.secure_url,
						publicId: result.public_id,
					});
				},
			);

			uploadStream.end(buffer);
		},
	);
};

export const createNewChat = async (
	req: AuthenticatedRequest,
	res: Response,
) => {
	try {
		const userId = req.user?._id;
		const { otherUserId } = req.body;
		if (!otherUserId) {
			return res.status(400).json({
				message: "Other user id is required",
			});
		}

		const existingChat = await chatModel.findOne({
			users: { $all: [userId, otherUserId], $size: 2 },
		});

		if (existingChat) {
			return res.json({
				message: "Chat already exits",
				chatId: existingChat._id,
			});
		}

		const newChat = await chatModel.create({
			users: [userId, otherUserId],
		});
		res.status(201).json({
			message: "New chat created",
			chatId: newChat._id,
		});
	} catch (error: any) {
		console.log("Error in create-new-chat", error);
		return res.status(500).json({
			message: error.message,
		});
	}
};

export const getAllChat = async (req: AuthenticatedRequest, res: Response) => {
	try {
		const userId = req.user?._id;
		if (!userId) {
			return res.status(400).json({
				message: "UserId missing",
			});
		}
		const chats = await chatModel
			.find({ users: userId })
			.sort({ updatedAt: -1 });

		const chatWithUserData = await Promise.all(
			chats.map(async (chat) => {
				const otherUserId = chat.users.find((id) => id !== userId);

				const unseenCount = await messageModel.countDocuments({
					chatId: chat._id,
					sender: { $ne: userId },
					seen: false,
				});

				try {
					const { data } = await axios.get(
						`${process.env.USER_SERVICE}/api/v1/user/${otherUserId}`,
					);
					return {
						user: data,
						chat: {
							...chat.toObject(),
							latestMessage: chat.latestMessage || null,
							unseenCount,
						},
					};
				} catch (error) {
					console.log(error);
					return {
						user: { _id: otherUserId, name: "Unknown User" },
						chat: {
							...chat.toObject(),
							latestMessage: chat.latestMessage || null,
							unseenCount,
						},
					};
				}
			}),
		);
		return res.json({
			chats: chatWithUserData,
		});
	} catch (error: any) {
		console.log("Error in get-all-chat", error);
		return res.status(500).json({
			message: error.message,
		});
	}
};

export const sendMessage = async (req: AuthenticatedRequest, res: Response) => {
	try {
		const senderId = req.user?._id;
		const { chatId, text } = req.body;
		const imageFile = req.file;
		if (!senderId) {
			return res.status(401).json({
				message: "Unauthorized",
			});
		}
		if (!chatId) {
			return res.status(401).json({
				message: "ChatId required",
			});
		}
		if (!text && !imageFile) {
			return res.status(400).json({
				message: "Either text or image is required",
			});
		}
		const chat = await chatModel.findById(chatId);
		if (!chat) {
			return res.status(404).json({
				message: "Chat not found",
			});
		}

		const isUserInChat = chat.users.some(
			(userId) => userId.toString() === senderId.toString(),
		);
		if (!isUserInChat) {
			return res.status(403).json({
				message: "You are not a participant of this chat",
			});
		}
		const otherUserId = chat.users.find(
			(userId) => userId.toString() !== senderId.toString(),
		);
		if (!otherUserId) {
			return res.status(401).json({
				message: "No other user",
			});
		}

		// socket setup
		const receiverSocketId = getRecieverSocketId(otherUserId.toString());
		let isReceiverInChatRoom = false;

		if (receiverSocketId) {
			const receiverSocket = io.sockets.sockets.get(receiverSocketId);
			if (receiverSocket && receiverSocket.rooms.has(chatId)) {
				isReceiverInChatRoom = true;
			}
		}

		let messageData: any = {
			chatId: chatId,
			sender: senderId,
			seen: false,
			seenAt: undefined,
		};
		if (imageFile) {
			const uploadedImage = await uploadImageBuffer(imageFile.buffer);

			messageData.image = {
				url: uploadedImage.secureUrl,
				publicId: uploadedImage.publicId,
			};
			messageData.messageType = "image";
			messageData.text = text || "";
		} else {
			messageData.text = text;
			messageData.messageType = "text";
		}

		const message = new messageModel(messageData);
		const savedMessage = await message.save();
		const latestMessageText = imageFile ? "image" : text;

		await chatModel.findByIdAndUpdate(
			chatId,
			{
				latestMessage: {
					text: latestMessageText,
					sender: senderId,
				},
				updatedAt: new Date(),
			},
			{
				new: true,
			},
		);

		//emit to socket
		io.to(chatId).emit("newMessage", savedMessage);

		if (receiverSocketId) {
			io.to(receiverSocketId).emit("newMessage", savedMessage);
		}

		const senderSocketId = getRecieverSocketId(senderId.toString());
		if (senderSocketId) {
			io.to(senderSocketId).emit("newMessage", savedMessage);
		}

		if (isReceiverInChatRoom && senderSocketId) {
			io.to(senderSocketId).emit("messagesSeen", {
				chatId: chatId,
				seenBy: otherUserId,
				messageIds: [savedMessage._id],
			});
		}
		return res.status(201).json({
			message: savedMessage,
			sender: senderId,
		});
	} catch (error: any) {
		console.log("Error in send-message", error);
		return res.status(500).json({
			message: error.message,
		});
	}
};

export const getMessagesByChat = async (
	req: AuthenticatedRequest,
	res: Response,
) => {
	try {
		const userId = req.user?._id;
		const { chatId } = req.params;
		if (!chatId) {
			return res.status(401).json({
				message: "ChatId required",
			});
		}
		if (!userId) {
			return res.status(401).json({
				message: "Unauthorized ",
			});
		}
		const chat = await chatModel.findById(chatId);
		if (!chat) {
			return res.status(401).json({
				message: "Chat not found ",
			});
		}
		const isUserInChat = chat.users.some(
			(uId) => uId.toString() === userId.toString(),
		);
		if (!isUserInChat) {
			return res.status(403).json({
				message: "You are not a participant of this chat",
			});
		}
		const unreadMessages = await messageModel.find(
			{
				chatId: chatId,
				sender: { $ne: userId },
				seen: false,
			},
			{ _id: 1, sender: 1 },
		);

		const unreadMessageIds = unreadMessages.map((msg) => msg._id.toString());

		let modifiedCount = 0;
		if (unreadMessageIds.length > 0) {
			const updateResult = await messageModel.updateMany(
				{
					_id: { $in: unreadMessageIds },
					seen: false,
				},
				{
					seen: true,
					seenAt: new Date(),
				},
			);

			modifiedCount = updateResult.modifiedCount ?? 0;
		}

		// Notify original sender(s) even when they are not in the same chat room.
		if (modifiedCount > 0) {
			const senderIds = Array.from(
				new Set(unreadMessages.map((msg) => msg.sender.toString())),
			);

			senderIds.forEach((senderId) => {
				const senderSocketId = getRecieverSocketId(senderId);
				if (!senderSocketId) return;

				const payload = {
					chatId,
					seenBy: userId,
					messageIds: unreadMessageIds,
				};

				io.to(senderSocketId).emit("messagesRead", payload);
				// Keep legacy listener behavior intact.
				io.to(senderSocketId).emit("messagesSeen", payload);
			});
		}
		const messages = await messageModel.find({ chatId }).sort({
			createdAt: 1,
		});
		const otherUserId = chat.users.find((id) => id !== userId);
		if (!otherUserId) {
			return res.status(400).json({
				message: "No other user",
			});
		}
		try {
			const { data } = await axios.get(
				`${process.env.USER_SERVICE}/api/v1/user/${otherUserId}`,
			);

			//@todo:socket
			res.json({
				messages,
				user: data,
			});
		} catch (error) {
			console.log(error);
			res.json({
				messages,
				user: { _id: otherUserId, name: "Unknown user" },
			});
		}
	} catch (error: any) {
		console.log("Error in get-messages-by-chat", error);
		return res.status(500).json({
			message: error.message,
		});
	}
};
